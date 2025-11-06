# 🏗️ Admin Panel Architecture - Duely

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
│                    https://duely.online                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS (Port 443)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX REVERSE PROXY                          │
│                    (VPS: 72.60.107.246)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Route: /                  → Next.js App (Port 3000)            │
│  Route: /dashboard         → Next.js App (Port 3000)            │
│  Route: /auth              → Next.js App (Port 3000)            │
│                                                                   │
│  🆕 Route: /admin          → Next.js App (Port 3000)            │
│                              + Admin Auth Middleware             │
│                                                                   │
│  🆕 Route: /admin/database → Prisma Studio (Port 5555)          │
│                              + Auth Check via API                │
│                              + IP Whitelist (optional)           │
│                                                                   │
└─────────────────┬──────────────────────────┬────────────────────┘
                  │                          │
                  │                          │
                  ▼                          ▼
┌──────────────────────────────┐  ┌───────────────────────────────┐
│    NEXT.JS APP (PM2)         │  │   PRISMA STUDIO (PM2)        │
│       Port: 3000             │  │      Port: 5555               │
│                              │  │   (Internal Only)             │
│  ┌────────────────────────┐  │  │                               │
│  │  USER ROUTES           │  │  │  Features:                    │
│  │  • Dashboard           │  │  │  • Browse all tables         │
│  │  • Subscriptions       │  │  │  • Edit records              │
│  │  • Analytics           │  │  │  • Run queries               │
│  │  • Settings            │  │  │  • Export data               │
│  └────────────────────────┘  │  │                               │
│                              │  └───────────────────────────────┘
│  🆕 ┌─────────────────────┐  │
│     │  ADMIN ROUTES       │  │
│     │  • /admin           │  │
│     │  • /admin/users     │  │
│     │  • /admin/analytics │  │
│     │  • /admin/payments  │  │
│     └─────────────────────┘  │
│                              │
│  🆕 ┌─────────────────────┐  │
│     │  ADMIN API          │  │
│     │  • /api/admin/stats │  │
│     │  • /api/admin/users │  │
│     │  • /api/admin/auth  │  │
│     └─────────────────────┘  │
└──────────────┬───────────────┘
               │
               │ Prisma Client
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MySQL DATABASE                             │
│                    (Port: 3306, localhost)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tables:                                                         │
│  • User (with 🆕 role field)                                    │
│  • Subscription                                                  │
│  • Category                                                      │
│  • Member                                                        │
│  • Notification                                                  │
│  • UserSettings                                                  │
│  • Payment                                                       │
│  • SubscriptionHistory                                          │
│  • ExchangeRate                                                  │
│  • PushSubscription                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Admin Authentication Flow

```
┌──────────────┐
│  Admin User  │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. Navigate to /admin
       ▼
┌──────────────────────────────────────┐
│  Next.js Middleware                   │
│  (src/middleware.ts)                  │
├──────────────────────────────────────┤
│  • Check if path starts with /admin  │
│  • Validate session exists           │
│  • Check user role from database     │
└──────┬───────────────┬───────────────┘
       │               │
       │ Not Admin     │ Is Admin
       ▼               ▼
┌──────────────┐  ┌────────────────────┐
│  Redirect    │  │  Allow Access      │
│  to /auth    │  │  to Admin Panel    │
└──────────────┘  └────────────────────┘
```

### Detailed Auth Check Process

```javascript
// 1. User visits /admin
GET /admin

// 2. Middleware intercepts
middleware.ts
  ↓
  getServerSession()
  ↓
  session exists? → NO → Redirect to /auth/login
  ↓ YES
  ↓
  Query database:
  SELECT role FROM User WHERE email = session.user.email
  ↓
  role === 'admin'? → NO → Show 403 Forbidden
  ↓ YES
  ↓
  Continue to admin page ✅
```

---

## Admin Panel Page Structure

