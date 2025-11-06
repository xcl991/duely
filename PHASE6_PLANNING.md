# 🔧 PHASE 6 PLANNING - Admin Panel Advanced Features & System Configuration

**Date:** November 6, 2025
**Status:** Planning
**Estimated Time:** 6-8 hours
**Priority:** High

---

## 🎯 Objective

Melengkapi admin panel dengan fitur-fitur advanced yang mencakup:
1. Admin Settings & Configuration Management
2. System Notifications & Alert Management
3. Advanced Security Features (2FA, IP Whitelisting, Activity Monitoring)
4. Email Templates & Communication Management
5. System Health Monitoring & Logs
6. Backup & Data Management Tools
7. API Rate Limiting & Throttling
8. Webhook Management for Integrations

---

## 📊 Current State (Phase 5)

**Existing Features:**
- ✅ Admin authentication and session management
- ✅ User CRUD operations
- ✅ Subscription CRUD operations
- ✅ Admin action logging
- ✅ Advanced analytics dashboard
- ✅ Export functionality (CSV)
- ✅ Search and filter functionality

**Missing Features:**
- ❌ Admin panel settings configuration
- ❌ System notifications management
- ❌ Two-factor authentication (2FA)
- ❌ IP whitelisting for admin access
- ❌ Email template management
- ❌ System health monitoring
- ❌ Backup management
- ❌ API rate limiting
- ❌ Webhook management

---

## 🏗️ Phase 6 Implementation Plan

### Step 6.1: Admin Settings & Configuration 🔧
**Time:** ~1.5 hours

**Database Schema Extensions:**
```prisma
model AdminSettings {
  id                    String   @id @default(cuid())
  key                   String   @unique
  value                 String   @db.Text
  type                  String   // string, number, boolean, json
  category              String   // general, security, notifications, etc.
  description           String?
  isEditable            Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([category])
  @@index([key])
}
```

**Files to Create:**
- `src/app/api/admin/settings/route.ts` - Settings CRUD API
- `src/app/(adminpage)/dashboard/settings/page.tsx` - Settings page
- `src/components/admin/settings/SettingsForm.tsx` - Settings form component
- `src/components/admin/settings/SettingsCategory.tsx` - Category tabs
- `src/lib/admin/settings.ts` - Settings helper functions

**Settings Categories:**
1. **General Settings**
   - Site name
   - Contact email
   - Support URL
   - Timezone
   - Date format
   - Currency format

2. **Security Settings**
   - Session timeout duration
   - Password requirements
   - Max login attempts
   - 2FA requirement
   - IP whitelist enabled

3. **Notification Settings**
   - Email notifications enabled
   - Webhook notifications enabled
   - Alert thresholds
   - Notification recipients

4. **Analytics Settings**
   - Data retention period
   - Auto-refresh interval
   - Export limits

---

### Step 6.2: System Notifications & Alerts 🔔
**Time:** ~1.5 hours

**Database Schema:**
```prisma
model AdminNotification {
  id          String   @id @default(cuid())
  type        String   // info, warning, error, critical
  title       String
  message     String   @db.Text
  category    String   // system, security, user_action, subscription
  severity    Int      @default(1) // 1-5
  isRead      Boolean  @default(false)
  readAt      DateTime?
  readBy      String?  // Admin user ID
  metadata    String?  @db.Json // Additional context
  actionUrl   String?  // Link to related resource
  createdAt   DateTime @default(now())
  expiresAt   DateTime?

  @@index([type])
  @@index([category])
  @@index([isRead])
  @@index([createdAt])
  @@index([severity])
}
```

**Files to Create:**
- `src/app/api/admin/notifications/route.ts` - Notifications API
- `src/app/api/admin/notifications/[id]/route.ts` - Single notification
- `src/app/(adminpage)/dashboard/notifications/page.tsx` - Notifications page
- `src/components/admin/notifications/NotificationList.tsx` - Notification list
- `src/components/admin/notifications/NotificationBadge.tsx` - Badge component
- `src/lib/admin/notifications.ts` - Notification helpers

