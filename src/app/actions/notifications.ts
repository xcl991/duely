"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type NotificationWithSubscription = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  subscription: {
    id: string;
    serviceName: string;
    amount: number;
    nextBilling: Date;
  } | null;
};

/**
 * Get all notifications for current user
 */
export async function getNotifications(
  unreadOnly = false
): Promise<NotificationWithSubscription[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      ...(unreadOnly && { isRead: false }),
    },
    include: {
      subscription: {
        select: {
          id: true,
          serviceName: true,
          amount: true,
          nextBilling: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Limit to 50 most recent
  });

  return notifications;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const user = await getCurrentUser();

  if (!user?.id) {
    return 0;
  }

  const count = await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  return count;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Verify notification belongs to user
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

    if (existing.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Mark as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Notification marked as read",
    };
  } catch (error) {
    console.error("Mark as read error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to mark notification as read",
    };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "All notifications marked as read",
    };
  } catch (error) {
    console.error("Mark all as read error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Verify notification belongs to user
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

    if (existing.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Notification deleted",
    };
  } catch (error) {
    console.error("Delete notification error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to delete notification",
    };
  }
}

/**
 * Clear all read notifications
 */
export async function clearReadNotifications() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    await prisma.notification.deleteMany({
      where: {
        userId: user.id,
        isRead: true,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Read notifications cleared",
    };
  } catch (error) {
    console.error("Clear notifications error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to clear notifications",
    };
  }
}

/**
 * Create notification manually (admin/system use)
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  subscriptionId?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        subscriptionId: subscriptionId || null,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: notification,
    };
  } catch (error) {
    console.error("Create notification error:", error);
    return {
      success: false,
      error: "Failed to create notification",
    };
  }
}
