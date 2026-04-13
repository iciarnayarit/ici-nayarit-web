import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { buildSpanishUbsLookupFromRoot, type BibleBookData, type UbsBibleRoot } from '@/lib/bible-data';

let cache: Record<string, BibleBookData> | null = null;
let pending: Promise<Record<string, BibleBookData>> | null = null;

/** RVR1960 en Node (SSR/build): lee `public/bible/` sin incluir el JSON en el bundle. */
export async function getRvrBibleLookupNode(): Promise<Record<string, BibleBookData>> {
    if (cache) return cache;
    if (!pending) {
        pending = (async () => {
            const filePath = path.join(process.cwd(), 'public', 'bible', 'es_rvr_1960.json');
            const raw = await readFile(filePath, 'utf-8');
            const root = JSON.parse(raw) as UbsBibleRoot;
            cache = buildSpanishUbsLookupFromRoot(root);
            return cache;
        })();
    }
    return pending;
}
