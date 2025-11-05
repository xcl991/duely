# Duely - Complete Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [System Configuration](#system-configuration)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [Web Server Configuration](#web-server-configuration)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Environment Variables](#environment-variables)
9. [Maintenance & Operations](#maintenance--operations)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services
- **VPS**: Hostinger/DigitalOcean/Linode (Minimum: 2GB RAM, 1 vCPU)
- **Domain**: From Namecheap/GoDaddy/Cloudflare
- **GitHub Account**: For code repository
- **Email**: For SSL certificate notifications

### Recommended Specs
- **RAM**: 4GB (optimal for 500-1000 concurrent users)
- **CPU**: 1-2 vCPUs
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

---

## VPS Initial Setup

### Step 1: Access VPS

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Enter password when prompted
```

### Step 2: Create Non-Root User

```bash
# Create user 'duely'
adduser duely

# Set strong password when prompted

# Add to sudo group
usermod -aG sudo duely

# Switch to duely user
su - duely
```

### Step 3: Update System

```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential ufw
```

---

## System Configuration

### Step 1: Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow OpenSSH

# Allow Nginx (HTTP/HTTPS)
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### Step 2: Install Node.js 20.x LTS

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 3: Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 4: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx

# Enable auto-start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## Database Setup

### Step 1: Install MySQL 8.0

```bash
# Install MySQL server
sudo apt install -y mysql-server

# Start MySQL
sudo systemctl start mysql

# Enable auto-start
sudo systemctl enable mysql
```

### Step 2: Secure MySQL Installation

```bash
# Run security script
sudo mysql_secure_installation

# Answer prompts:
# - Setup VALIDATE PASSWORD component? Y
# - Password validation policy level: 2 (STRONG)
# - Remove anonymous users? Y
# - Disallow root login remotely? Y
# - Remove test database? Y
# - Reload privilege tables? Y
```

### Step 3: Create Production Database

```bash
# Login to MySQL
sudo mysql

# Run these SQL commands:
```

```sql
-- Set root password
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourStrongRootPassword123!';

-- Create production database
CREATE DATABASE duely_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'duely_user'@'localhost' IDENTIFIED BY 'YourStrongUserPassword456!';

-- Grant privileges
GRANT ALL PRIVILEGES ON duely_production.* TO 'duely_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

**Save these credentials securely!**

---

## Application Deployment

### Step 1: Prepare Local Repository

On your **local machine** (Windows):

```powershell
# Navigate to project directory
cd F:\Duely\Workspace

# Initialize git (if not already)
git init

# Add safe directory (Windows)
git config --global --add safe.directory F:/Duely/Workspace

# Add remote repository (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/duely.git

# Commit all files
git add .
git commit -m "Production ready deployment"

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: Make repository public for easier deployment, or use Personal Access Token for private repos.

### Step 2: Clone Repository to VPS

On **VPS**:

```bash
# Navigate to home directory
cd ~

# Clone repository (replace with your repo URL)
git clone https://github.com/YOUR_USERNAME/duely.git

# Navigate to project
cd duely

# Install dependencies
npm install
```

### Step 3: Configure Environment Variables

```bash
# Create production environment file
cd ~/duely
nano .env
```

**Paste this content** (update values with your actual credentials):

```env
# Database
DATABASE_URL="mysql://duely_user:YourStrongUserPassword456!@localhost:3306/duely_production"

# NextAuth
NEXTAUTH_SECRET="generate-random-32-char-string-here"
NEXTAUTH_URL="https://yourdomain.com"

# Node Environment
NODE_ENV="production"

# Payment Gateways - Midtrans (Sandbox)
MIDTRANS_SERVER_KEY="SB-Mid-server-your-sandbox-key"
MIDTRANS_CLIENT_KEY="SB-Mid-client-your-sandbox-key"

# Payment Gateways - Doku (Sandbox)
DOKU_CLIENT_ID="your-doku-sandbox-client-id"
DOKU_SHARED_KEY="your-doku-sandbox-shared-key"

# Email Service (Optional - for password reset)
RESEND_API_KEY="re_your_resend_api_key"

# Legacy Payment Gateways (for compatibility)
STRIPE_SECRET_KEY="sk_test_dummy"

# Exchange Rate API
EXCHANGE_RATE_API_KEY="your-exchangerate-api-key"
```

**Save**: `Ctrl+X`, then `Y`, then `Enter`

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### Step 4: Setup Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Verify database connection
npx prisma studio --port 5555
# Open in browser: http://YOUR_VPS_IP:5555
# Ctrl+C to stop after verification
```

### Step 5: Build Application

```bash
# Build Next.js for production
npm run build

# This will take 2-5 minutes
# Wait for "✓ Compiled successfully" message
```

### Step 6: Configure PM2

```bash
# Create PM2 ecosystem file
cd ~/duely
nano ecosystem.config.js
```

**Paste this content**:

```javascript
module.exports = {
  apps: [{
    name: 'duely',
    script: 'npm',
    args: 'start',
    cwd: '/home/duely/duely',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/duely/logs/pm2-error.log',
    out_file: '/home/duely/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

**Save**: `Ctrl+X`, `Y`, `Enter`

```bash
# Create logs directory
mkdir -p ~/logs

# Start application with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs duely --lines 50

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u duely --hp /home/duely

# Copy the command PM2 outputs and run it with sudo
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u duely --hp /home/duely
```

---

## Web Server Configuration

### Step 1: Configure DNS

**At your domain registrar (Namecheap/GoDaddy):**

1. Go to DNS Management
2. Add/Update these records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | YOUR_VPS_IP | Automatic |
| A Record | www | YOUR_VPS_IP | Automatic |

**Or use CNAME for www:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | YOUR_VPS_IP | Automatic |
| CNAME | www | yourdomain.com | Automatic |

Wait 5-30 minutes for DNS propagation.

**Verify DNS**:
```bash
nslookup yourdomain.com
dig yourdomain.com +short
```

### Step 2: Configure Nginx

```bash
# Create Nginx site configuration
sudo nano /etc/nginx/sites-available/yourdomain.com
```

**Paste this configuration** (replace `yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js app
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

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Logs
    access_log /var/log/nginx/yourdomain.com.access.log;
    error_log /var/log/nginx/yourdomain.com.error.log;
}
```

**Save**: `Ctrl+X`, `Y`, `Enter`

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 3: Test HTTP Access

Visit `http://yourdomain.com` in browser - should show your website!

