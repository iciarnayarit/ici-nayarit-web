'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  startOfDay,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  isSameMonth,
} from 'date-fns';
import { Calendar, MapPin, ArrowRight, Bell, Bookmark, Share2 } from 'lucide-react';
import Image from 'next/image';
import Footer from '@/app/components/footer';
import { featuredAnnouncement, recentAnnouncements, slugify } from '@/app/lib/announcements';
import {
  loadSavedAnnouncementTitles,
  persistSavedAnnouncementTitles,
  SAVED_ANNOUNCEMENTS_CHANGED_EVENT,
  SAVED_ANNOUNCEMENTS_STORAGE_KEY,
} from '@/lib/saved-announcements';
import { useAuth, useClerk } from '@clerk/nextjs';
import { ensureClerkSignedInForFavoriteAdd } from '@/lib/require-clerk-sign-in';
import { grantEngagementPoints } from '@/lib/engagement-points';
import { normalizeVisualKey, toVisualLabel } from '@/lib/visual-labels';

/** Nombre del query en la URL: `?tiempo=…` */
export const AVISOS_TIME_PARAM = 'tiempo';

/** Rutas de ejemplo (anteponer el origen del sitio), p. ej. `https://tudominio.com/avisos?tiempo=hoy` */
export const AVISOS_TIME_ROUTES = {
  todos: `/avisos?${AVISOS_TIME_PARAM}=todos`,
  hoy: `/avisos?${AVISOS_TIME_PARAM}=hoy`,
  estaSemana: `/avisos?${AVISOS_TIME_PARAM}=esta-semana`,
  esteMes: `/avisos?${AVISOS_TIME_PARAM}=este-mes`,
} as const;

/** `?anio=2026` — año del filtro personalizado */
export const AVISOS_ANIO_PARAM = 'anio';
/** `?mes=0` todo el año; `1`–`12` mes concreto (con `tiempo=periodo`) */
export const AVISOS_MES_PARAM = 'mes';

const ITEMS_PER_PAGE = 4;
/** Pedimos más candidatos al API y filtramos guardados en cliente para mantener ~3 visibles. */
const RECOMMENDED_AVISOS_FETCH_LIMIT = 12;
const RECOMMENDED_AVISOS_DISPLAY = 3;
const filters = ['Todos', 'Eventos', 'Comunidad', 'Avisos', 'Misiones', 'Celebración'];
const timeFilters = ['Todos', 'Hoy', 'Esta Semana', 'Este Mes'] as const;

function slugToTimeLabel(raw: string | null): (typeof timeFilters)[number] | null {
  if (!raw) return 'Todos';
  switch (raw.toLowerCase()) {
    case 'hoy':
      return 'Hoy';
    case 'esta-semana':
      return 'Esta Semana';
    case 'este-mes':
      return 'Este Mes';
    case 'periodo':
      return null;
    case 'todos':
    default:
      return 'Todos';
  }
}

function timeLabelToHref(label: string): string {
  switch (label) {
    case 'Hoy':
      return AVISOS_TIME_ROUTES.hoy;
    case 'Esta Semana':
      return AVISOS_TIME_ROUTES.estaSemana;
    case 'Este Mes':
      return AVISOS_TIME_ROUTES.esteMes;
    case 'Todos':
    default:
      return AVISOS_TIME_ROUTES.todos;
  }
}

const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;

function buildPeriodoHref(anio: number, mes: number): string {
  const p = new URLSearchParams();
  p.set(AVISOS_TIME_PARAM, 'periodo');
  p.set(AVISOS_ANIO_PARAM, String(anio));
  p.set(AVISOS_MES_PARAM, String(mes));
  return `/avisos?${p.toString()}`;
}

type TimeFilterKind = 'todos' | 'hoy' | 'semana' | 'este-mes' | 'periodo';

function parseTimeFilterFromParams(
  tiempo: string | null,
  anioRaw: string | null,
  mesRaw: string | null,
  now: Date
): {
  kind: TimeFilterKind;
  periodYear: number;
  periodMonth: number;
} {
  const t = (tiempo || 'todos').toLowerCase();
  const yNow = now.getFullYear();
  const mNow = now.getMonth() + 1;

  if (t === 'periodo') {
    const y = parseInt(anioRaw || '', 10);
    const year = !isNaN(y) && y >= 1900 && y <= 2100 ? y : yNow;
    const m = parseInt(mesRaw || '0', 10);
    const month = m >= 1 && m <= 12 ? m : 0;
    return { kind: 'periodo', periodYear: year, periodMonth: month };
  }

  let kind: TimeFilterKind = 'todos';
  if (t === 'hoy') kind = 'hoy';
  else if (t === 'esta-semana') kind = 'semana';
  else if (t === 'este-mes') kind = 'este-mes';

  return {
    kind,
    periodYear: yNow,
    periodMonth: kind === 'este-mes' ? mNow : 0,
  };
}

