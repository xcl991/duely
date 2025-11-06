import { NextRequest, NextResponse } from 'next/server';
import { verifyUserTOTPToken, verifyUserBackupCode, isTwoFactorEnabled } from '@/lib/admin/two-factor';
import { requireAdminAuth } from '@/lib/admin/auth';

/**
 * POST /api/admin/auth/2fa/verify
 * Verify 2FA token or backup code for admin user
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
    const { code, isBackupCode } = body;

    // Validate input
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Check if 2FA is enabled
    const is2FAEnabled = await isTwoFactorEnabled(adminId);
    if (!is2FAEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA is not enabled for this user' },
        { status: 400 }
      );
    }

    let result;

    // Verify backup code or TOTP token
    if (isBackupCode) {
      result = await verifyUserBackupCode(adminId, code);
    } else {
      result = await verifyUserTOTPToken(adminId, code);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA verified successfully',
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
