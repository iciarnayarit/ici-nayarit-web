type RvrItem = {
    type: string;
    verse_numbers?: number[];
    lines?: string[];
};

function isSelahLabel(text: string): boolean {
    return text.trim().toLowerCase() === 'selah';
}

type RvrChapter = {
    is_chapter: boolean;
    items: RvrItem[];
};

export type UbsBibleBook = {
    name: string;
    chapters: RvrChapter[];
};

/** Raíz JSON United Bible Societies (misma forma que `public/bible/es_rvr_1960.json`). */
export type UbsBibleRoot = { books: UbsBibleBook[] };

export interface BibleBookData {
    chapters: string[][];
    /** Título de sección (p. ej. encabezado UBS) por versículo; mismo índice que `chapters[c][v]`. */
    sectionTitlesByVerse: string[][];
}

function linesToText(lines: string[] | undefined): string {
    return (lines ?? []).join(' ').trim();
}

/**
 * Encabezados UBS: `section1` (p. ej. LIBRO I), `heading1` (título de sección/párrafo),
 * `label` antes del primer versículo del bloque (p. ej. título largo de un salmo).
 * Se omiten `label` que solo dicen «Selah» (marcador poético entre versículos).
 */
function parseCanonicalChapter(items: RvrItem[]): { verses: string[]; sectionTitles: string[] } {
    let sec1 = '';
    let h1 = '';
    const pendingLabels: string[] = [];
    /** Hay al menos un versículo desde el último section1/heading1 que reinició el bloque. */
    let startedVersesInBlock = false;

    const blockTitle = (): string => {
        const parts = [sec1, h1, ...pendingLabels].map((s) => s.trim()).filter(Boolean);
        return parts.join('\n\n');
    };

    const verseText = new Map<number, string>();
    const verseSection = new Map<number, string>();

    for (const item of items) {
        if (item.type === 'section1' && item.lines?.length) {
            sec1 = linesToText(item.lines);
            h1 = '';
            pendingLabels.length = 0;
            startedVersesInBlock = false;
            continue;
        }
        if (item.type === 'heading1' && item.lines?.length) {
            h1 = linesToText(item.lines);
            pendingLabels.length = 0;
            startedVersesInBlock = false;
            continue;
        }
        if (item.type === 'label' && item.lines?.length) {
            const t = linesToText(item.lines);
            if (isSelahLabel(t)) continue;
            if (!startedVersesInBlock) pendingLabels.push(t);
            continue;
        }
        if (item.type !== 'verse' || !item.verse_numbers?.length) continue;
        const text = linesToText(item.lines);
        const titleForVerses = blockTitle();
        for (const vn of item.verse_numbers) {
            const prev = verseText.get(vn) ?? '';
            verseText.set(vn, prev ? `${prev} ${text}`.trim() : text);
            if (!verseSection.has(vn)) verseSection.set(vn, titleForVerses);
        }
        startedVersesInBlock = true;
    }

    const nums = [...verseText.keys()].sort((a, b) => a - b);
    if (nums.length === 0) return { verses: [], sectionTitles: [] };
    const max = nums[nums.length - 1]!;
    const verses: string[] = [];
    const sectionTitles: string[] = [];
    for (let v = 1; v <= max; v++) {
        verses.push(verseText.get(v) ?? '');
        sectionTitles.push(verseSection.get(v) ?? '');
    }
    return { verses, sectionTitles };
}

/** Solo claves `name.toLowerCase()` del JSON, sin alias UI. */
export function buildBibleDataFromUbsRoot(root: UbsBibleRoot): Record<string, BibleBookData> {
    const out: Record<string, BibleBookData> = {};
    for (const book of root.books) {
        const key = book.name.toLowerCase();
        const chapters: string[][] = [];
        const sectionTitlesByVerse: string[][] = [];
        for (const ch of book.chapters) {
            if (!ch.is_chapter) continue;
            const { verses, sectionTitles } = parseCanonicalChapter(ch.items ?? []);
            chapters.push(verses);
            sectionTitles.push(sectionTitles);
        }
        out[key] = { chapters, sectionTitlesByVerse };
    }
    return out;
}

/** Claves que usan la UI y los planes frente a los nombres UBS (`S. Mateo`, `Cantares`, etc.). */
export const SPANISH_UBS_BOOK_ALIASES: Record<string, string> = {
    mateo: 's. mateo',
    marcos: 's. marcos',
    lucas: 's. lucas',
    juan: 's. juan',
    'cantar de los cantares': 'cantares',
};

/** Lookup listo para el lector: incluye alias españoles habituales. */
export function buildSpanishUbsLookupFromRoot(root: UbsBibleRoot): Record<string, BibleBookData> {
    const base = buildBibleDataFromUbsRoot(root);
    const out: Record<string, BibleBookData> = { ...base };
    for (const [alias, target] of Object.entries(SPANISH_UBS_BOOK_ALIASES)) {
        const src = base[target];
        if (src) out[alias] = src;
    }
    return out;
}

