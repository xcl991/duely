"use client";

import { useEffect } from "react";
import { useLocale, useSetLocale } from "@/lib/i18n/hooks";

/**
 * Client-side language detector
 * Detects browser language as fallback if no language is set
 */
export default function LanguageDetector() {
  const locale = useLocale();
  const setLocale = useSetLocale();

  useEffect(() => {
    // Only detect if no language is set
    if (!locale) {
      // Get browser language
      const browserLang = navigator.language.toLowerCase();

      // Check if browser language is Indonesian
      if (browserLang.startsWith("id")) {
        setLocale("id");
      } else {
        setLocale("en");
      }
    }
  }, [locale, setLocale]);

  return null; // This component doesn't render anything
}
