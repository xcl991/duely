# Duely - Production Deployment Checklist

**Use this checklist every time you deploy to production**

---

## Pre-Deployment Checklist

### 1. Code Review
- [ ] All new code has been tested locally
- [ ] No console.log() or debug code left
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] No linting errors (`npm run lint`)
- [ ] Production build succeeds locally (`npm run build`)

### 2. Database Changes
- [ ] Database migrations created if schema changed
- [ ] Migration tested on development database
- [ ] Backup strategy planned if migration is complex
- [ ] Rollback plan prepared

### 3. Environment Variables
- [ ] All required env vars documented
- [ ] New env vars added to production `.env`
- [ ] No sensitive data in code or Git
- [ ] VAPID keys configured (for push notifications)
- [ ] AUTH_SECRET set

### 4. Dependencies
- [ ] No vulnerabilities (`npm audit`)
- [ ] Lock file updated (`package-lock.json`)
- [ ] All dependencies compatible

### 5. Testing
- [ ] Unit tests pass (if applicable)
- [ ] Manual testing complete
- [ ] Push notifications tested (if relevant)
- [ ] Authentication flows tested
- [ ] Payment flows tested (if relevant)

---

## Deployment Steps

### Step 1: Backup Production

```bash
# SSH to VPS
ssh user@72.60.107.246

# Navigate to project
cd /home/duely/duely

# Backup database
mysqldump -u duely_user -p duely_production > backup_$(date +%Y%m%d_%H%M%S).sql
gzip backup_$(date +%Y%m%d_%H%M%S).sql

# Backup current code (optional)
tar -czf backup_code_$(date +%Y%m%d_%H%M%S).tar.gz .

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

**Checklist:**
- [ ] Database backup created
- [ ] Code backup created (optional)
- [ ] Environment backup created

### Step 2: Pull Latest Code

```bash
# Check current branch
git branch

# Stash any local changes
git stash

# Pull latest changes
git pull origin main

# Check for conflicts
git status
```

**Checklist:**
- [ ] Latest code pulled
- [ ] No merge conflicts
- [ ] Correct branch (main)

### Step 3: Update Dependencies

```bash
# Install new dependencies
npm install

# Check for issues
npm audit
```

**Checklist:**
- [ ] Dependencies installed
- [ ] No critical vulnerabilities

### Step 4: Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (if any)
npx prisma migrate deploy

# Or push schema changes
npx prisma db push

# Verify migration
npx prisma migrate status
```

**Checklist:**
- [ ] Prisma Client generated
- [ ] Migrations applied
- [ ] Database schema up-to-date

### Step 5: Build Application

```bash
# Clean previous build
rm -rf .next

# Build for production
npm run build

# Check for build errors
echo $?  # Should output 0
```

**Checklist:**
- [ ] Old build cleaned
- [ ] New build successful
- [ ] No build errors

### Step 6: Update Environment (if needed)

```bash
# Check if new env vars needed
cat .env.example  # Check for new variables

# Add to .env if needed
nano .env

# Verify critical vars
grep "VAPID\|AUTH_SECRET\|DATABASE_URL" .env
```

**Checklist:**
- [ ] New env vars added
- [ ] Critical vars verified

### Step 7: Restart Application

```bash
# Restart PM2
pm2 restart duely

# Wait for startup
sleep 5

# Check status
pm2 status

# Check logs for errors
pm2 logs duely --lines 30 --nostream
```

**Checklist:**
- [ ] PM2 restarted
- [ ] Application running (status: online)
- [ ] No errors in logs

### Step 8: Verify Deployment

```bash
# Test application responds
curl -I https://duely.online

# Check PM2 status
pm2 status

# Monitor logs
pm2 logs duely --lines 50
```

**Checklist:**
- [ ] Site responding (200 OK)
- [ ] PM2 shows "online"
- [ ] No errors in logs

---

## Post-Deployment Verification

### 1. Manual Testing (In Browser)

```
1. Open https://duely.online
2. Hard refresh (Ctrl+Shift+R)
3. Clear cache if needed
```

**Test Scenarios:**
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard displays correctly
- [ ] Can create/edit subscription
- [ ] Notifications work
- [ ] Push notifications work (if enabled)
- [ ] Settings save correctly
- [ ] No JavaScript errors in console

### 2. Production Health Check

**Run verification script:**
```bash
cd /home/duely/duely
bash verify-production-build.sh
```

