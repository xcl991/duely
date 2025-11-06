import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Admin user type
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin login result
 */
export interface AdminLoginResult {
  success: boolean;
  admin?: AdminUser;
  error?: string;
}

/**
 * Verify admin credentials
 * @param email - Admin email
 * @param password - Admin password (plain text)
 * @returns AdminLoginResult with admin user if successful
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  try {
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    // Return admin without password
    const { password: _, ...adminWithoutPassword } = admin;

    return {
      success: true,
      admin: adminWithoutPassword,
    };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Get admin by ID
 * @param id - Admin ID
 * @returns Admin user or null
 */
export async function getAdminById(id: string): Promise<AdminUser | null> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      return null;
    }

    // Return admin without password
    const { password: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  } catch (error) {
    console.error('Error getting admin by ID:', error);
    return null;
  }
}

/**
 * Get admin by email
 * @param email - Admin email
 * @returns Admin user or null
 */
export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return null;
    }

    // Return admin without password
    const { password: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  } catch (error) {
    console.error('Error getting admin by email:', error);
    return null;
  }
}

/**
 * Log admin action (new signature)
 */
export async function logAdminAction(params: {
  adminId: string;
  action: string;
  details?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        target: params.details || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

/**
 * Require admin authentication from NextRequest
 * Returns admin user or null
 */
export async function requireAdminAuth(_request: Request) {
  const { getAdminSession } = await import('./session');
  const session = await getAdminSession();

  if (!session) {
    return null;
  }

  const admin = await getAdminById(session.adminId);
  return admin;
}

/**
 * Get admin action logs
 * @param adminId - Admin ID (optional, if not provided returns all logs)
 * @param limit - Number of logs to return (default: 50)
 * @returns Array of admin logs
 */
export async function getAdminLogs(adminId?: string, limit: number = 50) {
  try {
    const logs = await prisma.adminLog.findMany({
      where: adminId ? { adminId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        admin: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return logs;
  } catch (error) {
    console.error('Error getting admin logs:', error);
    return [];
  }
}
