import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceInfo } from '@/lib/maintenance';

/**
 * GET /api/maintenance/info
 * Public endpoint to get maintenance information
 * Used by the maintenance page to display status
 */
export async function GET(request: NextRequest) {
  try {
    const info = await getMaintenanceInfo();

    if (!info || !info.enabled) {
      // Maintenance mode is not active
      return NextResponse.json({
        enabled: false,
        message: null,
        estimatedMinutes: null,
        estimatedEndTime: null,
        startedAt: null,
      });
    }

    // Return maintenance information for public display
    return NextResponse.json({
      enabled: info.enabled,
      message: info.message,
      estimatedMinutes: info.estimatedMinutes,
      estimatedEndTime: info.estimatedEndTime,
      startedAt: info.startedAt,
    });
  } catch (error) {
    console.error('Error getting maintenance info:', error);

    // Return default maintenance message on error
    return NextResponse.json({
      enabled: true,
      message: 'The site is currently under maintenance. We will be back online shortly.',
      estimatedMinutes: null,
      estimatedEndTime: null,
      startedAt: null,
    });
  }
}