**Expected Output:**
- [ ] ✓ .next directory exists
- [ ] ✓ VAPID keys found
- [ ] ✓ PM2 process running
- [ ] ✓ Application responding
- [ ] ✓ Database connection OK

### 3. Monitor for Issues

```bash
# Monitor logs for 5 minutes
pm2 logs duely

# Check for errors
pm2 logs duely --err --lines 50

# Monitor resource usage
pm2 monit
```

**Check for:**
- [ ] No authentication errors
- [ ] No database errors
- [ ] No memory leaks
- [ ] Response times normal

---

## Rollback Procedure

**If deployment fails:**

### Option 1: Rollback Code

```bash
# Find previous commit
git log --oneline -5

# Rollback to previous commit
git reset --hard <commit-hash>

# Rebuild
npm run build

# Restart
pm2 restart duely
```

### Option 2: Rollback Database

```bash
# Find backup file
ls -lh backup_*.sql.gz

# Restore database
gunzip backup_YYYYMMDD_HHMMSS.sql.gz
mysql -u duely_user -p duely_production < backup_YYYYMMDD_HHMMSS.sql

# Restart application
pm2 restart duely
```

### Option 3: Restore .env

```bash
# Find backup
ls -la .env.backup.*

# Restore
cp .env.backup.YYYYMMDD_HHMMSS .env

# Restart
pm2 restart duely
```

**Rollback Checklist:**
- [ ] Issue identified
- [ ] Rollback method chosen
- [ ] Rollback executed
- [ ] Application verified working
- [ ] Incident documented

---

## Common Post-Deployment Issues

### Issue: Users See Old Version

**Cause:** Browser cache

**Solution:**
```
Users need to:
1. Hard refresh (Ctrl+Shift+R)
2. Or clear browser cache
3. Or wait 5-10 minutes for cache expiry
```

### Issue: "Server Action Not Found"

**Cause:** Browser has old JavaScript, server has new build

**Solution:**
- Same as above - users need hard refresh
- This is expected and normal after deployment

### Issue: Authentication Errors

**Cause:** AUTH_SECRET missing or changed

**Solution:**
```bash
# Check AUTH_SECRET exists
grep "AUTH_SECRET" .env

# If missing, add it
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Restart
pm2 restart duely

# Users need to clear cookies and login again
```

### Issue: Push Notifications Not Working

**Cause:** VAPID keys not in .env or build didn't include them

**Solution:**
```bash
# Verify VAPID keys
node debug-push-production.js

# If missing, add to .env
nano .env

# Rebuild
rm -rf .next
npm run build

# Restart
pm2 restart duely
```

---

## Emergency Contacts

**Server Issues:**
- VPS Provider Support
- Server IP: 72.60.107.246

**Domain Issues:**
- Domain Registrar Support
- Domain: duely.online

**Database Issues:**
- Backup Location: `/home/duely/backups/`
- Latest backup command: `ls -lht /home/duely/backups/ | head -5`

---

## Post-Deployment Report Template

```markdown
## Deployment Report

**Date:** YYYY-MM-DD HH:MM
**Deployed By:** Your Name
**Git Commit:** [commit hash]

### Changes Deployed:
- [ ] Feature 1
- [ ] Bug fix 2
- [ ] Database migration

### Deployment Duration:
Start: HH:MM
End: HH:MM
Total: XX minutes

### Issues Encountered:
- None / [Description]

### Verification Status:
- [ ] All tests passed
- [ ] Production responding
- [ ] No errors in logs
- [ ] Manual testing complete

### Rollback Status:
- [ ] Not needed
- [ ] Executed successfully
- [ ] Partial (explain)

### Notes:
[Any additional notes or observations]
```

---

## Quick Command Reference

```bash
# Deployment workflow
cd /home/duely/duely
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart duely
pm2 logs duely --lines 50

# Verification
bash verify-production-build.sh
curl -I https://duely.online
pm2 status

# Troubleshooting
pm2 logs duely --err --lines 100
node debug-push-production.js
npx prisma migrate status
```

---

**Remember:**
1. Always backup before deployment
2. Test in staging/local first
3. Monitor logs after deployment
4. Have rollback plan ready
5. Document any issues

**Questions? Check:**
- `DUELY_COMPLETE_DOCUMENTATION.md` - Full documentation
- `TROUBLESHOOTING.md` - Common issues
- PM2 logs - `pm2 logs duely`

---

**Last Updated:** November 6, 2025
