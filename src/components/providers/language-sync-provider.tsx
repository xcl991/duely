/**
 * Language Sync Provider
 * Syncs language preference from database to LanguageContext on app load
 */

'use client';

import { useEffect, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUserSettings } from '@/app/actions/settings';
import type { Locale } from '@/lib/i18n/config';

type LanguageSyncProviderProps = {
  children: ReactNode;
};

export function LanguageSyncProvider({ children }: LanguageSyncProviderProps) {
  const { data: session, status } = useSession();
  const { setLocale } = useLanguage();

  useEffect(() => {
    // Only sync when user is authenticated
    if (status === 'authenticated' && session?.user) {
      const syncLanguageFromDatabase = async () => {
        try {
          const settings = await getUserSettings();
          const dbLanguage = settings.language as Locale;

          // Update LanguageContext with database value
          setLocale(dbLanguage);
        } catch (error) {
          console.error('Failed to sync language from database:', error);
          // Fallback to localStorage or default
        }
      };

      syncLanguageFromDatabase();
    }
  }, [status, session, setLocale]);

  return <>{children}</>;
}
