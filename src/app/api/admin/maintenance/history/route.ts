import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import { getMaintenanceHistory } from '@/lib/maintenance';

/**
 * GET /api/admin/maintenance/history
 * Get maintenance mode history
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get limit from query params (default: 20)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Get maintenance history
    const history = await getMaintenanceHistory(limit);

    return NextResponse.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error) {
    console.error('Error getting maintenance history:', error);
    return NextResponse.json(
      { error: 'Failed to get maintenance history' },
      { status: 500 }
    );
  }
}
