function SkeletonCard({
  titleWidth,
  bodyWidth,
}: {
  titleWidth: string;
  bodyWidth: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className={`h-5 rounded-full bg-stone-200 animate-pulse ${titleWidth}`} />
      <div className={`mt-3 h-4 rounded-full bg-stone-200 animate-pulse ${bodyWidth}`} />
      <div className="mt-6 flex gap-3">
        <div className="h-9 w-24 rounded-xl bg-stone-200 animate-pulse" />
        <div className="h-9 w-24 rounded-xl bg-stone-100 animate-pulse" />
      </div>
    </div>
  );
}

export default function AdminDashboardLoading() {
  return (
    <div className="pb-8">
      <div className="h-5 w-24 rounded-full bg-stone-200 animate-pulse" />
      <div className="mt-6 h-10 w-56 rounded-full bg-stone-200 animate-pulse" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-stone-200 animate-pulse" />

      <div className="mt-8 grid gap-6">
        <SkeletonCard titleWidth="w-40" bodyWidth="w-72 max-w-full" />
        <SkeletonCard titleWidth="w-48" bodyWidth="w-80 max-w-full" />
        <SkeletonCard titleWidth="w-36" bodyWidth="w-64 max-w-full" />
      </div>
    </div>
  );
}
