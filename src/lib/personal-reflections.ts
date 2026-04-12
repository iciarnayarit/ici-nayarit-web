export const PERSONAL_REFLECTIONS_STORAGE_KEY = 'dashboardBibliaPersonalReflections';

/** Disparar en `window` tras guardar una reflexión desde el dashboard. */
export const PERSONAL_REFLECTIONS_CHANGED_EVENT = 'iciar-personal-reflections-changed';

export interface StoredPersonalReflection {
  id: string;
  body: string;
  /** Título mostrado en el listado (opcional en entradas antiguas). */
  title?: string;
  verseReference: string | null;
  savedAt: string;
  /** Etiquetas opcionales (p. ej. desde el panel Notas). */
  tags?: string[];
}

export function loadPersonalReflectionsFromStorage(): StoredPersonalReflection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PERSONAL_REFLECTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r): r is StoredPersonalReflection => {
      if (
        r == null ||
        typeof r !== 'object' ||
        typeof (r as StoredPersonalReflection).id !== 'string' ||
        typeof (r as StoredPersonalReflection).body !== 'string' ||
        typeof (r as StoredPersonalReflection).savedAt !== 'string'
      ) {
        return false;
      }
      const rec = r as StoredPersonalReflection;
      if (!(rec.verseReference === null || typeof rec.verseReference === 'string')) return false;
      if (!(rec.title === undefined || typeof rec.title === 'string')) return false;
      if (rec.tags !== undefined) {
        if (!Array.isArray(rec.tags) || !rec.tags.every((t): t is string => typeof t === 'string')) {
          return false;
        }
      }
      return true;
    });
  } catch {
    return [];
  }
}

export function prependPersonalReflection(entry: StoredPersonalReflection): void {
  const list = loadPersonalReflectionsFromStorage();
  list.unshift(entry);
  localStorage.setItem(PERSONAL_REFLECTIONS_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(PERSONAL_REFLECTIONS_CHANGED_EVENT));
}
