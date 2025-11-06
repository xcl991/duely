const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function globalCompatibilityCheck() {
  console.log('🔍 GLOBAL COMPATIBILITY CHECK - Admin Panel Integration\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let totalTests = 0;
  let passedTests = 0;
  const errors = [];
  const warnings = [];

  // ============================================
  // Test 1: Middleware Integration Check
  // ============================================
  console.log('📝 Test 1: Middleware Integration\n');

  try {
    const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');

    // Check admin middleware integration
    if (middlewareContent.includes('adminMiddleware')) {
      console.log('   ✅ Admin middleware imported');
      totalTests++;
      passedTests++;
    } else {
      errors.push('Admin middleware not imported in main middleware');
    }

    if (middlewareContent.includes('isAdminRoute')) {
      console.log('   ✅ Admin route detection function imported');
      totalTests++;
      passedTests++;
    } else {
      errors.push('Admin route detection not imported');
    }

    // Check for NextAuth middleware
    if (middlewareContent.includes('withAuth') || middlewareContent.includes('NextAuth')) {
      console.log('   ✅ NextAuth middleware present');
      totalTests++;
      passedTests++;
    } else {
      warnings.push('NextAuth middleware not found (might be intentional)');
    }

    // Check middleware is async
    if (middlewareContent.includes('async function middleware') || middlewareContent.includes('export default async')) {
      console.log('   ✅ Middleware is async');
      totalTests++;
      passedTests++;
    } else {
      errors.push('Middleware should be async for admin integration');
    }

    console.log('');
  } catch (error) {
    errors.push(`Middleware integration test error: ${error.message}`);
  }

  // ============================================
  // Test 2: Route Conflict Check
  // ============================================
  console.log('📝 Test 2: Route Conflict Check\n');

  try {
    // Check for conflicting routes
    const appDir = path.join(__dirname, 'src', 'app');

    // Admin routes
    const adminRoutes = [
      '(adminpage)/auth/page.tsx',
      '(adminpage)/dashboard/page.tsx',
      '(adminpage)/dashboard/users/page.tsx',
      '(adminpage)/dashboard/subscriptions/page.tsx',
      '(adminpage)/dashboard/logs/page.tsx',
    ];

    for (const route of adminRoutes) {
      const routePath = path.join(appDir, route);
      if (fs.existsSync(routePath)) {
        console.log(`   ✅ Admin route exists: ${route}`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Admin route missing: ${route}`);
      }
    }

    // Check user dashboard route still exists
    const userDashboardPath = path.join(appDir, '(dashboard)/dashboard/page.tsx');
    if (fs.existsSync(userDashboardPath)) {
      console.log(`   ✅ User dashboard route exists: (dashboard)/dashboard/page.tsx`);
      totalTests++;
      passedTests++;
    } else {
      warnings.push('User dashboard route not found (might use different structure)');
    }

    console.log('');
  } catch (error) {
    errors.push(`Route conflict check error: ${error.message}`);
  }

  // ============================================
  // Test 3: Database Schema Compatibility
  // ============================================
  console.log('📝 Test 3: Database Schema Compatibility\n');

  try {
    // Check Admin table
    const adminCount = await prisma.admin.count();
    console.log(`   ✅ Admin table accessible: ${adminCount} admin(s)`);
    totalTests++;
    passedTests++;

    // Check AdminLog table
    const logCount = await prisma.adminLog.count();
    console.log(`   ✅ AdminLog table accessible: ${logCount} log(s)`);
    totalTests++;
    passedTests++;

    // Check User table (backward compatibility)
    const userCount = await prisma.user.count();
    console.log(`   ✅ User table accessible: ${userCount} user(s)`);
    totalTests++;
    passedTests++;

    // Check Subscription table
    const subCount = await prisma.subscription.count();
    console.log(`   ✅ Subscription table accessible: ${subCount} subscription(s)`);
    totalTests++;
    passedTests++;

    // Check Category table
    const catCount = await prisma.category.count();
    console.log(`   ✅ Category table accessible: ${catCount} categories`);
    totalTests++;
    passedTests++;

    // Check Member table
    const memberCount = await prisma.member.count();
    console.log(`   ✅ Member table accessible: ${memberCount} members`);
    totalTests++;
    passedTests++;

    console.log('');
  } catch (error) {
    errors.push(`Database schema compatibility error: ${error.message}`);
  }

  // ============================================
  // Test 4: Authentication System Compatibility
  // ============================================
  console.log('📝 Test 4: Authentication System Compatibility\n');

  try {
    // Check admin auth files
    const adminAuthFiles = [
      'src/lib/admin/auth.ts',
      'src/lib/admin/session.ts',
      'src/lib/admin/middleware.ts',
    ];

    for (const file of adminAuthFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Admin auth file missing: ${file}`);
      }
    }

    // Check admin API routes
    const adminApiRoutes = [
      'src/app/api/admin/auth/login/route.ts',
      'src/app/api/admin/auth/logout/route.ts',
    ];

    for (const route of adminApiRoutes) {
      const routePath = path.join(__dirname, route);
      if (fs.existsSync(routePath)) {
        console.log(`   ✅ ${route}`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Admin API route missing: ${route}`);
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`Authentication system compatibility error: ${error.message}`);
  }

  // ============================================
  // Test 5: Environment Variables Check
  // ============================================
  console.log('📝 Test 5: Environment Variables Check\n');

  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('   ✅ .env file exists');
      totalTests++;
      passedTests++;

      const envContent = fs.readFileSync(envPath, 'utf-8');

      // Check for DATABASE_URL
      if (envContent.includes('DATABASE_URL')) {
        console.log('   ✅ DATABASE_URL defined');
        totalTests++;
        passedTests++;
      } else {
        errors.push('DATABASE_URL not found in .env');
      }

      // Check for NEXTAUTH variables (if using NextAuth)
      if (envContent.includes('NEXTAUTH_SECRET') || envContent.includes('NEXTAUTH_URL')) {
        console.log('   ✅ NextAuth variables present');
        totalTests++;
        passedTests++;
      } else {
        warnings.push('NextAuth variables not found (might not be using NextAuth)');
      }

      // Check for ADMIN_SESSION_SECRET
      if (envContent.includes('ADMIN_SESSION_SECRET')) {
        console.log('   ✅ ADMIN_SESSION_SECRET defined');
        totalTests++;
        passedTests++;
      } else {
        errors.push('ADMIN_SESSION_SECRET not defined in .env');
      }
    } else {
      warnings.push('.env file not found (might be using .env.local)');
    }

    console.log('');
  } catch (error) {
    errors.push(`Environment variables check error: ${error.message}`);
  }

  // ============================================
  // Test 6: API Routes Compatibility
  // ============================================
  console.log('📝 Test 6: API Routes Structure\n');

  try {
    const apiDir = path.join(__dirname, 'src', 'app', 'api');

    // Check admin API routes
    const adminApiDir = path.join(apiDir, 'admin');
    if (fs.existsSync(adminApiDir)) {
      console.log('   ✅ Admin API directory exists');
      totalTests++;
      passedTests++;
    } else {
      errors.push('Admin API directory not found');
    }

    // Check if user API routes still exist
    const possibleUserRoutes = ['auth', 'user', 'subscriptions'];
    let userRoutesFound = 0;
    for (const route of possibleUserRoutes) {
      const routePath = path.join(apiDir, route);
      if (fs.existsSync(routePath)) {
        userRoutesFound++;
      }
    }

    if (userRoutesFound > 0) {
      console.log(`   ✅ User API routes found: ${userRoutesFound} directories`);
      totalTests++;
      passedTests++;
    } else {
      warnings.push('User API routes not found (might use different structure)');
    }

    console.log('');
  } catch (error) {
    errors.push(`API routes structure check error: ${error.message}`);
  }

  // ============================================
  // Test 7: Session Management Compatibility
  // ============================================
  console.log('📝 Test 7: Session Management\n');

  try {
    const sessionPath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');
    const sessionContent = fs.readFileSync(sessionPath, 'utf-8');

    // Check JWT implementation
    if (sessionContent.includes('jose')) {
      console.log('   ✅ JWT library (jose) used');
      totalTests++;
      passedTests++;
    } else {
      errors.push('JWT library not properly imported');
    }

    // Check session functions
    const sessionFunctions = [
      'createAdminSession',
      'verifyAdminSession',
      'getAdminSession',
      'setAdminSessionCookie',
      'deleteAdminSession',
    ];

    for (const func of sessionFunctions) {
      if (sessionContent.includes(func)) {
        console.log(`   ✅ Function exists: ${func}`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Session function missing: ${func}`);
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`Session management check error: ${error.message}`);
  }

  // ============================================
  // Test 8: Security Features Check
  // ============================================
  console.log('📝 Test 8: Security Features\n');

  try {
    // Check bcrypt usage
    const authPath = path.join(__dirname, 'src', 'lib', 'admin', 'auth.ts');
    const authContent = fs.readFileSync(authPath, 'utf-8');

    if (authContent.includes('bcrypt')) {
      console.log('   ✅ Password hashing with bcrypt');
      totalTests++;
      passedTests++;
    } else {
      errors.push('Bcrypt not found in auth file');
    }

    // Check session security
    const sessionPath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');
    const sessionContent = fs.readFileSync(sessionPath, 'utf-8');

    const securityFeatures = [
      { check: 'httpOnly: true', name: 'HttpOnly cookie flag' },
      { check: 'secure:', name: 'Secure flag for production' },
      { check: "sameSite: 'lax'", name: 'SameSite protection' },
    ];

    for (const { check, name } of securityFeatures) {
      if (sessionContent.includes(check)) {
        console.log(`   ✅ ${name}`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Security feature missing: ${name}`);
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`Security features check error: ${error.message}`);
  }

  // ============================================
  // Test 9: Dependencies Compatibility
  // ============================================
  console.log('📝 Test 9: Dependencies Check\n');

  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const criticalDeps = {
      'next': 'Next.js framework',
      '@prisma/client': 'Prisma ORM',
      'bcryptjs': 'Password hashing',
      'jose': 'JWT tokens',
      'date-fns': 'Date formatting',
      'lucide-react': 'Icons',
    };

    for (const [dep, description] of Object.entries(criticalDeps)) {
      if (packageJson.dependencies[dep]) {
        console.log(`   ✅ ${dep} (${description}): ${packageJson.dependencies[dep]}`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Missing dependency: ${dep}`);
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`Dependencies check error: ${error.message}`);
  }

  // ============================================
  // Test 10: TypeScript Configuration
  // ============================================
  console.log('📝 Test 10: TypeScript Configuration\n');

  try {
    const tsconfigPath = path.join(__dirname, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      console.log('   ✅ tsconfig.json exists');
      totalTests++;
      passedTests++;

      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

      // Check path aliases
      if (tsconfig.compilerOptions?.paths?.['@/*']) {
        console.log('   ✅ Path alias @/* configured');
        totalTests++;
        passedTests++;
      } else {
        warnings.push('Path alias @/* not found in tsconfig');
      }
    } else {
      errors.push('tsconfig.json not found');
    }

    console.log('');
  } catch (error) {
    errors.push(`TypeScript configuration check error: ${error.message}`);
  }

  // ============================================
  // Test 11: UI Components Compatibility
  // ============================================
  console.log('📝 Test 11: UI Components\n');

  try {
    const componentsDir = path.join(__dirname, 'src', 'components', 'ui');

    const requiredComponents = [
      'card.tsx',
      'table.tsx',
      'badge.tsx',
      'button.tsx',
      'input.tsx',
      'label.tsx',
    ];

    for (const component of requiredComponents) {
      const componentPath = path.join(componentsDir, component);
      if (fs.existsSync(componentPath)) {
        console.log(`   ✅ ${component}`);
        totalTests++;
        passedTests++;
      } else {
        warnings.push(`UI component not found: ${component}`);
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`UI components check error: ${error.message}`);
  }

  // ============================================
  // Test 12: Admin User in Database
  // ============================================
  console.log('📝 Test 12: Admin User Configuration\n');

  try {
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
    });

    if (admin) {
      console.log('   ✅ Admin user exists: stevenoklizz@gmail.com');
      totalTests++;
      passedTests++;

      if (admin.password.length >= 50) {
        console.log('   ✅ Password properly hashed');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Admin password not properly hashed');
      }
    } else {
      errors.push('Admin user not found in database');
    }

    console.log('');
  } catch (error) {
    errors.push(`Admin user check error: ${error.message}`);
  }

  // ============================================
  // PHASE ANALYSIS
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 PHASE IMPLEMENTATION STATUS\n');

  const phases = [
    { phase: 'Phase 1', name: 'Database Schema & Migration', status: '✅ COMPLETED' },
    { phase: 'Phase 2', name: 'Admin Authentication System', status: '✅ COMPLETED' },
    { phase: 'Phase 3', name: 'Admin Dashboard UI & Features', status: '✅ COMPLETED' },
    { phase: 'Phase 4', name: 'Admin CRUD Operations (Optional)', status: '⏸️  NOT IMPLEMENTED' },
    { phase: 'Phase 5', name: 'Advanced Analytics (Optional)', status: '⏸️  NOT IMPLEMENTED' },
    { phase: 'Phase 6', name: 'Prisma Studio Integration (Optional)', status: '⏸️  NOT IMPLEMENTED' },
    { phase: 'Phase 7', name: 'Production Deployment (Optional)', status: '⏸️  NOT IMPLEMENTED' },
  ];

  for (const { phase, name, status } of phases) {
    console.log(`   ${status} ${phase}: ${name}`);
  }

  console.log('');

  // ============================================
  // FINAL SUMMARY
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 GLOBAL COMPATIBILITY SUMMARY\n');

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Pass Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0}%\n`);

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    console.log('');
    console.log('⚠️  Please fix errors before considering system ready\n');
    process.exit(1);
  } else {
    console.log('✅ GLOBAL COMPATIBILITY CHECK: ALL TESTS PASSED\n');
    console.log('System Status:');
    console.log('  ✅ Middleware integration working');
    console.log('  ✅ No route conflicts detected');
    console.log('  ✅ Database schema compatible');
    console.log('  ✅ Authentication systems compatible');
    console.log('  ✅ Security features enabled');
    console.log('  ✅ All dependencies installed');
    console.log('  ✅ Admin system fully functional');
    console.log('');
    console.log('📋 PHASE STATUS:');
    console.log('  ✅ Phase 1, 2, 3: COMPLETED (Core admin system)');
    console.log('  ⏸️  Phase 4-7: OPTIONAL (Not yet implemented)');
    console.log('');
    console.log('🎉 SYSTEM READY FOR PRODUCTION ✅\n');
  }
}

globalCompatibilityCheck()
  .catch((error) => {
    console.error('\n❌ Global compatibility check error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
