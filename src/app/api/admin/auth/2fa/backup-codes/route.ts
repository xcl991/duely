import { NextRequest, NextResponse } from 'next/server';
import { regenerateBackupCodes, getRemainingBackupCodesCount, verifyUserTOTPToken } from '@/lib/admin/two-factor';
import { requireAdminAuth } from '@/lib/admin/auth';

/**
 * GET /api/admin/auth/2fa/backup-codes
 * Get remaining backup codes count
 */
export async function GET(request: NextRequest) {
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

    // Get remaining backup codes count
    const count = await getRemainingBackupCodesCount(adminId);

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error getting backup codes count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get backup codes count' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/auth/2fa/backup-codes
 * Regenerate backup codes
 * Requires verification code for security
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
        { success: false, error: 'Verification code is required to regenerate backup codes' },
        { status: 400 }
      );
    }

    // Verify the token before regenerating
    const verifyResult = await verifyUserTOTPToken(adminId, token);

    if (!verifyResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Regenerate backup codes
    const result = await regenerateBackupCodes(adminId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to regenerate backup codes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Backup codes regenerated successfully',
      backupCodes: result.backupCodes,
    });
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate backup codes' },
      { status: 500 }
    );
  }
}