```
src/app/
│
├── (public)/              # Public routes
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   └── ...
│
├── (dashboard)/           # User dashboard (existing)
│   ├── layout.tsx
│   ├── dashboard/
│   ├── subscriptions/
│   ├── analytics/
│   └── settings/
│
└── 🆕 (admin)/           # NEW: Admin panel
    ├── layout.tsx         # Admin-specific layout with sidebar
    │
    ├── admin/             # Admin routes
    │   ├── page.tsx                    # Dashboard overview
    │   │
    │   ├── users/
    │   │   ├── page.tsx                # User list with filters
    │   │   ├── [id]/
    │   │   │   └── page.tsx            # User details
    │   │   └── components/
    │   │       ├── UserTable.tsx
    │   │       ├── UserFilters.tsx
    │   │       └── UserActions.tsx
    │   │
    │   ├── analytics/
    │   │   ├── page.tsx                # Charts & reports
    │   │   └── components/
    │   │       ├── GrowthChart.tsx
    │   │       ├── RevenueChart.tsx
    │   │       └── PlanDistribution.tsx
    │   │
    │   ├── database/
    │   │   └── page.tsx                # Prisma Studio iframe
    │   │
    │   ├── payments/
    │   │   ├── page.tsx                # Payment transactions
    │   │   └── [id]/
    │   │       └── page.tsx            # Payment details
    │   │
    │   ├── subscriptions/
    │   │   └── page.tsx                # All user subscriptions
    │   │
    │   └── settings/
    │       └── page.tsx                # Admin settings
    │
    └── api/
        └── admin/
            ├── stats/
            │   └── route.ts            # GET dashboard stats
            ├── users/
            │   ├── route.ts            # GET/POST users
            │   └── [id]/
            │       └── route.ts        # GET/PUT/DELETE user
            ├── auth-check/
            │   └── route.ts            # Validate admin session
            └── database/
                └── proxy/
                    └── route.ts        # Proxy to Prisma Studio
```

---

## Admin Layout Structure

```typescript
// src/app/(admin)/layout.tsx

┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  ┌──────────────────┐  ┌──────────┐  ┌────────────────┐   │
│  │  🛡️ Admin Panel  │  │  Search  │  │  stevenoklizz  │   │
│  └──────────────────┘  └──────────┘  └────────────────┘   │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Sidebar     │  Main Content                               │
│              │                                              │
│  📊 Dashboard│  ┌────────────────────────────────────────┐ │
│  👥 Users    │  │                                        │ │
│  📈 Analytics│  │                                        │ │
│  💰 Payments │  │         Page Content Here              │ │
│  🗄️ Database │  │                                        │ │
│  ⚙️ Settings │  │                                        │ │
│              │  └────────────────────────────────────────┘ │
│              │                                              │
│  📝 Logs     │                                              │
│  🚪 Logout   │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

## Database Schema Changes

### Before (Current)
```prisma
model User {
  id       String  @id @default(cuid())
  email    String  @unique
  name     String?
  // ... other fields
}
```

### After (With Admin Support)
```prisma
model User {
  id       String  @id @default(cuid())
  email    String  @unique
  name     String?
  🆕 role  String  @default("user") // "user", "admin", "superadmin"
  // ... other fields

  @@index([role]) // 🆕 Index for faster admin queries
}
```

### Migration SQL
```sql
-- Add role column
ALTER TABLE User
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Add index for performance
CREATE INDEX User_role_idx ON User(role);

-- Set stevenoklizz@gmail.com as admin
UPDATE User
SET role = 'admin'
WHERE email = 'stevenoklizz@gmail.com';
```

---

## Admin Dashboard Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│  🛡️ Admin Dashboard                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Overview Cards                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 👥 Users     │  │ 💎 Premium   │  │ 💰 Revenue   │     │
│  │              │  │              │  │              │     │
│  │   1,234      │  │     234      │  │  $12,345     │     │
│  │   +12% ↗     │  │    +5% ↗     │  │   +8% ↗      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 📊 Subs      │  │ 🔔 Notifs    │  │ 📱 Push      │     │
│  │              │  │              │  │              │     │
│  │   5,678      │  │   12,345     │  │    567       │     │
│  │   +23% ↗     │  │   +15% ↗     │  │   +45% ↗     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Charts                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────┐│
│  │ User Growth (30 days)      │  │ Plan Distribution      ││
│  │                            │  │                        ││
│  │     ▂▃▅▆▇█                │  │   Free:  1000 (81%)   ││
│  │   ▁▂▃▄▅▆▇█                │  │   Pro:    200 (16%)   ││
│  │  ▁▂▃▄▅▆▇█                 │  │   Biz:     34 (3%)    ││
│  │                            │  │                        ││
│  └────────────────────────────┘  └────────────────────────┘│
│                                                              │
│  Recent Activity                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • john@example.com registered (Pro)        2m ago    │  │
│  │ • jane@example.com upgraded to Business    5m ago    │  │
│  │ • Payment received: $99 from bob@...      12m ago    │  │
│  │ • New subscription added by alice@...     15m ago    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Admin Statistics
```
GET /api/admin/stats

Response:
{
  "totalUsers": 1234,
  "activeUsers": 890,
  "premiumUsers": 234,
  "totalRevenue": 12345.67,
  "totalSubscriptions": 5678,
  "usersByPlan": {
    "free": 1000,
    "pro": 200,
    "business": 34
  },
  "growth": {
    "users": "+12%",
    "revenue": "+8%",
    "premium": "+5%"
  },
  "recentRegistrations": [...]
}
```

### User Management
```
GET /api/admin/users?page=1&limit=50&search=john&plan=pro

