# Push Notification Implementation - Step by Step Guide
## Duely Subscription Management Platform

**Tanggal Mulai**: 2025-11-06
**Estimasi Waktu**: 4-5 Minggu
**Status**: Belum Dimulai

---

## Daftar Isi

- [Overview](#overview)
- [Fase 1: Foundation Setup (Week 1, Hari 1-3)](#fase-1-foundation-setup-week-1-hari-1-3)
- [Fase 2: Subscription Management (Week 1, Hari 4-7)](#fase-2-subscription-management-week-1-hari-4-7)
- [Fase 3: Push Sending Infrastructure (Week 2, Hari 1-4)](#fase-3-push-sending-infrastructure-week-2-hari-1-4)
- [Fase 4: Service Worker Notification Handling (Week 2, Hari 5-7)](#fase-4-service-worker-notification-handling-week-2-hari-5-7)
- [Fase 5: User Experience & Polish (Week 3, Hari 1-3)](#fase-5-user-experience--polish-week-3-hari-1-3)
- [Fase 6: Production Deployment (Week 3, Hari 4-7)](#fase-6-production-deployment-week-3-hari-4-7)
- [Testing Checklist](#testing-checklist)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Apa yang Akan Dibangun?

Sistem push notification yang memungkinkan pengguna menerima notifikasi bahkan ketika browser ditutup. Notifikasi akan muncul di notification tray HP/laptop.

### Teknologi yang Digunakan

- ✓ Web Push API (browser standard)
- ✓ Service Worker (background script)
- ✓ VAPID Keys (authentication)
- ✓ web-push library (npm package)
- ✓ PostgreSQL (untuk menyimpan subscription)

### Pre-requisites

- [ ] HTTPS sudah aktif (✓ Duely sudah punya)
- [ ] Node.js >= 16.x
- [ ] npm atau yarn
- [ ] Akses ke Hostinger server (SSH)
- [ ] Akses ke database PostgreSQL

---

## Fase 1: Foundation Setup (Week 1, Hari 1-3)

**Tujuan**: Setup dasar service worker dan VAPID keys

**Estimasi Waktu**: 2-3 hari

### Step 1.1: Install Dependencies

**Lokasi**: Local development

**Perintah**:
```bash
cd F:\Duely\Workspace
npm install web-push --save
```

**Checklist**:
- [ ] Package `web-push` terinstall
- [ ] Muncul di `package.json` dependencies
- [ ] `node_modules/web-push` ada

**Cara Verify**:
```bash
npm list web-push
```

---

### Step 1.2: Generate VAPID Keys

**Lokasi**: Local development

**Perintah**:
```bash
cd F:\Duely\Workspace
npx web-push generate-vapid-keys
```

**Output yang Diharapkan**:
```
=======================================
Public Key:
BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Private Key:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
=======================================
```

**Checklist**:
- [ ] VAPID Public Key berhasil digenerate
- [ ] VAPID Private Key berhasil digenerate
- [ ] Keys disimpan di tempat aman (jangan commit ke Git!)

**PENTING**:
- Copy kedua keys ini ke notepad
- Jangan share private key ke siapapun
- Jangan commit ke Git

---

### Step 1.3: Add Environment Variables (Development)

**Lokasi**: `F:\Duely\Workspace\.env.local`

**File**: `.env.local`

**Tambahkan**:
```env
# ===========================================
# VAPID KEYS (Push Notifications)
# ===========================================
VAPID_PUBLIC_KEY="BKxxx...xxx"  # Paste public key dari Step 1.2
VAPID_PRIVATE_KEY="xxx...xxx"   # Paste private key dari Step 1.2
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BKxxx...xxx"  # Same as VAPID_PUBLIC_KEY (exposed to client)
```

**Checklist**:
- [ ] File `.env.local` sudah ada
- [ ] VAPID_PUBLIC_KEY ditambahkan
- [ ] VAPID_PRIVATE_KEY ditambahkan
- [ ] NEXT_PUBLIC_VAPID_PUBLIC_KEY ditambahkan (sama dengan public key)
- [ ] Verify tidak ada typo atau extra spaces

**Cara Verify**:
```bash
cat .env.local | grep VAPID
```

---

### Step 1.4: Create Service Worker File

**Lokasi**: `F:\Duely\Workspace\public\sw.js`

**Action**: Create new file

**File Path**: `public/sw.js`

**Content**:
```javascript
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
    actions: data.actions || [],
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

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
```

**Checklist**:
- [ ] File `public/sw.js` dibuat
- [ ] Content di-copy dengan benar
- [ ] File tersimpan (Ctrl+S)

**Cara Verify**:
```bash
ls public/sw.js
```

---

### Step 1.5: Create Notification Icons

**Lokasi**: `F:\Duely\Workspace\public\icons\`

**Action**: Create folder dan download icons

**Step 1.5.1: Create Icons Folder**
```bash
cd F:\Duely\Workspace\public
mkdir icons
```

**Checklist**:
- [ ] Folder `public/icons` dibuat

**Step 1.5.2: Create Notification Icon**

**File**: `public/icons/notification-icon.png`

**Spesifikasi**:
- Size: 192x192 pixels
- Format: PNG
- Background: Transparent atau solid color
- Design: Logo Duely atau ikon subscription

**Cara Membuat**:
1. Gunakan Canva, Figma, atau Photoshop
2. Buat design 192x192 px
3. Export sebagai PNG
4. Save ke `F:\Duely\Workspace\public\icons\notification-icon.png`

**Atau gunakan temporary icon**:
```bash
# Copy dari existing favicon atau logo
copy public\favicon.ico public\icons\notification-icon.png
```

**Checklist**:
- [ ] File `notification-icon.png` ada di `public/icons/`
- [ ] Size minimal 192x192 px

**Step 1.5.3: Create Badge Icon**

**File**: `public/icons/badge-icon.png`

**Spesifikasi**:
- Size: 96x96 pixels
- Format: PNG
- Style: Monochrome (white on transparent)
- Design: Simplified logo atau ikon

**Checklist**:
- [ ] File `badge-icon.png` ada di `public/icons/`
- [ ] Size minimal 96x96 px

---

### Step 1.6: Register Service Worker in App

**Lokasi**: `F:\Duely\Workspace\src\app\layout.tsx`

**Action**: Modify existing file

**File**: `src/app/layout.tsx`

**Tambahkan setelah imports**:

```typescript
// Add this to the existing imports section
import Script from 'next/script';
```

**Tambahkan sebelum closing `</body>` tag di RootLayout**:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* ... existing providers and children ... */}

        {children}

        {/* Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('Service Worker registered:', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('Service Worker registration failed:', error);
                  });
              });
            }
          `}
        </Script>

        <Toaster />
      </body>
    </html>
  );
}
```

**Checklist**:
- [ ] Import Script ditambahkan
- [ ] Script tag untuk register SW ditambahkan
- [ ] File disimpan

**Cara Verify**: Lihat Step 1.7

---

### Step 1.7: Test Service Worker Registration

**Lokasi**: Local development server

**Perintah**:
```bash
cd F:\Duely\Workspace
npm run dev
```

**Buka Browser**: http://localhost:3000

**Cara Verify di Chrome DevTools**:

1. Buka Chrome DevTools (F12)
2. Pilih tab **Application**
3. Di sidebar kiri, klik **Service Workers**
4. Lihat apakah service worker untuk `http://localhost:3000` terdaftar
5. Status harus: **activated and is running**

**Checklist**:
- [ ] Dev server berjalan
- [ ] Service worker muncul di DevTools
- [ ] Status: "activated and is running"
- [ ] Console log: "Service Worker registered"
- [ ] Tidak ada error di console

**Screenshot untuk Reference**:
```
Application > Service Workers
✓ http://localhost:3000
  Source: /sw.js
  Status: activated and is running
  Clients: 1
```

---

### Step 1.8: Test Service Worker Updates

**Cara Test**:

1. Edit `public/sw.js` - ubah versi:
```javascript
const CACHE_VERSION = 'duely-v1.1'; // Changed from v1
```

2. Save file

3. Di Chrome DevTools > Application > Service Workers:
   - Klik **Update**
   - Atau refresh page dengan Shift+F5

4. Lihat apakah service worker ter-update

**Checklist**:
- [ ] Service worker update setelah file diubah
- [ ] Console log menunjukkan "Installing..." dan "Activating..."

---

### Fase 1 Summary Checklist

- [ ] **Step 1.1**: Package web-push installed
- [ ] **Step 1.2**: VAPID keys generated
- [ ] **Step 1.3**: Environment variables added
- [ ] **Step 1.4**: Service worker file created
- [ ] **Step 1.5**: Notification icons created
- [ ] **Step 1.6**: Service worker registration added to layout
- [ ] **Step 1.7**: Service worker successfully registered in browser
- [ ] **Step 1.8**: Service worker updates working

**Output Fase 1**:
- ✓ Service worker berjalan di browser
- ✓ VAPID keys siap digunakan
- ✓ Foundation untuk push notifications siap

**Next**: Lanjut ke Fase 2 - Subscription Management

---

## Fase 2: Subscription Management (Week 1, Hari 4-7)

**Tujuan**: Membuat sistem untuk subscribe/unsubscribe push notifications

**Estimasi Waktu**: 3-4 hari

### Step 2.1: Update Database Schema

**Lokasi**: `F:\Duely\Workspace\prisma\schema.prisma`

**Action**: Add new model

**File**: `prisma/schema.prisma`

**Tambahkan model PushSubscription** (di bagian bawah file):

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Push subscription details
  endpoint  String   @unique
  p256dh    String   // Public key for encryption
  auth      String   // Authentication secret

  // Device information
  userAgent String?
  deviceName String? @default("Browser")

  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([endpoint])
  @@map("push_subscriptions")
}
```

**Update User model** (cari model User dan tambahkan):

```prisma
model User {
  id            String    @id @default(cuid())
  // ... existing fields ...

  // Add this line to User model
  pushSubscriptions PushSubscription[]

  // ... rest of existing fields ...
}
```

**Checklist**:
- [ ] Model PushSubscription ditambahkan
- [ ] Relation di User model ditambahkan
- [ ] File disimpan

---

### Step 2.2: Create Database Migration

**Lokasi**: Local development

**Perintah**:
```bash
cd F:\Duely\Workspace
npx prisma migrate dev --name add_push_subscriptions
```

**Output yang Diharapkan**:
```
Applying migration `20250106xxxxxx_add_push_subscriptions`
✔ Generated Prisma Client
```

**Checklist**:
- [ ] Migration file dibuat di `prisma/migrations/`
- [ ] Migration berhasil dijalankan
- [ ] Prisma Client ter-generate ulang
- [ ] Table `push_subscriptions` ada di database

**Cara Verify**:
```bash
npx prisma studio
```
Buka Prisma Studio, lihat apakah table `PushSubscription` muncul.

---

### Step 2.3: Create Push Subscription Actions

**Lokasi**: `F:\Duely\Workspace\src\app\actions\push-subscriptions.ts`

**Action**: Create new file

**File**: `src/app/actions/push-subscriptions.ts`

**Content**:
```typescript
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
```

**Checklist**:
- [ ] File `src/app/actions/push-subscriptions.ts` dibuat
- [ ] Semua functions ter-copy dengan benar
- [ ] File disimpan
- [ ] Tidak ada TypeScript errors

**Cara Verify**:
```bash
npx tsc --noEmit
```

---

### Step 2.4: Create Push Subscription Component

**Lokasi**: `F:\Duely\Workspace\src\components\notifications\PushSubscriptionButton.tsx`

**Action**: Create new file

**File**: `src/components/notifications/PushSubscriptionButton.tsx`

**Content**:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { subscribeToPush, unsubscribeFromPush } from '@/app/actions/push-subscriptions';
import { useToast } from '@/hooks/use-toast';

export function PushSubscriptionButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in your browser',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Please allow notifications to enable push notifications',
          variant: 'destructive',
        });
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
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
        toast({
          title: 'Success!',
          description: 'Push notifications enabled successfully',
        });
      } else {
        throw new Error(result.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable push notifications. Please try again.',
        variant: 'destructive',
      });
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
        toast({
          title: 'Disabled',
          description: 'Push notifications have been disabled',
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable push notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
        <p className="text-sm text-green-600">
          ✓ Push notifications are enabled on this device
        </p>
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
```

**Checklist**:
- [ ] File dibuat di `src/components/notifications/`
- [ ] Import statements benar
- [ ] Component code lengkap
- [ ] File disimpan

---

### Step 2.5: Add Component to Settings Page

**Lokasi**: `F:\Duely\Workspace\src\app/(dashboard)/settings/page.tsx`

**Action**: Modify existing file

**File**: `src/app/(dashboard)/settings/page.tsx`

**Tambahkan import** di bagian atas:
```typescript
import { PushSubscriptionButton } from "@/components/notifications/PushSubscriptionButton";
```

**Tambahkan section baru** (setelah existing settings sections):
```typescript
{/* Existing settings sections */}

{/* Push Notifications Section - ADD THIS */}
<Card>
  <CardHeader>
    <CardTitle>Push Notifications</CardTitle>
    <CardDescription>
      Manage browser push notifications for subscription reminders and alerts
    </CardDescription>
  </CardHeader>
  <CardContent>
    <PushSubscriptionButton />
  </CardContent>
</Card>
```

**Checklist**:
- [ ] Import PushSubscriptionButton ditambahkan
- [ ] Card section untuk push notifications ditambahkan
- [ ] File disimpan

---

### Step 2.6: Test Subscription Flow (Development)

**Perintah**:
```bash
npm run dev
```

**Cara Test**:

1. Buka browser: http://localhost:3000
2. Login ke aplikasi
3. Pergi ke Settings page
4. Lihat section "Push Notifications"
5. Klik tombol "Enable"
6. Browser akan muncul permission dialog
7. Klik "Allow"
8. Lihat apakah status berubah menjadi "✓ Push notifications are enabled"

**Verify di Database**:
```bash
npx prisma studio
```

- Buka table `PushSubscription`
- Lihat apakah ada record baru dengan:
  - userId: your user ID
  - endpoint: subscription endpoint
  - p256dh dan auth: encryption keys

**Checklist**:
- [ ] Settings page menampilkan PushSubscriptionButton
- [ ] Klik "Enable" muncul permission dialog
- [ ] Setelah allow, status berubah menjadi subscribed
- [ ] Record muncul di database PushSubscription
- [ ] Toast notification muncul "Push notifications enabled successfully"

---

### Step 2.7: Test Unsubscribe Flow

**Cara Test**:

1. Di Settings page, klik tombol "Disable"
2. Lihat apakah status berubah menjadi "Enable" lagi
3. Check database - record harus terhapus

**Checklist**:
- [ ] Klik "Disable" berhasil
- [ ] Status berubah kembali
- [ ] Record terhapus dari database
- [ ] Toast notification muncul

---

### Fase 2 Summary Checklist

- [ ] **Step 2.1**: Database schema updated
- [ ] **Step 2.2**: Migration created and applied
- [ ] **Step 2.3**: Push subscription actions created
- [ ] **Step 2.4**: PushSubscriptionButton component created
- [ ] **Step 2.5**: Component added to Settings page
- [ ] **Step 2.6**: Subscription flow tested
- [ ] **Step 2.7**: Unsubscribe flow tested

**Output Fase 2**:
- ✓ User dapat subscribe/unsubscribe push notifications
- ✓ Subscription tersimpan di database
- ✓ UI di Settings page berfungsi

**Next**: Lanjut ke Fase 3 - Push Sending Infrastructure

---

## Fase 3: Push Sending Infrastructure (Week 2, Hari 1-4)

**Tujuan**: Membuat backend service untuk mengirim push notifications

**Estimasi Waktu**: 3-4 hari

### Step 3.1: Create Push Service Library

**Lokasi**: `F:\Duely\Workspace\src\lib\push\push-service.ts`

**Action**: Create new file (buat folder `push` dulu)

**Perintah**:
```bash
mkdir src\lib\push
```

**File**: `src/lib/push/push-service.ts`

**Content**:
```typescript
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
  filters?: {
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
      body: 'This is a test push notification from Duely',
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
```

**Checklist**:
- [ ] Folder `src/lib/push` dibuat
- [ ] File `push-service.ts` dibuat
- [ ] Content lengkap di-copy
- [ ] File disimpan

---

### Step 3.2: Create Test Push API Endpoint

**Lokasi**: `F:\Duely\Workspace\src\app\api\push\test\route.ts`

**Action**: Create new file (buat folder structure dulu)

**Perintah**:
```bash
mkdir src\app\api\push
mkdir src\app\api\push\test
```

**File**: `src/app/api/push/test/route.ts`

**Content**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { sendTestPush } from '@/lib/push/push-service';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`Sending test push to user ${user.id}`);

    const success = await sendTestPush(user.id);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No active push subscriptions found',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Test push error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
```

**Checklist**:
- [ ] Folder `src/app/api/push/test` dibuat
- [ ] File `route.ts` dibuat
- [ ] Content di-copy
- [ ] File disimpan

---

### Step 3.3: Add Test Button to Settings

**Lokasi**: `F:\Duely\Workspace\src\components\notifications\PushSubscriptionButton.tsx`

**Action**: Modify existing component

**Tambahkan state dan function** setelah existing states:

```typescript
const [testing, setTesting] = useState(false);

async function handleTestNotification() {
  setTesting(true);

  try {
    const response = await fetch('/api/push/test', {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      toast({
        title: 'Test Sent!',
        description: 'Check your notifications',
      });
    } else {
      throw new Error(data.error || 'Failed to send test');
    }
  } catch (error) {
    console.error('Test notification error:', error);
    toast({
      title: 'Error',
      description: 'Failed to send test notification',
      variant: 'destructive',
    });
  } finally {
    setTesting(false);
  }
}
```

**Tambahkan test button** di bagian return (setelah status message):

```typescript
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
```

**Checklist**:
- [ ] State `testing` ditambahkan
- [ ] Function `handleTestNotification` ditambahkan
- [ ] Test button ditambahkan
- [ ] File disimpan

---

### Step 3.4: Test Push Notification Sending

**Perintah**:
```bash
npm run dev
```

**Cara Test**:

1. Buka http://localhost:3000
2. Login
3. Pergi ke Settings
4. Pastikan push notifications sudah enabled
5. Klik tombol "Send Test Notification"
6. **Lihat notification muncul** di:
   - Windows: Pojok kanan bawah (Windows Notification Center)
   - Mac: Pojok kanan atas
   - Chrome: Notification banner

**Checklist**:
- [ ] Tombol "Send Test Notification" muncul
- [ ] Klik tombol tidak error
- [ ] Notification muncul di OS notification center
- [ ] Notification berisi: "Test Notification" + body text
- [ ] Icon notification muncul
- [ ] Console log menunjukkan "Push sent to user..."

**Troubleshooting**:
- Jika tidak muncul, check Console log untuk errors
- Pastikan browser permission sudah "Allow"
- Pastikan VAPID keys benar di .env.local
- Check Chrome DevTools > Application > Service Workers (status harus active)

---

### Step 3.5: Integrate Push with Existing Notifications

**Lokasi**: `F:\Duely\Workspace\src\app\actions\notifications.ts`

**Action**: Modify existing file

**Tambahkan import** di bagian atas:
```typescript
import { sendPushToUser } from '@/lib/push/push-service';
```

**Modify function `createNotification`** (cari function ini dan update):

```typescript
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    // Create in-app notification (existing logic)
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });

    // NEW: Also send push notification
    try {
      await sendPushToUser(userId, {
        title,
        body: message,
        url: link || '/dashboard',
        notificationId: notification.id,
        tag: `notification-${notification.id}`,
      });
    } catch (pushError) {
      // Don't fail the whole operation if push fails
      console.error('Failed to send push notification:', pushError);
    }

    return { success: true, data: notification };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}
```

**Checklist**:
- [ ] Import sendPushToUser ditambahkan
- [ ] createNotification function diupdate
- [ ] Push notification logic ditambahkan dengan try-catch
- [ ] File disimpan

---

### Step 3.6: Test Integrated Notifications

**Cara Test** - Trigger notification melalui aplikasi:

**Option 1: Via Subscription Reminder**
1. Buat subscription baru dengan due date besok
2. Tunggu system cron job atau trigger manual
3. Lihat apakah push notification muncul

**Option 2: Manual Create Notification (Dev Console)**

Buka browser console di http://localhost:3000/dashboard:

```javascript
// Execute in browser console
fetch('/api/notifications/create-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    title: 'Payment Failed',
    message: 'Your Netflix payment has failed. Please update payment method.',
    type: 'payment_failed',
    link: '/subscriptions'
  })
}).then(r => r.json()).then(console.log)
```

**Untuk test ini, buat temporary API endpoint**:

**File**: `src/app/api/notifications/create-test/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { sendPushToUser } from '@/lib/push/push-service';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: body.type || 'info',
        title: body.title,
        message: body.message,
        link: body.link,
      },
    });

    await sendPushToUser(user.id, {
      title: body.title,
      body: body.message,
      url: body.link || '/dashboard',
      notificationId: notification.id,
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Create test notification error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**Checklist**:
- [ ] Test endpoint dibuat (optional, untuk testing)
- [ ] Push notification muncul setelah notification dibuat
- [ ] Notification muncul di in-app notification bell
- [ ] Push notification juga muncul di OS notification center
- [ ] Click notification membuka app di URL yang benar

---

### Fase 3 Summary Checklist

- [ ] **Step 3.1**: Push service library created
- [ ] **Step 3.2**: Test push API endpoint created
- [ ] **Step 3.3**: Test button added to Settings
- [ ] **Step 3.4**: Test push notification working
- [ ] **Step 3.5**: Push integrated with existing notifications
- [ ] **Step 3.6**: Integrated notifications tested

**Output Fase 3**:
- ✓ Backend dapat mengirim push notifications
- ✓ Push terintegrasi dengan sistem notification existing
- ✓ Test notification berfungsi

**Next**: Lanjut ke Fase 4 - Service Worker Notification Handling

---

## Fase 4: Service Worker Notification Handling (Week 2, Hari 5-7)

**Tujuan**: Improve service worker untuk handle notification click dan actions

**Estimasi Waktu**: 2-3 hari

### Step 4.1: Enhance Service Worker with Actions

**Lokasi**: `F:\Duely\Workspace\public\sw.js`

**Action**: Update existing file

**Update `push` event handler** dengan action buttons:

```javascript
// Replace the existing push event handler with this enhanced version
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
    timestamp: Date.now()
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
```

**Checklist**:
- [ ] Push event handler updated dengan actions
- [ ] Helper function `getDefaultActions` ditambahkan
- [ ] File disimpan

---

### Step 4.2: Improve Notification Click Handling

**Lokasi**: `F:\Duely\Workspace\public\sw.js` (lanjutan)

**Sudah OK dari Fase 1** - pastikan notificationclick handler sudah handle:
- ✓ Action buttons (mark-read, view)
- ✓ Focus existing window jika app sudah open
- ✓ Open new window jika app belum open
- ✓ Navigate to correct URL

**Checklist**:
- [ ] Notification click handler sudah complete
- [ ] Mark as read action working
- [ ] View action opens correct URL

---

### Step 4.3: Add Mark as Read API Endpoint

**Lokasi**: `F:\Duely\Workspace\src\app\api\notifications\[id]\read\route.ts`

**Action**: Create new file

**Perintah**:
```bash
mkdir "src\app\api\notifications\[id]"
mkdir "src\app\api\notifications\[id]\read"
```

**File**: `src/app/api/notifications/[id]/read/route.ts`

**Content**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notificationId = params.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Mark as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}
```

**Checklist**:
- [ ] Folder structure dibuat
- [ ] File route.ts dibuat
- [ ] Content lengkap
- [ ] File disimpan

---

### Step 4.4: Test Notification Actions

**Perintah**:
```bash
npm run dev
```

**Cara Test**:

1. Send test notification (dari Settings)
2. Lihat notification muncul dengan action buttons:
   - "View"
   - "Mark as Read"
3. Test "Mark as Read":
   - Klik "Mark as Read"
   - Check database - notification harus marked as read
   - Notification hilang dari list
4. Test "View":
   - Klik "View"
   - App harus open/focus ke dashboard

**Checklist**:
- [ ] Notification muncul dengan action buttons
- [ ] "Mark as Read" button bekerja
- [ ] "View" button membuka app
- [ ] Database update correct

**Note**: Action buttons mungkin tidak muncul di semua browser/OS:
- ✓ Chrome Windows/Mac/Android - Full support
- ✓ Firefox - Limited support
- ✓ Safari - No action buttons (iOS limitation)

---

### Step 4.5: Add Notification Sounds and Vibration

**Lokasi**: `F:\Duely\Workspace\public\sw.js`

**Action**: Already implemented in Step 4.1

**Verify** bahwa options include:
```javascript
vibrate: [200, 100, 200],  // Vibrate pattern for mobile
```

**Optional: Add custom sound** (browser limitations apply):

Notification sounds are controlled by OS, but you can add `silent: false`:

```javascript
const options = {
  // ... existing options ...
  silent: false,  // Use system notification sound
};
```

**Checklist**:
- [ ] Vibration pattern ada di notification options
- [ ] Silent: false untuk enable sound

---

### Step 4.6: Test on Mobile Device

**Setup**:

1. Deploy ke server development atau use ngrok untuk local testing
2. Atau test langsung di production setelah deployment

**Test di Android Chrome**:

1. Buka https://duely.online di Chrome Android
2. Login
3. Enable push notifications di Settings
4. Send test notification
5. **Lock phone**
6. Lihat notification muncul di notification tray
7. Tap notification - app harus open

**Test di iOS Safari** (iOS 16.4+):

1. Buka https://duely.online di Safari iOS
2. Login
3. Enable push notifications
4. Send test notification
5. Notification harus muncul

**Checklist**:
- [ ] Android: Notification muncul di tray
- [ ] Android: Tap notification opens app
- [ ] Android: Vibration works
- [ ] iOS: Notification muncul (iOS 16.4+)
- [ ] iOS: Tap notification opens app

---

### Fase 4 Summary Checklist

- [ ] **Step 4.1**: Service worker enhanced dengan actions
- [ ] **Step 4.2**: Notification click handling improved
- [ ] **Step 4.3**: Mark as read API endpoint created
- [ ] **Step 4.4**: Notification actions tested
- [ ] **Step 4.5**: Sound and vibration configured
- [ ] **Step 4.6**: Mobile testing completed

**Output Fase 4**:
- ✓ Notification dengan action buttons
- ✓ Click notification membuka app dengan benar
- ✓ Mark as read dari notification bekerja
- ✓ Mobile compatibility verified

**Next**: Lanjut ke Fase 5 - User Experience & Polish

---

## Fase 5: User Experience & Polish (Week 3, Hari 1-3)

**Tujuan**: Polish UI/UX dan add advanced features

**Estimasi Waktu**: 2-3 hari

### Step 5.1: Create Notification Preferences Component

**Lokasi**: `F:\Duely\Workspace\src\components\notifications\NotificationPreferences.tsx`

**Action**: Create new file

**File**: `src/components/notifications/NotificationPreferences.tsx`

**Content**:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type NotificationPreference = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'subscription_due',
      label: 'Subscription Reminders',
      description: 'Get notified 3 days before subscription is due',
      enabled: true,
    },
    {
      id: 'payment_failed',
      label: 'Payment Alerts',
      description: 'Immediate notification when payment fails',
      enabled: true,
    },
    {
      id: 'subscription_renewed',
      label: 'Renewal Confirmations',
      description: 'Notification when subscription renews successfully',
      enabled: true,
    },
    {
      id: 'weekly_digest',
      label: 'Weekly Digest',
      description: 'Summary of your subscriptions every week',
      enabled: false,
    },
    {
      id: 'price_changes',
      label: 'Price Change Alerts',
      description: 'Get notified when subscription prices change',
      enabled: true,
    },
  ]);

  const handleToggle = (id: string) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );

    // TODO: Save to backend
    console.log(`Toggled preference: ${id}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Choose which notifications you want to receive
        </p>
      </div>

      <div className="space-y-4">
        {preferences.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between space-x-4 rounded-lg border p-4"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor={pref.id} className="cursor-pointer">
                {pref.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {pref.description}
              </p>
            </div>
            <Switch
              id={pref.id}
              checked={pref.enabled}
              onCheckedChange={() => handleToggle(pref.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Checklist**:
- [ ] File created
- [ ] Component code complete
- [ ] File saved

---

### Step 5.2: Add Preferences to Settings Page

**Lokasi**: `F:\Duely\Workspace\src\app\(dashboard)\settings\page.tsx`

**Action**: Modify existing file

**Tambahkan import**:
```typescript
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
```

**Tambahkan section** (setelah PushSubscriptionButton card):

```typescript
{/* Push Notifications Card (existing) */}
<Card>
  <CardHeader>
    <CardTitle>Push Notifications</CardTitle>
    <CardDescription>
      Manage browser push notifications for subscription reminders and alerts
    </CardDescription>
  </CardHeader>
  <CardContent>
    <PushSubscriptionButton />
  </CardContent>
</Card>

{/* Notification Preferences Card (NEW) */}
<Card>
  <CardHeader>
    <CardTitle>Notification Types</CardTitle>
    <CardDescription>
      Select which types of notifications you want to receive
    </CardDescription>
  </CardHeader>
  <CardContent>
    <NotificationPreferences />
  </CardContent>
</Card>
```

**Checklist**:
- [ ] Import added
- [ ] Card section added
- [ ] File saved

---

### Step 5.3: Create Device Management Component

**Lokasi**: `F:\Duely\Workspace\src\components\notifications\PushDeviceManager.tsx`

**Action**: Create new file

**File**: `src/components/notifications/PushDeviceManager.tsx`

**Content**:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Smartphone, Monitor, Loader2 } from 'lucide-react';
import { getUserPushSubscriptions, deletePushSubscription } from '@/app/actions/push-subscriptions';
import { useToast } from '@/hooks/use-toast';

type Subscription = {
  id: string;
  endpoint: string;
  userAgent: string | null;
  createdAt: Date;
};

export function PushDeviceManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    setLoading(true);
    try {
      const result = await getUserPushSubscriptions();
      if (result.success && result.data) {
        setSubscriptions(result.data);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const result = await deletePushSubscription(id);
      if (result.success) {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
        toast({
          title: 'Device Removed',
          description: 'Push subscription removed successfully',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove device',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  }

  function getDeviceIcon(userAgent: string | null) {
    if (!userAgent) return <Monitor className="h-5 w-5" />;

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  }

  function getDeviceName(userAgent: string | null) {
    if (!userAgent) return 'Unknown Device';

    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome Browser';
    if (ua.includes('firefox')) return 'Firefox Browser';
    if (ua.includes('safari')) return 'Safari Browser';
    if (ua.includes('edge')) return 'Edge Browser';
    return 'Web Browser';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No devices subscribed to push notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Subscribed Devices</h3>
        <p className="text-sm text-muted-foreground">
          Manage devices receiving push notifications
        </p>
      </div>

      <div className="space-y-2">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              {getDeviceIcon(sub.userAgent)}
              <div>
                <p className="font-medium">{getDeviceName(sub.userAgent)}</p>
                <p className="text-sm text-muted-foreground">
                  Added {new Date(sub.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(sub.id)}
              disabled={deleting === sub.id}
            >
              {deleting === sub.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Checklist**:
- [ ] File created
- [ ] Component code complete
- [ ] File saved

---

### Step 5.4: Add Device Manager to Settings

**Lokasi**: `F:\Duely\Workspace\src\app\(dashboard)\settings\page.tsx`

**Tambahkan import**:
```typescript
import { PushDeviceManager } from "@/components/notifications/PushDeviceManager";
```

**Tambahkan card** (setelah notification preferences):

```typescript
{/* Device Manager Card (NEW) */}
<Card>
  <CardHeader>
    <CardTitle>Subscribed Devices</CardTitle>
    <CardDescription>
      View and manage devices receiving push notifications
    </CardDescription>
  </CardHeader>
  <CardContent>
    <PushDeviceManager />
  </CardContent>
</Card>
```

**Checklist**:
- [ ] Import added
- [ ] Card added
- [ ] File saved

---

### Step 5.5: Add Onboarding/Info Dialog

**Lokasi**: `F:\Duely\Workspace\src\components\notifications\PushOnboarding.tsx`

**Action**: Create new file

**File**: `src/components/notifications/PushOnboarding.tsx`

**Content**:
```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Smartphone, Clock, Shield } from 'lucide-react';

export function PushOnboarding({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enable Push Notifications</DialogTitle>
          <DialogDescription>
            Stay updated with important subscription reminders and alerts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Never Miss a Payment</p>
              <p className="text-sm text-muted-foreground">
                Get notified 3 days before your subscription is due
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Works Everywhere</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications even when the app is closed
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Real-time Alerts</p>
              <p className="text-sm text-muted-foreground">
                Instant notifications for failed payments and price changes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Privacy First</p>
              <p className="text-sm text-muted-foreground">
                You can disable notifications anytime from Settings
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Checklist**:
- [ ] File created
- [ ] Dialog component complete
- [ ] File saved

---

### Step 5.6: Test Complete Settings UI

**Perintah**:
```bash
npm run dev
```

**Cara Test**:

1. Buka http://localhost:3000/settings
2. Scroll ke notification section
3. Verify UI components:
   - [ ] Push Notifications enable/disable
   - [ ] Test Notification button
   - [ ] Notification Preferences dengan switches
   - [ ] Subscribed Devices list
   - [ ] All components responsive (test di mobile width)

**Checklist**:
- [ ] All components muncul dengan benar
- [ ] Layout rapi dan consistent
- [ ] Responsive di mobile view
- [ ] No visual bugs atau overlap
- [ ] All interactions working

---

### Fase 5 Summary Checklist

- [ ] **Step 5.1**: Notification preferences component created
- [ ] **Step 5.2**: Preferences added to settings page
- [ ] **Step 5.3**: Device manager component created
- [ ] **Step 5.4**: Device manager added to settings
- [ ] **Step 5.5**: Onboarding dialog created
- [ ] **Step 5.6**: Complete settings UI tested

**Output Fase 5**:
- ✓ Comprehensive notification settings UI
- ✓ User can manage notification types
- ✓ User can see and remove subscribed devices
- ✓ Polished user experience

**Next**: Lanjut ke Fase 6 - Production Deployment

---

## Fase 6: Production Deployment (Week 3, Hari 4-7)

**Tujuan**: Deploy push notifications ke production server (Hostinger)

**Estimasi Waktu**: 3-4 hari

### Step 6.1: Add VAPID Keys to Production Environment

**Lokasi**: Hostinger Control Panel

**Login ke Hostinger**:
1. Go to hpanel.hostinger.com
2. Login dengan account Anda
3. Pilih domain duely.online

**Add Environment Variables**:

**Path**: Advanced → Environment Variables (atau via SSH)

**Via Hostinger Panel**:
1. Click Advanced → Environment Variables
2. Add the following variables:

```env
VAPID_PUBLIC_KEY=BKxxx...xxx
VAPID_PRIVATE_KEY=xxx...xxx
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKxxx...xxx
```

**Via SSH** (alternative):

```bash
# SSH to server
ssh duely@srv1107423.hstgr.cloud

# Edit .env file
cd ~/duely
nano .env

# Add VAPID keys
VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"

# Save (Ctrl+O, Enter, Ctrl+X)
```

**Checklist**:
- [ ] VAPID_PUBLIC_KEY added to production env
- [ ] VAPID_PRIVATE_KEY added to production env
- [ ] NEXT_PUBLIC_VAPID_PUBLIC_KEY added to production env
- [ ] Keys match development keys (atau generate new untuk production)

---

### Step 6.2: Update .gitignore

**Lokasi**: `F:\Duely\Workspace\.gitignore`

**Verify** bahwa .env files tidak ter-commit:

```gitignore
# env files
.env
.env.local
.env.production
.env*.local

# Service worker logs
sw-debug.log
```

**Checklist**:
- [ ] .env.local di .gitignore
- [ ] Verify tidak ada VAPID keys di Git history

---

### Step 6.3: Run Database Migration in Production

**SSH ke Server**:
```bash
ssh duely@srv1107423.hstgr.cloud
cd ~/duely
```

**Run Migration**:
```bash
# Pull latest code first
git pull origin main

# Install any new dependencies
npm install

# Run migration
npx prisma migrate deploy
```

**Verify Migration**:
```bash
npx prisma studio
```

**Checklist**:
- [ ] SSH connection successful
- [ ] Latest code pulled
- [ ] Migration successful
- [ ] Table `push_subscriptions` exists in production database
- [ ] No migration errors

---

### Step 6.4: Update Nginx Configuration for Service Worker

**Lokasi**: Hostinger Server `/etc/nginx/sites-available/duely.online`

**SSH to Server**:
```bash
ssh duely@srv1107423.hstgr.cloud
sudo nano /etc/nginx/sites-available/duely.online
```

**Add atau update** service worker cache headers:

```nginx
server {
    # ... existing config ...

    # Service Worker - MUST not be cached
    location /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header Service-Worker-Allowed "/";

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Notification icons - can be cached
    location /icons/ {
        add_header Cache-Control "public, max-age=31536000, immutable";

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # ... rest of config ...
}
```

**Test dan Reload Nginx**:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Checklist**:
- [ ] Nginx config updated
- [ ] nginx -t test passed
- [ ] Nginx reloaded successfully
- [ ] No errors in nginx logs

---

### Step 6.5: Build and Deploy to Production

**Local Development**:

**Commit changes**:
```bash
cd F:\Duely\Workspace

git add .
git commit -m "Add push notification system

- Added service worker for push notifications
- Added VAPID authentication
- Created push subscription management
- Added notification preferences UI
- Integrated with existing notification system

🤖 Generated with Claude Code"

git push origin main
```

**On Production Server**:
```bash
ssh duely@srv1107423.hstgr.cloud
cd ~/duely

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart PM2
pm2 restart duely
pm2 save

# Check status
pm2 status
pm2 logs duely --lines 50
```

**Checklist**:
- [ ] Code pushed to Git
- [ ] Code pulled on production
- [ ] npm install completed
- [ ] Build successful (no errors)
- [ ] PM2 restarted
- [ ] PM2 logs show no errors

---

### Step 6.6: Test on Production

**Buka Browser**: https://duely.online

**Test Flow**:

1. **Service Worker Registration**:
   - Buka Chrome DevTools (F12)
   - Tab Application > Service Workers
   - Verify service worker registered untuk duely.online
   - Status: "activated and is running"

2. **Enable Push Notifications**:
   - Login ke account
   - Go to Settings
   - Scroll ke Push Notifications section
   - Click "Enable"
   - Allow permission
   - Verify status: "✓ Push notifications are enabled"

3. **Test Notification**:
   - Click "Send Test Notification"
   - Notification harus muncul di OS notification center
   - Click notification - harus open duely.online/dashboard

4. **Test on Mobile**:
   - Buka https://duely.online di mobile browser
   - Login
   - Enable push notifications
   - Send test notification
   - Lock phone
   - Notification muncul di notification tray

**Checklist**:
- [ ] Service worker active on production
- [ ] Can enable push notifications
- [ ] Subscription saved to production database
- [ ] Test notification delivers successfully
- [ ] Notification appears in OS notification center
- [ ] Click notification opens app
- [ ] Mobile testing successful (Android/iOS)

---

### Step 6.7: Monitor and Verify

**Check PM2 Logs**:
```bash
ssh duely@srv1107423.hstgr.cloud
pm2 logs duely --lines 100
```

**Look for**:
- ✓ "Service Worker registered"
- ✓ "Push sent to user..."
- ✗ No errors related to VAPID or push

**Check Database**:
```bash
npx prisma studio
```

- Open PushSubscription table
- Verify subscriptions are being created
- Check user associations

**Checklist**:
- [ ] No errors in PM2 logs
- [ ] Push subscriptions in database
- [ ] Notifications being sent successfully
- [ ] No VAPID errors
- [ ] No service worker errors

---

### Step 6.8: Update Documentation

**Lokasi**: `F:\Duely\Workspace\COMPLETE_DEPLOYMENT_GUIDE.md`

**Add section** untuk Push Notifications:

**Tambahkan di Environment Variables section**:

```markdown
# ===========================================
# PUSH NOTIFICATIONS
# ===========================================
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"  # Same as VAPID_PUBLIC_KEY

# Generate VAPID keys with:
# npx web-push generate-vapid-keys
```

**Tambahkan di Deployment Steps**:

```markdown
## Push Notifications Setup

### Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

### Add to Environment Variables
1. Add VAPID keys to Hostinger environment variables
2. Or add to .env file on server (never commit to Git!)

### Nginx Configuration
Ensure service worker has correct cache headers (see nginx config)

### Test Push Notifications
1. Visit https://duely.online/settings
2. Enable push notifications
3. Send test notification
4. Verify delivery
```

**Checklist**:
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Deployment steps added
- [ ] Troubleshooting section added

---

### Fase 6 Summary Checklist

- [ ] **Step 6.1**: VAPID keys added to production
- [ ] **Step 6.2**: .gitignore verified
- [ ] **Step 6.3**: Database migration run in production
- [ ] **Step 6.4**: Nginx configured for service worker
- [ ] **Step 6.5**: Code built and deployed
- [ ] **Step 6.6**: Production testing successful
- [ ] **Step 6.7**: Monitoring verified
- [ ] **Step 6.8**: Documentation updated

**Output Fase 6**:
- ✓ Push notifications live in production
- ✓ Service worker working on https://duely.online
- ✓ Users can subscribe and receive notifications
- ✓ Mobile notifications working
- ✓ Monitoring in place

**🎉 IMPLEMENTATION COMPLETE! 🎉**

---

## Testing Checklist

### Development Testing

- [ ] Service worker registers successfully
- [ ] Push subscription works
- [ ] Push unsubscription works
- [ ] Test notification sends
- [ ] Notification appears in notification center
- [ ] Notification click opens app
- [ ] Action buttons work (if supported)
- [ ] Multiple devices can subscribe
- [ ] Expired subscriptions cleaned up

### Cross-Browser Testing

- [ ] Chrome (Windows)
- [ ] Chrome (Mac)
- [ ] Firefox (Windows)
- [ ] Firefox (Mac)
- [ ] Safari (Mac - 16+)
- [ ] Edge (Windows)

### Mobile Testing

- [ ] Chrome Android
- [ ] Firefox Android
- [ ] Safari iOS (16.4+)
- [ ] Samsung Internet

### Production Testing

- [ ] HTTPS working
- [ ] Service worker active on production domain
- [ ] VAPID keys configured correctly
- [ ] Database migration successful
- [ ] Push notifications deliver
- [ ] No console errors
- [ ] PM2 logs clean
- [ ] Mobile notifications working

### Integration Testing

- [ ] Subscription reminder triggers push
- [ ] Payment failed triggers push
- [ ] In-app notification + push both sent
- [ ] Mark as read syncs between in-app and push
- [ ] Notification preferences respected

---

## Troubleshooting

### Issue: Service Worker Not Registering

**Symptoms**: Service worker tidak muncul di DevTools

**Solutions**:
1. Check HTTPS - service workers require HTTPS (except localhost)
2. Check file path - `public/sw.js` harus accessible di `/sw.js`
3. Clear cache and hard reload (Ctrl+Shift+R)
4. Check console for errors

### Issue: Push Permission Blocked

**Symptoms**: Notification.permission === 'denied'

**Solutions**:
1. User harus manually enable di browser settings
2. Chrome: Settings > Privacy > Site Settings > Notifications
3. Firefox: Preferences > Privacy > Permissions > Notifications
4. Provide instructions to user

### Issue: Push Not Delivering

**Symptoms**: No notification muncul setelah send

**Solutions**:
1. Check VAPID keys benar di .env
2. Check service worker active (DevTools > Application)
3. Check subscription di database (endpoint, p256dh, auth)
4. Check PM2 logs untuk errors
5. Verify Notification.permission === 'granted'

### Issue: VAPID Authentication Error

**Symptoms**: "UnauthorizedRegistration" atau similar

**Solutions**:
1. Verify VAPID_PUBLIC_KEY match di client dan server
2. Regenerate VAPID keys jika perlu
3. Ensure NEXT_PUBLIC_VAPID_PUBLIC_KEY exposed to client
4. Check tidak ada typo atau extra spaces

### Issue: Notification Click Not Working

**Symptoms**: Click notification tidak open app

**Solutions**:
1. Check notificationclick handler di sw.js
2. Verify URL correct (https://duely.online/...)
3. Test dengan different browsers
4. Check clients.openWindow supported

### Issue: Database Migration Failed

**Symptoms**: Prisma migration errors

**Solutions**:
```bash
# Reset if needed (DEVELOPMENT ONLY!)
npx prisma migrate reset

# Or fix manually
npx prisma db push

# Regenerate client
npx prisma generate
```

### Issue: Icons Not Showing

**Symptoms**: Notification muncul tanpa icon

**Solutions**:
1. Verify icons exist di `public/icons/`
2. Check icon paths di payload
3. Use full URL for production (https://duely.online/icons/...)
4. Verify icon size (192x192 minimum)

---

## Completion Criteria

### Must-Have Features ✓

- [x] Service worker implemented dan registered
- [x] VAPID authentication configured
- [x] Push subscription management (subscribe/unsubscribe)
- [x] Push notification sending service
- [x] Integration dengan existing notifications
- [x] Settings UI for enable/disable
- [x] Test notification functionality
- [x] Production deployment
- [x] Mobile browser support
- [x] Documentation updated

### Nice-to-Have Features (Optional)

- [ ] Notification preferences (select types)
- [ ] Device management UI
- [ ] Quiet hours configuration
- [ ] Notification history
- [ ] Rich notifications with images
- [ ] Notification grouping

### Success Metrics

- [ ] >50% of users enable push notifications
- [ ] >95% delivery success rate
- [ ] <5% unsubscribe rate
- [ ] No critical errors in production logs
- [ ] Positive user feedback

---

## Next Steps After Implementation

1. **Monitor Metrics**:
   - Track subscription rate
   - Monitor delivery success rate
   - Watch for errors in logs

2. **Gather User Feedback**:
   - Survey users about notification usefulness
   - Adjust notification frequency if needed
   - Add requested notification types

3. **Optimize**:
   - A/B test notification copy
   - Optimize notification timing
   - Improve notification CTR

4. **Expand**:
   - Add more notification types
   - Implement notification grouping
   - Add rich notifications with images

---

## Support & Resources

**Documentation**:
- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push Library](https://github.com/web-push-libs/web-push)

**Testing Tools**:
- Chrome DevTools - Application > Service Workers
- Chrome DevTools - Application > Push Messaging
- [Notification Generator](https://tests.peter.sh/notification-generator/)

**Issues & Help**:
- Check PM2 logs: `pm2 logs duely`
- Check browser console for errors
- Verify VAPID keys configuration
- Test on different browsers/devices

---

**Good luck dengan implementation! 🚀**
