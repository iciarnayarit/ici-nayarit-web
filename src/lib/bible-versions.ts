import {
    bibleData,
    bookOrder,
    buildSpanishUbsLookupFromRoot,
    type BibleBookData,
    type UbsBibleRoot,
} from '@/lib/bible-data';

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
    | 'ar'
    | 'de'
    | 'el'
    | 'eo'
    | 'fi'
    | 'fi_pr'
    | 'fr'
    | 'ko'
    | 'pt_aa'
    | 'pt_acf'
    | 'pt_nvi'
    | 'ro'
    | 'ru'
    | 'vi'
    | 'zh_cuv'
    | 'zh_ncv'
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
    { id: 'ar', label: 'Árabe (Smith & Van Dyke)', lang: 'AR' },
    { id: 'de', label: 'Alemán (Schlachter)', lang: 'DE' },
    { id: 'el', label: 'Griego (Textus Receptus)', lang: 'EL' },
    { id: 'eo', label: 'Esperanto', lang: 'EO' },
    { id: 'fi', label: 'Finés (1776)', lang: 'FI' },
    { id: 'fi_pr', label: 'Finés (PR)', lang: 'FI' },
    { id: 'fr', label: 'Francés (APEE)', lang: 'FR' },
    { id: 'ko', label: 'Coreano (개역한글)', lang: 'KO' },
    { id: 'pt_aa', label: 'Portugués (Almeida Atual.)', lang: 'PT' },
    { id: 'pt_acf', label: 'Portugués (Almeida Fiel)', lang: 'PT' },
    { id: 'pt_nvi', label: 'Portugués (NVI)', lang: 'PT' },
    { id: 'ro', label: 'Rumano (Cornilescu)', lang: 'RO' },
    { id: 'ru', label: 'Ruso (Sinodal)', lang: 'RU' },
    { id: 'vi', label: 'Vietnamita', lang: 'VI' },
    { id: 'zh_cuv', label: 'Chino (CUV)', lang: 'ZH' },
    { id: 'zh_ncv', label: 'Chino (NCV)', lang: 'ZH' },
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

const UBS_SPANISH_EXTRA_LOADERS: Record<UbsSpanishExtraVersionId, () => Promise<unknown>> = {
    dhh94i: () => import('@/app/lib/bible_dhh/bible_dhh_.json'),
    dhhs94: () => import('@/app/lib/bible_dhhs_94/bible_dhhs.json'),
    lbla: () => import('@/app/lib/bible_lbla/bible_lbla.json'),
    nbla: () => import('@/app/lib/bible_nbla/bible_ nbla.json'),
    ntv: () => import('@/app/lib/bible_ntv/bible_ntv.json'),
    nvi_es: () => import('@/app/lib/bible_nvi_es/bible_nvi.json'),
    nvi_castellano: () => import('@/app/lib/bible_nvi_castellano/bible_nvi_castellano.json'),
    rva2015: () => import('@/app/lib/bible_ rva_2015/bible_rva_2015.json'),
    rvc: () => import('@/app/lib/bible_ rvc/bible_rvc.json'),
    tla: () => import('@/app/lib/bible_tla/bible_tla.json'),
    tlai: () => import('@/app/lib/bible_ tlai/bible_tlai.json'),
};

export async function loadUbsSpanishExtraLookup(
    versionId: UbsSpanishExtraVersionId
): Promise<Record<string, BibleBookData>> {
    const cached = ubsSpanishExtraLookupCache.get(versionId);
    if (cached) return cached;
    const mod = await UBS_SPANISH_EXTRA_LOADERS[versionId]();
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

const SINGLE_FILE_LOADERS: Partial<Record<VersionId, () => Promise<unknown>>> = {
    rvg: () => import('@/app/lib/bible_es_rvg/es-rvg.json'),
    kjv: () => import('@/app/lib/bible_kjv/en_kjv.json'),
    asv: () => import('@/app/lib/bible_eng_asv/eng_asv.json'),
    bbe: () => import('@/app/lib/bible_bbe/en_bbe.json'),
    ar: () => import('@/app/lib/bible_ar_svd/ar_svd.json'),
    de: () => import('@/app/lib/bible_de_schlachter/de_schlachter.json'),
    el: () => import('@/app/lib/bible_el_greek/el_greek.json'),
    eo: () => import('@/app/lib/bible_eo_esperanto/eo_esperanto.json'),
    fi: () => import('@/app/lib/bible_fi_finnish/fi_finnish.json'),
    fi_pr: () => import('@/app/lib/bible_fi_pr/fi_pr.json'),
    fr: () => import('@/app/lib/bible_fr_apee/fr_apee.json'),
    ko: () => import('@/app/lib/bible_ko_ko/ko_ko.json'),
    pt_aa: () => import('@/app/lib/bible_pt_aa/pt_aa.json'),
    pt_acf: () => import('@/app/lib/bible_pt_acf/pt_acf.json'),
    pt_nvi: () => import('@/app/lib/bible_pt_nvi/pt_nvi.json'),
    ro: () => import('@/app/lib/bible_ro_cornilescu/ro_cornilescu.json'),
    ru: () => import('@/app/lib/bible_ru_synodal/ru_synodal.json'),
    vi: () => import('@/app/lib/bible_vi_vietnamese/vi_vietnamese.json'),
    zh_cuv: () => import('@/app/lib/bible_zh_cuv/zh_cuv.json'),
    zh_ncv: () => import('@/app/lib/bible_zh_ncv/zh_ncv.json'),
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
        lookup = bibleData;
    } else if (versionId === 'huichol') {
        lookup = bibleData;
    } else if (isUbsSpanishExtraVersion(versionId)) {
        lookup = await loadUbsSpanishExtraLookup(versionId);
    } else {
        const loader = SINGLE_FILE_LOADERS[versionId];
        if (!loader) {
            lookup = bibleData;
        } else {
            const raw = await loader();
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
