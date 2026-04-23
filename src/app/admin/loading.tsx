export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="h-4 w-32 rounded-full bg-stone-200 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-3 w-14 rounded-full bg-stone-200 animate-pulse" />
            <div className="h-3 w-16 rounded-full bg-stone-200 animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-stone-200 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-screen-2xl gap-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Sidebar skeleton */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-full rounded-md bg-stone-200/80 animate-pulse"
              />
            ))}
          </div>
        </aside>

        {/* Main card skeleton */}
        <main className="min-w-0 flex-1">
          <div className="h-6 w-40 rounded-full bg-stone-200 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded-full bg-stone-200 animate-pulse" />

          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="h-3 w-1/3 rounded-full bg-stone-200 animate-pulse" />
                <div className="mt-2 h-3 w-1/2 rounded-full bg-stone-200 animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
