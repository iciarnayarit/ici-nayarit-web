import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ book?: string; chapter?: string }>;
};

/** La herramienta vive en el panel (sesión requerida). Conserva libro/capítulo en la URL. */
export default async function LegacyBibliaComparadorRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (sp.book) q.set('book', sp.book);
  if (sp.chapter) q.set('chapter', sp.chapter);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  redirect(`/comparador${suffix}`);
}
