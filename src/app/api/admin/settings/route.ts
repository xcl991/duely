import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import {
  getSettings,
  getSettingsByCategory,
  setSetting,
  updateSettings,
  initializeDefaultSettings,
  type SettingValue,
  type SettingCategory,
  type SettingType,
} from '@/lib/admin/settings';

/**
 * GET /api/admin/settings
 * Get all settings or settings by category
 *
 * Query Parameters:
 * - category: general | security | notifications | analytics
 * - grouped: true | false (return settings grouped by category)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as SettingCategory | null;
    const grouped = searchParams.get('grouped') === 'true';

    // Initialize defaults if needed
    await initializeDefaultSettings();

    if (grouped) {
      const settings = await getSettingsByCategory();
      return NextResponse.json({
        success: true,
        settings,
      });
    }

    const settings = await getSettings(category || undefined);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Create or update a single setting
 *
 * Body:
 * {
 *   key: string
 *   value: any
 *   type: "string" | "number" | "boolean" | "json"
 *   category: "general" | "security" | "notifications" | "analytics"
 *   description?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value, type, category, description } = body;

    // Validation
    if (!key || value === undefined || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: key, value, type, category' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes: SettingType[] = ['string', 'number', 'boolean', 'json'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: string, number, boolean, or json' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories: SettingCategory[] = ['general', 'security', 'notifications', 'analytics'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be: general, security, notifications, or analytics' },
        { status: 400 }
      );
    }

    const success = await setSetting(key, value, type, category, description);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save setting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Setting saved successfully',
    });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      { error: 'Failed to save setting' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update multiple settings at once
 *
 * Body:
 * {
 *   settings: Array<{
 *     key: string
 *     value: any
 *     type: "string" | "number" | "boolean" | "json"
 *     category: "general" | "security" | "notifications" | "analytics"
 *     description?: string
 *   }>
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    // Validation
    if (!Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { error: 'Settings must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate each setting
    for (const setting of settings) {
      if (!setting.key || setting.value === undefined || !setting.type || !setting.category) {
        return NextResponse.json(
          { error: 'Each setting must have: key, value, type, category' },
          { status: 400 }
        );
      }
    }

    const success = await updateSettings(settings as SettingValue[]);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
