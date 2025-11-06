import { prisma } from '@/lib/prisma';

/**
 * Notification types
 */
export type NotificationType = 'info' | 'warning' | 'error' | 'critical';

/**
 * Notification categories
 */
export type NotificationCategory = 'system' | 'security' | 'user_action' | 'subscription';

/**
 * Notification interface
 */
export interface AdminNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  category: NotificationCategory;
  severity?: number; // 1-5
  metadata?: any;
  actionUrl?: string;
  expiresAt?: Date;
}

/**
 * Create a new admin notification
 */
export async function createNotification(data: AdminNotificationData): Promise<boolean> {
  try {
    await prisma.adminNotification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        category: data.category,
        severity: data.severity || 1,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        actionUrl: data.actionUrl || null,
        expiresAt: data.expiresAt || null,
      },
    });

    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Get all notifications with optional filters
 */
export async function getNotifications(filters?: {
  type?: NotificationType;
  category?: NotificationCategory;
  isRead?: boolean;
  limit?: number;
}): Promise<any[]> {
  try {
    const where: any = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.isRead !== undefined) where.isRead = filters.isRead;

    // Filter out expired notifications
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ];

    const notifications = await prisma.adminNotification.findMany({
      where,
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
      take: filters?.limit || 100,
    });

    return notifications.map(notif => ({
      ...notif,
      metadata: notif.metadata ? JSON.parse(notif.metadata) : null,
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const count = await prisma.adminNotification.count({
      where: {
        isRead: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(id: string, readBy: string): Promise<boolean> {
  try {
    await prisma.adminNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
        readBy,
      },
    });

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(readBy: string): Promise<boolean> {
  try {
    await prisma.adminNotification.updateMany({
      where: {
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
        readBy,
      },
    });

    return true;
  } catch (error) {
    console.error('Error marking all as read:', error);
    return false;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<boolean> {
  try {
    await prisma.adminNotification.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

/**
 * Delete old expired notifications (cleanup task)
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  try {
    const result = await prisma.adminNotification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    return 0;
  }
}

/**
 * System notification helpers - create specific notification types
 */

export async function notifySystemError(title: string, message: string, metadata?: any) {
  return createNotification({
    type: 'error',
    title,
    message,
    category: 'system',
    severity: 4,
    metadata,
  });
}

export async function notifySecurityAlert(title: string, message: string, metadata?: any) {
  return createNotification({
    type: 'critical',
    title,
    message,
    category: 'security',
    severity: 5,
    metadata,
  });
}

export async function notifyUserAction(title: string, message: string, metadata?: any) {
  return createNotification({
    type: 'info',
    title,
    message,
    category: 'user_action',
    severity: 2,
    metadata,
  });
}

export async function notifySubscriptionEvent(title: string, message: string, metadata?: any) {
  return createNotification({
    type: 'warning',
    title,
    message,
    category: 'subscription',
    severity: 3,
    metadata,
  });
}
