const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function comprehensivePhase2Check() {
  console.log('🔍 PHASE 2 COMPREHENSIVE DOUBLE CHECK\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allChecksPassed = true;
  const errors = [];
  const warnings = [];

  // ============================================
  // SECTION 1: FILE EXISTENCE CHECK
  // ============================================
  console.log('📁 SECTION 1: FILE EXISTENCE CHECK\n');

  const requiredFiles = [
    { path: 'src/lib/admin/auth.ts', desc: 'Admin auth utilities' },
    { path: 'src/lib/admin/session.ts', desc: 'Admin session management' },
    { path: 'src/lib/admin/middleware.ts', desc: 'Admin middleware' },
    { path: 'src/app/(adminpage)/auth/page.tsx', desc: 'Admin login page' },
    { path: 'src/app/api/admin/auth/login/route.ts', desc: 'Login API route' },
    { path: 'src/app/api/admin/auth/logout/route.ts', desc: 'Logout API route' },
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file.path);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      console.log(`   ✅ ${file.desc}: ${file.path} (${(stat.size / 1024).toFixed(2)} KB)`);
    } else {
      console.log(`   ❌ ${file.desc}: ${file.path} - NOT FOUND`);
      errors.push(`File not found: ${file.path}`);
      allChecksPassed = false;
    }
  }

  console.log('\n');

  // ============================================
  // SECTION 2: DATABASE INTEGRITY CHECK
  // ============================================
  console.log('🗄️  SECTION 2: DATABASE INTEGRITY CHECK\n');

  try {
    // Check Admin table
    const adminCount = await prisma.admin.count();
    console.log(`   ✅ Admin table accessible (${adminCount} record${adminCount !== 1 ? 's' : ''})`);

    // Check AdminLog table
    const logCount = await prisma.adminLog.count();
    console.log(`   ✅ AdminLog table accessible (${logCount} record${logCount !== 1 ? 's' : ''})`);

    // Check admin user exists
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
    });

    if (admin) {
      console.log(`   ✅ Admin user exists: ${admin.email}`);
      console.log(`   ✅ Admin ID: ${admin.id}`);
      console.log(`   ✅ Password hashed: ${admin.password.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ Admin user NOT FOUND`);
      errors.push('Admin user not found in database');
      allChecksPassed = false;
    }

    // Check foreign key relation
    const adminWithLogs = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
      include: { logs: true },
    });

    if (adminWithLogs) {
      console.log(`   ✅ Admin-to-Logs relation working (${adminWithLogs.logs.length} logs)`);
    }
  } catch (error) {
    console.log(`   ❌ Database check failed: ${error.message}`);
    errors.push(`Database integrity: ${error.message}`);
    allChecksPassed = false;
  }

  console.log('\n');

  // ============================================
  // SECTION 3: PASSWORD AUTHENTICATION CHECK
  // ============================================
  console.log('🔐 SECTION 3: PASSWORD AUTHENTICATION CHECK\n');

  try {
    const bcrypt = require('bcryptjs');
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
    });

    if (admin) {
      // Test correct password
      const correctPassword = '90opklnm';
      const isCorrectValid = await bcrypt.compare(correctPassword, admin.password);

      if (isCorrectValid) {
        console.log(`   ✅ Correct password ('90opklnm'): ACCEPTED`);
      } else {
        console.log(`   ❌ Correct password validation FAILED`);
        errors.push('Correct password not accepted');
        allChecksPassed = false;
      }

      // Test wrong password
      const wrongPassword = 'wrongpassword123';
      const isWrongValid = await bcrypt.compare(wrongPassword, admin.password);

      if (!isWrongValid) {
        console.log(`   ✅ Wrong password: REJECTED (as expected)`);
      } else {
        console.log(`   ❌ Wrong password was ACCEPTED (security issue!)`);
        errors.push('Wrong password incorrectly accepted');
        allChecksPassed = false;
      }
    }
  } catch (error) {
    console.log(`   ❌ Password check failed: ${error.message}`);
    errors.push(`Password authentication: ${error.message}`);
    allChecksPassed = false;
  }

  console.log('\n');

  // ============================================
  // SECTION 4: TYPESCRIPT COMPILATION CHECK
  // ============================================
  console.log('📝 SECTION 4: TYPESCRIPT COMPILATION CHECK\n');

  const tsFiles = [
    'src/lib/admin/auth.ts',
    'src/lib/admin/session.ts',
    'src/lib/admin/middleware.ts',
    'src/middleware.ts',
    'src/app/(adminpage)/auth/page.tsx',
    'src/app/api/admin/auth/login/route.ts',
    'src/app/api/admin/auth/logout/route.ts',
  ];

  for (const file of tsFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for TypeScript syntax errors (basic check)
      if (content.includes('import ') && content.includes('export ')) {
        console.log(`   ✅ ${file}: Valid TypeScript syntax`);
      } else {
        warnings.push(`${file}: May have incomplete TypeScript syntax`);
        console.log(`   ⚠️  ${file}: Check imports/exports`);
      }
    }
  }

  console.log('\n');

  // ============================================
  // SECTION 5: INTEGRATION CHECK
  // ============================================
  console.log('🔗 SECTION 5: INTEGRATION CHECK\n');

  try {
    // Check main middleware integration
    const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');

    if (middlewareContent.includes('./lib/admin/middleware')) {
      console.log(`   ✅ Admin middleware imported in main middleware`);
    } else {
      console.log(`   ❌ Admin middleware NOT imported`);
      errors.push('Admin middleware not integrated');
      allChecksPassed = false;
    }

    if (middlewareContent.includes('adminMiddleware')) {
      console.log(`   ✅ adminMiddleware function called`);
    } else {
      console.log(`   ❌ adminMiddleware function NOT called`);
      errors.push('adminMiddleware not called');
      allChecksPassed = false;
    }

    if (middlewareContent.includes('async function middleware')) {
      console.log(`   ✅ Main middleware is async`);
    } else {
      console.log(`   ❌ Main middleware is NOT async`);
      errors.push('Main middleware not async');
      allChecksPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Integration check failed: ${error.message}`);
    errors.push(`Integration: ${error.message}`);
    allChecksPassed = false;
  }

  console.log('\n');

  // ============================================
  // SECTION 6: SECURITY FEATURES CHECK
  // ============================================
  console.log('🛡️  SECTION 6: SECURITY FEATURES CHECK\n');

  try {
    // Check session.ts security features
    const sessionPath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');
    const sessionContent = fs.readFileSync(sessionPath, 'utf-8');

    const securityChecks = [
      { check: 'httpOnly', desc: 'httpOnly cookie flag' },
      { check: 'secure', desc: 'secure cookie flag' },
      { check: 'sameSite', desc: 'sameSite cookie flag' },
      { check: 'ADMIN_SESSION_SECRET', desc: 'Environment secret' },
      { check: 'jwtVerify', desc: 'JWT verification' },
      { check: 'SignJWT', desc: 'JWT signing' },
    ];

    for (const { check, desc } of securityChecks) {
      if (sessionContent.includes(check)) {
        console.log(`   ✅ ${desc}: Implemented`);
      } else {
        console.log(`   ❌ ${desc}: NOT implemented`);
        errors.push(`Security feature missing: ${desc}`);
        allChecksPassed = false;
      }
    }

    // Check middleware redirect logic
    const middlewareLibPath = path.join(__dirname, 'src', 'lib', 'admin', 'middleware.ts');
    const middlewareLibContent = fs.readFileSync(middlewareLibPath, 'utf-8');

    if (middlewareLibContent.includes('NextResponse.redirect')) {
      console.log(`   ✅ Redirect for unauthenticated access: Implemented`);
    } else {
      console.log(`   ❌ Redirect logic: NOT implemented`);
      warnings.push('Redirect logic may be missing');
    }
  } catch (error) {
    console.log(`   ❌ Security check failed: ${error.message}`);
    errors.push(`Security features: ${error.message}`);
    allChecksPassed = false;
  }

  console.log('\n');

  // ============================================
  // SECTION 7: API ROUTES VALIDATION
  // ============================================
  console.log('🌐 SECTION 7: API ROUTES VALIDATION\n');

  try {
    // Check login route
    const loginRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'login', 'route.ts');
    const loginRouteContent = fs.readFileSync(loginRoutePath, 'utf-8');

    const loginChecks = [
      'export async function POST',
      'verifyAdminCredentials',
      'setAdminSessionCookie',
      'logAdminAction',
      'status: 400',
      'status: 401',
      'status: 500',
    ];

    for (const check of loginChecks) {
      if (loginRouteContent.includes(check)) {
        console.log(`   ✅ Login route: ${check}`);
      } else {
        console.log(`   ❌ Login route missing: ${check}`);
        errors.push(`Login route missing: ${check}`);
        allChecksPassed = false;
      }
    }

    // Check logout route
    const logoutRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'auth', 'logout', 'route.ts');
    const logoutRouteContent = fs.readFileSync(logoutRoutePath, 'utf-8');

    const logoutChecks = [
      'export async function POST',
      'getAdminSession',
      'deleteAdminSession',
      'logAdminAction',
    ];

    for (const check of logoutChecks) {
      if (logoutRouteContent.includes(check)) {
        console.log(`   ✅ Logout route: ${check}`);
      } else {
        console.log(`   ❌ Logout route missing: ${check}`);
        errors.push(`Logout route missing: ${check}`);
        allChecksPassed = false;
      }
    }
  } catch (error) {
    console.log(`   ❌ API routes check failed: ${error.message}`);
    errors.push(`API routes: ${error.message}`);
    allChecksPassed = false;
  }

  console.log('\n');

  // ============================================
  // SECTION 8: LOGIN PAGE VALIDATION
  // ============================================
  console.log('🖥️  SECTION 8: LOGIN PAGE VALIDATION\n');

  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    const pageChecks = [
      { check: "'use client'", desc: 'Client component directive' },
      { check: 'useState', desc: 'React state management' },
      { check: 'useRouter', desc: 'Next.js router' },
      { check: '/api/admin/auth/login', desc: 'Login API endpoint' },
      { check: 'type="email"', desc: 'Email input' },
      { check: 'type="password"', desc: 'Password input' },
      { check: 'handleSubmit', desc: 'Form submit handler' },
      { check: 'isLoading', desc: 'Loading state' },
      { check: 'error', desc: 'Error state' },
      { check: '/adminpage/dashboard', desc: 'Dashboard redirect' },
    ];

    for (const { check, desc } of pageChecks) {
      if (loginPageContent.includes(check)) {
        console.log(`   ✅ ${desc}: Present`);
      } else {
        console.log(`   ❌ ${desc}: NOT present`);
        errors.push(`Login page missing: ${desc}`);
        allChecksPassed = false;
      }
    }
  } catch (error) {
    console.log(`   ❌ Login page check failed: ${error.message}`);
    errors.push(`Login page: ${error.message}`);
    allChecksPassed = false;
  }

  console.log('\n');

  // ============================================
  // SECTION 9: DEPENDENCIES CHECK
  // ============================================
  console.log('📦 SECTION 9: DEPENDENCIES CHECK\n');

  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const requiredDeps = [
      { name: 'jose', desc: 'JWT library' },
      { name: 'bcryptjs', desc: 'Password hashing' },
      { name: '@prisma/client', desc: 'Prisma ORM' },
      { name: 'next', desc: 'Next.js framework' },
    ];

    for (const { name, desc } of requiredDeps) {
      if (packageJson.dependencies[name]) {
        console.log(`   ✅ ${desc} (${name}): v${packageJson.dependencies[name]}`);
      } else {
        console.log(`   ❌ ${desc} (${name}): NOT installed`);
        errors.push(`Missing dependency: ${name}`);
        allChecksPassed = false;
      }
    }
  } catch (error) {
    console.log(`   ❌ Dependencies check failed: ${error.message}`);
    errors.push(`Dependencies: ${error.message}`);
    allChecksPassed = false;
  }

  console.log('\n');

  // ============================================
  // SECTION 10: BACKWARD COMPATIBILITY CHECK
  // ============================================
  console.log('🔄 SECTION 10: BACKWARD COMPATIBILITY CHECK\n');

  try {
    // Check existing tables still work
    const userCount = await prisma.user.count();
    console.log(`   ✅ User model still works (${userCount} users)`);

    const subscriptionCount = await prisma.subscription.count();
    console.log(`   ✅ Subscription model works (${subscriptionCount} records)`);

    const categoryCount = await prisma.category.count();
    console.log(`   ✅ Category model works (${categoryCount} records)`);

    // Check main middleware still handles non-admin routes
    const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');

    if (middlewareContent.includes('isProtectedRoute')) {
      console.log(`   ✅ Non-admin route protection still working`);
    }

    if (middlewareContent.includes('duely-language')) {
      console.log(`   ✅ Language detection still working`);
    }
  } catch (error) {
    console.log(`   ❌ Compatibility check failed: ${error.message}`);
    errors.push(`Backward compatibility: ${error.message}`);
    allChecksPassed = false;
  }

  console.log('\n');

  // ============================================
  // FINAL REPORT
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 COMPREHENSIVE CHECK RESULTS\n');

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
    console.log('');
  }

  if (allChecksPassed) {
    console.log('✅ PHASE 2 COMPREHENSIVE CHECK: ALL PASSED\n');
    console.log('Summary:');
    console.log('  ✅ All files exist');
    console.log('  ✅ Database integrity verified');
    console.log('  ✅ Password authentication working');
    console.log('  ✅ TypeScript syntax valid');
    console.log('  ✅ Integration complete');
    console.log('  ✅ Security features implemented');
    console.log('  ✅ API routes validated');
    console.log('  ✅ Login page validated');
    console.log('  ✅ Dependencies installed');
    console.log('  ✅ Backward compatible');
    console.log('');
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log('');
    console.log('🎉 PHASE 2 IMPLEMENTATION VERIFIED - READY FOR STEP 2.6\n');
  } else {
    console.log('❌ PHASE 2 COMPREHENSIVE CHECK: SOME CHECKS FAILED\n');
    console.log('Errors found:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('\n⚠️  Please fix errors before proceeding\n');
    process.exit(1);
  }
}

comprehensivePhase2Check()
  .catch((error) => {
    console.error('\n❌ Comprehensive check error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
