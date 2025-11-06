import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import {
  getIPWhitelist,
  getIPWhitelistCount,
  addIPToWhitelist,
  isIPWhitelistEnabled,
  toggleIPWhitelist,
} from '@/lib/admin/ip-whitelist';

/**
 * GET /api/admin/ip-whitelist
 * Get all IP whitelist entries
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const countOnly = searchParams.get('countOnly');
    const checkEnabled = searchParams.get('checkEnabled');

    // Check if whitelist is enabled
    if (checkEnabled === 'true') {
      const enabled = await isIPWhitelistEnabled();
      return NextResponse.json({
        success: true,
        enabled,
      });
    }

    // Return count only
    if (countOnly === 'true') {
      const count = await getIPWhitelistCount(
        isActive ? isActive === 'true' : undefined
      );
      return NextResponse.json({
        success: true,
        count,
      });
    }

    // Get entries
    const entries = await getIPWhitelist({
      isActive: isActive ? isActive === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    const totalCount = await getIPWhitelistCount(
      isActive ? isActive === 'true' : undefined
    );

    return NextResponse.json({
      success: true,
      entries,
      totalCount,
      enabled: await isIPWhitelistEnabled(),
    });
  } catch (error) {
    console.error('Error fetching IP whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP whitelist' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ip-whitelist
 * Add IP to whitelist
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ipAddress, description } = body;

    // Validation
    if (!ipAddress) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    const result = await addIPToWhitelist(
      ipAddress,
      description || null,
      admin.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      entry: result.entry,
    });
  } catch (error) {
    console.error('Error adding IP to whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to add IP to whitelist' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ip-whitelist
 * Toggle IP whitelist feature
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled field must be a boolean' },
        { status: 400 }
      );
    }

    const result = await toggleIPWhitelist(enabled);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      enabled,
    });
  } catch (error) {
    console.error('Error toggling IP whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to toggle IP whitelist' },
      { status: 500 }
    );
  }
}
