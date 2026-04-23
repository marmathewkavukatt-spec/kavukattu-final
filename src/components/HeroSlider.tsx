"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  cloudinaryLoader,
  getBrowserSafeImageUrl,
  getCloudinaryImageUrl,
  isCloudinaryUrl,
} from "@/lib/cloudinary-image";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { useTranslate } from "@/hooks/useTranslate";
import { useAutoTranslate } from "@/components/AutoTranslate";

interface Slide {
  _id: string;
  image: string;
  title?: string;
  subtitle?: string;
  order: number;
}

const NEXT_IMAGE_ALLOWED_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
];

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(() => new Set());
  const [mobileAspectRatios, setMobileAspectRatios] = useState<Record<string, string>>({});
  const aspectRatioCacheRef = useRef<Record<string, string>>({});
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { lang } = useLang();
  const tr = t[lang];
  const current = slides[index];
  const currentImageSrc = current?.image ?? "";
  const currentImageIsCloudinary = Boolean(current?.image && isCloudinaryUrl(current.image));
  const currentImageIsUnoptimized =
    currentImageSrc.startsWith("data:") || currentImageSrc.toLowerCase().endsWith(".svg");

  const [title, subtitle] = useTranslate([
    current?.title ?? null,
    current?.subtitle ?? null,
  ]);
  const goToSlideText = useAutoTranslate("Go to slide");

  const showOverlay = Boolean(title || subtitle);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQueryList.matches);

    update();

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", update);
      return () => mediaQueryList.removeEventListener("change", update);
    }

    mediaQueryList.addListener(update);
    return () => mediaQueryList.removeListener(update);
  }, []);

  const setAspectRatioForSlide = useCallback((slideId: string, width: number, height: number) => {
    if (!slideId || !width || !height) return;

    const ratio = `${width} / ${height}`;
    if (aspectRatioCacheRef.current[slideId] === ratio) return;

    aspectRatioCacheRef.current[slideId] = ratio;
    setMobileAspectRatios((prev) => (prev[slideId] === ratio ? prev : { ...prev, [slideId]: ratio }));
  }, []);

  const markImageLoaded = useCallback((targetIndex: number) => {
    setImagesLoaded((prev) => {
      if (prev.has(targetIndex)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(targetIndex);
      return next;
    });
  }, []);

  const preloadSlide = useCallback(
    (targetIndex: number) => {
      const slide = slides[targetIndex];
      if (!slide) {
        return;
      }

      const hasAspectRatio = Boolean(aspectRatioCacheRef.current[slide._id]);
      if (imagesLoaded.has(targetIndex) && hasAspectRatio) {
        return;
      }

      const img = new window.Image();
      img.decoding = "async";

      let didResolve = false;
      const resolve = () => {
        if (didResolve) return;
        didResolve = true;

        setAspectRatioForSlide(
          slide._id,
          img.naturalWidth || 0,
          img.naturalHeight || 0
        );
        markImageLoaded(targetIndex);
      };

      img.onload = resolve;

      const isUnoptimized =
        slide.image.startsWith("data:") || slide.image.toLowerCase().endsWith(".svg");
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
      const preloadWidth = Math.max(16, Math.round(viewportWidth * dpr));
      const normalizedWidth =
        NEXT_IMAGE_ALLOWED_WIDTHS.find((allowedWidth) => allowedWidth >= preloadWidth)
        ?? NEXT_IMAGE_ALLOWED_WIDTHS[NEXT_IMAGE_ALLOWED_WIDTHS.length - 1];

      img.src = isUnoptimized
        ? slide.image
        : isCloudinaryUrl(slide.image)
          ? getCloudinaryImageUrl(slide.image, {
              width: normalizedWidth,
              quality: 70,
            })
          : getBrowserSafeImageUrl(slide.image, {
              width: normalizedWidth,
              quality: 70,
            });

      if (img.complete) {
        resolve();
      }
    },
    [imagesLoaded, markImageLoaded, setAspectRatioForSlide, slides]
  );

  const goToSlide = useCallback(
    (targetIndex: number) => {
      if (!slides[targetIndex] || targetIndex === index) {
        return;
      }

      const slideId = slides[targetIndex]._id;
      const hasAspectRatio = Boolean(
        aspectRatioCacheRef.current[slideId] ?? mobileAspectRatios[slideId]
      );
      const canSwitch = imagesLoaded.has(targetIndex) && (!isMobile || hasAspectRatio);

      if (canSwitch) {
        setPendingIndex(null);
        setIndex(targetIndex);
        return;
      }

      setPendingIndex(targetIndex);
      preloadSlide(targetIndex);
    },
    [imagesLoaded, index, isMobile, mobileAspectRatios, preloadSlide, slides]
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    if (pendingIndex !== null) return;
    const timer = setInterval(() => {
      const nextIndex = (index + 1) % slides.length;
      goToSlide(nextIndex);
    }, 5000);
    return () => clearInterval(timer);
  }, [goToSlide, index, pendingIndex, slides.length]);

  useEffect(() => {
    if (!slides.length) {
      return;
    }

    if (slides.length > 1) {
      preloadSlide((index + 1) % slides.length);
    }
  }, [index, preloadSlide, slides.length]);

  useEffect(() => {
    if (pendingIndex === null) {
      return;
    }

    const slide = slides[pendingIndex];
    if (!slide) {
      return;
    }

    const hasAspectRatio = Boolean(
      aspectRatioCacheRef.current[slide._id] ?? mobileAspectRatios[slide._id]
    );

    if (imagesLoaded.has(pendingIndex) && (!isMobile || hasAspectRatio)) {
      setIndex(pendingIndex);
      setPendingIndex(null);
    }
  }, [imagesLoaded, isMobile, mobileAspectRatios, pendingIndex, slides]);

  if (!slides.length) {
    return (
      <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center bg-stone-200">
        <div className="text-center text-stone-500">
          <p className="font-serif text-2xl">{tr.welcome}</p>
          <p className="mt-2 text-sm">{tr.addSlides}</p>
        </div>
      </section>
    );
  }

  const currentAspectRatio =
    aspectRatioCacheRef.current[current._id] ?? mobileAspectRatios[current._id] ?? "4 / 5";

  return (
    <section className="group relative w-full overflow-hidden bg-stone-200 md:h-[calc(100vh-80px)] md:min-h-[500px]">
      <div className="w-full md:hidden" style={{ aspectRatio: currentAspectRatio }} aria-hidden="true" />
      <AnimatePresence initial={false}>
        <motion.div
          key={current._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={currentImageSrc}
            alt={title || current.title || "Slide"}
            fill
            loader={currentImageIsCloudinary ? cloudinaryLoader : undefined}
            className="object-contain object-center md:object-cover"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            quality={70}
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23d6d3d1'/%3E%3C/svg%3E"
            unoptimized={currentImageIsUnoptimized}
            onLoad={() => markImageLoaded(index)}
            onLoadingComplete={(img) =>
              setAspectRatioForSlide(current._id, img.naturalWidth || 0, img.naturalHeight || 0)
            }
          />
          {showOverlay ? (
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
          ) : null}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end px-4 pb-8 text-center sm:px-8 md:px-16 md:pb-12 lg:px-24 lg:pb-16">
            {title && (
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mx-auto max-w-5xl whitespace-pre-line font-serif text-3xl font-bold leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] sm:text-4xl md:text-5xl lg:text-6xl"
                style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)' }}
              >
                {title}
              </motion.h1>
            )}
            {subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mx-auto mt-2 max-w-3xl whitespace-pre-line text-base text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-lg md:mt-3 md:text-xl"
                style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.5)' }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-3 py-2 shadow-lg backdrop-blur-sm opacity-80 transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
            {slides.map((_, i) => (
              <button
                key={slides[i]._id}
                type="button"
                onClick={() => goToSlide(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  i === index
                    ? "scale-125 bg-white"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`${goToSlideText} ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
