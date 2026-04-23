"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { PublicAnnouncement } from "@/lib/site-data";
import PaginationControls from "./PaginationControls";
import { useTranslate } from "@/hooks/useTranslate";
import { useLang } from "@/context/LangContext";
import { useAutoTranslate } from "@/components/AutoTranslate";

const PAGE_SIZE = 10;

function formatDate(lang: string, date: string) {
  try {
    const locale = lang === "ml" ? "ml-IN" : "en-US";
    return new Date(date).toLocaleDateString(locale, { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return date;
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  "upcoming-events": "Upcoming Events",
  "feast-days": "Feast Days",
  "special-prayers": "Special Prayers / Gatherings",
};

function AnnouncementCard({
  item,
  categoryLabelMap,
  viewDocumentText,
}: {
  item: PublicAnnouncement;
  categoryLabelMap: Record<string, string>;
  viewDocumentText: string;
}) {
  const { lang } = useLang();
  const [title, subtitle, description, content] = useTranslate([
    item.title, 
    item.subtitle || "", 
    item.description || "", 
    item.content
  ]);
  const categoryLabel = categoryLabelMap[item.category] || item.category;

  return (
    <motion.li
      variants={itemVariants}
      className="group overflow-hidden rounded-xl bg-white border border-stone-200 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-stone-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-accent/40" />
            <time className="text-xs font-semibold tracking-widest text-stone-500 uppercase" dateTime={item.date}>
              {formatDate(lang, item.date)}
            </time>
          </div>
          <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {categoryLabel}
          </span>
        </div>
        
        <div>
        <h2 className="font-serif text-[24px] sm:text-[26px] lg:text-[28px] font-bold leading-snug text-accent transition-colors duration-300 group-hover:text-accent-dark whitespace-pre-line">
            {title}
          </h2>
          
          {subtitle && (
            <p className="mt-2 text-base font-medium text-stone-700">
              {subtitle}
            </p>
          )}

          {description && (
            <div className="mt-3 rounded-lg bg-stone-50 p-4 border-l-4 border-accent/30">
              <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-line">
                {description}
              </p>
            </div>
          )}
          
          <div className="mt-4 whitespace-pre-line text-[15.5px] leading-relaxed text-stone-600 text-justify">
            {content}
          </div>
        </div>
        
        {item.fileUrl && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {viewDocumentText}
            </a>
          </div>
        )}
      </div>
    </motion.li>
  );
}

export default function PaginatedAnnouncements({ items }: { items: PublicAnnouncement[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const visibleItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const viewDocumentText = useAutoTranslate("View Document");

  const categoryIds = Object.keys(CATEGORY_LABELS_EN);
  const categoryLabelsEn = categoryIds.map((id) => CATEGORY_LABELS_EN[id]);
  const categoryLabelsTranslated = useTranslate(categoryLabelsEn);
  const categoryLabelMap = categoryIds.reduce<Record<string, string>>((acc, id, idx) => {
    acc[id] = categoryLabelsTranslated[idx] || CATEGORY_LABELS_EN[id];
    return acc;
  }, {});

  return (
    <>
      <motion.ul 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-12 space-y-6"
      >
        {visibleItems.map((item) => (
          <AnnouncementCard
            key={item._id}
            item={item}
            categoryLabelMap={categoryLabelMap}
            viewDocumentText={viewDocumentText}
          />
        ))}
      </motion.ul>
      
      <div className="mt-12">
        <PaginationControls page={page} pageCount={pageCount} pageSize={PAGE_SIZE}
          totalItems={items.length} onPageChange={setPage} />
      </div>
    </>
  );
}
