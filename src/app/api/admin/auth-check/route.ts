import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';

/**
 * GET /api/admin/auth-check
 * Verify if current user is authenticated as admin
 * Used by nginx auth_request directive for Prisma Studio access
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated admin
    const admin = await requireAdminAuth(request);

    if (!admin) {
      return NextResponse.json(
        {
          isAdmin: false,
          error: 'Unauthorized - Admin access required'
        },
        { status: 401 }
      );
    }

    // Return success with admin info
    return NextResponse.json({
      isAdmin: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json(
      {
        isAdmin: false,
        error: 'Authentication check failed'
      },
      { status: 401 }
    );
  }
}
