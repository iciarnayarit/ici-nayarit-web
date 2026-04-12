import type { HelloAoCommentary } from '@/lib/helloao-commentaries';

/**
 * Lista de comentarios guardados desde `/comentarios` (tarjetas del catálogo).
 * Clave en localStorage tal como se solicitó para la ruta de comentarios.
 */
export const SAVED_COMMENTARIES_STORAGE_KEY = '/comentarios';

export const SAVED_COMMENTARIES_CHANGED_EVENT = 'iciar-saved-commentaries-changed';

export type SavedCommentaryCard = {
  id: string;
  name: string;
  englishName: string;
  language: string;
  numberOfBooks: number;
  totalNumberOfChapters: number;
  totalNumberOfVerses: number;
  listOfBooksApiLink: string;
  website: string | null;
  savedAt: string;
};

function parseList(): SavedCommentaryCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_COMMENTARIES_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (x): x is SavedCommentaryCard =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as SavedCommentaryCard).id === 'string',
    ) as SavedCommentaryCard[];
  } catch {
    return [];
  }
}

function writeList(list: SavedCommentaryCard[]) {
  try {
    localStorage.setItem(SAVED_COMMENTARIES_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(SAVED_COMMENTARIES_CHANGED_EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getSavedCommentaries(): SavedCommentaryCard[] {
  return parseList();
}

export function isCommentarySaved(id: string): boolean {
  return parseList().some(x => x.id === id);
}

export function saveCommentaryToStorage(c: HelloAoCommentary): void {
  const list = parseList();
  if (list.some(x => x.id === c.id)) return;
  const entry: SavedCommentaryCard = {
    id: c.id,
    name: c.name,
    englishName: c.englishName,
    language: c.language,
    numberOfBooks: c.numberOfBooks,
    totalNumberOfChapters: c.totalNumberOfChapters,
    totalNumberOfVerses: c.totalNumberOfVerses,
    listOfBooksApiLink: c.listOfBooksApiLink,
    website: c.website,
    savedAt: new Date().toISOString(),
  };
  list.push(entry);
  writeList(list);
}

export function removeSavedCommentaryFromStorage(id: string): void {
  writeList(parseList().filter(x => x.id !== id));
}

export function toggleSavedCommentary(c: HelloAoCommentary): boolean {
  if (isCommentarySaved(c.id)) {
    removeSavedCommentaryFromStorage(c.id);
    return false;
  }
  saveCommentaryToStorage(c);
  return true;
}
