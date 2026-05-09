import { Suspense } from 'react';
import EncyclopediaArticleClient from '@/app/enciclopedia/encyclopedia-article-client';
import { getEncyclopediaEntry, listEncyclopediaEntries } from '@/lib/bible-encyclopedia-data';
import EncyclopediaArticleRelatedShell from './encyclopedia-article-related-shell';
import EncyclopediaArticleRelatedSlot from './encyclopedia-article-related-slot';

type Props = {
  slug: string;
};

export default async function EncyclopediaArticleMainSlot({ slug }: Props) {
  const entry = getEncyclopediaEntry(slug);
  if (!entry) return null;
  const allEntries = listEncyclopediaEntries();

  return (
    <EncyclopediaArticleClient
      entry={entry}
      allEntries={allEntries}
      relatedSlot={
        <Suspense key="related-slot" fallback={<EncyclopediaArticleRelatedShell />}>
          <EncyclopediaArticleRelatedSlot entry={entry} />
        </Suspense>
      }
    />
  );
}
