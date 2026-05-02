import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Manjari } from "next/font/google";
import "./globals.css";
import { getSiteMetadataBase } from "@/lib/site-url";
import { seoConfig, generatePageMetadata } from "@/lib/seo-config";
import StructuredData from "@/components/StructuredData";
import Preloader from "@/components/Preloader";
import ChunkErrorHandler from "@/components/ChunkErrorHandler";
import ServiceWorkerManager from "@/components/ServiceWorkerManager";
import ProductionErrorBoundary from "@/components/ProductionErrorBoundary";
import Script from "next/script";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["Georgia", "serif"],
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
const manjari = Manjari({
  subsets: ["malayalam", "latin"],
  variable: "--font-ml",
  weight: ["400", "700"],
  display: "swap",
  fallback: ["Nirmala UI", "Kartika", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: getSiteMetadataBase(),
  ...generatePageMetadata({
    title: "Mar Mathew Kavukatt - First Archbishop of Changanacherry | Servant of God",
    description: seoConfig.siteDescription,
    keywords: seoConfig.keywords.general,
    path: "/",
    type: "website"
  }),
  // Override default generator meta so it doesn't show "Next.js"
  generator: "Mar Mathew Kavukatt Official Website",
  applicationName: "Mar Mathew Kavukatt",
  referrer: "origin-when-cross-origin",
  icons: {
    icon: [
      { url: "/uploads/mar-mathew-kavukatt-church-logo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/uploads/mar-mathew-kavukatt-church-logo.jpg", sizes: "16x16", type: "image/jpeg" }
    ],
    shortcut: "/uploads/mar-mathew-kavukatt-church-logo.jpg",
    apple: [
      { url: "/uploads/mar-mathew-kavukatt-church-logo.jpg", sizes: "180x180", type: "image/jpeg" }
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/uploads/mar-mathew-kavukatt-church-logo.jpg"
      }
    ]
  },
  manifest: "/manifest.json",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
    other: {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
      "facebook-domain-verification": process.env.FACEBOOK_DOMAIN_VERIFICATION || ""
    }
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
  themeColor: '#8B1538',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} ${manjari.variable}`}>
      <head>
        <Script
          id="next-static-recovery"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var key = "next-static-recovery";
  function recover() {
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch (error) {
      return;
    }
    var url = new URL(window.location.href);
    url.searchParams.set("__reload", Date.now().toString());
    window.location.replace(url.toString());
  }
  window.addEventListener("load", function () {
    try { sessionStorage.removeItem(key); } catch (error) {}
  });
  window.addEventListener("error", function (event) {
    var target = event.target;
    if (!target || target === window) return;
    var url = target.src || target.href || "";
    if (typeof url === "string" && url.indexOf("/_next/static/") !== -1) {
      recover();
    }
  }, true);
})();`,
          }}
        />
        {/* Structured Data */}
        <StructuredData type="organization" />
        <StructuredData type="person" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mar Mathew Kavukatt" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.emailjs.com" />
        
        {/* Canonical URL will be set by individual pages */}
        
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="Mar Mathew Kavukatt - Announcements" href="/rss.xml" />
        
        {/* Humans.txt */}
        <link rel="author" href="/humans.txt" />
      </head>
      <body className="min-h-screen antialiased">
        <ProductionErrorBoundary>
          {/* Service Worker Manager - clears old caches */}
          <ServiceWorkerManager />
          {/* Chunk Error Handler - automatically reloads on chunk errors */}
          <ChunkErrorHandler />
          {/* Preloader — shows before React hydrates */}
          <Preloader />
          {children}
        </ProductionErrorBoundary>
      </body>
    </html>
  );
}
