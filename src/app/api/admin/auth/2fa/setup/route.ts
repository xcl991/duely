import { NextRequest, NextResponse } from 'next/server';
import { generateTOTPSecret, generateQRCode, setupTwoFactor } from '@/lib/admin/two-factor';
import { requireAdminAuth } from '@/lib/admin/auth';

/**
 * POST /api/admin/auth/2fa/setup
 * Initialize 2FA setup for the current admin user
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
    const username = admin.email;

    // Generate TOTP secret
    const { secret, otpauthUrl } = generateTOTPSecret(username);

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(otpauthUrl);

    // Return secret and QR code (don't save yet, wait for verification)
    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCode: qrCodeDataUrl,
        adminId,
      },
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/auth/2fa/setup
 * Complete 2FA setup by verifying the token
 */
export async function PUT(request: NextRequest) {
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
    const { secret, token } = body;

    // Validate input
    if (!secret || !token) {
      return NextResponse.json(
        { success: false, error: 'Secret and token are required' },
        { status: 400 }
      );
    }

    // Import verification function
    const { verifyTOTPToken } = await import('@/lib/admin/two-factor');

    // Verify the token
    const isValid = verifyTOTPToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Setup 2FA (save secret and generate backup codes)
    const result = await setupTwoFactor(adminId, secret);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to setup 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: result.backupCodes,
    });
  } catch (error) {
    console.error('Error completing 2FA setup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete 2FA setup' },
      { status: 500 }
    );
  }
}
