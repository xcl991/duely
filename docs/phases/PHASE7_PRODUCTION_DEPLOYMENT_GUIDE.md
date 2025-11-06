# 🚀 PHASE 7 - PRODUCTION DEPLOYMENT GUIDE

**Date:** November 6, 2025
**Target:** VPS at 72.60.107.246 (duely.online)
**Status:** READY FOR DEPLOYMENT ✅

---

## ✅ PRE-DEPLOYMENT CHECKLIST

**Phase 7 Implementation Complete:**
- ✅ Admin Auth Check Endpoint created (`/api/admin/auth-check`)
- ✅ Database Viewer Page created (`/adminpage/dashboard/database`)
- ✅ TypeScript Check: 0 new errors
- ✅ All Phase 6 features integrated
- ✅ Local testing passed

**Files Created in Phase 7:**
1. ✅ `src/app/api/admin/auth-check/route.ts` (42 lines)
2. ✅ `src/app/(adminpage)/dashboard/database/page.tsx` (245 lines)

**Total Phase 7 Code:** 287 lines
**TypeScript Errors:** 0 ✅

---

## 📋 DEPLOYMENT STEPS

### **STEP 1: Backup Production Database** (5 minutes)

```bash
# SSH to VPS
ssh duely@72.60.107.246

# Navigate to project directory
cd ~/duely

# Create backup directory if not exists
mkdir -p backups

# Backup production database
mysqldump -u duely_user -p duely_production > backups/backup_phase7_$(date +%Y%m%d_%H%M%S).sql

# Verify backup created
ls -lh backups/backup_phase7_*.sql

# Expected output: File size should be > 1MB
```

**✅ Verification:**
- Backup file created successfully
- File size > 0 bytes
- Can open file and see SQL statements

---

### **STEP 2: Pull Latest Code from Git** (5 minutes)

```bash
# On VPS, in ~/duely directory
cd ~/duely

# Check current git status
git status

# Stash any local changes (if any)
git stash

# Pull latest code from repository
git pull origin main

# Verify Phase 7 files exist
ls -la src/app/api/admin/auth-check/route.ts
ls -la src/app/\(adminpage\)/dashboard/database/page.tsx

# Both files should exist
```

**✅ Verification:**
- Git pull successful
- No merge conflicts
- Phase 7 files present

---

### **STEP 3: Install Dependencies** (2 minutes)

```bash
# Install/update npm packages
npm install

# Verify no errors
echo $?  # Should output: 0
```

**✅ Verification:**
- npm install completed without errors
- No security vulnerabilities (critical)

---

### **STEP 4: Run Database Migrations** (3-5 minutes)

```bash
# Set production database URL
export DATABASE_URL="mysql://duely_user:[YOUR_PASSWORD]@localhost:3306/duely_production"

# Check migration status
npx prisma migrate status

# Expected output should show:
# - All Phase 6 migrations already applied
# - No pending migrations (Phase 7 doesn't add new models)

# If any migrations pending, deploy them:
npx prisma migrate deploy

# Verify schema is up to date
npx prisma db pull
```

**✅ Verification:**
- All migrations applied
- No pending migrations
- Database schema matches Prisma schema

---

### **STEP 5: Verify Admin User Exists** (2 minutes)

```bash
# Connect to MySQL
mysql -u duely_user -p duely_production

# Check if admin user exists
SELECT id, email, name, createdAt FROM Admin WHERE email = 'stevenoklizz@gmail.com';

# Expected output: Should return 1 row with admin details

# If no admin user found, create one:
# (Replace 'HASHED_PASSWORD' with actual bcrypt hash)
INSERT INTO Admin (id, email, password, name, createdAt, updatedAt)
VALUES (
  'admin_001',
  'stevenoklizz@gmail.com',
  '$2a$12$[BCRYPT_HASH_HERE]',
  'Steven Admin',
  NOW(),
  NOW()
);

# Exit MySQL
EXIT;
```

**To generate bcrypt hash for password '90opklnm':**
```bash
# On local machine or VPS
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('90opklnm', 12));"
```

**✅ Verification:**
- Admin user exists in database
- Email: stevenoklizz@gmail.com
- Password is bcrypt hashed

---

### **STEP 6: Build Next.js Application** (3-5 minutes)

