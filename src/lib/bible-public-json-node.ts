import { readFile } from 'node:fs/promises';
import nodePath from 'node:path';

/**
 * Lee JSON bajo `public/bible/<path>` (solo Node / SSR / build).
 */
export async function loadPublicBibleJsonNode(pathUnderBible: string): Promise<unknown> {
    const rel = pathUnderBible.replace(/^\/+/, '');
    const filePath = nodePath.join(process.cwd(), 'public', 'bible', rel);
    return JSON.parse(await readFile(filePath, 'utf-8'));
}
