"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLogout from "@/components/AdminLogout";
import { LangProvider } from "@/context/LangContext";
import ErrorBoundary from "@/components/ErrorBoundary";

type NavigationLink = {
  label: string;
  href?: string;
  subitems?: { href: string; label: string; }[];
};

const links: NavigationLink[] = [
  { 
    label: "Home Slider",
    subitems: [
      { href: "/admin/dashboard/slider/add", label: "Add Slider" },
      { href: "/admin/dashboard/slider/view", label: "View Sliders" },
    ]
  },
  { 
    label: "Syriac Studies",
    subitems: [
      { href: "/admin/dashboard/resources/add", label: "Add Syriac Studies" },
      { href: "/admin/dashboard/resources/view", label: "View Syriac Studies" },
    ]
  },
  { 
    label: "Favours Recieved",
    subitems: [
      { href: "/admin/dashboard/favours-recieved/add", label: "Add Favour Recieved" },
      { href: "/admin/dashboard/favours-recieved/view", label: "View Favours Recieved" },
    ]
  },
  { 
    label: "Announcements",
    subitems: [
      { href: "/admin/dashboard/announcements/add", label: "Add Announcement" },
      { href: "/admin/dashboard/announcements/view", label: "View Announcements" },
    ]
  },
  { 
    label: "Gallery",
    subitems: [
      { href: "/admin/dashboard/gallery/categories/add", label: "Add Category" },
      { href: "/admin/dashboard/gallery/categories/view", label: "View Categories" },
    ]
  },
  { 
    label: "Public Interventions",
    subitems: [
      { href: "/admin/dashboard/contributions", label: "All Contributions" },
      { href: "/admin/dashboard/contributions?type=Testimonials", label: "Testimonials" },
      { href: "/admin/dashboard/contributions?type=Prayer Requests", label: "Prayer Requests" },
      { href: "/admin/dashboard/contributions?type=Intentions", label: "Intentions" },
    ]
  },
  {
    label: "Archives / Documents",
    subitems: [
      { href: "/admin/dashboard/archives/add", label: "Add Document" },
      { href: "/admin/dashboard/archives/view", label: "View Documents" },
    ],
  },
];

const AdminHeader = memo(function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <Link href="/admin/dashboard" prefetch={true} className="flex items-center">
          <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
            <Image
              src="/uploads/mar-mathew-kavukatt-church-logo.jpg"
              alt="Kavukatt Logo"
              fill
              sizes="(max-width: 640px) 64px, 80px"
              priority
              className="rounded-full object-contain"
              unoptimized
            />
          </div>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/admin/dashboard/profile"
            prefetch={true}
            className="text-sm text-stone-600 hover:text-accent transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-stone-600 hover:text-accent transition-colors"
          >
            View site
          </Link>
          <div className="hidden sm:block">
            <AdminLogout />
          </div>
          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
});