---

## SSL Certificate Setup

### Step 1: Install Certbot

```bash
# Update package list
sudo apt update

# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Obtain SSL Certificate

```bash
# Get certificate (replace email and domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com \
  --non-interactive --agree-tos \
  --email your-email@example.com \
  --redirect

# This will:
# 1. Verify domain ownership
# 2. Generate SSL certificate
# 3. Auto-configure Nginx for HTTPS
# 4. Setup auto-redirect HTTP → HTTPS
```

### Step 3: Verify SSL

Visit `https://yourdomain.com` - should show green lock icon!

### Step 4: Test Auto-Renewal

```bash
# Test renewal process (dry run)
sudo certbot renew --dry-run

# Auto-renewal is already configured via systemd timer
# Check renewal timer status
sudo systemctl status certbot.timer
```

---

## Environment Variables

### Complete .env Reference

Create/edit with: `nano ~/duely/.env`

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="mysql://duely_user:PASSWORD@localhost:3306/duely_production"

# ===========================================
# NEXTAUTH
# ===========================================
NEXTAUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="https://yourdomain.com"

# ===========================================
# NODE ENVIRONMENT
# ===========================================
NODE_ENV="production"

# ===========================================
# PAYMENT - MIDTRANS (Indonesia)
# ===========================================
# Sandbox (Testing)
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxx"

# Production (Live)
# MIDTRANS_SERVER_KEY="Mid-server-xxxxxxxxxxxx"
# MIDTRANS_CLIENT_KEY="Mid-client-xxxxxxxxxxxx"

# ===========================================
# PAYMENT - DOKU (Indonesia)
# ===========================================
# Sandbox (Testing)
DOKU_CLIENT_ID="your-sandbox-client-id"
DOKU_SHARED_KEY="your-sandbox-shared-key"

# Production (Live)
# DOKU_CLIENT_ID="your-production-client-id"
# DOKU_SHARED_KEY="your-production-shared-key"

# ===========================================
# EMAIL SERVICE - RESEND
# ===========================================
RESEND_API_KEY="re_your_api_key_here"

# ===========================================
# EXCHANGE RATE API
# ===========================================
EXCHANGE_RATE_API_KEY="your-exchangerate-api-key"

# ===========================================
# LEGACY PAYMENT (Compatibility)
# ===========================================
STRIPE_SECRET_KEY="sk_test_dummy"
```

### How to Get API Keys

**1. Midtrans (https://dashboard.midtrans.com)**
- Sign up for free account
- Go to Settings → Access Keys
- Copy Server Key and Client Key
- Use Sandbox keys for testing (starts with `SB-Mid-`)

**2. Doku (https://dashboard.doku.com)**
- Register business account
- Complete KYC verification
- Go to Settings → API Credentials
- Copy Client ID and Shared Key

**3. Resend (https://resend.com)**
- Sign up for free (3,000 emails/month)
- Go to API Keys
- Create new API key
- Copy the key (starts with `re_`)

**4. ExchangeRate-API (https://www.exchangerate-api.com)**
- Sign up for free (1,500 requests/month)
- Go to Dashboard
- Copy your API key

**After updating .env**:
```bash
# Restart application to load new variables
pm2 restart duely
```

---

## Maintenance & Operations

### Daily Operations

#### Check Application Status
```bash
# Check PM2 process
pm2 status

