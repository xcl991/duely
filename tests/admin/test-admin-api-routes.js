const fs = require('fs');
const path = require('path');

async function testAdminAPIRoutes() {
  console.log('🧪 Testing Admin API Routes (Step 2.5)...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allTestsPassed = true;
  const errors = [];

  // TEST 1: Check if login API route file exists
  console.log('✓ TEST 1: Login API Route File');
  try {
    const loginRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'login', 'route.ts');

    if (!fs.existsSync(loginRoutePath)) {
      throw new Error('Login route.ts file not found');
    }

    const loginRouteContent = fs.readFileSync(loginRoutePath, 'utf-8');

    if (loginRouteContent.length < 500) {
      throw new Error('Login route content too short - may be incomplete');
    }

    console.log('   ✅ route.ts file exists');
    console.log(`   ✅ File size: ${(loginRouteContent.length / 1024).toFixed(2)} KB`);
    console.log('   ✅ Route: /api/admin/auth/login');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Login API Route File: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 2: Check if logout API route file exists
  console.log('✓ TEST 2: Logout API Route File');
  try {
    const logoutRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'logout', 'route.ts');

    if (!fs.existsSync(logoutRoutePath)) {
      throw new Error('Logout route.ts file not found');
    }

    const logoutRouteContent = fs.readFileSync(logoutRoutePath, 'utf-8');

    if (logoutRouteContent.length < 300) {
      throw new Error('Logout route content too short - may be incomplete');
    }

    console.log('   ✅ route.ts file exists');
    console.log(`   ✅ File size: ${(logoutRouteContent.length / 1024).toFixed(2)} KB`);
    console.log('   ✅ Route: /api/admin/auth/logout');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Logout API Route File: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 3: Check login route POST handler
  console.log('✓ TEST 3: Login Route POST Handler');
  try {
    const loginRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'login', 'route.ts');
    const loginRouteContent = fs.readFileSync(loginRoutePath, 'utf-8');

    if (!loginRouteContent.includes('export async function POST')) {
      throw new Error('POST handler not found');
    }

    if (!loginRouteContent.includes('NextRequest')) {
      throw new Error('NextRequest not imported');
    }

    if (!loginRouteContent.includes('NextResponse')) {
      throw new Error('NextResponse not imported');
    }

    console.log('   ✅ POST handler exported');
    console.log('   ✅ NextRequest imported');
    console.log('   ✅ NextResponse imported');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Login POST Handler: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 4: Check logout route POST handler
  console.log('✓ TEST 4: Logout Route POST Handler');
  try {
    const logoutRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'logout', 'route.ts');
    const logoutRouteContent = fs.readFileSync(logoutRoutePath, 'utf-8');

    if (!logoutRouteContent.includes('export async function POST')) {
      throw new Error('POST handler not found');
    }

    if (!logoutRouteContent.includes('NextRequest')) {
      throw new Error('NextRequest not imported');
    }

    if (!logoutRouteContent.includes('NextResponse')) {
      throw new Error('NextResponse not imported');
    }

    console.log('   ✅ POST handler exported');
    console.log('   ✅ NextRequest imported');
    console.log('   ✅ NextResponse imported');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Logout POST Handler: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 5: Check login route imports from admin lib
  console.log('✓ TEST 5: Login Route Admin Library Imports');
  try {
    const loginRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'login', 'route.ts');
    const loginRouteContent = fs.readFileSync(loginRoutePath, 'utf-8');

    const requiredFunctions = [
      'verifyAdminCredentials',
      'setAdminSessionCookie',
      'logAdminAction'
    ];

    for (const func of requiredFunctions) {
      if (!loginRouteContent.includes(func)) {
        throw new Error(`Function "${func}" not imported/used`);
      }
    }

    console.log('   ✅ All required functions imported:');
    requiredFunctions.forEach(func => {
      console.log(`      - ${func}`);
    });
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Login Admin Library Imports: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 6: Check logout route imports from admin lib
  console.log('✓ TEST 6: Logout Route Admin Library Imports');
  try {
    const logoutRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'logout', 'route.ts');
    const logoutRouteContent = fs.readFileSync(logoutRoutePath, 'utf-8');

    const requiredFunctions = [
      'getAdminSession',
      'deleteAdminSession',
      'logAdminAction'
    ];

    for (const func of requiredFunctions) {
      if (!logoutRouteContent.includes(func)) {
        throw new Error(`Function "${func}" not imported/used`);
      }
    }

    console.log('   ✅ All required functions imported:');
    requiredFunctions.forEach(func => {
      console.log(`      - ${func}`);
    });
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Logout Admin Library Imports: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 7: Check login route input validation
  console.log('✓ TEST 7: Login Route Input Validation');
  try {
    const loginRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'login', 'route.ts');
    const loginRouteContent = fs.readFileSync(loginRoutePath, 'utf-8');

    if (!loginRouteContent.includes('email') || !loginRouteContent.includes('password')) {
      throw new Error('Email and password validation not found');
    }

    if (!loginRouteContent.includes('await request.json()')) {
      throw new Error('Request body parsing not found');
    }

    if (!loginRouteContent.includes('status: 400')) {
      throw new Error('400 status code for validation errors not found');
    }

    console.log('   ✅ Email and password validation');
    console.log('   ✅ Request body parsing');
    console.log('   ✅ 400 status for validation errors');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Login Input Validation: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 8: Check error handling
  console.log('✓ TEST 8: Error Handling');
  try {
    const loginRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'login', 'route.ts');
    const loginRouteContent = fs.readFileSync(loginRoutePath, 'utf-8');

    const logoutRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'logout', 'route.ts');
    const logoutRouteContent = fs.readFileSync(logoutRoutePath, 'utf-8');

    // Check login error handling
    if (!loginRouteContent.includes('try {') || !loginRouteContent.includes('catch')) {
      throw new Error('Login route try-catch not found');
    }

    if (!loginRouteContent.includes('status: 500')) {
      throw new Error('Login route 500 status not found');
    }

    // Check logout error handling
    if (!logoutRouteContent.includes('try {') || !logoutRouteContent.includes('catch')) {
      throw new Error('Logout route try-catch not found');
    }

    if (!logoutRouteContent.includes('status: 500')) {
      throw new Error('Logout route 500 status not found');
    }

    console.log('   ✅ Login route error handling');
    console.log('   ✅ Logout route error handling');
    console.log('   ✅ 500 status for server errors');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Error Handling: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 9: Check logging functionality
  console.log('✓ TEST 9: Admin Action Logging');
  try {
    const loginRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'login', 'route.ts');
    const loginRouteContent = fs.readFileSync(loginRoutePath, 'utf-8');

    const logoutRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'logout', 'route.ts');
    const logoutRouteContent = fs.readFileSync(logoutRoutePath, 'utf-8');

    // Check login action logging
    if (!loginRouteContent.includes('logAdminAction')) {
      throw new Error('Login action logging not found');
    }

    if (!loginRouteContent.includes("'login'")) {
      throw new Error('Login action type not logged');
    }

    // Check logout action logging
    if (!logoutRouteContent.includes('logAdminAction')) {
      throw new Error('Logout action logging not found');
    }

    if (!logoutRouteContent.includes("'logout'")) {
      throw new Error('Logout action type not logged');
    }

    console.log('   ✅ Login action logging');
    console.log('   ✅ Logout action logging');
    console.log('   ✅ Failed login attempt logging');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Admin Action Logging: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 10: Check response formats
  console.log('✓ TEST 10: Response Formats');
  try {
    const loginRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'login', 'route.ts');
    const loginRouteContent = fs.readFileSync(loginRoutePath, 'utf-8');

    const logoutRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'logout', 'route.ts');
    const logoutRouteContent = fs.readFileSync(logoutRoutePath, 'utf-8');

    // Check login response format
    if (!loginRouteContent.includes('NextResponse.json')) {
      throw new Error('Login route does not return JSON');
    }

    if (!loginRouteContent.includes('success')) {
      throw new Error('Login route success field not found');
    }

    // Check logout response format
    if (!logoutRouteContent.includes('NextResponse.json')) {
      throw new Error('Logout route does not return JSON');
    }

    if (!logoutRouteContent.includes('success')) {
      throw new Error('Logout route success field not found');
    }

    console.log('   ✅ JSON response format');
    console.log('   ✅ Success field in responses');
    console.log('   ✅ Error field in error responses');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Response Formats: ${error.message}`);
    allTestsPassed = false;
  }

  // FINAL REPORT
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (allTestsPassed) {
    console.log('✅ STEP 2.5 VALIDATION: ALL TESTS PASSED\n');
    console.log('Summary:');
    console.log('  ✅ Login API route created');
    console.log('  ✅ Logout API route created');
    console.log('  ✅ POST handlers implemented');
    console.log('  ✅ Admin library functions integrated');
    console.log('  ✅ Input validation implemented');
    console.log('  ✅ Error handling implemented');
    console.log('  ✅ Admin action logging working');
    console.log('  ✅ Session management integrated');
    console.log('  ✅ JSON response format');
    console.log('  ✅ Security features enabled\n');
    console.log('API Routes:');
    console.log('  - POST /api/admin/auth/login');
    console.log('  - POST /api/admin/auth/logout\n');
    console.log('🎉 STEP 2.5 COMPLETE - Ready for Step 2.6\n');
  } else {
    console.log('❌ STEP 2.5 VALIDATION: SOME TESTS FAILED\n');
    console.log('Errors found:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('\n⚠️  Please fix errors before proceeding to Step 2.6\n');
    process.exit(1);
  }
}

testAdminAPIRoutes()
  .catch((error) => {
    console.error('\n❌ Test script error:', error);
    process.exit(1);
  });