**Notification Types:**
- **System Alerts:**
  - Database connection issues
  - High memory usage
  - Disk space warnings
  - Failed cron jobs

- **Security Alerts:**
  - Multiple failed login attempts
  - Unauthorized access attempts
  - Unusual activity patterns
  - New admin user created

- **User Actions:**
  - Mass user registrations
  - Bulk subscription cancellations
  - Payment failures
  - Refund requests

- **Subscription Events:**
  - High churn rate detected
  - Revenue threshold reached
  - Trial conversions spike

**Features:**
- Real-time notification updates
- Filter by type, category, severity
- Mark as read/unread
- Bulk actions
- Auto-expire old notifications
- Email digest option

---

### Step 6.3: Two-Factor Authentication (2FA) 🔐
**Time:** ~2 hours

**Database Schema:**
```prisma
model AdminTwoFactor {
  id            String    @id @default(cuid())
  adminUserId   String    @unique
  secret        String    // Encrypted TOTP secret
  backupCodes   String    @db.Json // Array of hashed backup codes
  isEnabled     Boolean   @default(false)
  enabledAt     DateTime?
  lastUsedAt    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  adminUser     AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)
}

// Add to AdminUser model
model AdminUser {
  // ... existing fields
  twoFactorEnabled  Boolean           @default(false)
  twoFactor         AdminTwoFactor?
}
```

**Dependencies:**
```bash
npm install speakeasy qrcode
npm install --save-dev @types/speakeasy @types/qrcode
```

**Files to Create:**
- `src/lib/admin/two-factor.ts` - 2FA utilities (TOTP generation, verification)
- `src/app/api/admin/auth/2fa/setup/route.ts` - Setup 2FA endpoint
- `src/app/api/admin/auth/2fa/verify/route.ts` - Verify 2FA code
- `src/app/api/admin/auth/2fa/disable/route.ts` - Disable 2FA
- `src/app/api/admin/auth/2fa/backup-codes/route.ts` - Generate backup codes
- `src/components/admin/security/TwoFactorSetup.tsx` - 2FA setup wizard
- `src/components/admin/security/TwoFactorVerify.tsx` - 2FA verification input
- `src/app/(adminpage)/auth/verify-2fa/page.tsx` - 2FA verification page

**Features:**
- TOTP (Time-based One-Time Password) using Google Authenticator
- QR code generation for easy setup
- 10 backup codes generation
- Backup codes can be used once
- Force 2FA for all admin users (optional setting)
- Remember device for 30 days (optional)

**Implementation Steps:**
1. Generate TOTP secret using speakeasy
2. Generate QR code for secret
3. User scans QR code with authenticator app
4. User enters verification code
5. Save encrypted secret to database
6. Generate and display backup codes
7. Modify login flow to check 2FA status
8. Add verification step after password check

---

### Step 6.4: IP Whitelisting & Access Control 🌐
**Time:** ~1 hour

**Database Schema:**
```prisma
model AdminIPWhitelist {
  id          String   @id @default(cuid())
  ipAddress   String   @unique
  label       String   // e.g., "Office Network", "John's Home"
  adminUserId String?  // Optional: specific to admin user
  isActive    Boolean  @default(true)
  createdBy   String   // Admin user ID who added this
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastUsedAt  DateTime?

  @@index([ipAddress])
  @@index([isActive])
}

model AdminAccessLog {
  id          String   @id @default(cuid())
  adminUserId String
  ipAddress   String
  userAgent   String   @db.Text
  action      String   // login, logout, failed_login
  success     Boolean
  reason      String?  // Failure reason if applicable
  location    String?  @db.Json // GeoIP data (optional)
  createdAt   DateTime @default(now())

  adminUser   AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)

  @@index([adminUserId])
  @@index([ipAddress])
  @@index([createdAt])
  @@index([success])
}

// Add to AdminUser model
model AdminUser {
  // ... existing fields
  accessLogs   AdminAccessLog[]
}
```

