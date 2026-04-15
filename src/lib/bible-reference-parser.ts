/**
 * Detecta referencias bíblicas en español (nombres como en /biblia) y construye URLs de lectura.
 */

export const BIBLE_BOOK_NAMES_ES = [
  'Génesis',
  'Éxodo',
  'Levítico',
  'Números',
  'Deuteronomio',
  'Josué',
  'Jueces',
  'Rut',
  '1 Samuel',
  '2 Samuel',
  '1 Reyes',
  '2 Reyes',
  '1 Crónicas',
  '2 Crónicas',
  'Esdras',
  'Nehemías',
  'Ester',
  'Job',
  'Salmos',
  'Proverbios',
  'Eclesiastés',
  'Cantares',
  'Isaías',
  'Jeremías',
  'Lamentaciones',
  'Ezequiel',
  'Daniel',
  'Oseas',
  'Joel',
  'Amós',
  'Abdías',
  'Jonás',
  'Miqueas',
  'Nahúm',
  'Habacuc',
  'Sofonías',
  'Hageo',
  'Zacarías',
  'Malaquías',
  'Mateo',
  'Marcos',
  'Lucas',
  'Juan',
  'Hechos',
  'Romanos',
  '1 Corintios',
  '2 Corintios',
  'Gálatas',
  'Efesios',
  'Filipenses',
  'Colosenses',
  '1 Tesalonicenses',
  '2 Tesalonicenses',
  '1 Timoteo',
  '2 Timoteo',
  'Tito',
  'Filemón',
  'Hebreos',
  'Santiago',
  '1 Pedro',
  '2 Pedro',
  '1 Juan',
  '2 Juan',
  '3 Juan',
  'Judas',
  'Apocalipsis',
] as const;

const BOOK_SET = new Set<string>(BIBLE_BOOK_NAMES_ES);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function bookNameToAlternationToken(name: string): string {
  if (name === 'Salmos') return '(?:Salmos|Salmo)';
  if (name === 'Cantares') return '(?:Cantares|Cantar de los Cantares|Cantar de Cantares)';
  return escapeRegExp(name);
}

/** Normaliza la coincidencia al nombre exacto que espera /biblia en ?book= */
export function canonicalizeBookName(matched: string): string | null {
  const t = matched.trim().normalize('NFC');
  if (!t) return null;
  const lower = t.toLowerCase();
  if (lower === 'salmo' || lower === 'salmos') return 'Salmos';
  if (
    lower === 'cantar de los cantares' ||
    lower === 'cantar de cantares' ||
    lower === 'cantares' ||
    lower === 'canticos' ||
    lower === 'cánticos'
  ) {
    return 'Cantares';
  }
  for (const b of BIBLE_BOOK_NAMES_ES) {
    if (b.normalize('NFC').toLowerCase() === lower) return b;
  }
  return null;
}

function expandVerseRange(start: number, end: number, maxVerses = 40): number[] {
  if (!Number.isFinite(start) || start < 1) return [];
  if (!Number.isFinite(end) || end < start) return [start];
  const span = Math.min(end - start + 1, maxVerses);
  return Array.from({ length: span }, (_, i) => start + i);
}

/** Patrón de nombres de libro (orden largo → corto para que “2 Samuel” gane sobre “Samuel” si aplica). */
function bibleBookNamesPattern(): string {
  const sorted = [...BIBLE_BOOK_NAMES_ES].sort((a, b) => b.length - a.length);
  return sorted.map(bookNameToAlternationToken).join('|');
}

function buildBibleRefRegex(): RegExp {
  const inner = bibleBookNamesPattern();
  // Capítulo:versículo o rango con – o -
  return new RegExp(`(${inner})\\s+(\\d+)\\s*:\\s*(\\d+)(?:\\s*[–\\-]\\s*(\\d+))?`, 'giu');
}

let cachedRe: RegExp | null = null;
function bibleRefRegex(): RegExp {
  if (!cachedRe) cachedRe = buildBibleRefRegex();
  return cachedRe;
}

/** Solo capítulo (o rango de capítulos), sin “:versículo”; enlaza al primer capítulo del rango. */
function buildChapterOnlyRefRegex(): RegExp {
  const inner = bibleBookNamesPattern();
  return new RegExp(`(${inner})\\s+(\\d+)(?:\\s*[–\\-]\\s*(\\d+))?(?!\\s*:)`, 'giu');
}

