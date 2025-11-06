import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, logAdminAction } from '@/lib/admin/auth';
import { setAdminSessionCookie } from '@/lib/admin/session';

/**
 * Admin login API route
 * POST /api/admin/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    const result = await verifyAdminCredentials(email, password);

    if (!result.success || !result.admin) {
      return NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Set session cookie
    await setAdminSessionCookie(result.admin);

    // Log successful login
    await logAdminAction({
      adminId: result.admin.id,
      action: 'login',
      details: `Admin logged in: ${result.admin.email}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { email: result.admin.email },
    });

    // Return success
    return NextResponse.json({
      success: true,
      admin: {
        id: result.admin.id,
        email: result.admin.email,
        name: result.admin.name,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
