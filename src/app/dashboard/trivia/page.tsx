'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BookOpen, Flame, Megaphone, Sparkles, Star } from 'lucide-react';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import { getEngagementSnapshot, hydrateEngagementFromServer, type EngagementSnapshot } from '@/lib/engagement-points';
import { getLocalFirstData } from '@/lib/local-storage-cache';
import { stableMergeSort } from '@/lib/perf-algorithms';
import { triviaBasePointsByDifficulty, TRIVIA_TOPICS } from '@/lib/trivia-topics';

type RankingUser = {
  displayName: string;
  title: string;
  points: number;
};

type RankingApiResponse = {
  ok: boolean;
  topUsers?: RankingUser[];
  viewer?: { rank: number; points: number; pointsToTop20: number } | null;
  generatedAt?: string;
};

type WeeklyChallenge = {
  id: string;
  title: string;
  description: string;
  points: number;
  topicSlug: string;
};

type TriviaCategory =
  | 'Antiguo Testamento'
  | 'Nuevo Testamento'
  | 'Evangelios'
  | 'Iglesia Primitiva'
  | 'Cartas'
  | 'Profecía'
  | 'Temas generales';

const TOPIC_ORDER_BY_CATEGORY: Record<TriviaCategory, string[]> = {
  'Antiguo Testamento': [
    'tema-creacion',
    'tema-eden',
    'tema-diluvio',
    'tema-patriarcas',
    'tema-jose-egipto',
    'tema-exodo-general',
    'tema-diez-mandamientos',
    'tema-jueces-israel',
    'tema-david-goliat',
    'tema-salomon-sabiduria',
    'genesis',
    'exodo',
    'levitico',
    'numeros',
    'deuteronomio',
    'josue',
    'jueces',
    'rut',
    '1-samuel',
    '2-samuel',
    '1-reyes',
    '2-reyes',
    '1-cronicas',
    '2-cronicas',
    'esdras',
    'nehemias',
    'ester',
    'job',
    'salmos',
    'proverbios',
    'eclesiastes',
    'cantares',
  ],
  'Nuevo Testamento': ['tema-mujeres-biblia'],
  Evangelios: [
    'tema-nacimiento-jesus',
    'vida-de-jesus',
    'mateo',
    'marcos',
    'lucas',
    'juan',
    'tema-parabolas-jesus',
    'parabolas-y-sabiduria',
    'tema-milagros-jesus',
    'tema-sermon-monte',
    'tema-pasion-resurreccion',
  ],
  'Iglesia Primitiva': ['historia-de-la-iglesia', 'hechos', 'tema-12-apostoles', 'tema-viajes-pablo'],
  Cartas: ['romanos', '1-corintios', '2-corintios', 'galatas'],
  'Profecía': [
    'tema-grandes-profetas-general',
    'grandes-profetas',
    'isaias',
    'jeremias',
    'lamentaciones',
    'ezequiel',
    'daniel',
    'oseas',
    'joel',
    'amos',
    'abdias',
    'jonas',
    'miqueas',
    'nahum',
    'habacuc',
    'sofonias',
    'hageo',
    'zacarias',
    'malaquias',
    'tema-apocalipsis-general',
    'apocalipsis',
  ],
  'Temas generales': [],
};

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

const topicIcons = [Sparkles, BookOpen, Megaphone, Star] as const;

function formatPoints(n: number) {
  return new Intl.NumberFormat('es-MX').format(n);
}

const EMPTY_SNAPSHOT: EngagementSnapshot = {
  totalPoints: 0,
  counters: {},
  pointsByAction: {},
  dailyActivity: {},
};

const TRIVIA_POINTS_CACHE_KEY = 'iciar-trivia-user-points-v1';
const TRIVIA_RANKING_CACHE_KEY = 'iciar-trivia-ranking-cache-v3';
const TRIVIA_LIVE_POINTS_KEY = 'iciar-trivia-live-points-v1';

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

