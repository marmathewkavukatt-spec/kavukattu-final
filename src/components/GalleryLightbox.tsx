"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  cloudinaryLoader,
  getBrowserSafeImageUrl,
  getCloudinaryImageUrl,
  isCloudinaryUrl,
} from "@/lib/cloudinary-image";
import { useTranslate } from "@/hooks/useTranslate";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import VirtualizedGallery from "./VirtualizedGallery";

interface GalleryItem {
  _id: string;
  image: string;
  caption?: string;
}

function toBrowserSafeSrc(src: string) {
  if (!src) return src;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  // Prevent Next/Image fetch failures for local uploads with spaces/special chars.
  return encodeURI(src);
}

export default function GalleryLightbox({ items }: { items: GalleryItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const translatedCaptions = useTranslate(items.map((item) => item.caption ?? null));
  const [closeText, previousImageText, nextImageText, galleryImageText] = useTranslate([
    "Close",
    "Previous image",
    "Next image",
    "Gallery image",
  ]);
  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;
  const selectedImageSrc = selectedItem?.image ?? "";
  const selectedImageDisplaySrc = toBrowserSafeSrc(selectedImageSrc);
  const selectedImageIsCloudinary = Boolean(selectedItem?.image && isCloudinaryUrl(selectedItem.image));
  const selectedImageIsUnoptimized =
    selectedImageSrc.startsWith("data:") || selectedImageSrc.toLowerCase().endsWith(".svg");

  // Use virtualization for large galleries (>50 items)
  const useVirtualization = items.length > 50;

  // Performance monitoring
  usePerformanceMonitor('GalleryLightbox', items.length);

  // Preload adjacent images when lightbox opens
  useEffect(() => {
    if (selectedIndex !== null) {
      const preloadIndexes = [
        selectedIndex,
        (selectedIndex + 1) % items.length,
        (selectedIndex - 1 + items.length) % items.length,
      ];
      
      preloadIndexes.forEach((idx) => {
        if (!loadedImages.has(idx)) {
          const img = new window.Image();
          const item = items[idx];
          const preloadSrc = isCloudinaryUrl(item.image)
            ? getCloudinaryImageUrl(item.image, {
                width: 1920,
                quality: "auto:good",
              })
            : getBrowserSafeImageUrl(item.image, {
                width: 1920,
                quality: 80,
              });
          img.decoding = "async";
          img.src = preloadSrc;
          img.onload = () => {
            setLoadedImages((prev) => new Set(prev).add(idx));
          };
        }
      });
    }
  }, [selectedIndex, items, loadedImages]);

  // Preload visible images on mount and scroll
  useEffect(() => {
    const preloadVisibleImages = () => {
      // Preload first 6 images immediately
      const initialIndexes = Array.from({ length: Math.min(6, items.length) }, (_, i) => i);
      
      initialIndexes.forEach((idx) => {
        if (!preloadedImages.has(idx)) {
          const img = new window.Image();
          const item = items[idx];
          const preloadSrc = isCloudinaryUrl(item.image)
            ? getCloudinaryImageUrl(item.image, {
                width: 640,
                quality: "auto:good",
              })
            : getBrowserSafeImageUrl(item.image, {
                width: 640,
                quality: 75,
              });
          img.decoding = "async";
          img.src = preloadSrc;
          img.onload = () => {
            setPreloadedImages((prev) => new Set(prev).add(idx));
          };
        }
      });
    };

    preloadVisibleImages();
  }, [items, preloadedImages]);

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setSelectedIndex(null);
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  };

  return (
    <>
      {useVirtualization ? (
        <VirtualizedGallery 
          items={items} 
          onItemClick={setSelectedIndex}
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const previewImageIsCloudinary = isCloudinaryUrl(item.image);
            const previewImageIsUnoptimized =
              item.image.startsWith("data:") || item.image.toLowerCase().endsWith(".svg");
            const previewImageSrc = toBrowserSafeSrc(item.image);
            const caption = translatedCaptions[index];

            return (
              <figure
                key={item._id}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-stone-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                onClick={() => setSelectedIndex(index)}
                onMouseEnter={() => {
                  // Preload high-res version on hover for faster lightbox opening
                  if (!loadedImages.has(index)) {
                    const img = new window.Image();
                    img.decoding = "async";
                    img.src = previewImageIsCloudinary
                      ? getCloudinaryImageUrl(item.image, {
                          width: 1920,
                          quality: "auto:good",
                        })
                      : getBrowserSafeImageUrl(item.image, {
                          width: 1920,
                          quality: 80,
                        });
                    img.onload = () => {
                      setLoadedImages((prev) => new Set(prev).add(index));
                    };
                  }
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                  <Image
                    src={previewImageSrc}
                    alt={caption || item.caption || galleryImageText}
                    fill
                    loader={previewImageIsCloudinary ? cloudinaryLoader : undefined}
                    priority={index < 3}
                    loading={index < 3 ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e7e5e4'/%3E%3C/svg%3E"
                    className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-90"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={60}
                    unoptimized={previewImageIsUnoptimized}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                {caption && (
                  <figcaption className="p-4 text-center text-sm font-medium text-stone-700 group-hover:text-stone-900">
                    {caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={() => setSelectedIndex(null)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20"
              aria-label={closeText}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {items.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition-all hover:scale-110 hover:bg-white/20"
                  aria-label={previousImageText}
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition-all hover:scale-110 hover:bg-white/20"
                  aria-label={nextImageText}
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div
              className="relative h-[90vh] w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Image
                    src={selectedImageDisplaySrc}
                    alt={translatedCaptions[selectedIndex] || items[selectedIndex].caption || galleryImageText}
                    fill
                    loader={selectedImageIsCloudinary ? cloudinaryLoader : undefined}
                    priority
                    placeholder={loadedImages.has(selectedIndex) ? "empty" : "blur"}
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23111'/%3E%3C/svg%3E"
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 90vw"
                    quality={80}
                    unoptimized={selectedImageIsUnoptimized}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {translatedCaptions[selectedIndex] && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-white backdrop-blur">
                {translatedCaptions[selectedIndex]}
              </div>
            )}

            <div className="absolute bottom-4 right-4 text-sm text-white/70">
              {selectedIndex + 1} / {items.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
