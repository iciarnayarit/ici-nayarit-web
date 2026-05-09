import Footer from '@/app/components/footer';
import { Lightbulb } from 'lucide-react';
import type { Metadata } from 'next';
import { getEncyclopediaIndexPage } from '@/lib/bible-encyclopedia-data';
import EncyclopediaIndexListClient from './encyclopedia-index-list-client';

export const metadata: Metadata = {
  title: 'Enciclopedia bíblica — ICIAR Nayarit',
  description:
    'Artículos de referencia sobre lugares, personajes y temas bíblicos. Contenido ampliable para el estudio de la Escritura.',
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function EnciclopediaIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const requested = Number.isFinite(raw) && raw >= 1 ? raw : 1;
  const initialPageData = getEncyclopediaIndexPage(requested);

  return (
    <>
      <div className="min-h-screen bg-[#f5f6f8] text-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <header className="mb-10 text-center sm:mb-12">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
              <Lightbulb className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Enciclopedia bíblica
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
              Consulta entradas sobre ciudades, lugares y temas del relato bíblico. El contenido irá creciendo con el
              tiempo.
            </p>
          </header>

          <EncyclopediaIndexListClient requestedPage={requested} initialPageData={initialPageData} />
        </div>
      </div>
      <Footer />
    </>
  );
}
