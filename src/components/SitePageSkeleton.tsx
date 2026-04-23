function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-stone-200 ${className}`} />;
}

export default function SitePageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white shadow-sm">
        <div className="h-64 animate-pulse bg-stone-200/70 sm:h-80 md:h-[28rem]" />
        <div className="space-y-4 px-6 py-6 sm:px-8">
          <SkeletonLine className="h-5 w-32" />
          <SkeletonLine className="h-8 w-2/3 max-w-xl" />
          <SkeletonLine className="h-4 w-full max-w-3xl" />
          <SkeletonLine className="h-4 w-5/6 max-w-2xl" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <SkeletonLine className="h-4 w-28" />
            <SkeletonLine className="h-8 w-3/4" />
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-11/12" />
            <SkeletonLine className="h-4 w-4/5" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="space-y-3">
                <SkeletonLine className="h-4 w-24" />
                <SkeletonLine className="h-6 w-2/3" />
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-3">
              <SkeletonLine className="h-4 w-20" />
              <SkeletonLine className="h-6 w-2/3" />
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-5/6" />
              <SkeletonLine className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
