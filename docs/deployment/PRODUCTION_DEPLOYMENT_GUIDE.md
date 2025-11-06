# 🚀 Production Deployment Guide - Push Notifications

**Platform:** Hostinger (Node.js hosting)
**Domain:** duely.online
**Status:** Ready for deployment after local implementation complete

---

## 📋 Prerequisites Checklist

Before starting deployment, ensure:

- ✅ All code committed and pushed to GitHub
- ✅ Local implementation validated (all checks passed)
- ✅ SSH access to Hostinger server
- ✅ Node.js version compatible on server (v18+)
- ✅ Database backup created (recommended)

---

## 🔐 Phase 1: Generate Production VAPID Keys

**Duration:** 2 minutes

### Step 1.1: Generate New VAPID Keys for Production

**On your local machine:**

```bash
cd F:\Duely\Workspace
npx web-push generate-vapid-keys
```

**Expected Output:**
```
=======================================

Public Key:
BNxS7mK9... (long string ~88 characters)

Private Key:
kJh8sG2... (long string ~43 characters)

=======================================
```

### Step 1.2: Save Keys Securely

**⚠️ IMPORTANT:**
- Copy both keys immediately
- Store in password manager (e.g., LastPass, 1Password)
- Never commit these to git
- Keep backup in secure location

**Create a temporary note:**
```
PRODUCTION VAPID KEYS - duely.online
=====================================
Public Key: [paste here]
Private Key: [paste here]
Date Generated: [today's date]
```

---

## 🌐 Phase 2: Configure Hostinger Environment Variables

**Duration:** 5 minutes

### Step 2.1: Access Hostinger Control Panel

1. Login to **Hostinger hPanel**: https://hpanel.hostinger.com
2. Navigate to: **Websites** → **duely.online**
3. Click on: **Advanced** → **Environment Variables**

### Step 2.2: Add VAPID Keys

Click **"Add Variable"** for each of the following:

#### Variable 1: VAPID_PUBLIC_KEY
```
Name: VAPID_PUBLIC_KEY
Value: [paste your generated public key]
```

#### Variable 2: VAPID_PRIVATE_KEY
```
Name: VAPID_PRIVATE_KEY
Value: [paste your generated private key]
```

#### Variable 3: NEXT_PUBLIC_VAPID_PUBLIC_KEY
```
Name: NEXT_PUBLIC_VAPID_PUBLIC_KEY
Value: [paste the SAME public key as Variable 1]
```

**⚠️ CRITICAL:** Make sure `VAPID_PUBLIC_KEY` and `NEXT_PUBLIC_VAPID_PUBLIC_KEY` have the EXACT same value!

### Step 2.3: Verify Environment Variables

After adding all three variables, you should see:

```
Environment Variables (showing 3 of X total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VAPID_PUBLIC_KEY              BNxS7mK...
VAPID_PRIVATE_KEY            kJh8sG2...
NEXT_PUBLIC_VAPID_PUBLIC_KEY BNxS7mK...
```

### Step 2.4: Save Changes

Click **"Save"** or **"Apply Changes"** button.

**Note:** Environment variables may take 1-2 minutes to propagate.

---

## 🔌 Phase 3: SSH to Server & Run Database Migration

**Duration:** 5-10 minutes

### Step 3.1: Connect via SSH

**Open your terminal (PowerShell, CMD, or Git Bash):**

```bash
ssh u274205664@154.41.240.171
```

**When prompted for password:**
- Enter your Hostinger SSH password
- Password won't be visible while typing (normal behavior)

**Expected Output:**
```
Welcome to Ubuntu 22.04.x LTS
Last login: [date]
u274205664@server:~$
```

### Step 3.2: Navigate to Project Directory

```bash
cd domains/duely.online/public_html
```

**Verify you're in correct directory:**
```bash
pwd
```

**Expected Output:**
```
/home/u274205664/domains/duely.online/public_html
```

### Step 3.3: Pull Latest Code from GitHub

```bash
git pull origin main
```

**Expected Output:**
```
Updating 2ec4399..1c4cbe8
Fast-forward
 PUSH_NOTIFICATION_VALIDATION_REPORT.md | 412 ++++++++++++++++
 prisma/schema.prisma                   |  39 +-
 public/sw.js                           | 144 ++++++
 [... other files ...]
 16 files changed, 6288 insertions(+), 13 deletions(-)
```

### Step 3.4: Install Dependencies

```bash
npm install
```

**This will install:**
- `web-push@^3.6.7` (new dependency)
- Any other updated dependencies

