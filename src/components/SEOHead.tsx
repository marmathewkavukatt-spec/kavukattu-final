"use client";

import Head from "next/head";
import { generateBreadcrumbStructuredData } from "@/lib/seo-config";

interface SEOHeadProps {
  breadcrumbs?: Array<{ name: string; url: string }>;
  structuredData?: any;
  canonicalUrl?: string;
  hreflang?: Array<{ lang: string; url: string }>;
}

export default function SEOHead({ 
  breadcrumbs, 
  structuredData, 
  canonicalUrl,
  hreflang 
}: SEOHeadProps) {
  return (
    <Head>
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Hreflang for multilingual support */}
      {hreflang?.map((lang) => (
        <link
          key={lang.lang}
          rel="alternate"
          hrefLang={lang.lang}
          href={lang.url}
        />
      ))}
      
      {/* Breadcrumb Structured Data */}
      {breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateBreadcrumbStructuredData(breadcrumbs), null, 2)
          }}
        />
      )}
      
      {/* Additional Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2)
          }}
        />
      )}
    </Head>
  );
}