# Profile Photo Upload Fix Guide

## Problem
Profile photos are uploading but returning 404 errors when trying to display them.

**Error**: `GET https://duely.online/uploads/profiles/cmhlxawft0000kroj6u26ye4i-1762343405332.jpg 404 (Not Found)`

## Root Cause
The upload API saves files to `public/uploads/profiles/` directory, but this directory might not exist on the VPS, or Nginx is not properly configured to serve these static files.

## Solution Steps

### Step 1: SSH into VPS
```bash
ssh duely@srv1107423.hstgr.cloud
```

### Step 2: Check Current Directory Structure
```bash
cd ~/duely
ls -la public/
ls -la public/uploads/ 2>/dev/null || echo "uploads directory does not exist"
```

### Step 3: Create Upload Directory with Proper Permissions
```bash
cd ~/duely
mkdir -p public/uploads/profiles
chmod 755 public/uploads
chmod 755 public/uploads/profiles
ls -la public/uploads/profiles/
```

### Step 4: Check Nginx Configuration
```bash
sudo cat /etc/nginx/sites-available/duely.online | grep -A 10 "location"
```

### Step 5: Update Nginx Configuration to Serve Uploaded Files

The current Nginx config proxies everything to Next.js. We need to add a specific location block to serve uploaded files directly.

```bash
sudo nano /etc/nginx/sites-available/duely.online
```

Add this location block BEFORE the main `location /` block (around line 10-15):

```nginx
    # Serve uploaded files directly
    location /uploads/ {
        alias /home/duely/duely/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
```

The complete server block should look like this:

```nginx
server {
    server_name duely.online www.duely.online;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Serve uploaded files directly
    location /uploads/ {
        alias /home/duely/duely/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

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

    access_log /var/log/nginx/duely.online.access.log;
    error_log /var/log/nginx/duely.online.error.log;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/duely.online/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/duely.online/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.duely.online) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = duely.online) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name duely.online www.duely.online;
    return 404; # managed by Certbot
}
```

**Important Notes:**
- Add the `/uploads/` location block BEFORE the main `location /` block
- The `alias` directive must end with a trailing slash
- The `location` path must also end with a trailing slash

### Step 6: Test Nginx Configuration
```bash
sudo nginx -t
```

You should see:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 7: Reload Nginx
```bash
sudo systemctl reload nginx
```

### Step 8: Check PM2 Logs for Upload Attempts
```bash
pm2 logs duely --lines 50 | grep -i "upload"
```

### Step 9: Test Upload by Creating a Test File
```bash
cd ~/duely/public/uploads/profiles/
echo "test" > test.txt
ls -la
```

Then try to access: `https://duely.online/uploads/profiles/test.txt`

If it works, you should see "test" in your browser.

### Step 10: Verify Upload Directory Ownership
```bash
ls -la ~/duely/public/
ls -la ~/duely/public/uploads/
ls -la ~/duely/public/uploads/profiles/
```

Make sure the directories are owned by the `duely` user:
```bash
sudo chown -R duely:duely ~/duely/public/uploads
```

### Step 11: Check if Any Profile Images Were Already Uploaded
```bash
ls -la ~/duely/public/uploads/profiles/
```

### Step 12: Restart PM2 (if needed)
```bash
pm2 restart duely
pm2 status
```

## Alternative Solution: Let Next.js Serve the Files

If you prefer to let Next.js handle serving the uploaded files (which is simpler), you can skip the Nginx configuration change. Next.js automatically serves files from the `public` folder.

However, you still need to:
1. Create the upload directory: `mkdir -p ~/duely/public/uploads/profiles`
2. Set proper permissions: `chmod 755 ~/duely/public/uploads`
3. Make sure PM2 user has write access

## Testing the Fix

1. Go to your profile page on https://duely.online
2. Try uploading a new profile photo
3. The photo should now display correctly
4. Check browser console for any remaining errors

## Verification Commands

```bash
# Check if directory exists and has proper permissions
ls -ld ~/duely/public/uploads/profiles/

# Check if any images exist
ls -la ~/duely/public/uploads/profiles/

# Test Nginx is serving files from /uploads/
curl -I https://duely.online/uploads/profiles/test.txt

# Check PM2 logs for errors
pm2 logs duely --lines 20 --err

# Check Nginx error logs
sudo tail -f /var/log/nginx/duely.online.error.log
```

## Expected Results

After following these steps:
- ✅ Directory `~/duely/public/uploads/profiles/` exists with 755 permissions
- ✅ Nginx serves files from `/uploads/` path directly
- ✅ Profile photos upload and display correctly
- ✅ No 404 errors in browser console

## Troubleshooting

**If still getting 404 errors:**

1. Check PM2 logs during upload:
   ```bash
   pm2 logs duely --lines 0
   # Then try uploading a photo and watch for errors
   ```

2. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/duely.online.error.log
   ```

3. Verify file was actually created:
   ```bash
   ls -la ~/duely/public/uploads/profiles/
   ```

4. Test direct file access:
   ```bash
   cat ~/duely/public/uploads/profiles/[filename]
   ```

5. Check file permissions:
   ```bash
   stat ~/duely/public/uploads/profiles/[filename]
   ```

**If upload fails:**

1. Check disk space:
   ```bash
   df -h
   ```

2. Check directory permissions:
   ```bash
   ls -la ~/duely/public/
   ```

3. Try creating a test file manually:
   ```bash
   touch ~/duely/public/uploads/profiles/test.jpg
   ```

## Summary

The issue is that uploaded files are not being served properly. The solution involves:

1. Creating the upload directory structure
2. Configuring Nginx to serve files from `/uploads/` path
3. Ensuring proper file permissions

Choose between:
- **Option A**: Let Nginx serve uploaded files directly (faster, more efficient)
- **Option B**: Let Next.js serve them (simpler, no Nginx config needed)

I recommend Option A (Nginx) for better performance.
