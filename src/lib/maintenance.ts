/**
 * Maintenance Mode Library
 *
 * This library provides functions to check and manage site-wide maintenance mode.
 * Uses database-based approach with 10-second caching for optimal performance.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache maintenance status for 10 seconds to reduce DB queries
interface MaintenanceCache {
  enabled: boolean;
  message: string | null;
  estimatedEndTime: Date | null;
  timestamp: number;
}

let maintenanceCache: MaintenanceCache | null = null;
const CACHE_DURATION = 10000; // 10 seconds

/**
 * Check if maintenance mode is currently active
 * Returns cached result if available (refreshes every 10 seconds)
 *
 * @returns {Promise<boolean>} True if maintenance mode is active
 */
export async function checkMaintenanceMode(): Promise<boolean> {
  try {
    // Check cache first
    if (maintenanceCache) {
      const now = Date.now();
      if (now - maintenanceCache.timestamp < CACHE_DURATION) {
        return maintenanceCache.enabled;
      }
    }

    // Fetch from database
    const maintenance = await prisma.maintenanceMode.findFirst({
      where: { isEnabled: true },
      select: {
        isEnabled: true,
        message: true,
        estimatedEndTime: true,
      },
    });

    const isEnabled = maintenance?.isEnabled || false;

    // Update cache
    maintenanceCache = {
      enabled: isEnabled,
      message: maintenance?.message || null,
      estimatedEndTime: maintenance?.estimatedEndTime || null,
      timestamp: Date.now(),
    };

    return isEnabled;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // Default to false (allow access) if DB error occurs
    // This prevents locking everyone out if database has issues
    return false;
  }
}

/**
 * Get detailed maintenance information
 * Used by the maintenance page to display custom message and ETA
 *
 * @returns {Promise<MaintenanceInfo | null>} Maintenance details or null if not active
 */
export interface MaintenanceInfo {
  enabled: boolean;
  message: string | null;
  estimatedEndTime: Date | null;
  startedAt: Date | null;
  estimatedMinutes: number | null;
}

export async function getMaintenanceInfo(): Promise<MaintenanceInfo | null> {
  try {
    const maintenance = await prisma.maintenanceMode.findFirst({
      where: { isEnabled: true },
    });

    if (!maintenance || !maintenance.isEnabled) {
      return null;
    }

    // Calculate estimated minutes remaining
    let estimatedMinutes: number | null = null;
    if (maintenance.estimatedEndTime) {
      const now = new Date().getTime();
      const endTime = maintenance.estimatedEndTime.getTime();
      const diff = endTime - now;
      estimatedMinutes = diff > 0 ? Math.round(diff / 60000) : 0;
    }

    return {
      enabled: true,
      message: maintenance.message,
      estimatedEndTime: maintenance.estimatedEndTime,
      startedAt: maintenance.startedAt,
      estimatedMinutes,
    };
  } catch (error) {
    console.error('Error getting maintenance info:', error);
    return null;
  }
}

/**
 * Activate maintenance mode
 * Creates or updates maintenance record
 *
 * @param {Object} params - Maintenance parameters
 * @param {string} params.adminId - Admin user ID activating maintenance
 * @param {string} params.adminName - Admin user name
 * @param {string} [params.message] - Custom maintenance message
 * @param {number} [params.estimatedMinutes] - Estimated duration in minutes
 * @returns {Promise<boolean>} True if successful
 */
export async function activateMaintenanceMode(params: {
  adminId: string;
  adminName: string;
  message?: string;
  estimatedMinutes?: number;
  reason?: string;
}): Promise<boolean> {
  try {
    const estimatedEndTime = params.estimatedMinutes
      ? new Date(Date.now() + params.estimatedMinutes * 60000)
      : null;

    // Check if maintenance record exists
    const existing = await prisma.maintenanceMode.findFirst();

    if (existing) {
      // Update existing record
      await prisma.maintenanceMode.update({
        where: { id: existing.id },
        data: {
          isEnabled: true,
          message: params.message || 'The site is currently under maintenance. We will be back online shortly.',
          estimatedEndTime,
          startedAt: new Date(),
          startedBy: params.adminId,
          endedAt: null,
          endedBy: null,
        },
      });
    } else {
      // Create new record
      await prisma.maintenanceMode.create({
        data: {
          isEnabled: true,
          message: params.message || 'The site is currently under maintenance. We will be back online shortly.',
          estimatedEndTime,
          startedAt: new Date(),
          startedBy: params.adminId,
        },
      });
    }

    // Clear cache to force refresh
    maintenanceCache = null;

    return true;
  } catch (error) {
    console.error('Error activating maintenance mode:', error);
    return false;
  }
}

/**
 * Deactivate maintenance mode
 * Updates maintenance record and creates history log
 *
 * @param {Object} params - Deactivation parameters
 * @param {string} params.adminId - Admin user ID deactivating maintenance
 * @param {string} params.adminName - Admin user name
 * @returns {Promise<boolean>} True if successful
 */
export async function deactivateMaintenanceMode(params: {
  adminId: string;
  adminName: string;
}): Promise<boolean> {
  try {
    const maintenance = await prisma.maintenanceMode.findFirst({
      where: { isEnabled: true },
    });

    if (!maintenance) {
      return true; // Already deactivated
    }

    // Calculate duration if maintenance was started
    let duration: number | null = null;
    if (maintenance.startedAt) {
      const now = new Date().getTime();
      const startTime = maintenance.startedAt.getTime();
      duration = Math.round((now - startTime) / 60000); // minutes
    }

    // Create maintenance log entry
    if (maintenance.startedAt && maintenance.startedBy) {
      await prisma.maintenanceLog.create({
        data: {
          startedAt: maintenance.startedAt,
          endedAt: new Date(),
          duration,
          message: maintenance.message,
          startedBy: maintenance.startedBy,
          startedByName: params.adminName, // We'll get this from admin info
          endedBy: params.adminId,
          endedByName: params.adminName,
          reason: 'manual', // Can be enhanced to track reason
        },
      });
    }

    // Deactivate maintenance mode
    await prisma.maintenanceMode.update({
      where: { id: maintenance.id },
      data: {
        isEnabled: false,
        endedAt: new Date(),
        endedBy: params.adminId,
      },
    });

    // Clear cache
    maintenanceCache = null;

    return true;
  } catch (error) {
    console.error('Error deactivating maintenance mode:', error);
    return false;
  }
}

/**
 * Get maintenance history logs
 *
 * @param {number} [limit=10] - Number of logs to return
 * @returns {Promise<Array>} Array of maintenance log entries
 */
export async function getMaintenanceHistory(limit: number = 10) {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('Error getting maintenance history:', error);
    return [];
  }
}

/**
 * Clear maintenance cache
 * Force cache refresh on next check
 */
export function clearMaintenanceCache(): void {
  maintenanceCache = null;
}
