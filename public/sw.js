// Service Worker for Duely Push Notifications
// Version: 1.0.0

const CACHE_VERSION = 'duely-v1';
const APP_URL = self.location.origin;

console.log('[Service Worker] Loaded');

// Install event
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});

// Push event - received when notification is sent
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received');

  if (!event.data) {
    console.log('[Service Worker] Push event has no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[Service Worker] Error parsing push data:', e);
    data = {
      title: 'Duely Notification',
      body: event.data.text()
    };
  }

  const title = data.title || 'Duely';

  // Determine actions based on notification type
  const actions = data.actions || getDefaultActions(data);

  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: data.tag || 'duely-notification',
    data: {
      url: data.url || `${APP_URL}/dashboard`,
      notificationId: data.notificationId,
      timestamp: Date.now(),
      ...data.data
    },
    requireInteraction: data.requireInteraction || false,
    actions: actions,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Helper function to get default actions based on notification data
function getDefaultActions(data) {
  const actions = [];

  // Always add "View" action
  actions.push({
    action: 'view',
    title: 'View'
  });

  // Add "Mark as Read" if we have notificationId
  if (data.notificationId) {
    actions.push({
      action: 'mark-read',
      title: 'Mark as Read'
    });
  }

  return actions;
}

// Notification click event
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked:', event.action);

  event.notification.close();

  const urlToOpen = event.notification.data.url || `${APP_URL}/dashboard`;

  // Handle action buttons
  if (event.action === 'mark-read') {
    const notificationId = event.notification.data.notificationId;
    if (notificationId) {
      fetch(`${APP_URL}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(err => console.error('[Service Worker] Failed to mark as read:', err));
    }
    return;
  }

  if (event.action === 'view') {
    // Will open the URL below
  }

  // Open or focus app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.startsWith(APP_URL) && 'focus' in client) {
            return client.focus().then(client => {
              if (client.navigate && urlToOpen !== client.url) {
                return client.navigate(urlToOpen);
              }
            });
          }
        }

        // App not open, open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[Service Worker] Notification closed');
});
