import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardComparadorRedirectPage({ searchParams }: Props) {
  const params = await searchParams;
  const book = typeof params.book === 'string' ? params.book : '';
  const chapter = typeof params.chapter === 'string' ? params.chapter : '';
  const suffix =
    book ? `?book=${encodeURIComponent(book)}${chapter ? `&chapter=${chapter}` : ''}` : '';
  redirect(`/comparador${suffix}`);
}
