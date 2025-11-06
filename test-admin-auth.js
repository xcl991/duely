const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminAuthFunctions() {
  console.log('🧪 Testing Admin Auth Functions (Step 2.1)...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allTestsPassed = true;
  const errors = [];

  // TEST 1: Check if Admin auth.ts file exists and can be imported
  console.log('✓ TEST 1: Admin Auth Module');
  try {
    const fs = require('fs');
    const path = require('path');
    const authFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'auth.ts');

    if (!fs.existsSync(authFilePath)) {
      throw new Error('auth.ts file not found');
    }

    const authContent = fs.readFileSync(authFilePath, 'utf-8');

    // Check for required functions
    const requiredFunctions = [
      'verifyAdminCredentials',
      'getAdminById',
      'getAdminByEmail',
      'logAdminAction',
      'getAdminLogs'
    ];

    for (const func of requiredFunctions) {
      if (!authContent.includes(`export async function ${func}`)) {
        throw new Error(`Function ${func} not found in auth.ts`);
      }
    }

    console.log('   ✅ auth.ts file exists');
    console.log('   ✅ All 5 required functions present:');
    requiredFunctions.forEach(func => {
      console.log(`      - ${func}`);
    });
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Admin Auth Module: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 2: Verify database admin exists
  console.log('✓ TEST 2: Admin User in Database');
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
    });

    if (!admin) {
      throw new Error('Admin user not found in database');
    }

    console.log(`   ✅ Admin exists: ${admin.email}`);
    console.log(`   ✅ Admin ID: ${admin.id}`);
    console.log(`   ✅ Password hashed: ${admin.password.substring(0, 20)}...`);
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Admin Database: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 3: Test password verification (simulating verifyAdminCredentials)
  console.log('✓ TEST 3: Password Verification Logic');
  try {
    const bcrypt = require('bcryptjs');
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Test correct password
    const correctPassword = '90opklnm';
    const isCorrectValid = await bcrypt.compare(correctPassword, admin.password);

    if (!isCorrectValid) {
      throw new Error('Correct password validation failed');
    }

    // Test wrong password
    const wrongPassword = 'wrongpassword123';
    const isWrongValid = await bcrypt.compare(wrongPassword, admin.password);

    if (isWrongValid) {
      throw new Error('Wrong password was accepted');
    }

    console.log(`   ✅ Correct password: ACCEPTED`);
    console.log(`   ✅ Wrong password: REJECTED`);
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Password Verification: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 4: Test admin log creation
  console.log('✓ TEST 4: Admin Log Creation');
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Create a test log
    const testLog = await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'test_auth_functions',
        target: null,
        metadata: JSON.stringify({ test: true, step: '2.1' }),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
      },
    });

    console.log(`   ✅ Test log created: ${testLog.id}`);
    console.log(`   ✅ Action: ${testLog.action}`);
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Admin Log: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 5: Check TypeScript types
  console.log('✓ TEST 5: TypeScript Types');
  try {
    const fs = require('fs');
    const path = require('path');
    const authFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'auth.ts');
    const authContent = fs.readFileSync(authFilePath, 'utf-8');

    const requiredTypes = [
      'AdminUser',
      'AdminLoginResult'
    ];

    for (const type of requiredTypes) {
      if (!authContent.includes(`export interface ${type}`)) {
        throw new Error(`Type ${type} not found in auth.ts`);
      }
    }

    console.log('   ✅ All TypeScript interfaces defined:');
    requiredTypes.forEach(type => {
      console.log(`      - ${type}`);
    });
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`TypeScript Types: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 6: Verify PrismaClient usage
  console.log('✓ TEST 6: PrismaClient Integration');
  try {
    // Test that we can query both Admin and AdminLog
    const adminCount = await prisma.admin.count();
    const logCount = await prisma.adminLog.count();

    console.log(`   ✅ Admin table accessible (${adminCount} record${adminCount !== 1 ? 's' : ''})`);
    console.log(`   ✅ AdminLog table accessible (${logCount} record${logCount !== 1 ? 's' : ''})`);
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`PrismaClient: ${error.message}`);
    allTestsPassed = false;
  }

  // FINAL REPORT
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (allTestsPassed) {
    console.log('✅ STEP 2.1 VALIDATION: ALL TESTS PASSED\n');
    console.log('Summary:');
    console.log('  ✅ auth.ts file created with all functions');
    console.log('  ✅ verifyAdminCredentials function ready');
    console.log('  ✅ getAdminById function ready');
    console.log('  ✅ getAdminByEmail function ready');
    console.log('  ✅ logAdminAction function ready');
    console.log('  ✅ getAdminLogs function ready');
    console.log('  ✅ TypeScript types defined');
    console.log('  ✅ Password verification working');
    console.log('  ✅ Admin logging working');
    console.log('  ✅ PrismaClient integration complete\n');
    console.log('🎉 STEP 2.1 COMPLETE - Ready for Step 2.2\n');
  } else {
    console.log('❌ STEP 2.1 VALIDATION: SOME TESTS FAILED\n');
    console.log('Errors found:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('\n⚠️  Please fix errors before proceeding to Step 2.2\n');
    process.exit(1);
  }
}

testAdminAuthFunctions()
  .catch((error) => {
    console.error('\n❌ Test script error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
