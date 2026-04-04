export const SAVED_VERSES_STORAGE_KEY = 'savedVerses';

/** Disparar en `window` tras cambiar guardados en la misma pestaña (p. ej. desde el dashboard). */
export const SAVED_VERSES_CHANGED_EVENT = 'iciar-saved-verses-changed';

/**
 * Ruta interna a la que volver tras guardar un versículo desde `/biblia` (p. ej. `/dashboard/biblia`).
 * Se escribe al hacer clic en «Guardar un nuevo versículo» y la consume el componente Biblia al montar.
 */
export const PENDING_RETURN_AFTER_VERSE_SAVE_KEY = 'iciar-pending-return-after-verse-save';

export function stashPendingReturnAfterVerseSave(path: string): void {
  if (typeof window === 'undefined') return;
  if (!path.startsWith('/') || path.startsWith('//')) return;
  try {
    sessionStorage.setItem(PENDING_RETURN_AFTER_VERSE_SAVE_KEY, path);
  } catch {
    /* ignore */
  }
}

/** Lee y borra la ruta pendiente. Solo rutas relativas internas. */
export function takePendingReturnAfterVerseSave(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const path = sessionStorage.getItem(PENDING_RETURN_AFTER_VERSE_SAVE_KEY);
    sessionStorage.removeItem(PENDING_RETURN_AFTER_VERSE_SAVE_KEY);
    if (!path || !path.startsWith('/') || path.startsWith('//')) return null;
    return path;
  } catch {
    return null;
  }
}

export type SavedVerseSource = 'biblia' | 'plan';

/** Versículo guardado desde la Biblia o desde un plan de lectura (localStorage). */
export interface StoredSavedVerse {
  text: string;
  reference: string;
  source?: SavedVerseSource;
  planSlug?: string;
  planTitle?: string;
}

export function parseReferenceParts(reference: string): { book: string; chapter: string } | null {
  const colon = reference.lastIndexOf(':');
  if (colon <= 0) return null;
  const before = reference.slice(0, colon).trim();
  const lastSpace = before.lastIndexOf(' ');
  if (lastSpace === -1) return null;
  return {
    book: before.slice(0, lastSpace).trim(),
    chapter: before.slice(lastSpace + 1).trim(),
  };
}

export function parseBookFromReference(reference: string): string {
  return parseReferenceParts(reference)?.book ?? 'Otros';
}

export function loadSavedVersesFromStorage(): StoredSavedVerse[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_VERSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is StoredSavedVerse =>
        v != null &&
        typeof v === 'object' &&
        typeof (v as StoredSavedVerse).text === 'string' &&
        typeof (v as StoredSavedVerse).reference === 'string'
    );
  } catch {
    return [];
  }
}
