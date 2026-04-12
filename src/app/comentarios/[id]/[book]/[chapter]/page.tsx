import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/app/components/footer';
import CommentaryChapterReader from '@/app/comentarios/[id]/[book]/[chapter]/commentary-chapter-reader';
import { bookOrder } from '@/lib/bible-data';
import {
  commentaryAuthorShortName,
  fetchCommentaryChapterJson,
  helloAoChapterApiPathToInternal,
} from '@/lib/helloao-commentaries';
import { loadFullBibleLookup, isValidReadingPlanVersionId, VersionId, VERSIONS } from '@/lib/bible-versions';
import { usfmToSpanishBibleDataKey } from '@/lib/helloao-usfm-to-spanish-key';

type Props = {
  params: Promise<{ id: string; book: string; chapter: string }>;
  searchParams: Promise<{ version?: string }>;
};

function bibliaQueryBookName(spanishKey: string | null): string {
  if (!spanishKey) return '';
  const found = bookOrder.find(b => b.toLowerCase() === spanishKey);
  return found ?? spanishKey;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, book, chapter } = await params;
  const ch = parseInt(chapter, 10);
  const data = Number.isFinite(ch) && ch >= 1 ? await fetchCommentaryChapterJson(id, book, ch) : null;
  const title = data
    ? `${data.book.commonName ?? data.book.name} ${ch} — ${commentaryAuthorShortName(data.commentary.name)}`
    : 'Capítulo';
  return {
    title: `${title} — Comentarios`,
    description: data
      ? `Texto bíblico (RVR 1960) y comentario HelloAO para ${data.book.commonName} ${ch}.`
      : 'Lectura de comentario bíblico.',
  };
}

export default async function CommentaryChapterPage({ params, searchParams }: Props) {
  const { id, book, chapter } = await params;
  const sParams = await searchParams;
  const ch = parseInt(chapter, 10);
  if (!Number.isFinite(ch) || ch < 1) notFound();

  const data = await fetchCommentaryChapterJson(id, book, ch);
  if (!data) notFound();

  const versionParam = sParams.version || 'rvr';
  const versionId: VersionId = isValidReadingPlanVersionId(versionParam) ? versionParam : 'rvr';

  const spanishKey = usfmToSpanishBibleDataKey(book);
  const lookup = await loadFullBibleLookup(versionId);
  const scriptureVerses = spanishKey ? (lookup[spanishKey]?.chapters[ch - 1] ?? []) : [];

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
    <>
      <CommentaryChapterReader
        commentaryId={id}
        bookUsfm={book.toUpperCase()}
        chapterNumber={ch}
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
      <Footer />
    </>
  );
}
