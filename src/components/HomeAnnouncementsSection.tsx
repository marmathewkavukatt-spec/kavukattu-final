"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { PublicAnnouncementCard } from "@/lib/site-data";
import { useLang } from "@/context/LangContext";
import { useTranslate } from "@/hooks/useTranslate";

function formatDate(lang: string, date: string) {
  try {
    const d = new Date(date);
    const locale = lang === "ml" ? "ml-IN" : "en-US";
    const monthShort = d.toLocaleDateString(locale, { month: "short" });

    return {
      day: d.getDate().toString().padStart(2, "0"),
      month: lang === "en" ? monthShort.toUpperCase() : monthShort,
      year: d.getFullYear().toString(),
    };
  } catch {
    return { day: "00", month: lang === "en" ? "JAN" : "ജനു", year: "2024" };
  }
}

const CATEGORY_CONFIG_EN = [
  {
    id: "upcoming-events",
    label: "Upcoming Events",
    desc: "Join us for upcoming church events and celebrations",
    color: "#17a2b8",
  },
  {
    id: "feast-days",
    label: "Feast Days",
    desc: "Celebrate special feast days and holy occasions",
    color: "#ffc107",
  },
  {
    id: "special-prayers",
    label: "Special Prayers",
    desc: "Participate in special prayer services and devotions",
    color: "#6f42c1",
  },
];

export default function HomeAnnouncementsSection({
  announcements,
}: {
  announcements: PublicAnnouncementCard[];
}) {
  const { lang } = useLang();

  const [
    announcementsTitle,
    announcementsSubtitle,
    emptyAnnouncementsText,
    goToSlideText,
    viewAllText,
    postedOnText,
  ] = useTranslate([
    "Announcements",
    "Stay updated with our latest events and celebrations",
    "No announcements available at the moment",
    "Go to slide",
    "View All",
    "Posted on",
  ]);

  const categoryStrings = CATEGORY_CONFIG_EN.flatMap((cat) => [cat.label, cat.desc]);
  const categoryStringsTranslated = useTranslate(categoryStrings);
  const categories = CATEGORY_CONFIG_EN.map((cat, idx) => ({
    ...cat,
    label: categoryStringsTranslated[idx * 2] || cat.label,
    desc: categoryStringsTranslated[idx * 2 + 1] || cat.desc,
  }));

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id ?? "upcoming-events");
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Group announcements by category
  const groupedAnnouncements = categories.reduce((acc, cat) => {
    acc[cat.id] = announcements.filter((a) => a.category === cat.id).slice(0, 3);
    return acc;
  }, {} as Record<string, PublicAnnouncementCard[]>);

  const currentCategoryId = selectedCategory || categories[0]?.id || CATEGORY_CONFIG_EN[0].id;
  const currentItems = groupedAnnouncements[currentCategoryId] || [];
  const currentCategory = categories.find((c) => c.id === currentCategoryId);

  useEffect(() => {
    setCurrentSlide(0);
  }, [currentCategoryId]);

  // Auto-advance carousel
  useEffect(() => {
    if (currentItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentItems.length]);

  const nextSlide = () => {
    if (currentItems.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % currentItems.length);
  };

  const prevSlide = () => {
    if (currentItems.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + currentItems.length) % currentItems.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  if (announcements.length === 0) {
    return (
      <section id="announcements" className="relative py-16 bg-stone-50 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-6">
              {announcementsTitle}
            </h2>
            <p className="text-base md:text-lg text-stone-600 max-w-3xl mx-auto">
              {announcementsSubtitle}
            </p>
          </div>

          <div className="text-center py-12 rounded-xl bg-white border border-stone-200">
            <p className="text-lg font-medium text-stone-600">{emptyAnnouncementsText}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="announcements" className="relative py-16 bg-stone-50 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            {announcementsTitle}
          </h2>
          <div className="mx-auto h-1 w-24 rounded-full bg-accent mb-6" />
          <p className="text-base md:text-lg text-stone-600 max-w-3xl mx-auto">
            {announcementsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left: Carousel */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.div
              className="relative bg-white rounded overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            >
              <div
                className="relative aspect-[16/9] overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="wait">
                  {currentItems.length > 0 && currentItems[currentSlide] ? (
                    <CarouselSlide
                      key={`${currentCategoryId}-${currentSlide}`}
                      item={currentItems[currentSlide]}
                    />
                  ) : null}
                </AnimatePresence>
              </div>

              {currentItems.length > 1 && (
                <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1.5 md:px-3 md:py-2">
                  {currentItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentSlide ? "w-6 bg-accent" : "w-1.5 bg-white/50"
                      }`}
                      aria-label={`${goToSlideText} ${idx + 1}`}
                      type="button"
                    />
                  ))}
                </div>
              )}
            </motion.div>

            <div className="mt-3 md:mt-4">
              {currentItems.length > 0 && currentItems[currentSlide] ? (
                <TextContent item={currentItems[currentSlide]} lang={lang} postedOnText={postedOnText} />
              ) : null}
            </div>
          </div>

          {/* Right: Category Cards */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="space-y-1 md:space-y-3">
              {categories.map((category, index) => {
                const items = groupedAnnouncements[category.id] || [];
                const isActive = currentCategoryId === category.id;

                return (
                  <div key={category.id}>
                    <motion.button
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`w-full text-left p-2 md:p-4 rounded transition-all duration-300 ${
                        isActive
                          ? "bg-accent text-white shadow-md"
                          : "bg-white text-stone-800 shadow-sm hover:shadow-md hover:bg-accent/5 active:scale-[0.99]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 md:mb-1">
                            {isActive ? (
                              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-white animate-pulse" />
                            ) : null}
                            <h3
                              className={`font-serif text-sm md:text-lg font-bold ${
                                isActive ? "text-white" : "text-stone-800"
                              }`}
                            >
                              {category.label}
                            </h3>
                          </div>
                          <p className={`hidden md:block text-xs md:text-sm leading-relaxed ${isActive ? "text-white/90" : "text-stone-600"}`}>
                            {category.desc}
                          </p>
                        </div>
                      </div>

                      {isActive && items.length > 0 ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-white/20"
                        >
                          <Link
                            href="/announcements"
                            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wide text-white hover:gap-3 transition-all"
                          >
                            <span>{viewAllText}</span>
                            <span className="text-base">→</span>
                          </Link>
                        </motion.div>
                      ) : null}
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TextContent({
  item,
  lang,
  postedOnText,
}: {
  item: PublicAnnouncementCard;
  lang: string;
  postedOnText: string;
}) {
  const [title, subtitle] = useTranslate([item.title, item.subtitle || ""]);
  const dateInfo = formatDate(lang, item.date);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item._id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="space-y-1.5 md:space-y-2"
      >
        <div className="inline-flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 md:px-3 md:py-1.5 text-accent shadow-sm">
          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs md:text-sm font-semibold">
            {postedOnText}: {dateInfo.month} {dateInfo.day}, {dateInfo.year}
          </span>
        </div>

        <h3 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-stone-900 leading-tight">
          {title}
        </h3>

        {subtitle ? (
          <p className="text-sm sm:text-base md:text-lg text-stone-700 leading-relaxed">
            {subtitle}
          </p>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}

function CarouselSlide({ item }: { item: PublicAnnouncementCard }) {
  const [title] = useTranslate([item.title]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0"
    >
      <div className="block h-full">
        <div className="relative h-full overflow-hidden">
          {item.coverImage ? (
            <div className="absolute inset-0">
              <img src={item.coverImage} alt={title} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
              <svg className="w-24 h-24 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
