"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import type { Translations } from "@/lib/translations";

export default function PageHeading({
  textKey,
  className,
}: {
  textKey: keyof Translations;
  className?: string;
}) {
  const { lang } = useLang();
  return (
    <h1 className={["site-page-title", className].filter(Boolean).join(" ")}>
      {t[lang][textKey]}
    </h1>
  );
}
