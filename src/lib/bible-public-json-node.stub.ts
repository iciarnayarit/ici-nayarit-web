/** Sustituto en bundle cliente; no debe ejecutarse. */
export async function loadPublicBibleJsonNode(_pathUnderBible: string): Promise<unknown> {
    throw new Error('loadPublicBibleJsonNode no está disponible en el cliente');
}