**Expected Output:**
```
added 7 packages, changed 2 packages
```

### Step 3.5: Verify Environment Variables

**Check if VAPID keys are accessible:**

```bash
node -e "console.log('VAPID_PUBLIC_KEY:', process.env.VAPID_PUBLIC_KEY ? 'SET ✓' : 'MISSING ✗')"
node -e "console.log('VAPID_PRIVATE_KEY:', process.env.VAPID_PRIVATE_KEY ? 'SET ✓' : 'MISSING ✗')"
node -e "console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'SET ✓' : 'MISSING ✗')"
```

**Expected Output:**
```
VAPID_PUBLIC_KEY: SET ✓
VAPID_PRIVATE_KEY: SET ✓
NEXT_PUBLIC_VAPID_PUBLIC_KEY: SET ✓
```

**⚠️ If any shows "MISSING ✗":**
- Go back to Hostinger hPanel
- Re-check environment variables
- Wait 2-3 minutes for propagation
- Re-run the verification command

### Step 3.6: Run Prisma Migration

**⚠️ IMPORTANT:** This will modify your production database!

**First, backup your database:**
```bash
cp prisma/prod.db prisma/prod.db.backup-$(date +%Y%m%d-%H%M%S)
```

**Then run migration:**
```bash
npx prisma migrate deploy
```

**Expected Output:**
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "prod.db" at "file:./prod.db"

2 migrations found in prisma/migrations

Applying migration `20241104_add_push_subscriptions`
The following migration have been applied:

migrations/
  └─ 20241104_add_push_subscriptions/
      └─ migration.sql

All migrations have been successfully applied.
```

### Step 3.7: Verify Database Table Created

```bash
echo "SELECT name FROM sqlite_master WHERE type='table' AND name='push_subscriptions';" | sqlite3 prisma/prod.db
```

**Expected Output:**
```
push_subscriptions
```

**If table exists, you'll see the name. If empty, something went wrong.**

### Step 3.8: Generate Prisma Client

```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client (v6.x.x) to ./node_modules/@prisma/client
```

---

## 🏗️ Phase 4: Build & Deploy Application

**Duration:** 10-15 minutes

### Step 4.1: Build Production Bundle

**Run the build:**
```bash
npm run build
```

**Expected Output:**
```
▲ Next.js 16.0.1 (Turbopack)
Creating an optimized production build ...
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (30/30)
✓ Finalizing page optimization

Route (app)
├ ƒ /api/push/test
├ ƒ /api/notifications/[id]/read
├ ƒ /settings
[... other routes ...]

Build completed in 45s
```

**⚠️ If build fails:**
- Check error message carefully
- Verify environment variables are set
- Check Node.js version: `node -v` (should be v18+)
- Review build logs for specific errors

### Step 4.2: Restart Node.js Application

**Method 1: Via Hostinger hPanel (Recommended)**
1. Go to Hostinger hPanel
2. Navigate to: **Websites** → **duely.online**
3. Click on: **Advanced** → **Node.js**
4. Click **"Restart Application"** button
5. Wait for status to show "Running"

**Method 2: Via PM2 (if using PM2)**
```bash
pm2 restart duely
pm2 logs duely --lines 50
```

**Method 3: Via terminal (if direct node process)**
```bash
# Find and kill existing process
pkill -f "next start"

# Start new process
npm run start &
```

### Step 4.3: Verify Application Started

**Check if application is running:**
```bash
curl -I https://duely.online
```

**Expected Output:**
```
HTTP/2 200
content-type: text/html; charset=utf-8
```

**Check service worker is accessible:**
```bash
curl -I https://duely.online/sw.js
```

**Expected Output:**
```
HTTP/2 200
content-type: application/javascript
```

---

## ✅ Phase 5: Verify Push Notifications Working

**Duration:** 5 minutes

### Step 5.1: Test via Browser (Desktop)

1. **Open browser and navigate to:**
   ```
   https://duely.online
   ```

2. **Login with your account**

3. **Navigate to Settings:**
   ```
   https://duely.online/settings
   ```

4. **Scroll to "Browser Push Notifications" section**

5. **Click "Enable" button**
   - Browser will prompt for notification permission
   - Click "Allow"

6. **Expected result:**
   - Button changes to "Disable"
   - Green checkmark: "✓ Push notifications are enabled on this device"
   - "Send Test Notification" button appears

### Step 5.2: Send Test Notification

1. **Click "Send Test Notification" button**

2. **Expected result within 3-5 seconds:**
   - Browser notification appears (top-right on Windows/Linux, top-right on macOS)
   - Notification shows:
     - Title: "Test Notification"
     - Body: "This is a test push notification from Duely! 🔔"
     - Icon: Duely logo

3. **Click the notification:**
   - Should navigate to dashboard
   - Notification should disappear

### Step 5.3: Test on Mobile Device

**Android (Chrome/Edge):**
1. Open Chrome on Android
2. Navigate to `https://duely.online`
3. Login
4. Go to Settings
5. Enable push notifications (allow permission)
6. Send test notification
7. Notification should appear in notification drawer
8. Tap notification to open app

