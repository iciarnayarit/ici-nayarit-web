'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Star, Download, Film, FileText, Wrench, Package, ArrowRight, BookOpen, DownloadCloud, ExternalLink, Scissors, Headphones, Mail, Bookmark, Share2 } from 'lucide-react';
import Footer from '@/app/components/footer';
import Link from 'next/link';
import Image from 'next/image';
import { resourceItems, slugify } from '@/app/lib/resources-data';
import {
  loadSavedResourceTitles,
  persistSavedResourceTitles,
  SAVED_RESOURCES_CHANGED_EVENT,
  SAVED_RESOURCES_STORAGE_KEY,
} from '@/lib/saved-resources';
import { useAuth, useClerk } from '@clerk/nextjs';
import { ensureClerkSignedInForFavoriteAdd } from '@/lib/require-clerk-sign-in';
import { grantEngagementPoints } from '@/lib/engagement-points';
import { toVisualLabel } from '@/lib/visual-labels';

const filters = [
  { label: 'Todos', icon: Package },
  { label: 'Multimedia', icon: Film },
  { label: 'Documentos', icon: FileText },
  { label: 'Herramientas Bíblicas', icon: Wrench },
  { label: 'Descargas', icon: Download },
];

const ITEMS_PER_PAGE = 8;
/** Máximo permitido por `/api/content-recommendations` (clamp servidor). */
const RECOMMENDED_RECURSOS_FETCH_LIMIT = 12;
const RECOMMENDED_RECURSOS_DISPLAY = 4;

type ResourceCardProps = {
  item: (typeof resourceItems)[number];
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, title: string) => void;
  onShare: (e: React.MouseEvent, title: string) => Promise<void>;
};

type ResourceRecommendation = {
  type: 'recurso';
  slug: string;
  title: string;
  category: string;
  badge: string | null;
  link: string;
  score: number;
  reason: string;
};

