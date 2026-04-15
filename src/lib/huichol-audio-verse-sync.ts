/** Curva suave: al inicio del MP3 la locución suele ir más lenta que la proporción lineal por caracteres. */
const PLAYBACK_TIME_SKEW_EXPONENT = 1.28;

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/**
 * Transforma el reloj del reproductor antes de repartirlo entre versículos.
 * Exponente > 1 retrasa el “avance” respecto al tiempo real al principio del capítulo.
 */
export function huicholEffectivePlaybackTime(currentTime: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  const t = Math.min(Math.max(0, currentTime), duration);
  const r = clamp01(t / duration);
  return duration * Math.pow(r, PLAYBACK_TIME_SKEW_EXPONENT);
}

/**
 * Peso por versículo: la voz correlaciona más con número de palabras que con caracteres totales
 * (p. ej. palabras largas en wixárika no implican el mismo alargamiento que en un modelo solo por chars).
 */
function verseSpeechWeights(verseTexts: string[]): number[] {
  return verseTexts.map((raw) => {
    const s = raw.replace(/\s+/g, ' ').trim();
    const chars = Math.max(1, s.length);
    const words = Math.max(1, s.split(/\s+/).filter(Boolean).length);
    const blend = words * 9.5 + Math.sqrt(chars) * 2.4 + 3;
    return Math.max(6, blend);
  });
}

/** Palabras del versículo (separadas por espacios) para resaltado tipo karaoke. */
export function tokenizeVerseWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

/**
 * Estima qué versículo corresponde a un instante del audio cuando no hay timestamps por versículo:
 * reparte la duración del capítulo en proporción a la longitud de texto de cada versículo.
 */
export function verseNumberFromPlaybackProgress(
  verseTexts: string[],
  currentTime: number,
  duration: number
): number {
  const k = huicholKaraokeFromProgress(verseTexts, currentTime, duration);
  return k?.verseNumber ?? 1;
}

export type HuicholKaraokePosition = {
  /** 1-based */
  verseNumber: number;
  /** Índice de palabra dentro del versículo (0-based); palabras 0..wordIndex se muestran en negrita. */
  wordIndex: number;
};

/**
 * Estima versículo y palabra activa repartiendo el tiempo del capítulo.
 * Sin marcas de tiempo en el MP3 sigue siendo aproximado, pero usa pesos por palabras + √caracteres
 * y una curva de tiempo (exponente > 1) para que el inicio del capítulo no se adelante tanto respecto a la voz.
 */
export function huicholKaraokeFromProgress(
  verseTexts: string[],
  currentTime: number,
  duration: number
): HuicholKaraokePosition | null {
  const n = verseTexts.length;
  if (n === 0 || !Number.isFinite(duration) || duration <= 0) return null;

  const tWall = Math.min(Math.max(0, currentTime), duration);
  const t = huicholEffectivePlaybackTime(tWall, duration);
  const weights = verseSpeechWeights(verseTexts);
  const totalW = weights.reduce((a, b) => a + b, 0);
  if (totalW <= 0) return null;

  let cumBefore = 0;
  for (let i = 0; i < n; i++) {
    const w = weights[i];
    const start = (duration * cumBefore) / totalW;
    const end = (duration * (cumBefore + w)) / totalW;
    const last = i === n - 1;
    const inVerse = last ? t >= start && t <= duration + 1e-6 : t >= start && t < end;
    if (!inVerse) {
      cumBefore += w;
      continue;
    }

    const denom = Math.max(1e-9, end - start);
    const tRel = (t - start) / denom;
    const clamped = Math.min(1, Math.max(0, tRel));
    const words = tokenizeVerseWords(verseTexts[i]);
    if (words.length === 0) return { verseNumber: i + 1, wordIndex: 0 };

    const ww = words.map((wd) => Math.max(1.25, Math.sqrt(Math.max(1, wd.length))));
    const tw = ww.reduce((a, b) => a + b, 0);
    const local = clamped * tw;
    let acc = 0;
    for (let j = 0; j < words.length; j++) {
      acc += ww[j];
      if (local < acc) return { verseNumber: i + 1, wordIndex: j };
    }
    return { verseNumber: i + 1, wordIndex: words.length - 1 };
  }

  const words = tokenizeVerseWords(verseTexts[n - 1]);
  return { verseNumber: n, wordIndex: Math.max(0, words.length - 1) };
}
