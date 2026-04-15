import { spanishBibleDataKeyToUsfm } from '@/lib/helloao-usfm-to-spanish-key';

/** Nombres de evangelios en la UI vs clave en el mapa USFM→español (`s. mateo`, etc.). */
const UI_BOOK_TO_SPANISH_KEY: Record<string, string> = {
  mateo: 's. mateo',
  marcos: 's. marcos',
  lucas: 's. lucas',
  juan: 's. juan',
};

/**
 * Convierte el nombre del libro tal como en el selector (`Mateo`, `1 Samuel`) a código USFM (`MAT`, `1SA`).
 */
export function spanishUiBookNameToUsfm(bookName: string): string | null {
  const lower = bookName.trim().toLowerCase();
  const key = UI_BOOK_TO_SPANISH_KEY[lower] ?? lower;
  return spanishBibleDataKeyToUsfm(key);
}
