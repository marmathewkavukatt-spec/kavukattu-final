import { Metadata } from "next";
import { getSiteUrl, getAbsoluteSiteUrl } from "./site-url";

// SEO Configuration for Mar Mathew Kavukatt Website
export const seoConfig = {
  siteName: "Mar Mathew Kavukatt",
  siteDescription: "Official website of Mar Mathew Kavukatt - First Archbishop of Changanacherry, Servant of God. Learn about his life, legacy, canonization process, and spiritual teachings.",
  siteUrl: getSiteUrl(),
  defaultImage: "/uploads/mar-mathew-kavukatt-church-logo.jpg",
  twitterHandle: "@MarMathewKavukatt", // Update with actual handle
  facebookPage: "https://facebook.com/MarMathewKavukatt", // Update with actual page
  instagramHandle: "@marmathewkavukatt", // Update with actual handle
  youtubeChannel: "https://youtube.com/@MarMathewKavukatt", // Update with actual channel
  
  // Structured Data
  organization: {
    name: "Mar Mathew Kavukatt Foundation",
    type: "ReligiousOrganization",
    address: {
      streetAddress: "Kavukatt House, Anthinad",
      addressLocality: "Palai",
      addressRegion: "Kerala",
      postalCode: "686574",
      addressCountry: "IN"
    },
    contactPoint: {
      telephone: "+91-XXXXXXXXXX", // Update with actual phone
      contactType: "customer service",
      availableLanguage: ["English", "Malayalam"]
    }
  },
  
  // Keywords for different sections
  keywords: {
    general: [
      "Mar Mathew Kavukatt",
      "Archbishop Changanacherry",
      "Servant of God",
      "Syro-Malabar Church",
      "Kerala Catholic Church",
      "Canonization",
      "Saint",
      "Catholic Archbishop",
      "Palai Diocese",
      "Kerala Christianity"
    ],
    history: [
      "Mar Mathew Kavukatt biography",
      "Archbishop Changanacherry history",
      "Syro-Malabar Church leaders",
      "Kerala Catholic history",
      "Palai Catholic heritage",
      "Catholic saints Kerala"
    ],
    spirituality: [
      "Catholic spirituality",
      "Syro-Malabar traditions",
      "Christian prayer",
      "Catholic devotion",
      "Spiritual legacy",
      "Religious teachings"
    ],
    gallery: [
      "Mar Mathew Kavukatt photos",
      "Catholic church gallery",
      "Religious ceremonies",
      "Church events",
      "Catholic heritage photos"
    ],
    announcements: [
      "Church announcements",
      "Catholic events",
      "Religious celebrations",
      "Church news",
      "Catholic community"
    ]
  }
};

// Generate comprehensive metadata for pages
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image,
  path = "/",
  type = "website",
  publishedTime,
  modifiedTime,
  locale = "en_US",
  alternateLocales = ["ml_IN"]
}: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  alternateLocales?: string[];
}): Metadata {
  const fullTitle = title.includes(seoConfig.siteName) ? title : `${title} | ${seoConfig.siteName}`;
  const imageUrl = image ? getAbsoluteSiteUrl(image) : getAbsoluteSiteUrl(seoConfig.defaultImage);
  const canonicalUrl = getAbsoluteSiteUrl(path);
  
  const allKeywords = [
    ...seoConfig.keywords.general,
    ...keywords
  ].join(", ");

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: seoConfig.siteName }],
    creator: seoConfig.siteName,
    publisher: seoConfig.siteName,
    
    // Open Graph
    openGraph: {
      type,
      locale,
      alternateLocale: alternateLocales,
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName: seoConfig.siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg"
        }
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime })
    },
    
    // Twitter
    twitter: {
      card: "summary_large_image",
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      title: fullTitle,
      description,
      images: [imageUrl]
    },
    
    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    
    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-US": `${canonicalUrl}?lang=en`,
        "ml-IN": `${canonicalUrl}?lang=ml`
      }
    },
    
    // Additional tags
    other: {
      "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
      "facebook-domain-verification": process.env.FACEBOOK_DOMAIN_VERIFICATION || ""
    }
  };
}

// Generate structured data (JSON-LD)
export function generateStructuredData(type: "organization" | "person" | "article" | "event", data: any) {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": type === "organization" ? "ReligiousOrganization" : 
             type === "person" ? "Person" : 
             type === "article" ? "Article" : "Event",
    ...data
  };

  if (type === "organization") {
    return {
      ...baseStructuredData,
      name: seoConfig.organization.name,
      url: seoConfig.siteUrl,
      logo: getAbsoluteSiteUrl(seoConfig.defaultImage),
      address: {
        "@type": "PostalAddress",
        ...seoConfig.organization.address
      },
      contactPoint: {
        "@type": "ContactPoint",
        ...seoConfig.organization.contactPoint
      },
      sameAs: [
        seoConfig.facebookPage,
        seoConfig.youtubeChannel,
        `https://instagram.com/${seoConfig.instagramHandle.replace('@', '')}`
      ].filter(Boolean)
    };
  }

  if (type === "person") {
    return {
      ...baseStructuredData,
      name: "Mar Mathew Kavukatt",
      alternateName: ["Archbishop Mathew Kavukatt", "Mathew Kavukatt"],
      description: "First Archbishop of Changanacherry, Servant of God in the Catholic Church",
      birthDate: "1904-07-17",
      deathDate: "1969-10-09",
      birthPlace: {
        "@type": "Place",
        name: "Pravithanam, Palai, Kerala, India"
      },
      nationality: "Indian",
      religion: "Catholic",
      jobTitle: "Archbishop",
      worksFor: {
        "@type": "ReligiousOrganization",
        name: "Syro-Malabar Catholic Church"
      },
      image: getAbsoluteSiteUrl("/uploads/ABOUT SECTION IMAGE.png"),
      url: getAbsoluteSiteUrl("/about"),
      ...data
    };
  }

  return baseStructuredData;
}

// SEO-friendly URL slugs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": getAbsoluteSiteUrl(crumb.url)
    }))
  };
}