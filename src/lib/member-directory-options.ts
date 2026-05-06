/** Partículas que en español suelen ir en minúsculas dentro del nombre (no al inicio). */
const MINISTRY_TITLE_LOWER_WORDS = new Set([
  'a',
  'de',
  'del',
  'e',
  'en',
  'la',
  'las',
  'los',
  'o',
  'u',
  'y',
]);

/** Título legible para etiquetas de ministerio (p. ej. en casillas cargadas desde la colección `ministries`). */
export function formatMinistryLabelForDisplay(raw: string): string {
  const words = raw.trim().split(/\s+/);
  return words
    .map((word, i) => {
      if (!word) return word;
      const lower = word.toLocaleLowerCase('es');
      if (i > 0 && MINISTRY_TITLE_LOWER_WORDS.has(lower)) {
        return lower;
      }
      return lower.charAt(0).toLocaleUpperCase('es') + lower.slice(1);
    })
    .join(' ');
}

/** Reexport para formularios que usan el valor «sin especificar». */
export { MEMBER_STAFF_ROLE_UNSPECIFIED } from '@/lib/staff-roles-helpers';
