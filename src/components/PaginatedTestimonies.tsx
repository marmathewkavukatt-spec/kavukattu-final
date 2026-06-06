"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { cloudinaryLoader, isCloudinaryUrl } from "@/lib/cloudinary-image";
import type { PublicFavourRecieved } from "@/lib/site-data";
import PaginationControls from "./PaginationControls";
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

function FavourRecievedItem({ item, priority }: { item: PublicFavourRecieved; priority: boolean }) {
  const authorImageSrc = item.authorImage;
  const authorImageIsCloudinary = Boolean(authorImageSrc && isCloudinaryUrl(authorImageSrc));
  const authorImageIsUnoptimized = authorImageSrc
    ? authorImageSrc.startsWith("/uploads/") || authorImageSrc.startsWith("data:") || authorImageSrc.toLowerCase().endsWith(".svg")
    : false;

  const [authorName, content] = useTranslate([item.authorName, item.content]);

  return (
    <motion.article 
      variants={itemVariants}
      className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-accent/40 hover:bg-stone-50/50 hover:shadow-md md:p-10"
    >
      <div className="absolute left-0 top-0 h-full w-1.5 bg-transparent transition-colors duration-300 group-hover:bg-accent/80" />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start md:gap-8">
        {authorImageSrc && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-transparent transition-all duration-300 group-hover:ring-accent/20 sm:h-20 sm:w-20">
            <Image
              src={authorImageSrc}
              alt={authorName || item.authorName}
              fill
              loader={authorImageIsCloudinary ? cloudinaryLoader : undefined}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e7e5e4'/%3E%3C/svg%3E"
              className="object-cover"
              sizes="(max-width: 640px) 64px, 80px"
              quality={60}
              unoptimized={authorImageIsUnoptimized}
            />
          </div>
        )}
        <div className="flex-1 space-y-4">
          <p className="font-serif text-[17px] italic leading-relaxed text-stone-700 text-justify">
            &ldquo;{content}&rdquo;
          </p>
          <div className="pt-2">
            <p className="inline-block border-t border-stone-200 pt-3 text-[15px] font-medium text-stone-500 whitespace-pre-line">
              {authorName}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function PaginatedTestimonies({ items }: { items: PublicFavourRecieved[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const visibleItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-12 space-y-8"
      >
        {visibleItems.map((item, i) => (
          <FavourRecievedItem key={item._id} item={item} priority={page === 0 && i === 0} />
        ))}
      </motion.div>
      <div className="mt-12">
        <PaginationControls page={page} pageCount={pageCount} pageSize={PAGE_SIZE}
          totalItems={items.length} onPageChange={setPage} />
      </div>
    </>
  );
}