# View live logs
pm2 logs duely

# View last 50 lines
pm2 logs duely --lines 50

# Monitor resources
pm2 monit
```

#### Check Server Resources
```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU usage
top

# Press 'q' to exit top
```

#### Check Nginx Status
```bash
# Status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View access logs
sudo tail -f /var/log/nginx/yourdomain.com.access.log

# View error logs
sudo tail -f /var/log/nginx/yourdomain.com.error.log
```

### Application Updates

#### Update from GitHub
```bash
# Navigate to app directory
cd ~/duely

# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart duely

# Check status
pm2 status
pm2 logs duely --lines 20
```

#### Update Environment Variables
```bash
# Edit .env file
nano ~/duely/.env

# Make your changes
# Save: Ctrl+X, Y, Enter

# Restart application
pm2 restart duely
```

### Database Operations

#### Backup Database
```bash
# Create backup
mysqldump -u duely_user -p duely_production > ~/backup-$(date +%Y%m%d-%H%M%S).sql

# Enter password when prompted

# Verify backup file
ls -lh ~/backup-*.sql
```

#### Restore Database
```bash
# Restore from backup
mysql -u duely_user -p duely_production < ~/backup-20251105-120000.sql

# Enter password when prompted
```

#### Run Migrations
```bash
cd ~/duely

# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Or run migrations if you have migration files
npx prisma migrate deploy
```

### Update Exchange Rates

```bash
# Manual update via API
curl http://localhost:3000/api/exchange-rates/update

# Should return: {"success":true,...}
```

**Setup Automatic Updates** (Optional):

```bash
# Edit crontab
crontab -e

# Add this line to update every 6 hours:
0 */6 * * * curl http://localhost:3000/api/exchange-rates/update > /dev/null 2>&1

# Save and exit
```

### SSL Certificate Renewal

```bash
# Certificates auto-renew via systemd timer
# Check renewal timer
sudo systemctl status certbot.timer

# Manual renewal (if needed)
sudo certbot renew

# Test renewal without actually renewing
sudo certbot renew --dry-run
```

### PM2 Process Management

```bash
# Restart application
pm2 restart duely

# Stop application
pm2 stop duely

# Start application
pm2 start duely

# Delete from PM2
pm2 delete duely

# Restart from ecosystem file
pm2 start ecosystem.config.js

# View detailed info
pm2 info duely

# Flush logs
pm2 flush

# Save PM2 state
pm2 save
```

### Log Management

#### View Application Logs
```bash
# PM2 logs
pm2 logs duely

# Error logs only
tail -f ~/logs/pm2-error.log

# Output logs only
tail -f ~/logs/pm2-out.log

# Nginx access logs
sudo tail -f /var/log/nginx/yourdomain.com.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/yourdomain.com.error.log
```

#### Clean Old Logs
```bash
# Clear PM2 logs
pm2 flush

# Rotate Nginx logs (automatic via logrotate)
sudo logrotate -f /etc/logrotate.d/nginx
```

### Security Updates

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Update Node.js packages
cd ~/duely
npm update

# Rebuild after updates
npm run build
pm2 restart duely

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Troubleshooting

### Application Won't Start

**Check PM2 logs**:
```bash
pm2 logs duely --err

# Look for errors like:
# - Database connection failed
# - Port already in use
# - Missing environment variables
```

**Solutions**:
```bash
# Check if port 3000 is in use
sudo netstat -tlnp | grep :3000

# Kill process on port 3000 if needed
sudo kill -9 <PID>

# Verify .env file exists and is readable
ls -la ~/duely/.env
cat ~/duely/.env

# Rebuild and restart
cd ~/duely
npm run build
pm2 restart duely
```

### Database Connection Error

**Check MySQL status**:
```bash
sudo systemctl status mysql

# If not running
sudo systemctl start mysql
```

**Test database connection**:
```bash
mysql -u duely_user -p duely_production

# Enter password
# If successful, you'll see mysql> prompt
# Type: EXIT;
```

**Check DATABASE_URL in .env**:
```bash
cat ~/duely/.env | grep DATABASE_URL

# Should match:
# DATABASE_URL="mysql://duely_user:PASSWORD@localhost:3306/duely_production"
```

### Nginx 502 Bad Gateway

**Check if application is running**:
```bash
pm2 status

# Should show 'online'
# If stopped:
pm2 start duely
```

**Check if app listens on port 3000**:
```bash
sudo netstat -tlnp | grep :3000

# Should show node process listening on 0.0.0.0:3000
```

**Test app directly**:
```bash
curl http://localhost:3000

