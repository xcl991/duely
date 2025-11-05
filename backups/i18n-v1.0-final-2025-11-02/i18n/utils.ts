/**
 * i18n Utilities
 * Helper functions for translations
 */

import type { Locale } from './config';

export type TranslationKeys = {
  [key: string]: string | TranslationKeys;
};

export type Translations = {
  [K in Locale]: TranslationKeys;
};

/**
 * Get nested value from object using dot notation
 * Example: get(obj, 'user.name') => obj.user.name
 */
export function getNestedValue(
  obj: any,
  path: string
): string | undefined {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Replace placeholders in translation string
 * Example: interpolate("Hello {name}", { name: "John" }) => "Hello John"
 */
export function interpolate(
  template: string,
  values: Record<string, string | number> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in values ? String(values[key]) : match;
  });
}

/**
 * Get translation with fallback
 */
export function getTranslation(
  translations: TranslationKeys,
  key: string,
  fallback?: string
): string {
  const value = getNestedValue(translations, key);

  if (value !== undefined) {
    return value;
  }

  // Return fallback or key itself
  return fallback ?? key;
}

/**
 * Pluralize based on count and locale
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale: Locale = 'en'
): string {
  // Simple pluralization (can be enhanced for Indonesian specific rules)
  if (locale === 'id') {
    // Indonesian doesn't have complex plural rules
    return count === 1 ? singular : plural;
  }

  // English pluralization
  return count === 1 ? singular : plural;
}
