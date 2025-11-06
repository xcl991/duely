import { prisma } from '@/lib/prisma';

/**
 * Setting value types
 */
export type SettingType = 'string' | 'number' | 'boolean' | 'json';

/**
 * Setting categories
 */
export type SettingCategory = 'general' | 'security' | 'notifications' | 'analytics';

/**
 * Setting value interface
 */
export interface SettingValue {
  key: string;
  value: any;
  type: SettingType;
  category: SettingCategory;
  description?: string;
}

/**
 * Parse setting value based on type
 */
export function parseSettingValue(value: string, type: SettingType): any {
  try {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true' || value === '1';
      case 'json':
        return JSON.parse(value);
      case 'string':
      default:
        return value;
    }
  } catch (error) {
    console.error('Error parsing setting value:', error);
    return value;
  }
}

/**
 * Stringify setting value for storage
 */
export function stringifySettingValue(value: any, type: SettingType): string {
  try {
    switch (type) {
      case 'json':
        return JSON.stringify(value);
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return value.toString();
      case 'string':
      default:
        return String(value);
    }
  } catch (error) {
    console.error('Error stringifying setting value:', error);
    return String(value);
  }
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string): Promise<any> {
  try {
    const setting = await prisma.adminSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      return null;
    }

    return parseSettingValue(setting.value, setting.type as SettingType);
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
}

/**
 * Get all settings, optionally filtered by category
 */
export async function getSettings(category?: SettingCategory): Promise<SettingValue[]> {
  try {
    const settings = await prisma.adminSettings.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    return settings.map(setting => ({
      key: setting.key,
      value: parseSettingValue(setting.value, setting.type as SettingType),
      type: setting.type as SettingType,
      category: setting.category as SettingCategory,
      description: setting.description || undefined,
    }));
  } catch (error) {
    console.error('Error getting settings:', error);
    return [];
  }
}

/**
 * Get settings grouped by category
 */
export async function getSettingsByCategory(): Promise<Record<SettingCategory, SettingValue[]>> {
  try {
    const settings = await getSettings();

    const grouped: Record<string, SettingValue[]> = {
      general: [],
      security: [],
      notifications: [],
      analytics: [],
    };

    settings.forEach(setting => {
      if (grouped[setting.category]) {
        grouped[setting.category].push(setting);
      }
    });

    return grouped as Record<SettingCategory, SettingValue[]>;
  } catch (error) {
    console.error('Error getting settings by category:', error);
    return {
      general: [],
      security: [],
      notifications: [],
      analytics: [],
    };
  }
}

/**
 * Set a single setting value
 */
export async function setSetting(
  key: string,
  value: any,
  type: SettingType,
  category: SettingCategory,
  description?: string
): Promise<boolean> {
  try {
    const stringValue = stringifySettingValue(value, type);

    await prisma.adminSettings.upsert({
      where: { key },
      create: {
        key,
        value: stringValue,
        type,
        category,
        description,
      },
      update: {
        value: stringValue,
        type,
        category,
        description,
      },
    });

    return true;
  } catch (error) {
    console.error('Error setting setting:', error);
    return false;
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(settings: SettingValue[]): Promise<boolean> {
  try {
    await Promise.all(
      settings.map(setting =>
        setSetting(
          setting.key,
          setting.value,
          setting.type,
          setting.category,
          setting.description
        )
      )
    );

    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<boolean> {
  try {
    await prisma.adminSettings.delete({
      where: { key },
    });

    return true;
  } catch (error) {
    console.error('Error deleting setting:', error);
    return false;
  }
}

/**
 * Initialize default settings if they don't exist
 */
export async function initializeDefaultSettings(): Promise<void> {
  const defaults: SettingValue[] = [
    // General Settings
    {
      key: 'site_name',
      value: 'Duely Admin',
      type: 'string',
      category: 'general',
      description: 'Application name',
    },
    {
      key: 'contact_email',
      value: 'admin@duely.com',
      type: 'string',
      category: 'general',
      description: 'Contact email address',
    },
    {
      key: 'timezone',
      value: 'Asia/Jakarta',
      type: 'string',
      category: 'general',
      description: 'Default timezone',
    },
    {
      key: 'date_format',
      value: 'DD/MM/YYYY',
      type: 'string',
      category: 'general',
      description: 'Date format',
    },
    {
      key: 'currency',
      value: 'IDR',
      type: 'string',
      category: 'general',
      description: 'Default currency',
    },

    // Security Settings
    {
      key: 'session_timeout',
      value: 3600,
      type: 'number',
      category: 'security',
      description: 'Session timeout in seconds',
    },
    {
      key: 'max_login_attempts',
      value: 5,
      type: 'number',
      category: 'security',
      description: 'Maximum login attempts before lockout',
    },
    {
      key: 'require_2fa',
      value: false,
      type: 'boolean',
      category: 'security',
      description: 'Require two-factor authentication for all admins',
    },
    {
      key: 'ip_whitelist_enabled',
      value: false,
      type: 'boolean',
      category: 'security',
      description: 'Enable IP whitelisting',
    },
    {
      key: 'password_min_length',
      value: 8,
      type: 'number',
      category: 'security',
      description: 'Minimum password length',
    },

    // Notification Settings
    {
      key: 'email_notifications',
      value: true,
      type: 'boolean',
      category: 'notifications',
      description: 'Enable email notifications',
    },
    {
      key: 'webhook_notifications',
      value: false,
      type: 'boolean',
      category: 'notifications',
      description: 'Enable webhook notifications',
    },
    {
      key: 'notification_recipients',
      value: ['admin@duely.com'],
      type: 'json',
      category: 'notifications',
      description: 'Email addresses for system notifications',
    },

    // Analytics Settings
    {
      key: 'data_retention_days',
      value: 90,
      type: 'number',
      category: 'analytics',
      description: 'Number of days to retain analytics data',
    },
    {
      key: 'auto_refresh_interval',
      value: 30,
      type: 'number',
      category: 'analytics',
      description: 'Dashboard auto-refresh interval in seconds',
    },
    {
      key: 'export_limit',
      value: 10000,
      type: 'number',
      category: 'analytics',
      description: 'Maximum number of records per export',
    },
  ];

  for (const setting of defaults) {
    const existing = await getSetting(setting.key);
    if (existing === null) {
      await setSetting(
        setting.key,
        setting.value,
        setting.type,
        setting.category,
        setting.description
      );
    }
  }
}
