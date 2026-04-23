"use client";

import Link from "next/link";
import { useLang } from "@/context/LangContext";
import AutoTranslate from "@/components/AutoTranslate";
import { useAutoTranslate } from "@/components/AutoTranslate";

const quickLinks = [
  {
    href: "#administrators",
    title: "Administrators",
    description: "Meet our church leadership and administrators",
  },
  {
    href: "#history",
    title: "History",
    description: "Learn about our church's rich heritage and legacy",
  },
  {
    href: "#timeline",
    title: "Timeline",
    description: "Journey through the key moments of our spiritual leader's life",
  },
  {
    href: "#prayer",
    title: "Prayer",
    description: "Join us in prayer for canonization",
  },
  {
    href: "#spiritual-messages",
    title: "Spiritual Messages",
    description: "Read inspiring messages and teachings",
  },
  {
    href: "#announcements",
    title: "Announcements",
    description: "Stay updated with our latest events and celebrations",
  },
  {
    href: "#gallery",
    title: "Gallery",
    description: "View photos from our church events and activities",
  },
  {
    href: "/contacts",
    title: "Contacts",
    description: "Get in touch with us for any inquiries or support",
  },
];

export default function QuickLinksSection() {
  const { lang } = useLang();
  
  // Real-time translations
  const quickLinksTitle = useAutoTranslate("Quick Links");
  const quickLinksSubtitle = useAutoTranslate("Navigate to different sections of our website");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only handle hash links (not external pages like /contacts)
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        
        // Update URL without triggering navigation
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <section className="relative bg-[#8B1538] py-20 overflow-hidden">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9B1A42]/30 via-transparent to-[#7B1030]/30"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-px w-12 bg-white/40"></div>
            <div className="h-px w-12 bg-white/40 ml-3"></div>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            {quickLinksTitle}
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            {quickLinksSubtitle}
          </p>
        </div>

        {/* Quick Links Grid - Modern Minimal Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className="group relative overflow-hidden"
            >
              {/* Hover Background Effect */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-6 border-l-4 border-transparent group-hover:border-white transition-all duration-300">
                {/* Title */}
                <h3 className="font-serif text-xl font-semibold text-white mb-2 group-hover:text-white/95 transition-colors duration-300">
                  <AutoTranslate text={link.title} />
                </h3>

                {/* Description */}
                <p className="text-sm text-white/80 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                  <AutoTranslate text={link.description} />
                </p>

                {/* Subtle Arrow Indicator */}
                <div className="mt-3 flex items-center text-white/60 group-hover:text-white transition-all duration-300">
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Decorative Element */}
        <div className="flex items-center justify-center mt-16">
          <div className="h-px w-20 bg-white/30"></div>
          <div className="h-px w-20 bg-white/30 ml-4"></div>
        </div>
      </div>
    </section>
  );
}
