'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, RefreshCw, Search, X, BookOpen, StickyNote, Image as ImageIcon, Bookmark } from 'lucide-react';
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
import { useToast } from '@/app/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Switch } from '@/app/components/ui/switch';
import { cn } from '@/app/lib/utils';
import { compareVerseWords } from '@/lib/bible-verse-word-diff';
import { grantEngagementPoints } from '@/lib/engagement-points';

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
    es_rvr: 'RV-JSON',
    pt_aa: 'AA',
    pt_acf: 'ACF',
    pt_nvi: 'NVI-PT',
    fr_apee: 'FR',
    de_schlachter: 'DE',
    ar_svd: 'AR',
    ru_synodal: 'RU',
    zh_cuv: 'CUV',
    zh_ncv: 'NCV',
    ko_ko: 'KO',
    vi_vietnamese: 'VI',
    ro_cornilescu: 'RO',
    fi_finnish: 'FI',
    fi_pr: 'FI-PR',
    eo_esperanto: 'EO',
  };
  return custom[id] ?? id.toUpperCase();
}

function columnHeaderLabel(id: VersionId): string {
  const v = VERSIONS.find(x => x.id === id);
  if (!v) return id;
  return v.label.toUpperCase();
}

function VerseDiffBlock({
  baselineText,
  text,
  isBaseline,
  italic,
}: {
  baselineText: string;
  text: string;
  isBaseline: boolean;
  italic?: boolean;
}) {
  const baseTrim = baselineText.trim();
  const textTrim = text.trim();

  if (isBaseline) {
    return (
      <div className={cn(italic && 'italic')}>
        <p className="leading-relaxed">{textTrim || '—'}</p>
        <p className="mt-2 text-[11px] leading-tight text-gray-400">0% de diferencia</p>
      </div>
    );
  }

  if (text === '—' || !textTrim || !baseTrim) {
    return (
      <div className={cn(italic && 'italic')}>
        <p className="leading-relaxed">{textTrim || '—'}</p>
        <p className="mt-2 text-[11px] leading-tight text-gray-400">
          {!baseTrim || !textTrim ? '—' : '100% de diferencia'}
        </p>
      </div>
    );
  }

  const diff = compareVerseWords(baseTrim, textTrim);
  if (!diff) {
    return (
      <div className={cn(italic && 'italic')}>
        <p className="leading-relaxed">{textTrim}</p>
        <p className="mt-2 text-[11px] text-gray-400">0% de diferencia</p>
      </div>
    );
  }

  const { ops, percentDiff, baseWords, targetWords } = diff;
  return (
    <div className={cn(italic && 'italic')}>
      <p className="leading-relaxed">
        {ops.map((op, idx) => {
          if (op.kind === 'equal') {
            return <span key={idx}>{targetWords[op.targetIndex]} </span>;
          }
          if (op.kind === 'delete') {
            return (
              <span key={idx} className="text-gray-500 line-through decoration-gray-400">
                {baseWords[op.baseIndex]}{' '}
              </span>
            );
          }
          return (
            <span
              key={idx}
              className="font-medium text-[#B88A44] underline decoration-[#B88A44] decoration-2 underline-offset-[3px]"
            >
              {targetWords[op.targetIndex]}{' '}
            </span>
          );
        })}
      </p>
      <p className="mt-2 text-[11px] leading-tight text-gray-400">{percentDiff}% de diferencia</p>
    </div>
  );
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
  const { toast } = useToast();
  
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
  const [savedVerses, setSavedVerses] = useState<{ text: string; reference: string; source?: string }[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedVerses');
      if (stored) setSavedVerses(JSON.parse(stored));
    } catch {}
    const onChanged = () => {
      try {
        const stored = localStorage.getItem('savedVerses');
        if (stored) setSavedVerses(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener('SAVED_VERSES_CHANGED_EVENT', onChanged);
    return () => window.removeEventListener('SAVED_VERSES_CHANGED_EVENT', onChanged);
  }, []);

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

  useEffect(() => {
    if (loading) return;
    if (verseCount === 0) return;
    void grantEngagementPoints({
      action: 'bible_read',
      dedupeKey: `comparador-read:${bookKey}:${chapter}:${selectedIds.join(',')}`,
      isSignedIn: authLoaded && isSignedIn === true,
    });
  }, [loading, verseCount, bookKey, chapter, selectedIds, authLoaded, isSignedIn]);

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

  const toggleSaveVerse = useCallback(
    (reference: string, text: string) => {
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
      try {
        localStorage.setItem('savedVerses', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event('SAVED_VERSES_CHANGED_EVENT'));
    },
    [authLoaded, isSignedIn, redirectToSignIn, savedVerses, toast]
  );

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-gray-900">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-4 flex flex-col gap-3 border-b border-gray-200/80 pb-4 sm:mb-6 sm:gap-4 sm:pb-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 pr-2">
            <h1 className="font-display text-lg font-bold tracking-tight text-gray-900 sm:text-xl md:text-2xl">
              Comparador de versiones
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {bookDisplayName} {chapter}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {selectedIds.map(id => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#B88A44]/12 px-2.5 py-1.5 text-xs font-bold text-[#8a6a32] sm:px-3"
              >
                {chipShortLabel(id)}
                <button
                  type="button"
                  onClick={() => removeVersion(id)}
                  disabled={selectedIds.length <= 1}
                  className="inline-flex h-7 w-7 min-h-[28px] min-w-[28px] items-center justify-center rounded-full text-[#B88A44] transition-colors hover:bg-[#B88A44]/15 disabled:opacity-30 sm:h-6 sm:w-6"
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
                  className="h-10 min-h-[44px] rounded-full border-gray-200 bg-white px-3 text-xs font-semibold text-[#8a6a32] shadow-sm sm:h-8 sm:min-h-0"
                  disabled={addableVersions.length === 0}
                >
                  <Plus className="mr-1 h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  Añadir versión
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[min(70vh,24rem)] w-[min(100vw-2rem,16rem)] overflow-y-auto rounded-xl">
                {addableVersions.map(v => (
                  <DropdownMenuItem key={v.id} className="cursor-pointer text-sm" onClick={() => addVersion(v.id)}>
                    {v.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="mb-4 grid grid-cols-1 gap-2.5 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:mb-6 lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:p-2.5">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
            <div className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 py-1 pl-2.5 pr-1 sm:min-h-0 sm:pl-3">
              <label htmlFor="comp-book" className="shrink-0 text-[10px] font-black uppercase tracking-wider text-[#B88A44]">
                Libro
              </label>
              <select
                id="comp-book"
                className="h-10 min-h-0 flex-1 cursor-pointer rounded-lg border-0 bg-transparent py-0 pl-1 pr-6 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#B88A44]/20 sm:h-8"
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

            <div className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 py-1 pl-2.5 pr-1 sm:min-h-0 sm:pl-3">
              <label htmlFor="comp-ch" className="shrink-0 text-[10px] font-black uppercase tracking-wider text-[#B88A44]">
                Capítulo
              </label>
              <select
                id="comp-ch"
                className="h-10 min-h-0 flex-1 cursor-pointer rounded-lg border-0 bg-transparent py-0 pl-1 pr-6 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#B88A44]/20 sm:h-8"
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

            <div className="col-span-2 flex items-center justify-center gap-0.5 border-t border-gray-100 pt-2 sm:col-span-1 sm:border-0 sm:pt-0 sm:pl-2">
              <Link
                href={`/dashboard/biblia?book=${encodeURIComponent(bookKey)}&chapter=${chapter}`}
                className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#B88A44] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                title="Biblia"
                onClick={e => {
                  if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                    e.preventDefault();
                  }
                }}
              >
                <BookOpen className="h-5 w-5 sm:h-[18px] sm:w-[18px]" />
              </Link>
              <Link
                href="/dashboard/notas"
                className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#B88A44] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                title="Notas"
                onClick={e => {
                  if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                    e.preventDefault();
                  }
                }}
              >
                <StickyNote className="h-5 w-5 sm:h-[18px] sm:w-[18px]" />
              </Link>
              <Link
                href="/dashboard/imagenes"
                className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#B88A44] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                title="Imágenes"
                onClick={e => {
                  if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                    e.preventDefault();
                  }
                }}
              >
                <ImageIcon className="h-5 w-5 sm:h-[18px] sm:w-[18px]" />
              </Link>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center lg:px-4">
            <div className="flex h-11 w-full items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 transition-colors focus-within:border-[#B88A44] focus-within:ring-1 focus-within:ring-[#B88A44] sm:h-9 sm:px-4">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar versículo, palabras…"
                className="min-w-0 flex-1 bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400 sm:text-sm"
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

          <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 sm:justify-end lg:border-0 lg:bg-transparent lg:px-1 lg:py-0">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 shrink-0 text-[#B88A44]" aria-hidden />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">Sincronizado</span>
            </div>
            <Switch
              className="h-7 w-11 shrink-0 scale-110 data-[state=checked]:bg-[#B88A44] sm:scale-100"
              checked={syncScroll}
              onCheckedChange={setSyncScroll}
              aria-label="Sincronizar desplazamiento"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[16rem] items-center justify-center text-sm text-gray-400">Cargando textos…</div>
          ) : verseCount === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No hay versículos para esta selección.</div>
          ) : (
            <>
              {/* Móvil y tablet: una tarjeta por versículo; texto a ancho completo */}
              <div className="lg:hidden">
                {matchingVerses.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400">Sin coincidencias para esta búsqueda.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                {matchingVerses.map(vi => {
                  const baselineRaw = lookups[selectedIds[0]]?.[bookKey]?.chapters[chapter - 1]?.[vi] ?? '';
                  return (
                  <article key={vi} className="px-3 py-4 sm:px-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg bg-[#B88A44]/12 text-base font-bold text-[#B88A44]">
                        {vi + 1}
                      </span>
                      <span className="truncate text-xs text-gray-400">
                        {bookDisplayName} {chapter}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {selectedIds.map(id => {
                        const raw = lookups[id]?.[bookKey]?.chapters[chapter - 1]?.[vi] ?? '';
                        const text = raw.trim() || '—';
                        const reference = `${bookDisplayName} ${chapter}:${vi + 1} (${chipShortLabel(id)})`;
                        const isSaved = savedVerses.some(sv => sv.reference === reference);
                        const isBaseline = id === selectedIds[0];
                        return (
                          <div
                            key={id}
                            role={text === '—' ? undefined : 'button'}
                            tabIndex={text === '—' ? undefined : 0}
                            className={cn(
                              'relative rounded-xl border border-gray-100 bg-gray-50/70 p-3 transition-colors',
                              text !== '—' && 'cursor-pointer active:bg-amber-50/60',
                              isSaved && 'border-amber-200/80 bg-amber-50/40'
                            )}
                            onClick={() => text !== '—' && toggleSaveVerse(reference, text)}
                            onKeyDown={e => {
                              if (text === '—') return;
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleSaveVerse(reference, text);
                              }
                            }}
                          >
                            <div className="mb-1.5 flex items-start justify-between gap-2">
                              <span
                                className="text-[10px] font-black uppercase tracking-wider text-[#B88A44]"
                                title={VERSIONS.find(v => v.id === id)?.label}
                              >
                                {chipShortLabel(id)}
                                {isBaseline && (
                                  <span className="ml-1 font-normal normal-case text-gray-400">· ref.</span>
                                )}
                              </span>
                              {text !== '—' && (
                                <button
                                  type="button"
                                  aria-label={isSaved ? 'Quitar de guardados' : 'Guardar versículo'}
                                  className="-m-1.5 inline-flex shrink-0 rounded-md p-2 text-gray-400 hover:bg-white/80 hover:text-[#B88A44]"
                                  onClick={e => {
                                    e.stopPropagation();
                                    toggleSaveVerse(reference, text);
                                  }}
                                >
                                  <Bookmark
                                    className={cn('h-5 w-5', isSaved ? 'fill-[#B88A44] text-[#B88A44]' : '')}
                                  />
                                </button>
                              )}
                            </div>
                            <div className="text-[1.05rem] text-gray-800 sm:text-base">
                              <VerseDiffBlock
                                baselineText={baselineRaw}
                                text={text}
                                isBaseline={isBaseline}
                                italic={id === 'kjv'}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                  );
                })}
                  </div>
                )}
              </div>

              {/* Escritorio: columnas sincronizadas */}
              <div className="hidden lg:block">
                <div className="flex border-b border-gray-200 bg-gray-100">
                  <div className="flex w-14 shrink-0 items-center justify-center border-r border-gray-200 px-1 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    V.
                  </div>
                  {selectedIds.map((id, hi) => (
                    <div
                      key={`h-${id}`}
                      className="flex min-w-[12rem] flex-1 items-center border-l border-gray-200 px-3 py-3 text-[10px] font-bold uppercase leading-tight tracking-wider text-gray-500 xl:min-w-[14rem]"
                      title={VERSIONS.find(v => v.id === id)?.label}
                    >
                      <span className="line-clamp-2 xl:line-clamp-3">
                        {columnHeaderLabel(id)}
                        {hi === 0 && <span className="ml-1 font-normal normal-case text-gray-400">(ref.)</span>}
                      </span>
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
                      matchingVerses.map(vi => (
                        <div
                          key={vi}
                          className="flex min-h-[5.5rem] items-start justify-center border-b border-gray-100 px-1 py-3 text-sm font-bold text-[#B88A44] last:border-b-0"
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
                      className="min-w-[12rem] flex-1 overflow-y-auto border-l border-gray-100 bg-white py-0 xl:min-w-[14rem]"
                      onScroll={e => syncFrom(e.currentTarget)}
                    >
                      {matchingVerses.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-400">Sin coincidencias</div>
                      ) : (
                        matchingVerses.map(vi => {
                          const baselineRaw =
                            lookups[selectedIds[0]]?.[bookKey]?.chapters[chapter - 1]?.[vi] ?? '';
                          const raw = lookups[id]?.[bookKey]?.chapters[chapter - 1]?.[vi] ?? '';
                          const text = raw.trim() || '—';
                          const reference = `${bookDisplayName} ${chapter}:${vi + 1} (${chipShortLabel(id)})`;
                          const isSaved = savedVerses.some(sv => sv.reference === reference);
                          const isBaseline = id === selectedIds[0];

                          return (
                            <div
                              key={vi}
                              className={cn(
                                'group relative min-h-[5.5rem] cursor-pointer border-b border-gray-100 px-3 py-3 text-sm text-gray-800 transition-colors last:border-b-0 hover:bg-amber-50/50',
                                isSaved && 'bg-amber-50/30'
                              )}
                              onClick={() => toggleSaveVerse(reference, text)}
                            >
                              <div className="pr-8">
                                <VerseDiffBlock
                                  baselineText={baselineRaw}
                                  text={text}
                                  isBaseline={isBaseline}
                                  italic={id === 'kjv'}
                                />
                              </div>
                              {text !== '—' && (
                                <button
                                  type="button"
                                  aria-label={isSaved ? 'Quitar de guardados' : 'Guardar versículo'}
                                  className={cn(
                                    'absolute right-2 top-3 rounded-md p-1.5 opacity-0 transition-opacity hover:bg-white/80 group-hover:opacity-100',
                                    isSaved && 'opacity-100'
                                  )}
                                  onClick={e => {
                                    e.stopPropagation();
                                    toggleSaveVerse(reference, text);
                                  }}
                                >
                                  <Bookmark
                                    className={cn(
                                      'h-4 w-4',
                                      isSaved ? 'fill-[#B88A44] text-[#B88A44]' : 'text-gray-400 hover:text-[#B88A44]'
                                    )}
                                  />
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
