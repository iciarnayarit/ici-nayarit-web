'use client';

import { memo, type MutableRefObject } from 'react';
import {
  Bookmark,
  Copy,
  ImagePlus,
  Share2,
  StickyNote,
} from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import { ensureClerkSignedIn, type RedirectToSignInFn } from '@/lib/require-clerk-sign-in';
import { grantEngagementPoints } from '@/lib/engagement-points';
import { stripWordForSpeech } from '@/lib/huichol-word-speech';
import { tokenizeVerseWords } from '@/lib/huichol-audio-verse-sync';
import type { Dispatch, SetStateAction } from 'react';

const VERSE_HIGHLIGHT_CLASS_BY_COLOR: Record<string, string> = {
  yellow: 'bg-[#FFF9D6] text-[#B88A44]',
  green: 'bg-[#E6F8F0] text-[#10B981]',
  blue: 'bg-[#EEF4FF] text-[#3B82F6]',
  pink: 'bg-[#FDF2F8] text-[#EC4899]',
  purple: 'bg-[#F5F3FF] text-[#8B5CF6]',
  orange: 'bg-[#FFF7ED] text-[#F97316]',
  red: 'bg-[#FEE2E2] text-[#DC2626]',
  cyan: 'bg-[#ECFEFF] text-[#0891B2]',
  teal: 'bg-[#CCFBF1] text-[#0D9488]',
  indigo: 'bg-[#EEF2FF] text-[#4F46E5]',
  slate: 'bg-[#F1F5F9] text-[#475569]',
};

export type BibleVerseToolbarSnapshot = {
  showColorPicker: boolean;
  selectedHighlightColor: string;
  selectedVersesKey: string;
  hideForHuicholAudio: boolean;
  allSelectedBookmarked: boolean;
};

export type BibleVerseToolbarActions = {
  authLoaded: boolean;
  isSignedIn: boolean | undefined;
  redirectToSignIn: RedirectToSignInFn;
  setShowColorPicker: (v: boolean | ((b: boolean) => boolean)) => void;
  setSelectedHighlightColor: (c: string) => void;
  selectedVerses: number[];
  selectedBook: string;
  selectedChapter: number;
  highlightedVerses: Record<string, string>;
  setHighlightedVerses: Dispatch<SetStateAction<Record<string, string>>>;
  verses: string[];
  setIsNoteOpen: (v: boolean) => void;
  openStudioForSocialImage: () => void;
  handleBookmarkSelectedVerses: () => void;
  handleShareVerse: (text: string, verseNumber: number) => void | Promise<void>;
};

export type BibleVerseRowApi = {
  skipNextVerseParagraphClickRef: MutableRefObject<boolean>;
  flushHuicholVerseParagraphClickTimer: () => void;
  queueHuicholVerseParagraphClick: (verseNumber: number) => void;
  handleVerseClick: (verseNumber: number) => void;
  onVerseParagraphClick: (verseNumber: number) => void;
  onVerseSupClick: (verseNumber: number) => void;
  onHuicholWordSpanClick: (verseNumber: number, defaultHighlightColor: string) => void;
  onHuicholWordSpanDoubleClick: (verseNumber: number, raw: string) => void;
  onHuicholParagraphMouseUp: (verseNumber: number, raw: string) => void;
  readerBookTitle: string;
  selectedBook: string;
  selectedChapter: number;
};

export type MemoVerseRowProps = {
  verseNumber: number;
  verseIndex0: number;
  verseText: string;
  selectedChapter: number;
  showSectionTitle: boolean;
  sectionTitle: string;
  isSelected: boolean;
  isLastSelected: boolean;
  storedHighlightColorId: string | undefined;
  activeColorId: string | undefined;
  isAudioFollowing: boolean;
  isHuichol: boolean;
  themeText: string;
  themeTitle: string;
  themeSubtitle: string;
  themeButtonHover: string;
  showHuicholKaraokeSpans: boolean;
  huicholKaraokeWordIndex: number;
  activeToolbar: BibleVerseToolbarSnapshot | null;
  verseRowApiRef: MutableRefObject<BibleVerseRowApi | null>;
  toolbarActionsRef: MutableRefObject<BibleVerseToolbarActions | null>;
};

