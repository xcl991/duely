import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import { getSystemHealth } from '@/lib/admin/health';

/**
 * GET /api/admin/system/health
 * Get comprehensive system health status
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const health = await getSystemHealth();

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch system health',
        health: {
          overall: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'unhealthy', message: 'Health check failed' },
            api: { status: 'unhealthy', message: 'Health check failed' },
            storage: { status: 'unhealthy', message: 'Health check failed' },
          },
          metrics: {
            uptime: 0,
            activeUsers: 0,
            totalUsers: 0,
            activeSubscriptions: 0,
            totalSubscriptions: 0,
          },
        },
      },
      { status: 500 }
    );
  }
}
