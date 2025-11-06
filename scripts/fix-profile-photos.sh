#!/bin/bash

# Profile Photo Upload Fix Script for Duely
# This script will fix the 404 errors for uploaded profile photos

echo "================================================"
echo "Profile Photo Upload Fix Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check current directory
echo -e "${YELLOW}Step 1: Checking current directory structure...${NC}"
cd ~/duely
if [ -d "public/uploads/profiles" ]; then
    echo -e "${GREEN}✓ Upload directory already exists${NC}"
    ls -la public/uploads/profiles/
else
    echo -e "${RED}✗ Upload directory does not exist${NC}"
fi
echo ""

# Step 2: Create upload directory
echo -e "${YELLOW}Step 2: Creating upload directory...${NC}"
mkdir -p public/uploads/profiles
chmod 755 public/uploads
chmod 755 public/uploads/profiles
chown -R duely:duely public/uploads
echo -e "${GREEN}✓ Upload directory created with proper permissions${NC}"
ls -la public/uploads/profiles/
echo ""

# Step 3: Backup Nginx configuration
echo -e "${YELLOW}Step 3: Backing up Nginx configuration...${NC}"
sudo cp /etc/nginx/sites-available/duely.online /etc/nginx/sites-available/duely.online.backup-$(date +%Y%m%d-%H%M%S)
echo -e "${GREEN}✓ Nginx configuration backed up${NC}"
echo ""

# Step 4: Check if Nginx already has /uploads/ location block
echo -e "${YELLOW}Step 4: Checking Nginx configuration...${NC}"
if sudo grep -q "location /uploads/" /etc/nginx/sites-available/duely.online; then
    echo -e "${GREEN}✓ Nginx already configured to serve /uploads/${NC}"
else
    echo -e "${RED}✗ Nginx not configured to serve /uploads/${NC}"
    echo -e "${YELLOW}Manual action required: Add location block to Nginx config${NC}"
    echo ""
    echo "Run this command to edit Nginx config:"
    echo "  sudo nano /etc/nginx/sites-available/duely.online"
    echo ""
    echo "Add this block BEFORE the 'location /' block:"
    echo ""
    echo "    # Serve uploaded files directly"
    echo "    location /uploads/ {"
    echo "        alias /home/duely/duely/public/uploads/;"
    echo "        expires 30d;"
    echo "        add_header Cache-Control \"public, immutable\";"
    echo "        access_log off;"
    echo "    }"
    echo ""
    read -p "Press Enter after you've updated the Nginx config..."
fi
echo ""

# Step 5: Test Nginx configuration
echo -e "${YELLOW}Step 5: Testing Nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
    echo "Please fix the errors before continuing"
    exit 1
fi
echo ""

# Step 6: Reload Nginx
echo -e "${YELLOW}Step 6: Reloading Nginx...${NC}"
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to reload Nginx${NC}"
    exit 1
fi
echo ""

# Step 7: Create test file
echo -e "${YELLOW}Step 7: Creating test file...${NC}"
echo "Test file created at $(date)" > public/uploads/profiles/test.txt
if [ -f "public/uploads/profiles/test.txt" ]; then
    echo -e "${GREEN}✓ Test file created${NC}"
    echo "Test file location: ~/duely/public/uploads/profiles/test.txt"
    echo "Try accessing: https://duely.online/uploads/profiles/test.txt"
else
    echo -e "${RED}✗ Failed to create test file${NC}"
fi
echo ""

# Step 8: Check PM2 status
echo -e "${YELLOW}Step 8: Checking PM2 status...${NC}"
pm2 status
echo ""

# Step 9: Show recent PM2 logs
echo -e "${YELLOW}Step 9: Checking PM2 logs for errors...${NC}"
pm2 logs duely --lines 10 --nostream
echo ""

# Step 10: Display summary
echo "================================================"
echo -e "${GREEN}Fix completed!${NC}"
echo "================================================"
echo ""
echo "Summary of changes:"
echo "  ✓ Created directory: ~/duely/public/uploads/profiles/"
echo "  ✓ Set permissions: 755"
echo "  ✓ Updated ownership: duely:duely"
echo "  ✓ Backed up Nginx config"
echo "  ✓ Reloaded Nginx"
echo "  ✓ Created test file"
echo ""
echo "Next steps:"
echo "  1. Test file access: https://duely.online/uploads/profiles/test.txt"
echo "  2. Go to your profile page and upload a photo"
echo "  3. Check if the photo displays correctly"
echo ""
echo "If still having issues, check:"
echo "  - PM2 logs: pm2 logs duely"
echo "  - Nginx error log: sudo tail -f /var/log/nginx/duely.online.error.log"
echo "  - Directory contents: ls -la ~/duely/public/uploads/profiles/"
echo ""
echo "For detailed troubleshooting, see PROFILE-PHOTO-FIX.md"
echo ""