const monthNames: { [key: string]: number } = {
  'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
  'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11,
  'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
  'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
};

const parseAnnouncementDate = (dateStr: string) => {
  const parts = dateStr.trim().split(' ');

  if (parts.length === 3) {
    const dayPart = parts[0].split('-')[0];
    const day = parseInt(dayPart);
    const month = monthNames[parts[1]];
    const year = parseInt(parts[2]);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  } else if (parts.length === 2) {
    const month = monthNames[parts[0]];
    const year = parseInt(parts[1]);
    if (month !== undefined && !isNaN(year)) {
      return new Date(year, month, 1);
    }
  } else if (parts.length === 1) {
    const month = monthNames[parts[0]];
    if (month !== undefined) {
      const y = new Date().getFullYear();
      return new Date(y, month, 1);
    }
  }

  return new Date();
};

const CategoryTag = ({ category }: { category: string }) => {
  let colorClass = 'bg-gray-500';
  switch (normalizeVisualKey(category)) {
    case 'destacado':
      colorClass = 'bg-[#B88A44]';
      break;
    case 'comunidad':
      colorClass = 'bg-indigo-600';
      break;
    case 'evento':
      colorClass = 'bg-purple-600';
      break;
    case 'misiones':
      colorClass = 'bg-emerald-600';
      break;
    case 'aviso':
      colorClass = 'bg-amber-600';
      break;
    case 'celebracion':
      colorClass = 'bg-rose-600';
      break;
  }
  return (
    <span className={`text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm ${colorClass}`}>
      {toVisualLabel(category)}
    </span>
  );
};

const MemoCategoryTag = memo(CategoryTag);

type AnnouncementCardProps = {
  item: (typeof recentAnnouncements)[number];
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, title: string) => void;
  onShare: (e: React.MouseEvent, title: string) => Promise<void>;
};

type AvisoRecommendation = {
  type: 'aviso';
  slug: string;
  title: string;
  category: string;
  score: number;
  reason: string;
};

