'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronRight, Columns, FileText, Image as ImageIcon, Languages, Loader2, Printer, Share2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { useToast } from '@/app/hooks/use-toast';
import { useNdjsonStreamBuffer } from '@/app/hooks/use-ndjson-stream-buffer';
import { commentaryAuthorShortName, isNewTestamentBookId } from '@/lib/helloao-commentaries';
import { cn } from '@/app/lib/utils';
import { useAuth, useClerk } from '@clerk/nextjs';
import { ensureClerkSignedIn } from '@/lib/require-clerk-sign-in';
import { grantEngagementPoints } from '@/lib/engagement-points';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

export type CommentaryChapterReaderProps = {
  commentaryId: string;
  bookUsfm: string;
  chapterNumber: number;
  commentaryName: string;
  bookDisplayName: string;
  bookIntroductionTeaser: string;
  chapterIntroductionTeaser: string | null;
  scriptureVerses: string[];
  bibliaBookQueryName: string;
  commentaryBlocks: { verseNumber: number; text: string }[];
  prevHref: string | null;
  nextHref: string | null;
  currentVersionId: string;
  bibleVersions: { id: string; label: string }[];
};

type UbsVerseItem = {
  type?: string;
  verse_numbers?: number[];
  lines?: string[];
};

type UbsChapter = {
  is_chapter?: boolean;
  items?: UbsVerseItem[];
};

type UbsBook = {
  name?: string;
  chapters?: UbsChapter[];
};

type UbsRoot = {
  books?: UbsBook[];
};

function normalizeBookName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^s\.\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractVersesFromUbsChapter(chapter: UbsChapter | undefined): string[] {
  const items = Array.isArray(chapter?.items) ? chapter!.items : [];
  const verseText = new Map<number, string>();
  for (const item of items) {
    if (item?.type !== 'verse' || !Array.isArray(item.verse_numbers) || item.verse_numbers.length === 0) continue;
    const text = Array.isArray(item.lines) ? item.lines.join(' ').trim() : '';
    if (!text) continue;
    for (const vn of item.verse_numbers) {
      const prev = verseText.get(vn) ?? '';
      verseText.set(vn, prev ? `${prev} ${text}`.trim() : text);
    }
  }
  const maxVerse = Math.max(0, ...verseText.keys());
  return Array.from({ length: maxVerse }, (_, i) => verseText.get(i + 1) ?? '');
}

function blockHeading(text: string, blockIndex: number, verseNumber: number): string {
  const roman = ROMAN[blockIndex] ?? String(blockIndex + 1);
  const first = text.split('\n').map(l => l.trim()).find(Boolean) ?? '';
  const short = first.length > 100 ? `${first.slice(0, 97)}…` : first;
  return `${roman}. ${short || `Comentario sobre el versículo ${verseNumber}`}`;
}

