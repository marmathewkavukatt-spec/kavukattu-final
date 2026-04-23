"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { useTranslate } from "@/hooks/useTranslate";
import BackButton from "@/components/BackButton";
import type { PublicArchiveDocument } from "@/lib/site-data";

type Tr = (typeof t)[keyof typeof t];

function buildViewUrl(fileUrl: string, filename: string) {
  return `/api/view?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(filename)}`;
}

function getCategoryLabel(category: PublicArchiveDocument["category"], tr: Tr) {
  if (category === "PASTORAL_LETTERS") return tr.pastoralLetters;
  if (category === "CIRCULARS") return tr.circulars;
  return tr.others;
}

function getDisplayTitle(doc: PublicArchiveDocument) {
  return doc.title?.trim() || doc.fileName?.trim() || doc.fileUrl.split("/").pop() || "Untitled";
}

export default function ArchiveDocumentDetail({ doc }: { doc: PublicArchiveDocument }) {
  const { lang } = useLang();
  const tr = t[lang];
  const [title, subtitle, description] = useTranslate([
    getDisplayTitle(doc),
    doc.subtitle ?? null,
    doc.description ?? null,
  ]);

  const filename = doc.fileName || doc.fileUrl.split("/").pop() || "file";
  const viewUrl = buildViewUrl(doc.fileUrl, filename);
  const createdLabel = (() => {
    try {
      const locale = lang === "ml" ? "ml-IN" : "en-US";
      return new Date(doc.createdAt).toLocaleString(locale);
    } catch {
      return String(doc.createdAt);
    }
  })();
  const categoryLabel = getCategoryLabel(doc.category, tr);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 ml-1">
        <BackButton />
      </div>

      <div className="rounded-2xl bg-white border border-stone-200 p-8 sm:p-12 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
            {categoryLabel}
          </span>
          <span className="text-xs font-semibold text-stone-400">{createdLabel}</span>
        </div>

        <h1 className="mb-4 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold leading-tight text-accent whitespace-pre-line">
          {title}
        </h1>

        {subtitle && (
          <div className="mb-6 text-base font-semibold text-stone-700 whitespace-pre-line">
            {subtitle}
          </div>
        )}

        {description && (
          <div className="whitespace-pre-line text-base leading-relaxed text-stone-600 text-justify">
            {description}
          </div>
        )}

        <div className="mt-8">
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90"
          >
            {tr.viewFile}
          </a>
        </div>
      </div>
    </div>
  );
}
