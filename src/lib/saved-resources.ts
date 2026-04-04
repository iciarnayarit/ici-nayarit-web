/** Lista de títulos de recursos guardados (misma clave que usa `/recursos` con el marcador). */
export const SAVED_RESOURCES_STORAGE_KEY = 'iciar-saved-resource-titles';

export const SAVED_RESOURCES_CHANGED_EVENT = 'iciar-saved-resources-changed';

export function loadSavedResourceTitles(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_RESOURCES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === 'string');
  } catch {
    return [];
  }
}

export function persistSavedResourceTitles(titles: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_RESOURCES_STORAGE_KEY, JSON.stringify(titles));
    window.dispatchEvent(new Event(SAVED_RESOURCES_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}
