import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  createNotification,
  type NotificationType,
  type NotificationCategory,
} from '@/lib/admin/notifications';

/**
 * GET /api/admin/notifications
 * Get all notifications with optional filters
 *
 * Query Parameters:
 * - type: info | warning | error | critical
 * - category: system | security | user_action | subscription
 * - isRead: true | false
 * - limit: number (default: 100)
 * - unreadCount: true (returns just the count)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // If only requesting unread count
    if (searchParams.get('unreadCount') === 'true') {
      const count = await getUnreadCount();
      return NextResponse.json({
        success: true,
        count,
      });
    }

    // Build filters
    const filters: any = {};

    const type = searchParams.get('type') as NotificationType | null;
    if (type) filters.type = type;

    const category = searchParams.get('category') as NotificationCategory | null;
    if (category) filters.category = category;

    const isRead = searchParams.get('isRead');
    if (isRead !== null) filters.isRead = isRead === 'true';

    const limit = searchParams.get('limit');
    if (limit) filters.limit = parseInt(limit, 10);

    const notifications = await getNotifications(filters);

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Create a new notification
 *
 * Body:
 * {
 *   type: "info" | "warning" | "error" | "critical"
 *   title: string
 *   message: string
 *   category: "system" | "security" | "user_action" | "subscription"
 *   severity?: number (1-5)
 *   metadata?: any
 *   actionUrl?: string
 *   expiresAt?: string (ISO date)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, category, severity, metadata, actionUrl, expiresAt } = body;

    // Validation
    if (!type || !title || !message || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message, category' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes: NotificationType[] = ['info', 'warning', 'error', 'critical'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: info, warning, error, or critical' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories: NotificationCategory[] = ['system', 'security', 'user_action', 'subscription'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be: system, security, user_action, or subscription' },
        { status: 400 }
      );
    }

    const success = await createNotification({
      type,
      title,
      message,
      category,
      severity,
      metadata,
      actionUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/notifications
 * Mark all notifications as read
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await markAllAsRead(admin.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark all as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 }
    );
  }
}
