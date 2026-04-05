/**
 * Borradores del editor de publicación (Vista previa) en localStorage.
 */

export const STUDIO_PUBLICATION_DRAFTS_STORAGE_KEY = 'iciar-studio-publication-drafts-v1';
/** Formato antiguo: un solo objeto; se migra al abrir la lista. */
export const STUDIO_PUBLICATION_DRAFT_LEGACY_KEY = 'iciar-studio-publication-draft-v1';

export const STUDIO_PUBLICATION_DRAFTS_CHANGED_EVENT = 'iciar-studio-publication-drafts-changed';

const MAX_DRAFTS = 40;
const MAX_JSON_CHARS = 4_500_000;

export type StudioPublicationDraftPayloadV1 = {
  v: 1;
  savedAt: string;
  book: string;
  chapter: number;
  verses: number[];
  versionId: string;
  dragPos: {
    ref: { x: number; y: number };
    verse: { x: number; y: number };
    website: { x: number; y: number };
  };
  // Tipado laxo: el lienzo evoluciona en bible.tsx
  studioOverlays: unknown[];
  elementStyles: Record<string, unknown>;
  studioTheme: Record<string, unknown>;
  studioCanvasTextOverride: Record<string, string | null>;
  studioVerseFrame: { w: number; maxH: number };
  selectedPlatform: string | null;
  studioTab: 'formato' | 'fondo' | 'texto';
  studioGallery: string[];
};

export type StudioPublicationDraftRecord = {
  id: string;
  savedAt: string;
  referenceLabel: string;
  /** Puede faltar en borradores guardados antes de esta versión. */
  versePreview?: string;
  payload: StudioPublicationDraftPayloadV1;
};

function isValidRecord(x: unknown): x is StudioPublicationDraftRecord {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.referenceLabel === 'string' &&
    typeof o.savedAt === 'string' &&
    (o.versePreview == null || typeof o.versePreview === 'string') &&
    o.payload !== null &&
    typeof o.payload === 'object'
  );
}

function formatReferenceFromPayload(p: StudioPublicationDraftPayloadV1): string {
  const s = [...p.verses].sort((a, b) => a - b);
  if (s.length === 0) return `${p.book} ${p.chapter}`;
  if (s.length === 1) return `${p.book} ${p.chapter}:${s[0]}`;
  return `${p.book} ${p.chapter}:${s[0]}-${s[s.length - 1]}`;
}

function tryMigrateLegacy(): StudioPublicationDraftRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STUDIO_PUBLICATION_DRAFT_LEGACY_KEY);
  if (!raw) return [];
  try {
    const p = JSON.parse(raw) as StudioPublicationDraftPayloadV1;
    if (p && p.v === 1 && typeof p.book === 'string' && typeof p.chapter === 'number') {
      const id = crypto.randomUUID();
      const record: StudioPublicationDraftRecord = {
        id,
        savedAt: p.savedAt || new Date().toISOString(),
        referenceLabel: formatReferenceFromPayload(p),
        versePreview: '',
        payload: p,
      };
      localStorage.removeItem(STUDIO_PUBLICATION_DRAFT_LEGACY_KEY);
      return [record];
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function listStudioPublicationDrafts(): StudioPublicationDraftRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STUDIO_PUBLICATION_DRAFTS_STORAGE_KEY);
    let list: StudioPublicationDraftRecord[] = [];
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        list = parsed.filter(isValidRecord);
      }
    }
    if (list.length === 0) {
      const migrated = tryMigrateLegacy();
      if (migrated.length > 0) {
        list = migrated;
        localStorage.setItem(STUDIO_PUBLICATION_DRAFTS_STORAGE_KEY, JSON.stringify(list));
      }
    }
    return [...list].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch {
    return [];
  }
}

export function getStudioPublicationDraftById(id: string): StudioPublicationDraftRecord | null {
  return listStudioPublicationDrafts().find(d => d.id === id) ?? null;
}

function notifyDraftsChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STUDIO_PUBLICATION_DRAFTS_CHANGED_EVENT));
}

export function addStudioPublicationDraft(input: {
  referenceLabel: string;
  versePreview: string;
  payload: StudioPublicationDraftPayloadV1;
}): { ok: true; id: string } | { ok: false; error: string } {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'No disponible en el servidor.' };
  }
  const savedAt = input.payload.savedAt || new Date().toISOString();
  const payload: StudioPublicationDraftPayloadV1 = { ...input.payload, savedAt };
  const record: StudioPublicationDraftRecord = {
    id: crypto.randomUUID(),
    savedAt,
    referenceLabel: input.referenceLabel,
    versePreview: input.versePreview.slice(0, 280),
    payload,
  };

  let list = listStudioPublicationDrafts();
  const next = [record, ...list.filter(d => d.id !== record.id)].slice(0, MAX_DRAFTS);

  try {
    const json = JSON.stringify(next);
    if (json.length > MAX_JSON_CHARS) {
      return {
        ok: false,
        error: 'Los borradores ocupan demasiado espacio. Elimina algunos o reduce imágenes.',
      };
    }
    localStorage.setItem(STUDIO_PUBLICATION_DRAFTS_STORAGE_KEY, json);
    notifyDraftsChanged();
    return { ok: true, id: record.id };
  } catch (e) {
    console.error(e);
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { ok: false, error: 'Espacio de almacenamiento lleno.' };
    }
    return { ok: false, error: 'No se pudo guardar.' };
  }
}

export function removeStudioPublicationDraft(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = listStudioPublicationDrafts().filter(d => d.id !== id);
    localStorage.setItem(STUDIO_PUBLICATION_DRAFTS_STORAGE_KEY, JSON.stringify(list));
    notifyDraftsChanged();
  } catch {
    /* ignore */
  }
}

export function stripStudioDraftSearchParam(searchString: string): string {
  const p = new URLSearchParams(searchString);
  p.delete('studioDraft');
  return p.toString();
}
