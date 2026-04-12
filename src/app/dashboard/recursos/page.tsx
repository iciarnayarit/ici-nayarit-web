'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import { FileText, Music, Play, Download, Plus } from 'lucide-react';
import { resourceItems, slugify } from '@/app/lib/resources-data';
import {
  loadSavedResourceTitles,
  persistSavedResourceTitles,
  SAVED_RESOURCES_CHANGED_EVENT,
  SAVED_RESOURCES_STORAGE_KEY,
} from '@/lib/saved-resources';

type CatalogItem = (typeof resourceItems)[number];

function tipoVisual(item: CatalogItem): 'pdf' | 'audio' | 'text' {
  if (item.badge === 'PDF') return 'pdf';
  const c = item.category.toUpperCase();
  if (c.includes('MULTIMEDIA') || c.includes('AUDIO')) return 'audio';
  return 'text';
}

function esGuiaCatalogo(item: CatalogItem): boolean {
  const c = item.category.toUpperCase();
  return c.includes('PLAN') || c.includes('EVANGELISMO') || /guía/i.test(item.title);
}

type FiltroRecursos = 'todos' | 'pdf' | 'audio' | 'guia';

const filtros: { id: FiltroRecursos; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'audio', label: 'Audio' },
  { id: 'guia', label: 'Guías' },
];

function coincideFiltro(item: CatalogItem, filtro: FiltroRecursos): boolean {
  if (filtro === 'todos') return true;
  if (filtro === 'pdf') return tipoVisual(item) === 'pdf';
  if (filtro === 'audio') return tipoVisual(item) === 'audio';
  if (filtro === 'guia') return esGuiaCatalogo(item);
  return true;
}

function subtituloTarjeta(item: CatalogItem): string {
  const tipo =
    item.badge === 'PDF'
      ? 'Documento PDF'
      : tipoVisual(item) === 'audio'
        ? 'Archivo de audio'
        : item.badge
          ? item.badge
          : 'Recurso';
  return `${tipo} • ${item.category}`;
}

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

  const guardados = useMemo(() => {
    const byTitle = new Map(resourceItems.map(r => [r.title, r]));
    return savedTitles.map(t => byTitle.get(t)).filter((r): r is CatalogItem => r != null);
  }, [savedTitles]);

  const visibles = useMemo(() => guardados.filter(r => coincideFiltro(r, filtro)), [guardados, filtro]);

  const quitar = (title: string) => {
    const next = savedTitles.filter(t => t !== title);
    persistSavedResourceTitles(next);
    setSavedTitles(next);
  };

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibles.length === 0 && savedTitles.length > 0 ? (
            <p className="col-span-full text-center text-sm text-gray-500">
              No hay recursos guardados en esta categoría.
            </p>
          ) : null}

          {visibles.map(recurso => {
            const tv = tipoVisual(recurso);
            return (
              <div
                key={recurso.title}
                className="flex flex-col rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-6 flex items-start justify-between">
                  {tv === 'pdf' && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-red-50">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                  {tv === 'audio' && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-blue-50">
                      <Music className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                  {tv === 'text' && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-emerald-50">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                  )}
                  <span className="mt-1 max-w-[40%] text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {recurso.badge || '—'}
                  </span>
                </div>

                <div className="mb-6 flex-1">
                  <h3 className="mb-2 text-[15px] font-bold leading-snug text-gray-900">{recurso.title}</h3>
                  <p className="text-xs font-medium tracking-wide text-gray-400">{subtituloTarjeta(recurso)}</p>
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link
                      href={`/recursos/${slugify(recurso.title)}`}
                      className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-800"
                    >
                      Ver detalles
                    </Link>
                    <button
                      type="button"
                      onClick={() => quitar(recurso.title)}
                      className="text-xs font-bold text-red-500 transition-colors hover:text-red-700"
                    >
                      Quitar
                    </button>
                  </div>

                  <a
                    href={recurso.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      tv === 'audio'
                        ? 'ml-auto flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center self-end rounded-full bg-blue-600 text-white shadow-md transition-all hover:scale-105 hover:bg-blue-700 sm:ml-0 sm:h-10 sm:w-10 sm:self-auto'
                        : 'ml-auto flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center self-end rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:ml-0 sm:h-10 sm:w-10 sm:self-auto'
                    }
                    aria-label={recurso.actionLabel}
                  >
                    {tv === 'audio' ? (
                      <Play className="ml-0.5 h-4 w-4 fill-white" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </a>
                </div>
              </div>
            );
          })}

          <Link
            href="/recursos"
            className="group flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <div className="mb-4 text-gray-400 transition-transform group-hover:scale-110">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="mb-1.5 text-sm font-bold text-gray-800">Añadir recurso</h3>
            <p className="text-[11px] font-medium tracking-wide text-gray-400">
              Explora el catálogo y guarda los que necesites
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
