'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
import { useDebouncedValue } from '@/app/hooks/use-debounced-value';
import { fuzzySimilarity, normalizeSearchText } from '@/lib/fuzzy-search';

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

const PREFERRED_ORDER = [
  'adam-clarke',
  'jamieson-fausset-brown',
  'john-gill',
  'keil-delitzsch',
  'matthew-henry',
  'tyndale',
] as const;

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
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 280);

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

  const filtered = useMemo(() => {
    const list = commentaries.filter(c => matchesTab(c, tab));
    const normalizedQuery = normalizeSearchText(debouncedSearchQuery);
    const queryActive = normalizedQuery.length >= 2;
    const rank = new Map<string, number>(PREFERRED_ORDER.map((id, i) => [id, i]));
    const scored = list
      .map(c => {
        const author = commentaryAuthorShortName(c.name);
        const baseText = `${author} ${c.englishName} ${snippetFor(c)} ${c.numberOfBooks} libros`;
        const score = queryActive ? fuzzySimilarity(baseText, normalizedQuery) : 1;
        return { c, score, author };
      })
      .filter(item => !queryActive || item.score >= 0.62);

    return scored
      .sort((a, b) => {
        if (queryActive && a.score !== b.score) return b.score - a.score;
        const ra = rank.has(a.c.id) ? rank.get(a.c.id)! : Number.MAX_SAFE_INTEGER;
        const rb = rank.has(b.c.id) ? rank.get(b.c.id)! : Number.MAX_SAFE_INTEGER;
        if (ra !== rb) return ra - rb;
        return a.author.localeCompare(b.author, 'es');
      })
      .map(item => item.c);
  }, [commentaries, tab, debouncedSearchQuery]);

  const handleOpenCommentary = useCallback(
    (id: string) => {
      router.push(`/comentarios/${id}`);
    },
    [router]
  );

  const handleToggleSaved = useCallback(
    (c: HelloAoCommentary) => {
      const nowSaved = toggleSavedCommentary(c);
      toast({
        title: nowSaved ? 'Guardado' : 'Quitado',
        description: nowSaved
          ? `${commentaryAuthorShortName(c.name)} se guardó en este dispositivo.`
          : `${commentaryAuthorShortName(c.name)} ya no está en guardados.`,
      });
    },
    [toast]
  );

  useEffect(() => {
    if (filtered.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          const href = target.dataset.prefetchHref;
          if (!href) continue;
          router.prefetch(href);
          observer.unobserve(target);
        }
      },
      { rootMargin: '180px 0px', threshold: 0.01 }
    );

    const nodes = document.querySelectorAll<HTMLElement>('[data-prefetch-href]');
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [filtered, router]);

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
      {/* Tabs + filtros */}
      <div
        id="coleccion"
        className="sticky top-[4.5rem] z-30 mx-4 mt-4 flex flex-col gap-3 border-b border-gray-200/80 bg-[#F0F2F6]/95 pb-3 backdrop-blur-md sm:mx-6 sm:flex-row sm:items-center sm:justify-between lg:mx-auto lg:max-w-6xl"
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
        <input
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar comentario, autor o temática..."
          className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:w-[22rem]"
        />
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
                <CommentaryCard
                  key={c.id}
                  commentary={c}
                  author={author}
                  refLabel={ref}
                  isSaved={savedIds.has(c.id)}
                  onOpen={handleOpenCommentary}
                  onToggleSaved={handleToggleSaved}
                  prefetchHref={`/comentarios/${c.id}`}
                />
              );
            })}
          </ul>
        )}
      </div>

    </div>
  );
}

type CommentaryCardProps = {
  commentary: HelloAoCommentary;
  author: string;
  refLabel: string;
  isSaved: boolean;
  onOpen: (id: string) => void;
  onToggleSaved: (commentary: HelloAoCommentary) => void;
  prefetchHref: string;
};

const CommentaryCard = memo(function CommentaryCard({
  commentary,
  author,
  refLabel,
  isSaved,
  onOpen,
  onToggleSaved,
  prefetchHref,
}: CommentaryCardProps) {
  const initials = author
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <li
      data-prefetch-href={prefetchHref}
      role="link"
      tabIndex={0}
      className="flex cursor-pointer flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onOpen(commentary.id)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(commentary.id);
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-black text-slate-700"
            aria-hidden
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-900">{author}</p>
            <span className="mt-0.5 inline-block rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">
              {languageBadge(commentary)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-1 text-gray-400" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className={`rounded-lg p-1.5 hover:bg-gray-100 hover:text-gray-700 ${isSaved ? 'text-blue-600' : ''}`}
            aria-label={isSaved ? 'Quitar guardado' : 'Guardar'}
            title={isSaved ? 'Quitar de guardados' : 'Guardar en este dispositivo'}
            onClick={() => onToggleSaved(commentary)}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button type="button" className="rounded-lg p-1.5 hover:bg-gray-100 hover:text-gray-700" aria-label="Compartir">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Versículo de ejemplo</p>
      <p className="mt-1 font-display text-lg font-bold text-gray-900">{refLabel}</p>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-gray-600">{snippetFor(commentary)}</p>
      <div
        className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="text-left text-sm font-bold text-blue-600 hover:text-blue-800"
          onClick={() => onOpen(commentary.id)}
        >
          Ver libros →
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400">
            {commentary.totalNumberOfVerses.toLocaleString('es-MX')} versículos
          </span>
        </div>
      </div>
    </li>
  );
});
