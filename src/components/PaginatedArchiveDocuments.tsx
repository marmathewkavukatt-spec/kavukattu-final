"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { PublicArchiveDocument } from "@/lib/site-data";
import PaginationControls from "./PaginationControls";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { useTranslate } from "@/hooks/useTranslate";

const PAGE_SIZE = 12;

type Tr = (typeof t)[keyof typeof t];

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

function getCategoryLabel(category: PublicArchiveDocument["category"], tr: Tr) {
  if (category === "PASTORAL_LETTERS") return tr.pastoralLetters;
  if (category === "CIRCULARS") return tr.circulars;
  return tr.others;
}

function getDisplayTitle(item: PublicArchiveDocument) {
  return item.title?.trim() || item.fileName?.trim() || item.fileUrl.split("/").pop() || "Untitled";
}

function ArchiveDocumentCard({ item }: { item: PublicArchiveDocument }) {
  const { lang } = useLang();
  const tr = t[lang];
  const [title, subtitle, description] = useTranslate([
    getDisplayTitle(item),
    item.subtitle ?? null,
    item.description ?? null,
  ]);

  const dateLabel = (() => {
    try {
      const locale = lang === "ml" ? "ml-IN" : "en-US";
      return new Date(item.createdAt).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return String(item.createdAt);
    }
  })();
  const categoryLabel = getCategoryLabel(item.category, tr);

  return (
    <motion.li
      variants={itemVariants}
      className="group overflow-hidden rounded-xl bg-white border border-stone-200 shadow-sm transition-all duration-300 hover:border-accent/40 hover:bg-stone-50/80 hover:shadow-md"
    >
      <Link href={`/archives/${item._id}`} className="flex h-full flex-col p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
            {categoryLabel}
          </span>
          <span className="text-xs font-semibold text-stone-400">{dateLabel}</span>
        </div>

        <h2 className="mt-4 mb-3 font-serif text-[22px] sm:text-[24px] font-bold text-accent leading-tight transition-colors group-hover:text-accent-dark whitespace-pre-line">
          {title}
        </h2>

        {subtitle && <p className="mb-4 text-sm font-semibold text-stone-700 whitespace-pre-line">{subtitle}</p>}

        {description && (
          <p className="mb-6 flex-1 text-sm leading-relaxed text-stone-600 text-justify">
            {description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-stone-100 transition-colors group-hover:border-accent/20">
          <span className="inline-flex items-center text-sm font-semibold text-stone-700 transition-colors group-hover:text-accent">
            {tr.viewDocument}
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

export default function PaginatedArchiveDocuments({ items }: { items: PublicArchiveDocument[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const visibleItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visibleItems.map((item) => (
          <ArchiveDocumentCard key={item._id} item={item} />
        ))}
      </motion.ul>

      <div className="mt-12">
        <PaginationControls
          page={page}
          pageCount={pageCount}
          pageSize={PAGE_SIZE}
          totalItems={items.length}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
