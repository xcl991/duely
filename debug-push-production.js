// Debug script to check push notification setup in production
// Run this on production VPS to verify configuration

const fs = require('fs');
const path = require('path');

console.log('=== Push Notification Production Debug ===\n');

// Check environment variables
console.log('1. Checking Environment Variables:');
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  const envProdFile = fs.existsSync('.env.production')
    ? fs.readFileSync('.env.production', 'utf8')
    : '';

  const checkVar = (content, varName) => {
    const match = content.match(new RegExp(`${varName}=(.+)`));
    if (match) {
      const value = match[1].trim().replace(/['"]/g, '');
      console.log(`   ✓ ${varName}: ${value.substring(0, 20)}... (${value.length} chars)`);
      return value;
    }
    return null;
  };

  console.log('\n   From .env:');
  const vapidPublic = checkVar(envFile, 'VAPID_PUBLIC_KEY');
  const vapidPrivate = checkVar(envFile, 'VAPID_PRIVATE_KEY');
  const nextPublicVapid = checkVar(envFile, 'NEXT_PUBLIC_VAPID_PUBLIC_KEY');

  if (envProdFile) {
    console.log('\n   From .env.production:');
    checkVar(envProdFile, 'VAPID_PUBLIC_KEY');
    checkVar(envProdFile, 'VAPID_PRIVATE_KEY');
    checkVar(envProdFile, 'NEXT_PUBLIC_VAPID_PUBLIC_KEY');
  }

  if (!vapidPublic || !vapidPrivate) {
    console.log('\n   ❌ VAPID keys NOT FOUND in .env!');
  } else if (vapidPublic !== nextPublicVapid) {
    console.log('\n   ⚠️  WARNING: VAPID_PUBLIC_KEY and NEXT_PUBLIC_VAPID_PUBLIC_KEY do not match!');
  } else {
    console.log('\n   ✓ VAPID keys configured correctly');
  }
} catch (error) {
  console.log(`   ❌ Error reading .env: ${error.message}`);
}

// Check push service file
console.log('\n2. Checking Push Service File:');
const pushServicePath = 'src/lib/push/push-service.ts';
if (fs.existsSync(pushServicePath)) {
  console.log(`   ✓ ${pushServicePath} exists`);
  const content = fs.readFileSync(pushServicePath, 'utf8');
  if (content.includes('web-push')) {
    console.log('   ✓ web-push import found');
  }
  if (content.includes('setVapidDetails')) {
    console.log('   ✓ VAPID setup found');
  }
} else {
  console.log(`   ❌ ${pushServicePath} NOT FOUND`);
}

// Check test endpoint
console.log('\n3. Checking Test Endpoint:');
const testEndpointPath = 'src/app/api/push/test/route.ts';
if (fs.existsSync(testEndpointPath)) {
  console.log(`   ✓ ${testEndpointPath} exists`);
} else {
  console.log(`   ❌ ${testEndpointPath} NOT FOUND`);
}

// Check database connection
console.log('\n4. Checking Database Configuration:');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  (async () => {
    try {
      const count = await prisma.pushSubscription.count();
      console.log(`   ✓ Database connection OK`);
      console.log(`   ✓ push_subscriptions table accessible`);
      console.log(`   ℹ Current subscriptions count: ${count}`);

      if (count > 0) {
        const subscriptions = await prisma.pushSubscription.findMany({
          take: 1,
          select: {
            id: true,
            userId: true,
            endpoint: true,
            deviceName: true,
            createdAt: true
          }
        });
        console.log(`   ℹ Sample subscription:`, subscriptions[0]);
      }

      await prisma.$disconnect();
    } catch (error) {
      console.log(`   ❌ Database error: ${error.message}`);
      await prisma.$disconnect();
    }
  })();
} catch (error) {
  console.log(`   ❌ Prisma Client error: ${error.message}`);
}

console.log('\n=== Debug Complete ===\n');
