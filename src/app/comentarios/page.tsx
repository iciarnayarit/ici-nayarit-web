import { Suspense } from 'react';
import type { Metadata } from 'next';
import Footer from '@/app/components/footer';
import CommentariesCatalogShell from '@/app/comentarios/commentaries-catalog-shell';
import CommentariesCatalogSlot from '@/app/comentarios/commentaries-catalog-slot';

export const metadata: Metadata = {
  title: 'Comentarios bíblicos — ICIAR Nayarit',
  description:
    'Catálogo de comentarios bíblicos en inglés (dominio público y licencias abiertas) enlazados al proyecto HelloAO / Free Use Bible API.',
};

export default async function ComentariosPage() {
  return (
    <>
      <Suspense fallback={<CommentariesCatalogShell />}>
        <CommentariesCatalogSlot />
      </Suspense>
      <Footer />
    </>
  );
}