function BibleVerseActiveToolbar({
  snapshot,
  toolbarActionsRef,
}: {
  snapshot: BibleVerseToolbarSnapshot;
  toolbarActionsRef: MutableRefObject<BibleVerseToolbarActions | null>;
}) {
  const { toast } = useToast();
  const a = toolbarActionsRef.current;
  if (snapshot.hideForHuicholAudio || !a) return null;

  const {
    authLoaded,
    isSignedIn,
    redirectToSignIn,
    setShowColorPicker,
    setSelectedHighlightColor,
    selectedVerses,
    selectedBook,
    selectedChapter,
    highlightedVerses,
    setHighlightedVerses,
    verses,
    setIsNoteOpen,
    openStudioForSocialImage,
    handleBookmarkSelectedVerses,
    handleShareVerse,
  } = a;

  return (
    <div className="absolute left-1/2 bottom-full z-50 mb-1.5 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center gap-2 pointer-events-auto">
      {snapshot.showColorPicker && (
        <div className="flex max-w-[min(100vw-2rem,420px)] shrink-0 flex-wrap justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-2.5 py-2 shadow-xl animate-in fade-in zoom-in duration-200">
          {[
            { id: 'yellow', color: 'bg-[#FCEBA2]' },
            { id: 'green', color: 'bg-[#BBF7D0]' },
            { id: 'blue', color: 'bg-[#BFDBFE]' },
            { id: 'pink', color: 'bg-[#FBCFE8]' },
            { id: 'purple', color: 'bg-[#E9D5FF]' },
            { id: 'orange', color: 'bg-[#FED7AA]' },
            { id: 'red', color: 'bg-[#FECACA]' },
            { id: 'cyan', color: 'bg-[#A5F3FC]' },
            { id: 'teal', color: 'bg-[#99F6E4]' },
            { id: 'indigo', color: 'bg-[#C7D2FE]' },
            { id: 'slate', color: 'bg-[#CBD5E1]' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn)) return;
                const newHighlights = { ...highlightedVerses };
                selectedVerses.forEach((v) => {
                  newHighlights[`${selectedBook} ${selectedChapter}:${v}`] = c.id;
                });
                setHighlightedVerses(newHighlights);
                localStorage.setItem('highlightedVerses', JSON.stringify(newHighlights));
                setSelectedHighlightColor(c.id);
                setShowColorPicker(false);
                const firstSelected = [...selectedVerses].sort((x, y) => x - y)[0];
                if (firstSelected) {
                  void grantEngagementPoints({
                    action: 'bible_highlight',
                    dedupeKey: `highlight:${selectedBook} ${selectedChapter}:${firstSelected}:${c.id}`,
                    isSignedIn: authLoaded && isSignedIn === true,
                  });
                }
                toast({
                  title: selectedVerses.length > 1 ? `${selectedVerses.length} versículos resaltados` : 'Resaltado guardado',
                });
              }}
              className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${c.color} ${
                snapshot.selectedHighlightColor === c.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            />
          ))}
        </div>
      )}
      <div className="relative max-w-[calc(100vw-2rem)] min-w-0 rounded-[10px] bg-[#1F2937] shadow-xl">
        <div
          className="pointer-events-none absolute -bottom-[5px] left-1/2 z-0 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-sm bg-[#1F2937]"
          aria-hidden
        />
        <div className="relative z-40 flex items-center space-x-0.5 overflow-x-auto px-1.5 py-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!snapshot.showColorPicker && !ensureClerkSignedIn(authLoaded, isSignedIn === true, redirectToSignIn))
                return;
              setShowColorPicker((p) => !p);
            }}
            className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-[11px] font-semibold tracking-wide text-white transition-colors hover:bg-white/10 ${
              snapshot.showColorPicker ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1F2937]' : ''
            }`}
          >
            <span className="-mt-0.5 text-[9px] text-white" aria-hidden>
              ▲
            </span>{' '}
            Resaltar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsNoteOpen(true);
            }}
            className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-[11px] font-semibold tracking-wide text-white transition-colors hover:bg-white/10"
          >
            <StickyNote className="h-3.5 w-3.5" /> Nota
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openStudioForSocialImage();
            }}
            className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-[11px] font-semibold tracking-wide text-white transition-colors hover:bg-white/10"
            title="Generar imagen para redes sociales"
            aria-label="Generar imagen para redes sociales"
          >
            <ImagePlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Imagen
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBookmarkSelectedVerses();
            }}
            className="shrink-0 rounded-md p-2 transition-colors hover:bg-white/10"
          >
            <Bookmark
              className={`h-3.5 w-3.5 transition-all ${
                snapshot.allSelectedBookmarked ? 'fill-white text-white' : 'fill-none text-gray-300'
              }`}
            />
          </button>
          <div className="mx-1 h-5 w-px shrink-0 bg-white/10" />
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation();
              const sorted = [...selectedVerses].sort((x, y) => x - y);
              const text = sorted.map((v) => `${v} ${verses[v - 1]}`).join('\n');
              await navigator.clipboard.writeText(text);
              toast({ title: 'Copiado' });
            }}
            className="shrink-0 rounded-md p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const sorted = [...selectedVerses].sort((x, y) => x - y);
              const combinedText = sorted.map((v) => verses[v - 1]).join(' ');
              void handleShareVerse(combinedText, sorted[0]);
            }}
            className="shrink-0 rounded-md p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function verseRowPropsAreEqual(prev: MemoVerseRowProps, next: MemoVerseRowProps): boolean {
  if (
    prev.verseNumber !== next.verseNumber ||
    prev.verseIndex0 !== next.verseIndex0 ||
    prev.verseText !== next.verseText ||
    prev.selectedChapter !== next.selectedChapter ||
    prev.showSectionTitle !== next.showSectionTitle ||
    prev.sectionTitle !== next.sectionTitle ||
    prev.isSelected !== next.isSelected ||
    prev.isLastSelected !== next.isLastSelected ||
    prev.storedHighlightColorId !== next.storedHighlightColorId ||
    prev.activeColorId !== next.activeColorId ||
    prev.isAudioFollowing !== next.isAudioFollowing ||
    prev.isHuichol !== next.isHuichol ||
    prev.themeText !== next.themeText ||
    prev.themeTitle !== next.themeTitle ||
    prev.themeSubtitle !== next.themeSubtitle ||
    prev.themeButtonHover !== next.themeButtonHover ||
    prev.showHuicholKaraokeSpans !== next.showHuicholKaraokeSpans ||
    prev.huicholKaraokeWordIndex !== next.huicholKaraokeWordIndex
  ) {
    return false;
  }
  const pt = prev.activeToolbar;
  const nt = next.activeToolbar;
  if (pt === nt) return true;
  if (!pt || !nt) return false;
  return (
    pt.showColorPicker === nt.showColorPicker &&
    pt.selectedHighlightColor === nt.selectedHighlightColor &&
    pt.selectedVersesKey === nt.selectedVersesKey &&
    pt.hideForHuicholAudio === nt.hideForHuicholAudio &&
    pt.allSelectedBookmarked === nt.allSelectedBookmarked
  );
}

function MemoVerseRowInner(props: MemoVerseRowProps) {
  const {
    verseNumber,
    verseIndex0,
    verseText,
    selectedChapter,
    showSectionTitle,
    sectionTitle,
    isSelected,
    isLastSelected,
    storedHighlightColorId,
    activeColorId,
    isAudioFollowing,
    isHuichol,
    themeText,
    themeTitle,
    themeSubtitle,
    themeButtonHover,
    showHuicholKaraokeSpans,
    huicholKaraokeWordIndex,
    activeToolbar,
    verseRowApiRef,
    toolbarActionsRef,
  } = props;

  const api = verseRowApiRef.current;
  const isHighlighted = Boolean(storedHighlightColorId);
  const activeHlStyles = activeColorId ? VERSE_HIGHLIGHT_CLASS_BY_COLOR[activeColorId] ?? '' : '';
  const containerClasses =
    isSelected || isHighlighted || isAudioFollowing
      ? `${activeHlStyles} px-4 py-3 -mx-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]${
          isAudioFollowing && !isSelected && !isHighlighted ? ' ring-2 ring-[#B88A44]/45' : ''
        }`
      : `${themeButtonHover} py-0.5 cursor-pointer`;

  const k =
    showHuicholKaraokeSpans && huicholKaraokeWordIndex >= 0
      ? { verseNumber, wordIndex: huicholKaraokeWordIndex }
      : null;

  return (
    <div
      id={`verse-${verseNumber}`}
      data-verse={verseNumber}
      className={`relative rounded-xl transition-all duration-200 ${isLastSelected ? 'z-40' : isAudioFollowing ? 'z-30' : ''} ${containerClasses}`}
    >
      {showSectionTitle && (
        <p
          className={`mb-4 whitespace-pre-line font-sans text-[1.8rem] font-bold leading-tight tracking-tight ${verseIndex0 === 0 ? 'mt-0' : 'mt-8'} ${themeTitle}`}
        >
          {sectionTitle}
        </p>
      )}
      {isLastSelected && activeToolbar && (
        <BibleVerseActiveToolbar snapshot={activeToolbar} toolbarActionsRef={toolbarActionsRef} />
      )}
      <p
        className={`flex-grow text-justify leading-[1.58] tracking-[0.002em] transition-colors duration-300 ${
          isSelected || isHighlighted || isAudioFollowing ? 'font-medium' : ''
        }`}
        onClick={() => api?.onVerseParagraphClick(verseNumber)}
        onDoubleClick={() => {
          if (!isHuichol || !api) return;
          api.flushHuicholVerseParagraphClickTimer();
          requestAnimationFrame(() => {
            const sel = window.getSelection();
            const raw = (sel?.toString() ?? '')
              .replace(/\u00a0/g, ' ')
              .trim();
            if (!raw || /\s/.test(raw)) return;
            api.onHuicholWordSpanDoubleClick(verseNumber, raw);
            sel?.removeAllRanges();
          });
        }}
        onMouseUp={(e) => {
          if (!isHuichol || !api) return;
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
          const range = sel.getRangeAt(0);
          const root = range.commonAncestorContainer;
          const el = root.nodeType === Node.ELEMENT_NODE ? (root as Element) : root.parentElement;
          if (!el || !e.currentTarget.contains(el)) return;
          const raw = sel.toString().replace(/\u00a0/g, ' ').trim();
          if (!raw || /\s/.test(raw)) return;
          api.onHuicholParagraphMouseUp(verseNumber, raw);
          sel.removeAllRanges();
        }}
      >
        {verseIndex0 === 0 && (
          <span className={`mr-2.5 inline-block align-top text-[2.45em] font-bold leading-[0.86] ${themeTitle}`}>
            {selectedChapter}
          </span>
        )}
        <sup
          className={`mr-2 cursor-pointer text-[60%] font-bold align-top ${verseIndex0 === 0 ? 'hidden' : ''} ${
            isSelected || isHighlighted || isAudioFollowing ? '' : themeSubtitle
          }`}
          onClick={(e) => {
            e.stopPropagation();
            api?.onVerseSupClick(verseNumber);
          }}
        >
          {verseNumber}
        </sup>
        {(() => {
          if (!isHuichol) {
            return verseText;
          }
          if (!showHuicholKaraokeSpans || k == null) {
            return verseText;
          }
          const words = tokenizeVerseWords(verseText);
          if (!words.length) return verseText;
          return (
            <span className="inline leading-relaxed">
              {words.map((w, wi) => {
                const spoken = k != null && wi <= k.wordIndex;
                const current = k != null && wi === k.wordIndex;
                const underline = spoken
                  ? current
                    ? 'underline decoration-[#B88A44] decoration-2 underline-offset-[4px]'
                    : 'underline decoration-gray-400/80 decoration-1 underline-offset-[3px]'
                  : '';
                return (
                  <span key={`${verseIndex0}-hw-${wi}`} className="inline">
                    <span
                      data-huichol-word
                      className={`cursor-pointer rounded-sm px-0.5 transition-[color,font-weight,text-decoration,background-color] duration-100 ${
                        spoken ? 'font-bold text-gray-900' : themeText
                      } ${underline} hover:bg-orange-50/80 active:bg-orange-100/90`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (!api) return;
                        api.flushHuicholVerseParagraphClickTimer();
                        const defaultHl = storedHighlightColorId || 'blue';
                        api.onHuicholWordSpanClick(verseNumber, defaultHl);
                      }}
                      onDoubleClick={(ev) => {
                        ev.stopPropagation();
                        ev.preventDefault();
                        if (!api) return;
                        api.flushHuicholVerseParagraphClickTimer();
                        const speech = stripWordForSpeech(w);
                        if (!speech) return;
                        api.onHuicholWordSpanDoubleClick(verseNumber, w);
                      }}
                    >
                      {w}
                    </span>
                    {wi < words.length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </span>
          );
        })()}
      </p>
    </div>
  );
}

export const MemoVerseRow = memo(MemoVerseRowInner, verseRowPropsAreEqual);