**iOS (Safari 16.4+):**
1. Open Safari on iOS
2. Navigate to `https://duely.online`
3. Login
4. Go to Settings
5. Enable push notifications (allow permission)
6. Send test notification
7. Notification should appear in notification center
8. Tap notification to open app

**Note:** iOS requires iOS 16.4+ and Safari. Chrome on iOS doesn't support push notifications.

---

## 🔍 Phase 6: Monitor & Verify

**Duration:** Ongoing

### Step 6.1: Check Server Logs

**Via SSH:**
```bash
# If using PM2
pm2 logs duely --lines 100

# If using direct logs
tail -f /path/to/logs/application.log
```

**Look for:**
```
✓ Service Worker registered
✓ Push sent to: https://fcm.googleapis.com/...
✓ Push notification sent successfully
```

### Step 6.2: Monitor Database

**Connect to Prisma Studio (local - tunnel to production):**
```bash
# On your local machine
ssh -L 5555:localhost:5555 u274205664@154.41.240.171

# In another terminal
cd F:\Duely\Workspace
# Edit .env.local temporarily to point to production DB
npx prisma studio
```

**Check `push_subscriptions` table:**
- Should see new records when users enable notifications
- Each record should have: userId, endpoint, p256dh, auth

### Step 6.3: Test Real Notification Scenario

**Create a subscription that triggers notification:**

1. **On production site:**
   - Go to Subscriptions
   - Add a new subscription
   - Set next billing date to tomorrow

2. **Manually trigger notification (via SSH):**
   ```bash
   node -e "
   const { sendPushToUser } = require('./src/lib/push/push-service');
   sendPushToUser('YOUR_USER_ID', {
     title: 'Subscription Reminder',
     body: 'Your Netflix subscription renews tomorrow',
     url: '/subscriptions',
     tag: 'renewal-reminder'
   }).then(console.log).catch(console.error);
   "
   ```

3. **Expected result:**
   - Notification appears on all your devices
   - Clicking opens subscription page

---

## 🐛 Troubleshooting

### Issue 1: Environment Variables Not Set

**Symptoms:**
- Build succeeds but notifications don't send
- Console error: "VAPID keys not configured"

**Solution:**
```bash
# SSH to server
cd domains/duely.online/public_html

# Check .env file (if using .env instead of system env vars)
cat .env.production

# Add keys manually if needed
echo "VAPID_PUBLIC_KEY=your_key_here" >> .env.production
echo "VAPID_PRIVATE_KEY=your_key_here" >> .env.production
echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_key_here" >> .env.production

# Restart application
pm2 restart duely
```

### Issue 2: Service Worker Not Loading

**Symptoms:**
- Console error: "Service Worker registration failed"
- 404 error on `/sw.js`

**Solution:**
```bash
# SSH to server
cd domains/duely.online/public_html

# Verify service worker exists
ls -la public/sw.js

# Check file permissions
chmod 644 public/sw.js

# Verify content
head -20 public/sw.js
```

### Issue 3: Database Migration Failed

**Symptoms:**
- Migration error during deploy
- Table not created

**Solution:**
```bash
# SSH to server
cd domains/duely.online/public_html

# Reset Prisma
rm -rf node_modules/.prisma
npx prisma generate

# Retry migration
npx prisma migrate deploy

# If still fails, manual SQL
sqlite3 prisma/prod.db < prisma/migrations/XXX_add_push_subscriptions/migration.sql
```

### Issue 4: Notifications Not Sending

**Symptoms:**
- "Send Test" button doesn't show notification
- No errors in console

**Solution:**
1. **Check browser console for errors**
2. **Verify notification permission:** Settings → Site Settings → Notifications
3. **Check server logs:**
   ```bash
   pm2 logs duely | grep "push"
   ```
4. **Test VAPID keys:**
   ```bash
   node -e "
   const webpush = require('web-push');
   webpush.setVapidDetails(
     'mailto:admin@duely.online',
     process.env.VAPID_PUBLIC_KEY,
     process.env.VAPID_PRIVATE_KEY
   );
   console.log('VAPID configured successfully');
   "
   ```

