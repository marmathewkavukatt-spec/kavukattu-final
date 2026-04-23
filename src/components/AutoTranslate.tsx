"use client";

import { useTranslate } from "@/hooks/useTranslate";

interface AutoTranslateProps {
  text: string;
  fallback?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  children?: never;
}

/**
 * AutoTranslate component that automatically translates text using real-time translation
 * This replaces hardcoded translations with dynamic ones
 */
export default function AutoTranslate({ 
  text, 
  fallback = '', 
  className = '', 
  as: Component = 'span' 
}: AutoTranslateProps) {
  const [translatedText] = useTranslate([text]);

  return (
    <Component className={className}>
      {translatedText || fallback || text}
    </Component>
  );
}

/**
 * Hook version for use in components that need the translated text as a variable
 */
export function useAutoTranslate(text: string): string {
  const [translatedText] = useTranslate([text]);
  return translatedText || text;
}