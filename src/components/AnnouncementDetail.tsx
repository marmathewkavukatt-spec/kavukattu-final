"use client";

import { useLang } from "@/context/LangContext";
import { useTranslate } from "@/hooks/useTranslate";
import BackButton from "@/components/BackButton";
import { useAutoTranslate } from "@/components/AutoTranslate";
import type { PublicAnnouncement } from "@/lib/site-data";

function formatAnnouncementDate(lang: string, date: string) {
  try {
    const locale = lang === "ml" ? "ml-IN" : "en-US";
    return new Date(date).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

export default function AnnouncementDetail({ announcement }: { announcement: PublicAnnouncement }) {
  const { lang } = useLang();
  const [title, subtitle, description, content] = useTranslate([
    announcement.title, 
    announcement.subtitle || "", 
    announcement.description || "", 
    announcement.content
  ]);
  const downloadAttachmentText = useAutoTranslate("Download Attachment");
  const dateLabel = formatAnnouncementDate(lang, announcement.date);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 ml-1">
        <BackButton />
      </div>

      <div className="rounded-2xl bg-white border border-stone-200 p-8 sm:p-12 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-px w-8 bg-accent/40" />
          <time className="text-sm font-semibold tracking-widest text-stone-500 uppercase" dateTime={announcement.date}>
            {dateLabel}
          </time>
        </div>

        <h1 className="mb-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-medium leading-tight text-stone-900 whitespace-pre-line">
          {title}
        </h1>

        {subtitle && (
          <p className="mb-6 text-lg font-medium text-stone-700">
            {subtitle}
          </p>
        )}

        {description && (
          <div className="mb-8 rounded-lg bg-stone-50 p-6 border-l-4 border-accent">
            <p className="text-base leading-relaxed text-stone-700 whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        <div className="whitespace-pre-line text-base leading-relaxed text-stone-600 text-justify">
          {content}
        </div>
        
        {announcement.fileUrl && (
          <div className="mt-10 pt-8 border-t border-stone-200">
            <a
              href={announcement.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloadAttachmentText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
