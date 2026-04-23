"use client";

import { generateStructuredData } from "@/lib/seo-config";

interface StructuredDataProps {
  type: "organization" | "person" | "article" | "event";
  data?: any;
}

export default function StructuredData({ type, data = {} }: StructuredDataProps) {
  const structuredData = generateStructuredData(type, data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}