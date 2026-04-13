import { buildSpanishUbsLookupFromRoot, type BibleBookData, type UbsBibleRoot } from '@/lib/bible-data';

let cache: Record<string, BibleBookData> | null = null;
let pending: Promise<Record<string, BibleBookData>> | null = null;

/** RVR1960 en el navegador (sin `fs`). */
export async function getRvrBibleLookupBrowser(): Promise<Record<string, BibleBookData>> {
    if (cache) return cache;
    if (!pending) {
        pending = (async () => {
            const res = await fetch('/bible/es_rvr_1960.json');
            if (!res.ok) {
                throw new Error(`No se pudo cargar la Biblia RVR1960 (${res.status})`);
            }
            const root = (await res.json()) as UbsBibleRoot;
            cache = buildSpanishUbsLookupFromRoot(root);
            return cache;
        })();
    }
    return pending;
}
