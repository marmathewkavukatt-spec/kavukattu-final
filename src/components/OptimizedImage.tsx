"use client";

import Image from "next/image";
import { useState } from "react";
import ImageSkeleton from "./ImageSkeleton";
import { cloudinaryLoader, isCloudinaryUrl } from "@/lib/cloudinary-image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  loading?: "lazy" | "eager";
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  objectFit = "cover",
  loading = "lazy",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fallback image
  const fallbackSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f5f5f4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23a8a29e'%3EImage%3C/text%3E%3C/svg%3E";
  const resolvedSrc = src || fallbackSrc;
  const resolvedSrcIsCloudinary = isCloudinaryUrl(resolvedSrc);
  const resolvedSrcIsUnoptimized =
    resolvedSrc.startsWith("data:") || resolvedSrc.toLowerCase().endsWith(".svg");

  if (error) {
    return (
      <div className={`bg-stone-100 flex items-center justify-center ${className}`}>
        <span className="text-stone-400 text-sm">Failed to load</span>
      </div>
    );
  }

  const imageProps = {
    src: resolvedSrc,
    alt,
    quality,
    loading: priority ? "eager" : loading,
    onLoad: () => setIsLoading(false),
    onError: () => {
      setError(true);
      setIsLoading(false);
    },
    className: `${className} ${isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'} transition-all duration-300`,
    style: { objectFit },
    placeholder: "blur" as const,
    blurDataURL: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e7e5e4'/%3E%3C/svg%3E",
  };

  return (
    <div className="relative">
      {isLoading && <ImageSkeleton className={fill ? "absolute inset-0" : ""} />}
      {fill ? (
        <Image
          {...imageProps}
          fill
          loader={resolvedSrcIsCloudinary ? cloudinaryLoader : undefined}
          sizes={sizes || "100vw"}
          priority={priority}
          unoptimized={resolvedSrcIsUnoptimized}
        />
      ) : (
        <Image
          {...imageProps}
          width={width || 800}
          height={height || 600}
          loader={resolvedSrcIsCloudinary ? cloudinaryLoader : undefined}
          sizes={sizes}
          priority={priority}
          unoptimized={resolvedSrcIsUnoptimized}
        />
      )}
    </div>
  );
}
