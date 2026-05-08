export default function EncyclopediaArticleMainShell() {
  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-900">
      <div className="border-b border-gray-200/80 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-2 sm:px-6">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-gray-200/80 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-10">
          <div className="h-8 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-gray-100" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </article>
    </div>
  );
}
