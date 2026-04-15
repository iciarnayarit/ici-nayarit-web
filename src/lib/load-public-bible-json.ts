/**
 * Carga JSON bajo `public/bible/<path>` (p. ej. `versions/...`, `huichol/hch_GEN_capitulos_versiculos.json`).
 * Navegador: fetch; Node: lectura de disco. Misma convención que el resto de datos bíblicos en `public/bible/`.
 */
export async function loadPublicBibleJson(pathUnderBible: string): Promise<unknown> {
    if (typeof window === 'undefined') {
        const { loadPublicBibleJsonNode } = await import('@/lib/bible-public-json-node');
        return loadPublicBibleJsonNode(pathUnderBible);
    }
    const { loadPublicBibleJsonBrowser } = await import('@/lib/bible-public-json-browser');
    return loadPublicBibleJsonBrowser(pathUnderBible);
}
