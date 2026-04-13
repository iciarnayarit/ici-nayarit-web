import type { BibleBookData } from '@/lib/bible-data';

/** Sustituto en bundle cliente; no debe llamarse (el cliente usa `bible-rvr-browser`). */
export async function getRvrBibleLookupNode(): Promise<Record<string, BibleBookData>> {
    throw new Error('getRvrBibleLookupNode no está disponible en el cliente');
}
