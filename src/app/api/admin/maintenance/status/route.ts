import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import { getMaintenanceInfo } from '@/lib/maintenance';

/**
 * GET /api/admin/maintenance/status
 * Get current maintenance mode status
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

    // Get maintenance information
    const info = await getMaintenanceInfo();

    if (!info || !info.enabled) {
      // Maintenance mode is not active
      return NextResponse.json({
        enabled: false,
        message: null,
        estimatedMinutes: null,
        startedAt: null,
      });
    }

    // Return maintenance status
    return NextResponse.json({
      enabled: info.enabled,
      message: info.message,
      estimatedMinutes: info.estimatedMinutes,
      startedAt: info.startedAt,
      estimatedEndTime: info.estimatedEndTime,
    });
  } catch (error) {
    console.error('Error getting maintenance status:', error);
    return NextResponse.json(
      { error: 'Failed to get maintenance status' },
      { status: 500 }
    );
  }
}
