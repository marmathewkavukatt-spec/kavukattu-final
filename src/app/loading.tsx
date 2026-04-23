import SitePageSkeleton from "@/components/SitePageSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar skeleton (navbar) */}
      <div className="border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-stone-200 animate-pulse" />
            <div className="h-4 w-32 rounded-full bg-stone-200 animate-pulse" />
          </div>
          <div className="hidden gap-2 sm:flex">
            <div className="h-3 w-12 rounded-full bg-stone-200 animate-pulse" />
            <div className="h-3 w-12 rounded-full bg-stone-200 animate-pulse" />
            <div className="h-3 w-16 rounded-full bg-stone-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Page skeleton */}
      <SitePageSkeleton />
    </div>
  );
}
