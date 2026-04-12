'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MoreVertical, Plus, RefreshCw, Search, X, BookOpen, StickyNote, Image as ImageIcon } from 'lucide-react';
import { bookOrder, chaptersInBook, type BibleBookData } from '@/lib/bible-data';
import {
  loadFullBibleLookup,
  READING_PLAN_VERSIONS,
  VERSIONS,
  type VersionId,
} from '@/lib/bible-versions';
import { Button } from '@/app/components/ui/button';
import { useAuth, useClerk } from '@clerk/nextjs';
import { ensureClerkSignedIn } from '@/lib/require-clerk-sign-in';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Switch } from '@/app/components/ui/switch';
import { cn } from '@/app/lib/utils';

const SYNC_KEY = 'iciar-bible-comparator-sync-scroll';

const SORTED_BOOKS_FOR_SEARCH = [...bookOrder].sort((a, b) => b.length - a.length);

const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function chipShortLabel(id: VersionId): string {
  const custom: Partial<Record<VersionId, string>> = {
    rvr: 'RV1960',
    rvg: 'RVG',
    dhh94i: 'DHH',
    dhhs94: 'DHH-E',
    lbla: 'LBLA',
    nbla: 'NBLA',
    ntv: 'NTV',
    nvi_es: 'NVI',
    nvi_castellano: 'NVI-C',
    rva2015: 'RVA2015',
    rvc: 'RVC',
    tla: 'TLA',
    tlai: 'TLA-I',
    kjv: 'KJV',
    asv: 'ASV',
    bbe: 'BBE',
    el: 'TR',
    huichol: 'HCH',
  };
  return custom[id] ?? id.toUpperCase();
}

function columnHeaderLabel(id: VersionId): string {
  const v = VERSIONS.find(x => x.id === id);
  if (!v) return id;
  return v.label.toUpperCase();
}

function normalizeBookParam(raw: string | null): string {
  if (!raw) return 'romanos';
  const t = raw.trim().toLowerCase();
  const found = bookOrder.find(b => b.toLowerCase() === t);
  return found ? found.toLowerCase() : 'romanos';
}

