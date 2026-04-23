"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { PublicResource } from "@/lib/site-data";
import PaginationControls from "./PaginationControls";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { useTranslate } from "@/hooks/useTranslate";

const PAGE_SIZE = 10;

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

function ResourceCard({ item }: { item: PublicResource }) {
  const { lang } = useLang();
  const tr = t[lang];
  const [title, description] = useTranslate([item.title, item.description ?? null]);

  return (
    <motion.li 
      variants={itemVariants}
      className="group overflow-hidden rounded-xl bg-white border border-stone-200 shadow-sm transition-all duration-300 hover:border-accent/40 hover:bg-stone-50/80 hover:shadow-md"
    >
      <Link href={`/resources/${item._id}`} className="flex h-full flex-col p-8">
        <h2 className="mb-4 font-serif text-[24px] sm:text-[26px] lg:text-[28px] font-bold text-accent leading-tight transition-colors group-hover:text-accent-dark whitespace-pre-line">
          {title}
        </h2>
        {description && (
          <p className="mb-6 flex-1 text-sm leading-relaxed text-stone-600 text-justify">
            {description}
          </p>
        )}
        
        <div className="mt-auto pt-4 border-t border-stone-100 transition-colors group-hover:border-accent/20">
          <span className="inline-flex items-center text-sm font-semibold text-stone-700 transition-colors group-hover:text-accent">
            {tr.viewResource}
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

export default function PaginatedResources({ items }: { items: PublicResource[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const visibleItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <motion.ul 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visibleItems.map((item) => <ResourceCard key={item._id} item={item} />)}
      </motion.ul>
      
      <div className="mt-12">
        <PaginationControls page={page} pageCount={pageCount} pageSize={PAGE_SIZE}
          totalItems={items.length} onPageChange={setPage} />
      </div>
    </>
  );
}