export interface PassageVerse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
    /** Encabezado de sección inmediatamente anterior a este versículo en el texto fuente. */
    sectionTitle?: string;
}

function versePayload(
    bookKey: string,
    chapter: number,
    verse: number,
    text: string,
    book: BibleBookData
): PassageVerse {
    const st = book.sectionTitlesByVerse[chapter - 1]?.[verse - 1]?.trim();
    return st ? { book: bookKey, chapter, verse, text, sectionTitle: st } : { book: bookKey, chapter, verse, text };
}

export const handleReadPassage = (
    reading: string,
    lookup: Record<string, BibleBookData>
): PassageVerse[] => {
    const allVerses: PassageVerse[] = [];
    let currentBookKey = '';

    const references = reading.split(';').map((r) => r.trim());

    for (const ref of references) {
        let passage = ref;
        const bookMatch = ref.match(/^(\d?\s?[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*)\s/);

        if (bookMatch?.[1]) {
            const bookName = bookMatch[1].trim().toLowerCase();
            if (lookup[bookName]) {
                currentBookKey = bookName;
                passage = ref.substring(bookMatch[0].length).trim();
            }
        }

        if (!currentBookKey) continue;

        const book = lookup[currentBookKey]!;
        const passageParts = passage.split(',').map((p) => p.trim());

        for (const part of passageParts) {
            let match: RegExpMatchArray | null;

            match = part.match(/^(\d+):(\d+)-(\d+)$/);
            if (match) {
                const chapter = parseInt(match[1]!, 10);
                const startVerse = parseInt(match[2]!, 10);
                const endVerse = parseInt(match[3]!, 10);
                const verses = book.chapters[chapter - 1] || [];
                for (let i = startVerse; i <= endVerse; i++) {
                    const t = verses[i - 1];
                    if (t) allVerses.push(versePayload(currentBookKey, chapter, i, t, book));
                }
                continue;
            }

            match = part.match(/^(\d+):(\d+)$/);
            if (match) {
                const chapter = parseInt(match[1]!, 10);
                const verse = parseInt(match[2]!, 10);
                const verses = book.chapters[chapter - 1] || [];
                const t = verses[verse - 1];
                if (t) allVerses.push(versePayload(currentBookKey, chapter, verse, t, book));
                continue;
            }

            match = part.match(/^(\d+)-(\d+)$/);
            if (match) {
                const startChapter = parseInt(match[1]!, 10);
                const endChapter = parseInt(match[2]!, 10);
                for (let c = startChapter; c <= endChapter; c++) {
                    const verses = book.chapters[c - 1] || [];
                    verses.forEach((text: string, i: number) => {
                        if (text) allVerses.push(versePayload(currentBookKey, c, i + 1, text, book));
                    });
                }
                continue;
            }

            match = part.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
            if (match) {
                const startChapter = parseInt(match[1]!, 10);
                const startVerse = parseInt(match[2]!, 10);
                const endChapter = parseInt(match[3]!, 10);
                const endVerse = parseInt(match[4]!, 10);

                for (let c = startChapter; c <= endChapter; c++) {
                    const verses = book.chapters[c - 1] || [];
                    const sV = c === startChapter ? startVerse : 1;
                    const eV = c === endChapter ? endVerse : verses.length;
                    for (let i = sV; i <= eV; i++) {
                        const t = verses[i - 1];
                        if (t) allVerses.push(versePayload(currentBookKey, c, i, t, book));
                    }
                }
                continue;
            }

            match = part.match(/^(\d+)$/);
            if (match) {
                const chapter = parseInt(match[1]!, 10);
                const verses = book.chapters[chapter - 1] || [];
                verses.forEach((text: string, i: number) => {
                    if (text) allVerses.push(versePayload(currentBookKey, chapter, i + 1, text, book));
                });
            }
        }
    }
    return allVerses;
};

export const bookOrder = [
    'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios', 'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías',
    'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito', 'Filemón', 'Hebreos', 'Santiago', '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis',
] as const;

/** Capítulos por libro (RVR/UBS); evita cargar el JSON completo en tiempo de importación. */
const CHAPTER_COUNTS_BY_BOOK_INDEX: readonly number[] = [
    50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4,
    28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22,
];

export const chaptersInBook = (bookName: string) => {
    if (!bookName) return 0;
    const idx = bookOrder.findIndex((b) => b.toLowerCase() === bookName.trim().toLowerCase());
    if (idx < 0) return 0;
    return CHAPTER_COUNTS_BY_BOOK_INDEX[idx] ?? 0;
};
