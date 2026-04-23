"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAutoTranslate } from "@/components/AutoTranslate";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const goBackText = useAutoTranslate("Go Back");

  const handleBack = () => {
    // If we're on a gallery category page, go back to gallery section on homepage
    if (pathname.startsWith('/gallery/')) {
      router.push('/#gallery');
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-accent transition-colors"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {goBackText}
    </button>
  );
}
