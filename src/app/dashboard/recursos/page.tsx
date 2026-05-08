'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import { MountOnView } from '@/app/components/mount-on-view';
import {
  loadSavedResourceTitles,
  SAVED_RESOURCES_CHANGED_EVENT,
  SAVED_RESOURCES_STORAGE_KEY,
} from '@/lib/saved-resources';
import type { FiltroRecursos } from '@/app/dashboard/recursos/recursos-saved-grid';

const RecursosRecommendationsPanel = dynamic(() => import('./recursos-recommendations-panel'), {
  loading: () => (
    <div className="mb-6 min-h-[160px] animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm" />
  ),
});

const RecursosSavedGrid = dynamic(() => import('./recursos-saved-grid'), {
  loading: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={`recursos-grid-skel-${i}`}
          className="min-h-[220px] animate-pulse rounded-[24px] border border-gray-100 bg-white shadow-sm"
        />
      ))}
    </div>
  ),
});

const filtros: { id: FiltroRecursos; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'audio', label: 'Audio' },
  { id: 'guia', label: 'Guías' },
];

export default function RecursosGuardadosPage() {
  const [savedTitles, setSavedTitles] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<FiltroRecursos>('todos');

  const refresh = useCallback(() => {
    setSavedTitles(loadSavedResourceTitles());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SAVED_RESOURCES_STORAGE_KEY) refresh();
    };
    window.addEventListener(SAVED_RESOURCES_CHANGED_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SAVED_RESOURCES_CHANGED_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return (
    <div className="relative min-h-screen w-full bg-[#F4F7F6] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 md:px-10">
        <DashboardBibliaReadingToolbar />
        <div className="mb-8">
          <nav className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="font-medium text-gray-400">PORTAL</span>
            <span className="text-gray-300">/</span>
            <span className="text-blue-600">RECURSOS</span>
          </nav>
          <h1 className="mb-4 font-display text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl md:text-4xl">
            Recursos guardados
          </h1>

          <div
            className="-mx-1 flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-x-visible [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Filtrar por tipo de recurso"
          >
            {filtros.map(({ id, label }) => {
              const activo = filtro === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => setFiltro(id)}
                  className={`shrink-0 touch-manipulation rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-colors sm:px-5 ${
                    activo
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 bg-white text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {savedTitles.length === 0 ? (
          <div className="mb-8 rounded-3xl border border-dashed border-gray-200 bg-white/80 p-8 shadow-sm">
            <p className="text-sm text-gray-600">
              Aún no has guardado recursos. En la página{' '}
              <Link href="/recursos" className="font-semibold text-blue-600 underline hover:text-blue-800">
                Recursos
              </Link>
              , pulsa el icono del marcador para añadirlos aquí.
            </p>
          </div>
        ) : null}

        <MountOnView
          fallback={
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={`recursos-grid-view-skel-${i}`}
                  className="min-h-[220px] animate-pulse rounded-[24px] border border-gray-100 bg-white shadow-sm"
                />
              ))}
            </div>
          }
        >
          <RecursosSavedGrid savedTitles={savedTitles} filtro={filtro} onSavedTitlesChange={setSavedTitles} />
        </MountOnView>

        <MountOnView
          fallback={
            <div className="mb-6 min-h-[160px] animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm" />
          }
        >
          <RecursosRecommendationsPanel />
        </MountOnView>
      </div>
    </div>
  );
}
