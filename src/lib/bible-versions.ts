import {
    bookOrder,
    buildSpanishUbsLookupFromRoot,
    type BibleBookData,
    type UbsBibleRoot,
} from '@/lib/bible-data';
import { loadPublicBibleJson } from '@/lib/load-public-bible-json';

// ── Bible versions (misma lista que el lector principal) ─────────────────────

export type VersionId =
    | 'rvr'
    | 'rvg'
    | 'dhh94i'
    | 'dhhs94'
    | 'lbla'
    | 'nbla'
    | 'ntv'
    | 'nvi_es'
    | 'nvi_castellano'
    | 'rva2015'
    | 'rvc'
    | 'tla'
    | 'tlai'
    | 'kjv'
    | 'asv'
    | 'bbe'
    | 'el'
    | 'huichol';

export const DEFAULT_BIBLE_VERSION_ID: VersionId = 'rvr';

export const VERSIONS: { id: VersionId; label: string; lang: string }[] = [
    { id: 'rvr', label: 'Reina-Valera 1960', lang: 'ES' },
    { id: 'rvg', label: 'Reina-Valera Gómez', lang: 'ES' },
    { id: 'dhh94i', label: 'Biblia Dios Habla Hoy', lang: 'ES' },
    { id: 'dhhs94', label: 'Dios habla Hoy Estándar', lang: 'ES' },
    { id: 'lbla', label: 'La Biblia de las Américas', lang: 'ES' },
    { id: 'nbla', label: 'Nueva Biblia de las Américas', lang: 'ES' },
    { id: 'ntv', label: 'Nueva Traducción Viviente', lang: 'ES' },
    { id: 'nvi_es', label: 'Nueva Versión Internacional (Español)', lang: 'ES' },
    { id: 'nvi_castellano', label: 'Nueva Versión Internacional (Castellano)', lang: 'ES' },
    { id: 'rva2015', label: 'Reina Valera Actualizada', lang: 'ES' },
    { id: 'rvc', label: 'Reina Valera Contemporánea', lang: 'ES' },
    { id: 'tla', label: 'Traducción en Lenguaje Actual', lang: 'ES' },
    { id: 'tlai', label: 'Traducción en Lenguaje Actual (Interconfesional)', lang: 'ES' },
    { id: 'kjv', label: 'King James Version', lang: 'EN' },
    { id: 'asv', label: 'American Standard', lang: 'EN' },
    { id: 'bbe', label: 'Bible Basic English', lang: 'EN' },
    { id: 'el', label: 'Griego (Textus Receptus)', lang: 'EL' },
    { id: 'huichol', label: 'Huichol (Wixárika)', lang: 'HCH' },
];

export const DEFAULT_BIBLE_VERSION_LABEL =
    VERSIONS.find((v) => v.id === DEFAULT_BIBLE_VERSION_ID)?.label ?? 'Reina-Valera 1960';

/** Versiones disponibles en planes de lectura (Huichol usa otro formato de capítulos). */
export const READING_PLAN_VERSIONS = VERSIONS.filter((v) => v.id !== 'huichol');

export const READING_PLAN_VERSION_STORAGE_KEY = 'iciar-reading-plan-bible-version';

export const BOOK_INDEX: Record<string, number> = Object.fromEntries(bookOrder.map((name, i) => [name, i]));

const UBS_SPANISH_EXTRA_VERSION_IDS = [
    'dhh94i',
    'dhhs94',
    'lbla',
    'nbla',
    'ntv',
    'nvi_es',
    'nvi_castellano',
    'rva2015',
    'rvc',
    'tla',
    'tlai',
] as const;

export type UbsSpanishExtraVersionId = (typeof UBS_SPANISH_EXTRA_VERSION_IDS)[number];

export function isUbsSpanishExtraVersion(id: VersionId): id is UbsSpanishExtraVersionId {
    return (UBS_SPANISH_EXTRA_VERSION_IDS as readonly string[]).includes(id);
}

const ubsSpanishExtraLookupCache = new Map<UbsSpanishExtraVersionId, Record<string, BibleBookData>>();

