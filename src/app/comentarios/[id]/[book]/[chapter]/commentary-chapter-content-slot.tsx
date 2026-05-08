import { notFound } from 'next/navigation';
import CommentaryChapterReader from '@/app/comentarios/[id]/[book]/[chapter]/commentary-chapter-reader';
import { bookOrder, type BibleBookData } from '@/lib/bible-data';
import {
  fetchCommentaryChapterJson,
  helloAoChapterApiPathToInternal,
} from '@/lib/helloao-commentaries';
import { isValidReadingPlanVersionId, loadFullBibleLookup, type VersionId, VERSIONS } from '@/lib/bible-versions';
import { usfmToSpanishBibleDataKey } from '@/lib/helloao-usfm-to-spanish-key';

type Props = {
  commentaryId: string;
  book: string;
  chapter: number;
  versionParam?: string;
};

function bibliaQueryBookName(spanishKey: string | null): string {
  if (!spanishKey) return '';
  const found = bookOrder.find(b => b.toLowerCase() === spanishKey);
  return found ?? spanishKey;
}

function normalizeBookKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^s\.\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveBookFromLookup(
  lookup: Record<string, BibleBookData>,
  spanishKey: string | null
): BibleBookData | null {
  if (!spanishKey) return null;
  const exact = lookup[spanishKey];
  if (exact) return exact;

  const target = normalizeBookKey(spanishKey);
  const matchedKey = Object.keys(lookup).find(key => normalizeBookKey(key) === target);
  return matchedKey ? lookup[matchedKey] ?? null : null;
}

export default async function CommentaryChapterContentSlot({
  commentaryId,
  book,
  chapter,
  versionParam,
}: Props) {
  const data = await fetchCommentaryChapterJson(commentaryId, book, chapter);
  if (!data) notFound();

  const versionId: VersionId = isValidReadingPlanVersionId(versionParam || 'rvr') ? (versionParam as VersionId) : 'rvr';
  const usfmBookId = data.book.id || book;
  const spanishKey = usfmToSpanishBibleDataKey(usfmBookId);

  let scriptureVerses: string[] = [];
  if (spanishKey) {
    try {
      const lookup = await loadFullBibleLookup(versionId);
      const bookData = resolveBookFromLookup(lookup, spanishKey);
      scriptureVerses = bookData?.chapters[chapter - 1] ?? [];
    } catch (error) {
      console.error(
        '[comentarios] No se pudo cargar texto bíblico local',
        { commentaryId, book, chapter, versionId },
        error
      );
      scriptureVerses = [];
    }
  }

  const intro = (data.book.introduction ?? '').replace(/\s+/g, ' ').trim();
  const bookIntroductionTeaser = intro.length > 400 ? `${intro.slice(0, 397)}…` : intro || data.commentary.englishName;

  const chIntro = (data.chapter.introduction ?? '').replace(/\s+/g, ' ').trim();
  const chapterIntroductionTeaser = chIntro
    ? chIntro.length > 220
      ? `${chIntro.slice(0, 217)}…`
      : chIntro
    : null;

  const commentaryBlocks = data.chapter.content
    .filter((x): x is { type: 'verse'; number: number; content: string[] } => x.type === 'verse' && Array.isArray(x.content))
    .map(x => ({
      verseNumber: x.number,
      text: x.content.join('\n\n'),
    }));

  const prevHref = helloAoChapterApiPathToInternal(data.previousChapterApiLink);
  const nextHref = helloAoChapterApiPathToInternal(data.nextChapterApiLink);

  return (
    <CommentaryChapterReader
      commentaryId={commentaryId}
      bookUsfm={book.toUpperCase()}
      chapterNumber={chapter}
      commentaryName={data.commentary.name}
      bookDisplayName={data.book.commonName ?? data.book.name}
      bookIntroductionTeaser={bookIntroductionTeaser}
      chapterIntroductionTeaser={chapterIntroductionTeaser}
      scriptureVerses={scriptureVerses}
      bibliaBookQueryName={bibliaQueryBookName(spanishKey)}
      commentaryBlocks={commentaryBlocks}
      prevHref={prevHref}
      nextHref={nextHref}
      currentVersionId={versionId}
      bibleVersions={VERSIONS}
    />
  );
}

