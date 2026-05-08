export default function EncyclopediaIndexListShell() {
  return (
    <>
      <div className="mb-4 h-5 w-72 animate-pulse rounded bg-gray-200/70" />
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
            <div className="h-6 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </>
  );
}
