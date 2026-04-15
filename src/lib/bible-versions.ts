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
    | 'ar_svd'
    | 'de_schlachter'
    | 'eo_esperanto'
    | 'es_rvr'
    | 'fi_finnish'
    | 'fi_pr'
    | 'fr_apee'
    | 'ko_ko'
    | 'pt_aa'
    | 'pt_acf'
    | 'pt_nvi'
    | 'ro_cornilescu'
    | 'ru_synodal'
    | 'vi_vietnamese'
    | 'zh_cuv'
    | 'zh_ncv'
    | 'huichol'
    | 'cora_el_nayar'
    | 'cora_santa_teresa'
    | 'tepehuan_durango';

export const DEFAULT_BIBLE_VERSION_ID: VersionId = 'rvr';

export const VERSIONS: { id: VersionId; label: string; lang: string }[] = [
    { id: 'rvr', label: 'Reina-Valera 1960', lang: 'ES' },
    { id: 'huichol', label: 'Huichol (Wixárika)', lang: 'HCH' },
    { id: 'cora_el_nayar', label: 'Cora, El Nayar', lang: 'CRN' },
    { id: 'cora_santa_teresa', label: 'Cora, Santa Teresa', lang: 'COK' },
    { id: 'tepehuan_durango', label: 'Tepehuan de Durango', lang: 'STP' },
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
    { id: 'es_rvr', label: 'Reina Valera (archivo JSON)', lang: 'ES' },
    { id: 'pt_aa', label: 'Almeida Atualizada', lang: 'PT' },
    { id: 'pt_acf', label: 'Almeida Corrigida Fiel', lang: 'PT' },
    { id: 'pt_nvi', label: 'Nova Versão Internacional (PT)', lang: 'PT' },
    { id: 'fr_apee', label: 'Bible Segond 21 / APEE', lang: 'FR' },
    { id: 'de_schlachter', label: 'Schlachter (alemán)', lang: 'DE' },
    { id: 'ar_svd', label: 'Smith & Van Dyke (árabe)', lang: 'AR' },
    { id: 'ru_synodal', label: 'Sinodal (ruso)', lang: 'RU' },
    { id: 'zh_cuv', label: 'Union Version (chino)', lang: 'ZH' },
    { id: 'zh_ncv', label: 'New Chinese Version', lang: 'ZH' },
    { id: 'ko_ko', label: 'Korean Bible', lang: 'KO' },
    { id: 'vi_vietnamese', label: 'Vietnamese Bible', lang: 'VI' },
    { id: 'ro_cornilescu', label: 'Cornilescu (rumano)', lang: 'RO' },
    { id: 'fi_finnish', label: 'Finnish Bible', lang: 'FI' },
    { id: 'fi_pr', label: 'Pyhä Raamattu (finés)', lang: 'FI' },
    { id: 'eo_esperanto', label: 'Esperanto', lang: 'EO' },
];

export const DEFAULT_BIBLE_VERSION_LABEL =
    VERSIONS.find((v) => v.id === DEFAULT_BIBLE_VERSION_ID)?.label ?? 'Reina-Valera 1960';

function slugifyBibleVersionLabel(label: string): string {
    const slug = label
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
    return slug;
}

const BIBLE_VERSION_ID_TO_URL_SLUG: Map<VersionId, string> = new Map();
const BIBLE_VERSION_SLUG_TO_ID: Map<string, VersionId> = new Map();

for (const v of VERSIONS) {
    let slug = slugifyBibleVersionLabel(v.label) || v.id;
    if (BIBLE_VERSION_SLUG_TO_ID.has(slug)) {
        slug = `${slug}-${v.id}`;
    }
    BIBLE_VERSION_ID_TO_URL_SLUG.set(v.id, slug);
    BIBLE_VERSION_SLUG_TO_ID.set(slug, v.id);
}

/** Slug legible para `?biblia=` en la URL (nombre de la versión). */
export function bibleVersionUrlSlug(id: VersionId): string {
    return BIBLE_VERSION_ID_TO_URL_SLUG.get(id) ?? id;
}

export function bibleVersionSlugToId(slug: string): VersionId | null {
    return BIBLE_VERSION_SLUG_TO_ID.get(slug.trim().toLowerCase()) ?? null;
}

/** Versiones disponibles en planes de lectura (Huichol usa otro formato de capítulos). */
export const READING_PLAN_VERSIONS = VERSIONS.filter(
    (v) => !['huichol', 'cora_el_nayar', 'cora_santa_teresa', 'tepehuan_durango'].includes(v.id)
);

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
    ar_svd: 'versions/ar_svd.json',
    de_schlachter: 'versions/de_schlachter.json',
    eo_esperanto: 'versions/eo_esperanto.json',
    es_rvr: 'versions/es_rvr.json',
    fi_finnish: 'versions/fi_finnish.json',
    fi_pr: 'versions/fi_pr.json',
    fr_apee: 'versions/fr_apee.json',
    ko_ko: 'versions/ko_ko.json',
    pt_aa: 'versions/pt_aa.json',
    pt_acf: 'versions/pt_acf.json',
    pt_nvi: 'versions/pt_nvi.json',
    ro_cornilescu: 'versions/ro_cornilescu.json',
    ru_synodal: 'versions/ru_synodal.json',
    vi_vietnamese: 'versions/vi_vietnamese.json',
    zh_cuv: 'versions/zh_cuv.json',
    zh_ncv: 'versions/zh_ncv.json',
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
