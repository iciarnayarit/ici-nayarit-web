import Link from 'next/link';
import { Castle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ENCICLOPEDIA_PAGE_SIZE, getEncyclopediaIndexPage } from '@/lib/bible-encyclopedia-data';

type Props = {
  requestedPage: number;
};

export default async function EncyclopediaIndexListSlot({ requestedPage }: Props) {
  const { entries, total, page, totalPages } = getEncyclopediaIndexPage(requestedPage);
  const from = total === 0 ? 0 : (page - 1) * ENCICLOPEDIA_PAGE_SIZE + 1;
  const to = Math.min(page * ENCICLOPEDIA_PAGE_SIZE, total);
  const qs = (p: number) => (p <= 1 ? '/enciclopedia' : `/enciclopedia?page=${p}`);

  return (
    <>
      <p className="mb-4 text-center text-sm text-gray-500">
        Mostrando{' '}
        <span className="font-semibold text-gray-800">
          {from}–{to}
        </span>{' '}
        de <span className="font-semibold text-gray-800">{total}</span> artículos ({ENCICLOPEDIA_PAGE_SIZE} por página)
      </p>

      <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/enciclopedia/${e.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition-all hover:border-[#B88A44]/35 hover:shadow-md"
            >
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B2942]/10 text-[#8B2942]">
                  <Castle className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold text-gray-900 group-hover:text-[#B88A44]">{e.title}</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{e.kind}</p>
                </div>
              </div>
              <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{e.summary}</p>
              <span className="mt-4 text-sm font-semibold text-[#B88A44] group-hover:underline">Leer artículo →</span>
            </Link>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav
          className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-gray-200/80 pt-8 sm:flex-row sm:gap-6"
          aria-label="Paginación de la enciclopedia"
        >
          {page > 1 ? (
            <Link
              href={qs(page - 1)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-[#B88A44]/40 hover:text-[#B88A44]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Anterior
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-gray-300">
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Anterior
            </span>
          )}

          <span className="text-sm text-gray-600">
            Página <span className="font-bold text-gray-900">{page}</span> de{' '}
            <span className="font-bold text-gray-900">{totalPages}</span>
          </span>

          {page < totalPages ? (
            <Link
              href={qs(page + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-[#B88A44]/40 hover:text-[#B88A44]"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-gray-300">
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          )}
        </nav>
      )}
    </>
  );
}
