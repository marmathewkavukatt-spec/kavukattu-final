"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslate } from "@/hooks/useTranslate";
import { cloudinaryLoader, isCloudinaryUrl } from "@/lib/cloudinary-image";
import type { PublicGalleryCategory } from "@/lib/site-data";

export default function GalleryCategoriesGrid({ categories }: { categories: PublicGalleryCategory[] }) {
  const translatedTitles = useTranslate(categories.map((cat) => cat.title));

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => {
        const isCloudinary = isCloudinaryUrl(category.coverImage);
        const isUnoptimized = category.coverImage.startsWith("data:") || category.coverImage.toLowerCase().endsWith(".svg");
        
        return (
          <Link
            key={category._id}
            href={`/gallery/${category._id}`}
            className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
              <Image
                src={category.coverImage}
                alt={translatedTitles[index] || category.title}
                fill
                loader={isCloudinary ? cloudinaryLoader : undefined}
                priority={index < 3}
                loading={index < 3 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e7e5e4'/%3E%3C/svg%3E"
                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-90"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={60}
                unoptimized={isUnoptimized}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            {/* Caption */}
            <div className="mt-3 text-center">
              <h3 className="font-serif text-lg font-semibold text-stone-800 group-hover:text-accent transition-colors">
                {translatedTitles[index] || category.title}
              </h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