const AnnouncementCard = memo(function AnnouncementCard({ item, isSaved, onToggleSave, onShare }: AnnouncementCardProps) {
  return (
    <div className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group relative">
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button
          onClick={(e) => onToggleSave(e, item.title)}
          className="p-2 bg-white/90 rounded-full shadow-sm backdrop-blur-sm cursor-pointer transition-colors hover:bg-white z-30"
          aria-label="Guardar"
        >
          <Bookmark className={`w-4 h-4 transition-colors ${isSaved ? 'text-[#B88A44] fill-[#B88A44]' : 'text-gray-700 fill-none'}`} />
        </button>
        <button
          onClick={(e) => void onShare(e, item.title)}
          className="p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 hover:text-[#B88A44] transition-colors shadow-sm backdrop-blur-sm cursor-pointer z-30"
          aria-label="Compartir"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <Link href={`/avisos/${slugify(item.title)}`} className="block h-full">
        <div className="h-48 overflow-hidden relative">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
            fetchPriority="low"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-3">
            <MemoCategoryTag category={item.category} />
            <span className="text-xs text-gray-400 font-medium">{item.date}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 truncate font-display">{item.title}</h3>
          <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden">{item.description}</p>
          <div className="text-[#B88A44] font-semibold text-sm flex items-center group-hover:underline">
            Ver detalles <ArrowRight className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
});

export default function AvisosClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tiempoParam = searchParams.get(AVISOS_TIME_PARAM);
  const anioParam = searchParams.get(AVISOS_ANIO_PARAM);
  const mesParam = searchParams.get(AVISOS_MES_PARAM);
  const activeTimePill = slugToTimeLabel(tiempoParam);

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [savedAvisos, setSavedAvisos] = useState<string[]>([]);
  const [recommendedAvisos, setRecommendedAvisos] = useState<(typeof recentAnnouncements)[number][]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();

  const timeFilterState = useMemo(
    () => parseTimeFilterFromParams(tiempoParam, anioParam, mesParam, new Date()),
    [tiempoParam, anioParam, mesParam]
  );

  useEffect(() => {
    const refresh = () => setSavedAvisos(loadSavedAnnouncementTitles());
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_ANNOUNCEMENTS_STORAGE_KEY || e.key === null) refresh();
    };
    window.addEventListener(SAVED_ANNOUNCEMENTS_CHANGED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_ANNOUNCEMENTS_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!authLoaded || isSignedIn !== true) return;
    const filterKey = `${activeFilter}:${timeFilterState.kind}:${timeFilterState.periodYear}:${timeFilterState.periodMonth}`;
    void grantEngagementPoints({
      action: 'announcement_read',
      dedupeKey: `avisos-search:${filterKey}`,
      isSignedIn: true,
    });
  }, [authLoaded, isSignedIn, activeFilter, timeFilterState]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/content-recommendations?type=avisos&limit=${RECOMMENDED_AVISOS_FETCH_LIMIT}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; recommendations?: AvisoRecommendation[] };
        if (!data.ok || !Array.isArray(data.recommendations)) return;
        const bySlug = new Map(recentAnnouncements.map((a) => [slugify(a.title), a]));
        const mapped = data.recommendations
          .map((rec) => bySlug.get(rec.slug))
          .filter((x): x is (typeof recentAnnouncements)[number] => Boolean(x));
        if (!cancelled) setRecommendedAvisos(mapped.slice(0, RECOMMENDED_AVISOS_FETCH_LIMIT));
      } catch {
        // keep UX stable
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [tiempoParam, anioParam, mesParam]);

  const parsedAnnouncements = useMemo(
    () =>
      recentAnnouncements.map((announcement) => ({
        announcement,
        dateObj: startOfDay(parseAnnouncementDate(announcement.date)),
      })),
    []
  );

  const yearBounds = useMemo(() => {
    let minY = new Date().getFullYear();
    let maxY = minY;
    for (const a of parsedAnnouncements) {
      const y = a.dateObj.getFullYear();
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const cy = new Date().getFullYear();
    return {
      minY: Math.min(minY, cy - 1),
      maxY: Math.max(maxY, cy + 1),
    };
  }, [parsedAnnouncements]);

  const selectYear = timeFilterState.periodYear;
  const selectMonth = timeFilterState.periodMonth;

  const applyPeriodo = useCallback((anio: number, mes: number) => {
    router.replace(buildPeriodoHref(anio, mes), { scroll: false });
  }, [router]);

  const handleFilterClick = useCallback((filter: string) => {
    setActiveFilter(filter);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const toggleSave = useCallback((e: React.MouseEvent, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedAvisos(prev => {
      const alreadySaved = prev.includes(title);
      if (
        !ensureClerkSignedInForFavoriteAdd(
          authLoaded,
          isSignedIn === true,
          redirectToSignIn,
          alreadySaved
        )
      ) {
        return prev;
      }
      const next = alreadySaved ? prev.filter(t => t !== title) : [...prev, title];
      persistSavedAnnouncementTitles(next);
      return next;
    });
  }, [authLoaded, isSignedIn, redirectToSignIn]);

  const handleShare = useCallback(async (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/avisos/${slugify(title)}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Aviso: ${title}`, url }); } catch (err) { }
    } else {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekOptions = { weekStartsOn: 1 as const };
    const weekInterval = {
      start: startOfDay(startOfWeek(now, weekOptions)),
      end: endOfWeek(now, weekOptions),
    };
    const { kind, periodYear, periodMonth } = timeFilterState;

    return parsedAnnouncements
      .filter(({ announcement: a, dateObj: announcementDate }) => {
      let categoryMatch = true;
      if (activeFilter !== 'Todos') {
        if (activeFilter === 'Eventos') categoryMatch = a.category === 'Evento';
        else categoryMatch = a.category === activeFilter;
      }
      if (!categoryMatch) return false;

      if (kind === 'todos') return true;

      if (kind === 'hoy') {
        return isSameDay(announcementDate, todayStart);
      }

      if (kind === 'semana') {
        return isWithinInterval(announcementDate, weekInterval);
      }

      if (kind === 'este-mes') {
        return isSameMonth(announcementDate, now);
      }

      if (kind === 'periodo') {
        if (announcementDate.getFullYear() !== periodYear) return false;
        if (periodMonth === 0) return true;
        return announcementDate.getMonth() === periodMonth - 1;
      }

      return true;
      })
      .map(({ announcement }) => announcement);
  }, [activeFilter, timeFilterState, parsedAnnouncements]);

  const visibleAnnouncements = filteredAnnouncements.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAnnouncements.length;
  const savedAvisosSet = useMemo(() => new Set(savedAvisos), [savedAvisos]);

  const timeBtnClass = (active: boolean) =>
    `px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 inline-flex items-center justify-center ${
      active ? 'bg-white text-[#B88A44] shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <>
      <div className="bg-[#F9FAFB] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-display">Avisos</h1>
            <p className="mt-3 text-lg text-gray-600">Mantente informado sobre las actividades de nuestra comunidad cristiana en Nayarit.</p>
          </header>

          <section className="mb-16">
            <div className="flex items-center mb-6">
              <Bell className="h-6 w-6 text-[#B88A44] mr-3" />
              <h2 className="text-2xl font-bold text-gray-700 font-display">Aviso Destacado</h2>
            </div>
            <Link href={`/avisos/${slugify(featuredAnnouncement.title)}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden md:flex hover:shadow-xl transition-shadow duration-300">
              <div className="md:w-1/2 relative">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <div role="button" onClick={(e) => toggleSave(e, featuredAnnouncement.title)} className="p-2 bg-white/90 rounded-full shadow-sm backdrop-blur-sm cursor-pointer transition-colors">
                    <Bookmark className={`w-5 h-5 transition-colors ${savedAvisosSet.has(featuredAnnouncement.title) ? 'text-[#B88A44] fill-[#B88A44]' : 'text-gray-700 fill-none'}`} />
                  </div>
                  <div role="button" onClick={(e) => handleShare(e, featuredAnnouncement.title)} className="p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 hover:text-[#B88A44] transition-colors shadow-sm backdrop-blur-sm cursor-pointer">
                    <Share2 className="w-5 h-5" />
                  </div>
                </div>
                <Image
                  src={featuredAnnouncement.imageUrl}
                  alt={featuredAnnouncement.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <MemoCategoryTag category={featuredAnnouncement.category} />
                  <span className="text-sm text-gray-500 font-medium">{featuredAnnouncement.date}</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4 font-display">{featuredAnnouncement.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{featuredAnnouncement.description}</p>
                <div className="flex items-center text-gray-500 text-sm mb-8">
                  <MapPin className="h-4 w-4 mr-2" /><span>{featuredAnnouncement.location}</span>
                  <Calendar className="h-4 w-4 mr-2 ml-6" /><span>{featuredAnnouncement.time}</span>
                </div>
                <div className="self-start text-[#B88A44] font-bold py-3 px-8 rounded-full">Ver detalles</div>
              </div>
            </Link>
          </section>

          {displayRecommendedAvisos.length > 0 ? (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-700 text-center md:text-left mb-6 font-display">
                Recomendado para ti
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {displayRecommendedAvisos.map((item) => (
                  <AnnouncementCard
                    key={`recommended-${item.title}-${item.date}`}
                    item={item}
                    isSaved={savedAvisosSet.has(item.title)}
                    onToggleSave={toggleSave}
                    onShare={handleShare}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="space-y-6 mb-12">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeFilter === filter ? 'bg-[#B88A44] text-white shadow-md transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtrar por tiempo:</span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-xl gap-0.5">
                  {timeFilters.map(tFilter => (
                    <Link
                      key={tFilter}
                      href={timeLabelToHref(tFilter)}
                      scroll={false}
                      className={timeBtnClass(activeTimePill === tFilter)}
                    >
                      {tFilter}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl pl-2 pr-1">
                  <label htmlFor="avisos-filtro-anio" className="sr-only">Año</label>
                  <select
                    id="avisos-filtro-anio"
                    value={selectYear}
                    onChange={e => {
                      const y = parseInt(e.target.value, 10);
                      applyPeriodo(y, selectMonth);
                    }}
                    className="rounded-lg border-0 bg-white py-1.5 pl-2 pr-7 text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-[#B88A44]/30 cursor-pointer max-w-[5.5rem]"
                  >
                    {Array.from(
                      { length: yearBounds.maxY - yearBounds.minY + 1 },
                      (_, i) => yearBounds.minY + i
                    ).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <label htmlFor="avisos-filtro-mes" className="sr-only">Mes o todo el año</label>
                  <select
                    id="avisos-filtro-mes"
                    value={selectMonth}
                    onChange={e => {
                      const m = parseInt(e.target.value, 10);
                      applyPeriodo(selectYear, m);
                    }}
                    className="rounded-lg border-0 bg-white py-1.5 pl-2 pr-8 text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-[#B88A44]/30 cursor-pointer min-w-[7.5rem] sm:min-w-[9rem]"
                  >
                    <option value={0}>Todo el año</option>
                    {SPANISH_MONTHS.map((name, idx) => (
                      <option key={name} value={idx + 1}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-700 text-center md:text-left mb-8 font-display">Anuncios Recientes</h2>
            {visibleAnnouncements.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                No hay avisos que coincidan con la categoría o el período seleccionado.
              </p>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {visibleAnnouncements.map(item => (
                <AnnouncementCard
                  key={`${item.title}-${item.date}`}
                  item={item}
                  isSaved={savedAvisosSet.has(item.title)}
                  onToggleSave={toggleSave}
                  onShare={handleShare}
                />
              ))}
            </div>
            )}
          </section>

          {hasMore && (
            <div className="text-center mt-16">
              <button
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm"
              >
                Cargar avisos anteriores
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
