"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslate } from "@/hooks/useTranslate";

interface Category {
  _id: string;
  title: string;
}

interface Props {
  categories: Category[];
  currentCategoryId: string;
}

export default function GalleryCategoryNav({ categories, currentCategoryId }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const translatedTitles = useTranslate(categories.map((cat) => cat.title));

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftShadow(container.scrollLeft > 0);
    setShowRightShadow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  if (categories.length <= 1) return null;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-stone-200 shadow-sm">
      <div className="relative">
        {/* Left shadow */}
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
        )}
        
        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-2 px-4 py-3 min-w-max">
            {categories.map((category, index) => {
              const isActive = category._id === currentCategoryId;
              return (
                <Link
                  key={category._id}
                  href={`/gallery/${category._id}`}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${
                      isActive
                        ? "bg-accent text-white shadow-md"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }
                  `}
                >
                  {translatedTitles[index] || category.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right shadow */}
        {showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        )}
      </div>
    </div>
  );
}
