import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/app/components/footer';
import EncyclopediaArticleClient from '@/app/enciclopedia/encyclopedia-article-client';
import { encyclopediaSlugs, getEncyclopediaEntry, listEncyclopediaEntries } from '@/lib/bible-encyclopedia-data';

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
  const allEntries = listEncyclopediaEntries();

  return (
    <>
      <EncyclopediaArticleClient entry={entry} allEntries={allEntries} />
      <Footer />
    </>
  );
}
