'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Filter, Languages, LayoutGrid, List, Loader2, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { useToast } from '@/app/hooks/use-toast';
import {
  commentaryAuthorShortName,
  commentaryBookUiStatus,
  isNewTestamentBookId,
  type HelloAoBookEntry,
  type HelloAoBooksPayload,
} from '@/lib/helloao-commentaries';
import { cn } from '@/app/lib/utils';

type ShelfTab = 'all' | 'volume' | 'category';
type LayoutMode = 'grid' | 'list';

const PER_PAGE = 36;

function initials(name: string): string {
  return commentaryAuthorShortName(name)
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function bioTeaser(data: HelloAoBooksPayload): string {
  const { commentary, books } = data;
  if (commentary.licenseNotes?.trim()) {
    const t = commentary.licenseNotes.trim();
    return t.length > 300 ? `${t.slice(0, 297)}…` : t;
  }
  const sorted = [...books].sort((a, b) => a.order - b.order);
  const intro = sorted[0]?.introduction;
  if (intro?.trim()) {
    const t = intro.replace(/\s+/g, ' ').trim();
    return t.length > 320 ? `${t.slice(0, 317)}…` : t;
  }
  return `${commentary.englishName}: comentario digital en ${commentary.languageName ?? commentary.language} con ${books.length} libros indexados (HelloAO / Free Use Bible API).`;
}

function statusLabel(s: ReturnType<typeof commentaryBookUiStatus>): string {
  if (s === 'complete') return 'Completo';
  if (s === 'in_progress') return 'En curso';
  return 'Sin comenzar';
}

function statusClass(s: ReturnType<typeof commentaryBookUiStatus>): string {
  if (s === 'complete') return 'font-semibold text-emerald-600';
  if (s === 'in_progress') return 'font-semibold text-amber-600';
  return 'rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500';
}

function BookRows({
  books,
  layout,
  getCanonicalIndex,
  commentaryId,
  translatedTitles,
}: {
  books: HelloAoBookEntry[];
  layout: LayoutMode;
  getCanonicalIndex: (b: HelloAoBookEntry) => number;
  commentaryId: string;
  translatedTitles?: Record<string, string> | null;
}) {
  if (books.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">Sin libros en esta página.</p>;
  }
  return (
    <ul className="divide-y divide-gray-100">
      {books.map(b => {
        const st = commentaryBookUiStatus(b);
        const idx = String(getCanonicalIndex(b)).padStart(2, '0');
        const startCh = b.firstChapterNumber ?? 1;
        const title = translatedTitles?.[b.id]?.trim() || b.commonName || b.name;
        return (
          <li key={b.id}>
            <Link
              href={`/comentarios/${commentaryId}/${b.id}/${startCh}`}
              className={cn(
                'flex items-center gap-3 py-3.5 transition-colors hover:bg-[#B88A44]/10',
                layout === 'list' && 'sm:gap-6'
              )}
            >
              <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-gray-400">{idx}</span>
              <span className="min-w-0 flex-1 font-bold text-gray-900">{title}</span>
              <span className={cn('shrink-0 text-xs', statusClass(st))}>{statusLabel(st)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function CommentaryBooksDetail({ data }: { data: HelloAoBooksPayload }) {
  const { toast } = useToast();
  const { commentary, books } = data;
  const author = commentaryAuthorShortName(commentary.name);
  const [shelfTab, setShelfTab] = useState<ShelfTab>('all');
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [page, setPage] = useState(1);
  const [pageUiLang, setPageUiLang] = useState<'orig' | 'es'>('orig');
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [translatedTitles, setTranslatedTitles] = useState<Record<string, string> | null>(null);
  const [translatingPage, setTranslatingPage] = useState(false);

  const sorted = useMemo(() => [...books].sort((a, b) => a.order - b.order), [books]);

  const indexedPct = useMemo(() => {
    if (!sorted.length) return 0;
    const ok = sorted.filter(b => commentaryBookUiStatus(b) === 'complete').length;
    return Math.min(100, Math.round((ok / sorted.length) * 100));
  }, [sorted]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));

  useEffect(() => {
    setPage(p => Math.min(p, totalPages));
  }, [totalPages]);

  const safePage = Math.min(page, totalPages);
  const slice = useMemo(() => {
    const start = (safePage - 1) * PER_PAGE;
    return sorted.slice(start, start + PER_PAGE);
  }, [sorted, safePage]);

  const otSlice = useMemo(() => slice.filter(b => !isNewTestamentBookId(b.id)), [slice]);
  const ntSlice = useMemo(() => slice.filter(b => isNewTestamentBookId(b.id)), [slice]);

  const orderIndex = useMemo(() => {
    const m = new Map<string, number>();
    sorted.forEach((b, i) => m.set(b.id, i));
    return m;
  }, [sorted]);

  const globalIndexFor = (b: HelloAoBookEntry) => (orderIndex.get(b.id) ?? 0) + 1;

  const bioText = useMemo(() => bioTeaser(data), [data]);

  useEffect(() => {
    if (pageUiLang !== 'es') return;

    let cancelled = false;
    (async () => {
      setTranslatingPage(true);
      setTranslatedTitles(null);
      try {
        const titleSegments = slice.map(b => (b.commonName || b.name).trim() || b.name);
        const segments = [bioText, ...titleSegments];
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ segments, source: 'en', target: 'es' }),
        });
        const body = (await res.json()) as { translations?: string[]; error?: string };
        if (!res.ok) throw new Error(body.error || `Error ${res.status}`);
        if (!Array.isArray(body.translations) || body.translations.length !== segments.length) {
          throw new Error('Respuesta incompleta del servicio de traducción.');
        }
        if (cancelled) return;
        const [nextBio, ...nameParts] = body.translations;
        const byId: Record<string, string> = {};
        slice.forEach((b, i) => {
          byId[b.id] = nameParts[i] ?? (b.commonName || b.name);
        });
        setTranslatedBio(nextBio ?? bioText);
        setTranslatedTitles(byId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Intenta de nuevo más tarde.';
        toast({
          title: 'No se pudo traducir la página',
          description: msg,
          variant: 'destructive',
        });
        if (!cancelled) {
          setPageUiLang('orig');
          setTranslatedBio(null);
          setTranslatedTitles(null);
        }
      } finally {
        if (!cancelled) setTranslatingPage(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pageUiLang, bioText, slice, toast]);

  const displayedBio =
    pageUiLang === 'es' && translatedBio != null ? translatedBio : bioText;

  return (
    <div className="min-h-screen bg-[#ECEEF3] pb-28">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Migas de pan */}
        <nav className="mb-6 flex flex-wrap items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
          <Link href="/" className="hover:text-gray-800">
            Biblioteca
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" aria-hidden />
          <Link href="/comentarios" className="hover:text-gray-800">
            Comentarios
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" aria-hidden />
          <span className="max-w-[14rem] truncate text-[#B88A44]">{author}</span>
        </nav>

        {/* Tarjeta perfil */}
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-md sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div
              className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-900 text-xl font-black text-white shadow-inner sm:mx-0"
              aria-hidden
            >
              {initials(commentary.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{author}</h1>
                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="rounded-full bg-[#B88A44] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                      Colección clásica
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-800">
                      {indexedPct}% indexado
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{displayedBio}</p>
              <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 text-center sm:text-left">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Volúmenes</dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900">1</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Libros</dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900">{sorted.length}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Versículos</dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900">
                    {commentary.totalNumberOfVerses.toLocaleString('es-MX')}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-center text-[11px] text-gray-400 sm:text-left">
                Actualizado · {new Date().toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Pestañas + controles */}
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
            {(
              [
                { id: 'all' as const, label: 'Todos los libros' },
                { id: 'volume' as const, label: 'Por volumen' },
                { id: 'category' as const, label: 'Por categoría' },
              ] as const
            ).map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setShelfTab(t.id);
                  setPage(1);
                }}
                className={cn(
                  'rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-wide transition-colors',
                  shelfTab === t.id ? 'bg-[#B88A44] text-white shadow-sm' : 'text-gray-600 hover:bg-white/80'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-2 mr-1 sm:mr-2">
              {pageUiLang === 'es' && !translatingPage ? (
                <span className="hidden sm:inline text-[10px] font-medium text-gray-400">Traducción automática</span>
              ) : null}
              
              <TooltipProvider>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={translatingPage}
                          className={cn(
                            "h-9 w-9 shrink-0 rounded-lg border-gray-200 shadow-sm transition-colors",
                            pageUiLang === 'es' ? 'bg-[#B88A44] border-[#B88A44] text-white hover:bg-[#a17638]' : 'bg-white hover:bg-gray-50'
                          )}
                        >
                          {translatingPage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Languages className="h-4 w-4" />
                          )}
                          <span className="sr-only">Opciones de idioma</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Traductor</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem 
                      onClick={() => {
                        setPageUiLang('orig');
                        setTranslatedBio(null);
                        setTranslatedTitles(null);
                      }} 
                      className="cursor-pointer"
                    >
                      Ver Original (Inglés)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageUiLang('es')} className="cursor-pointer">
                      Traducir al español
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>
            </div>
            <div className="flex rounded-lg border border-gray-200 p-0.5">
              <button
                type="button"
                aria-label="Vista cuadrícula"
                className={cn(
                  'rounded-md p-2',
                  layout === 'grid' ? 'bg-[#B88A44] text-white' : 'text-gray-500 hover:bg-gray-50'
                )}
                onClick={() => setLayout('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Vista lista"
                className={cn(
                  'rounded-md p-2',
                  layout === 'list' ? 'bg-[#B88A44] text-white' : 'text-gray-500 hover:bg-gray-50'
                )}
                onClick={() => setLayout('list')}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Listas AT / NT */}
        <div
          className={cn(
            'mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8',
            layout === 'grid' ? 'lg:grid lg:grid-cols-2 lg:gap-10' : ''
          )}
        >
          {layout === 'grid' ? (
            <>
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  <BookOpen className="h-4 w-4 text-[#B88A44]" />
                  Antiguo Testamento
                </h2>
                <BookRows
                  books={otSlice}
                  layout={layout}
                  getCanonicalIndex={globalIndexFor}
                  commentaryId={commentary.id}
                  translatedTitles={pageUiLang === 'es' ? translatedTitles : null}
                />
              </div>
              <div className="mt-10 border-t border-gray-100 pt-10 lg:mt-0 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
                <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  <BookOpen className="h-4 w-4 text-[#B88A44]" />
                  Nuevo Testamento
                </h2>
                <BookRows
                  books={ntSlice}
                  layout={layout}
                  getCanonicalIndex={globalIndexFor}
                  commentaryId={commentary.id}
                  translatedTitles={pageUiLang === 'es' ? translatedTitles : null}
                />
              </div>
            </>
          ) : (
            <div className="space-y-10">
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  <BookOpen className="h-4 w-4 text-[#B88A44]" />
                  Antiguo Testamento
                </h2>
                <BookRows
                  books={otSlice}
                  layout={layout}
                  getCanonicalIndex={globalIndexFor}
                  commentaryId={commentary.id}
                  translatedTitles={pageUiLang === 'es' ? translatedTitles : null}
                />
              </div>
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  <BookOpen className="h-4 w-4 text-[#B88A44]" />
                  Nuevo Testamento
                </h2>
                <BookRows
                  books={ntSlice}
                  layout={layout}
                  getCanonicalIndex={globalIndexFor}
                  commentaryId={commentary.id}
                  translatedTitles={pageUiLang === 'es' ? translatedTitles : null}
                />
              </div>
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3 rounded-full bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          <button
            type="button"
            className="rounded-lg px-3 py-1 font-semibold text-white transition-colors hover:text-slate-300 disabled:opacity-30"
            disabled={safePage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <div className="flex flex-1 items-center gap-2 px-2">
            <span className="rounded-md bg-[#B88A44] px-2 py-0.5 text-xs font-black tabular-nums text-white">
              {String(safePage).padStart(2, '0')}
            </span>
            <div className="h-0.5 flex-1 rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-[#B88A44] transition-all"
                style={{ width: `${(safePage / totalPages) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums text-[#B88A44]/70">{String(totalPages).padStart(2, '0')}</span>
          </div>
          <button
            type="button"
            className="rounded-lg px-3 py-1 font-semibold text-[#B88A44] transition-colors hover:text-white disabled:opacity-30"
            disabled={safePage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </button>
        </div>
      </div>

      <Link
        href="/comentarios"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#B88A44] text-white shadow-lg shadow-[#B88A44]/40 transition-transform hover:scale-105 hover:bg-[#a17638]"
        aria-label="Volver al catálogo"
      >
        <Plus className="h-7 w-7 stroke-[2.5]" />
      </Link>
    </div>
  );
}
