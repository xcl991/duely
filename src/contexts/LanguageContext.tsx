/**
 * Language Context
 * Provides language state and translations throughout the app
 */

'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/config';
import { getValidLocale, defaultLocale } from '@/lib/i18n/config';
import type { TranslationKeys } from '@/lib/i18n/utils';
import enTranslations from '@/locales/en.json';
import idTranslations from '@/locales/id.json';

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: TranslationKeys;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationMap: Record<Locale, TranslationKeys> = {
  en: enTranslations,
  id: idTranslations,
};

type LanguageProviderProps = {
  children: ReactNode;
  initialLocale?: Locale;
};

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [translations, setTranslations] = useState<TranslationKeys>(translationMap[locale]);

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('duely_language');
    if (savedLocale) {
      const validLocale = getValidLocale(savedLocale);
      setLocaleState(validLocale);
      setTranslations(translationMap[validLocale]);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setTranslations(translationMap[newLocale]);
    localStorage.setItem('duely_language', newLocale);

    // Optional: Reload page to ensure all components re-render
    // window.location.reload();
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