export default function BibleVersionComparator() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();
  
  const searchParams = useSearchParams();
  const [bookKey, setBookKey] = useState(() => normalizeBookParam(searchParams.get('book')));
  const [chapter, setChapter] = useState(() => {
    const c = parseInt(searchParams.get('chapter') ?? '8', 10);
    return Number.isFinite(c) && c >= 1 ? c : 8;
  });
  const [selectedIds, setSelectedIds] = useState<VersionId[]>(['rvr', 'nvi_es', 'kjv']);
  const [lookups, setLookups] = useState<Partial<Record<VersionId, Record<string, BibleBookData>>>>({});
  const [syncScroll, setSyncScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const numColRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const syncLock = useRef(false);

  useEffect(() => {
    colRefs.current = selectedIds.map(() => null);
  }, [selectedIds]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SYNC_KEY);
      if (raw === '0') setSyncScroll(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SYNC_KEY, syncScroll ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [syncScroll]);

  useEffect(() => {
    const b = normalizeBookParam(searchParams.get('book'));
    const ch = parseInt(searchParams.get('chapter') ?? '', 10);
    setBookKey(b);
    if (Number.isFinite(ch) && ch >= 1) setChapter(ch);
  }, [searchParams]);
  const parseAndNavigate = useCallback((query: string) => {
    const qNorm = normalizeStr(query.trim());
    if (!qNorm) return;

    let matchedOriginalName = '';
    let usedNormName = '';
    for (const name of SORTED_BOOKS_FOR_SEARCH) {
      const bNorm = normalizeStr(name);
      if (qNorm.startsWith(bNorm + ' ')) {
        matchedOriginalName = name;
        usedNormName = bNorm;
        break;
      }
    }

    if (matchedOriginalName) {
      const rest = qNorm.slice(usedNormName.length).trim();
      const match = rest.match(/^(\d+)/);
      if (match) {
        const c = parseInt(match[1], 10);
        const max = chaptersInBook(matchedOriginalName);
        if (c >= 1 && c <= max) {
          setBookKey(matchedOriginalName.toLowerCase());
          setChapter(c);
        }
      }
    }
  }, []);

  useEffect(() => {
    parseAndNavigate(searchQuery);
  }, [searchQuery, parseAndNavigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Partial<Record<VersionId, Record<string, BibleBookData>>> = {};
      await Promise.all(
        selectedIds.map(async id => {
          const lu = await loadFullBibleLookup(id);
          if (!cancelled) next[id] = lu;
        })
      );
      if (!cancelled) setLookups(prev => ({ ...prev, ...next }));
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedIds]);

  const maxChapter = chaptersInBook(bookKey);
  useEffect(() => {
    if (chapter > maxChapter) setChapter(Math.max(1, maxChapter));
  }, [bookKey, chapter, maxChapter]);

  const verseCount = useMemo(() => {
    let max = 0;
    for (const id of selectedIds) {
      const ch = lookups[id]?.[bookKey]?.chapters[chapter - 1];
      if (ch) max = Math.max(max, ch.length);
    }
    return max;
  }, [lookups, selectedIds, bookKey, chapter]);

  const loading = selectedIds.some(id => !lookups[id]);

  const matchingVerses = useMemo(() => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery) {
      return Array.from({ length: verseCount }, (_, i) => i);
    }
    const qNorm = normalizeStr(rawQuery);
    let filterText = qNorm;

    let isStructuralRef = false;
    for (const name of SORTED_BOOKS_FOR_SEARCH) {
      const bNorm = normalizeStr(name);
      if (qNorm.startsWith(bNorm + ' ')) {
        const rest = qNorm.slice(bNorm.length).trim();
        const match = rest.match(/^(\d+)(?:\s*[:.v]\s*(\d+))?/);
        if (match) {
          isStructuralRef = true;
          if (match[2]) {
            filterText = match[2];
          } else {
            filterText = '';
          }
        }
        break;
      }
    }

    if (isStructuralRef && !filterText) {
      return Array.from({ length: verseCount }, (_, i) => i);
    }

    const matches: number[] = [];
    for (let vi = 0; vi < verseCount; vi++) {
      if (String(vi + 1).includes(filterText)) {
        matches.push(vi);
        continue;
      }
      let found = false;
      for (const id of selectedIds) {
        const raw = lookups[id]?.[bookKey]?.chapters[chapter - 1]?.[vi] ?? '';
        if (normalizeStr(raw).includes(filterText)) {
          found = true;
          break;
        }
      }
      if (found) matches.push(vi);
    }
    return matches;
  }, [searchQuery, verseCount, lookups, selectedIds, bookKey, chapter]);

  const syncFrom = useCallback(
    (source: HTMLDivElement | null) => {
      if (!syncScroll || !source || syncLock.current) return;
      syncLock.current = true;
      const top = source.scrollTop;
      if (numColRef.current && numColRef.current !== source) numColRef.current.scrollTop = top;
      colRefs.current.forEach(el => {
        if (el && el !== source) el.scrollTop = top;
      });
      requestAnimationFrame(() => {
        syncLock.current = false;
      });
    },
    [syncScroll]
  );

  const removeVersion = (id: VersionId) => {
    setSelectedIds(prev => (prev.length <= 1 ? prev : prev.filter(x => x !== id)));
  };

  const addVersion = (id: VersionId) => {
    setSelectedIds(prev => (prev.includes(id) || prev.length >= 6 ? prev : [...prev, id]));
  };

  const bookDisplayName = bookOrder.find(b => b.toLowerCase() === bookKey) ?? bookKey;

  const addableVersions = READING_PLAN_VERSIONS.filter(v => !selectedIds.includes(v.id));

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-gray-900">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-gray-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Comparador de versiones
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {bookDisplayName} {chapter}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {selectedIds.map(id => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
              >
                {chipShortLabel(id)}
                <button
                  type="button"
                  onClick={() => removeVersion(id)}
                  disabled={selectedIds.length <= 1}
                  className="rounded-full p-0.5 text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-30"
                  aria-label={`Quitar ${chipShortLabel(id)}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-gray-200 bg-white text-xs font-semibold text-blue-700 shadow-sm"
                  disabled={addableVersions.length === 0}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Añadir versión
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 w-64 overflow-y-auto rounded-xl">
                {addableVersions.map(v => (
                  <DropdownMenuItem key={v.id} className="cursor-pointer text-sm" onClick={() => addVersion(v.id)}>
                    {v.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-gray-500">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Más opciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem asChild>
                  <Link href={`/biblia?book=${encodeURIComponent(bookDisplayName)}&chapter=${chapter}`}>
                    Abrir en lector web
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setBookKey('romanos');
                    setChapter(8);
                  }}
                >
                  Romanos 8 (ejemplo)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 py-1 pl-3 pr-1 border border-gray-100">
              <label htmlFor="comp-book" className="text-[10px] font-black uppercase tracking-wider text-[#B88A44]">
                Libro
              </label>
              <select
                id="comp-book"
                className="h-8 cursor-pointer rounded-lg border-0 bg-transparent py-0 pl-1 pr-7 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#B88A44]/20"
                value={bookKey}
                onChange={e => {
                  const next = e.target.value;
                  setBookKey(next);
                  setChapter(1);
                }}
              >
                {bookOrder.map(name => (
                  <option key={name} value={name.toLowerCase()}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 py-1 pl-3 pr-1 border border-gray-100">
              <label htmlFor="comp-ch" className="text-[10px] font-black uppercase tracking-wider text-[#B88A44]">
                Capítulo
              </label>
              <select
                id="comp-ch"
                className="h-8 cursor-pointer rounded-lg border-0 bg-transparent py-0 pl-1 pr-7 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#B88A44]/20"
                value={chapter}
                onChange={e => setChapter(parseInt(e.target.value, 10))}
              >
                {Array.from({ length: maxChapter }, (_, i) => i + 1).map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pl-1 sm:pl-2">
              <Link
                href={`/dashboard/biblia?book=${encodeURIComponent(bookKey)}&chapter=${chapter}`}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#B88A44]"
                title="Biblia"
                onClick={e => {
                  if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                    e.preventDefault();
                  }
                }}
              >
                <BookOpen className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/dashboard/notas"
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#B88A44]"
                title="Notas"
                onClick={e => {
                  if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                    e.preventDefault();
                  }
                }}
              >
                <StickyNote className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/dashboard/imagenes"
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#B88A44]"
                title="Imágenes"
                onClick={e => {
                  if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                    e.preventDefault();
                  }
                }}
              >
                <ImageIcon className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>

          <div className="flex flex-1 items-center px-2 sm:px-6">
            <div className="flex h-9 w-full items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1 transition-colors focus-within:border-[#B88A44] focus-within:ring-1 focus-within:ring-[#B88A44]">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar versículo, palabras..."
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    parseAndNavigate(searchQuery);
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 rounded-xl bg-gray-50 px-3 py-2 border border-gray-100 sm:bg-transparent sm:border-0 sm:px-1 sm:py-0">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 shrink-0 text-[#B88A44]" aria-hidden />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">Sincronizado</span>
            </div>
            <Switch className="data-[state=checked]:bg-[#B88A44]" checked={syncScroll} onCheckedChange={setSyncScroll} aria-label="Sincronizar desplazamiento" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[16rem] items-center justify-center text-sm text-gray-400">Cargando textos…</div>
          ) : verseCount === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No hay versículos para esta selección.</div>
          ) : (
            <>
              <div className="flex border-b border-gray-200 bg-gray-100">
                <div className="flex w-14 shrink-0 items-center justify-center border-r border-gray-200 px-1 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  V.
                </div>
                {selectedIds.map(id => (
                  <div
                    key={`h-${id}`}
                    className="flex min-w-0 flex-1 items-center border-l border-gray-200 px-3 py-3 text-[10px] font-bold uppercase leading-tight tracking-wider text-gray-500 sm:min-w-[11rem]"
                    title={VERSIONS.find(v => v.id === id)?.label}
                  >
                    <span className="line-clamp-3">{columnHeaderLabel(id)}</span>
                  </div>
                ))}
              </div>
              <div className="flex max-h-[min(70vh,36rem)]">
                <div
                  ref={numColRef}
                  className="w-14 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50/90 py-0"
                  onScroll={e => syncFrom(e.currentTarget)}
                >
                  {matchingVerses.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400">—</div>
                  ) : (
                    matchingVerses.map((vi) => (
                      <div
                        key={vi}
                        className="flex min-h-[4.25rem] items-start justify-center border-b border-gray-100 px-1 py-3 text-sm font-bold text-blue-600 last:border-b-0"
                      >
                        {vi + 1}
                      </div>
                    ))
                  )}
                </div>
                {selectedIds.map((id, ci) => (
                  <div
                    key={id}
                    ref={el => {
                      colRefs.current[ci] = el;
                    }}
                    className="min-w-0 flex-1 overflow-y-auto border-l border-gray-100 bg-white py-0 sm:min-w-[11rem]"
                    onScroll={e => syncFrom(e.currentTarget)}
                  >
                    {matchingVerses.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-400">Sin coincidencias</div>
                    ) : (
                      matchingVerses.map(vi => {
                        const raw = lookups[id]?.[bookKey]?.chapters[chapter - 1]?.[vi] ?? '';
                        const text = raw.trim() || '—';
                        const reference = `${bookDisplayName} ${chapter}:${vi + 1} (${chipShortLabel(id)})`;
                        const isSaved = savedVerses.some(sv => sv.reference === reference);
                        
                        return (
                          <div
                            key={vi}
                            className={cn(
                              'group relative min-h-[4.25rem] cursor-pointer border-b border-gray-100 px-3 py-3 text-sm leading-relaxed text-gray-800 transition-colors last:border-b-0 hover:bg-amber-50/50',
                              id === 'kjv' && 'italic',
                              isSaved && 'bg-amber-50/30'
                            )}
                            onClick={(e) => {
                               if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) return;
                               if (text === '—') return;
                               const next = [...savedVerses];
                               const idx = next.findIndex(sv => sv.reference === reference);
                               if (idx >= 0) {
                                 next.splice(idx, 1);
                                 toast({ title: 'Versículo eliminado', description: 'Se quitó de tus guardados.' });
                               } else {
                                 next.push({ text, reference, source: 'comparador' });
                                 toast({ title: 'Versículo guardado', description: 'Se añadió a tus guardados.' });
                               }
                               setSavedVerses(next);
                               try { localStorage.setItem('savedVerses', JSON.stringify(next)); } catch {}
                               window.dispatchEvent(new Event('SAVED_VERSES_CHANGED_EVENT'));
                            }}
                          >
                            <div className="pr-6">{text}</div>
                            {text !== '—' && (
                              <button
                                type="button"
                                aria-label={isSaved ? "Quitar de guardados" : "Guardar versículo"}
                                className={cn(
                                  "absolute right-3 top-4 opacity-0 transition-opacity group-hover:opacity-100",
                                  isSaved && "opacity-100"
                                )}
                              >
                                  <Bookmark className={cn("h-4 w-4", isSaved ? "fill-[#B88A44] text-[#B88A44]" : "text-gray-400 hover:text-[#B88A44]")} />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