```bash
# On VPS, in ~/duely directory
cd ~/duely

# Build Next.js for production
npm run build

# This will:
# - Compile TypeScript
# - Bundle JavaScript
# - Optimize pages
# - Generate static pages

# Check for build errors
echo $?  # Should output: 0

# Verify .next directory created
ls -la .next/
```

**✅ Verification:**
- Build completed without errors
- `.next` directory exists
- No TypeScript errors
- No webpack errors

---

### **STEP 7: Configure Environment Variables** (2 minutes)

```bash
# Edit .env.production file
nano .env.production

# Ensure these variables are set:
```

```env
# Database
DATABASE_URL="mysql://duely_user:[PASSWORD]@localhost:3306/duely_production"

# NextAuth
NEXTAUTH_URL="https://duely.online"
NEXTAUTH_SECRET="[YOUR_NEXTAUTH_SECRET]"

# Phase 6 - Two-Factor Authentication
TWO_FACTOR_ENCRYPTION_KEY="[32-character-encryption-key]"

# Optional - Prisma Studio (if needed)
PRISMA_STUDIO_PORT="5555"
```

**Generate TWO_FACTOR_ENCRYPTION_KEY if not exists:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save and exit:**
Press `Ctrl+X`, then `Y`, then `Enter`

**✅ Verification:**
- All required environment variables set
- TWO_FACTOR_ENCRYPTION_KEY is 32+ characters
- NEXTAUTH_SECRET is secure

---

### **STEP 8: Restart PM2 Application** (2 minutes)

```bash
# Restart Next.js app
pm2 restart duely

# Check PM2 status
pm2 status

# View logs to ensure no errors
pm2 logs duely --lines 50

# Expected: No error logs, app running
```

**✅ Verification:**
- PM2 shows app status: `online`
- No error logs in PM2 logs
- App restarted successfully

---

### **STEP 9: Setup Prisma Studio (Optional)** (5 minutes)

```bash
# Start Prisma Studio on internal port 5555
pm2 start "npx prisma studio --port 5555 --hostname 127.0.0.1" --name prisma-studio

# Save PM2 configuration
pm2 save

# Verify Prisma Studio running
pm2 status

# Test Prisma Studio locally on VPS
curl http://127.0.0.1:5555

# Expected: HTML response from Prisma Studio
```

**✅ Verification:**
- Prisma Studio process running in PM2
- Accessible on localhost:5555
- Returns HTML content

---

### **STEP 10: Configure Nginx** (10-15 minutes)

```bash
# Edit nginx configuration
sudo nano /etc/nginx/sites-available/duely.online
```

**Add/Update the following sections:**

```nginx
# Rate limiting for admin routes
limit_req_zone $binary_remote_addr zone=admin_limit:10m rate=10r/m;

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name duely.online www.duely.online;

    # SSL Configuration (existing - don't change)
    ssl_certificate /etc/letsencrypt/live/duely.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/duely.online/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Admin Panel Routes (with rate limiting)
    location /adminpage {
        limit_req zone=admin_limit burst=5 nodelay;

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin API Routes (with rate limiting)
    location /api/admin {
        limit_req zone=admin_limit burst=5 nodelay;

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Prisma Studio Proxy (Optional - only if you want browser access)
    location /prisma-studio {
        # Authentication check
        auth_request /api/admin/auth-check;

        # Rewrite URL to remove /prisma-studio prefix
        rewrite ^/prisma-studio(/.*)?$ $1 break;

        # Proxy to Prisma Studio
        proxy_pass http://127.0.0.1:5555;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Regular application routes (existing - don't change)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Test nginx configuration:**
```bash
# Test for syntax errors
sudo nginx -t

# Expected output: "syntax is ok" and "test is successful"
```

**Reload nginx:**
```bash
# If test passed, reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# Expected: active (running)
```

**✅ Verification:**
- Nginx configuration valid
- Nginx reloaded successfully
- No errors in nginx logs

---

### **STEP 11: Test Admin Panel on Production** (10-15 minutes)

#### 11.1 Test Admin Login
```bash
# From any machine, test admin login API
curl -X POST https://duely.online/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"stevenoklizz@gmail.com","password":"90opklnm"}'

# Expected: JSON response with success: true and admin token
```

#### 11.2 Browser Testing

**Open browser and navigate to:**
1. `https://duely.online/adminpage/auth`

**Expected:**
- Admin login page loads
- No console errors
- HTTPS secure

