'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Bookmark, Filter, Plus, Share2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useToast } from '@/app/hooks/use-toast';
import type { HelloAoCommentary } from '@/lib/helloao-commentaries';
import {
  commentaryAuthorShortName,
  HELLOAO_COMMENTARIES_JSON,
  helloAoBooksUrl,
} from '@/lib/helloao-commentaries';
import {
  getSavedCommentaries,
  SAVED_COMMENTARIES_CHANGED_EVENT,
  toggleSavedCommentary,
} from '@/lib/saved-commentaries';

type TabId = 'all' | 'ot' | 'nt' | 'theological' | 'historical';

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'ot', label: 'Antiguo Testamento' },
  { id: 'nt', label: 'Nuevo Testamento' },
  { id: 'theological', label: 'Teológicos' },
  { id: 'historical', label: 'Históricos' },
];

/** Clasificación aproximada por obra (el API no envía categorías). */
const TAB_COMMENTARY_IDS: Record<Exclude<TabId, 'all'>, Set<string>> = {
  ot: new Set(['keil-delitzsch', 'adam-clarke']),
  nt: new Set(['jamieson-fausset-brown', 'john-gill', 'matthew-henry', 'tyndale']),
  theological: new Set(['matthew-henry', 'john-gill', 'tyndale', 'keil-delitzsch']),
  historical: new Set(['jamieson-fausset-brown', 'adam-clarke', 'keil-delitzsch']),
};

const SAMPLE_REFERENCES = [
  'Salmo 23:1',
  'Juan 3:16',
  'Romanos 8:28',
  'Isaías 53:5',
  'Efesios 2:8',
  'Génesis 1:1',
];

function languageBadge(c: HelloAoCommentary): string {
  const map: Record<string, string> = {
    eng: 'ENG',
    spa: 'ES',
  };
  return map[c.language] ?? c.language.toUpperCase().slice(0, 3);
}

function snippetFor(c: HelloAoCommentary): string {
  if (c.language === 'spa' && c.licenseNotes?.trim()) {
    const t = c.licenseNotes.trim();
    return t.length > 160 ? `${t.slice(0, 157)}…` : t;
  }
  const cap = c.totalNumberOfChapters.toLocaleString('es-MX');
  const ver = c.totalNumberOfVerses.toLocaleString('es-MX');
  return `${c.numberOfBooks} libros, ${cap} capítulos y ${ver} versículos con notas.`;
}

function referenceFor(index: number): string {
  return SAMPLE_REFERENCES[index % SAMPLE_REFERENCES.length]!;
}

function matchesTab(c: HelloAoCommentary, tab: TabId): boolean {
  if (tab === 'all') return true;
  return TAB_COMMENTARY_IDS[tab].has(c.id);
}

