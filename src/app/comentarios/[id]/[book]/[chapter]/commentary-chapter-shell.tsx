type Props = {
  book: string;
  chapter: number;
};

export default function CommentaryChapterShell({ book, chapter }: Props) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-4 h-4 w-64 animate-pulse rounded bg-slate-200" />
        <header className="mb-4 border-b border-gray-200 pb-4">
          <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-9 w-80 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-200" />
          </div>
        </header>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Cargando {book.toUpperCase()} {chapter}...
          </p>
        </div>

        <div className="grid gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2">
          <section className="border-b border-gray-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
              <div className="h-3 w-44 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="space-y-3 px-4 py-5 sm:px-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`left-${i}`} className="h-4 w-full animate-pulse rounded bg-slate-200" />
              ))}
            </div>
          </section>

          <section>
            <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
              <div className="h-3 w-56 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="space-y-6 px-4 py-6 sm:px-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <article key={`right-${i}`} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-5 w-11/12 animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