**Login with:**
- Email: stevenoklizz@gmail.com
- Password: 90opklnm

**Expected:**
- Login successful
- Redirected to `/adminpage/dashboard`

#### 11.3 Test All Admin Pages

Navigate to each page and verify:

1. **Dashboard** (`/adminpage/dashboard`)
   - ✅ Stats load correctly
   - ✅ Charts render
   - ✅ No console errors

2. **Users** (`/adminpage/dashboard/users`)
   - ✅ User list displays
   - ✅ Pagination works
   - ✅ Search functional

3. **Subscriptions** (`/adminpage/dashboard/subscriptions`)
   - ✅ Subscriptions load
   - ✅ Filters work

4. **Analytics** (`/adminpage/dashboard/analytics`)
   - ✅ Charts display
   - ✅ Data accurate

5. **Settings** (`/adminpage/dashboard/settings`)
   - ✅ Settings load
   - ✅ Can save changes

6. **Notifications** (`/adminpage/dashboard/notifications`)
   - ✅ Notifications display
   - ✅ Mark as read works

7. **Database** (`/adminpage/dashboard/database`) - **NEW**
   - ✅ Page loads
   - ✅ Auth check works
   - ✅ Prisma Studio link available

8. **System Health** (`/adminpage/dashboard/system/health`)
   - ✅ Health metrics display

9. **IP Whitelist** (`/adminpage/dashboard/security/ip-whitelist`)
   - ✅ IP list displays

10. **Logs** (`/adminpage/dashboard/logs`)
    - ✅ Admin logs display

#### 11.4 Test API Endpoints

```bash
# Get admin stats
curl https://duely.online/api/admin/stats \
  -H "Cookie: admin_session=[YOUR_SESSION_TOKEN]"

# Get users list
curl https://duely.online/api/admin/users \
  -H "Cookie: admin_session=[YOUR_SESSION_TOKEN]"

# Test auth check (NEW)
curl https://duely.online/api/admin/auth-check \
  -H "Cookie: admin_session=[YOUR_SESSION_TOKEN]"

# Expected: All return 200 OK with JSON data
```

**✅ Verification:**
- All pages load without errors
- All API endpoints respond correctly
- Session management works
- Rate limiting active (admin routes limited to 10 req/min)

---

### **STEP 12: Test Prisma Studio Access** (5 minutes)

#### Option A: Direct Link (Development)
```bash
# If you set up Prisma Studio proxy in nginx
# Navigate to: https://duely.online/prisma-studio

# Expected:
# - Redirects to admin login if not authenticated
# - After login, shows Prisma Studio interface
```

#### Option B: Database Viewer Page
```bash
# Navigate to: https://duely.online/adminpage/dashboard/database

# Expected:
# - Page loads successfully
# - "Open Prisma Studio" button available
# - Security warnings displayed
# - Click button opens Prisma Studio in new window
```

**✅ Verification:**
- Database viewer page accessible
- Prisma Studio can be opened (if configured)
- Authentication required to access

---

### **STEP 13: Security Verification** (10 minutes)

#### 13.1 Test Unauthorized Access
```bash
# Try accessing admin panel without login
curl https://duely.online/adminpage/dashboard

# Expected: Redirect to /adminpage/auth
```

#### 13.2 Test Rate Limiting
```bash
# Send multiple requests quickly
for i in {1..15}; do
  curl -I https://duely.online/api/admin/stats
done

# Expected: After 10 requests, should get 429 (Too Many Requests)
```

#### 13.3 Check HTTPS
```bash
# Verify HTTPS redirect
curl -I http://duely.online/adminpage/dashboard

# Expected: 301 redirect to https://
```

#### 13.4 Check Security Headers
```bash
curl -I https://duely.online/adminpage/dashboard | grep -E "(X-Frame|X-Content|X-XSS|Strict-Transport)"

# Expected: All security headers present
```

**✅ Verification:**
- Unauthorized users redirected to login
- Rate limiting working (10 req/min for admin routes)
- HTTPS enforced
- Security headers present

---

### **STEP 14: Monitor Application** (Ongoing)

```bash
# Watch PM2 logs in real-time
pm2 logs duely --lines 100

# Monitor for errors
pm2 monit

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check nginx access logs
sudo tail -f /var/log/nginx/access.log
```

**Monitor for:**
- ❌ Error logs
- ❌ Failed login attempts
- ❌ 500 errors
- ✅ Successful admin logins
- ✅ API requests processing correctly

