# Duely - Complete Application Documentation

**Version:** 1.0.0
**Last Updated:** November 6, 2025
**Tech Stack:** Next.js 16, React, TypeScript, Prisma, MySQL/SQLite

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Environment Setup](#environment-setup)
6. [Development Guide](#development-guide)
7. [Deployment Guide](#deployment-guide)
8. [Maintenance Guide](#maintenance-guide)
9. [Troubleshooting](#troubleshooting)
10. [Security Best Practices](#security-best-practices)

---

## Application Overview

**Duely** adalah aplikasi web untuk manajemen subscription dan tracking pengeluaran berlangganan. Aplikasi ini membantu user untuk:

- Track semua subscription mereka (Netflix, Spotify, etc.)
- Monitor pengeluaran bulanan
- Receive notifications untuk renewal subscriptions
- Manage multiple family members
- Categorize subscriptions
- Support multiple currencies

### Live Production URL
- **Production:** https://duely.online
- **Server:** VPS (IP: 72.60.107.246)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│  - Next.js Frontend (React)                              │
│  - Service Worker (Push Notifications)                   │
│  - Authentication (NextAuth)                             │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTPS
                  │
┌─────────────────▼───────────────────────────────────────┐
│               NEXT.JS SERVER (Node.js)                   │
│  - Server Components                                     │
│  - API Routes                                            │
│  - Server Actions                                        │
│  - Authentication                                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼─────────┐  ┌──────▼──────────┐
│  MySQL Database │  │  External APIs  │
│  (Production)   │  │  - Google OAuth │
│  or             │  │  - Web Push     │
│  SQLite (Local) │  │  - Payment APIs │
└─────────────────┘  └─────────────────┘
```

### Database Schema

**Main Models:**
- **User** - User accounts with subscription plans
- **Subscription** - User subscriptions (services)
- **Category** - Subscription categories
- **Member** - Family members
- **Notification** - In-app notifications
- **PushSubscription** - Web push notification subscriptions
- **Payment** - Payment transactions
- **UserSettings** - User preferences

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16.0.1 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Notifications:** Sonner (Toast)

### Backend
- **Runtime:** Node.js
- **Framework:** Next.js 16 API Routes & Server Actions
- **Authentication:** NextAuth.js v5
- **Database ORM:** Prisma 6.18.0
- **Database:**
  - Development: SQLite
  - Production: MySQL 8
- **Push Notifications:** web-push library

### Infrastructure
- **Production Server:** VPS (Ubuntu)
- **Process Manager:** PM2
- **Version Control:** Git + GitHub
- **Domain:** duely.online

### External Services
- **OAuth:** Google Sign-In
- **Payment Gateways:**
  - Stripe (planned)
  - Midtrans (planned)
  - Xendit (planned)
- **Email:** Resend API
- **Exchange Rates:** ExchangeRate-API

---

## Features

### 1. User Authentication
- ✅ Email/Password login
- ✅ Google OAuth Sign-In
- ✅ Session management (NextAuth)
- ✅ Secure password hashing

### 2. Subscription Management
- ✅ Add/Edit/Delete subscriptions
- ✅ Track billing cycles (monthly/yearly/quarterly)
- ✅ Auto-calculate next billing dates
- ✅ Subscription status tracking
- ✅ Service icons and branding

### 3. Category Management
- ✅ Custom categories
- ✅ Budget limits per category
- ✅ Color coding
- ✅ Category icons

### 4. Member Management
- ✅ Add family members
- ✅ Assign subscriptions to members
- ✅ Primary member designation
- ✅ Avatar customization

### 5. Notifications
- ✅ In-app notifications
- ✅ **Web Push Notifications** (NEW)
  - Browser notifications
  - Renewal reminders
  - Budget alerts
  - Works offline
  - Multi-device support

### 6. Dashboard & Analytics
- ✅ Overview of all subscriptions
- ✅ Monthly spending summary
- ✅ Upcoming renewals
- ✅ Spending by category
- ✅ Currency conversion

### 7. User Settings
- ✅ Currency preferences
- ✅ Language settings (EN/ID)
- ✅ Email reminder preferences
- ✅ Budget limits
- ✅ Push notification toggle

### 8. Multi-Currency Support
- ✅ IDR, USD, EUR support
- ✅ Real-time exchange rates
- ✅ Automatic currency conversion

### 9. Subscription Plans
- ✅ Free Plan (limited features)
- ✅ Pro Plan (planned)
- ✅ Business Plan (planned)

---

## Environment Setup

### Required Environment Variables

#### Development (.env)
```bash
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Push Notifications (VAPID Keys)
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"

# NextAuth v5 AUTH_SECRET
AUTH_SECRET="your-auth-secret"

# Payment Gateways (Optional)
MIDTRANS_SERVER_KEY="your-midtrans-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client"
STRIPE_SECRET_KEY="your-stripe-key"

# Email Service
RESEND_API_KEY="your-resend-api-key"

# Exchange Rate API
EXCHANGE_RATE_API_KEY="your-api-key"
EXCHANGE_RATE_API_URL="https://v6.exchangerate-api.com/v6"
```

#### Production (.env on VPS)
```bash
# Database - MySQL
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Authentication
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://duely.online"
NODE_ENV="production"

# ... (rest same as development but with production values)
```

### Generating Secrets

**1. Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

**2. Generate VAPID Keys:**
```bash
npx web-push generate-vapid-keys
```

---

## Development Guide

### Initial Setup

1. **Clone Repository:**
```bash
git clone https://github.com/xcl991/duely.git
cd duely
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Setup Environment Variables:**
```bash
cp .env.example .env
# Edit .env with your values
```

4. **Setup Database:**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

5. **Run Development Server:**
```bash
npm run dev
```

Application will be available at http://localhost:3000

### Project Structure

```
duely/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── dev.db                  # SQLite database (dev)
├── public/
│   ├── sw.js                   # Service Worker
│   └── icons/                  # App icons
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (dashboard)/       # Protected routes
│   │   ├── api/               # API routes
│   │   ├── actions/           # Server actions
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── notifications/     # Notification components
│   │   └── ...
│   ├── lib/                   # Utility libraries
│   │   ├── auth/              # Authentication
│   │   ├── push/              # Push notifications
│   │   ├── prisma.ts          # Prisma client
│   │   └── ...
│   └── types/                 # TypeScript types
├── .env                       # Environment variables
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── next.config.js             # Next.js config
```

### Development Workflow

1. **Create New Branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**

3. **Test Locally:**
```bash
npm run dev
npm run build  # Test production build
```

4. **Commit Changes:**
```bash
git add .
git commit -m "Description of changes"
```

5. **Push to GitHub:**
```bash
git push origin feature/your-feature-name
```

6. **Create Pull Request on GitHub**

### Database Changes

**1. Modify Schema:**
Edit `prisma/schema.prisma`

**2. Create Migration:**
```bash
npx prisma migrate dev --name migration_name
```

**3. Generate Prisma Client:**
```bash
npx prisma generate
```

### Adding New Features

**Example: Add New Model**

1. Edit `prisma/schema.prisma`:
```prisma
model YourModel {
  id        String   @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  @@index([userId])
}
```

2. Create migration:
```bash
npx prisma migrate dev --name add_your_model
```

3. Create API route or Server Action in `src/app/api/` or `src/app/actions/`

4. Create UI components in `src/components/`

---

## Deployment Guide

### Prerequisites
- VPS with Ubuntu
- Node.js 18+ installed
- PM2 installed globally
- MySQL 8+ installed
- Domain configured with DNS

### Initial VPS Setup

**1. Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**2. Install PM2:**
```bash
sudo npm install -g pm2
```

**3. Install MySQL:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**4. Create Database:**
```bash
sudo mysql
CREATE DATABASE duely_production;
CREATE USER 'duely_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON duely_production.* TO 'duely_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Deploy Application

**1. Clone Repository:**
```bash
cd /home/duely
git clone https://github.com/xcl991/duely.git
cd duely
```

**2. Install Dependencies:**
```bash
npm install
```

**3. Setup Environment:**
```bash
nano .env
# Add all production environment variables
```

**4. Setup Database:**
```bash
npx prisma generate
npx prisma db push  # Or prisma migrate deploy
```

**5. Build Application:**
```bash
npm run build
```

**6. Start with PM2:**
```bash
pm2 start npm --name "duely" -- start
pm2 save
pm2 startup
```

### Update Deployment

**When you push new changes:**

```bash
# SSH to VPS
ssh user@your-vps-ip

# Navigate to project
cd /home/duely/duely

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Run database migrations (if any)
npx prisma generate
npx prisma migrate deploy

# Rebuild application
npm run build

# Restart PM2
pm2 restart duely

# Check logs
pm2 logs duely --lines 50
```

### Nginx Configuration

**Install Nginx:**
```bash
sudo apt install nginx
```

**Configure:**
```bash
sudo nano /etc/nginx/sites-available/duely
```

```nginx
server {
    listen 80;
    server_name duely.online www.duely.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/duely /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Setup SSL (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d duely.online -d www.duely.online
```

---

## Maintenance Guide

### Daily Maintenance

**1. Check Application Status:**
```bash
pm2 status
pm2 logs duely --lines 50
```

**2. Monitor Server Resources:**
```bash
pm2 monit
htop
df -h  # Disk usage
```

### Weekly Maintenance

**1. Check for Errors:**
```bash
pm2 logs duely --err --lines 100
```

**2. Database Backup:**
```bash
# MySQL Backup
mysqldump -u duely_user -p duely_production > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_$(date +%Y%m%d).sql
```

**3. Check Disk Space:**
```bash
df -h
du -sh /home/duely/duely
```

### Monthly Maintenance

**1. Update Dependencies:**
```bash
npm outdated
npm update
npm audit fix
```

**2. Rotate Logs:**
```bash
pm2 flush  # Clear all logs
pm2 reloadLogs
```

**3. Database Optimization:**
```bash
mysql -u duely_user -p duely_production -e "OPTIMIZE TABLE User, Subscription, Notification, PushSubscription;"
```

**4. Security Updates:**
```bash
sudo apt update
sudo apt upgrade
```

### Backup Strategy

**Automated Daily Backup Script:**

Create `/home/duely/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/duely/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u duely_user -p'YourPassword' duely_production | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup .env file
cp /home/duely/duely/.env $BACKUP_DIR/env_$DATE.txt

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_*.txt" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to crontab:
```bash
chmod +x /home/duely/backup.sh
crontab -e
# Add: 0 2 * * * /home/duely/backup.sh
```

### Monitoring

**Setup PM2 Monitoring:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Check Application Health:**
```bash
curl -I https://duely.online
```

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

**Symptoms:** PM2 shows "errored" status

**Solutions:**
```bash
# Check logs
pm2 logs duely --err --lines 50

# Common causes:
# - Missing environment variables
grep "AUTH_SECRET\|VAPID\|DATABASE_URL" .env

# - Port already in use
lsof -i :3000
kill -9 <PID>

# - Database connection failed
mysql -u duely_user -p -e "SELECT 1"
```

#### 2. Database Connection Error

**Symptoms:** `PrismaClientInitializationError`

**Solutions:**
```bash
# Check DATABASE_URL format
cat .env | grep DATABASE_URL

# Test MySQL connection
mysql -u duely_user -p duely_production -e "SHOW TABLES;"

# Regenerate Prisma Client
npx prisma generate

# Check schema provider matches database
grep "provider" prisma/schema.prisma
```

#### 3. Push Notifications Not Working

**Symptoms:** No notifications received

**Solutions:**
```bash
# Check VAPID keys configured
node debug-push-production.js

# Check service worker registered
# Browser Console: navigator.serviceWorker.getRegistration()

# Check database table exists
mysql -u duely_user -p duely_production -e "DESCRIBE push_subscriptions;"

# Clear browser cache and re-subscribe
# Hard refresh: Ctrl+Shift+R
```

#### 4. Authentication Failed

**Symptoms:** "User not authenticated" errors

**Solutions:**
```bash
# Check AUTH_SECRET exists
grep "AUTH_SECRET" .env

# If missing, generate new one
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Restart application
pm2 restart duely

# Clear browser cookies and login again
```

#### 5. Build Failures

**Symptoms:** `npm run build` fails

**Solutions:**
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install

# Check TypeScript errors
npx tsc --noEmit

# Check for missing dependencies
npm install
```

#### 6. "Server Action Not Found" Error

**Symptoms:** Client shows server action errors after deployment

**Root Cause:** Browser cache contains old JavaScript

**Solution:**
- Users need to hard refresh (Ctrl+Shift+R)
- Or clear browser cache
- Or wait 5-10 minutes for cache to expire

#### 7. High Memory Usage

**Symptoms:** Application slow, PM2 shows high memory

**Solutions:**
```bash
# Restart application
pm2 restart duely

# Check for memory leaks in logs
pm2 logs duely | grep "heap"

# Adjust PM2 max memory
pm2 start npm --name "duely" --max-memory-restart 500M -- start
```

### Debugging Tools

**1. Production Build Verification:**
```bash
bash verify-production-build.sh
```

**2. Database Debug:**
```bash
node debug-push-production.js
```

**3. Check Prisma Schema:**
```bash
npx prisma validate
npx prisma migrate status
```

**4. Test API Endpoints:**
```bash
curl -X GET https://duely.online/api/health
curl -X POST https://duely.online/api/push/test -H "Cookie: session=..."
```

---

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` to Git
- ✅ Use strong, unique secrets for production
- ✅ Rotate secrets every 6 months
- ✅ Store backups securely

### Database
- ✅ Use strong passwords (20+ characters)
- ✅ Limit database user privileges
- ✅ Enable MySQL slow query log
- ✅ Regular backups (daily)
- ✅ Test restore procedures

### Authentication
- ✅ Use HTTPS only in production
- ✅ Implement rate limiting (future)
- ✅ Monitor failed login attempts
- ✅ Session timeout after inactivity

### API Security
- ✅ Validate all inputs
- ✅ Sanitize user data
- ✅ Use CORS properly
- ✅ Implement CSRF protection

### Server Security
- ✅ Keep OS updated
- ✅ Configure firewall (UFW)
- ✅ Use SSH key authentication
- ✅ Disable root SSH login
- ✅ Regular security audits

### Monitoring
- ✅ Monitor error logs daily
- ✅ Set up alerts for critical errors
- ✅ Track unusual access patterns
- ✅ Monitor resource usage

---

## Additional Resources

### Documentation Files
- `PUSH_NOTIFICATION_IMPLEMENTATION_SUMMARY.md` - Push notification setup
- `PUSH_NOTIFICATION_VALIDATION_REPORT.md` - Validation results
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Deployment guide
- `verify-production-build.sh` - Build verification script
- `debug-push-production.js` - Debug script

### Useful Commands Cheat Sheet

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server
npx prisma studio              # Open Prisma GUI

# Production
pm2 status                     # Check PM2 status
pm2 restart duely              # Restart app
pm2 logs duely                 # View logs
pm2 monit                      # Monitor resources
git pull origin main           # Update code

# Database
npx prisma migrate dev         # Run migrations (dev)
npx prisma migrate deploy      # Run migrations (prod)
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Push schema to DB

# Maintenance
mysqldump -u user -p db > backup.sql  # Backup database
pm2 flush                      # Clear logs
npm audit fix                  # Fix vulnerabilities
```

---

## Support & Contact

For issues or questions:
- **GitHub Issues:** https://github.com/xcl991/duely/issues
- **Documentation:** Check `.md` files in repository
- **Debug Scripts:** Use provided debug scripts for troubleshooting

---

**Last Updated:** November 6, 2025
**Maintained By:** Development Team
