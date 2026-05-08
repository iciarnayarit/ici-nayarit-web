'use client';

import type { ComponentType } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, BookOpenText, MicVocal, PencilLine, Gift, HandHeart, Share2, BadgeCheck, Lock } from 'lucide-react';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import { useToast } from '@/app/hooks/use-toast';
import {
  ENGAGEMENT_POINTS_CHANGED_EVENT,
  ENGAGEMENT_SYNC_CHANGED_EVENT,
  getEngagementSnapshot,
  getEngagementSyncState,
  hydrateEngagementFromServer,
  type EngagementSnapshot,
  type EngagementSyncState,
} from '@/lib/engagement-points';
import { getLocalFirstData } from '@/lib/local-storage-cache';

type BadgeItem = {
  id: string;
  title: string;
  tier: string;
  unlocked: boolean;
  requirement: string;
  icon: ComponentType<{ className?: string }>;
};

type PlanProgressItem = {
  slug: string;
  title: string;
  completedDays: number;
  totalDays: number;
  percent: number;
  completed: boolean;
};

type ServerPlanProgress = {
  slug: string;
  title: string;
  completedDays: number;
  totalDays: number;
  percent: number;
  completed: boolean;
};

const READING_PLAN_TOTALS_CACHE_KEY = 'iciar-cache-reading-plan-totals-v1';
const READING_PLAN_PROGRESS_CACHE_KEY = 'iciar-cache-reading-plan-progress-v1';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MIN_SERVER_SYNC_INTERVAL_MS = 20000;

const EMPTY_SNAPSHOT: EngagementSnapshot = {
  totalPoints: 0,
  counters: {},
  pointsByAction: {},
  dailyActivity: {},
};

const WEEKDAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

function computeStreak(dailyActivity: Record<string, number>): number {
  const now = new Date();
  let count = 0;
  for (let i = 0; i < 366; i += 1) {
    const day = isoDay(addDays(now, -i));
    if ((dailyActivity[day] ?? 0) > 0) {
      count += 1;
      continue;
    }
    break;
  }
  return count;
}

function weeklySlots(dailyActivity: Record<string, number>) {
  const now = new Date();
  const out: { day: string; done: boolean }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = addDays(now, -i);
    out.push({ day: WEEKDAY_LABELS[d.getDay()] ?? '?', done: (dailyActivity[isoDay(d)] ?? 0) > 0 });
  }
  return out;
}

type FilterTab = 'todos' | 'planes';

