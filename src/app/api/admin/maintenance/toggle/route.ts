import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth, logAdminAction } from '@/lib/admin/auth';
import {
  activateMaintenanceMode,
  deactivateMaintenanceMode,
  checkMaintenanceMode,
} from '@/lib/maintenance';

/**
 * POST /api/admin/maintenance/toggle
 * Toggle maintenance mode on/off
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { enabled, message, estimatedMinutes, reason } = body;

    // Validate input
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid input - enabled must be boolean' },
        { status: 400 }
      );
    }

    let success = false;

    if (enabled) {
      // Activate maintenance mode
      success = await activateMaintenanceMode({
        adminId: admin.id,
        adminName: admin.name || admin.email,
        message: message || undefined,
        estimatedMinutes: estimatedMinutes || 15,
        reason: reason || 'manual',
      });

      if (success) {
        // Log admin action
        await logAdminAction({
          adminId: admin.id,
          action: 'MAINTENANCE_ACTIVATED',
          details: `Activated maintenance mode`,
          metadata: {
            message: message || 'Default maintenance message',
            estimatedMinutes: estimatedMinutes || 15,
            reason: reason || 'manual',
          },
        });
      }
    } else {
      // Deactivate maintenance mode
      success = await deactivateMaintenanceMode({
        adminId: admin.id,
        adminName: admin.name || admin.email,
      });

      if (success) {
        // Log admin action
        await logAdminAction({
          adminId: admin.id,
          action: 'MAINTENANCE_DEACTIVATED',
          details: `Deactivated maintenance mode`,
          metadata: {},
        });
      }
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to toggle maintenance mode' },
        { status: 500 }
      );
    }

    // Get current status to return
    const currentStatus = await checkMaintenanceMode();

    return NextResponse.json({
      success: true,
      enabled: currentStatus,
      message: enabled
        ? 'Maintenance mode activated successfully'
        : 'Maintenance mode deactivated successfully',
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    return NextResponse.json(
      { error: 'Failed to toggle maintenance mode' },
      { status: 500 }
    );
  }
}
