import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/app/components/footer';
import CommentaryChapterContentSlot from '@/app/comentarios/[id]/[book]/[chapter]/commentary-chapter-content-slot';
import CommentaryChapterShell from '@/app/comentarios/[id]/[book]/[chapter]/commentary-chapter-shell';
import {
  commentaryAuthorShortName,
  fetchCommentaryChapterJson,
} from '@/lib/helloao-commentaries';
import { isValidReadingPlanVersionId } from '@/lib/bible-versions';

type Props = {
  params: Promise<{ id: string; book: string; chapter: string }>;
  searchParams: Promise<{ version?: string }>;
};

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
  const versionParam = isValidReadingPlanVersionId(sParams.version || 'rvr') ? sParams.version : 'rvr';

  return (
    <>
      <Suspense fallback={<CommentaryChapterShell book={book} chapter={ch} />}>
        <CommentaryChapterContentSlot
          commentaryId={id}
          book={book}
          chapter={ch}
          versionParam={versionParam}
        />
      </Suspense>
      <Footer />
    </>
  );
}
