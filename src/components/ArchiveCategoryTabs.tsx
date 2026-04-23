"use client";

import Link from "next/link";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

export type ArchiveCategorySlug = "all" | "pastoral-letters" | "circulars" | "others";

const TABS: Array<{ slug: ArchiveCategorySlug; href: string; labelKey: keyof typeof t.en }> = [
  { slug: "all", href: "/archives", labelKey: "all" },
  { slug: "pastoral-letters", href: "/archives?category=pastoral-letters", labelKey: "pastoralLetters" },
  { slug: "circulars", href: "/archives?category=circulars", labelKey: "circulars" },
  { slug: "others", href: "/archives?category=others", labelKey: "others" },
];

export default function ArchiveCategoryTabs({ active }: { active: ArchiveCategorySlug }) {
  const { lang } = useLang();
  const tr = t[lang];

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = tab.slug === active;
        return (
          <Link
            key={tab.slug}
            href={tab.href}
            prefetch={true}
            className={`rounded-full border px-4 py-2 text-base font-semibold transition ${
              isActive
                ? "border-accent bg-accent/10 text-accent"
                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            {tr[tab.labelKey]}
          </Link>
        );
      })}
    </div>
  );
}
