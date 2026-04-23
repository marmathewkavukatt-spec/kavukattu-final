"use client";

import { useLang } from "@/context/LangContext";
import { useAutoTranslate } from "@/components/AutoTranslate";

interface PaginationControlsProps {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  page, pageCount, pageSize, totalItems, onPageChange,
}: PaginationControlsProps) {
  const { lang } = useLang();
  
  // Real-time translations
  const showingText = useAutoTranslate("Showing");
  const ofText = useAutoTranslate("of");
  const previousText = useAutoTranslate("Previous");
  const pageText = useAutoTranslate("Page");
  const nextText = useAutoTranslate("Next");

  if (pageCount <= 1) return null;

  const start = page * pageSize + 1;
  const end = Math.min(totalItems, (page + 1) * pageSize);

  return (
    <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-stone-600">
        {showingText} {start}-{end} {ofText} {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 0}
          className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50">
          {previousText}
        </button>
        <span className="min-w-20 text-center text-sm font-medium text-stone-600">
          {pageText} {page + 1} / {pageCount}
        </span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount - 1}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50">
          {nextText}
        </button>
      </div>
    </div>
  );
}