### Issue 5: HTTPS Required Error

**Symptoms:**
- "Push notifications require HTTPS"
- Service worker won't register

**Solution:**
- Push notifications ONLY work on HTTPS
- Verify SSL certificate is active on Hostinger
- Check `https://duely.online` (not `http://`)
- If on localhost for testing, use `localhost` (HTTP allowed) or `ngrok` for HTTPS tunnel

---

## 📊 Post-Deployment Checklist

After deployment, verify all of the following:

### Functional Tests:
- [ ] Push notification enable button works
- [ ] Browser permission prompt appears
- [ ] Test notification sends successfully
- [ ] Notification appears on desktop
- [ ] Notification appears on mobile (Android)
- [ ] Notification appears on mobile (iOS Safari 16.4+)
- [ ] Clicking notification navigates correctly
- [ ] Mark-as-read action works
- [ ] Disable push notifications works
- [ ] Multiple device support works

### Technical Tests:
- [ ] Service worker registered (check DevTools → Application → Service Workers)
- [ ] Environment variables set correctly
- [ ] Database table `push_subscriptions` created
- [ ] Database migrations applied
- [ ] API endpoint `/api/push/test` responds
- [ ] API endpoint `/api/notifications/[id]/read` responds
- [ ] Build completed without errors
- [ ] No console errors on frontend
- [ ] No errors in server logs

### Security Tests:
- [ ] Unauthenticated users can't access push APIs
- [ ] Users can only manage their own subscriptions
- [ ] VAPID keys not exposed in client code
- [ ] HTTPS enforced

### Performance Tests:
- [ ] Notification appears within 3-5 seconds
- [ ] No performance degradation on page load
- [ ] Service worker doesn't block main thread
- [ ] Multiple notifications don't cause lag

---

## 🎯 Success Criteria

Deployment is successful when:

✅ All functional tests pass
✅ All technical tests pass
✅ All security tests pass
✅ All performance tests pass
✅ No errors in production logs for 24 hours
✅ At least 1 real user successfully enabled push notifications
✅ At least 1 real notification sent and received

---

## 📝 Rollback Procedure (If Needed)

If deployment fails and you need to rollback:

### Step 1: Revert Code
```bash
# SSH to server
cd domains/duely.online/public_html
git log -3  # Check recent commits
git revert HEAD  # Revert last commit
# OR
git reset --hard 2ec4399  # Reset to before push notification commit
git push origin main --force
```

### Step 2: Rollback Database
```bash
# Restore backup
cp prisma/prod.db.backup-YYYYMMDD-HHMMSS prisma/prod.db

# OR remove the table
sqlite3 prisma/prod.db "DROP TABLE IF EXISTS push_subscriptions;"
```

### Step 3: Rebuild & Restart
```bash
npm install
npm run build
pm2 restart duely
```

### Step 4: Remove Environment Variables
1. Go to Hostinger hPanel
2. Navigate to Environment Variables
3. Delete VAPID keys

---

## 📞 Support & Resources

### Documentation:
- Push Notification Implementation: `PUSH_NOTIFICATION_IMPLEMENTATION_SUMMARY.md`
- Validation Report: `PUSH_NOTIFICATION_VALIDATION_REPORT.md`
- Step-by-Step Guide: `PUSH_NOTIFICATION_IMPLEMENTATION_STEPS.md`

### Web Push Resources:
- Web Push Protocol: https://web.dev/push-notifications-overview/
- VAPID Spec: https://datatracker.ietf.org/doc/html/rfc8292
- Browser Support: https://caniuse.com/push-api

### Hostinger Support:
- Knowledge Base: https://support.hostinger.com
- Live Chat: Available 24/7 in hPanel
- Email: support@hostinger.com

---

## 🎉 Congratulations!

If you've completed all phases successfully, your push notification system is now live on production!

Users can now:
- ✅ Enable browser push notifications
- ✅ Receive real-time notifications even when app is closed
- ✅ Get notified about subscription renewals
- ✅ Manage notifications on multiple devices
- ✅ Control notification preferences

**Next Steps:**
1. Monitor production logs for 24-48 hours
2. Gather user feedback
3. Consider adding more notification types
4. Optimize notification content based on user engagement

---

**Deployment Guide Version:** 1.0
**Last Updated:** November 6, 2025
**Prepared By:** Claude (AI Assistant)
**Status:** Production Ready ✅