/** Rutas bajo `public/bible/` (sin `public/`). */
const UBS_EXTRA_JSON_PATH: Record<UbsSpanishExtraVersionId, string> = {
    dhh94i: 'versions/bible_dhh_.json',
    dhhs94: 'versions/bible_dhhs.json',
    lbla: 'versions/bible_lbla.json',
    nbla: 'versions/bible_nbla.json',
    ntv: 'versions/bible_ntv.json',
    nvi_es: 'versions/bible_nvi_es.json',
    nvi_castellano: 'versions/bible_nvi_castellano.json',
    rva2015: 'versions/bible_rva_2015.json',
    rvc: 'versions/bible_rvc.json',
    tla: 'versions/bible_tla.json',
    tlai: 'versions/bible_tlai.json',
};

export async function loadUbsSpanishExtraLookup(
    versionId: UbsSpanishExtraVersionId
): Promise<Record<string, BibleBookData>> {
    const cached = ubsSpanishExtraLookupCache.get(versionId);
    if (cached) return cached;
    const mod = await loadPublicBibleJson(UBS_EXTRA_JSON_PATH[versionId]);
    const root = (mod as { default?: UbsBibleRoot }).default ?? (mod as UbsBibleRoot);
    const lookup = buildSpanishUbsLookupFromRoot(root);
    ubsSpanishExtraLookupCache.set(versionId, lookup);
    return lookup;
}

function emptySectionTitles(chapters: string[][]): string[][] {
    return chapters.map((ch) => ch.map(() => ''));
}

/** Traducciones en un solo archivo indexadas por el mismo orden que `bookOrder` (nombres en UI en español). */
function singleFileArrayToSpanishLookup(
    arr: Array<{ chapters?: string[][] } | null | undefined>
): Record<string, BibleBookData> {
    const out: Record<string, BibleBookData> = {};
    bookOrder.forEach((name, i) => {
        const ch = arr[i]?.chapters;
        if (!ch) return;
        out[name.toLowerCase()] = { chapters: ch, sectionTitlesByVerse: emptySectionTitles(ch) };
    });
    return out;
}

const SINGLE_FILE_JSON_PATH: Partial<Record<VersionId, string>> = {
    rvg: 'versions/es-rvg.json',
    kjv: 'versions/en_kjv.json',
    asv: 'versions/eng_asv.json',
    bbe: 'versions/en_bbe.json',
    el: 'versions/el_greek.json',
};

const fullLookupCache = new Map<VersionId, Record<string, BibleBookData>>();

/**
 * Mapa libro (clave en minúsculas, español) → datos para `handleReadPassage` y lectura por capítulo.
 * Huichol devuelve Reina-Valera 1960 (mismo esquema de referencias en español).
 */
export async function loadFullBibleLookup(versionId: VersionId): Promise<Record<string, BibleBookData>> {
    const hit = fullLookupCache.get(versionId);
    if (hit) return hit;

    let lookup: Record<string, BibleBookData>;

    if (versionId === 'rvr') {
        lookup =
            typeof window === 'undefined'
                ? await (await import('@/lib/bible-rvr-node')).getRvrBibleLookupNode()
                : await (await import('@/lib/bible-rvr-browser')).getRvrBibleLookupBrowser();
    } else if (versionId === 'huichol') {
        lookup =
            typeof window === 'undefined'
                ? await (await import('@/lib/bible-rvr-node')).getRvrBibleLookupNode()
                : await (await import('@/lib/bible-rvr-browser')).getRvrBibleLookupBrowser();
    } else if (isUbsSpanishExtraVersion(versionId)) {
        lookup = await loadUbsSpanishExtraLookup(versionId);
    } else {
        const jsonPath = SINGLE_FILE_JSON_PATH[versionId];
        if (!jsonPath) {
            lookup =
                typeof window === 'undefined'
                    ? await (await import('@/lib/bible-rvr-node')).getRvrBibleLookupNode()
                    : await (await import('@/lib/bible-rvr-browser')).getRvrBibleLookupBrowser();
        } else {
            const raw = await loadPublicBibleJson(jsonPath);
            const arr = (raw as { default?: Array<{ chapters?: string[][] }> }).default ?? raw;
            lookup = singleFileArrayToSpanishLookup(Array.isArray(arr) ? arr : []);
        }
    }

    fullLookupCache.set(versionId, lookup);
    return lookup;
}

export function isValidReadingPlanVersionId(id: string): id is VersionId {
    return READING_PLAN_VERSIONS.some((v) => v.id === id);
}
