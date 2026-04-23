"use client";

import { useState } from "react";
import type { PublicGalleryItem } from "@/lib/site-data";
import GalleryLightbox from "./GalleryLightbox";
import PaginationControls from "./PaginationControls";

const PAGE_SIZE = 10;

export default function PaginatedGallery({ items }: { items: PublicGalleryItem[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const visibleItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <GalleryLightbox items={visibleItems} />
      <PaginationControls
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        totalItems={items.length}
        onPageChange={setPage}
      />
    </>
  );
}