**Files to Create:**
- `src/lib/admin/ip-whitelist.ts` - IP whitelist utilities
- `src/app/api/admin/security/ip-whitelist/route.ts` - IP whitelist CRUD
- `src/app/api/admin/security/access-logs/route.ts` - Access logs API
- `src/components/admin/security/IPWhitelistManager.tsx` - IP management UI
- `src/components/admin/security/AccessLogViewer.tsx` - Access logs viewer
- `src/middleware/admin-ip-check.ts` - IP whitelist middleware

**Features:**
- Add/remove IP addresses or CIDR ranges
- Label IPs for easy identification
- Enable/disable IP whitelisting globally
- Per-admin IP restrictions (optional)
- Failed access attempt logging
- Real-time IP blocking for suspicious activity
- GeoIP lookup for access logs (optional)

---

### Step 6.5: Email Templates & Communication 📧
**Time:** ~1.5 hours

**Database Schema:**
```prisma
model EmailTemplate {
  id          String   @id @default(cuid())
  key         String   @unique // e.g., "user_welcome", "subscription_expiring"
  name        String
  subject     String
  htmlBody    String   @db.Text
  textBody    String   @db.Text
  variables   String   @db.Json // Available placeholders
  category    String   // system, user, subscription, admin
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([key])
  @@index([category])
}

model EmailLog {
  id          String   @id @default(cuid())
  templateKey String?
  recipient   String
  subject     String
  status      String   // sent, failed, pending
  error       String?  @db.Text
  sentAt      DateTime?
  createdAt   DateTime @default(now())

  @@index([status])
  @@index([createdAt])
  @@index([templateKey])
}
```

**Files to Create:**
- `src/lib/admin/email.ts` - Email utilities and template rendering
- `src/app/api/admin/email/templates/route.ts` - Email templates CRUD
- `src/app/api/admin/email/logs/route.ts` - Email logs API
- `src/app/api/admin/email/send-test/route.ts` - Send test email
- `src/app/(adminpage)/dashboard/email/templates/page.tsx` - Template manager
- `src/app/(adminpage)/dashboard/email/logs/page.tsx` - Email logs viewer
- `src/components/admin/email/TemplateEditor.tsx` - Rich text editor
- `src/components/admin/email/TemplatePreview.tsx` - Email preview

**Default Templates:**
1. **User Templates:**
   - Welcome email
   - Email verification
   - Password reset
   - Account updated
   - Subscription created
   - Subscription expiring
   - Subscription canceled
   - Payment failed
   - Payment received

2. **Admin Templates:**
   - New admin user invitation
   - Security alert
   - System report
   - Backup completed

**Features:**
- Rich text editor with variable insertion
- Template preview
- Variable substitution engine
- HTML and plain text versions
- Test email sending
- Email delivery tracking
- Resend failed emails

---

### Step 6.6: System Health Monitoring 🏥
**Time:** ~1 hour

**Files to Create:**
- `src/lib/admin/health.ts` - Health check utilities
- `src/app/api/admin/system/health/route.ts` - Health check API
- `src/app/api/admin/system/metrics/route.ts` - System metrics API
- `src/app/(adminpage)/dashboard/system/health/page.tsx` - Health dashboard
- `src/components/admin/system/HealthStatus.tsx` - Health status cards
- `src/components/admin/system/MetricsChart.tsx` - Metrics visualization

**Health Checks:**
1. **Database Health**
   - Connection status
   - Query response time
   - Connection pool usage
   - Failed queries count

2. **API Health**
   - Response time
   - Error rate
   - Request throughput
   - Rate limit status

3. **Storage Health**
   - Disk space usage
   - Upload storage usage
   - Backup storage usage

4. **Cache Health** (if applicable)
   - Redis connection
   - Cache hit rate
   - Memory usage

