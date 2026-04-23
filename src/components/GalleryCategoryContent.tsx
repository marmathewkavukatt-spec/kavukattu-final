"use client";

import { useTranslate } from "@/hooks/useTranslate";
import GalleryLightbox from "@/components/GalleryLightbox";
import BackButton from "@/components/BackButton";
import type { PublicGalleryCategoryItem } from "@/lib/site-data";

interface Props {
  categoryTitle: string;
  items: PublicGalleryCategoryItem[];
}

export default function GalleryCategoryContent({ categoryTitle, items }: Props) {
  const [translatedTitle] = useTranslate([categoryTitle]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <BackButton />

      {/* Category title */}
      <h1 className="mt-6 font-serif text-[36px] sm:text-[40px] lg:text-[48px] font-bold text-stone-800">
        {translatedTitle || categoryTitle}
      </h1>

      {/* Images grid */}
      {items.length > 0 ? (
        <GalleryLightbox 
          items={items.map(item => ({ 
            _id: item._id, 
            image: item.image, 
            caption: item.title 
          }))} 
        />
      ) : (
        <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-12 text-center">
          <p className="text-stone-500">No images in this category yet.</p>
        </div>
      )}
    </div>
  );
}
