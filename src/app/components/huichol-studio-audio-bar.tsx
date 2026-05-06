'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FastForward,
  Pause,
  Play,
  Rewind,
  Share2,
  Volume2,
} from 'lucide-react';
import { spanishUiBookNameToUsfm } from '@/lib/bible-ui-book-to-usfm';
import {
  publicHuicholAudioPathMatchesBookChapter,
  publicPathForHuicholChapterAudio,
} from '@/lib/huichol-chapter-audio-url';
import { useToast } from '@/app/hooks/use-toast';

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;

export type HuicholPlaybackProgressInfo = {
  currentTime: number;
  duration: number;
  playing: boolean;
};

export type HuicholStudioAudioBarProps = {
  /** `reader`: barra ancha bajo los selectores. `studio`: columna junto al lienzo (por defecto). */
  layout?: 'studio' | 'reader';
  bookTitleDisplay: string;
  bookNameEs: string;
  chapter: number;
  totalChapters: number;
  canPrevChapter: boolean;
  canNextChapter: boolean;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  /** Progreso del audio (p. ej. para resaltar el versículo en la lectura). */
  onPlaybackProgress?: (info: HuicholPlaybackProgressInfo) => void;
};

export function HuicholStudioAudioBar({
  layout = 'studio',
  bookTitleDisplay,
  bookNameEs,
  chapter,
  totalChapters,
  canPrevChapter,
  canNextChapter,
  onPrevChapter,
  onNextChapter,
  onPlaybackProgress,
}: HuicholStudioAudioBarProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onPlaybackProgressRef = useRef(onPlaybackProgress);
  useEffect(() => {
    onPlaybackProgressRef.current = onPlaybackProgress;
  }, [onPlaybackProgress]);

  const emitPlaybackProgress = useCallback(() => {
    const el = audioRef.current;
    const cb = onPlaybackProgressRef.current;
    if (!el || !cb) return;
    const d = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0;
    cb({ currentTime: el.currentTime, duration: d, playing: !el.paused });
  }, []);
  const [src, setSrc] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [rateIdx, setRateIdx] = useState(0);
  const { toast } = useToast();

  const usfm = spanishUiBookNameToUsfm(bookNameEs);
  const rate = PLAYBACK_RATES[rateIdx] ?? 1;

  useEffect(() => {
    setLoadError(null);
    if (!usfm) {
      setSrc(null);
      setLoading(false);
      setLoadError('Libro no reconocido para audio.');
      return;
    }
    if (totalChapters >= 1 && (chapter < 1 || chapter > totalChapters)) {
      setSrc(null);
      setLoading(false);
      setLoadError('Capítulo fuera de rango para este libro.');
      return;
    }
    const url = publicPathForHuicholChapterAudio(usfm, chapter);
    if (!url) {
      setSrc(null);
      setLoading(false);
      setLoadError('No hay audio local para este libro o capítulo.');
      return;
    }
    setSrc(url);
    setLoading(true);
  }, [usfm, chapter, totalChapters]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    if (src) {
      el.src = src;
      el.playbackRate = rate;
      el.load();
    } else {
      el.removeAttribute('src');
    }
  }, [src]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      setCurrent(el.currentTime);
      emitPlaybackProgress();
    };
    const onMeta = () => {
      const resolved = el.currentSrc || el.src || '';
      if (
        usfm &&
        src &&
        resolved &&
        !publicHuicholAudioPathMatchesBookChapter(usfm, chapter, resolved)
      ) {
        setLoading(false);
        setLoadError('El audio cargado no coincide con el libro o capítulo (revisa el nombre del MP3).');
        el.pause();
        emitPlaybackProgress();
        return;
      }
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
      setLoading(false);
      setLoadError(null);
      emitPlaybackProgress();
    };
    const onErr = () => {
      setLoading(false);
      setLoadError('No se pudo cargar el audio de este capítulo.');
    };
    const onEnded = () => {
      setPlaying(false);
      emitPlaybackProgress();
    };
    const onPlay = () => {
      setPlaying(true);
      emitPlaybackProgress();
    };
    const onPause = () => {
      setPlaying(false);
      emitPlaybackProgress();
    };
    const onSeeked = () => {
      setCurrent(el.currentTime);
      emitPlaybackProgress();
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('error', onErr);
    el.addEventListener('ended', onEnded);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('seeked', onSeeked);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('error', onErr);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('seeked', onSeeked);
    };
  }, [src, emitPlaybackProgress, usfm, chapter]);

  /** `timeupdate` a veces va muy espaciado; mientras suena, muestreo periódico para el resaltado de versículos. */
  useEffect(() => {
    if (!playing) return;
    const el = audioRef.current;
    if (!el) return;
    const id = window.setInterval(() => {
      setCurrent(el.currentTime);
      emitPlaybackProgress();
    }, 120);
    return () => clearInterval(id);
  }, [playing, emitPlaybackProgress]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el || !src) return;
    if (playing) {
      el.pause();
      return;
    }
    void el.play().catch(() => {
      toast({ title: 'No se pudo reproducir', description: 'Comprueba la conexión o el permiso de audio.', variant: 'destructive' });
    });
  }, [playing, src, toast]);

  const seek = (t: number) => {
    const el = audioRef.current;
    if (!el) return;
    const max = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : duration > 0 ? duration : 0;
    if (!Number.isFinite(max) || max <= 0) return;
    el.currentTime = Math.min(Math.max(0, t), max);
    setCurrent(el.currentTime);
    emitPlaybackProgress();
  };

  const skip = (delta: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.min(Math.max(0, el.currentTime + delta), duration || el.duration || 99999);
    setCurrent(el.currentTime);
    emitPlaybackProgress();
  };

  const cycleRate = () => {
    setRateIdx((i) => (i + 1) % PLAYBACK_RATES.length);
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.origin + '/biblia');
    url.search = '';
    url.searchParams.set('book', bookNameEs);
    url.searchParams.set('chapter', String(chapter));
    url.searchParams.set('version', 'huichol');
    const shareUrl = url.toString();
    const title = `Biblia Huichol — ${bookTitleDisplay} ${chapter}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Enlace copiado', description: 'Pégalo donde quieras compartir el capítulo.' });
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Enlace copiado' });
      } catch {
        toast({ title: 'No se pudo compartir', variant: 'destructive' });
      }
    }
  };

  const pct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  const rootClassName =
    layout === 'reader'
      ? 'flex w-full shrink-0 flex-col rounded-2xl border border-gray-200 bg-white px-3 py-4 shadow-sm sm:px-5 sm:py-5'
      : 'flex w-full shrink-0 flex-col border-t border-gray-200 bg-white px-3 py-4 shadow-sm sm:px-4 lg:w-[min(22rem,30vw)] lg:min-w-[17rem] lg:border-l lg:border-t-0 lg:py-5';

  return (
    <div className={rootClassName}>
      <audio ref={audioRef} className="hidden" preload="metadata" playsInline />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
            <Volume2 className="h-3 w-3 shrink-0" aria-hidden />
            Biblia en audio
          </p>
          <h3 className="text-lg font-bold leading-tight text-gray-900 sm:text-xl">
            Escuchar {bookTitleDisplay} {chapter}
          </h3>
          {totalChapters > 0 && (
            <p className="mt-0.5 text-[11px] text-gray-400">
              Capítulo {chapter} de {totalChapters}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-md transition-colors hover:bg-red-600 active:scale-[0.98]"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          Compartir
        </button>
      </div>

      {loading && <p className="mb-2 text-sm text-gray-500">Cargando audio…</p>}
      {loadError && !loading && (
        <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{loadError}</p>
      )}

      <div className={`space-y-2 ${!src || loadError ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="relative pt-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={duration ? current : 0}
            disabled={!src || !duration}
            onChange={(e) => seek(Number.parseFloat(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-gray-800 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
            style={{
              background: `linear-gradient(to right, #1f2937 0%, #1f2937 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
            }}
            aria-label="Progreso de reproducción"
          />
        </div>
        <div className="flex items-center justify-between text-xs font-medium tabular-nums text-gray-500">
          <span>{formatTime(current)}</span>
          <button
            type="button"
            onClick={cycleRate}
            disabled={!src}
            className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-bold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-40"
          >
            {rate}x
          </button>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onPrevChapter}
          disabled={!canPrevChapter}
          className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30"
          aria-label="Capítulo anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => skip(-30)}
          disabled={!src}
          className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
          aria-label="Retroceder 30 segundos"
        >
          <Rewind className="h-4 w-4" />
          <span className="text-[8px] font-black leading-none">30</span>
        </button>
        <button
          type="button"
          onClick={togglePlay}
          disabled={!src}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg ring-2 ring-blue-400/80 ring-offset-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          {playing ? <Pause className="h-7 w-7" fill="currentColor" /> : <Play className="h-7 w-7 ml-0.5" fill="currentColor" />}
        </button>
        <button
          type="button"
          onClick={() => skip(30)}
          disabled={!src}
          className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
          aria-label="Avanzar 30 segundos"
        >
          <FastForward className="h-4 w-4" />
          <span className="text-[8px] font-black leading-none">30</span>
        </button>
        <button
          type="button"
          onClick={onNextChapter}
          disabled={!canNextChapter}
          className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30"
          aria-label="Capítulo siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4 text-center">
        <p className="text-xs font-semibold text-gray-700 underline decoration-gray-300 underline-offset-2">
          Huichol (Wixárika) — audio
        </p>
        <p className="mx-auto mt-2 max-w-[20rem] text-[10px] leading-relaxed text-gray-500">
          Audio por capítulo desde los archivos de la Biblia Huichol (Wixárika) en este sitio.
        </p>
      </div>
    </div>
  );
}
