export const SAVED_TEMPLES_STORAGE_KEY = 'iciar-saved-temple-slugs';

/** Templos de la lista pública (`/templos`, `templeLocations`) guardados por `nameKey`. */
export const SAVED_LOCAL_TEMPLE_NAMES_KEY = 'iciar-saved-local-temple-names';

export const SAVED_TEMPLES_CHANGED_EVENT = 'iciar-saved-temples-changed';

function dispatchSavedTemplesChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SAVED_TEMPLES_CHANGED_EVENT));
}

export function loadSavedTempleSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_TEMPLES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === 'string');
  } catch {
    return [];
  }
}

export function persistSavedTempleSlugs(slugs: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_TEMPLES_STORAGE_KEY, JSON.stringify(slugs));
    dispatchSavedTemplesChanged();
  } catch {
    /* ignore */
  }
}

/** Lee el estado actual, alterna el slug y persiste (evita desincronización al hacer clic rápido). */
export function toggleSavedTempleSlug(slug: string): string[] {
  const cur = loadSavedTempleSlugs();
  const next = cur.includes(slug) ? cur.filter(s => s !== slug) : [...cur, slug];
  persistSavedTempleSlugs(next);
  return next;
}

export function loadSavedLocalTempleNames(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_LOCAL_TEMPLE_NAMES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === 'string');
  } catch {
    return [];
  }
}

export function persistSavedLocalTempleNames(names: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_LOCAL_TEMPLE_NAMES_KEY, JSON.stringify(names));
    dispatchSavedTemplesChanged();
  } catch {
    /* ignore */
  }
}

export function toggleSavedLocalTempleName(nameKey: string): string[] {
  const cur = loadSavedLocalTempleNames();
  const next = cur.includes(nameKey) ? cur.filter(n => n !== nameKey) : [...cur, nameKey];
  persistSavedLocalTempleNames(next);
  return next;
}