export default function CommentaryChapterReader({
  commentaryId,
  bookUsfm,
  chapterNumber,
  commentaryName,
  bookDisplayName,
  bookIntroductionTeaser,
  chapterIntroductionTeaser,
  scriptureVerses,
  bibliaBookQueryName,
  commentaryBlocks,
  prevHref,
  nextHref,
  currentVersionId,
  bibleVersions,
}: CommentaryChapterReaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();
  const [commentaryLang, setCommentaryLang] = useState<'en' | 'es' | 'pt'>('en');
  const [translations, setTranslations] = useState<string[] | null>(null);
  const [fallbackScriptureVerses, setFallbackScriptureVerses] = useState<string[]>([]);
  const [pageTranslations, setPageTranslations] = useState<{
    bookDisplayName: string;
    commentaryName: string;
    bookIntroductionTeaser: string;
    chapterIntroductionTeaser: string | null;
  } | null>(null);
  const [translating, setTranslating] = useState(false);
  const [streamTranslatedCount, setStreamTranslatedCount] = useState(0);
  const [pendingStreamEvents, setPendingStreamEvents] = useState<
    Array<{ type?: string; index?: number; text?: string; message?: string }>
  >([]);

  const textsKey = useMemo(() => commentaryBlocks.map(b => b.text).join('\u0001'), [commentaryBlocks]);
  const streamBuffer = useNdjsonStreamBuffer<{ type?: string; index?: number; text?: string; message?: string }>({
    flushMs: 120,
    onFlush: (events) => {
      setPendingStreamEvents((prev) => [...prev, ...events]);
    },
  });

  useEffect(() => {
    if (pendingStreamEvents.length === 0) return;

    const nextMap = new Map<number, string>();
    for (const event of pendingStreamEvents) {
      if (event.type === 'error') {
        toast({
          title: 'No se pudo traducir la página',
          description: event.message || 'Error en traducción por streaming.',
          variant: 'destructive',
        });
        setPendingStreamEvents([]);
        setTranslations(null);
        setPageTranslations(null);
        setStreamTranslatedCount(0);
        setCommentaryLang('en');
        return;
      }
      if (event.type === 'segment' && Number.isInteger(event.index) && typeof event.text === 'string') {
        nextMap.set(event.index as number, event.text);
      }
    }

    if (nextMap.size === 0) {
      setPendingStreamEvents([]);
      return;
    }

    const allSegments = [
      pageTranslations?.bookDisplayName || bookDisplayName,
      pageTranslations?.commentaryName || commentaryName,
      pageTranslations?.bookIntroductionTeaser || bookIntroductionTeaser,
      pageTranslations?.chapterIntroductionTeaser || chapterIntroductionTeaser || '',
      ...(translations ?? commentaryBlocks.map(b => b.text)),
    ];

    for (const [idx, text] of nextMap.entries()) {
      if (idx >= 0 && idx < allSegments.length) {
        allSegments[idx] = text;
      }
    }

    setStreamTranslatedCount(allSegments.filter(Boolean).length);
    const [tBook, tCom, tBkIntro, tChapIntro, ...tBlocks] = allSegments;
    setPageTranslations({
      bookDisplayName: tBook || bookDisplayName,
      commentaryName: tCom || commentaryName,
      bookIntroductionTeaser: tBkIntro || bookIntroductionTeaser,
      chapterIntroductionTeaser: chapterIntroductionTeaser ? (tChapIntro || chapterIntroductionTeaser) : null,
    });
    setTranslations(tBlocks.map((t, idx) => t || commentaryBlocks[idx]?.text || ''));
    setPendingStreamEvents([]);
  }, [
    pendingStreamEvents,
    toast,
    pageTranslations,
    translations,
    commentaryBlocks,
    bookDisplayName,
    commentaryName,
    bookIntroductionTeaser,
    chapterIntroductionTeaser,
  ]);

  useEffect(() => {
    if (commentaryLang === 'en') {
      setTranslations(null);
      setPageTranslations(null);
      setTranslating(false);
      setStreamTranslatedCount(0);
      streamBuffer.reset();
      setPendingStreamEvents([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setTranslating(true);
      setStreamTranslatedCount(0);
      try {
        const segmentsToTranslate = [
          bookDisplayName,
          commentaryName,
          bookIntroductionTeaser,
          chapterIntroductionTeaser || '',
          ...commentaryBlocks.map(b => b.text),
        ];

        const res = await fetch('/api/translate?stream=1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            segments: segmentsToTranslate,
            source: 'en',
            target: commentaryLang,
          }),
        });
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        const isNdjson = contentType.includes('application/x-ndjson');
        if (isNdjson && res.body && res.ok) {
          streamBuffer.reset();
          await streamBuffer.consumeResponse(res);
          return;
        }
        const data = (await res.json()) as { translations?: string[]; error?: string };
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
        if (!Array.isArray(data.translations) || data.translations.length !== segmentsToTranslate.length) {
          throw new Error('Respuesta incompleta del servicio de traducción.');
        }
        if (!cancelled) {
          const [tBook, tCom, tBkIntro, tChapIntro, ...tBlocks] = data.translations;
          setPageTranslations({
            bookDisplayName: tBook,
            commentaryName: tCom,
            bookIntroductionTeaser: tBkIntro,
            chapterIntroductionTeaser: chapterIntroductionTeaser ? tChapIntro : null,
          });
          setTranslations(tBlocks);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Intenta de nuevo más tarde.';
        toast({
          title: 'No se pudo traducir la página',
          description: msg,
          variant: 'destructive',
        });
        if (!cancelled) {
          setTranslations(null);
          setPageTranslations(null);
          setStreamTranslatedCount(0);
          setCommentaryLang('en');
        }
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();

    return () => {
      cancelled = true;
      streamBuffer.cancel();
    };
  }, [
    commentaryLang,
    textsKey,
    toast,
    bookDisplayName,
    commentaryName,
    bookIntroductionTeaser,
    chapterIntroductionTeaser,
    streamBuffer,
  ]);

  const displayBookName = pageTranslations?.bookDisplayName ?? bookDisplayName;
  const displayCommentaryName = pageTranslations?.commentaryName ?? commentaryName;
  const displayBookIntro = pageTranslations?.bookIntroductionTeaser ?? bookIntroductionTeaser;
  const displayChapIntro = pageTranslations?.chapterIntroductionTeaser ?? chapterIntroductionTeaser;

  const testamentLabel = isNewTestamentBookId(bookUsfm) ? 'Nuevo Testamento' : 'Antiguo Testamento';
  const testamentCrumb = isNewTestamentBookId(bookUsfm) ? 'NUEVO TESTAMENTO' : 'ANTIGUO TESTAMENTO';
  const bookCrumb = displayBookName.toUpperCase();
  const subtitle = displayChapIntro?.trim() || displayBookIntro?.trim() || '';
  const author = commentaryAuthorShortName(displayCommentaryName);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${displayBookName} ${chapterNumber} — ${author}`,
          text: `Comentario: ${displayCommentaryName}`,
          url,
        });
      } else if (url) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* ignore */
    }
  };

  const handleVersionChange = (newVersionId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('version', newVersionId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    let cancelled = false;
    async function loadFallbackRvrChapter() {
      if (scriptureVerses.length > 0 || currentVersionId !== 'rvr') {
        setFallbackScriptureVerses([]);
        return;
      }
      try {
        const res = await fetch('/bible/es_rvr_1960.json', { cache: 'force-cache' });
        if (!res.ok) return;
        const root = (await res.json()) as UbsRoot;
        const books = Array.isArray(root?.books) ? root.books : [];
        const target = normalizeBookName(bibliaBookQueryName || bookDisplayName);
        const book = books.find(b => normalizeBookName(b?.name ?? '') === target);
        if (!book) return;
        const chapters = (book.chapters ?? []).filter(ch => ch?.is_chapter !== false);
        const chapter = chapters[chapterNumber - 1];
        const verses = extractVersesFromUbsChapter(chapter).filter(Boolean);
        if (!cancelled) setFallbackScriptureVerses(verses);
      } catch {
        if (!cancelled) setFallbackScriptureVerses([]);
      }
    }
    void loadFallbackRvrChapter();
    return () => {
      cancelled = true;
    };
  }, [scriptureVerses, currentVersionId, bibliaBookQueryName, bookDisplayName, chapterNumber]);

  useEffect(() => {
    void grantEngagementPoints({
      action: 'bible_read',
      dedupeKey: `commentary-read:${commentaryId}:${bookUsfm}:${chapterNumber}:${currentVersionId}`,
      isSignedIn: authLoaded && isSignedIn === true,
    });
  }, [commentaryId, bookUsfm, chapterNumber, currentVersionId, authLoaded, isSignedIn]);

  const displayedScriptureVerses = scriptureVerses.length > 0 ? scriptureVerses : fallbackScriptureVerses;

  return (
    <div className="min-h-screen bg-[#f5f6f8] pb-24 print:bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 print:text-gray-600">
          <Link href="/comentarios" className="hover:text-blue-800">
            Comentarios
          </Link>
          <ChevronRight className="h-3 w-3 text-blue-400" aria-hidden />
          <Link href={`/comentarios/${commentaryId}`} className="hover:text-blue-800">
            {author}
          </Link>
          <ChevronRight className="h-3 w-3 text-blue-400" aria-hidden />
          <span className="text-gray-500">{testamentCrumb}</span>
          <ChevronRight className="h-3 w-3 text-blue-400" aria-hidden />
          <span className="max-w-[12rem] truncate text-gray-700">{bookCrumb}</span>
        </nav>

        <header className="mb-4 border-b border-gray-200 pb-4 print:border-gray-300">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{testamentLabel}</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-gray-900 sm:text-3xl">
              {displayBookName} — Capítulo {chapterNumber}
            </h1>
            {subtitle ? (
              <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-[15px] italic leading-relaxed text-gray-600">
                  {subtitle}
                </p>
              </div>
            ) : null}
          </div>
        </header>

        <TooltipProvider>
          <div className="mb-6 flex justify-center print:hidden">
            <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/dashboard/biblia?book=${bibliaBookQueryName}&chapter=${chapterNumber}&version=${currentVersionId}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    onClick={e => {
                      if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <BookOpen className="h-[18px] w-[18px]" />
                    <span className="sr-only">Biblia</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Biblia</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/comparador?book=${bibliaBookQueryName}&chapter=${chapterNumber}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    onClick={e => {
                      if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Columns className="h-[18px] w-[18px]" />
                    <span className="sr-only">Comparador</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comparador</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/notas"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    onClick={e => {
                      if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <FileText className="h-[18px] w-[18px]" />
                    <span className="sr-only">Notas</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notas</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/imagenes"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    onClick={e => {
                      if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <ImageIcon className="h-[18px] w-[18px]" />
                    <span className="sr-only">Imágenes</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Imágenes</p>
                </TooltipContent>
              </Tooltip>

              <div className="h-5 w-px bg-gray-200" aria-hidden />

              <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-2 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Versión</span>
                <Select value={currentVersionId} onValueChange={handleVersionChange}>
                  <SelectTrigger className="h-8 min-w-[12rem] border-0 bg-transparent px-2 text-xs font-semibold text-gray-700 shadow-none focus:ring-0">
                    <SelectValue placeholder="Selecciona versión" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[60vh] w-72">
                    {bibleVersions.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-5 w-px bg-gray-200" aria-hidden />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => void handlePrint()}
                  >
                    <Printer className="h-[18px] w-[18px]" />
                    <span className="sr-only">Imprimir</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Imprimir</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => void handleShare()}
                  >
                    <Share2 className="h-[18px] w-[18px]" />
                    <span className="sr-only">Compartir</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compartir</p>
                </TooltipContent>
              </Tooltip>

              <div className="h-5 w-px bg-gray-200" aria-hidden />

              <div className="flex shrink-0 items-center gap-1">
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={translating}
                          className="h-9 w-9 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                          {translating ? (
                            <Loader2 className="h-[18px] w-[18px] animate-spin" />
                          ) : (
                            <Languages className="h-[18px] w-[18px]" />
                          )}
                          <span className="sr-only">Idioma de la página</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Traducir</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem onClick={() => setCommentaryLang('en')} className="cursor-pointer">
                      Original (inglés)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCommentaryLang('es')} className="cursor-pointer">
                      Español
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCommentaryLang('pt')} className="cursor-pointer">
                      Português
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {!translating && commentaryLang !== 'en' ? (
                  <span className="pl-1 pr-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Traducido
                  </span>
                ) : null}
                {translating ? (
                  <span className="pl-1 pr-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Streaming {streamTranslatedCount}/{4 + commentaryBlocks.length}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </TooltipProvider>

        <div className="grid gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2 print:shadow-none">
          {/* Texto bíblico (RVR desde datos locales) */}
          <section className="border-b border-gray-200 lg:border-b-0 lg:border-r print:border-gray-200">
            <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3 print:bg-white">
              <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                <BookOpen className="h-4 w-4 text-[#B88A44]" />
                Texto — {bibleVersions.find(v => v.id === currentVersionId)?.label ?? 'Reina-Valera 1960'}
              </h2>
            </div>
            <div className="max-h-[min(78vh,52rem)] space-y-4 overflow-y-auto px-4 py-5 sm:px-6 print:max-h-none">
              {displayedScriptureVerses.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay texto bíblico enlazado para este código de libro ({bookUsfm}) en la versión local.
                </p>
              ) : (
                displayedScriptureVerses.map((text, i) => {
                  const vn = i + 1;
                  const t = (text ?? '').trim();
                  if (!t) return null;
                  return (
                    <p key={vn} className="text-[15px] leading-relaxed text-gray-900">
                      <span className="mr-2 align-top text-sm font-bold text-[#B88A44]">{vn}</span>
                      <span>{t}</span>
                    </p>
                  );
                })
              )}
            </div>
          </section>

          {/* Comentario HelloAO */}
          <section>
            <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3 print:bg-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-black uppercase tracking-widest text-gray-600">
                    {displayCommentaryName.toUpperCase()}
                  </h2>
                </div>
              </div>
            </div>
            <div className="max-h-[min(78vh,52rem)] space-y-8 overflow-y-auto px-4 py-6 sm:px-6 print:max-h-none">
              {commentaryBlocks.map((block, idx) => {
                const bodyText =
                  commentaryLang !== 'en' && translations?.[idx] != null ? translations[idx]! : block.text;
                return (
                  <article key={`${block.verseNumber}-${idx}`} className="border-b border-gray-100 pb-8 last:border-0">
                    <div className="flex gap-4">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B88A44] text-xs font-black text-white"
                        aria-hidden
                      >
                        {ROMAN[idx] ?? idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#B88A44]">
                          Versículo {block.verseNumber}
                        </p>
                        <h3 className="mt-1 font-display text-lg font-bold text-gray-900">
                          {blockHeading(bodyText, idx, block.verseNumber)}
                        </h3>
                        <div
                          className={cn(
                            'mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800',
                            '[&_strong]:font-semibold'
                          )}
                        >
                          {bodyText}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-center pb-8 print:hidden">
          <div className="flex items-center rounded-full bg-[#0F172A] px-6 py-2.5 shadow-xl ring-1 ring-white/10">
            {prevHref ? (
              <Link href={prevHref} className="text-sm font-semibold text-slate-300 transition-colors hover:text-white">
                Anterior
              </Link>
            ) : (
              <span className="text-sm font-semibold text-slate-600">Anterior</span>
            )}

            <div className="mx-6 flex items-center gap-3">
              <div className="flex h-7 min-w-[2rem] items-center justify-center rounded-md bg-[#B88A44] px-2 text-xs font-bold text-white shadow-sm">
                {String(chapterNumber).padStart(2, '0')}
              </div>
              {nextHref && (
                <>
                  <div className="flex h-[2px] w-16 items-center overflow-hidden rounded-full">
                    <div className="h-full w-1/2 bg-[#B88A44]"></div>
                    <div className="h-full w-1/2 bg-slate-700"></div>
                  </div>
                  <span className="text-sm font-bold text-[#B88A44]">
                    {String(chapterNumber + 1).padStart(2, '0')}
                  </span>
                </>
              )}
            </div>

            {nextHref ? (
              <Link href={nextHref} className="text-sm font-semibold text-[#B88A44] transition-colors hover:text-[#d3a55b]">
                Siguiente
              </Link>
            ) : (
              <span className="text-sm font-semibold text-slate-600">Siguiente</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
