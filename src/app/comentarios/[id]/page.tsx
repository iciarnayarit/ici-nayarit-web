import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/app/components/footer';
import CommentaryBooksDetail from '@/app/comentarios/[id]/commentary-books-detail';
import { commentaryAuthorShortName, fetchCommentaryBooks } from '@/lib/helloao-commentaries';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchCommentaryBooks(id);
  const title = data ? `${commentaryAuthorShortName(data.commentary.name)} — Comentarios` : 'Comentario';
  return {
    title: `${title} — ICIAR Nayarit`,
    description: data
      ? `Libros disponibles en ${data.commentary.englishName} (HelloAO).`
      : 'Detalle de comentario bíblico.',
  };
}

export default async function CommentaryDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await fetchCommentaryBooks(id);
  if (!data) notFound();

  return (
    <>
      <CommentaryBooksDetail data={data} />
      <Footer />
    </>
  );
}
