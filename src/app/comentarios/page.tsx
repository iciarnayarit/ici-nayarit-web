import type { Metadata } from 'next';
import Footer from '@/app/components/footer';
import CommentariesCatalog from '@/app/comentarios/commentaries-catalog';
import { fetchAvailableCommentaries } from '@/lib/helloao-commentaries';

export const metadata: Metadata = {
  title: 'Comentarios bíblicos — ICIAR Nayarit',
  description:
    'Catálogo de comentarios bíblicos en inglés (dominio público y licencias abiertas) enlazados al proyecto HelloAO / Free Use Bible API.',
};

export default async function ComentariosPage() {
  const commentaries = await fetchAvailableCommentaries();

  return (
    <>
      <CommentariesCatalog commentaries={commentaries} />
      <Footer />
    </>
  );
}
