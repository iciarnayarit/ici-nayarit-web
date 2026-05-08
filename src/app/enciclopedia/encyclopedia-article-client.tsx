'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/app/components/ui/accordion';
import { Button } from '@/app/components/ui/button';
import { useNdjsonStreamBuffer } from '@/app/hooks/use-ndjson-stream-buffer';
import { cn } from '@/app/lib/utils';
import type { EncyclopediaEntry } from '@/lib/bible-encyclopedia-data';
import { segmentTextWithBibleRefs } from '@/lib/bible-reference-parser';
import { grantEngagementPoints } from '@/lib/engagement-points';
import { useAuth } from '@clerk/nextjs';
import {
    Background,
    Controls,
    Handle,
    MiniMap,
    Position,
    ReactFlow,
    type Edge,
    type Node,
    type NodeProps,
    type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Castle, ChevronLeft, ChevronRight, Lightbulb, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';

function BibleLinkedText({ text }: { text: string }): ReactNode {
  const segments = useMemo(() => segmentTextWithBibleRefs(text), [text]);
  return (
    <>
      {segments.map((s, i) =>
        s.type === 'text' ? (
          <span key={i}>{s.text}</span>
        ) : (
          <Link
            key={i}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 underline underline-offset-2 hover:text-[#B88A44]"
            title={
              s.verses.length > 0
                ? `Abrir ${s.book} ${s.chapter}:${s.verses.join(', ')} en la Biblia (nueva pestaña)`
                : `Abrir ${s.book} ${s.chapter} en la Biblia (nueva pestaña)`
            }
          >
            {s.text}
          </Link>
        )
      )}
    </>
  );
}

function sectionIconClass(kind: string): string {
  const k = kind.toLowerCase();
  if (k.includes('ciudad')) return 'bg-[#8B2942]/15 text-[#8B2942]';
  if (k.includes('persona')) return 'bg-blue-100 text-blue-800';
  if (k.includes('lugar')) return 'bg-emerald-100 text-emerald-800';
  return 'bg-amber-100 text-amber-900';
}

function splitParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function extractGraphTerms(entry: EncyclopediaEntry): string[] {
  const tagsSection = entry.sections.find((s) => s.id === 'etiquetas');
  const tags = (tagsSection?.body ?? '')
    .split(/[·,]/)
    .map((t) => t.trim())
    .filter(Boolean);
  const refs = (entry.seeAlso ?? []).map((r) => r.label.trim()).filter(Boolean);
  const kinds = entry.kind
    .split('/')
    .map((k) => k.trim())
    .filter(Boolean);

  const merged = [...kinds, ...tags, ...refs];
  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const term of merged) {
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(term);
  }
  return uniq.slice(0, 8);
}

function extractLexicoTags(entry: EncyclopediaEntry): string[] {
  const tagsSection = entry.sections.find((s) => s.id === 'etiquetas');
  return (tagsSection?.body ?? '')
    .split(/[·,]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function extractLexicoLemas(entry: EncyclopediaEntry): string[] {
  const base = [entry.title, ...entry.kind.split('/').map((k) => k.trim()), ...extractLexicoTags(entry)];
  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const t of base) {
    const key = t.toLowerCase();
    if (!t || seen.has(key)) continue;
    seen.add(key);
    uniq.push(t);
  }
  return uniq.slice(0, 6);
}

function extractLexicoRefs(entry: EncyclopediaEntry): Array<{ text: string; href: string }> {
  const corpus = [entry.summary, ...entry.sections.map((s) => s.body)].join(' ');
  const segments = segmentTextWithBibleRefs(corpus);
  const out: Array<{ text: string; href: string }> = [];
  const seen = new Set<string>();
  for (const s of segments) {
    if (s.type !== 'ref') continue;
    const key = `${s.text}|${s.href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text: s.text, href: s.href });
    if (out.length >= 10) break;
  }
  return out;
}

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

type LexicoNodeData = {
  label: string;
  slug?: string;
  active?: boolean;
  center?: boolean;
};

type LexicoTooltipState = {
  x: number;
  y: number;
  label: string;
  description: string;
} | null;

function LexicoNode({ data }: NodeProps<Node<LexicoNodeData>>) {
  const center = Boolean(data.center);
  const active = Boolean(data.active);
  const title = data.slug ? `Abrir ${data.label}` : data.label;

  return (
    <div
      title={title}
      className={`rounded-full border text-center shadow-sm transition-all ${
        center
          ? 'min-w-[150px] border-gray-300 bg-gray-50 px-5 py-4'
          : active
            ? 'border-[#B88A44] bg-amber-50 px-3 py-2'
            : 'border-gray-200 bg-white px-3 py-2'
      }`}
    >
      {!center && <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-gray-300" />}
      <span className={`text-xs font-semibold ${active ? 'text-[#8a6326]' : 'text-gray-700'}`}>{data.label}</span>
      {!center && <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-gray-300" />}
    </div>
  );
}

function LexicoGraph({ entry, allEntries }: { entry: EncyclopediaEntry; allEntries: EncyclopediaEntry[] }) {
  const router = useRouter();
  const terms = extractGraphTerms(entry);
  const tags = extractLexicoTags(entry);
  const lemas = extractLexicoLemas(entry);
  const refs = extractLexicoRefs(entry);
  const seeAlsoByLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of entry.seeAlso ?? []) {
      m.set(r.label.toLowerCase(), r.slug);
    }
    return m;
  }, [entry.seeAlso]);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [tooltip, setTooltip] = useState<LexicoTooltipState>(null);
  const graphWrapperRef = useRef<HTMLDivElement | null>(null);
  if (terms.length === 0) return null;

  const bySlug = useMemo(() => {
    const m = new Map<string, EncyclopediaEntry>();
    for (const e of allEntries) m.set(e.slug, e);
    return m;
  }, [allEntries]);

  const centerX = 300;
  const centerY = 180;
  const radius = 175;

  const nodeTypes: NodeTypes = useMemo(() => ({ lexico: LexicoNode }), []);

  const nodes: Node<LexicoNodeData>[] = useMemo(() => {
    const centerNode: Node<LexicoNodeData> = {
      id: 'center',
      type: 'lexico',
      position: { x: centerX - 75, y: centerY - 28 },
      data: {
        label: entry.title.length > 32 ? `${entry.title.slice(0, 32)}…` : entry.title,
        center: true,
      },
      draggable: false,
      selectable: false,
    };

    const termNodes = terms.map((label, i) => {
      const angle = (Math.PI * 2 * i) / terms.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * (radius * 0.75);
      return {
        id: `term-${i}`,
        type: 'lexico',
        position: { x, y },
        data: {
          label,
          slug: seeAlsoByLabel.get(label.toLowerCase()),
          active: activeTerm === label,
        },
      } satisfies Node<LexicoNodeData>;
    });

    return [centerNode, ...termNodes];
  }, [entry.title, terms, activeTerm, seeAlsoByLabel]);

  const edges: Edge[] = useMemo(
    () =>
      terms.map((label, i) => ({
        id: `edge-${i}`,
        source: 'center',
        target: `term-${i}`,
        animated: activeTerm === label,
        style: {
          stroke: activeTerm === label ? '#B88A44' : '#cfd8e3',
          strokeWidth: activeTerm === label ? 2 : 1.2,
        },
      })),
    [terms, activeTerm]
  );

  const activeNode = nodes.find((n) => n.id !== 'center' && n.data.label === activeTerm);
  const activeDescription = useMemo(() => {
    if (!activeNode) return null;
    const slug = activeNode.data.slug;
    if (slug) {
      const related = bySlug.get(slug);
      if (related?.summary) return related.summary;
    }
    const label = activeNode.data.label;
    if (label.toLowerCase() === entry.kind.toLowerCase()) {
      return `Clasificación principal de esta entrada: ${entry.kind}.`;
    }
    return `“${label}” es un término relacionado dentro de este campo léxico.`;
  }, [activeNode, bySlug, entry.kind]);

  const describeNode = (node: Node<LexicoNodeData>): string => {
    const slug = node.data.slug;
    if (slug) {
      const related = bySlug.get(slug);
      if (related?.summary) return related.summary;
    }
    const label = node.data.label;
    if (label.toLowerCase() === entry.kind.toLowerCase()) {
      return `Clasificación principal de esta entrada: ${entry.kind}.`;
    }
    return `“${label}” es un término relacionado dentro de este campo léxico.`;
  };

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-[#fcfcfd] p-3">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">
        Léxico bíblico (gráfica)
      </p>
      <div className="grid gap-3 md:grid-cols-[260px_1fr]">
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobilePanelOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs font-black uppercase tracking-wider text-gray-700"
            aria-expanded={mobilePanelOpen}
            aria-controls="lexico-mobile-panel"
          >
            Panel léxico
            <span className={`transition-transform ${mobilePanelOpen ? 'rotate-180' : ''}`}>⌄</span>
          </button>
        </div>

        <aside
          id="lexico-mobile-panel"
          className={`rounded-xl border border-gray-200 bg-white p-3 ${
            mobilePanelOpen ? 'block' : 'hidden'
          } md:block`}
        >
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-700">
            {entry.title}
          </div>
          <p className="mt-2 text-xs text-gray-700">
            <span className="font-semibold">{entry.title}</span> sust. — {entry.summary}
          </p>
          <p className="mt-2 text-xs text-[#B88A44]">
            <button
              type="button"
              className="font-semibold hover:underline"
              onClick={() => {
                if (activeNode?.data.slug) router.push(`/enciclopedia/${activeNode.data.slug}`);
              }}
            >
              Buscar el sentido "{activeNode?.data.label ?? entry.title}"
            </button>
          </p>

          <div className="mt-3 border-t border-gray-100 pt-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Lemas</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-700">{lemas.join(' · ')}</p>
            {refs.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                {refs.slice(0, 6).map((r) => (
                  <Link key={`${r.text}-${r.href}`} href={r.href} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-700 hover:text-[#B88A44] hover:underline">
                    {r.text}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-gray-100 pt-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Parentesco</p>
            <p className="mt-1 text-xs text-gray-700"><span className="font-semibold">Tipo de</span> {entry.kind}</p>
            {tags.length > 0 && <p className="mt-1 text-xs text-gray-700">{tags.slice(0, 3).join(' · ')}</p>}
          </div>

          {entry.seeAlso && entry.seeAlso.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Ver también</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {entry.seeAlso.slice(0, 4).map((r) => (
                  <Link key={r.slug} href={`/enciclopedia/${r.slug}`} className="rounded-full border border-gray-200 px-2 py-0.5 text-xs font-semibold text-blue-700 hover:border-[#B88A44]/40 hover:text-[#B88A44]">
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div ref={graphWrapperRef} className="relative h-[430px] overflow-hidden rounded-xl border border-gray-200 bg-white">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.45}
            maxZoom={1.8}
            onNodeClick={(_, node) => {
              const event = _ as ReactMouseEvent;
              if (node.id === 'center') return;
              const label = node.data.label;
              setActiveTerm(label);
              const description = describeNode(node as Node<LexicoNodeData>);
              const rect = graphWrapperRef.current?.getBoundingClientRect();
              if (rect) {
                const x = Math.min(Math.max(event.clientX - rect.left + 14, 12), rect.width - 280);
                const y = Math.min(Math.max(event.clientY - rect.top - 8, 12), rect.height - 120);
                setTooltip({ x, y, label, description });
              }
              const slug = node.data.slug;
              if (slug) router.push(`/enciclopedia/${slug}`);
            }}
            onPaneClick={() => setTooltip(null)}
            className="bg-white"
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap pannable zoomable nodeColor={() => '#d1d5db'} className="!bg-white" />
            <Controls showInteractive={false} />
            <Background color="#f1f5f9" gap={18} />
          </ReactFlow>
          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 max-w-[260px] rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <p className="text-[11px] font-black uppercase tracking-wide text-[#B88A44]">{tooltip.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-700">{tooltip.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
        {activeNode ? (
          <>
            <span className="font-semibold text-gray-800">Seleccionado:</span> {activeNode.data.label}
            {activeNode.data.slug ? (
              <span className="ml-2 text-[#B88A44]">Abriendo entrada relacionada…</span>
            ) : (
              <span className="ml-2 text-gray-500">Término informativo.</span>
            )}
            {activeDescription && (
              <p className="mt-2 text-[12px] leading-relaxed text-gray-700">
                {activeDescription}
              </p>
            )}
          </>
        ) : (
          <>Haz clic o arrastra nodos. Usa zoom para explorar relaciones.</>
        )}
      </div>
    </div>
  );
}

type Props = {
  entry: EncyclopediaEntry;
  allEntries: EncyclopediaEntry[];
  relatedSlot?: ReactNode;
};

export default function EncyclopediaArticleClient({ entry, allEntries, relatedSlot }: Props) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const index = allEntries.findIndex((e) => e.slug === entry.slug);
  const prev = index > 0 ? allEntries[index - 1] : null;
  const next = index >= 0 && index < allEntries.length - 1 ? allEntries[index + 1] : null;

  const MIN_QUERY_LENGTH = 2;
  const [query, setQuery] = useState(entry.title);
  const [searchResults, setSearchResults] = useState<EncyclopediaSearchResult[]>([]);
  const [searchTotal, setSearchTotal] = useState<number | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingSearchEvents, setPendingSearchEvents] = useState<EncyclopediaSearchStreamEvent[]>([]);
  const hasActiveSearch = query.trim().length >= MIN_QUERY_LENGTH;

  const streamBuffer = useNdjsonStreamBuffer<EncyclopediaSearchStreamEvent>({
    flushMs: 120,
    onFlush: (events) => {
      setPendingSearchEvents((prev) => [...prev, ...events]);
    },
  });

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 3) return;
    const id = window.setTimeout(() => {
      void grantEngagementPoints({
        action: 'bible_read',
        dedupeKey: `encyclopedia-search:${entry.slug}:${q}`,
        isSignedIn: authLoaded && isSignedIn === true,
      });
    }, 450);
    return () => window.clearTimeout(id);
  }, [query, entry.slug, authLoaded, isSignedIn]);

  useEffect(() => {
    if (pendingSearchEvents.length === 0) return;

    setSearchResults((prev) => {
      let next = [...prev];
      for (const event of pendingSearchEvents) {
        if (event.type === 'start') {
          next = [];
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
    const MIN_QUERY_LENGTH = 2;

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

    setSearchLoading(true);
    setSearchError(null);
    setSearchTotal(null);
    setSearchResults([]);
    setPendingSearchEvents([]);

    void (async () => {
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
    })();

    return () => {
      cancelled = true;
      controller.abort();
      streamBuffer.cancel();
    };
  }, [query, streamBuffer]);

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-900">
      <div className="border-b border-gray-200/80 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              aria-label="Buscar en la enciclopedia"
            />
          </div>
          <div className="flex items-center gap-1">
            {prev ? (
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" asChild>
                <Link href={`/enciclopedia/${prev.slug}`} title={prev.title}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <span className="inline-flex h-9 w-9 items-center justify-center text-gray-300">
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}
            {next ? (
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" asChild>
                <Link href={`/enciclopedia/${next.slug}`} title={next.title}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <span className="inline-flex h-9 w-9 items-center justify-center text-gray-300">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Búsqueda en la enciclopedia</p>
              <p className="text-sm text-gray-500">Resultados para «{query.trim()}»</p>
            </div>
            <div className="text-sm text-gray-500">
              {searchLoading ? (
                <span className="inline-flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando resultados…
                </span>
              ) : searchError ? (
                <span className="text-red-600">{searchError}</span>
              ) : hasActiveSearch ? (
                <span>{searchTotal ?? searchResults.length} resultados</span>
              ) : (
                <span>Escribe al menos {MIN_QUERY_LENGTH} caracteres para buscar</span>
              )}
            </div>
          </div>

          {searchError ? (
            <p className="mt-4 text-sm text-red-600">{searchError}</p>
          ) : (
            <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {!hasActiveSearch ? (
                <p className="text-sm leading-relaxed text-gray-600">Escribe al menos {MIN_QUERY_LENGTH} caracteres para buscar en la enciclopedia.</p>
              ) : searchLoading ? null : searchResults.length === 0 ? (
                <p className="text-sm leading-relaxed text-gray-600">No se encontraron resultados para «{query.trim()}».</p>
              ) : (
                searchResults.map((result) => (
                  <Link
                    key={result.slug}
                    href={`/enciclopedia/${result.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition-all hover:border-[#B88A44]/35 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B2942]/10 text-[#8B2942]">
                        <Castle className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold text-gray-900 group-hover:text-[#B88A44]">{result.title}</h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{result.kind}</p>
                      </div>
                    </div>
                    <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{result.summary}</p>
                    <span className="mt-4 text-sm font-semibold text-[#B88A44] group-hover:underline">Leer artículo →</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </section>

        <div className="rounded-2xl border border-gray-200/80 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-10">
          <header className="mb-8 border-b border-gray-100 pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16',
                  sectionIconClass(entry.kind)
                )}
              >
                <Castle className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-[2rem]">
                  {entry.title}
                </h1>
                <p className="mt-1 text-sm font-medium text-gray-500">{entry.kind}</p>
                <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-[1.05rem]">
                  <BibleLinkedText text={entry.summary} />
                </p>
              </div>
            </div>
          </header>

          <Accordion type="multiple" className="w-full" defaultValue={entry.sections.slice(0, 2).map((s) => s.id)}>
            {entry.sections.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border-gray-200">
                <AccordionTrigger className="py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-gray-800 hover:no-underline [&>svg]:text-gray-500">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="pb-5 pt-0">
                  <div className="space-y-3 text-sm leading-relaxed text-gray-700">
                    {section.id === 'graficos' && <LexicoGraph entry={entry} allEntries={allEntries} />}
                    {splitParagraphs(section.body).map((p, i) => (
                      <p key={i}>
                        <BibleLinkedText text={p} />
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {relatedSlot ??
            (entry.seeAlso && entry.seeAlso.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-gray-800">
                  <Lightbulb className="h-4 w-4 text-[#B88A44]" aria-hidden />
                  Ver también
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {entry.seeAlso.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/enciclopedia/${r.slug}`}
                        className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition-colors hover:border-[#B88A44]/40 hover:bg-amber-50/60 hover:text-[#B88A44]"
                      >
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/enciclopedia" className="font-semibold text-[#B88A44] hover:underline">
            ← Índice de la enciclopedia
          </Link>
        </p>
      </article>
    </div>
  );
}
