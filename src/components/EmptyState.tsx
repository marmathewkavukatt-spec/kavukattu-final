"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import type { Translations } from "@/lib/translations";

export default function EmptyState({ textKey }: { textKey: keyof Translations }) {
  const { lang } = useLang();
  return <p className="mt-6 text-stone-500">{t[lang][textKey]}</p>;
}
