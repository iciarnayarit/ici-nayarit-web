'use client';

import { useNdjsonStreamBuffer } from '@/app/hooks/use-ndjson-stream-buffer';
import type { EncyclopediaEntry } from '@/lib/bible-encyclopedia-data';
import { Castle, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type EncyclopediaSearchResult = {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  score: number;
  reason: 'title' | 'kind' | 'summary' | 'section';
};

type EncyclopediaSearchStreamEvent = {
  type?: string;
  query?: string;
  limit?: number;
  index?: number;
  total?: number;
  item?: EncyclopediaSearchResult;
  message?: string;
};

type IndexPageData = {
  entries: EncyclopediaEntry[];
  total: number;
  page: number;
  totalPages: number;
};

type Props = {
  requestedPage: number;
  initialPageData: IndexPageData;
};

const MIN_QUERY_LENGTH = 2;

export default function EncyclopediaIndexListClient({ requestedPage, initialPageData }: Props) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EncyclopediaSearchResult[]>([]);
  const [searchTotal, setSearchTotal] = useState<number | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingSearchEvents, setPendingSearchEvents] = useState<EncyclopediaSearchStreamEvent[]>([]);

  const streamBuffer = useNdjsonStreamBuffer<EncyclopediaSearchStreamEvent>({
    flushMs: 120,
    onFlush: (events) => {
      setPendingSearchEvents((prev) => [...prev, ...events]);
    },
  });

  useEffect(() => {
    if (pendingSearchEvents.length === 0) return;

    setSearchResults((prev) => {
      const next = [...prev];
      for (const event of pendingSearchEvents) {
        if (event.type === 'start') {
          next.length = 0;
          continue;
        }
        if (event.type === 'result' && event.item) {
          const index = Number.isInteger(event.index) ? event.index : next.length;
          next[index] = event.item;
        }
      }
      return next.filter(Boolean);
    });

    const errorEvent = pendingSearchEvents.find((event) => event.type === 'error');
    const doneEvent = pendingSearchEvents.find((event) => event.type === 'done');

    if (errorEvent) {
      setSearchError(errorEvent.message ?? 'Error en búsqueda incremental.');
      setSearchTotal(0);
      setSearchResults([]);
    } else {
      if (doneEvent) {
        setSearchTotal(doneEvent.total ?? null);
      }
      setSearchError(null);
    }

    setPendingSearchEvents([]);
  }, [pendingSearchEvents]);

  useEffect(() => {
    const searchText = query.trim();
    if (searchText.length < MIN_QUERY_LENGTH) {
      setSearchResults([]);
      setSearchTotal(null);
      setSearchError(null);
      setSearchLoading(false);
      streamBuffer.cancel();
      streamBuffer.reset();
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const delay = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      setSearchTotal(null);
      setSearchResults([]);
      setPendingSearchEvents([]);

      try {
        const res = await fetch(
          `/api/enciclopedia/search?q=${encodeURIComponent(searchText)}&stream=1&limit=20`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/x-ndjson',
            },
          }
        );

        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        if (res.ok && contentType.includes('application/x-ndjson') && res.body) {
          streamBuffer.reset();
          await streamBuffer.consumeResponse(res);
          return;
        }

        const data = (await res.json()) as {
          ok?: boolean;
          results?: EncyclopediaSearchResult[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
        setSearchResults(Array.isArray(data.results) ? data.results : []);
        setSearchTotal(Array.isArray(data.results) ? data.results.length : 0);
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        setSearchResults([]);
        setSearchTotal(null);
        setSearchError(error instanceof Error ? error.message : 'Error de conexión.');
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      controller.abort();
      streamBuffer.cancel();
      window.clearTimeout(delay);
    };
  }, [query, streamBuffer]);

  const hasActiveSearch = query.trim().length >= MIN_QUERY_LENGTH;
  const resultsToShow = hasActiveSearch ? searchResults : initialPageData.entries;

  const pageNav = useMemo(() => {
    if (hasActiveSearch) return null;
    const qs = (p: number) => (p <= 1 ? '/enciclopedia' : `/enciclopedia?page=${p}`);

    return (
      <nav
        className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-gray-200/80 pt-8 sm:flex-row sm:gap-6"
        aria-label="Paginación de la enciclopedia"
      >
        {initialPageData.page > 1 ? (
          <Link
            href={qs(initialPageData.page - 1)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-[#B88A44]/40 hover:text-[#B88A44]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Anterior
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-gray-300">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Anterior
          </span>
        )}

        <span className="text-sm text-gray-600">
          Página <span className="font-bold text-gray-900">{initialPageData.page}</span> de{' '}
          <span className="font-bold text-gray-900">{initialPageData.totalPages}</span>
        </span>

        {initialPageData.page < initialPageData.totalPages ? (
          <Link
            href={qs(initialPageData.page + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-[#B88A44]/40 hover:text-[#B88A44]"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-gray-300">
            Siguiente
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </nav>
    );
  }, [hasActiveSearch, initialPageData.page, initialPageData.totalPages]);

  return (
    <>
      <div className="mb-4 rounded-2xl border border-gray-200/80 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <Search className="h-4 w-4 text-gray-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en la enciclopedia"
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              aria-label="Buscar en la enciclopedia"
            />
          </div>
          <div className="text-sm text-gray-500">
            {hasActiveSearch ? (
              searchLoading ? (
                <span className="inline-flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando…
                </span>
              ) : searchError ? (
                <span className="text-red-600">{searchError}</span>
              ) : (
                <span>{searchTotal ?? searchResults.length} resultados</span>
              )
            ) : (
              <span>
                Mostrando {initialPageData.total} artículos · página {initialPageData.page} de{' '}
                {initialPageData.totalPages}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resultsToShow.map((e) => (
          <Link
            key={e.slug}
            href={`/enciclopedia/${e.slug}`}
            className="group flex h-full flex-col rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition-all hover:border-[#B88A44]/35 hover:shadow-md"
          >
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B2942]/10 text-[#8B2942]">
                <Castle className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-gray-900 group-hover:text-[#B88A44]">{e.title}</h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{e.kind}</p>
              </div>
            </div>
            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{e.summary}</p>
            <span className="mt-4 text-sm font-semibold text-[#B88A44] group-hover:underline">Leer artículo →</span>
          </Link>
        ))}
      </div>

      {hasActiveSearch ? null : pageNav}

      {hasActiveSearch && !searchLoading && searchResults.length === 0 && !searchError && (
        <p className="mt-6 text-center text-sm text-gray-600">No se encontraron resultados para «{query.trim()}».</p>
      )}
    </>
  );
}
