/** Lista de títulos de avisos guardados (misma clave que `/avisos` y `/avisos/[slug]`). */
export const SAVED_ANNOUNCEMENTS_STORAGE_KEY = 'savedAnnouncements';

export const SAVED_ANNOUNCEMENTS_CHANGED_EVENT = 'iciar-saved-announcements-changed';

export function loadSavedAnnouncementTitles(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_ANNOUNCEMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === 'string');
  } catch {
    return [];
  }
}

export function persistSavedAnnouncementTitles(titles: string[]): void {
  localStorage.setItem(SAVED_ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(titles));
  window.dispatchEvent(new Event(SAVED_ANNOUNCEMENTS_CHANGED_EVENT));
}

/** Clases Tailwind para la pastilla de categoría (alineado con `/avisos`). */
export function announcementCategoryPillClass(category: string): string {
  switch (category.toLowerCase()) {
    case 'destacado':
      return 'bg-[#B88A44] text-white';
    case 'comunidad':
      return 'bg-indigo-600 text-white';
    case 'evento':
      return 'bg-purple-600 text-white';
    case 'misiones':
      return 'bg-emerald-600 text-white';
    case 'aviso':
      return 'bg-amber-600 text-white';
    case 'celebración':
      return 'bg-rose-600 text-white';
    default:
      return 'bg-slate-500 text-white';
  }
}
