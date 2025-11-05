# Deployment Guide: Duely on Hostinger VPS

Complete step-by-step guide untuk deploy Duely aplikasi ke Hostinger VPS dengan domain duely.online dari Namecheap.

## 📋 Prerequisites

- ✅ Hostinger VPS account (KVM atau LiteSpeed)
- ✅ Domain duely.online dari Namecheap
- ✅ SSH access ke VPS
- ✅ Root atau sudo access

## 🎯 Deployment Overview

```
Namecheap DNS → Hostinger VPS IP → Nginx → Next.js App (PM2) → MySQL Database
```

---

## Part 1: Initial VPS Setup

### Step 1: Connect to VPS

```bash
# Get VPS IP dari Hostinger dashboard
# Connect via SSH
ssh root@your-vps-ip

# Atau jika menggunakan user lain:
ssh username@your-vps-ip
```

### Step 2: Update System

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 3: Create Deploy User (Recommended)

```bash
# Create non-root user untuk security
sudo adduser duely

# Add to sudo group
sudo usermod -aG sudo duely

# Switch to new user
su - duely
```

---

## Part 2: Install Required Software

### Step 4: Install Node.js (v20.x LTS)

```bash
# Install Node.js menggunakan NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

### Step 5: Install MySQL Database

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

**MySQL Secure Installation Answers:**
- Set root password? **YES** → [your-strong-password]
- Remove anonymous users? **YES**
- Disallow root login remotely? **YES**
- Remove test database? **YES**
- Reload privilege tables? **YES**

### Step 6: Create Production Database

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE duely_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'duely_user'@'localhost' IDENTIFIED BY 'your-strong-db-password';
GRANT ALL PRIVILEGES ON duely_production.* TO 'duely_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Test connection
mysql -u duely_user -p duely_production
# If successful, exit
EXIT;
```

### Step 7: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Allow through firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Step 8: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
# Follow the command it outputs

# Verify
pm2 --version
```

---

## Part 3: Domain Configuration

### Step 9: Configure DNS di Namecheap

1. **Login ke Namecheap**
   - Go to: https://ap.www.namecheap.com/domains/list/
   - Click "Manage" next to duely.online

2. **Set Custom DNS (Option A - Recommended)**
   ```
   Advanced DNS → Host Records:

   Type    Host    Value                    TTL
   A       @       your-vps-ip-address      Automatic
   A       www     your-vps-ip-address      Automatic
   CNAME   *       duely.online             Automatic
   ```

3. **Or Use Namecheap BasicDNS (Option B)**
   ```
   Domain → Nameservers → Custom DNS:

   dns1.registrar-servers.com
   dns2.registrar-servers.com
   ```

4. **Wait for DNS Propagation** (5-30 minutes)
   ```bash
   # Check DNS propagation
   nslookup duely.online
   dig duely.online
   ```

---

## Part 4: Deploy Application

### Step 10: Clone Repository

```bash
# Navigate to home directory
cd ~

# If using Git (recommended)
git clone https://github.com/yourusername/duely.git
cd duely

# Or upload via SFTP/SCP from local
# scp -r F:\Duely\Workspace root@your-vps-ip:/home/duely/duely
```

### Step 11: Install Dependencies

```bash
cd ~/duely
npm install

# Install Prisma CLI if needed
npm install -D prisma
```

### Step 12: Configure Environment Variables

```bash
# Create production environment file
nano .env.production

# Or
vim .env.production
```

**Add the following (replace with your actual values):**

```env
# Database
DATABASE_URL="mysql://duely_user:your-strong-db-password@localhost:3306/duely_production"

# NextAuth
NEXTAUTH_SECRET="your-very-long-random-secret-minimum-32-chars"
NEXTAUTH_URL="https://duely.online"

# Node Environment
NODE_ENV="production"

# Payment Gateways
# Get sandbox keys first for testing, then switch to production

# Midtrans (Get from: https://dashboard.midtrans.com)
MIDTRANS_SERVER_KEY="Mid-server-your-production-key"
MIDTRANS_CLIENT_KEY="Mid-client-your-production-key"

