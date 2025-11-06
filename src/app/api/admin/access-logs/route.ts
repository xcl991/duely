import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import { getAccessLogs } from '@/lib/admin/ip-whitelist';

/**
 * GET /api/admin/access-logs
 * Get admin access logs
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const ipAddress = searchParams.get('ipAddress');
    const adminId = searchParams.get('adminId');
    const success = searchParams.get('success');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const logs = await getAccessLogs({
      ipAddress: ipAddress || undefined,
      adminId: adminId || undefined,
      success: success ? success === 'true' : undefined,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    });

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch access logs' },
      { status: 500 }
    );
  }
}
