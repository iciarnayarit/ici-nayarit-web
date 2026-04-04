'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { Heart, Navigation, Bookmark, Phone, Share2, Clock, Map, Plus, Minus, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/app/hooks/use-toast';
import { getTempleBySlug } from '@/lib/temple-directory';
import {
  loadSavedTempleSlugs,
  SAVED_TEMPLES_CHANGED_EVENT,
  SAVED_TEMPLES_STORAGE_KEY,
  toggleSavedTempleSlug,
} from '@/lib/saved-temples';
import { useAuth, useClerk } from '@clerk/nextjs';
import { ensureClerkSignedInForFavoriteAdd } from '@/lib/require-clerk-sign-in';

export default function TemplosDashboardDetailPage() {
  const params = useParams();
  const slugParam = params?.slug;
  const slug = typeof slugParam === 'string' ? slugParam : Array.isArray(slugParam) ? slugParam[0] : '';
  const temple = slug ? getTempleBySlug(slug) : undefined;
  const { toast } = useToast();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();

  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);

  const refreshSaved = useCallback(() => {
    setSavedSlugs(loadSavedTempleSlugs());
  }, []);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  useEffect(() => {
    const onChange = () => refreshSaved();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_TEMPLES_STORAGE_KEY) refreshSaved();
    };
    window.addEventListener(SAVED_TEMPLES_CHANGED_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_TEMPLES_CHANGED_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshSaved]);

  if (!temple) {
    notFound();
  }

  const isSaved = savedSlugs.includes(temple.slug);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(temple.location)}`;

  const handleToggleSave = () => {
    const wasSaved = savedSlugs.includes(temple.slug);
    if (
      !ensureClerkSignedInForFavoriteAdd(
        authLoaded,
        isSignedIn === true,
        redirectToSignIn,
        wasSaved
      )
    ) {
      return;
    }
    const next = toggleSavedTempleSlug(temple.slug);
    setSavedSlugs(next);
    toast({
      title: wasSaved ? 'Templo quitado' : 'Templo guardado',
      description: wasSaved
        ? `${temple.name} ya no está en tus guardados.`
        : `${temple.name} aparece en /dashboard/templos.`,
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8F9FA] pb-16 font-sans">
      <header className="sticky top-0 z-20 mb-6 hidden w-full max-w-7xl items-center border-b border-gray-200/50 bg-white px-6 py-5 shadow-sm md:mx-auto md:flex md:px-10">
        <div className="flex items-center gap-4 text-sm font-bold">
          <Link href="/" className="text-gray-900 transition-colors hover:text-blue-600">
            ICIAR
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-gray-500">Dashboard</span>
          <Link href="/dashboard/templos" className="ml-4 font-bold tracking-wide text-blue-600">
            Templos
          </Link>
        </div>
      </header>

      <div className="mx-auto mt-4 max-w-7xl space-y-8 px-6 md:mt-0 md:px-10">
        <div className="group relative h-[400px] w-full overflow-hidden rounded-[24px] shadow-md md:rounded-[32px]">
          <Image
            src={temple.image}
            alt={temple.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent p-8 md:p-12">
            {temple.featured ? (
              <span className="mb-4 w-fit rounded-full bg-blue-600 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm sm:text-[10px]">
                Destacado
              </span>
            ) : null}
            <div className="flex w-full items-end justify-between">
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                {temple.name}
              </h1>
              <button
                type="button"
                onClick={handleToggleSave}
                className="group/heart flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20"
                aria-label={isSaved ? 'Quitar de guardados' : 'Guardar templo'}
              >
                <Heart
                  className={`h-5 w-5 text-white transition-all group-hover/heart:scale-110 ${isSaved ? 'fill-white' : 'fill-white/80 group-hover/heart:fill-white'}`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="flex flex-col rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 sm:text-xs">
                  Dirección
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-600 sm:text-xs">
                  <div className={`h-1.5 w-1.5 rounded-full ${temple.statusColor}`} />
                  {temple.status}
                </span>
              </div>
              <h2 className="mb-8 max-w-2xl text-lg font-bold leading-relaxed text-gray-900 md:text-xl">
                {temple.location}
              </h2>

              <div className="mt-auto flex flex-col items-center gap-4 sm:flex-row">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-blue-700 sm:flex-1 md:py-3.5"
                >
                  <Navigation className="h-4 w-4 shrink-0 fill-white" />
                  <span>Cómo llegar</span>
                </a>
                <button
                  type="button"
                  onClick={handleToggleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 sm:flex-1 md:py-3.5"
                >
                  <Bookmark className={`h-4 w-4 shrink-0 ${isSaved ? 'fill-[#B88A44] text-[#B88A44]' : 'text-gray-500'}`} />
                  <span className="truncate">{isSaved ? 'Quitar de mis templos' : 'Guardar en mis templos'}</span>
                </button>
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <button
                    type="button"
                    className="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 sm:flex-none sm:w-12"
                    aria-label="Teléfono (próximamente)"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(temple.name + ' ' + temple.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 sm:flex-none sm:w-12"
                    aria-label="Compartir en mapa"
                  >
                    <Share2 className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700 sm:text-xs">
                  Horarios y cultos
                </h3>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="p-6 text-sm leading-relaxed text-gray-600">
                Los horarios detallados pueden variar. Confirma con la sede o en los avisos oficiales de la congregación.
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[500px] flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-gray-200/50 shadow-sm">
            <div className="z-10 flex w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700 sm:text-xs">Ubicación</h3>
              <Map className="h-4 w-4 text-gray-400" />
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center bg-gray-200 p-8">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto z-[1] mb-4 rounded-xl bg-white px-4 py-2 text-xs font-bold text-blue-600 shadow-sm ring-1 ring-gray-200 hover:bg-blue-50"
              >
                Abrir en Google Maps
              </a>
              <div className="pointer-events-none relative aspect-[9/18] w-full max-w-[240px] overflow-hidden rounded-[32px] border-[6px] border-white shadow-xl md:rounded-[40px] md:border-[10px]">
                <div className="absolute inset-0 bg-[#E5E9F0]">
                  <div className="absolute right-0 top-0 h-full w-full skew-x-12 transform">
                    <div className="relative left-10 ml-12 h-full w-4 origin-top rotate-45 transform bg-white/70" />
                    <div className="absolute left-24 ml-24 h-full w-2 origin-top rotate-45 transform bg-white/70" />
                    <div className="absolute bottom-32 h-8 w-full -rotate-12 bg-white/70" />
                    <div className="absolute bottom-12 h-3 w-full rotate-12 bg-white/70" />
                  </div>
                  <div className="absolute bottom-16 left-4 h-24 w-32 rounded-2xl bg-green-100/50" />
                </div>
                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center fill-blue-600 text-blue-600 md:h-10 md:w-10">
                    <MapPin className="h-full w-full" fill="currentColor" stroke="white" strokeWidth={1} />
                  </div>
                  <div className="-mt-1 h-1 w-3 rounded-[100%] bg-black/20 blur-[1px]" />
                  <div className="-z-10 absolute h-12 w-12 scale-150 animate-ping rounded-full bg-blue-500/30" />
                </div>
                <div className="absolute left-1/2 top-0 z-20 h-4 w-1/3 -translate-x-1/2 transform rounded-b-xl bg-white shadow-sm">
                  <div className="absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 transform rounded-full bg-gray-200" />
                </div>
              </div>

              <div className="pointer-events-auto absolute bottom-6 right-6 flex flex-row overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center border-r border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  aria-label="Acercar (decorativo)"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  aria-label="Alejar (decorativo)"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-gray-900">Galería</h2>
              <p className="text-xs font-medium text-gray-500">Vistas del templo y sus alrededores.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="relative h-48 w-full overflow-hidden md:h-64">
                <Image
                  src={temple.image}
                  alt={`${temple.name} — vista`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="border-t border-gray-50 px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 sm:text-[10px]">
                  {temple.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
