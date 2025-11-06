import { NextRequest, NextResponse } from 'next/server';
import { disableTwoFactor, verifyUserTOTPToken } from '@/lib/admin/two-factor';
import { requireAdminAuth } from '@/lib/admin/auth';

/**
 * POST /api/admin/auth/2fa/disable
 * Disable 2FA for the current admin user
 * Requires verification code to disable
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminId = admin.id;
    const body = await request.json();
    const { token } = body;

    // Validate input
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required to disable 2FA' },
        { status: 400 }
      );
    }

    // Verify the token before disabling
    const verifyResult = await verifyUserTOTPToken(adminId, token);

    if (!verifyResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Disable 2FA
    const result = await disableTwoFactor(adminId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to disable 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