# Doku (Get from: https://dashboard.doku.com)
DOKU_CLIENT_ID="your-production-client-id"
DOKU_SHARED_KEY="your-production-shared-key"

# Optional: OAuth (if needed)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
# Generate secure random string
openssl rand -base64 32
```

### Step 13: Setup Database

```bash
# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Optional: Seed database
npx prisma db seed
```

### Step 14: Build Application

```bash
# Build Next.js for production
npm run build

# This creates optimized production build in .next folder
```

### Step 15: Test Application Locally

```bash
# Start app to test
npm start

# Should start on port 3000
# Press Ctrl+C to stop
```

---

## Part 5: Setup PM2 Process Manager

### Step 16: Create PM2 Ecosystem File

```bash
# Create ecosystem config
nano ecosystem.config.js
```

**Add this configuration:**

```javascript
module.exports = {
  apps: [{
    name: 'duely',
    script: 'npm',
    args: 'start',
    cwd: '/home/duely/duely',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### Step 17: Start Application with PM2

```bash
# Create logs directory
mkdir -p ~/duely/logs

# Start app with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Enable PM2 startup on boot
pm2 startup
# Run the command it outputs

# Check status
pm2 status
pm2 logs duely

# Useful PM2 commands:
# pm2 restart duely    # Restart app
# pm2 stop duely       # Stop app
# pm2 delete duely     # Remove from PM2
# pm2 monit            # Monitor in real-time
```

---

## Part 6: Configure Nginx Reverse Proxy

### Step 18: Create Nginx Configuration

```bash
# Create Nginx config for duely.online
sudo nano /etc/nginx/sites-available/duely.online
```

**Add this configuration:**

```nginx
# Redirect HTTP to HTTPS (will be enabled after SSL setup)
server {
    listen 80;
    listen [::]:80;
    server_name duely.online www.duely.online;

    # Temporary: Proxy to Next.js (before SSL)
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

### Step 19: Enable Site and Test Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/duely.online /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### Step 20: Test Website

```bash
# Your site should now be accessible at:
# http://duely.online
# http://www.duely.online

# Test from browser or:
curl http://duely.online
```

---

## Part 7: Setup SSL Certificate (HTTPS)

### Step 21: Install Certbot

```bash
# Install Certbot for Nginx
sudo apt install -y certbot python3-certbot-nginx
```

### Step 22: Obtain SSL Certificate

```bash
# Get certificate for both duely.online and www.duely.online
sudo certbot --nginx -d duely.online -d www.duely.online

# Follow the prompts:
# - Enter email address (for renewal notifications)
# - Agree to Terms of Service: Yes
# - Share email with EFF: Your choice
# - Redirect HTTP to HTTPS: 2 (Yes, recommended)
```

### Step 23: Verify SSL Certificate

```bash
# Test automatic renewal
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates

# Your site should now be accessible at:
# https://duely.online (with valid SSL!)
```

### Step 24: Update Nginx Configuration (Final)

Certbot should have updated your Nginx config automatically. Verify:

```bash
sudo nano /etc/nginx/sites-available/duely.online
```

**Should look like this:**

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name duely.online www.duely.online;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name duely.online www.duely.online;

    # SSL Configuration (added by Certbot)
    ssl_certificate /etc/letsencrypt/live/duely.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/duely.online/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Next.js
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

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml text/javascript;

    # Client max body size (for file uploads)
    client_max_body_size 10M;
}
```

```bash
# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## Part 8: Configure Payment Gateway Webhooks

### Step 25: Setup Webhook URLs

**Midtrans Dashboard:**
1. Login: https://dashboard.midtrans.com
2. Go to Settings → Configuration
3. Set Payment Notification URL:
   ```
   https://duely.online/api/payment/webhook/midtrans
   ```

**Doku Dashboard:**
1. Login: https://dashboard.doku.com
2. Go to Settings → Webhook Configuration
3. Set Notification URL:
   ```
   https://duely.online/api/payment/webhook/doku
   ```

### Step 26: Create Webhook Routes (if not exists)

```bash
cd ~/duely
mkdir -p src/app/api/payment/webhook/midtrans
mkdir -p src/app/api/payment/webhook/doku
```

Create webhook handlers - refer to `PAYMENT_GATEWAY_SETUP.md` for implementation details.

---

## Part 9: Monitoring & Maintenance

### Step 27: Setup Monitoring

```bash
# Monitor PM2 processes
pm2 monit

# View logs
pm2 logs duely

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Step 28: Setup Log Rotation

```bash
# Create logrotate config for PM2
sudo nano /etc/logrotate.d/duely
```

**Add:**

```
/home/duely/duely/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 duely duely
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Step 29: Setup Automatic Backups

```bash
# Create backup script
nano ~/backup-duely.sh
```

**Add:**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/duely/backups"
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u duely_user -p'your-strong-db-password' duely_production > $BACKUP_DIR/db_$DATE.sql

# Backup application files (optional)
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /home/duely duely --exclude=node_modules --exclude=.next

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x ~/backup-duely.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

**Add this line:**
```
0 2 * * * /home/duely/backup-duely.sh >> /home/duely/backup.log 2>&1
```

---

## Part 10: Deployment Workflow

### For Future Updates:

```bash
# 1. SSH to VPS
ssh duely@your-vps-ip

# 2. Navigate to app directory
cd ~/duely

# 3. Pull latest changes
git pull origin main

# 4. Install new dependencies (if any)
npm install

# 5. Run database migrations (if any)
npx prisma migrate deploy

# 6. Rebuild application
npm run build

# 7. Restart with PM2
pm2 restart duely

# 8. Check logs
pm2 logs duely
```

### Rollback if Issues:

```bash
# Rollback to previous commit
git reset --hard HEAD~1
npm install
npm run build
pm2 restart duely
```

---

## 🔒 Security Checklist

- [ ] Changed default SSH port (optional but recommended)
- [ ] Disabled root SSH login
- [ ] Setup UFW firewall
- [ ] Strong database password
- [ ] HTTPS enabled with SSL certificate
- [ ] NextAuth secret is strong and random
- [ ] Environment variables secured
- [ ] Regular backups enabled
- [ ] Log rotation configured
- [ ] Payment webhooks verified

---

## 🐛 Troubleshooting

### Issue: App not starting

```bash
# Check PM2 logs
pm2 logs duely

# Check app directly
cd ~/duely
npm start

# Common fixes:
# - Check DATABASE_URL in .env.production
# - Ensure MySQL is running: sudo systemctl status mysql
# - Check Node.js version: node --version
```

### Issue: 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart duely
sudo systemctl restart nginx
```

### Issue: Database connection failed

```bash
# Test database connection
mysql -u duely_user -p duely_production

# Check DATABASE_URL format
# Should be: mysql://user:password@localhost:3306/database_name

# Check MySQL is running
sudo systemctl status mysql
```

### Issue: DNS not resolving

```bash
# Check DNS propagation
nslookup duely.online
dig duely.online

# Flush local DNS cache (on your computer)
# Windows: ipconfig /flushdns
# Mac: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches
```

---

## 📊 Performance Optimization

### Enable Swap (if low RAM)

```bash
# Check current swap
sudo swapon --show

# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Optimize MySQL

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

**Add/modify:**
```ini
[mysqld]
max_connections = 50
key_buffer_size = 16M
thread_cache_size = 4
query_cache_size = 16M
innodb_buffer_pool_size = 256M
```

```bash
sudo systemctl restart mysql
```

---

## 🎉 Deployment Complete!

Your Duely app should now be live at:
- **https://duely.online**
- **https://www.duely.online**

Next steps:
1. Test payment flow dengan sandbox credentials
2. Setup monitoring (optional: UptimeRobot, Pingdom)
3. Configure production payment gateway keys
4. Test all features thoroughly
5. Set up regular backups schedule

---

## 📞 Support Resources

- **Hostinger Support:** https://www.hostinger.com/contact
- **Namecheap Support:** https://www.namecheap.com/support/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **PM2 Documentation:** https://pm2.keymetrics.io/docs/
- **Let's Encrypt:** https://letsencrypt.org/docs/

---

**Created by:** Duely Deployment Team
**Last Updated:** 2025-01-05
**Version:** 1.0
