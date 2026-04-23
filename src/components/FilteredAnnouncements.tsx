"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import type { PublicAnnouncementCard } from "@/lib/site-data";
import { useTranslate } from "@/hooks/useTranslate";
import { useLang } from "@/context/LangContext";

function formatDate(lang: string, date: string) {
  try {
    const d = new Date(date);
    const locale = lang === "ml" ? "ml-IN" : "en-US";
    const monthShort = d.toLocaleDateString(locale, { month: "short" });

    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: lang === "en" ? monthShort.toUpperCase() : monthShort,
      year: d.getFullYear(),
      full: d.toLocaleDateString(locale, { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
  } catch {
    return { day: '00', month: 'JAN', year: 2024, full: date };
  }
}

const CATEGORIES_EN = [
  { 
    id: "all", 
    label: "All Announcements",
    description: "View all church announcements and updates"
  },
  { 
    id: "upcoming-events", 
    label: "Upcoming Events",
    description: "Join us for upcoming church events, gatherings, and special occasions"
  },
  { 
    id: "feast-days", 
    label: "Feast Days",
    description: "Celebrate holy feast days and special liturgical celebrations"
  },
  { 
    id: "special-prayers", 
    label: "Special Prayers",
    description: "Community prayer gatherings and intercession services"
  },
];

function AnnouncementCard({
  item,
  categoryLabelMap,
  lang,
}: {
  item: PublicAnnouncementCard;
  categoryLabelMap: Record<string, string>;
  lang: string;
}) {
  const [title, subtitle] = useTranslate([
    item.title, 
    item.subtitle || ""
  ]);
  const dateInfo = formatDate(lang, item.date);
  const categoryLabel = categoryLabelMap[item.category] || item.category;

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link href={`/announcements/${item._id}`} className="block h-full">
        <div className="h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          {/* Image Section */}
          <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
            {item.coverImage ? (
              <img
                src={item.coverImage}
                alt={title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                <svg className="w-16 h-16 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="inline-block rounded px-2.5 py-1 text-xs font-semibold bg-accent text-white shadow-sm">
                {categoryLabel}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Date */}
            <div className="flex items-center gap-1.5 text-accent mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time className="text-xs font-semibold" dateTime={item.date}>
                {dateInfo.full}
              </time>
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg font-bold text-stone-900 line-clamp-2 mb-1 group-hover:text-accent transition-colors">
              {title}
            </h3>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm text-stone-600 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
export default function FilteredAnnouncements({ items }: { items: PublicAnnouncementCard[] }) {
  const { lang } = useLang();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categoryLabelMap: Record<string, string> = {
    "upcoming-events": "Upcoming Events",
    "feast-days": "Feast Days",
    "special-prayers": "Special Prayers",
  };

  // Get unique categories from items
  const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
  
  // Filter items based on active category
  const filteredItems = activeCategory === "all" 
    ? items 
    : items.filter(item => item.category === activeCategory);

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
            activeCategory === "all"
              ? "bg-accent text-white shadow-md"
              : "bg-stone-200 text-stone-700 hover:bg-stone-300"
          }`}
        >
          All Announcements
        </motion.button>
        
        {uniqueCategories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
              activeCategory === category
                ? "bg-accent text-white shadow-md"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
            }`}
          >
            {categoryLabelMap[category] || category}
          </motion.button>
        ))}
      </div>

      {/* Announcements Grid */}
      <motion.ul 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredItems.map((item) => (
          <AnnouncementCard 
            key={item._id} 
            item={item}
            categoryLabelMap={categoryLabelMap}
            lang={lang}
          />
        ))}
      </motion.ul>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-stone-600 text-lg">
            No announcements found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