5. **External Services**
   - Email service status
   - Payment gateway status
   - Third-party API status

**Metrics to Track:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- Active sessions
- Queue length
- Background jobs status

**Features:**
- Real-time health status
- Historical metrics
- Alert thresholds
- Auto-refresh dashboard
- Export metrics data

---

### Step 6.7: Backup & Data Management 💾
**Time:** ~1 hour

**Database Schema:**
```prisma
model BackupJob {
  id          String   @id @default(cuid())
  type        String   // full, incremental, export
  status      String   // pending, running, completed, failed
  fileSize    BigInt?
  filePath    String?
  error       String?  @db.Text
  startedAt   DateTime?
  completedAt DateTime?
  createdBy   String   // Admin user ID
  createdAt   DateTime @default(now())

  @@index([status])
  @@index([type])
  @@index([createdAt])
}
```

**Files to Create:**
- `src/lib/admin/backup.ts` - Backup utilities
- `src/app/api/admin/backup/create/route.ts` - Create backup
- `src/app/api/admin/backup/list/route.ts` - List backups
- `src/app/api/admin/backup/download/[id]/route.ts` - Download backup
- `src/app/api/admin/backup/restore/route.ts` - Restore backup
- `src/app/(adminpage)/dashboard/system/backups/page.tsx` - Backup manager
- `src/components/admin/system/BackupList.tsx` - Backup list component

**Backup Features:**
1. **Database Backup**
   - Full database dump
   - Scheduled backups (cron job)
   - Retention policy
   - Compression

2. **Data Export**
   - Export users (CSV, JSON)
   - Export subscriptions (CSV, JSON)
   - Export analytics data
   - Export logs

3. **Restore Options**
   - Restore from backup
   - Preview backup contents
   - Selective restore

**Features:**
- Manual backup trigger
- Scheduled automatic backups
- Backup retention policy
- Download backup files
- Restore confirmation dialog
- Backup integrity verification

---

### Step 6.8: API Rate Limiting & Throttling ⏱️
**Time:** ~1 hour

**Database Schema:**
```prisma
model RateLimitLog {
  id          String   @id @default(cuid())
  identifier  String   // IP address or user ID
  endpoint    String
  method      String
  count       Int      @default(1)
  windowStart DateTime
  windowEnd   DateTime
  blocked     Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([identifier, endpoint, windowStart])
  @@index([blocked])
}
```

**Dependencies:**
```bash
npm install express-rate-limit
npm install rate-limit-redis # if using Redis
```

**Files to Create:**
- `src/lib/admin/rate-limit.ts` - Rate limiting utilities
- `src/middleware/rate-limit.ts` - Rate limit middleware
- `src/app/api/admin/security/rate-limits/route.ts` - Rate limit config API
- `src/components/admin/security/RateLimitConfig.tsx` - Rate limit settings

**Rate Limit Tiers:**
1. **Admin API:** 100 requests/minute
2. **Public API:** 60 requests/minute
3. **Auth Endpoints:** 5 requests/minute
4. **Export Endpoints:** 10 requests/hour
5. **Webhook Endpoints:** 1000 requests/hour

**Features:**
- Configurable rate limits per endpoint
- IP-based and user-based limiting
- Sliding window algorithm
- Custom error responses
- Rate limit headers (X-RateLimit-*)
- Whitelist specific IPs
- Temporary ban for abuse

---

### Step 6.9: Webhook Management 🔗
**Time:** ~1.5 hours

