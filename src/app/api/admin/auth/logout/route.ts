import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, deleteAdminSession } from '@/lib/admin/session';
import { logAdminAction } from '@/lib/admin/auth';

/**
 * Admin logout API route
 * POST /api/admin/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    // Get current admin session
    const session = await getAdminSession();

    if (session) {
      // Log logout action
      await logAdminAction({
        adminId: session.adminId,
        action: 'logout',
        details: `Admin logged out: ${session.email}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { email: session.email },
      });
    }

    // Delete session cookie
    await deleteAdminSession();

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Admin logout error:', error);

    // Even if there's an error, delete the session cookie
    try {
      await deleteAdminSession();
    } catch (e) {
      // Ignore errors during cleanup
    }

    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
