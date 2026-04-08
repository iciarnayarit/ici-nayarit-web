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

/**
 * Texto mostrado tipo título (los valores guardados en API/DB siguen siendo los de `MEMBER_MINISTRY_OPTIONS`).
 */
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

/** Opciones de ministerios para asignación de miembros (directorio interno). */
export const MEMBER_MINISTRY_OPTIONS: string[] = [
  'Asistencia',
  'Ayuda Pastoral',
  'Pastor',
  'Encargado de una Secretaría',
  'Encargado de una Comisión',
  'Comisión De Evangelismo Y Discipulado',
  'Comisión De La Familia Pastoral',
  'Construcción',
  'Comisión General De Evangelismo',
  'Edad De Oro',
  'Fraternidad De Jóvenes',
  'Ministerio De Alabanza',
  'Ministerio De Niños',
  'Escuela Dominical',
  'Intercesión',
  'Jóvenes',
  'Mujeres',
  'Hombres',
];

export type MemberStaffRole =
  | 'sin_especificar'
  | 'Nuevo'
  | 'Pastor'
  | 'Congregante'
  | 'Presidente'
  | 'Directiva';

export const MEMBER_STAFF_ROLE_OPTIONS: { value: MemberStaffRole; label: string }[] = [
  { value: 'sin_especificar', label: 'Sin especificar' },
  { value: 'Pastor', label: 'Pastor' },
  { value: 'Congregante', label: 'Congregante' },
  { value: 'Presidente', label: 'Presidente' },
  { value: 'Directiva', label: 'Directiva' },
];
