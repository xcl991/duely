"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export type PushSubscriptionData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

/**
 * Subscribe user to push notifications
 */
export async function subscribeToPush(subscription: PushSubscriptionData) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    if (!subscription?.endpoint || !subscription?.keys) {
      return {
        success: false,
        error: "Invalid subscription data",
      };
    }

    // Store subscription in database
    const saved = await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: saved,
      message: "Successfully subscribed to push notifications",
    };
  } catch (error) {
    console.error("Subscribe to push error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to subscribe to push notifications",
    };
  }
}

/**
 * Unsubscribe user from push notifications
 */
export async function unsubscribeFromPush(subscription: PushSubscriptionData) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Delete subscription from database
    await prisma.pushSubscription.delete({
      where: {
        endpoint: subscription.endpoint,
      },
    });

    return {
      success: true,
      message: "Successfully unsubscribed from push notifications",
    };
  } catch (error) {
    console.error("Unsubscribe from push error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to unsubscribe from push notifications",
    };
  }
}

/**
 * Get all push subscriptions for current user
 */
export async function getUserPushSubscriptions() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
        data: [],
      };
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: subscriptions,
    };
  } catch (error) {
    console.error("Get push subscriptions error:", error);
    return {
      success: false,
      error: "Failed to get push subscriptions",
      data: [],
    };
  }
}

/**
 * Delete a specific push subscription by ID
 */
export async function deletePushSubscription(subscriptionId: string) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Verify subscription belongs to user
    const subscription = await prisma.pushSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== user.id) {
      return {
        success: false,
        error: "Subscription not found",
      };
    }

    await prisma.pushSubscription.delete({
      where: { id: subscriptionId },
    });

    return {
      success: true,
      message: "Subscription deleted successfully",
    };
  } catch (error) {
    console.error("Delete push subscription error:", error);
    return {
      success: false,
      error: "Failed to delete subscription",
    };
  }
}
