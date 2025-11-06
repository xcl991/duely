'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { subscribeToPush, unsubscribeFromPush } from '@/app/actions/push-subscriptions';
import { toast } from 'sonner';

export function PushSubscriptionButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  async function handleSubscribe() {
    if (!isSupported) {
      toast.error('Push notifications are not supported in your browser');
      return;
    }

    setLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast.error('Please allow notifications to enable push notifications');
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const vapidKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      );
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey as BufferSource
      });

      // Convert subscription to JSON
      const subscriptionJSON = subscription.toJSON();

      // Send subscription to server
      const result = await subscribeToPush({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys?.p256dh || '',
          auth: subscriptionJSON.keys?.auth || '',
        }
      });

      if (result.success) {
        setIsSubscribed(true);
        toast.success('Push notifications enabled successfully!');
      } else {
        throw new Error(result.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to enable push notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const subscriptionJSON = subscription.toJSON();

        await subscription.unsubscribe();
        await unsubscribeFromPush({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscriptionJSON.keys?.p256dh || '',
            auth: subscriptionJSON.keys?.auth || '',
          }
        });

        setIsSubscribed(false);
        toast.success('Push notifications have been disabled');
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast.error('Failed to disable push notifications');
    } finally {
      setLoading(false);
    }
  }

  async function handleTestNotification() {
    setTesting(true);

    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Test notification sent! Check your notifications.');
      } else {
        throw new Error(data.error || 'Failed to send test');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification');
    } finally {
      setTesting(false);
    }
  }

  if (!isSupported) {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-muted-foreground">
          Push notifications are blocked. Please enable them in your browser settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Receive notifications even when the app is closed
          </p>
        </div>
        <Button
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={loading}
          variant={isSubscribed ? 'outline' : 'default'}
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : isSubscribed ? (
            <>
              <BellOff className="mr-2 h-4 w-4" />
              Disable
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Enable
            </>
          )}
        </Button>
      </div>
      {isSubscribed && (
        <>
          <p className="text-sm text-green-600">
            ✓ Push notifications are enabled on this device
          </p>
          <Button
            onClick={handleTestNotification}
            disabled={testing}
            variant="outline"
            size="sm"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Test Notification'
            )}
          </Button>
        </>
      )}
    </div>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
