"use client";

import { useEffect } from "react";
import type { PublicAnnouncement } from "@/lib/site-data";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { useTranslate } from "@/hooks/useTranslate";

function formatDate(lang: string, date: string) {
  try {
    const locale = lang === "ml" ? "ml-IN" : "en-US";
    return new Date(date).toLocaleDateString(locale, { dateStyle: "long" });
  } catch {
    return date;
  }
}

export default function AnnouncementModal({
  item,
  onClose,
}: {
  item: PublicAnnouncement;
  onClose: () => void;
}) {
  const { lang } = useLang();
  const tr = t[lang];
  const [title, content] = useTranslate([item.title, item.content]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {tr.announcement}
              </span>
              <time className="text-xs text-stone-400">{formatDate(lang, item.date)}</time>
            </div>
            <h2 className="mt-2 font-serif text-xl font-semibold text-stone-800 sm:text-2xl">{title}</h2>
          </div>
          <button onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
            aria-label={tr.close}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600 sm:text-justify break-words">
            {content}
          </p>
        </div>
        <div className="border-t border-stone-100 px-6 py-4 flex justify-end">
          <button onClick={onClose}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition">
            {tr.close}
          </button>
        </div>
      </div>
    </div>
  );
}
