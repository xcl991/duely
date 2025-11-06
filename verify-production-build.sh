#!/bin/bash
# Verification script for production deployment

echo "=== Production Build Verification ==="
echo ""

# 1. Check if .next exists and when it was created
echo "1. Build Directory Status:"
if [ -d ".next" ]; then
    echo "   ✓ .next directory exists"
    echo "   Build time: $(stat -c %y .next 2>/dev/null || stat -f "%Sm" .next)"
else
    echo "   ❌ .next directory NOT FOUND"
    exit 1
fi

# 2. Check environment variables
echo ""
echo "2. Environment Variables:"
if grep -q "VAPID_PUBLIC_KEY" .env; then
    echo "   ✓ VAPID_PUBLIC_KEY found in .env"
else
    echo "   ❌ VAPID_PUBLIC_KEY NOT in .env"
fi

if grep -q "NEXT_PUBLIC_VAPID_PUBLIC_KEY" .env; then
    echo "   ✓ NEXT_PUBLIC_VAPID_PUBLIC_KEY found in .env"
else
    echo "   ❌ NEXT_PUBLIC_VAPID_PUBLIC_KEY NOT in .env"
fi

# 3. Check if PM2 is running
echo ""
echo "3. PM2 Status:"
if pm2 list | grep -q "duely"; then
    echo "   ✓ PM2 process 'duely' is running"
    pm2 describe duely | grep -E "(status|uptime|restarts)"
else
    echo "   ❌ PM2 process 'duely' NOT running"
fi

# 4. Check server actions in build
echo ""
echo "4. Server Actions Build Check:"
if [ -d ".next/server" ]; then
    echo "   ✓ Server build directory exists"
    echo "   Server action files: $(find .next/server -name '*action*' -o -name '*server*' | wc -l)"
else
    echo "   ❌ Server build directory NOT FOUND"
fi

# 5. Test localhost connection
echo ""
echo "5. Application Health Check:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "   ✓ Application responding on port 3000"
else
    echo "   ⚠️  Application not responding on port 3000"
fi

# 6. Database connection
echo ""
echo "6. Database Check:"
if mysql -u duely_user -p"DuelyDB@2025Secure!" duely_production -e "SELECT COUNT(*) FROM push_subscriptions;" 2>/dev/null; then
    echo "   ✓ Database connection OK"
else
    echo "   ❌ Database connection failed"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "If build is OK but browser shows errors:"
echo "1. Close ALL browser tabs for duely.online"
echo "2. Clear browser cache completely"
echo "3. Open in Incognito/Private mode"
echo "4. Or use: curl -I https://duely.online to check server response"
