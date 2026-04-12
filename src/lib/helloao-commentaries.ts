/** Catálogo público [Free Use Bible API / HelloAO](https://bible.helloao.org/api/available_commentaries.json). */

export const HELLOAO_COMMENTARIES_JSON =
  'https://bible.helloao.org/api/available_commentaries.json' as const;

/** Nombre corto del autor / obra para UI (quita sufijos repetidos). */
export function commentaryAuthorShortName(fullName: string): string {
  return fullName
    .replace(/\s*Bible Commentary\s*$/i, '')
    .replace(/\s*Commentary\s*$/i, '')
    .replace(/\s*Open Study Notes\s*$/i, '')
    .trim();
}

export type HelloAoCommentary = {
  id: string;
  name: string;
  website: string | null;
  licenseUrl: string | null;
  licenseNotes: string | null;
  englishName: string;
  language: string;
  languageName?: string;
  numberOfBooks: number;
  totalNumberOfChapters: number;
  totalNumberOfVerses: number;
  listOfBooksApiLink: string;
};

export type CommentaryCatalogResponse = {
  commentaries: HelloAoCommentary[];
};

export async function fetchAvailableCommentaries(): Promise<HelloAoCommentary[]> {
  try {
    const res = await fetch(HELLOAO_COMMENTARIES_JSON, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as CommentaryCatalogResponse;
    return Array.isArray(data.commentaries) ? data.commentaries : [];
  } catch {
    return [];
  }
}

export function helloAoBooksUrl(listOfBooksApiLink: string): string {
  if (listOfBooksApiLink.startsWith('http')) return listOfBooksApiLink;
  return `https://bible.helloao.org${listOfBooksApiLink.startsWith('/') ? '' : '/'}${listOfBooksApiLink}`;
}

/** Identificadores USFM del Nuevo Testamento (HelloAO). */
const NEW_TESTAMENT_BOOK_IDS = new Set([
  'MAT',
  'MRK',
  'LUK',
  'JHN',
  'ACT',
  'ROM',
  '1CO',
  '2CO',
  'GAL',
  'EPH',
  'PHP',
  'COL',
  '1TH',
  '2TH',
  '1TI',
  '2TI',
  'TIT',
  'PHM',
  'HEB',
  'JAS',
  '1PE',
  '2PE',
  '1JN',
  '2JN',
  '3JN',
  'JUD',
  'REV',
]);

export function isNewTestamentBookId(bookId: string): boolean {
  return NEW_TESTAMENT_BOOK_IDS.has(bookId.toUpperCase());
}

export type HelloAoBookEntry = {
  id: string;
  commentaryId: string;
  name: string;
  commonName: string;
  introduction?: string;
  order: number;
  numberOfChapters: number;
  totalNumberOfVerses: number;
  firstChapterNumber?: number;
  firstChapterApiLink?: string;
  lastChapterNumber?: number;
  lastChapterApiLink?: string;
};

export type HelloAoBooksPayload = {
  commentary: HelloAoCommentary;
  books: HelloAoBookEntry[];
};

export async function fetchCommentaryBooks(commentaryId: string): Promise<HelloAoBooksPayload | null> {
  const url = `https://bible.helloao.org/api/c/${encodeURIComponent(commentaryId)}/books.json`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as HelloAoBooksPayload;
    if (!data?.commentary || !Array.isArray(data.books)) return null;
    return data;
  } catch {
    return null;
  }
}

export type CommentaryBookUiStatus = 'complete' | 'in_progress' | 'not_started';

/** El API no envía estado editorial; se aproxima por densidad de versículos comentados. */
export function commentaryBookUiStatus(b: HelloAoBookEntry): CommentaryBookUiStatus {
  const v = b.totalNumberOfVerses ?? 0;
  if (v <= 0) return 'not_started';
  if (v >= 90) return 'complete';
  return 'in_progress';
}

export type HelloAoChapterVerseBlock = {
  type: string;
  number: number;
  content: string[];
};

export type HelloAoChapterPayload = {
  commentary: HelloAoCommentary;
  book: HelloAoBookEntry & { introduction?: string };
  chapter: {
    number: number;
    introduction?: string;
    content: HelloAoChapterVerseBlock[];
  };
  thisChapterLink?: string;
  nextChapterApiLink?: string | null;
  previousChapterApiLink?: string | null;
  numberOfVerses?: number;
};

/** Convierte `/api/c/.../BOOK/N.json` en ruta interna `/comentarios/...`. */
export function helloAoChapterApiPathToInternal(apiPath: string | null | undefined): string | null {
  if (!apiPath) return null;
  try {
    const path = apiPath.startsWith('http')
      ? new URL(apiPath).pathname
      : apiPath.startsWith('/')
        ? apiPath
        : `/${apiPath}`;
    const m = path.match(/^\/api\/c\/([^/]+)\/([^/]+)\/(\d+)\.json$/);
    if (!m?.[1] || !m[2] || !m[3]) return null;
    return `/comentarios/${m[1]}/${m[2]}/${m[3]}`;
  } catch {
    return null;
  }
}

export async function fetchCommentaryChapterJson(
  commentaryId: string,
  bookUsfm: string,
  chapterNumber: number
): Promise<HelloAoChapterPayload | null> {
  const bookSeg = encodeURIComponent(bookUsfm.toUpperCase());
  const ch = Math.max(1, Math.floor(chapterNumber));
  const url = `https://bible.helloao.org/api/c/${encodeURIComponent(commentaryId)}/${bookSeg}/${ch}.json`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as HelloAoChapterPayload;
    if (!data?.commentary || !data?.book || !data?.chapter?.content) return null;
    return data;
  } catch {
    return null;
  }
}