const ResourceCard = memo(function ResourceCard({ item, isSaved, onToggleSave, onShare }: ResourceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col relative">
      <div className="absolute top-2 left-2 z-20 flex gap-2">
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

      <Link href={`/recursos/${slugify(item.title)}`} className="flex flex-col h-full">
        <div className="relative h-48">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            fetchPriority="low"
            className="w-full h-full object-cover"
          />
          {item.badge && (
            <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded ${item.badge === 'PDF' ? 'bg-[#B88A44] text-white' : 'bg-black/60 text-white'}`}>
              {toVisualLabel(item.badge)}
            </span>
          )}
        </div>
        <div className="p-5 flex-grow flex flex-col">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{toVisualLabel(item.category)}</p>
          <h3 className="text-lg font-bold text-gray-800 mb-2 font-display">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-4 flex-grow">{item.description}</p>
          <div className="w-full mt-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors text-sm">
            <item.actionIcon className="w-4 h-4 mr-2" />
            {item.actionLabel}
          </div>
        </div>
      </Link>
    </div>
  );
});

export default function RecursosPage() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [savedRecursos, setSavedRecursos] = useState<string[]>([]);
  const [recommendedResources, setRecommendedResources] = useState<(typeof resourceItems)[number][]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();

  useEffect(() => {
    const refresh = () => setSavedRecursos(loadSavedResourceTitles());
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_RESOURCES_STORAGE_KEY || e.key === null) refresh();
    };
    window.addEventListener(SAVED_RESOURCES_CHANGED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_RESOURCES_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    void grantEngagementPoints({
      action: 'resource_read',
      dedupeKey: 'recursos-read',
      isSignedIn: authLoaded && isSignedIn === true,
    });
  }, [authLoaded, isSignedIn]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/content-recommendations?type=recursos&limit=${RECOMMENDED_RECURSOS_FETCH_LIMIT}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; recommendations?: ResourceRecommendation[] };
        if (!data.ok || !Array.isArray(data.recommendations)) return;
        const bySlug = new Map(resourceItems.map((r) => [slugify(r.title), r]));
        const mapped = data.recommendations
          .map((rec) => bySlug.get(rec.slug))
          .filter((x): x is (typeof resourceItems)[number] => Boolean(x));
        if (!cancelled) setRecommendedResources(mapped.slice(0, RECOMMENDED_RECURSOS_FETCH_LIMIT));
      } catch {
        // keep UX stable
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSave = useCallback((e: React.MouseEvent, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedRecursos(prev => {
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
      persistSavedResourceTitles(next);
      return next;
    });
  }, [authLoaded, isSignedIn, redirectToSignIn]);

  const handleShare = useCallback(async (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/recursos`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Recurso: ${title}`, url });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  }, []);

  const handleFilterClick = useCallback((filterLabel: string) => {
    setActiveFilter(filterLabel);
    setVisibleCount(ITEMS_PER_PAGE); // reset pagination on filter change
  }, []);

  const handleResourceDownload = (resourceKey: string) => {
    void grantEngagementPoints({
      action: 'resource_download',
      dedupeKey: `resource-download:${resourceKey}`,
      isSignedIn: authLoaded && isSignedIn === true,
    });
  };

  const filteredResources = useMemo(() => {
    if (activeFilter === 'Todos') return resourceItems;
    const keywordByFilter: Record<string, string> = {
      Multimedia: 'MULTIMEDIA',
      Documentos: 'DOCUMENTO',
      'Herramientas Bíblicas': 'HERRAMIENTA',
      Descargas: 'DESCARGA',
    };
    const keyword = keywordByFilter[activeFilter] ?? '';
    return resourceItems.filter((item) => item.category.toUpperCase().includes(keyword));
  }, [activeFilter]);

  const visibleResources = useMemo(
    () => filteredResources.slice(0, visibleCount),
    [filteredResources, visibleCount]
  );
  const hasMore = visibleCount < filteredResources.length;
  const savedRecursosSet = useMemo(() => new Set(savedRecursos), [savedRecursos]);

  const displayRecommendedResources = useMemo(
    () =>
      recommendedResources
        .filter((r) => !savedRecursosSet.has(r.title))
        .slice(0, RECOMMENDED_RECURSOS_DISPLAY),
    [recommendedResources, savedRecursosSet]
  );

  return (
    <>
      <div className="bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <section className="rounded-2xl p-8 md:p-12 mb-12 text-white relative overflow-hidden">
            <Image
              src="https://i.imgur.com/YhJc6R0.jpeg"
              alt="Recurso destacado"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-slate-800 opacity-80"></div>
            <div className="relative z-10 md:flex items-center">
                <div className="md:w-full">
                    <div className="flex items-center text-[#E5C573] text-sm font-semibold mb-3">
                        <Star className="w-5 h-5 mr-2" />
                        <span>RECURSO DESTACADO</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                        Plan de Predicación <span className="text-[#E5C573]">Anual 2026</span>
                    </h1>
                    <p className="text-lg text-gray-200 mb-8 max-w-2xl">
                        Calendario oficial y ejes temáticos para la exposición de la Palabra durante el año 2026. Una guía indispensable para la unidad doctrinal en todas nuestras congregaciones.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a 
                            href="/recursos/Plan de predicación - 2026.pdf" 
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleResourceDownload('plan-predicacion-2026')}
                            className="bg-[#B88A44] hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-colors"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Descargar PDF
                        </a>
                        <Link href={`/recursos/${slugify("Plan de Predicación 2026")}`} className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-block">
                            Ver Detalles
                        </Link>
                        <button onClick={(e) => toggleSave(e, "Plan de Predicación 2026")} className="bg-white/20 hover:bg-white/20 p-3 rounded-lg transition-none flex items-center justify-center">
                            <Bookmark className={`w-5 h-5 transition-colors ${savedRecursosSet.has("Plan de Predicación 2026") ? 'text-[#B88A44] fill-[#B88A44]' : 'text-white fill-none'}`} />
                        </button>
                        <button onClick={(e) => handleShare(e, "Plan de Predicación 2026")} className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-colors flex items-center justify-center">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {filters.map((filter) => (
                <button 
                    key={filter.label}
                    onClick={() => handleFilterClick(filter.label)}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center transition-colors ${activeFilter === filter.label ? 'bg-[#B88A44] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    <filter.icon className="w-4 h-4 mr-2" />
                    {filter.label}
                </button>
            ))}
          </div>

          {displayRecommendedResources.length > 0 ? (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-700 text-center md:text-left mb-8 font-display">
                Recomendado para ti
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayRecommendedResources.map((item, index) => (
                  <ResourceCard
                    key={`recommended-${item.title}-${index}`}
                    item={item}
                    isSaved={savedRecursosSet.has(item.title)}
                    onToggleSave={toggleSave}
                    onShare={handleShare}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {visibleResources.map((item, index) => (
              <ResourceCard
                key={`${item.title}-${index}`}
                item={item}
                isSaved={savedRecursosSet.has(item.title)}
                onToggleSave={toggleSave}
                onShare={handleShare}
              />
            ))}
          </section>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm"
              >
                Cargar más recursos
              </button>
            </div>
          )}

          {/*
            CTA de suscripción al final de /recursos (tarjeta centrada con sombra).
            Objetivo: captar correos de quien no encontró lo que buscaba y quiere avisos
            cuando se publiquen manuales, sermones o herramientas nuevas.
            Layout: en móvil el botón va debajo del campo; en sm+ quedan en fila (flex-row).
            Pendiente: enlazar el formulario a tu servicio de lista (API route, acción de servidor, etc.);
            hoy no hay onSubmit ni validación de envío.
          */}
          <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-3 font-display">¿No encuentras lo que buscas?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Suscríbete para recibir notificaciones cuando subamos nuevos manuales, sermones o herramientas.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B88A44] focus:outline-none"
                />
              </div>
              <button type="submit" className="bg-[#1A2530] hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Suscribirme
              </button>
            </form>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}