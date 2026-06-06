"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Facebook, Instagram, Youtube } from "lucide-react";
import { useLang } from "@/context/LangContext";
import ContributionModal from "./ContributionModal";
import { useAutoTranslate } from "@/components/AutoTranslate";

const socialLinks = [
  { href: "https://www.facebook.com/share/v/1BKHmoTwS3/", label: "Facebook", Icon: Facebook },
  { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
  { href: "/youtube", label: "YouTube", Icon: Youtube },
];

function LangToggle({ lang, setLang }: { lang: string, setLang: (lang: "en" | "ml") => void }) {
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ml" : "en")}
      className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-accent"
      title={lang === "en" ? "Switch to Malayalam" : "Switch to English"}
    >
      {lang === "en" ? "മലയാളം" : "English"}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [aboutOpenDesktop, setAboutOpenDesktop] = useState(false);
  const [mediaOpenDesktop, setMediaOpenDesktop] = useState(false);
  const [archivesOpenDesktop, setArchivesOpenDesktop] = useState(false);
  const [getInvolvedOpenDesktop, setGetInvolvedOpenDesktop] = useState(false);
  const [aboutOpenMobile, setAboutOpenMobile] = useState(false);
  const [mediaOpenMobile, setMediaOpenMobile] = useState(false);
  const [archivesOpenMobile, setArchivesOpenMobile] = useState(false);
  const [getInvolvedOpenMobile, setGetInvolvedOpenMobile] = useState(false);
  const { lang, setLang } = useLang();

  // Real-time translations for navigation
  const siteTitle = useAutoTranslate("MAR MATHEW KAVUKATT");
  const homeText = useAutoTranslate("Home");
  const aboutText = useAutoTranslate("About");
  const historyText = useAutoTranslate("History");
  const spiritualLegacyText = useAutoTranslate("Spiritual Legacy");
  const mediaText = useAutoTranslate("Media");
  const resourcesText = useAutoTranslate("Syriac Studies");
  const archivesDocumentsText = useAutoTranslate("Archives & Documents");
  const favoursRecievedText = useAutoTranslate("Favours Recieved");
  const galleryText = useAutoTranslate("Gallery");
  const visitText = useAutoTranslate("Visit");
  const publicInterventionsText = useAutoTranslate("Public Interventions");
  const contactsText = useAutoTranslate("Contact us");
  const menuText = useAutoTranslate("Menu");
  const openMenuText = useAutoTranslate("Open Menu");
  const closeMenuText = useAutoTranslate("Close Menu");
  const followUsText = useAutoTranslate("Follow Us");
  const pastoralLettersText = useAutoTranslate("Pastoral Letters");
  const circularsText = useAutoTranslate("Circulars");
  const othersText = useAutoTranslate("Others");
  const allDocumentsText = useAutoTranslate("All Documents");
  const getInvolvedText = useAutoTranslate("Get Involved");

  // Organized navigation structure - compact for desktop
  const navLinksMain = [
    { href: "/", label: homeText },
  ];

  const navLinksAfterAbout = [
    { href: "/gallery", label: galleryText },
    { href: "/visit", label: visitText },
  ];

  const navLinksEnd = [
    { href: "/contacts", label: contactsText },
  ];
  const isAdmin = pathname.startsWith("/admin");
  const isAboutActive = pathname.startsWith("/about") || pathname.startsWith("/spiritual-legacy");
  const isMediaActive = pathname.startsWith("/resources") || pathname.startsWith("/archives");
  const isGetInvolvedActive = pathname.startsWith("/favours-recieved");

  useEffect(() => {
    [
      { href: "/", label: homeText },
      { href: "/about", label: aboutText },
      { href: "/spiritual-legacy", label: spiritualLegacyText },
      { href: "/resources", label: resourcesText },
      { href: "/archives", label: archivesDocumentsText },
      { href: "/gallery", label: galleryText },
      { href: "/visit", label: visitText },
      { href: "/favours-recieved", label: favoursRecievedText },
      { href: "/contacts", label: contactsText },
    ].forEach((link) => router.prefetch(link.href));
  }, [router, homeText, aboutText, spiritualLegacyText, resourcesText, archivesDocumentsText, galleryText, visitText, favoursRecievedText, contactsText]);

  if (isAdmin) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        {/* First Line: Logo, Name, Social Media, Language Toggle */}
        <div className="border-b border-stone-100">
          <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-2 px-2 py-2 sm:px-4 sm:py-2.5 lg:px-8">
            <Link href="/" className="flex items-center gap-2 shrink min-w-0 overflow-hidden" prefetch={true}>
              <div className="relative h-10 w-10 shrink-0 sm:h-12 sm:w-12 lg:h-14 lg:w-14">
                <Image
                  src="/uploads/mar-mathew-kavukatt-church-logo.jpg"
                  alt="Church Logo"
                  fill
                  sizes="(max-width: 640px) 40px, (max-width: 1024px) 48px, 56px"
                  className="rounded-full object-contain"
                  priority
                  unoptimized
                />
              </div>
              {/* Two-line title for mobile, single line for larger screens */}
              <div className="flex flex-col sm:block">
                <span className="text-sm font-serif font-bold text-accent leading-tight uppercase sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
                  {siteTitle}
                </span>
              </div>
            </Link>

            {/* Social Media & Language Toggle */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="hidden items-center gap-1 md:flex">
                {socialLinks.map(({ href, label, Icon }) => (
                  href.startsWith("http") ? (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="rounded-md p-2 sm:p-2.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-accent"
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  ) : (
                    <Link
                      key={label}
                      href={href}
                      prefetch={true}
                      aria-label={label}
                      className="rounded-md p-2 sm:p-2.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-accent"
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Link>
                  )
                ))}
              </div>
              {/* Language toggle for tablet */}
              <div className="hidden sm:block lg:hidden">
                <LangToggle lang={lang} setLang={setLang} />
              </div>
              {/* Language toggle for mobile - show before menu button */}
              <div className="block sm:hidden">
                <LangToggle lang={lang} setLang={setLang} />
              </div>
              {/* Mobile menu button */}
              <button type="button"
                className="flex items-center justify-center rounded-lg p-2.5 text-white bg-accent hover:bg-accent/90 lg:hidden shadow-md"
                onClick={() => setOpen(true)} aria-expanded={open} aria-label={openMenuText}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {/* Language toggle for desktop */}
              <div className="hidden lg:block">
                <LangToggle lang={lang} setLang={setLang} />
              </div>
            </div>
          </div>
        </div>

        {/* Second Line: Navigation Links - Compact Design */}
        <nav className="mx-auto hidden max-w-screen-2xl flex-wrap items-center justify-center gap-x-0.5 gap-y-1 px-4 py-2 sm:px-6 lg:flex lg:px-8">
            {/* Home */}
            {navLinksMain.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-colors lg:px-3 lg:py-2 lg:text-base ${
                  pathname === link.href
                    ? "bg-accent/10 text-accent"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* About dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setAboutOpenDesktop(true)}
              onMouseLeave={() => setAboutOpenDesktop(false)}
            >
              <button
                type="button"
                onClick={() => setAboutOpenDesktop((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={aboutOpenDesktop}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-colors lg:px-3 lg:py-2 lg:text-base ${
                  isAboutActive
                    ? "bg-accent/10 text-accent"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {aboutText}
                <ChevronDown className={`h-3.5 w-3.5 lg:h-4 lg:w-4 transition-transform ${aboutOpenDesktop ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {aboutOpenDesktop && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
                    role="menu"
                  >
                    <div className="p-2">
                      <Link
                        href="/about"
                        prefetch={true}
                        onClick={() => setAboutOpenDesktop(false)}
                        className={`block rounded-lg px-3 py-2 text-base font-semibold uppercase tracking-[0.12em] transition-colors ${
                          pathname === "/about"
                            ? "bg-accent/10 text-accent"
                            : "text-stone-700 hover:bg-stone-50"
                        }`}
                        role="menuitem"
                      >
                        {historyText}
                      </Link>
                      <Link
                        href="/spiritual-legacy"
                        prefetch={true}
                        onClick={() => setAboutOpenDesktop(false)}
                        className={`block rounded-lg px-3 py-2 text-base font-semibold uppercase tracking-[0.12em] transition-colors ${
                          pathname === "/spiritual-legacy"
                            ? "bg-accent/10 text-accent"
                            : "text-stone-700 hover:bg-stone-50"
                        }`}
                        role="menuitem"
                      >
                        {spiritualLegacyText}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Media dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMediaOpenDesktop(true)}
              onMouseLeave={() => {
                setMediaOpenDesktop(false);
                setArchivesOpenDesktop(false);
              }}
            >
              <button
                type="button"
                onClick={() => setMediaOpenDesktop((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={mediaOpenDesktop}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-colors lg:px-3 lg:py-2 lg:text-base ${
                  isMediaActive
                    ? "bg-accent/10 text-accent"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {mediaText}
                <ChevronDown className={`h-3.5 w-3.5 lg:h-4 lg:w-4 transition-transform ${mediaOpenDesktop ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {mediaOpenDesktop && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
                    role="menu"
                  >
                    <div className="p-2">
                      <Link
                        href="/resources"
                        prefetch={true}
                        onClick={() => setMediaOpenDesktop(false)}
                        className={`block rounded-lg px-3 py-2 text-base font-semibold uppercase tracking-[0.12em] transition-colors ${
                          pathname.startsWith("/resources")
                            ? "bg-accent/10 text-accent"
                            : "text-stone-700 hover:bg-stone-50"
                        }`}
                        role="menuitem"
                      >
                        {resourcesText}
                      </Link>

                      <div
                        onMouseEnter={() => setArchivesOpenDesktop(true)}
                        onMouseLeave={() => setArchivesOpenDesktop(false)}
                      >
                        <Link
                          href="/archives"
                          prefetch={true}
                          onClick={() => {
                            setMediaOpenDesktop(false);
                            setArchivesOpenDesktop(false);
                          }}
                          onFocus={() => setArchivesOpenDesktop(true)}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-base font-semibold uppercase tracking-[0.12em] transition-colors ${
                            pathname.startsWith("/archives")
                              ? "bg-accent/10 text-accent"
                              : "text-stone-700 hover:bg-stone-50"
                          }`}
                          role="menuitem"
                        >
                          <span>{archivesDocumentsText}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${archivesOpenDesktop ? "rotate-180" : ""}`}
                          />
                        </Link>

                        <AnimatePresence>
                          {archivesOpenDesktop && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.12 }}
                              className="mt-1 space-y-1 overflow-hidden rounded-lg border border-stone-100 bg-stone-50/40 p-1"
                            >
                              <Link
                                href="/archives?category=pastoral-letters"
                                prefetch={true}
                                onClick={() => {
                                  setMediaOpenDesktop(false);
                                  setArchivesOpenDesktop(false);
                                }}
                                className="block rounded-md px-3 py-2 text-base uppercase tracking-[0.12em] text-stone-700 hover:bg-white hover:text-stone-900"
                                role="menuitem"
                              >
                                {pastoralLettersText}
                              </Link>
                              <Link
                                href="/archives?category=circulars"
                                prefetch={true}
                                onClick={() => {
                                  setMediaOpenDesktop(false);
                                  setArchivesOpenDesktop(false);
                                }}
                                className="block rounded-md px-3 py-2 text-base uppercase tracking-[0.12em] text-stone-700 hover:bg-white hover:text-stone-900"
                                role="menuitem"
                              >
                                {circularsText}
                              </Link>
                              <Link
                                href="/archives?category=others"
                                prefetch={true}
                                onClick={() => {
                                  setMediaOpenDesktop(false);
                                  setArchivesOpenDesktop(false);
                                }}
                                className="block rounded-md px-3 py-2 text-base uppercase tracking-[0.12em] text-stone-700 hover:bg-white hover:text-stone-900"
                                role="menuitem"
                              >
                                {othersText}
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Gallery & Visit */}
            {navLinksAfterAbout.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-colors lg:px-3 lg:py-2 lg:text-base ${
                  pathname === link.href
                    ? "bg-accent/10 text-accent"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Get Involved dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setGetInvolvedOpenDesktop(true)}
              onMouseLeave={() => setGetInvolvedOpenDesktop(false)}
            >
              <button
                type="button"
                onClick={() => setGetInvolvedOpenDesktop((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={getInvolvedOpenDesktop}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-colors lg:px-3 lg:py-2 lg:text-base ${
                  isGetInvolvedActive
                    ? "bg-accent/10 text-accent"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {getInvolvedText}
                <ChevronDown className={`h-3.5 w-3.5 lg:h-4 lg:w-4 transition-transform ${getInvolvedOpenDesktop ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {getInvolvedOpenDesktop && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
                    role="menu"
                  >
                    <div className="p-2">
                      <Link
                        href="/favours-recieved"
                        prefetch={true}
                        onClick={() => setGetInvolvedOpenDesktop(false)}
                        className={`block rounded-lg px-3 py-2 text-base font-semibold uppercase tracking-[0.12em] transition-colors ${
                          pathname === "/favours-recieved"
                            ? "bg-accent/10 text-accent"
                            : "text-stone-700 hover:bg-stone-50"
                        }`}
                        role="menuitem"
                      >
                        {favoursRecievedText}
                      </Link>
                      <button
                        onClick={() => {
                          setGetInvolvedOpenDesktop(false);
                          setContributionModalOpen(true);
                        }}
                        className="w-full text-left block rounded-lg px-3 py-2 text-base font-semibold uppercase tracking-[0.12em] transition-colors text-stone-700 hover:bg-stone-50"
                        role="menuitem"
                      >
                        {publicInterventionsText}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact Us */}
            {navLinksEnd.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-colors lg:px-3 lg:py-2 lg:text-base ${
                  pathname === link.href
                    ? "bg-accent/10 text-accent"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed right-0 top-0 z-50 h-full w-72 max-w-[85vw] bg-[var(--accent-light)] text-white shadow-2xl lg:hidden">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/15 px-4 py-4">
                  <span className="font-serif text-lg font-bold uppercase tracking-[0.18em] text-white">{menuText}</span>
                  <button type="button" onClick={() => setOpen(false)}
                    className="rounded-md p-2 text-white transition-colors hover:bg-white/10 hover:text-white" aria-label={closeMenuText}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="space-y-1">
                    {/* Home */}
                    {navLinksMain.map((link) => (
                      <Link key={link.href} href={link.href} prefetch={true} onClick={() => setOpen(false)}
                        className={`block rounded-md px-3 py-3 text-base font-medium uppercase tracking-[0.16em] transition-colors ${
                          pathname === link.href ? "bg-white/14 text-white" : "text-white/92 hover:bg-white/10 hover:text-white"
                        }`}>
                        {link.label}
                      </Link>
                    ))}

                    {/* About - mobile */}
                    <button
                      type="button"
                      onClick={() => setAboutOpenMobile((v) => !v)}
                      className={`w-full flex items-center justify-between rounded-md px-3 py-3 text-base font-medium uppercase tracking-[0.16em] transition-colors ${
                        isAboutActive ? "bg-white/14 text-white" : "text-white/92 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{aboutText}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-white transition-transform ${aboutOpenMobile ? "rotate-180" : ""}`} />
                    </button>

                    {aboutOpenMobile && (
                      <div className="ml-3 mt-1 space-y-1 border-l-2 border-white/20 pl-3">
                        <Link
                          href="/about"
                          prefetch={true}
                          onClick={() => {
                            setOpen(false);
                            setAboutOpenMobile(false);
                          }}
                          className={`block rounded-md px-3 py-2 text-base uppercase tracking-[0.14em] transition-colors ${
                            pathname === "/about"
                              ? "bg-white/14 text-white font-medium"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {historyText}
                        </Link>
                        <Link
                          href="/spiritual-legacy"
                          prefetch={true}
                          onClick={() => {
                            setOpen(false);
                            setAboutOpenMobile(false);
                          }}
                          className={`block rounded-md px-3 py-2 text-base uppercase tracking-[0.14em] transition-colors ${
                            pathname === "/spiritual-legacy"
                              ? "bg-white/14 text-white font-medium"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {spiritualLegacyText}
                        </Link>
                      </div>
                    )}

                    {/* Media - mobile */}
                    <button
                      type="button"
                      onClick={() => setMediaOpenMobile((v) => !v)}
                      className={`w-full flex items-center justify-between rounded-md px-3 py-3 text-base font-medium uppercase tracking-[0.16em] transition-colors ${
                        isMediaActive ? "bg-white/14 text-white" : "text-white/92 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{mediaText}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-white transition-transform ${mediaOpenMobile ? "rotate-180" : ""}`} />
                    </button>

                    {mediaOpenMobile && (
                      <div className="ml-3 mt-1 space-y-1 border-l-2 border-white/20 pl-3">
                        <Link
                          href="/resources"
                          prefetch={true}
                          onClick={() => {
                            setOpen(false);
                            setMediaOpenMobile(false);
                            setArchivesOpenMobile(false);
                          }}
                          className={`block rounded-md px-3 py-2 text-base uppercase tracking-[0.14em] transition-colors ${
                            pathname.startsWith("/resources")
                              ? "bg-white/14 text-white font-medium"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {resourcesText}
                        </Link>

                        <button
                          type="button"
                          onClick={() => setArchivesOpenMobile((v) => !v)}
                          className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-base uppercase tracking-[0.14em] transition-colors ${
                            pathname.startsWith("/archives")
                              ? "bg-white/14 text-white font-medium"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span>{archivesDocumentsText}</span>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-white transition-transform ${archivesOpenMobile ? "rotate-180" : ""}`} />
                        </button>

                        {archivesOpenMobile && (
                          <div className="ml-3 mt-1 space-y-1 border-l-2 border-white/20 pl-3">
                            <Link
                              href="/archives"
                              prefetch={true}
                              onClick={() => {
                                setOpen(false);
                                setMediaOpenMobile(false);
                                setArchivesOpenMobile(false);
                              }}
                              className="block rounded-md px-3 py-2 text-base font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/10 hover:text-white"
                            >
                              {allDocumentsText}
                            </Link>
                            <Link
                              href="/archives?category=pastoral-letters"
                              prefetch={true}
                              onClick={() => {
                                setOpen(false);
                                setMediaOpenMobile(false);
                                setArchivesOpenMobile(false);
                              }}
                              className="block rounded-md px-3 py-2 text-base uppercase tracking-[0.14em] text-white/80 hover:bg-white/10 hover:text-white"
                            >
                              {pastoralLettersText}
                            </Link>
                            <Link
                              href="/archives?category=circulars"
                              prefetch={true}
                              onClick={() => {
                                setOpen(false);
                                setMediaOpenMobile(false);
                                setArchivesOpenMobile(false);
                              }}
                              className="block rounded-md px-3 py-2 text-base uppercase tracking-[0.14em] text-white/80 hover:bg-white/10 hover:text-white"
                            >
                              {circularsText}
                            </Link>
                            <Link
                              href="/archives?category=others"
                              prefetch={true}
                              onClick={() => {
                                setOpen(false);
                                setMediaOpenMobile(false);
                                setArchivesOpenMobile(false);
                              }}
                              className="block rounded-md px-3 py-2 text-base uppercase tracking-[0.14em] text-white/80 hover:bg-white/10 hover:text-white"
                            >
                              {othersText}
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Gallery & Visit */}
                    {navLinksAfterAbout.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch={true}
                        onClick={() => setOpen(false)}
                        className={`block rounded-md px-3 py-3 text-base font-medium uppercase tracking-[0.16em] transition-colors ${
                          pathname === link.href ? "bg-white/14 text-white" : "text-white/92 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}

                    {/* Get Involved - mobile */}
                    <button
                      type="button"
                      onClick={() => setGetInvolvedOpenMobile((v) => !v)}
                      className={`w-full flex items-center justify-between rounded-md px-3 py-3 text-base font-medium uppercase tracking-[0.16em] transition-colors ${
                        isGetInvolvedActive ? "bg-white/14 text-white" : "text-white/92 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{getInvolvedText}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-white transition-transform ${getInvolvedOpenMobile ? "rotate-180" : ""}`} />
                    </button>

                    {getInvolvedOpenMobile && (
                      <div className="ml-3 mt-1 space-y-1 border-l-2 border-white/20 pl-3">
                        <Link
                          href="/favours-recieved"
                          prefetch={true}
                          onClick={() => {
                            setOpen(false);
                            setGetInvolvedOpenMobile(false);
                          }}
                          className={`block rounded-md px-3 py-2 text-base uppercase tracking-[0.14em] transition-colors ${
                            pathname === "/favours-recieved"
                              ? "bg-white/14 text-white font-medium"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {favoursRecievedText}
                        </Link>
                        <button
                          onClick={() => {
                            setOpen(false);
                            setGetInvolvedOpenMobile(false);
                            setContributionModalOpen(true);
                          }}
                          className="w-full text-left block rounded-md px-3 py-2 text-base uppercase tracking-[0.14em] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {publicInterventionsText}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Contact Us */}
                  {navLinksEnd.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={true}
                      onClick={() => setOpen(false)}
                      className={`block rounded-md px-3 py-3 text-base font-medium uppercase tracking-[0.16em] transition-colors ${
                        pathname === link.href ? "bg-white/14 text-white" : "text-white/92 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="mt-6 border-t border-white/15 pt-4">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                      {followUsText}
                    </p>
                    <div className="flex items-center gap-2 px-3">
                      {socialLinks.map(({ href, label, Icon }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                          className="rounded-md p-2.5 text-white transition-colors hover:bg-white/10 hover:text-white">
                          <Icon className="h-6 w-6" />
                        </a>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contribution Modal */}
      <ContributionModal 
        isOpen={contributionModalOpen} 
        onClose={() => setContributionModalOpen(false)} 
      />
    </>
  );
}
