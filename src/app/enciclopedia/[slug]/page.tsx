import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Footer from '@/app/components/footer';
import { encyclopediaSlugs, getEncyclopediaEntry } from '@/lib/bible-encyclopedia-data';
import EncyclopediaArticleMainShell from './encyclopedia-article-main-shell';
import EncyclopediaArticleMainSlot from './encyclopedia-article-main-slot';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return encyclopediaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEncyclopediaEntry(slug);
  if (!entry) {
    return { title: 'Artículo no encontrado — Enciclopedia' };
  }
  return {
    title: `${entry.title} — Enciclopedia bíblica — ICIAR Nayarit`,
    description: entry.summary,
  };
}

export default async function EnciclopediaArticlePage({ params }: Props) {
  const { slug } = await params;
  const entry = getEncyclopediaEntry(slug);
  if (!entry) notFound();

  return (
    <>
      <Suspense fallback={<EncyclopediaArticleMainShell />}>
        <EncyclopediaArticleMainSlot slug={slug} />
      </Suspense>
      <Footer />
    </>
  );
}
