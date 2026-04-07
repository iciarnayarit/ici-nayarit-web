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
  'ASISTENCIA',
  'AYUDA PASTORAL',
  'COMISIÓN DE EVANGELISMO Y DISCIPULADO',
  'COMISIÓN DE LA FAMILIA PASTORAL',
  'CONSTRUCCIÓN',
  'Comisión General de Evangelismo',
  'EDAD DE ORO',
  'FRATERNIDAD DE JÓVENES',
  'MINISTERIO DE ALABANZA',
  'MINISTERIO DE NIÑOS',
  'ESCUELA DOMINICAL',
  'INTERCESIÓN',
  'JÓVENES',
  'MUJERES',
  'HOMBRES',
];

export type MemberStaffRole =
  | 'sin_especificar'
  | 'nuevo'
  | 'pastor'
  | 'congregante'
  | 'presidente'
  | 'directiva';

export const MEMBER_STAFF_ROLE_OPTIONS: { value: MemberStaffRole; label: string }[] = [
  { value: 'sin_especificar', label: 'Sin especificar' },
  { value: 'nuevo', label: 'Pastor' },
  { value: 'congregante', label: 'Congregante' },
  { value: 'presidente', label: 'Presidente' },
  { value: 'directiva', label: 'Directiva' },
];
