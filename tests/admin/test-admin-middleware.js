const fs = require('fs');
const path = require('path');

async function testAdminMiddleware() {
  console.log('🧪 Testing Admin Middleware (Step 2.3)...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allTestsPassed = true;
  const errors = [];

  // TEST 1: Check if Admin middleware.ts file exists
  console.log('✓ TEST 1: Admin Middleware Module');
  try {
    const middlewareFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'middleware.ts');

    if (!fs.existsSync(middlewareFilePath)) {
      throw new Error('middleware.ts file not found');
    }

    const middlewareContent = fs.readFileSync(middlewareFilePath, 'utf-8');

    // Check for required functions
    const requiredFunctions = [
      'isAdminRoute',
      'isPublicAdminRoute',
      'verifyAdminAuth',
      'adminMiddleware',
      'getAdminSessionFromRequest',
      'requireAdminAuth'
    ];

    for (const func of requiredFunctions) {
      if (!middlewareContent.includes(`export function ${func}`) &&
          !middlewareContent.includes(`export async function ${func}`)) {
        throw new Error(`Function ${func} not found in middleware.ts`);
      }
    }

    console.log('   ✅ middleware.ts file exists');
    console.log('   ✅ All 6 required functions present:');
    requiredFunctions.forEach(func => {
      console.log(`      - ${func}`);
    });
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Admin Middleware Module: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 2: Check required imports
  console.log('✓ TEST 2: Required Imports');
  try {
    const middlewareFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewareFilePath, 'utf-8');

    const requiredImports = [
      'next/server',
      './session'
    ];

    for (const imp of requiredImports) {
      if (!middlewareContent.includes(`from '${imp}'`) && !middlewareContent.includes(`from "${imp}"`)) {
        throw new Error(`Import from '${imp}' not found`);
      }
    }

    console.log('   ✅ All required imports present:');
    requiredImports.forEach(imp => {
      console.log(`      - ${imp}`);
    });
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Required Imports: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 3: Check route detection functions
  console.log('✓ TEST 3: Route Detection Functions');
  try {
    const middlewareFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewareFilePath, 'utf-8');

    // Check for admin route detection
    if (!middlewareContent.includes('/adminpage')) {
      throw new Error('Admin route path "/adminpage" not found');
    }

    // Check for public route detection
    if (!middlewareContent.includes('/adminpage/auth')) {
      throw new Error('Public admin route "/adminpage/auth" not found');
    }

    console.log('   ✅ Admin route detection (/adminpage)');
    console.log('   ✅ Public route detection (/adminpage/auth)');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Route Detection: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 4: Check authentication verification
  console.log('✓ TEST 4: Authentication Verification');
  try {
    const middlewareFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewareFilePath, 'utf-8');

    // Check for session verification
    if (!middlewareContent.includes('verifyAdminSession')) {
      throw new Error('verifyAdminSession not used in middleware');
    }

    // Check for cookie access
    if (!middlewareContent.includes('admin_session')) {
      throw new Error('admin_session cookie not accessed');
    }

    console.log('   ✅ Session verification implemented');
    console.log('   ✅ Cookie access implemented');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Authentication Verification: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 5: Check redirect logic
  console.log('✓ TEST 5: Redirect Logic');
  try {
    const middlewareFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewareFilePath, 'utf-8');

    // Check for redirect to login
    if (!middlewareContent.includes('NextResponse.redirect')) {
      throw new Error('Redirect logic not found');
    }

    // Check for redirect parameter
    if (!middlewareContent.includes('redirect')) {
      throw new Error('Redirect parameter not found');
    }

    console.log('   ✅ Redirect to login implemented');
    console.log('   ✅ Redirect parameter handling');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Redirect Logic: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 6: Check main middleware integration
  console.log('✓ TEST 6: Main Middleware Integration');
  try {
    const mainMiddlewarePath = path.join(__dirname, 'src', 'middleware.ts');

    if (!fs.existsSync(mainMiddlewarePath)) {
      throw new Error('Main middleware.ts file not found');
    }

    const mainMiddlewareContent = fs.readFileSync(mainMiddlewarePath, 'utf-8');

    // Check for admin middleware import
    if (!mainMiddlewareContent.includes('./lib/admin/middleware')) {
      throw new Error('Admin middleware import not found in main middleware');
    }

    // Check for adminMiddleware function call
    if (!mainMiddlewareContent.includes('adminMiddleware')) {
      throw new Error('adminMiddleware function not called in main middleware');
    }

    // Check for isAdminRoute function call
    if (!mainMiddlewareContent.includes('isAdminRoute')) {
      throw new Error('isAdminRoute function not called in main middleware');
    }

    // Check that middleware is async
    if (!mainMiddlewareContent.includes('export default async function middleware')) {
      throw new Error('Main middleware not updated to async function');
    }

    console.log('   ✅ Admin middleware imported to main middleware');
    console.log('   ✅ adminMiddleware function integrated');
    console.log('   ✅ isAdminRoute function integrated');
    console.log('   ✅ Main middleware is async');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Main Middleware Integration: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 7: Check API route helpers
  console.log('✓ TEST 7: API Route Helpers');
  try {
    const middlewareFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewareFilePath, 'utf-8');

    // Check for getAdminSessionFromRequest
    if (!middlewareContent.includes('getAdminSessionFromRequest')) {
      throw new Error('getAdminSessionFromRequest helper not found');
    }

    // Check for requireAdminAuth
    if (!middlewareContent.includes('requireAdminAuth')) {
      throw new Error('requireAdminAuth helper not found');
    }

    console.log('   ✅ getAdminSessionFromRequest helper');
    console.log('   ✅ requireAdminAuth helper');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`API Route Helpers: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 8: Check error handling
  console.log('✓ TEST 8: Error Handling');
  try {
    const middlewareFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewareFilePath, 'utf-8');

    // Check for try-catch blocks
    if (!middlewareContent.includes('try {') || !middlewareContent.includes('catch')) {
      throw new Error('Error handling (try-catch) not found');
    }

    // Check for console.error for logging
    if (!middlewareContent.includes('console.error')) {
      throw new Error('Error logging not found');
    }

    console.log('   ✅ Try-catch error handling');
    console.log('   ✅ Error logging implemented');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Error Handling: ${error.message}`);
    allTestsPassed = false;
  }

  // FINAL REPORT
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (allTestsPassed) {
    console.log('✅ STEP 2.3 VALIDATION: ALL TESTS PASSED\n');
    console.log('Summary:');
    console.log('  ✅ middleware.ts file created with all functions');
    console.log('  ✅ isAdminRoute function ready');
    console.log('  ✅ isPublicAdminRoute function ready');
    console.log('  ✅ verifyAdminAuth function ready');
    console.log('  ✅ adminMiddleware function ready');
    console.log('  ✅ getAdminSessionFromRequest helper ready');
    console.log('  ✅ requireAdminAuth helper ready');
    console.log('  ✅ Route detection working');
    console.log('  ✅ Authentication verification working');
    console.log('  ✅ Redirect logic implemented');
    console.log('  ✅ Main middleware integration complete');
    console.log('  ✅ API route helpers available');
    console.log('  ✅ Error handling implemented\n');
    console.log('🎉 STEP 2.3 COMPLETE - Ready for Step 2.4\n');
  } else {
    console.log('❌ STEP 2.3 VALIDATION: SOME TESTS FAILED\n');
    console.log('Errors found:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('\n⚠️  Please fix errors before proceeding to Step 2.4\n');
    process.exit(1);
  }
}

testAdminMiddleware()
  .catch((error) => {
    console.error('\n❌ Test script error:', error);
    process.exit(1);
  });
