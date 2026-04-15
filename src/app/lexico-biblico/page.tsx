import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpenText, Brain, Search, Sparkles } from 'lucide-react';
import Footer from '@/app/components/footer';

export const metadata: Metadata = {
  title: 'Léxico Bíblico — ICIAR Nayarit',
  description:
    'Explora significados y relaciones de términos bíblicos para profundizar en tu estudio.',
};

const upcomingItems = [
  {
    title: 'Búsqueda por lema',
    text: 'Consulta términos como Seol, gracia, pacto o santidad y navega su red semántica.',
    icon: Search,
  },
  {
    title: 'Mapa de sentidos',
    text: 'Visualiza relaciones entre ideas teológicas y usos bíblicos por contexto.',
    icon: Brain,
  },
  {
    title: 'Referencias cruzadas',
    text: 'Abre cada cita directamente en la Biblia para continuar la lectura en contexto.',
    icon: BookOpenText,
  },
];

export default function LexicoBiblicoPage() {
  return (
    <>
      <main className="min-h-screen bg-[#f5f6f8] text-gray-900">
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-gray-200/80 bg-white p-7 shadow-sm sm:p-10">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
              <Sparkles className="h-7 w-7" strokeWidth={1.6} aria-hidden />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Léxico Bíblico
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
              Esta sección reunirá términos y sentidos bíblicos para facilitar el estudio por conceptos,
              contexto y referencias relacionadas.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-gray-200/80 bg-gray-50/70 p-5"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#B88A44]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h2 className="text-base font-bold text-gray-900">{item.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-[#B88A44]/45 bg-amber-50/50 p-5 text-sm text-gray-700">
              Pronto podrás explorar términos con visualización de sentidos como en herramientas de estudio semántico.
            </div>

            <div className="mt-8">
              <Link
                href="/enciclopedia"
                className="inline-flex rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-[#B88A44]/40 hover:text-[#B88A44]"
              >
                ← Volver a Enciclopedia
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