# Should return HTML
```

### SSL Certificate Issues

**Certificate expired**:
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Restart Nginx
sudo systemctl restart nginx
```

**Certificate won't issue**:
```bash
# Check DNS is pointing to your server
nslookup yourdomain.com

# Should return your VPS IP

# Check port 80 is accessible
sudo netstat -tlnp | grep :80

# Check firewall
sudo ufw status

# Ensure Nginx Full is allowed
sudo ufw allow 'Nginx Full'
```

### Website Slow/High Memory

**Check resource usage**:
```bash
# Memory
free -h

# CPU
top

# Press 'q' to exit
```

**Restart application**:
```bash
pm2 restart duely
```

**Check for memory leaks**:
```bash
pm2 monit

# Watch memory usage over time
# If constantly increasing, there may be a memory leak
```

**Optimize PM2 config**:
```bash
nano ~/duely/ecosystem.config.js

# Adjust max_memory_restart:
max_memory_restart: '500M'  # Restart if exceeds 500MB

# Save and restart
pm2 restart duely
```

### Payment Gateway Errors

**Check API keys**:
```bash
cat ~/duely/.env | grep MIDTRANS
cat ~/duely/.env | grep DOKU

# Verify keys are correct (not placeholder values)
```

**Test API endpoint**:
```bash
curl http://localhost:3000/api/payment/create-checkout \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"planId":"test","provider":"midtrans"}'

# Check response for errors
```

**Check logs**:
```bash
pm2 logs duely --lines 100 | grep -i "payment\|midtrans\|doku"
```

### Exchange Rate Not Updating

**Manual update**:
```bash
curl http://localhost:3000/api/exchange-rates/update

# Should return: {"success":true}
```

**Check API key**:
```bash
cat ~/duely/.env | grep EXCHANGE_RATE

# Verify key is set correctly
```

**Check cron job** (if configured):
```bash
crontab -l

# Should show cron entry for exchange rate updates
```

### Can't SSH into VPS

**Check from local machine**:
```bash
# Test connection
ssh duely@YOUR_VPS_IP -v

# -v flag shows verbose output for debugging
```

**If locked out**:
- Use VPS provider's web console (Hostinger/DO dashboard)
- Check firewall didn't block SSH:
  ```bash
  sudo ufw status
  sudo ufw allow OpenSSH
  ```

### Disk Full

**Check disk usage**:
```bash
df -h

# Find large files
du -h --max-depth=1 ~/ | sort -hr
du -h --max-depth=1 /var/log | sort -hr
```

**Clean up**:
```bash
# Clean npm cache
npm cache clean --force

# Clean PM2 logs
pm2 flush

# Clean old logs
sudo journalctl --vacuum-time=7d

# Clean apt cache
sudo apt clean
sudo apt autoremove -y
```

---

## Quick Reference Commands

### Application
```bash
# Start
pm2 start duely

# Stop
pm2 stop duely

# Restart
pm2 restart duely

# Logs
pm2 logs duely

# Status
pm2 status
```

### Nginx
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx
```

### Database
```bash
# Backup
mysqldump -u duely_user -p duely_production > backup.sql

# Restore
mysql -u duely_user -p duely_production < backup.sql

# Login
mysql -u duely_user -p duely_production
```

### System
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Check disk
df -h

# Check memory
free -h

# Check processes
top

# Reboot (if needed)
sudo reboot
```

---

## Production Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Database backed up
- [ ] SSL certificate active and valid
- [ ] DNS pointing to correct IP
- [ ] Firewall configured (UFW)
- [ ] PM2 auto-startup configured
- [ ] Nginx properly configured
- [ ] Payment gateways tested (sandbox)
- [ ] Email service configured
- [ ] Exchange rates populated
- [ ] Application accessible via HTTPS
- [ ] Logs are being written correctly
- [ ] Server resources monitored
- [ ] Backup strategy in place

---

## Support & Resources

### Official Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- PM2: https://pm2.keymetrics.io/docs
- Nginx: https://nginx.org/en/docs

### Payment Gateways
- Midtrans: https://docs.midtrans.com
- Doku: https://docs.doku.com

### Services
- Let's Encrypt: https://letsencrypt.org/docs
- Resend: https://resend.com/docs
- ExchangeRate-API: https://www.exchangerate-api.com/docs

---

## Deployment Information

**Deployed**: November 5, 2025
**Domain**: https://duely.online
**Server**: Hostinger VPS (72.60.107.246)
**Stack**: Next.js 16.0.1, MySQL 8.0, Nginx, PM2
**Node**: v20.x LTS
**OS**: Ubuntu 22.04 LTS

**Maintainer**: Steven (stevenoklizz@gmail.com)

---

*This guide was created during the production deployment of Duely subscription tracking platform.*
