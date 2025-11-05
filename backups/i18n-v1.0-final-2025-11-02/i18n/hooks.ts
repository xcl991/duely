/**
 * i18n Hooks
 * Custom React hooks for internationalization
 */

'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation, interpolate } from './utils';

/**
 * Hook for translations
 * Usage: const t = useTranslations();
 *        const text = t('common.save');
 */
export function useTranslations() {
  const { translations } = useLanguage();

  const t = useCallback(
    (key: string, values?: Record<string, string | number>, fallback?: string): string => {
      const translation = getTranslation(translations, key, fallback);

      if (values) {
        return interpolate(translation, values);
      }

      return translation;
    },
    [translations]
  );

  return t;
}

/**
 * Hook to get current locale
 */
export function useLocale() {
  const { locale } = useLanguage();
  return locale;
}

/**
 * Hook to change locale
 */
export function useSetLocale() {
  const { setLocale } = useLanguage();
  return setLocale;
}

/**
 * Hook to get all language utilities
 */
export function useI18n() {
  const { locale, setLocale, translations } = useLanguage();
  const t = useTranslations();

  return {
    locale,
    setLocale,
    t,
    translations,
  };
}
