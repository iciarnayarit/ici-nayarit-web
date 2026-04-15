/**
 * Rutas públicas de MP3 por capítulo bajo `public/bible/huichol/audio/{AT|NT}/{carpeta}/`.
 * Convención: `hch-{orden}-{USFM}-{capítulo}.mp3` — el capítulo es el sufijo numérico antes de `.mp3` (`01`…`99`; Salmos `001`…`150`).
 * La carpeta suele ser el USFM; excepción: 2 Reyes → carpeta `SKI`, archivo `…-2KI-NN.mp3`.
 */

type HuicholAudioIndexEntry = {
  testament: 'AT' | 'NT';
  order: number;
  /** Carpeta si no coincide con el USFM en mayúsculas */
  directory?: string;
};

const HUICHOL_CHAPTER_AUDIO_INDEX: Record<string, HuicholAudioIndexEntry> = {
  GEN: { testament: 'AT', order: 1 },
  EXO: { testament: 'AT', order: 2 },
  LEV: { testament: 'AT', order: 3 },
  NUM: { testament: 'AT', order: 4 },
  DEU: { testament: 'AT', order: 5 },
  JOS: { testament: 'AT', order: 6 },
  JDG: { testament: 'AT', order: 7 },
  RUT: { testament: 'AT', order: 8 },
  '1SA': { testament: 'AT', order: 9 },
  '2SA': { testament: 'AT', order: 10 },
  '1KI': { testament: 'AT', order: 11 },
  '2KI': { testament: 'AT', order: 12, directory: 'SKI' },
  '1CH': { testament: 'AT', order: 13 },
  '2CH': { testament: 'AT', order: 14 },
  EZR: { testament: 'AT', order: 15 },
  NEH: { testament: 'AT', order: 16 },
  EST: { testament: 'AT', order: 17 },
  JOB: { testament: 'AT', order: 18 },
  PSA: { testament: 'AT', order: 19 },
  PRO: { testament: 'AT', order: 20 },
  ECC: { testament: 'AT', order: 21 },
  SNG: { testament: 'AT', order: 22 },
  ISA: { testament: 'AT', order: 23 },
  JER: { testament: 'AT', order: 24 },
  LAM: { testament: 'AT', order: 25 },
  EZK: { testament: 'AT', order: 26 },
  DAN: { testament: 'AT', order: 27 },
  HOS: { testament: 'AT', order: 28 },
  JOL: { testament: 'AT', order: 29 },
  AMO: { testament: 'AT', order: 30 },
  OBA: { testament: 'AT', order: 31 },
  JON: { testament: 'AT', order: 32 },
  MIC: { testament: 'AT', order: 33 },
  NAM: { testament: 'AT', order: 34 },
  HAB: { testament: 'AT', order: 35 },
  ZEP: { testament: 'AT', order: 36 },
  HAG: { testament: 'AT', order: 37 },
  ZEC: { testament: 'AT', order: 38 },
  MAL: { testament: 'AT', order: 39 },
  MAT: { testament: 'NT', order: 41 },
  MRK: { testament: 'NT', order: 42 },
  LUK: { testament: 'NT', order: 43 },
  JHN: { testament: 'NT', order: 44 },
  ACT: { testament: 'NT', order: 45 },
  ROM: { testament: 'NT', order: 46 },
  '1CO': { testament: 'NT', order: 47 },
  '2CO': { testament: 'NT', order: 48 },
  GAL: { testament: 'NT', order: 49 },
  EPH: { testament: 'NT', order: 50 },
  PHP: { testament: 'NT', order: 51 },
  COL: { testament: 'NT', order: 52 },
  '1TH': { testament: 'NT', order: 53 },
  '2TH': { testament: 'NT', order: 54 },
  '1TI': { testament: 'NT', order: 55 },
  '2TI': { testament: 'NT', order: 56 },
  TIT: { testament: 'NT', order: 57 },
  PHM: { testament: 'NT', order: 58 },
  HEB: { testament: 'NT', order: 59 },
  JAS: { testament: 'NT', order: 60 },
  '1PE': { testament: 'NT', order: 61 },
  '2PE': { testament: 'NT', order: 62 },
  '1JN': { testament: 'NT', order: 63 },
  '2JN': { testament: 'NT', order: 64 },
  '3JN': { testament: 'NT', order: 65 },
  JUD: { testament: 'NT', order: 66 },
  REV: { testament: 'NT', order: 67 },
};

function paddedHuicholChapterSuffix(usfmUpper: string, chapter: number): string | null {
  if (!Number.isFinite(chapter) || chapter < 1 || chapter > 999) return null;
  const n = Math.floor(chapter);
  return usfmUpper === 'PSA' ? String(n).padStart(3, '0') : String(n).padStart(2, '0');
}

/**
 * Solo el nombre del archivo esperado, p. ej. `hch-13-1CH-06.mp3`.
 */
export function expectHuicholChapterMp3Basename(usfm: string, chapter: number): string | null {
  const u = usfm.toUpperCase();
  const entry = HUICHOL_CHAPTER_AUDIO_INDEX[u];
  if (!entry) return null;
  const ch = paddedHuicholChapterSuffix(u, chapter);
  if (!ch) return null;
  const ord = String(entry.order).padStart(2, '0');
  return `hch-${ord}-${u}-${ch}.mp3`;
}

/**
 * Ruta absoluta desde la raíz del sitio (`/bible/...`) para el MP3 del capítulo en Huichol.
 */
export function publicPathForHuicholChapterAudio(usfm: string, chapter: number): string | null {
  const u = usfm.toUpperCase();
  const entry = HUICHOL_CHAPTER_AUDIO_INDEX[u];
  const basename = expectHuicholChapterMp3Basename(usfm, chapter);
  if (!entry || !basename) return null;

  const folder = entry.directory ?? u;
  return `/bible/huichol/audio/${entry.testament}/${folder}/${basename}`;
}

/**
 * Comprueba que una ruta (`/bible/.../hch-…-USFM-NN.mp3`) o URL cargada en el `<audio>` corresponde al libro USFM y capítulo.
 */
export function publicHuicholAudioPathMatchesBookChapter(
  usfm: string,
  chapter: number,
  pathnameOrUrl: string
): boolean {
  const expected = publicPathForHuicholChapterAudio(usfm, chapter);
  if (!expected) return false;
  let path = pathnameOrUrl.trim();
  try {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      path = new URL(path).pathname;
    }
  } catch {
    return false;
  }
  if (path === expected) return true;
  return path.endsWith(expected);
}
