'use client';

import Link from 'next/link';
import { FileText, Music, Play, Download, Plus } from 'lucide-react';
import { resourceItems, slugify } from '@/app/lib/resources-data';
import { toVisualLabel } from '@/lib/visual-labels';
import {
  persistSavedResourceTitles,
} from '@/lib/saved-resources';

type CatalogItem = (typeof resourceItems)[number];

export type FiltroRecursos = 'todos' | 'pdf' | 'audio' | 'guia';

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
          ? toVisualLabel(item.badge)
          : 'Recurso';
  return `${tipo} • ${toVisualLabel(item.category)}`;
}

type Props = {
  savedTitles: string[];
  filtro: FiltroRecursos;
  onSavedTitlesChange: (next: string[]) => void;
};

export default function RecursosSavedGrid({ savedTitles, filtro, onSavedTitlesChange }: Props) {
  const byTitle = new Map(resourceItems.map((r) => [r.title, r]));
  const guardados = savedTitles.map((t) => byTitle.get(t)).filter((r): r is CatalogItem => r != null);
  const visibles = guardados.filter((r) => coincideFiltro(r, filtro));

  const quitar = (title: string) => {
    const next = savedTitles.filter((t) => t !== title);
    persistSavedResourceTitles(next);
    onSavedTitlesChange(next);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {visibles.length === 0 && savedTitles.length > 0 ? (
        <p className="col-span-full text-center text-sm text-gray-500">
          No hay recursos guardados en esta categoría.
        </p>
      ) : null}

      {visibles.map((recurso) => {
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
                {recurso.badge ? toVisualLabel(recurso.badge) : '—'}
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
  );
}
