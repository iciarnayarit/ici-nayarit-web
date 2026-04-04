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
}

export function loadPersonalReflectionsFromStorage(): StoredPersonalReflection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PERSONAL_REFLECTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is StoredPersonalReflection =>
        r != null &&
        typeof r === 'object' &&
        typeof (r as StoredPersonalReflection).id === 'string' &&
        typeof (r as StoredPersonalReflection).body === 'string' &&
        typeof (r as StoredPersonalReflection).savedAt === 'string' &&
        ((r as StoredPersonalReflection).verseReference === null ||
          typeof (r as StoredPersonalReflection).verseReference === 'string') &&
        ((r as StoredPersonalReflection).title === undefined ||
          typeof (r as StoredPersonalReflection).title === 'string')
    );
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
