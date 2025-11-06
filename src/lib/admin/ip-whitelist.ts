import { prisma } from '@/lib/prisma';

/**
 * IP Whitelist utilities for admin access control
 * Provides functions to manage IP-based access restrictions
 */

export interface IPWhitelistEntry {
  id: string;
  ipAddress: string;
  description: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed: Date | null;
}

/**
 * Check if an IP address is whitelisted
 */
export async function isIPWhitelisted(ipAddress: string): Promise<boolean> {
  try {
    // First check if IP whitelist is enabled
    const isEnabled = await isIPWhitelistEnabled();
    if (!isEnabled) {
      // If whitelist is disabled, allow all IPs
      return true;
    }

    // Normalize IP address (remove IPv6 prefix if present)
    const normalizedIP = normalizeIPAddress(ipAddress);

    // Check if IP exists and is active
    const entry = await prisma.adminIPWhitelist.findFirst({
      where: {
        ipAddress: normalizedIP,
        isActive: true,
      },
    });

    if (entry) {
      // Update last used timestamp
      await prisma.adminIPWhitelist.update({
        where: { id: entry.id },
        data: { lastUsed: new Date() },
      });
      return true;
    }

    // Check for wildcard matches (e.g., 192.168.1.*)
    const wildcardEntries = await prisma.adminIPWhitelist.findMany({
      where: {
        isActive: true,
        ipAddress: {
          contains: '*',
        },
      },
    });

    for (const wildcardEntry of wildcardEntries) {
      if (matchesWildcard(normalizedIP, wildcardEntry.ipAddress)) {
        // Update last used timestamp
        await prisma.adminIPWhitelist.update({
          where: { id: wildcardEntry.id },
          data: { lastUsed: new Date() },
        });
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking IP whitelist:', error);
    // On error, allow access (fail open for availability)
    return true;
  }
}

/**
 * Check if IP whitelist feature is enabled
 */
export async function isIPWhitelistEnabled(): Promise<boolean> {
  try {
    const setting = await prisma.adminSettings.findUnique({
      where: { key: 'ip_whitelist_enabled' },
    });

    if (!setting) {
      return false;
    }

    return setting.value === 'true' || setting.value === '1';
  } catch (error) {
    console.error('Error checking IP whitelist enabled:', error);
    return false;
  }
}

/**
 * Normalize IP address (remove IPv6 prefix)
 */
export function normalizeIPAddress(ipAddress: string): string {
  // Remove IPv6 prefix (::ffff:) if present
  if (ipAddress.startsWith('::ffff:')) {
    return ipAddress.substring(7);
  }
  return ipAddress;
}

/**
 * Check if IP matches wildcard pattern
 * Supports patterns like: 192.168.1.*, 10.0.*.*
 */
export function matchesWildcard(ip: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '\\d{1,3}');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(ip);
}

/**
 * Get all IP whitelist entries
 */
export async function getIPWhitelist(options?: {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}): Promise<IPWhitelistEntry[]> {
  try {
    const where: any = {};

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const entries = await prisma.adminIPWhitelist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });

    return entries;
  } catch (error) {
    console.error('Error getting IP whitelist:', error);
    return [];
  }
}

/**
 * Get total count of IP whitelist entries
 */
export async function getIPWhitelistCount(isActive?: boolean): Promise<number> {
  try {
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await prisma.adminIPWhitelist.count({ where });
  } catch (error) {
    console.error('Error getting IP whitelist count:', error);
    return 0;
  }
}

/**
 * Add IP to whitelist
 */