export default function CommentariesCatalog({ commentaries }: { commentaries: HelloAoCommentary[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const refreshSavedIds = useCallback(() => {
    setSavedIds(new Set(getSavedCommentaries().map(x => x.id)));
  }, []);

  useEffect(() => {
    refreshSavedIds();
    const onChanged = () => refreshSavedIds();
    window.addEventListener(SAVED_COMMENTARIES_CHANGED_EVENT, onChanged);
    window.addEventListener('storage', onChanged);
    return () => {
      window.removeEventListener(SAVED_COMMENTARIES_CHANGED_EVENT, onChanged);
      window.removeEventListener('storage', onChanged);
    };
  }, [refreshSavedIds]);

  const filtered = useMemo(() => commentaries.filter(c => matchesTab(c, tab)), [commentaries, tab]);

  return (
    <div className="min-h-screen bg-[#F0F2F6] pb-24">
      {commentaries.length === 0 ? (
        <div className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900 sm:mx-6 lg:mx-auto lg:max-w-6xl">
          No se pudo cargar el catálogo en este momento. Vuelve a intentar más tarde o revisa la fuente en{' '}
          <a href={HELLOAO_COMMENTARIES_JSON} className="font-semibold underline" target="_blank" rel="noopener noreferrer">
            bible.helloao.org
          </a>
          .
        </div>
      ) : null}
      {/* Hero */}
      <section className="relative mx-4 mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0c4a6e] px-6 py-12 text-white shadow-xl sm:mx-6 sm:px-10 lg:mx-auto lg:mt-6 lg:max-w-6xl">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/[0.04]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 h-96 w-96 rounded-full border border-sky-400/20"
          aria-hidden
        />
        <span className="relative inline-flex rounded-full bg-sky-500/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
          Enfoque teológico
        </span>
        <h1 className="relative mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Comentarios Bíblicos
        </h1>
        <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
          Estudios reformados, notas de estudio y comentarios históricos para profundizar en las Escrituras.
        </p>
      </section>

      {/* Tabs + filtros */}
      <div
        id="coleccion"
        className="sticky top-[4.5rem] z-30 mx-4 mt-6 flex flex-col gap-3 border-b border-gray-200/80 bg-[#F0F2F6]/95 pb-3 backdrop-blur-md sm:mx-6 sm:flex-row sm:items-center sm:justify-between lg:mx-auto lg:max-w-6xl"
      >
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                tab === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-white text-gray-600 shadow-sm ring-1 ring-gray-200/80 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full border-gray-200 bg-white text-gray-700 shadow-sm"
          onClick={() => {}}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="mx-4 space-y-8 py-8 sm:mx-6 lg:mx-auto lg:max-w-6xl">
        {/* Fila destacada: estudio temático + solicitud */}
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:flex">
            <div className="relative h-48 shrink-0 bg-amber-100 lg:h-auto lg:w-2/5">
              <Image
                src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Estudio temático</span>
              <div className="mt-2 flex items-center gap-2 text-gray-500">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-semibold">Sugerido</span>
              </div>
              <h2 className="mt-2 font-display text-xl font-bold text-gray-900">
                Los milagros de Jesús en los evangelios sinópticos
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Combina el comentario de Matthew Henry con lecturas en NVI para un recorrido guiado por pasajes clave.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2">
                  {['bg-amber-200', 'bg-sky-200', 'bg-emerald-200'].map((bg, i) => (
                    <span
                      key={i}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-gray-700 ${bg}`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de tarjetas */}
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-sm text-gray-500">
            No hay obras en esta categoría. Prueba con «Todos».
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c, index) => {
              const author = commentaryAuthorShortName(c.name);
              const ref = referenceFor(index);
              const moreHref = c.website ?? helloAoBooksUrl(c.listOfBooksApiLink);
              return (
                <li
                  key={c.id}
                  role="link"
                  tabIndex={0}
                  className="flex cursor-pointer flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  onClick={() => router.push(`/comentarios/${c.id}`)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/comentarios/${c.id}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-black text-slate-700"
                        aria-hidden
                      >
                        {author
                          .split(/\s+/)
                          .map(w => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-gray-900">{author}</p>
                        <span className="mt-0.5 inline-block rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                          {languageBadge(c)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1 text-gray-400" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        className={`rounded-lg p-1.5 hover:bg-gray-100 hover:text-gray-700 ${savedIds.has(c.id) ? 'text-blue-600' : ''}`}
                        aria-label={savedIds.has(c.id) ? 'Quitar guardado' : 'Guardar'}
                        title={savedIds.has(c.id) ? 'Quitar de guardados' : 'Guardar en este dispositivo'}
                        onClick={() => {
                          const nowSaved = toggleSavedCommentary(c);
                          toast({
                            title: nowSaved ? 'Guardado' : 'Quitado',
                            description: nowSaved
                              ? `${commentaryAuthorShortName(c.name)} se guardó en este dispositivo.`
                              : `${commentaryAuthorShortName(c.name)} ya no está en guardados.`,
                          });
                        }}
                      >
                        <Bookmark className={`h-4 w-4 ${savedIds.has(c.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button type="button" className="rounded-lg p-1.5 hover:bg-gray-100 hover:text-gray-700" aria-label="Compartir">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Versículo de ejemplo</p>
                  <p className="mt-1 font-display text-lg font-bold text-gray-900">{ref}</p>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-gray-600">{snippetFor(c)}</p>
                  <div
                    className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="text-left text-sm font-bold text-blue-600 hover:text-blue-800"
                      onClick={() => router.push(`/comentarios/${c.id}`)}
                    >
                      Ver libros →
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-400">
                        {c.totalNumberOfVerses.toLocaleString('es-MX')} versículos
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/recursos"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40 transition-transform hover:scale-105 hover:bg-blue-700"
        aria-label="Más recursos de estudio"
      >
        <Plus className="h-7 w-7 stroke-[2.5]" />
      </Link>
    </div>
  );
}