function formatRelativeSync(ts: number | null): string {
  if (!ts) return 'sin registro';
  const diffMs = Date.now() - ts;
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return 'hace unos segundos';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function DashboardInsigniasPage() {
  const { toast } = useToast();
  const [snapshot, setSnapshot] = useState<EngagementSnapshot>(EMPTY_SNAPSHOT);
  const [syncState, setSyncState] = useState<EngagementSyncState>({
    status: 'synced',
    lastAttemptAt: null,
    lastSuccessAt: null,
  });
  const [tab, setTab] = useState<FilterTab>('todos');
  const [planItems, setPlanItems] = useState<PlanProgressItem[]>([]);
  const lastServerSyncAtRef = useRef(0);
  const serverSyncInFlightRef = useRef(false);

  const productionReminderMessages = [
    {
      title: 'Momento de leer la Biblia',
      body: 'Dedica unos minutos a tu lectura de hoy y fortalece tu racha espiritual.',
    },
    {
      title: 'Sigue tu racha hoy',
      body: 'No rompas tu constancia. Lee un capítulo y mantén tu progreso activo.',
    },
    {
      title: 'Tienes un reto pendiente',
      body: 'Completa un reto de trivia hoy para sumar puntos y avanzar en el ranking.',
    },
  ];

  const sendTestNotification = async () => {
    if (typeof window === 'undefined') return;
    const msg = productionReminderMessages[Math.floor(Math.random() * productionReminderMessages.length)] ?? productionReminderMessages[0];
    if (!('Notification' in window)) {
      toast({ title: 'Notificación de prueba', description: 'Este navegador no soporta notificaciones.' });
      return;
    }
    if (Notification.permission === 'granted') {
      new Notification(msg.title, {
        body: msg.body,
      });
      return;
    }
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(msg.title, {
          body: msg.body,
        });
        return;
      }
    }
    toast({
      title: 'Permiso pendiente',
      description: 'Activa notificaciones del navegador para ver la prueba visual.',
    });
  };


  const loadPlansProgress = async () => {
    if (typeof window === 'undefined') return;
    let totals: Record<string, number> = {};
    let titles: Record<string, string> = {};
    let serverPlans: ServerPlanProgress[] = [];

    try {
      const data = await getLocalFirstData<{ ok?: boolean; totals?: Record<string, number>; titles?: Record<string, string> }>({
        cacheKey: READING_PLAN_TOTALS_CACHE_KEY,
        ttlMs: ONE_DAY_MS,
        fetcher: async () => {
          const res = await fetch('/api/reading-plan-totals', { method: 'GET' });
          if (!res.ok) throw new Error('No se pudo cargar reading-plan-totals');
          return (await res.json()) as { ok?: boolean; totals?: Record<string, number>; titles?: Record<string, string> };
        },
      });
      if (data.ok) {
        totals = data.totals ?? {};
        titles = data.titles ?? {};
      }
    } catch {
      // fallback to local-only titles/length estimation
    }

    try {
      const data = await getLocalFirstData<{ ok?: boolean; plans?: ServerPlanProgress[] }>({
        cacheKey: READING_PLAN_PROGRESS_CACHE_KEY,
        ttlMs: 30_000,
        minRemoteIntervalMs: 15_000,
        fetcher: async () => {
          const res = await fetch('/api/reading-plan-progress', { method: 'GET', cache: 'no-store' });
          if (!res.ok) throw new Error('No se pudo cargar reading-plan-progress');
          return (await res.json()) as { ok?: boolean; plans?: ServerPlanProgress[] };
        },
      });
      if (data.ok && Array.isArray(data.plans)) {
        serverPlans = data.plans;
      }
    } catch {
      // keep local as fallback when offline
    }

    const slugs = new Set<string>();
    for (const plan of serverPlans) {
      if (plan.slug) slugs.add(plan.slug);
    }
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('completedDays_')) {
        slugs.add(key.replace('completedDays_', ''));
      }
    }

    const serverBySlug = new Map(serverPlans.map((p) => [p.slug, p]));
    const items: PlanProgressItem[] = Array.from(slugs).map((slug) => {
      let completedDaysLocal = 0;
      try {
        const raw = localStorage.getItem(`completedDays_${slug}`);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        if (Array.isArray(parsed)) {
          completedDaysLocal = parsed.filter(v => Number.isFinite(Number(v))).length;
        }
      } catch {
        completedDaysLocal = 0;
      }
      const serverPlan = serverBySlug.get(slug);
      const completedDays = Math.max(completedDaysLocal, Number(serverPlan?.completedDays ?? 0));
      const totalDays = Math.max(1, Number(serverPlan?.totalDays ?? totals[slug] ?? completedDays));
      const percent = Math.max(
        0,
        Math.min(
          100,
          Number.isFinite(Number(serverPlan?.percent))
            ? Math.round(Math.max(Number(serverPlan?.percent ?? 0), (completedDays / totalDays) * 100))
            : Math.round((completedDays / totalDays) * 100)
        )
      );
      const title =
        serverPlan?.title?.trim() || titles[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return {
        slug,
        title,
        completedDays,
        totalDays,
        percent,
        completed: Boolean(serverPlan?.completed) || percent >= 100,
      };
    });

    items.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.percent - a.percent;
    });
    setPlanItems(items);
  };

  const retrySync = () => {
    void hydrateEngagementFromServer({ force: true }).then((snap) => {
      setSnapshot(snap);
      setSyncState(getEngagementSyncState());
      void loadPlansProgress();
    });
  };

  useEffect(() => {
    const refresh = () => setSnapshot(getEngagementSnapshot());
    const refreshSync = () => setSyncState(getEngagementSyncState());
    refresh();
    refreshSync();
    void hydrateEngagementFromServer({ force: true }).then((snap) => {
      setSnapshot(snap);
      refreshSync();
      void loadPlansProgress();
    });
    window.addEventListener(ENGAGEMENT_POINTS_CHANGED_EVENT, refresh as EventListener);
    window.addEventListener(ENGAGEMENT_SYNC_CHANGED_EVENT, refreshSync as EventListener);
    window.addEventListener('storage', refresh);
    window.addEventListener('storage', refreshSync);
    return () => {
      window.removeEventListener(ENGAGEMENT_POINTS_CHANGED_EVENT, refresh as EventListener);
      window.removeEventListener(ENGAGEMENT_SYNC_CHANGED_EVENT, refreshSync as EventListener);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('storage', refreshSync);
    };
  }, []);

  useEffect(() => {
    void loadPlansProgress();
    const onStorage = () => void loadPlansProgress();
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncNow = async () => {
      if (serverSyncInFlightRef.current) return;
      const now = Date.now();
      if (now - lastServerSyncAtRef.current < MIN_SERVER_SYNC_INTERVAL_MS) return;
      serverSyncInFlightRef.current = true;
      try {
        const snap = await hydrateEngagementFromServer({ force: true });
        if (cancelled) return;
        setSnapshot(snap);
        setSyncState(getEngagementSyncState());
        await loadPlansProgress();
        lastServerSyncAtRef.current = Date.now();
      } catch {
        if (!cancelled) setSyncState(getEngagementSyncState());
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
    }, 60000);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(intervalId);
    };
  }, []);

  const streakDays = useMemo(() => computeStreak(snapshot.dailyActivity), [snapshot.dailyActivity]);
  const week = useMemo(() => weeklySlots(snapshot.dailyActivity), [snapshot.dailyActivity]);
  const weeklyDone = week.filter((d) => d.done).length;
  const weeklyGoal = week.length;
  const nextChallengeTarget = 10;
  const challengeProgressPct = Math.max(0, Math.min(100, Math.round((streakDays / nextChallengeTarget) * 100)));
  const remainingForChallenge = Math.max(0, nextChallengeTarget - streakDays);

  const readCount = snapshot.counters.bible_read ?? 0;
  const shareCount = snapshot.counters.bible_share ?? 0;
  const highlightCount = snapshot.counters.bible_highlight ?? 0;
  const noteCount = snapshot.counters.bible_note_create ?? 0;
  const imgGenerateCount = snapshot.counters.bible_image_generate ?? 0;
  const imgCreateCount = snapshot.counters.bible_image_create ?? 0;

  const badges: BadgeItem[] = [
    { id: 'buscador-fiel', title: 'Buscador Fiel', tier: 'ORO', unlocked: readCount >= 30, requirement: '30 lecturas', icon: Flame },
    { id: 'sabio-mes', title: 'Sabio del Mes', tier: 'PLATA', unlocked: noteCount >= 12, requirement: '12 notas', icon: BookOpenText },
    { id: 'voz-comun', title: 'Voz Común', tier: 'BRONCE', unlocked: shareCount >= 8, requirement: '8 compartidos', icon: MicVocal },
    { id: 'escriba-novicio', title: 'Escriba Novicio', tier: 'INICIAL', unlocked: noteCount >= 1, requirement: '1 nota', icon: PencilLine },
    { id: 'centenario', title: 'Centenario ICIAR', tier: 'ÉPICO', unlocked: snapshot.totalPoints >= 1000, requirement: '1000 puntos', icon: Gift },
    { id: 'bronce-200', title: 'Bronce 200', tier: 'BRONCE', unlocked: snapshot.totalPoints >= 200, requirement: '200 puntos', icon: BadgeCheck },
    { id: 'plata-500', title: 'Plata 500', tier: 'PLATA', unlocked: snapshot.totalPoints >= 500, requirement: '500 puntos', icon: BadgeCheck },
    { id: 'oro-1000', title: 'Oro 1K', tier: 'ORO', unlocked: snapshot.totalPoints >= 1000, requirement: '1,000 puntos', icon: BadgeCheck },
    { id: 'elite-5000', title: 'Élite 5K', tier: 'ÉLITE', unlocked: snapshot.totalPoints >= 5000, requirement: '5,000 puntos', icon: BadgeCheck },
    { id: 'maestro-10000', title: 'Maestro 10K', tier: 'MAESTRO', unlocked: snapshot.totalPoints >= 10000, requirement: '10,000 puntos', icon: BadgeCheck },
    { id: 'leyenda-50000', title: 'Leyenda 50K', tier: 'LEYENDA', unlocked: snapshot.totalPoints >= 50000, requirement: '50,000 puntos', icon: BadgeCheck },
    { id: 'eterno-100000', title: 'Eterno 100K', tier: 'ETERNO', unlocked: snapshot.totalPoints >= 100000, requirement: '100,000 puntos', icon: BadgeCheck },
    { id: 'lector-1-mes', title: 'Lector 1 Mes', tier: 'CONSTANCIA', unlocked: streakDays >= 30, requirement: '30 días seguidos', icon: Flame },
    { id: 'lector-3-meses', title: 'Lector 3 Meses', tier: 'FIDELIDAD', unlocked: streakDays >= 90, requirement: '90 días seguidos', icon: Flame },
    { id: 'lector-6-meses', title: 'Lector 6 Meses', tier: 'PERSEVERANCIA', unlocked: streakDays >= 180, requirement: '180 días seguidos', icon: Flame },
    { id: 'lector-1-anio', title: 'Lector 1 Año', tier: 'LEGADO', unlocked: streakDays >= 365, requirement: '365 días seguidos', icon: Flame },
    { id: 'donante-generoso', title: 'Donante Generoso', tier: 'SERVICIO', unlocked: highlightCount >= 20, requirement: '20 resaltados', icon: HandHeart },
    { id: 'misionero-digital', title: 'Misionero Digital', tier: 'DIGITAL', unlocked: shareCount >= 20, requirement: '20 compartidos', icon: Share2 },
    { id: 'maestro-ley', title: 'Maestro de la Ley', tier: 'EXPERTO', unlocked: imgGenerateCount + imgCreateCount >= 12, requirement: '12 imágenes', icon: BadgeCheck },
  ];

  const filteredBadges = badges.filter((b) => {
    return true;
  });
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const syncLabel =
    syncState.status === 'syncing'
      ? 'Sincronizando...'
      : syncState.status === 'pending'
      ? 'Pendiente por conexión'
      : `Sincronizado ${formatRelativeSync(syncState.lastSuccessAt)}`;
  const syncClass =
    syncState.status === 'syncing'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : syncState.status === 'pending'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className="min-h-screen bg-[#F4F7F6] pb-10 sm:pb-16">
      <div className="mx-auto w-full max-w-7xl space-y-5 px-3 pt-3 sm:space-y-8 sm:px-6 sm:pt-4 md:px-8 lg:px-10">
        <DashboardBibliaReadingToolbar />

        <header className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#9C7A2A]">Disciplina espiritual</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#11274B] sm:text-5xl">Racha e Insignias</h1>
          <p className="max-w-full overflow-x-auto whitespace-nowrap text-sm leading-relaxed text-gray-600 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:text-base">
            Tu constancia es el reflejo de tu devoción. Continúa tu camino diario para desbloquear nuevos hitos en tu crecimiento espiritual.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${syncClass}`}>{syncLabel}</span>
            <button
              type="button"
              onClick={() => void sendTestNotification()}
              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Enviar prueba
            </button>
            {syncState.status === 'pending' ? (
              <button
                type="button"
                onClick={retrySync}
                className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 transition-colors hover:bg-amber-200"
              >
                Reintentar sincronización
              </button>
            ) : null}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[0.92fr_1.35fr]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#142B54] p-4 text-white shadow-sm sm:p-6">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#9C7A2A]/20 sm:mb-5 sm:h-12 sm:w-12">
                <Flame className="h-6 w-6 text-[#D1A228] sm:h-7 sm:w-7" />
              </div>
              <p className="text-center text-5xl font-black leading-none sm:text-6xl">{streakDays}</p>
              <p className="mt-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Días seguidos</p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <h3 className="font-display text-2xl font-bold tracking-tight text-[#11274B] sm:text-3xl">Progreso Semanal</h3>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {week.map((item, idx) => (
                  <div key={`${item.day}-${idx}`} className="text-center">
                    <p className="mb-1 text-[10px] font-black text-gray-500">{item.day}</p>
                    <div
                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${
                        item.done ? 'bg-[#F2C84B] text-[#6D5316]' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {item.done ? '✓' : '·'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-l-2 border-[#9C7A2A] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-2 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <h4 className="font-semibold text-gray-900">Próximo Desafío</h4>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9C7A2A]">Insignia de 10 días</span>
              </div>
              <p className="text-sm text-gray-600">
                {remainingForChallenge > 0 ? (
                  <>Faltan solo <strong>{remainingForChallenge} días</strong> de racha continua para alcanzar este nivel.</>
                ) : (
                  <>¡Meta alcanzada! Sigue constante para mantener tu racha activa.</>
                )}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#9C7A2A]" style={{ width: `${challengeProgressPct}%` }} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                <h3 className="text-lg font-black text-[#11274B] sm:text-xl">{tab === 'planes' ? 'Planes de Lectura' : 'Colección de Insignias'}</h3>
                <div className="-mx-1 overflow-x-auto">
                  <div className="inline-flex min-w-max items-center rounded-lg bg-gray-100 p-1 text-[11px] font-black uppercase tracking-wide text-gray-500">
                    <button
                      type="button"
                      onClick={() => setTab('todos')}
                      className={`rounded-md px-3 py-1 ${tab === 'todos' ? 'bg-white text-gray-700 shadow-sm' : ''}`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('planes')}
                      className={`rounded-md px-3 py-1 ${tab === 'planes' ? 'bg-white text-gray-700 shadow-sm' : ''}`}
                    >
                      Planes
                    </button>
                  </div>
                </div>
              </div>

              {tab === 'planes' ? (
                <div className="space-y-2">
                  {planItems.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      Aún no tienes progreso en planes de lectura.
                    </p>
                  ) : (
                    planItems.map((item) => (
                      <article
                        key={item.slug}
                        className={`rounded-xl border p-3 sm:p-4 ${
                          item.completed
                            ? 'border-[#E6D6A8] bg-[#FFF8E5]'
                            : 'border-[#D8E5F8] bg-[#F4F8FF]'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-bold sm:text-base ${item.completed ? 'text-[#7A5A1E]' : 'text-[#1D3F74]'}`}>{item.title}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${item.completed ? 'bg-[#F4D27A] text-[#6B4A14]' : 'bg-[#D7E6FF] text-[#355D9A]'}`}>
                            {item.completed ? 'Completado' : 'En lectura'}
                          </span>
                        </div>
                        <p className={`text-xs ${item.completed ? 'text-[#8A6A2D]' : 'text-[#4E6FA6]'}`}>
                          {item.completedDays}/{item.totalDays} días · {item.percent}%
                        </p>
                        <div className={`mt-2 h-2 overflow-hidden rounded-full ${item.completed ? 'bg-[#F4E2B6]' : 'bg-[#D8E7FF]'}`}>
                          <div
                            className={`h-full rounded-full ${item.completed ? 'bg-[#C89A35]' : 'bg-[#5F8ED6]'}`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </article>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
                  {filteredBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <article key={badge.id} className="rounded-lg border border-gray-100 p-2 text-center sm:rounded-xl sm:p-3">
                        <div
                          className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg sm:mb-3 sm:h-16 sm:w-16 sm:rounded-xl ${
                            badge.unlocked ? 'bg-[#FFF7DF] text-[#B8802D]' : 'bg-gray-50 text-gray-300'
                          }`}
                        >
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <h4 className={`text-[12px] font-bold leading-tight sm:text-sm ${badge.unlocked ? 'text-gray-900' : 'text-gray-400'}`}>{badge.title}</h4>
                        <p className={`mt-1 text-[9px] font-black uppercase tracking-[0.11em] sm:text-[10px] sm:tracking-widest ${badge.unlocked ? 'text-[#9C7A2A]' : 'text-gray-300'}`}>
                          {badge.unlocked ? badge.tier : badge.requirement}
                        </p>
                        {!badge.unlocked ? (
                          <div className="mt-0.5 inline-flex items-center justify-center text-gray-300 sm:mt-1">
                            <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 flex flex-col items-start gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500 sm:text-xs">
                  <span className="mr-1 rounded-full bg-[#11274B] px-2 py-0.5 text-[10px] font-bold text-white">{unlockedCount}</span>
                  <span className="rounded-full bg-[#F2C84B] px-2 py-0.5 text-[10px] font-bold text-[#6D5316]">{badges.length}</span>
                  <span className="ml-2">Insignias ganadas en tu cuenta</span>
                </p>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-[#11274B]">
                  {snapshot.totalPoints} pts
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <article className="rounded-2xl bg-[#0E2448] p-4 text-white shadow-sm sm:p-6">
                <h4 className="font-display text-xl font-bold italic sm:text-2xl">Resumen de Actividad</h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Lecturas: {readCount} · Notas: {noteCount} · Compartidos: {shareCount} · Resaltados: {highlightCount}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">
                  Imágenes: {imgGenerateCount + imgCreateCount}
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
