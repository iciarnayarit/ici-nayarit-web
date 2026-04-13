/**
 * Carga JSON bajo `public/bible/<path>` vía fetch (solo navegador).
 * `path` sin barra inicial, p. ej. `versions/bible_dhh_.json`.
 */
export async function loadPublicBibleJsonBrowser(path: string): Promise<unknown> {
    const url = `/bible/${path.replace(/^\/+/, '')}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`No se pudo cargar ${url} (${res.status})`);
    }
    return res.json();
}
