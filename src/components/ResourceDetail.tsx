"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { useTranslate } from "@/hooks/useTranslate";
import BackButton from "@/components/BackButton";
import type { PublicResource } from "@/lib/site-data";

function buildViewUrl(fileUrl: string, title: string) {
  const filename = fileUrl.split("/").pop() || title || "file";
  return `/api/view?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(filename)}`;
}

export default function ResourceDetail({ resource }: { resource: PublicResource }) {
  const { lang } = useLang();
  const tr = t[lang];
  const [title, description] = useTranslate([resource.title, resource.description ?? null]);

  const fileUrl = resource.fileUrl;
  const linkUrl = resource.linkUrl;

  const viewUrl = fileUrl ? buildViewUrl(fileUrl, resource.title) : null;
  const actionUrl = viewUrl ?? linkUrl ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 ml-1">
        <BackButton />
      </div>

      <div className="rounded-2xl bg-white border border-stone-200 p-8 sm:p-12 shadow-sm">
        <h1 className="mb-6 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold leading-tight text-accent whitespace-pre-line">
          {title}
        </h1>

        {description && (
          <div className="whitespace-pre-line text-base leading-relaxed text-stone-600 text-justify">
            {description}
          </div>
        )}

        {actionUrl && (
          <div className="mt-8">
            <a
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90"
            >
              {fileUrl ? tr.viewFile : tr.openLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