**Database Schema:**
```prisma
model Webhook {
  id          String   @id @default(cuid())
  url         String
  events      String   @db.Json // Array of event types
  secret      String   // Webhook signing secret
  isActive    Boolean  @default(true)
  retryConfig String   @db.Json // Retry policy
  headers     String?  @db.Json // Custom headers
  createdBy   String   // Admin user ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  deliveries  WebhookDelivery[]

  @@index([isActive])
}

model WebhookDelivery {
  id          String   @id @default(cuid())
  webhookId   String
  event       String
  payload     String   @db.Json
  status      String   // pending, success, failed
  responseCode Int?
  responseBody String?  @db.Text
  error       String?  @db.Text
  attemptCount Int     @default(1)
  nextRetryAt DateTime?
  deliveredAt DateTime?
  createdAt   DateTime @default(now())

  webhook     Webhook  @relation(fields: [webhookId], references: [id], onDelete: Cascade)

  @@index([webhookId])
  @@index([status])
  @@index([event])
  @@index([createdAt])
}
```

**Files to Create:**
- `src/lib/admin/webhooks.ts` - Webhook utilities
- `src/app/api/admin/webhooks/route.ts` - Webhooks CRUD
- `src/app/api/admin/webhooks/[id]/route.ts` - Single webhook
- `src/app/api/admin/webhooks/[id]/deliveries/route.ts` - Delivery logs
- `src/app/api/admin/webhooks/[id]/test/route.ts` - Test webhook
- `src/app/(adminpage)/dashboard/webhooks/page.tsx` - Webhook manager
- `src/components/admin/webhooks/WebhookForm.tsx` - Webhook form
- `src/components/admin/webhooks/WebhookDeliveries.tsx` - Delivery logs
- `src/lib/jobs/webhook-processor.ts` - Background job for retries