const AdminSidebar = memo(function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand parent items if a subitem is active
  useEffect(() => {
    const activeParents: string[] = [];
    links.forEach((link) => {
      if (link.subitems) {
        const hasActiveSubitem = link.subitems.some((subitem) => pathname === subitem.href);
        if (hasActiveSubitem) {
          activeParents.push(link.label);
        }
      }
    });
    setExpandedItems(activeParents);
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };
  
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-24 space-y-1">
        {links.map((link) => {
          if (link.subitems) {
            const isExpanded = expandedItems.includes(link.label);
            const hasActiveSubitem = link.subitems.some((subitem) => pathname === subitem.href);
            
            return (
              <div key={link.label}>
                <button
                  onClick={() => toggleExpand(link.label)}
                  className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    hasActiveSubitem
                      ? "bg-accent/5 text-accent"
                      : "text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                  }`}
                >
                  <span>{link.label}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-stone-200 pl-3">
                    {link.subitems.map((subitem) => {
                      const isActive = pathname === subitem.href;
                      return (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          prefetch={true}
                          className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-accent/10 text-accent font-medium"
                              : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                          }`}
                        >
                          {subitem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Skip links that don't have href (they only have subitems)
          if (!link.href) {
            return null;
          }

          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href!}
              prefetch={true}
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-stone-600 hover:bg-stone-200 hover:text-stone-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedItems, setMobileExpandedItems] = useState<string[]>([]);
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/setup";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Auto-expand parent items in mobile menu if a subitem is active
  useEffect(() => {
    const activeParents: string[] = [];
    links.forEach((link) => {
      if (link.subitems) {
        const hasActiveSubitem = link.subitems.some((subitem) => pathname === subitem.href);
        if (hasActiveSubitem) {
          activeParents.push(link.label);
        }
      }
    });
    setMobileExpandedItems(activeParents);
  }, [pathname]);

  const toggleMobileExpand = (label: string) => {
    setMobileExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    const prefetchTargets = ["/admin/dashboard", "/admin/dashboard/profile"];
    links.forEach((link) => {
      if (link.href) {
        prefetchTargets.push(link.href);
      }
      if (link.subitems) {
        link.subitems.forEach((subitem) => prefetchTargets.push(subitem.href));
      }
    });
    prefetchTargets.forEach((href) => {
      router.prefetch(href);
    });
  }, [router]);

  return (
    <LangProvider>
      <ErrorBoundary>
        {isLoginPage ? (
          <>{children}</>
        ) : (
          <>
            <div className="min-h-screen bg-stone-100">
              <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />
              <div className="mx-auto flex max-w-screen-2xl gap-8 px-4 py-6 sm:px-6 lg:px-8">
                <AdminSidebar />
                <div className="min-w-0 flex-1">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </div>
              </div>
            </div>

          {/* Mobile slide-in menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />

                {/* Slide-in panel */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed right-0 top-0 z-50 h-full w-64 bg-white shadow-2xl lg:hidden"
                >
                  <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
                      <span className="font-serif text-lg font-semibold text-accent">Admin Menu</span>
                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md p-2 text-stone-600 hover:bg-stone-100"
                        aria-label="Close menu"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Navigation links */}
                    <nav className="flex-1 overflow-y-auto px-4 py-4">
                      <div className="space-y-1">
                        {links.map((link) => {
                          if (link.subitems) {
                            const isExpanded = mobileExpandedItems.includes(link.label);
                            const hasActiveSubitem = link.subitems.some((subitem) => pathname === subitem.href);
                            
                            return (
                              <div key={link.label}>
                                <button
                                  onClick={() => toggleMobileExpand(link.label)}
                                  className={`w-full flex items-center justify-between rounded-md px-3 py-3 text-base font-medium transition-colors ${
                                    hasActiveSubitem
                                      ? "bg-accent/10 text-accent"
                                      : "text-stone-700 hover:bg-stone-100"
                                  }`}
                                >
                                  <span>{link.label}</span>
                                  <svg
                                    className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                {isExpanded && (
                                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-stone-200 pl-3">
                                    {link.subitems.map((subitem) => {
                                      const isActive = pathname === subitem.href;
                                      return (
                                        <Link
                                          key={subitem.href}
                                          href={subitem.href}
                                          prefetch={true}
                                          onClick={() => setMobileMenuOpen(false)}
                                          className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                                            isActive
                                              ? "bg-accent/10 text-accent font-medium"
                                              : "text-stone-600 hover:bg-stone-100"
                                          }`}
                                        >
                                          {subitem.label}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // Skip links that don't have href (they only have subitems)
                          if (!link.href) {
                            return null;
                          }

                          const isActive = pathname === link.href;
                          return (
                            <Link
                              key={link.href}
                              href={link.href!}
                              prefetch={true}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`block rounded-md px-3 py-3 text-base font-medium transition-colors ${
                                isActive
                                  ? "bg-accent/10 text-accent"
                                  : "text-stone-700 hover:bg-stone-100"
                              }`}
                            >
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </nav>

                    {/* Footer actions */}
                    <div className="border-t border-stone-200 p-4 space-y-2">
                      <Link
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-md px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
                      >
                        View site
                      </Link>
                      <div className="px-3">
                        <AdminLogout />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
      </ErrorBoundary>
    </LangProvider>
  );
}
