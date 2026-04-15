/**
 * Limpia comillas, signos de puntuación y notas al borde de una palabra para TTS del navegador.
 */
export function stripWordForSpeech(raw: string): string {
    const t = raw.normalize('NFC').trim();
    if (!t) return '';
    return t
        .replace(/^[\s«»"'“”`´,*†‡°·.…:;!?()[\]{}¿¡—–\-]+/u, '')
        .replace(/[\s«»"'“”`´,*†‡°·.…:;!?()[\]{}¿¡—–\-]+$/u, '')
        .trim();
}

/** Detiene cualquier locución en curso (p. ej. al cerrar el diálogo). */
export function cancelHuicholWordSpeech(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
}

/**
 * Reproduce `text` con la API de síntesis de voz del navegador.
 * No hay voces wixárikas estándar: suele aproximar con español de México.
 */
export function speakHuicholPracticeWord(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const plain = stripWordForSpeech(text);
    if (!plain) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(plain);
    u.lang = 'es-MX';
    u.rate = 0.82;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
}
