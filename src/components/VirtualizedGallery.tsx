"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  cloudinaryLoader,
  getBrowserSafeImageUrl,
  getCloudinaryImageUrl,
  isCloudinaryUrl,
} from "@/lib/cloudinary-image";
import { useTranslate } from "@/hooks/useTranslate";

interface GalleryItem {
  _id: string;
  image: string;
  caption?: string;
}

interface VirtualizedGalleryProps {
  items: GalleryItem[];
  onItemClick: (index: number) => void;
  itemHeight?: number;
  overscan?: number;
}

function toBrowserSafeSrc(src: string) {
  if (!src) return src;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  return encodeURI(src);
}

export default function VirtualizedGallery({ 
  items, 
  onItemClick, 
  itemHeight = 300,
  overscan = 5 
}: VirtualizedGalleryProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const translatedCaptions = useTranslate(items.map((item) => item.caption ?? null));
  const [galleryImageText] = useTranslate(["Gallery image"]);

  // Calculate grid layout
  const { itemsPerRow, totalRows, visibleRange } = useMemo(() => {
    if (typeof window === "undefined") {
      return { itemsPerRow: 3, totalRows: 0, visibleRange: { start: 0, end: 0 } };
    }

    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const itemsPerRow = containerWidth >= 1024 ? 3 : containerWidth >= 640 ? 2 : 1;
    const totalRows = Math.ceil(items.length / itemsPerRow);
    
    const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      itemsPerRow,
      totalRows,
      visibleRange: { start: startRow, end: endRow }
    };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Preload visible images
  useEffect(() => {
    const startIndex = visibleRange.start * itemsPerRow;
    const endIndex = Math.min((visibleRange.end + 1) * itemsPerRow, items.length);

    for (let i = startIndex; i < endIndex; i++) {
      if (!preloadedImages.has(i) && items[i]) {
        const img = new window.Image();
        const item = items[i];
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
          setPreloadedImages((prev) => new Set(prev).add(i));
        };
      }
    }
  }, [visibleRange, itemsPerRow, items, preloadedImages]);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    
    for (let row = visibleRange.start; row <= visibleRange.end; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index >= items.length) break;

        const item = items[index];
        const caption = translatedCaptions[index];
        const previewImageIsCloudinary = isCloudinaryUrl(item.image);
        const previewImageIsUnoptimized =
          item.image.startsWith("data:") || item.image.toLowerCase().endsWith(".svg");
        const previewImageSrc = toBrowserSafeSrc(item.image);

        items_to_render.push(
          <motion.figure
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (index % itemsPerRow) * 0.1 }}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-stone-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{
              position: 'absolute',
              top: row * itemHeight,
              left: `${(col / itemsPerRow) * 100}%`,
              width: `${100 / itemsPerRow}%`,
              height: itemHeight - 24, // Account for gap
              padding: '0 12px'
            }}
            onClick={() => onItemClick(index)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
              <Image
                src={previewImageSrc}
                alt={caption || item.caption || galleryImageText}
                fill
                loader={previewImageIsCloudinary ? cloudinaryLoader : undefined}
                priority={index < 6}
                loading={index < 6 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e7e5e4'/%3E%3C/svg%3E"
                className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-90"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={60}
                unoptimized={previewImageIsUnoptimized}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            {caption && (
              <figcaption className="p-4 text-center text-sm font-medium text-stone-700 group-hover:text-stone-900">
                {caption}
              </figcaption>
            )}
          </motion.figure>
        );
      }
    }
    
    return items_to_render;
  }, [visibleRange, itemsPerRow, items, translatedCaptions, galleryImageText, itemHeight, onItemClick]);

  const totalHeight = totalRows * itemHeight;

  return (
    <div
      ref={containerRef}
      className="mt-8 h-[70vh] overflow-auto"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div
        className="relative"
        style={{ height: totalHeight }}
      >
        {visibleItems}
      </div>
    </div>
  );
}