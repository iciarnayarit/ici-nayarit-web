export default function CommentariesCatalogShell() {
  return (
    <div className="min-h-screen bg-[#F0F2F6] pb-24">
      <div className="sticky top-[4.5rem] z-30 mx-4 mt-4 flex flex-col gap-3 border-b border-gray-200/80 bg-[#F0F2F6]/95 pb-3 backdrop-blur-md sm:mx-6 sm:flex-row sm:items-center sm:justify-between lg:mx-auto lg:max-w-6xl">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded-full bg-white" />
          ))}
        </div>
        <div className="h-10 w-full animate-pulse rounded-full bg-white sm:w-[22rem]" />
      </div>
      <div className="mx-4 space-y-8 py-8 sm:mx-6 lg:mx-auto lg:max-w-6xl">
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <li key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
              <div className="mt-3 h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-4 w-11/12 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