---

## 🔄 ROLLBACK PLAN

If deployment fails or critical issues found:

### **Rollback Step 1: Restore Database**
```bash
# Find your backup
ls -lh backups/backup_phase7_*.sql

# Restore database
mysql -u duely_user -p duely_production < backups/backup_phase7_[TIMESTAMP].sql
```

### **Rollback Step 2: Revert Code**
```bash
# Check git log
git log --oneline -5

# Revert to previous commit
git reset --hard [PREVIOUS_COMMIT_HASH]

# Or revert specific commit
git revert HEAD

# Rebuild
npm run build

# Restart PM2
pm2 restart duely
```

### **Rollback Step 3: Reload Nginx**
```bash
# Restore previous nginx config
sudo cp /etc/nginx/sites-available/duely.online.bak /etc/nginx/sites-available/duely.online

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

**Application:**
- [ ] Admin login works (`https://duely.online/adminpage/auth`)
- [ ] Dashboard displays statistics
- [ ] All 10 admin pages load without errors
- [ ] User management functional
- [ ] Settings page works
- [ ] Notifications system operational
- [ ] Database viewer page accessible
- [ ] Session management working
- [ ] Logout functional

**API Endpoints:**
- [ ] All 17 admin API routes responding
- [ ] Auth check endpoint working
- [ ] Rate limiting active
- [ ] Authentication required on all admin routes

**Security:**
- [ ] HTTPS enforced on all routes
- [ ] Unauthorized users redirected to login
- [ ] Admin session timeout working (15 minutes)
- [ ] Rate limiting: 10 req/min on admin routes
- [ ] Security headers present
- [ ] Admin logs being created

**Performance:**
- [ ] Pages load in < 2 seconds
- [ ] No memory leaks
- [ ] PM2 shows stable memory usage
- [ ] Database queries optimized

**Monitoring:**
- [ ] PM2 processes running stable
- [ ] No errors in PM2 logs
- [ ] No errors in nginx logs
- [ ] Database connection stable

**Documentation:**
- [ ] Admin credentials documented (secure location)
- [ ] Deployment notes updated
- [ ] Rollback plan tested

---

## 📊 DEPLOYMENT SUMMARY

### **What Was Deployed:**

**Phase 7 New Features:**
1. Admin Auth Check API (`/api/admin/auth-check`)
2. Database Viewer Page (`/adminpage/dashboard/database`)
3. Nginx configuration for admin routes
4. Rate limiting for admin panel
5. Prisma Studio integration (optional)

**Total New Code:**
- 2 new files
- 287 lines of code
- 0 TypeScript errors
- 0 breaking changes

**Total Admin System:**
- 12 admin UI pages
- 17 admin API routes
- 10 admin utility libraries
- Full authentication & authorization
- Comprehensive security measures

**Database:**
- All Phase 6 migrations applied
- Admin user created/verified
- No schema changes in Phase 7

**Infrastructure:**
- Nginx configured with rate limiting
- PM2 running Next.js + Prisma Studio (optional)
- SSL/HTTPS enforced
- Security headers added

---

## 🎯 SUCCESS CRITERIA

**Deployment is successful if:**
- ✅ Can login to `https://duely.online/adminpage/auth`
- ✅ Dashboard shows correct statistics
- ✅ All admin pages accessible
- ✅ Database viewer page works
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Rate limiting working
- ✅ HTTPS enforced
- ✅ Admin logs being created
- ✅ PM2 processes stable
- ✅ No errors in logs

---

## 📞 POST-DEPLOYMENT TASKS

**Week 1:**
- Monitor admin logs daily
- Check for errors
- Verify performance
- Collect feedback

**Week 2-3:**
- Optimize slow queries
- Add caching if needed
- Improve UX based on usage
- Security audit

**Month 2+:**
- Add advanced features as needed
- Implement automated reports
- Enhance monitoring
- Plan next features

---

## 🎉 PHASE 7 COMPLETE!

**Status:** READY FOR PRODUCTION ✅
**Risk Level:** LOW
**Confidence:** 95%
**Estimated Deployment Time:** 1-1.5 hours
**Rollback Time:** 10-15 minutes

**All systems ready for deployment to production!**

---

**Document Created:** November 6, 2025
**Author:** Claude Code
**Version:** 1.0
**Status:** Production Deployment Guide