export async function addIPToWhitelist(
  ipAddress: string,
  description: string | null,
  createdBy: string
): Promise<{ success: boolean; message: string; entry?: IPWhitelistEntry }> {
  try {
    // Validate IP address format
    if (!isValidIPAddress(ipAddress)) {
      return {
        success: false,
        message: 'Invalid IP address format',
      };
    }

    // Normalize IP address
    const normalizedIP = normalizeIPAddress(ipAddress);

    // Check if IP already exists
    const existing = await prisma.adminIPWhitelist.findFirst({
      where: { ipAddress: normalizedIP },
    });

    if (existing) {
      return {
        success: false,
        message: 'IP address already in whitelist',
      };
    }

    // Add to whitelist
    const entry = await prisma.adminIPWhitelist.create({
      data: {
        ipAddress: normalizedIP,
        description,
        createdBy,
        isActive: true,
      },
    });

    return {
      success: true,
      message: 'IP address added to whitelist',
      entry,
    };
  } catch (error) {
    console.error('Error adding IP to whitelist:', error);
    return {
      success: false,
      message: 'Failed to add IP to whitelist',
    };
  }
}

/**
 * Remove IP from whitelist
 */
export async function removeIPFromWhitelist(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.adminIPWhitelist.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'IP address removed from whitelist',
    };
  } catch (error) {
    console.error('Error removing IP from whitelist:', error);
    return {
      success: false,
      message: 'Failed to remove IP from whitelist',
    };
  }
}

/**
 * Update IP whitelist entry
 */
export async function updateIPWhitelist(
  id: string,
  data: {
    description?: string | null;
    isActive?: boolean;
  }
): Promise<{ success: boolean; message: string; entry?: IPWhitelistEntry }> {
  try {
    const entry = await prisma.adminIPWhitelist.update({
      where: { id },
      data,
    });

    return {
      success: true,
      message: 'IP whitelist entry updated',
      entry,
    };
  } catch (error) {
    console.error('Error updating IP whitelist:', error);
    return {
      success: false,
      message: 'Failed to update IP whitelist entry',
    };
  }
}

/**
 * Validate IP address format
 * Supports IPv4, IPv6, and wildcard patterns
 */
export function isValidIPAddress(ip: string): boolean {
  // IPv4 pattern (with optional wildcards)
  const ipv4Pattern = /^(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)$/;

  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  if (ipv4Pattern.test(ip)) {
    // Validate each octet if not wildcard
    const octets = ip.split('.');
    for (const octet of octets) {
      if (octet !== '*') {
        const num = parseInt(octet, 10);
        if (num < 0 || num > 255) {
          return false;
        }
      }
    }
    return true;
  }

  if (ipv6Pattern.test(ip)) {
    return true;
  }

  return false;
}

/**
 * Log access attempt
 */
export async function logAccessAttempt(
  ipAddress: string,
  adminId: string | null,
  action: string,
  success: boolean,
  metadata?: any
): Promise<void> {
  try {
    const normalizedIP = normalizeIPAddress(ipAddress);

    await prisma.adminAccessLog.create({
      data: {
        ipAddress: normalizedIP,
        adminId,
        action,
        success,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Error logging access attempt:', error);
  }
}

/**
 * Get access logs
 */
export async function getAccessLogs(options?: {
  ipAddress?: string;
  adminId?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  try {
    const where: any = {};

    if (options?.ipAddress) {
      where.ipAddress = normalizeIPAddress(options.ipAddress);
    }

    if (options?.adminId) {
      where.adminId = options.adminId;
    }

    if (options?.success !== undefined) {
      where.success = options.success;
    }

    const logs = await prisma.adminAccessLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 100,
      skip: options?.offset || 0,
      include: {
        admin: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return logs;
  } catch (error) {
    console.error('Error getting access logs:', error);
    return [];
  }
}

/**
 * Toggle IP whitelist feature
 */
export async function toggleIPWhitelist(
  enabled: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.adminSettings.upsert({
      where: { key: 'ip_whitelist_enabled' },
      update: {
        value: enabled ? 'true' : 'false',
      },
      create: {
        key: 'ip_whitelist_enabled',
        value: enabled ? 'true' : 'false',
        type: 'boolean',
        category: 'security',
        description: 'Enable IP whitelist for admin access',
      },
    });

    return {
      success: true,
      message: `IP whitelist ${enabled ? 'enabled' : 'disabled'}`,
    };
  } catch (error) {
    console.error('Error toggling IP whitelist:', error);
    return {
      success: false,
      message: 'Failed to toggle IP whitelist',
    };
  }
}
