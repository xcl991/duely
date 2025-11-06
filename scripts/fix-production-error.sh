#!/bin/bash

# Fix Production Error - Clean build and restart
# This script will fix the Prisma query error in production

echo "========================================="
echo "Fixing Production Deployment Error"
echo "========================================="
echo ""

# Navigate to project directory
cd /home/duely/duely || exit 1

echo "1. Stopping PM2 process..."
pm2 stop duely

echo ""
echo "2. Cleaning old build..."
rm -rf .next
rm -rf node_modules/.cache

echo ""
echo "3. Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "4. Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed! Check errors above."
    exit 1
fi

echo ""
echo "5. Restarting PM2..."
pm2 restart duely

echo ""
echo "6. Checking PM2 status..."
pm2 status

echo ""
echo "7. Checking recent logs..."
sleep 3
pm2 logs duely --lines 30 --nostream

echo ""
echo "========================================="
echo "✓ Fix complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Monitor logs: pm2 logs duely"
echo "2. Test the site: https://duely.online"
echo "3. Clear browser cache (Ctrl+Shift+R)"
echo ""