let cachedChapterOnlyRe: RegExp | null = null;
function bibleChapterOnlyRefRegex(): RegExp {
  if (!cachedChapterOnlyRe) cachedChapterOnlyRe = buildChapterOnlyRefRegex();
  return cachedChapterOnlyRe;
}

export function buildBibliaHref(book: string, chapter: number, verses: number[]): string {
  const p = new URLSearchParams();
  p.set('book', book);
  p.set('chapter', String(chapter));
  if (verses.length > 0) {
    p.set('verse', verses.join(','));
  }
  return `/biblia?${p.toString()}`;
}

export type TextSegment =
  | { type: 'text'; text: string }
  | { type: 'ref'; text: string; href: string; book: string; chapter: number; verses: number[] };

/** Referencias con versículo (p. ej. Juan 3:16 o Salmo 23:1–3). */
function segmentRefsWithVerses(text: string): TextSegment[] {
  const re = bibleRefRegex();
  re.lastIndex = 0;
  const segments: TextSegment[] = [];
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const rawBook = m[1];
    const book = canonicalizeBookName(rawBook);
    const chapter = parseInt(m[2], 10);
    const vStart = parseInt(m[3], 10);
    const vEndRaw = m[4] != null ? parseInt(m[4], 10) : NaN;

    const validBook = Boolean(book && BOOK_SET.has(book));
    const validNums =
      Number.isFinite(chapter) && chapter >= 1 && Number.isFinite(vStart) && vStart >= 1;

    if (!validBook || !validNums || start < cursor) {
      if (start > cursor) {
        segments.push({ type: 'text', text: text.slice(cursor, start) });
      }
      segments.push({ type: 'text', text: m[0] });
      cursor = end;
      continue;
    }

    const verses =
      Number.isFinite(vEndRaw) && vEndRaw >= vStart ? expandVerseRange(vStart, vEndRaw) : [vStart];
    if (start > cursor) {
      segments.push({ type: 'text', text: text.slice(cursor, start) });
    }
    const resolvedBook = book as string;
    const href = buildBibliaHref(resolvedBook, chapter, verses);
    segments.push({ type: 'ref', text: m[0], href, book: resolvedBook, chapter, verses });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ type: 'text', text: text.slice(cursor) });
  }
  return segments.length > 0 ? segments : [{ type: 'text', text }];
}

/** Solo capítulo o rango de capítulos (p. ej. Daniel 7, 1 Reyes 6, Josué 3–4). */
function segmentChapterOnlyRefs(text: string): TextSegment[] {
  const re = bibleChapterOnlyRefRegex();
  re.lastIndex = 0;
  const segments: TextSegment[] = [];
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const rawBook = m[1];
    const book = canonicalizeBookName(rawBook);
    const ch1 = parseInt(m[2], 10);
    const ch2Raw = m[3] != null ? parseInt(m[3], 10) : NaN;

    const validBook = Boolean(book && BOOK_SET.has(book));
    const validChapter = Number.isFinite(ch1) && ch1 >= 1;
    const rangeOk = m[3] == null || (Number.isFinite(ch2Raw) && ch2Raw >= ch1);

    if (!validBook || !validChapter || !rangeOk || start < cursor) {
      if (start > cursor) {
        segments.push({ type: 'text', text: text.slice(cursor, start) });
      }
      segments.push({ type: 'text', text: m[0] });
      cursor = end;
      continue;
    }

    const resolvedBook = book as string;
    const openChapter = ch1;
    if (start > cursor) {
      segments.push({ type: 'text', text: text.slice(cursor, start) });
    }
    const href = buildBibliaHref(resolvedBook, openChapter, []);
    segments.push({
      type: 'ref',
      text: m[0],
      href,
      book: resolvedBook,
      chapter: openChapter,
      verses: [],
    });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ type: 'text', text: text.slice(cursor) });
  }
  return segments.length > 0 ? segments : [{ type: 'text', text }];
}

/** Parte un string en trozos de texto plano y referencias enlazables (sin solapes). */
export function segmentTextWithBibleRefs(text: string): TextSegment[] {
  const withVerses = segmentRefsWithVerses(text);
  return withVerses.flatMap((s) => (s.type === 'ref' ? [s] : segmentChapterOnlyRefs(s.text)));
}
