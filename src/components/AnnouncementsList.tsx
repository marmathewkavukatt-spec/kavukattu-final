"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicAnnouncement } from "@/lib/site-data";
import { useTranslate } from "@/hooks/useTranslate";
import { useLang } from "@/context/LangContext";
import { useAutoTranslate } from "@/components/AutoTranslate";

function formatDate(lang: string, date: string) {
  try {
    const locale = lang === "ml" ? "ml-IN" : "en-US";
    return new Date(date).toLocaleDateString(locale, { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return date;
  }
}

function AnnouncementCard({ item }: { item: PublicAnnouncement }) {
  const { lang } = useLang();
  const [title, content] = useTranslate([item.title, item.content]);
  const viewDocumentText = useAutoTranslate("View Document");

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl bg-white border border-stone-200 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-stone-300 hover:shadow-md flex flex-col group h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-6 bg-accent/40" />
          <time className="text-xs font-semibold tracking-widest text-stone-500 uppercase" dateTime={item.date}>
          {formatDate(lang, item.date)}
        </time>
      </div>
      
      <h3 className="mb-4 font-serif text-[20px] font-medium leading-snug text-stone-900 transition-colors duration-300 group-hover:text-accent whitespace-pre-line">
        {title}
      </h3>
      
      <p className="text-[15px] leading-relaxed text-stone-600 mb-6 flex-1 whitespace-pre-line">{content}</p>
      
      <div className="mt-auto flex flex-wrap items-center gap-3">
        {item.fileUrl && (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {viewDocumentText}
          </a>
        )}
      </div>
    </div>
  );
}

export default function AnnouncementsList({ items }: { items: PublicAnnouncement[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const previousText = useAutoTranslate("Previous");
  const nextText = useAutoTranslate("Next");
  const goToSlideText = useAutoTranslate("Go to slide");

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;
    
    const intervalId = setInterval(() => {
      goToNext();
    }, 4000); // Change every 4 seconds

    return () => clearInterval(intervalId);
  }, [isAutoPlaying, items.length, goToNext]);

  if (items.length === 0) {
    return null;
  }

  // If only one item, show it without navigation
  if (items.length === 1) {
    return (
      <div className="mt-12 flex justify-center">
        <AnnouncementCard item={items[0]} />
      </div>
    );
  }

  return (
    <div 
      className="relative mt-12"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Main card display */}
      <div className="flex justify-center px-4">
        <AnnouncementCard item={items[currentIndex]} />
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-stone-200 text-stone-600 shadow-lg transition-all hover:bg-stone-50 hover:border-stone-300 hover:scale-110 z-10"
        aria-label={previousText}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-stone-200 text-stone-600 shadow-lg transition-all hover:bg-stone-50 hover:border-stone-300 hover:scale-110 z-10"
        aria-label={nextText}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots indicator */}
      <div className="mt-8 flex justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex 
                ? "w-8 bg-accent" 
                : "w-2 bg-stone-300 hover:bg-stone-400"
            }`}
            aria-label={`${goToSlideText} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
