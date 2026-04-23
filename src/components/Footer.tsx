"use client";

import { useLang } from "@/context/LangContext";
import { useAutoTranslate } from "@/components/AutoTranslate";

export default function Footer() {
  const { lang } = useLang();
  const allRightsReservedText = useAutoTranslate("All rights reserved");
  
  return (
    <footer className="border-t border-stone-200 bg-stone-100/80">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Kaavukatt. {allRightsReservedText}
        </p>
      </div>
    </footer>
  );
}