function categoryByTopicSlug(slug: string): TriviaCategory {
  const antiguoTestamento = new Set([
    'genesis',
    'exodo',
    'levitico',
    'numeros',
    'deuteronomio',
    'josue',
    'jueces',
    'rut',
    '1-samuel',
    '2-samuel',
    '1-reyes',
    '2-reyes',
    '1-cronicas',
    '2-cronicas',
    'esdras',
    'nehemias',
    'ester',
    'job',
    'salmos',
    'proverbios',
    'eclesiastes',
    'cantares',
    'tema-creacion',
    'tema-eden',
    'tema-diluvio',
    'tema-patriarcas',
    'tema-jose-egipto',
    'tema-exodo-general',
    'tema-diez-mandamientos',
    'tema-jueces-israel',
    'tema-david-goliat',
    'tema-salomon-sabiduria',
  ]);
  const profecia = new Set([
    'isaias',
    'jeremias',
    'lamentaciones',
    'ezequiel',
    'daniel',
    'oseas',
    'joel',
    'amos',
    'abdias',
    'jonas',
    'miqueas',
    'nahum',
    'habacuc',
    'sofonias',
    'hageo',
    'zacarias',
    'malaquias',
    'apocalipsis',
    'tema-apocalipsis-general',
    'grandes-profetas',
    'tema-grandes-profetas-general',
  ]);
  const cartas = new Set(['romanos', '1-corintios', '2-corintios', 'galatas']);
  const evangelios = new Set([
    'mateo',
    'marcos',
    'lucas',
    'juan',
    'vida-de-jesus',
    'tema-nacimiento-jesus',
    'parabolas-y-sabiduria',
    'tema-parabolas-jesus',
    'tema-milagros-jesus',
    'tema-sermon-monte',
    'tema-pasion-resurreccion',
  ]);
  const iglesiaPrimitiva = new Set(['hechos', 'historia-de-la-iglesia', 'tema-12-apostoles', 'tema-viajes-pablo']);
  const nuevoTestamento = new Set(['tema-mujeres-biblia']);

  if (evangelios.has(slug)) return 'Evangelios';
  if (iglesiaPrimitiva.has(slug)) return 'Iglesia Primitiva';
  if (cartas.has(slug)) return 'Cartas';
  if (profecia.has(slug)) return 'Profecía';
  if (antiguoTestamento.has(slug)) return 'Antiguo Testamento';
  if (nuevoTestamento.has(slug)) return 'Nuevo Testamento';
  return 'Temas generales';
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
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [topicsPage, setTopicsPage] = useState(0);

  useEffect(() => {
    const cached = readCachedSnapshot();
    if (cached) {
      setSnapshot(cached);
    } else {
      setSnapshot(getEngagementSnapshot());
    }

    if (authLoaded && isSignedIn) {
      void hydrateEngagementFromServer().then(remote => {
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

  const streakDays = useMemo(() => computeStreakDays(snapshot.dailyActivity), [snapshot.dailyActivity]);
  const effectiveTriviaPoints = viewerTriviaPoints > 0 ? viewerTriviaPoints : snapshot.totalPoints;
  const levelTitle = useMemo(() => levelFromPoints(effectiveTriviaPoints), [effectiveTriviaPoints]);
  const weeklyChallenge = useMemo(() => {
    const idx = getWeekCycleIndex() % WEEKLY_CHALLENGES.length;
    return WEEKLY_CHALLENGES[idx];
  }, []);
  const topicsPerPage = 20;
  const totalTopicPages = Math.max(1, Math.ceil(TRIVIA_TOPICS.length / topicsPerPage));
  const visibleTopics = useMemo(() => {
    if (!showAllTopics) return TRIVIA_TOPICS.slice(0, 6);
    const start = topicsPage * topicsPerPage;
    return TRIVIA_TOPICS.slice(start, start + topicsPerPage);
  }, [showAllTopics, topicsPage]);
  const extraTopicsCount = Math.max(0, TRIVIA_TOPICS.length - 6);
  const groupedVisibleTopics = useMemo(() => {
    const order: TriviaCategory[] = [
      'Antiguo Testamento',
      'Nuevo Testamento',
      'Evangelios',
      'Iglesia Primitiva',
      'Cartas',
      'Profecía',
      'Temas generales',
    ];
    const map = new Map<TriviaCategory, typeof visibleTopics>();
    for (const topic of visibleTopics) {
      const cat = categoryByTopicSlug(topic.slug);
      map.set(cat, [...(map.get(cat) ?? []), topic]);
    }
    return order
      .map(category => {
        const topics = map.get(category) ?? [];
        const orderList = TOPIC_ORDER_BY_CATEGORY[category];
        const orderIndex = new Map(orderList.map((slug, idx) => [slug, idx]));
        const sortedTopics = stableMergeSort(topics, (a, b) => {
          const ai = orderIndex.get(a.slug);
          const bi = orderIndex.get(b.slug);
          if (ai !== undefined && bi !== undefined) return ai - bi;
          if (ai !== undefined) return -1;
          if (bi !== undefined) return 1;
          return a.title.localeCompare(b.title, 'es-MX');
        });
        return { category, topics: sortedTopics };
      })
      .filter(group => group.topics.length > 0);
  }, [visibleTopics]);

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
            <article className="flex min-h-[260px] flex-col rounded-xl bg-[#F7F7F8] p-3.5 shadow-sm sm:p-4">
            <h3 className="text-3xl font-semibold tracking-tight text-[#1C2F4E] sm:text-4xl">Ranking Global</h3>
            <div className="mt-2 h-0.5 w-24 bg-[#AA8437]" />
            <div className="mt-3 flex-1 space-y-2 sm:mt-4 sm:space-y-2.5">
              {(rankingUsers.length > 0 ? rankingUsers : []).map((user, i) => (
                <div key={`${user.displayName}-${i}`} className="flex items-center justify-between gap-3 rounded-lg p-1">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1D2F4D]">{user.displayName}</p>
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[#9296A0]">{user.title}</p>
                  </div>
                  <span className={`text-sm font-semibold ${i === 0 ? 'text-[#D3A840]' : 'text-[#2F3D56]'}`}>
                    {formatPoints(viewerRank !== null && viewerRank === i + 1 ? effectiveTriviaPoints : user.points)}
                  </span>
                </div>
              ))}
              {rankingUsers.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">El ranking del día aún no está disponible.</p>
              ) : null}
            </div>

            <div className="mt-auto rounded-lg bg-[#192F56] p-3.5 text-center text-white sm:mt-4 sm:p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#A5B4CF]">Tu posición actual</p>
              <p className="text-5xl font-semibold leading-none text-[#F3CD5D] sm:text-5xl">{viewerRank ? `#${viewerRank}` : '—'}</p>
              <p className="mt-1 text-[11px] text-[#99A9C6]">
                {viewerRank
                  ? pointsToTop20 > 0
                    ? `A ${formatPoints(pointsToTop20)} pts del Top 20`
                    : '¡Ya estás dentro del Top 20!'
                  : 'Inicia sesión y avanza para aparecer en el ranking'}
              </p>
            </div>
            </article>
          </aside>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4">
          <div>
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h2 className="text-3xl font-semibold tracking-tight text-[#162B4D] sm:text-4xl">Explora por Temas</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAllTopics(prev => {
                      const next = !prev;
                      if (next) setTopicsPage(0);
                      return next;
                    });
                  }}
                  className="text-xs font-black uppercase tracking-[0.16em] text-[#A37B2C] hover:underline"
                >
                  {showAllTopics ? 'Ver menos' : `Ver todos (+${extraTopicsCount})`}
                </button>
              </div>
              <div className="space-y-5">
                {groupedVisibleTopics.map(group => (
                  <section key={group.category} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#A37B2C]">{group.category}</h3>
                      <span className="h-px flex-1 bg-[#D9DCE2]" />
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
                      {group.topics.map((topic, idx) => {
                        const Icon = topicIcons[idx % topicIcons.length];
                        return (
                          <Link
                            key={topic.slug}
                            href={`/dashboard/trivia/${topic.slug}`}
                            className="rounded-xl bg-[#F7F7F8] p-3.5 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-white sm:p-4"
                          >
                            <div className="mb-5 flex items-center justify-between sm:mb-7">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#1B2E51] text-[#F5D45E]">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="rounded-full bg-[#ECECEF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8E9098]">
                                {topic.level}
                              </span>
                            </div>
                            <h3 className="text-[2.05rem] font-medium leading-tight text-[#182D4D] sm:text-[31px]">{topic.title}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-[#666A73] sm:mt-2">{topic.description}</p>
                            <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#A37B2C] sm:mt-2 sm:text-xs sm:tracking-[0.08em]">
                              Valor del test: +{formatPoints(triviaBasePointsByDifficulty(topic.level))} pts
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
              {showAllTopics && totalTopicPages > 1 ? (
                <div className="mt-4 flex items-center justify-end gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setTopicsPage(prev => Math.max(0, prev - 1))}
                    disabled={topicsPage === 0}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-xs"
                  >
                    Anterior
                  </button>
                  <span className="text-xs font-semibold text-slate-500">
                    {topicsPage + 1}/{totalTopicPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTopicsPage(prev => Math.min(totalTopicPages - 1, prev + 1))}
                    disabled={topicsPage >= totalTopicPages - 1}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-xs"
                  >
                    Siguiente
                  </button>
                </div>
              ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
