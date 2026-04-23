"use client";

import { useMemo } from "react";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

const MALAYALAM_CHARS = /[\u0D00-\u0D7F]/g;
const LATIN_CHARS = /[A-Za-z]/g;

function looksLikeMalayalam(text: string) {
  const malayalamCount = text.match(MALAYALAM_CHARS)?.length ?? 0;
  if (!malayalamCount) return false;
  const latinCount = text.match(LATIN_CHARS)?.length ?? 0;
  if (!latinCount) return true;
  const ratio = malayalamCount / (malayalamCount + latinCount);
  return ratio >= 0.2;
}

function translateOne(text: string, lang: "en" | "ml"): string {
  if (!text?.trim()) return text;
  if (lang === "en") return text;
  if (looksLikeMalayalam(text)) return text;
  const found = (t.ml as Record<string, string>)[text];
  return found ?? text;
}

/**
 * Translates an array of strings synchronously.
 * Uses useMemo so the result is stable across re-renders when lang and texts haven't changed.
 */
export function useTranslate(texts: (string | undefined | null)[]): string[] {
  const { lang } = useLang();

  // Serialize texts to a stable string for the dependency array
  // This avoids the variable-spread deps issue while still reacting to text changes
  const textsKey = texts.map((t) => t ?? "").join("\x00");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => texts.map((text) => translateOne(text ?? "", lang)), [lang, textsKey]);
}
