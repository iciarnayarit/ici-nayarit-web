'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MountOnView } from '@/app/components/mount-on-view';
import { useAuth } from '@clerk/nextjs';
import { BookOpen, Flame, Star } from 'lucide-react';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import {
  getEngagementSnapshot,
  grantEngagementPoints,
  hydrateEngagementFromServer,
  type EngagementSnapshot,
} from '@/lib/engagement-points';
import { getLocalFirstData } from '@/lib/local-storage-cache';

type RankingUser = {
  displayName: string;
  title: string;
  points: number;
};

type RankingApiResponse = {
  ok: boolean;
  topUsers?: RankingUser[];
  viewer?: { rank: number; points: number; pointsToTop20: number } | null;
};

type TriviaRecommendation = {
  slug: string;
  title: string;
  level: string;
  description: string;
  score: number;
  reason: string;
};

type TriviaRecommendationsApiResponse = {
  ok: boolean;
  strategy?: string;
  recommendations?: TriviaRecommendation[];
};

type WeeklyChallenge = {
  id: string;
  title: string;
  description: string;
  points: number;
  topicSlug: string;
};

const TriviaRankingPanel = dynamic(() => import('./trivia-ranking-panel'), {
  loading: () => <div className="min-h-[260px] animate-pulse rounded-xl bg-[#F7F7F8]" />,
});

const TriviaRecommendationsPanel = dynamic(() => import('./trivia-recommendations-panel'), {
  loading: () => <div className="h-44 animate-pulse rounded-xl bg-[#F7F7F8]" />,
});

const TriviaTopicsExplorer = dynamic(() => import('./trivia-topics-explorer'), {
  loading: () => <div className="h-80 animate-pulse rounded-xl bg-[#F7F7F8]" />,
});

const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'sermon-del-monte',
    title: 'Desafío del Día',
    description: 'Pon a prueba tu conocimiento sobre el Sermón del Monte y gana recompensas únicas.',
    points: 500,
    topicSlug: 'vida-de-jesus',
  },
  {
    id: 'voz-profetica',
    title: 'Reto Profético',
    description: 'Descubre cuánto conoces sobre Isaías, Jeremías y las grandes visiones proféticas.',
    points: 650,
    topicSlug: 'grandes-profetas',
  },
  {
    id: 'iglesia-primitiva',
    title: 'Misión Apostólica',
    description: 'Recorre los primeros pasos de la iglesia y demuestra tu dominio en Hechos.',
    points: 700,
    topicSlug: 'historia-de-la-iglesia',
  },
  {
    id: 'sabiduria-parabolas',
    title: 'Sabiduría Viva',
    description: 'Interpreta parábolas y principios de sabiduría para desbloquear recompensas mayores.',
    points: 750,
    topicSlug: 'parabolas-y-sabiduria',
  },
];

const EMPTY_SNAPSHOT: EngagementSnapshot = {
  totalPoints: 0,
  counters: {},
  pointsByAction: {},
  dailyActivity: {},
};

const TRIVIA_POINTS_CACHE_KEY = 'iciar-trivia-user-points-v1';
const TRIVIA_RANKING_CACHE_KEY = 'iciar-trivia-ranking-cache-v3';
const TRIVIA_LIVE_POINTS_KEY = 'iciar-trivia-live-points-v1';
const TRIVIA_MULTI_DEVICE_SYNC_INTERVAL_MS = 20000;

function formatPoints(n: number) {
  return new Intl.NumberFormat('es-MX').format(n);
}

function computeStreakDays(dailyActivity: Record<string, number>): number {
  const now = new Date();
  let count = 0;
  for (let i = 0; i < 366; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    if ((dailyActivity[day] ?? 0) > 0) {
      count += 1;
      continue;
    }
    break;
  }
  return count;
}

function levelFromPoints(points: number): string {
  if (points >= 5000) return 'Discípulo de Oro';
  if (points >= 2500) return 'Discípulo de Plata';
  if (points >= 1000) return 'Discípulo de Bronce';
  return 'Discípulo Inicial';
}

function getWeekCycleIndex(): number {
  const start = new Date('2026-01-01T00:00:00Z').getTime();
  const now = Date.now();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diff = Math.max(0, now - start);
  return Math.floor(diff / msPerWeek);
}

function msUntilNextMidnight(): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(60_000, next.getTime() - now.getTime());
}

function readLiveTriviaPoints(): number {
  if (typeof window === 'undefined') return 0;
  const n = Number(localStorage.getItem(TRIVIA_LIVE_POINTS_KEY) ?? '0');
  return Number.isFinite(n) ? n : 0;
}