**Supported Events:**
- `user.created`
- `user.updated`
- `user.deleted`
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`
- `subscription.renewed`
- `payment.succeeded`
- `payment.failed`
- `admin.action` (for audit trail)

**Features:**
- CRUD operations for webhooks
- Event subscription selection
- Webhook signature verification (HMAC)
- Delivery logs and status
- Automatic retries with exponential backoff
- Test webhook delivery
- Disable/enable webhooks
- Custom headers support
- Real-time delivery tracking

---

### Step 6.10: Comprehensive Testing 🧪
**Time:** ~1 hour

**Files to Create:**
- `test-admin-phase6-settings.js` - Settings tests
- `test-admin-phase6-notifications.js` - Notifications tests
- `test-admin-phase6-security.js` - Security features tests
- `test-admin-phase6-email.js` - Email templates tests
- `test-admin-phase6-system.js` - System health tests
- `test-admin-phase6-webhooks.js` - Webhooks tests
- `test-admin-phase6-integration.js` - Integration tests

**Test Coverage:**

**1. Admin Settings (20 tests)**
- Settings CRUD operations
- Settings validation
- Settings types handling
- Category filtering
- Settings cache

**2. Notifications (25 tests)**
- Notification creation
- Notification filtering
- Mark as read/unread
- Bulk operations
- Real-time updates
- Auto-expiry

**3. Security Features (30 tests)**
- 2FA setup and verification
- Backup codes generation
- IP whitelist CRUD
- IP range validation
- Access logs creation
- Failed login tracking

**4. Email Templates (20 tests)**
- Template CRUD operations
- Template rendering
- Variable substitution
- Email sending
- Email logs
- Test email

**5. System Health (15 tests)**
- Health checks execution
- Metrics collection
- Alert thresholds
- Dashboard data

**6. Backup Management (15 tests)**
- Backup creation
- Backup download
- Backup restoration
- Backup scheduling

**7. Rate Limiting (12 tests)**
- Rate limit enforcement
- Window calculations
- Whitelisting
- Blocking logic

**8. Webhooks (25 tests)**
- Webhook CRUD
- Event subscription
- Signature generation
- Delivery logging
- Retry logic
- Test delivery

**Total Tests: ~162 tests**

---

## 📦 Additional Dependencies

**Two-Factor Authentication:**
```bash
npm install speakeasy qrcode
npm install --save-dev @types/speakeasy @types/qrcode
```

**Rate Limiting:**
```bash
npm install express-rate-limit
```

**Email Template Editor:**
```bash
npm install @tiptap/react @tiptap/starter-kit
# or
npm install react-quill
```

**System Monitoring:**
```bash
npm install os-utils # System metrics
npm install node-cron # Scheduled tasks
```

---

## 🎯 Success Criteria

### Functional Requirements:
- [ ] Admin settings page with all categories functional
- [ ] System notifications displaying and updating in real-time
- [ ] 2FA setup wizard working with QR code
- [ ] 2FA verification during admin login
- [ ] IP whitelist blocking unauthorized access
- [ ] Access logs tracking all admin activities
- [ ] Email template editor with preview
- [ ] Email sending and logging functional
- [ ] System health dashboard showing live metrics
- [ ] Backup creation and download working
- [ ] Rate limiting blocking excessive requests
- [ ] Webhook delivery and retry logic working

### Technical Requirements:
- [ ] All API endpoints secured with admin auth
- [ ] Database migrations successful
- [ ] Proper error handling
- [ ] TypeScript types for all new features
- [ ] No performance issues
- [ ] No warnings in tests
- [ ] 100% test pass rate
- [ ] All features documented

### Security Requirements:
- [ ] 2FA secrets encrypted at rest
- [ ] Webhook signatures properly verified
- [ ] IP whitelist properly enforced
- [ ] Rate limits protecting against abuse
- [ ] Access logs tamper-proof
- [ ] Backup files encrypted
- [ ] Email templates XSS-safe

---

## 🔐 Security Considerations

### Data Encryption:
- ✅ Encrypt 2FA secrets
- ✅ Encrypt webhook secrets
- ✅ Encrypt backup files
- ✅ Secure email credentials

### Access Control:
- ✅ Verify admin permissions for all features
- ✅ IP whitelist enforcement
- ✅ Rate limiting per admin user
- ✅ Audit all sensitive operations

### Input Validation:
- ✅ Validate IP addresses
- ✅ Sanitize email templates
- ✅ Validate webhook URLs
- ✅ Validate settings values

---

## ⚠️ Risks & Mitigation

### Risk 1: 2FA Lockout
**Mitigation:**
- Generate backup codes
- Admin recovery mechanism
- Support email contact

### Risk 2: Webhook Delivery Failures
**Mitigation:**
- Retry logic with exponential backoff
- Maximum retry attempts
- Manual retry option
- Alert on repeated failures

### Risk 3: Email Service Downtime
**Mitigation:**
- Queue emails for retry
- Fallback SMTP provider
- Monitor email service health

### Risk 4: Backup File Size
**Mitigation:**
- Compression
- Incremental backups
- Storage cleanup policy
- Size limits

---

## 📝 Implementation Order

**Recommended Order:**
1. ✅ Step 6.1: Admin Settings & Configuration (foundation)
2. ⬜ Step 6.2: System Notifications & Alerts (user communication)
3. ⬜ Step 6.3: Two-Factor Authentication (security)
4. ⬜ Step 6.4: IP Whitelisting & Access Control (security)
5. ⬜ Step 6.5: Email Templates & Communication (communication)
6. ⬜ Step 6.6: System Health Monitoring (observability)
7. ⬜ Step 6.7: Backup & Data Management (data safety)
8. ⬜ Step 6.8: API Rate Limiting & Throttling (security)
9. ⬜ Step 6.9: Webhook Management (integrations)
10. ⬜ Step 6.10: Comprehensive Testing (quality assurance)
11. ⬜ Step 6.11: Phase 6 completion report

---

## 🚀 Ready to Start

**Prerequisites:**
- ✅ Phase 1-5 completed
- ✅ No warnings in system
- ✅ All tests passing
- ✅ Database schema up to date

**Next Action:**
Start with Step 6.1 (Admin Settings & Configuration) as the foundation for other features.

---

**Generated:** November 6, 2025
**By:** Claude Code
**Phase:** 6 Planning
**Status:** Ready to Implement
