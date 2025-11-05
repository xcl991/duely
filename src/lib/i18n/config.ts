/**
 * i18n Configuration
 * Internationalization setup for Duely app
 */

export type Locale = 'en' | 'id';

export const locales: Locale[] = ['en', 'id'];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Indonesia',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  id: '🇮🇩',
};

/**
 * Get locale from string with fallback
 */
export function getValidLocale(locale?: string | null): Locale {
  if (!locale) return defaultLocale;

  const normalizedLocale = locale.toLowerCase() as Locale;

  return locales.includes(normalizedLocale) ? normalizedLocale : defaultLocale;
}

/**
 * Format currency based on locale
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: Locale = 'en'
): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    id: 'id-ID',
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date based on locale
 */
export function formatDate(
  date: Date | string,
  locale: Locale = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    id: 'id-ID',
  };

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(localeMap[locale], options).format(dateObj);
}

/**
 * Format number based on locale
 */
export function formatNumber(
  number: number,
  locale: Locale = 'en',
  options?: Intl.NumberFormatOptions
): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    id: 'id-ID',
  };

  return new Intl.NumberFormat(localeMap[locale], options).format(number);
}