function readCachedSnapshot(): EngagementSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TRIVIA_POINTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EngagementSnapshot>;
    return {
      totalPoints: Number(parsed.totalPoints ?? 0),
      counters: (parsed.counters ?? {}) as EngagementSnapshot['counters'],
      pointsByAction: (parsed.pointsByAction ?? {}) as EngagementSnapshot['pointsByAction'],
      dailyActivity: (parsed.dailyActivity ?? {}) as EngagementSnapshot['dailyActivity'],
    };
  } catch {
    return null;
  }
}

function writeCachedSnapshot(snapshot: EngagementSnapshot) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRIVIA_POINTS_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore localStorage quota errors
  }
}

export default function DashboardTriviaPage() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const [snapshot, setSnapshot] = useState<EngagementSnapshot>(EMPTY_SNAPSHOT);
  const [rankingUsers, setRankingUsers] = useState<RankingUser[]>([]);
  const [viewerRank, setViewerRank] = useState<number | null>(null);
  const [viewerTriviaPoints, setViewerTriviaPoints] = useState<number>(() => readLiveTriviaPoints());
  const [pointsToTop20, setPointsToTop20] = useState<number>(0);
  const [recommendedTopics, setRecommendedTopics] = useState<TriviaRecommendation[]>([]);
  const [recommendationStrategy, setRecommendationStrategy] = useState<string>('');
  const lastServerSyncAtRef = useRef(0);
  const serverSyncInFlightRef = useRef(false);

  useEffect(() => {
    void grantEngagementPoints({
      action: 'bible_read',
      dedupeKey: 'trivia-read',
      isSignedIn: authLoaded && isSignedIn === true,
    });
  }, [authLoaded, isSignedIn]);

  useEffect(() => {
    const cached = readCachedSnapshot();
    if (cached) {
      setSnapshot(cached);
    } else {
      setSnapshot(getEngagementSnapshot());
    }

    if (authLoaded && isSignedIn) {
      void hydrateEngagementFromServer({ force: true }).then(remote => {
        setSnapshot(remote);
        writeCachedSnapshot(remote);
      });
      return;
    }

    const local = getEngagementSnapshot();
    setSnapshot(local);
    writeCachedSnapshot(local);
  }, [authLoaded, isSignedIn]);

  useEffect(() => {
    let cancelled = false;
    const loadRanking = async () => {
      try {
        const data = await getLocalFirstData<RankingApiResponse>({
          cacheKey: TRIVIA_RANKING_CACHE_KEY,
          ttlMs: msUntilNextMidnight(),
          fetcher: async () => {
            const res = await fetch('/api/trivia-ranking', { method: 'GET' });
            if (!res.ok) throw new Error('No se pudo cargar trivia-ranking');
            return (await res.json()) as RankingApiResponse;
          },
        });
        if (!data.ok || cancelled) return;
        setRankingUsers(data.topUsers ?? []);
        setViewerRank(data.viewer?.rank ?? null);
        setViewerTriviaPoints(Math.max(data.viewer?.points ?? 0, readLiveTriviaPoints()));
        setPointsToTop20(data.viewer?.pointsToTop20 ?? 0);
      } catch {
        // keep UI with existing values
      }
    };
    void loadRanking();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authLoaded) return;
    let cancelled = false;
    const loadRecommendations = async () => {
      try {
        const res = await fetch('/api/trivia-recommendations?limit=6', { method: 'GET', cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as TriviaRecommendationsApiResponse;
        if (!data.ok || cancelled) return;
        setRecommendedTopics(data.recommendations ?? []);
        setRecommendationStrategy(String(data.strategy ?? ''));
      } catch {
        // keep UI without recommendations if request fails
      }
    };
    void loadRecommendations();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn]);

  useEffect(() => {
    const syncLivePoints = () => {
      setViewerTriviaPoints(prev => Math.max(prev, readLiveTriviaPoints()));
    };
    syncLivePoints();
    window.addEventListener('storage', syncLivePoints);
    window.addEventListener('iciar-trivia-points-updated', syncLivePoints as EventListener);
    return () => {
      window.removeEventListener('storage', syncLivePoints);
      window.removeEventListener('iciar-trivia-points-updated', syncLivePoints as EventListener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncNow = async () => {
      if (serverSyncInFlightRef.current) return;
      const now = Date.now();
      if (now - lastServerSyncAtRef.current < TRIVIA_MULTI_DEVICE_SYNC_INTERVAL_MS) return;
      serverSyncInFlightRef.current = true;
      try {
        const remote = await hydrateEngagementFromServer({ force: true });
        if (cancelled) return;
        setSnapshot(remote);
        writeCachedSnapshot(remote);
      } catch {
        // keep current snapshot if offline
      }

      try {
        const res = await fetch(`/api/trivia-ranking?ts=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as RankingApiResponse;
        if (!data.ok || cancelled) return;
        setRankingUsers(data.topUsers ?? []);
        setViewerRank(data.viewer?.rank ?? null);
        const livePoints = Math.max(data.viewer?.points ?? 0, readLiveTriviaPoints());
        setViewerTriviaPoints(livePoints);
        setPointsToTop20(data.viewer?.pointsToTop20 ?? 0);
        lastServerSyncAtRef.current = Date.now();
      } catch {
        // keep current ranking if offline
      } finally {
        serverSyncInFlightRef.current = false;
      }
    };

    const onFocus = () => {
      void syncNow();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void syncNow();
      }
    };

    void syncNow();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void syncNow();
      }
    }, 45000);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(intervalId);
    };
  }, []);

  const streakDays = useMemo(() => computeStreakDays(snapshot.dailyActivity), [snapshot.dailyActivity]);
  const effectiveTriviaPoints = viewerTriviaPoints > 0 ? viewerTriviaPoints : snapshot.totalPoints;
  const levelTitle = useMemo(() => levelFromPoints(effectiveTriviaPoints), [effectiveTriviaPoints]);
  const weeklyChallenge = useMemo(() => {
    const idx = getWeekCycleIndex() % WEEKLY_CHALLENGES.length;
    return WEEKLY_CHALLENGES[idx];
  }, []);

  return (
    <div className="min-h-screen bg-[#ECEEF0] pb-8 sm:pb-14">
      <div className="mx-auto w-full max-w-7xl px-2.5 pt-2.5 sm:px-6 sm:pt-5">
        <DashboardBibliaReadingToolbar />

        <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
          <div className="self-start space-y-4 lg:col-span-3">
            <div className="rounded-2xl border-l-2 border-[#B88A44] bg-[#F7F7F8] px-3 py-2.5 shadow-sm sm:px-6 sm:py-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <article className="flex items-center gap-3 rounded-xl bg-[#F7F7F8] p-2.5 sm:p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1E9D3] text-[#B88A44]">
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Nivel actual</p>
                    <p className="text-lg font-semibold tracking-tight text-[#132B4F] sm:text-xl">{levelTitle}</p>
                  </div>
                </article>

                <article className="flex items-center gap-3 rounded-xl bg-[#F7F7F8] p-2.5 sm:p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9ECF2] text-[#2E3A50]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Puntos totales</p>
                    <p className="text-lg font-semibold tracking-tight text-[#132B4F] sm:text-xl">{formatPoints(effectiveTriviaPoints)}</p>
                  </div>
                </article>

                <article className="flex items-center gap-3 rounded-xl bg-[#F7F7F8] p-2.5 sm:p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8E9E8] text-[#D04B3F]">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Racha actual</p>
                    <p className="text-lg font-semibold tracking-tight text-[#132B4F] sm:text-xl">{streakDays} Días</p>
                  </div>
                </article>
              </div>
            </div>

            <article className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#071B45] via-[#132D5D] to-[#243B67] p-4 text-white shadow-md sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(255,255,255,0.18),transparent_42%)]" />
              <div className="relative">
                <span className="inline-flex rounded-full bg-[#B88A18] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#1E2330]">
                  Reto especial
                </span>
                <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#F8FAFF] sm:mt-4 sm:text-5xl">{weeklyChallenge.title}</h1>
                <p className="mt-2.5 max-w-xl text-sm leading-snug text-[#B9C6DF] sm:mt-3 sm:text-[22px] sm:leading-snug sm:not-italic">
                  {weeklyChallenge.description}
                </p>
                <div className="mt-5 flex flex-wrap items-end gap-3 sm:mt-6 sm:gap-4">
                  <Link
                    href={`/dashboard/trivia/${weeklyChallenge.topicSlug}`}
                    className="rounded-md bg-[#F4D24F] px-5 py-2.5 text-sm font-bold text-[#27324A] transition-colors hover:bg-[#ebc93d]"
                  >
                    Jugar Ahora
                  </Link>
                  <p className="text-[#C4D0E7]">
                    <span className="block text-[10px] uppercase tracking-[0.12em]">Potencial</span>
                    <strong className="text-3xl font-semibold text-[#F4D24F]">+{weeklyChallenge.points} pts</strong>
                  </p>
                </div>
              </div>
            </article>
          </div>

          <aside className="self-start space-y-4 lg:col-span-2">
            <TriviaRankingPanel
              rankingUsers={rankingUsers}
              viewerRank={viewerRank}
              effectiveTriviaPoints={effectiveTriviaPoints}
              pointsToTop20={pointsToTop20}
              formatPoints={formatPoints}
            />
          </aside>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4">
          <TriviaRecommendationsPanel
            recommendedTopics={recommendedTopics}
            recommendationStrategy={recommendationStrategy}
          />
          <MountOnView fallback={<div className="h-80 animate-pulse rounded-xl bg-[#F7F7F8]" />}>
            <TriviaTopicsExplorer />
          </MountOnView>
        </section>
      </div>
    </div>
  );
}
