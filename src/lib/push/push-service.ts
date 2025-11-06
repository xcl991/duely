import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@duely.online',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys not configured - push notifications will not work');
}

export type PushPayload = {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  notificationId?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
};

/**
 * Send push notification to a specific user
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  try {
    // Get all subscriptions for this user
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      console.log(`No push subscriptions for user ${userId}`);
      return { sent: 0, failed: 0 };
    }

    console.log(`Sending push to ${subscriptions.length} subscriptions for user ${userId}`);

    // Send to all subscriptions in parallel
    const results = await Promise.allSettled(
      subscriptions.map(sub => sendPushToSubscription(sub, payload))
    );

    // Count successes and failures
    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Push sent to user ${userId}: ${sent} sent, ${failed} failed`);

    return { sent, failed };
  } catch (error) {
    console.error('Error sending push to user:', error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Send push notification to a specific subscription
 */
async function sendPushToSubscription(
  subscription: any,
  payload: PushPayload
): Promise<void> {
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/notification-icon.png',
    url: payload.url || '/dashboard',
    tag: payload.tag || 'duely-notification',
    requireInteraction: payload.requireInteraction || false,
    notificationId: payload.notificationId,
    data: payload.data || {},
    actions: payload.actions || [],
  });

  try {
    await webpush.sendNotification(pushSubscription, notificationPayload);
    console.log(`✓ Push sent to: ${subscription.endpoint.substring(0, 50)}...`);
  } catch (error: any) {
    console.error('Push send error:', error.message || error);

    // If subscription is no longer valid, delete it
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('Subscription expired, deleting...');
      try {
        await prisma.pushSubscription.delete({
          where: { id: subscription.id },
        });
      } catch (deleteError) {
        console.error('Failed to delete expired subscription:', deleteError);
      }
    }

    throw error;
  }
}

/**
 * Send push notification to all users (admin broadcasts)
 */
export async function sendPushToAll(
  payload: PushPayload,
  _filters?: {
    hasActiveSubscriptions?: boolean;
  }
): Promise<{ sent: number; failed: number }> {
  try {
    // Get all subscriptions (could add filters here)
    const subscriptions = await prisma.pushSubscription.findMany({
      take: 1000, // Limit to prevent overload
    });

    console.log(`Broadcasting push to ${subscriptions.length} subscriptions`);

    const results = await Promise.allSettled(
      subscriptions.map(sub => sendPushToSubscription(sub, payload))
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Broadcast push: ${sent} sent, ${failed} failed`);

    return { sent, failed };
  } catch (error) {
    console.error('Error sending broadcast push:', error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Test push notification for development
 */
export async function sendTestPush(userId: string): Promise<boolean> {
  try {
    const result = await sendPushToUser(userId, {
      title: 'Test Notification',
      body: 'This is a test push notification from Duely! 🔔',
      icon: '/icons/notification-icon.png',
      url: '/dashboard',
      tag: 'test-notification',
    });

    return result.sent > 0;
  } catch (error) {
    console.error('Error sending test push:', error);
    return false;
  }
}
