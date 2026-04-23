"use client";

import Link from "next/link";
import type { PublicGalleryCategory } from "@/lib/site-data";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { useTranslate } from "@/hooks/useTranslate";

export default function HomeGallerySection({ categories }: { categories: PublicGalleryCategory[] }) {
  const { lang } = useLang();
  const tr = t[lang];

  const visible = categories.slice(0, 3);
  const translatedTitles = useTranslate(visible.map((cat) => cat.title));

  if (!visible.length) return null;

  return (
    <section id="gallery" className="bg-stone-50 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-6">
            {tr.pageGallery}
          </h2>
          <p className="text-base md:text-lg text-stone-600 max-w-3xl mx-auto">
            {tr.gallerySubtitle}
          </p>
        </div>

        {/* Categories Grid - Same style as main gallery page */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((category, index) => (
            <Link
              key={category._id}
              href={`/gallery/${category._id}`}
              className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                <img
                  src={category.coverImage}
                  alt={translatedTitles[index] || category.title}
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-90"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              {/* Caption */}
              <div className="mt-3 text-center">
                <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 group-hover:text-accent transition-colors">
                  {translatedTitles[index] || category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
