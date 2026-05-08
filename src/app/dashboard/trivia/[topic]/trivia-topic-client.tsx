'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getEngagementSnapshot } from '@/lib/engagement-points';
import { triviaBasePointsByDifficulty, type TriviaTopic } from '@/lib/trivia-topics';

type Props = {
  topic: TriviaTopic;
};

const QUESTION_TIME_LIMIT_SECONDS = 60;
const TRIVIA_RANKING_CACHE_KEY = 'iciar-trivia-ranking-cache-v3';
const TRIVIA_LIVE_POINTS_KEY = 'iciar-trivia-live-points-v1';
const TRIVIA_COMPLETED_TOPICS_KEY = 'iciar-trivia-completed-topics-v1';

function readCompletedTopicsMap(): Record<string, true> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TRIVIA_COMPLETED_TOPICS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, true>;
  } catch {
    return {};
  }
}

function persistCompletedTopicsMap(next: Record<string, true>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRIVIA_COMPLETED_TOPICS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('iciar-trivia-points-updated'));
  } catch {
    // ignore localStorage issues
  }
}

function markTopicCompleted(topicSlug: string) {
  const map = readCompletedTopicsMap();
  map[topicSlug] = true;
  persistCompletedTopicsMap(map);
}

export default function TriviaTopicClient({ topic }: Props) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [responseSecondsByQuestion, setResponseSecondsByQuestion] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIME_LIMIT_SECONDS);
  const [topicLocked, setTopicLocked] = useState(false);
  const audioUnlockedRef = useRef(false);

  const total = topic.questions.length;
  const basePoints = triviaBasePointsByDifficulty(topic.level);
  const currentQuestion = topic.questions[current];
  const selected = answers[currentQuestion.id];

  const computeScore = (map: Record<string, number>) => topic.questions.reduce((acc, q) => (map[q.id] === q.correctIndex ? acc + 1 : acc), 0);
  const score = useMemo(() => computeScore(answers), [answers, topic.questions]);

  useEffect(() => {
    const localCompleted = readCompletedTopicsMap();
    if (localCompleted[topic.slug]) {
      setTopicLocked(true);
    }
  }, [topic.slug]);

  useEffect(() => {
    if (!authLoaded || !isSignedIn) return;
    let cancelled = false;
    const hydrateCompletion = async () => {
      try {
        const res = await fetch('/api/trivia-ranking', { method: 'GET' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { ok?: boolean; viewer?: { completedTopics?: string[] } | null };
        if (!data.ok || cancelled) return;
        const completedTopics = Array.isArray(data.viewer?.completedTopics) ? data.viewer?.completedTopics : [];
        if (!completedTopics || completedTopics.length === 0) return;
        const localMap = readCompletedTopicsMap();
        for (const slug of completedTopics) localMap[slug] = true;
        persistCompletedTopicsMap(localMap);
        if (localMap[topic.slug]) setTopicLocked(true);
      } catch {
        // keep UX fluid if offline
      }
    };
    void hydrateCompletion();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn, topic.slug]);

  const answer = (optionIdx: number) => {
    if (finished) return;
    audioUnlockedRef.current = true;
    setResponseSecondsByQuestion(prev => {
      if (prev[currentQuestion.id] !== undefined) return prev;
      const elapsed = Math.max(0, Math.min(QUESTION_TIME_LIMIT_SECONDS, QUESTION_TIME_LIMIT_SECONDS - secondsLeft));
      return { ...prev, [currentQuestion.id]: elapsed };
    });
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIdx }));
  };

  const syncFinishedTest = async (finalScore: number, timingMap: Record<string, number>) => {
    if (!authLoaded || !isSignedIn) return;
    const engagement = getEngagementSnapshot();
    const streakDays = (() => {
      const now = new Date();
      let count = 0;
      for (let i = 0; i < 366; i += 1) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const day = d.toISOString().slice(0, 10);
        if ((engagement.dailyActivity[day] ?? 0) > 0) {
          count += 1;
          continue;
        }
        break;
      }
      return count;
    })();
    const levelTitle =
      engagement.totalPoints >= 5000
        ? 'Discípulo de Oro'
        : engagement.totalPoints >= 2500
        ? 'Discípulo de Plata'
        : engagement.totalPoints >= 1000
        ? 'Discípulo de Bronce'
        : 'Discípulo Inicial';

    try {
      const values = Object.values(timingMap).filter(v => Number.isFinite(v));
      const answeredCount = values.length;
      const totalResponseSeconds = values.reduce((acc, v) => acc + v, 0);
      const avgResponseSeconds = answeredCount > 0 ? totalResponseSeconds / answeredCount : QUESTION_TIME_LIMIT_SECONDS;
      const fastestResponseSeconds = answeredCount > 0 ? Math.min(...values) : QUESTION_TIME_LIMIT_SECONDS;
      const res = await fetch('/api/trivia-ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicSlug: topic.slug,
          score: finalScore,
          totalQuestions: total,
          timing: {
            answeredCount,
            totalResponseSeconds,
            avgResponseSeconds,
            fastestResponseSeconds,
          },
          snapshot: {
            levelTitle,
            totalPoints: engagement.totalPoints,
            streakDays,
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        viewerPoints?: number;
        completedThisTopic?: boolean;
        completedTopics?: string[];
      };
      if (res.ok && data.ok && Number.isFinite(Number(data.viewerPoints))) {
        try {
          localStorage.setItem(TRIVIA_LIVE_POINTS_KEY, String(Number(data.viewerPoints)));
          localStorage.removeItem(TRIVIA_RANKING_CACHE_KEY);
          const completedMap = readCompletedTopicsMap();
          if (Array.isArray(data.completedTopics)) {
            for (const slug of data.completedTopics) completedMap[slug] = true;
          }
          if (data.completedThisTopic) {
            completedMap[topic.slug] = true;
            setTopicLocked(true);
          }
          persistCompletedTopicsMap(completedMap);
          window.dispatchEvent(new CustomEvent('iciar-trivia-points-updated'));
        } catch {
          // ignore localStorage issues
        }
      }
    } catch {
      // keep UX fluid if offline
    }
  };

  const goNext = () => {
    if (current >= total - 1) {
      const finalAnswers = { ...answers };
      const finalScore = computeScore(finalAnswers);
      const finalTimingMap = { ...responseSecondsByQuestion };
      if (finalScore >= total) {
        markTopicCompleted(topic.slug);
        setTopicLocked(true);
      }
      void syncFinishedTest(finalScore, finalTimingMap);
      setFinished(true);
      return;
    }
    setCurrent(v => v + 1);
    setSecondsLeft(QUESTION_TIME_LIMIT_SECONDS);
  };

  const next = () => {
    if (selected === undefined) return;
    audioUnlockedRef.current = true;
    setResponseSecondsByQuestion(prev => {
      if (prev[currentQuestion.id] !== undefined) return prev;
      const elapsed = Math.max(0, Math.min(QUESTION_TIME_LIMIT_SECONDS, QUESTION_TIME_LIMIT_SECONDS - secondsLeft));
      return { ...prev, [currentQuestion.id]: elapsed };
    });
    goNext();
  };

  const restart = () => {
    setAnswers({});
    setResponseSecondsByQuestion({});
    setCurrent(0);
    setFinished(false);
    setSecondsLeft(QUESTION_TIME_LIMIT_SECONDS);
  };

  useEffect(() => {
    if (finished) return;
    if (secondsLeft <= 0) return;
    const timerId = window.setTimeout(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timerId);
  }, [finished, secondsLeft, current]);

  useEffect(() => {
    if (finished) return;
    if (secondsLeft > 0) return;
    // Si no respondió antes del límite, se marca implícitamente incorrecta
    // (no se guarda respuesta) y avanza automáticamente.
    goNext();
  }, [secondsLeft, finished]);

  useEffect(() => {
    if (finished) return;
    if (typeof window === 'undefined') return;
    if (!audioUnlockedRef.current) return;

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const audioCtx = new AudioContextCtor();
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume().catch(() => undefined);
    }

    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    const isTimeoutTone = secondsLeft <= 0;
    oscillator.type = 'sine';
    oscillator.frequency.value = isTimeoutTone ? 220 : secondsLeft <= 8 ? 980 : 740;

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(isTimeoutTone ? 0.022 : 0.012, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isTimeoutTone ? 0.18 : 0.08));

    oscillator.start(now);
    oscillator.stop(now + (isTimeoutTone ? 0.2 : 0.1));

    return () => {
      try {
        oscillator.disconnect();
        gain.disconnect();
        void audioCtx.close();
      } catch {
        // ignore audio cleanup errors
      }
    };
  }, [secondsLeft, finished]);

  if (topicLocked && !finished) {
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9C7A2A]">Reto completado</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#162B4D] sm:text-4xl">{topic.title}</h1>
        <p className="mt-3 text-sm text-slate-600">
          Ya completaste este reto con 100%. Está bloqueado para evitar intentos repetidos.
        </p>
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7A8AA6]">Guía de estudio</p>
          <div className="mt-3 space-y-3">
            {topic.questions.map((q, idx) => (
              <article key={q.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-[#1A3158]">
                  {idx + 1}. {q.prompt}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-[#9C7A2A]">Respuesta correcta</p>
                <p className="mt-1 text-sm text-slate-700">{q.options[q.correctIndex] ?? 'Sin respuesta definida'}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <Link
            href="/dashboard/trivia"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#162B4D] hover:bg-slate-50"
          >
            Volver a temas
          </Link>
        </div>
      </section>
    );
  }

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9C7A2A]">Resultado final</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#162B4D] sm:text-4xl">{topic.title}</h1>
        <div className="mt-5 rounded-xl bg-[#F7F8FA] p-5 text-center">
          <p className="text-sm text-slate-500">Tu puntuación</p>
          <p className="mt-1 text-5xl font-bold text-[#162B4D]">
            {score}/{total}
          </p>
          <p className="mt-2 text-sm font-semibold text-[#B88A44]">{pct}% de respuestas correctas</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {!topicLocked ? (
            <button
              type="button"
              onClick={restart}
              className="rounded-lg bg-[#F2C84B] px-4 py-2 text-sm font-bold text-[#2B3241] hover:bg-[#e8bd3f]"
            >
              Intentar de nuevo
            </button>
          ) : null}
          <Link
            href="/dashboard/trivia"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#162B4D] hover:bg-slate-50"
          >
            Volver a temas
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9C7A2A]">{topic.level}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#162B4D] sm:text-4xl">{topic.title}</h1>
      <p className="mt-2 text-sm text-slate-600">{topic.description}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[#A37B2C]">Valor base del test: +{basePoints} pts</p>

      <div className="mt-6 rounded-xl bg-[#F7F8FA] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#162B4D]">
            Pregunta {current + 1} de {total}
          </p>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Trivia de 10 preguntas</p>
            <p className={`mt-1 text-xs font-semibold ${secondsLeft <= 8 ? 'text-red-500' : 'text-[#8A97AE]'}`}>
              Tiempo: {secondsLeft}s
            </p>
          </div>
        </div>
        <h2 className="text-xl font-semibold leading-snug text-[#1A3158] sm:text-2xl">{currentQuestion.prompt}</h2>

        <div className="mt-4 space-y-2">
          {currentQuestion.options.map((opt, idx) => {
            const active = selected === idx;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => answer(idx)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors sm:text-base ${
                  active
                    ? 'border-[#B88A44] bg-[#FFF8E3] text-[#1F2F4A]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-1 text-xs text-slate-500">
          {selected === undefined ? <XCircle className="h-4 w-4 text-slate-400" /> : <CheckCircle2 className="h-4 w-4 text-[#B88A44]" />}
          {selected === undefined ? 'Selecciona una respuesta para continuar' : 'Respuesta seleccionada'}
        </div>
        <button
          type="button"
          onClick={next}
          disabled={selected === undefined}
          className="rounded-lg bg-[#162B4D] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {current >= total - 1 ? 'Finalizar' : 'Siguiente'}
        </button>
      </div>
    </section>
  );
}