Response:
{
  "users": [
    {
      "id": "clx123",
      "email": "john@example.com",
      "name": "John Doe",
      "plan": "pro",
      "status": "active",
      "createdAt": "2025-01-15",
      "subscriptionsCount": 12,
      "lastActive": "2025-11-06"
    },
    ...
  ],
  "total": 234,
  "page": 1,
  "totalPages": 5
}
```

### User Details
```
GET /api/admin/users/[userId]

Response:
{
  "user": {
    "id": "clx123",
    "email": "john@example.com",
    "name": "John Doe",
    "plan": "pro",
    "status": "active",
    "createdAt": "2025-01-15",
    "subscriptions": [...],
    "payments": [...],
    "categories": [...],
    "settings": {...}
  }
}
```

### Admin Auth Check
```
GET /api/admin/auth-check

Response:
{
  "isAdmin": true,
  "email": "stevenoklizz@gmail.com",
  "name": "Admin"
}

Or:
{
  "isAdmin": false,
  "error": "Unauthorized"
}
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: HTTPS/SSL                                          │
│  • All traffic encrypted                                     │
│  • Let's Encrypt certificate                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Nginx                                              │
│  • Rate limiting (100 req/min per IP)                       │
│  • IP whitelist (optional)                                   │
│  • DDoS protection                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Next.js Middleware                                 │
│  • Session validation                                        │
│  • Check user authenticated                                  │
│  • Redirect if not logged in                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Admin Role Check                                   │
│  • Query database for user role                              │
│  • Verify role === 'admin'                                   │
│  • Return 403 if not admin                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 5: API Route Protection                               │
│  • Each admin API checks role again                          │
│  • Validate request parameters                               │
│  • Sanitize inputs                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 6: Audit Logging                                      │
│  • Log all admin actions                                     │
│  • Track IP, timestamp, action                               │
│  • Alert on suspicious activity                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Prisma Studio Integration

### Option A: Reverse Proxy (Recommended)

```nginx
# /etc/nginx/sites-available/duely.online

location /admin/database {
    # First check if user is admin via internal auth endpoint
    auth_request /api/admin/auth-check;

    # If auth succeeds, proxy to Prisma Studio
    proxy_pass http://127.0.0.1:5555;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;

    # Security headers
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### PM2 Configuration

```javascript
// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'duely',
      script: 'npm',
      args: 'start',
      cwd: '/home/duely/duely',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'prisma-studio',
      script: 'npx',
      args: 'prisma studio --port 5555 --hostname 127.0.0.1',
      cwd: '/home/duely/duely',
      env: {
        DATABASE_URL: process.env.DATABASE_URL
      }
    }
  ]
};
```

### Accessing Prisma Studio

```
User Flow:
1. Login as admin (stevenoklizz@gmail.com)
2. Navigate to /admin/database
3. Admin middleware checks session
4. Nginx checks admin auth via /api/admin/auth-check
5. If authorized, show Prisma Studio in iframe/redirect
6. Full database access with Prisma Studio UI
```

---

## Performance Considerations

### Caching Strategy

```typescript
// Cache admin stats for 5 minutes
import { unstable_cache } from 'next/cache';

export const getAdminStats = unstable_cache(
  async () => {
    // Expensive queries here
    return stats;
  },
  ['admin-stats'],
  { revalidate: 300 } // 5 minutes
);
```

### Database Indexing

```sql
-- Add indexes for faster admin queries
CREATE INDEX User_createdAt_idx ON User(createdAt);
CREATE INDEX User_subscriptionPlan_idx ON User(subscriptionPlan);
CREATE INDEX Payment_status_idx ON Payment(status);
CREATE INDEX Payment_createdAt_idx ON Payment(createdAt);
```

### Pagination

```typescript
// Always paginate large datasets
const ITEMS_PER_PAGE = 50;

const users = await prisma.user.findMany({
  skip: (page - 1) * ITEMS_PER_PAGE,
  take: ITEMS_PER_PAGE,
  orderBy: { createdAt: 'desc' }
});
```

---

## Deployment Checklist

- [ ] Add `role` field to User model
- [ ] Run migration on production database
- [ ] Set admin role for stevenoklizz@gmail.com
- [ ] Build admin pages
- [ ] Create admin API routes
- [ ] Add admin middleware
- [ ] Setup Prisma Studio on VPS
- [ ] Configure nginx reverse proxy
- [ ] Test authentication flow
- [ ] Test all admin features
- [ ] Security audit
- [ ] Rate limiting configuration
- [ ] Audit logging implementation
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Backup database before migration

---

**Ready to implement! 🚀**

*See `ADMIN_PANEL_ANALYSIS.md` for detailed technical analysis*
*See `ADMIN_PANEL_SUMMARY_ID.md` for executive summary*
