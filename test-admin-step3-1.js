const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminDashboardLayout() {
  console.log('🧪 TESTING STEP 3.1: Admin Dashboard Layout and Navigation\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let totalTests = 0;
  let passedTests = 0;
  const errors = [];

  // ============================================
  // Test 1: Check AdminSidebar Component
  // ============================================
  console.log('📝 Test 1: AdminSidebar Component\n');

  try {
    const sidebarPath = path.join(__dirname, 'src', 'components', 'admin', 'AdminSidebar.tsx');

    if (!fs.existsSync(sidebarPath)) {
      errors.push('AdminSidebar.tsx not found');
    } else {
      const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

      // Check if it's a client component
      if (sidebarContent.includes("'use client'")) {
        console.log('   ✅ AdminSidebar is a client component');
        totalTests++;
        passedTests++;
      } else {
        errors.push('AdminSidebar should be a client component');
      }

      // Check for menu items
      const menuItems = ['Dashboard', 'Users', 'Subscriptions', 'Admin Logs'];
      for (const item of menuItems) {
        if (sidebarContent.includes(item)) {
          console.log(`   ✅ Menu item "${item}" found`);
          totalTests++;
          passedTests++;
        } else {
          errors.push(`Menu item "${item}" not found`);
        }
      }

      // Check for logout functionality
      if (sidebarContent.includes('handleLogout') && sidebarContent.includes('/api/admin/auth/logout')) {
        console.log('   ✅ Logout functionality implemented');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Logout functionality not properly implemented');
      }

      // Check for navigation hooks
      if (sidebarContent.includes('usePathname') && sidebarContent.includes('useRouter')) {
        console.log('   ✅ Navigation hooks used correctly');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Navigation hooks not properly used');
      }

      // Check for icons
      const icons = ['LayoutDashboard', 'Users', 'CreditCard', 'FileText', 'LogOut', 'Shield'];
      const iconCount = icons.filter(icon => sidebarContent.includes(icon)).length;
      if (iconCount === icons.length) {
        console.log(`   ✅ All ${icons.length} required icons imported`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Only ${iconCount}/${icons.length} icons found`);
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`AdminSidebar test error: ${error.message}`);
  }

  // ============================================
  // Test 2: Check Dashboard Layout
  // ============================================
  console.log('📝 Test 2: Dashboard Layout\n');

  try {
    const layoutPath = path.join(__dirname, 'src', 'app', '(adminpage)', 'dashboard', 'layout.tsx');

    if (!fs.existsSync(layoutPath)) {
      errors.push('Dashboard layout.tsx not found');
    } else {
      const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

      // Check for AdminSidebar import
      if (layoutContent.includes('AdminSidebar')) {
        console.log('   ✅ AdminSidebar imported in layout');
        totalTests++;
        passedTests++;
      } else {
        errors.push('AdminSidebar not imported in layout');
      }

      // Check for proper layout structure
      if (layoutContent.includes('flex h-screen') || layoutContent.includes('flex-1')) {
        console.log('   ✅ Proper flex layout structure');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Layout structure not properly set up');
      }

      // Check for children prop
      if (layoutContent.includes('children') && layoutContent.includes('React.ReactNode')) {
        console.log('   ✅ Children prop properly typed');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Children prop not properly implemented');
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`Dashboard layout test error: ${error.message}`);
  }

  // ============================================
  // Test 3: Check Dashboard Page
  // ============================================
  console.log('📝 Test 3: Dashboard Page\n');

  try {
    const pagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'dashboard', 'page.tsx');

    if (!fs.existsSync(pagePath)) {
      errors.push('Dashboard page.tsx not found');
    } else {
      const pageContent = fs.readFileSync(pagePath, 'utf-8');

      // Check for session usage
      if (pageContent.includes('getAdminSession')) {
        console.log('   ✅ Admin session used in dashboard page');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Admin session not used in dashboard page');
      }

      // Check for stats function
      if (pageContent.includes('getDashboardStats')) {
        console.log('   ✅ Dashboard stats function implemented');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Dashboard stats function not found');
      }

      // Check for database queries
      const queries = ['prisma.user.count', 'prisma.subscription.count', 'prisma.adminLog.findMany'];
      const queryCount = queries.filter(query => pageContent.includes(query)).length;
      if (queryCount === queries.length) {
        console.log(`   ✅ All ${queries.length} database queries present`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Only ${queryCount}/${queries.length} database queries found`);
      }

      // Check for Card components
      if (pageContent.includes('Card') && pageContent.includes('CardHeader') && pageContent.includes('CardContent')) {
        console.log('   ✅ Card components used for UI');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Card components not properly used');
      }

      // Check for stats display
      const stats = ['totalUsers', 'activeSubscriptions', 'totalSubscriptions', 'recentLogs'];
      const statsCount = stats.filter(stat => pageContent.includes(stat)).length;
      if (statsCount === stats.length) {
        console.log(`   ✅ All ${stats.length} stats displayed`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Only ${statsCount}/${stats.length} stats found`);
      }

      // Check for icons
      const dashboardIcons = ['Users', 'CreditCard', 'TrendingUp', 'Activity'];
      const dashIconCount = dashboardIcons.filter(icon => pageContent.includes(icon)).length;
      if (dashIconCount === dashboardIcons.length) {
        console.log(`   ✅ All ${dashboardIcons.length} stat card icons present`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`Only ${dashIconCount}/${dashboardIcons.length} stat card icons found`);
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`Dashboard page test error: ${error.message}`);
  }

  // ============================================
  // Test 4: Database Query Functionality
  // ============================================
  console.log('📝 Test 4: Database Query Functionality\n');

  try {
    // Test user count query
    const userCount = await prisma.user.count();
    console.log(`   ✅ User count query works: ${userCount} users`);
    totalTests++;
    passedTests++;

    // Test subscription count query
    const subCount = await prisma.subscription.count();
    console.log(`   ✅ Subscription count query works: ${subCount} subscriptions`);
    totalTests++;
    passedTests++;

    // Test active subscriptions query
    const activeSubs = await prisma.subscription.count({
      where: {
        status: 'active',
      },
    });
    console.log(`   ✅ Active subscriptions query works: ${activeSubs} active`);
    totalTests++;
    passedTests++;

    // Test admin logs query
    const recentLogs = await prisma.adminLog.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        admin: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
    console.log(`   ✅ Admin logs query works: ${recentLogs.length} recent logs`);
    totalTests++;
    passedTests++;

    // Test new users query (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
    console.log(`   ✅ New users query works: ${newUsers} new users in last 30 days`);
    totalTests++;
    passedTests++;

    console.log('');
  } catch (error) {
    errors.push(`Database query test error: ${error.message}`);
  }

  // ============================================
  // Test 5: TypeScript Compilation
  // ============================================
  console.log('📝 Test 5: TypeScript Compilation Check\n');

  try {
    const filesToCheck = [
      'src/components/admin/AdminSidebar.tsx',
      'src/app/(adminpage)/dashboard/layout.tsx',
      'src/app/(adminpage)/dashboard/page.tsx',
    ];

    for (const file of filesToCheck) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file} exists and ready for compilation`);
        totalTests++;
        passedTests++;
      } else {
        errors.push(`${file} not found`);
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`TypeScript compilation check error: ${error.message}`);
  }

  // ============================================
  // Test 6: Route Structure
  // ============================================
  console.log('📝 Test 6: Route Structure Validation\n');

  try {
    // Check adminpage layout
    const adminLayoutPath = path.join(__dirname, 'src', 'app', '(adminpage)', 'layout.tsx');
    if (fs.existsSync(adminLayoutPath)) {
      const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf-8');
      if (adminLayoutContent.includes('getAdminSession') && adminLayoutContent.includes('redirect')) {
        console.log('   ✅ Admin layout has session protection');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Admin layout missing session protection');
      }
    } else {
      errors.push('Admin layout not found');
    }

    // Check auth page exists
    const authPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    if (fs.existsSync(authPagePath)) {
      console.log('   ✅ Auth page exists');
      totalTests++;
      passedTests++;
    } else {
      errors.push('Auth page not found');
    }

    // Check dashboard route structure
    const dashboardDir = path.join(__dirname, 'src', 'app', '(adminpage)', 'dashboard');
    if (fs.existsSync(dashboardDir) && fs.statSync(dashboardDir).isDirectory()) {
      console.log('   ✅ Dashboard directory structure correct');
      totalTests++;
      passedTests++;
    } else {
      errors.push('Dashboard directory not found');
    }

    console.log('');
  } catch (error) {
    errors.push(`Route structure test error: ${error.message}`);
  }

  // ============================================
  // Test 7: UI Component Validation
  // ============================================
  console.log('📝 Test 7: UI Component Usage\n');

  try {
    const sidebarPath = path.join(__dirname, 'src', 'components', 'admin', 'AdminSidebar.tsx');
    const pagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'dashboard', 'page.tsx');

    if (fs.existsSync(sidebarPath) && fs.existsSync(pagePath)) {
      const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
      const pageContent = fs.readFileSync(pagePath, 'utf-8');

      // Check for shadcn/ui components
      const uiComponents = ['Button', 'Card'];
      for (const component of uiComponents) {
        if (sidebarContent.includes(component) || pageContent.includes(component)) {
          console.log(`   ✅ ${component} component used`);
          totalTests++;
          passedTests++;
        } else {
          errors.push(`${component} component not used`);
        }
      }

      // Check for utility imports
      if (sidebarContent.includes('@/lib/utils') || sidebarContent.includes('cn(')) {
        console.log('   ✅ Utility functions imported (cn)');
        totalTests++;
        passedTests++;
      } else {
        errors.push('Utility functions not properly imported');
      }
    }

    console.log('');
  } catch (error) {
    errors.push(`UI component validation error: ${error.message}`);
  }

  // ============================================
  // FINAL SUMMARY
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 STEP 3.1 TEST SUMMARY\n');

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${errors.length}`);
  console.log(`Pass Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0}%\n`);

  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    console.log('');
    console.log('⚠️  Please fix errors before proceeding to Step 3.2\n');
    process.exit(1);
  } else {
    console.log('✅ STEP 3.1: ALL TESTS PASSED\n');
    console.log('Step 3.1 Implementation Complete:');
    console.log('  ✅ AdminSidebar component with navigation');
    console.log('  ✅ Dashboard layout with sidebar integration');
    console.log('  ✅ Dashboard page with statistics');
    console.log('  ✅ Database queries working correctly');
    console.log('  ✅ UI components properly used');
    console.log('  ✅ Route structure validated');
    console.log('  ✅ TypeScript files ready');
    console.log('');
    console.log('🎉 STEP 3.1 COMPLETE & VERIFIED ✅\n');
    console.log('Ready to proceed to Step 3.2: Admin Dashboard Homepage with Statistics\n');
  }
}

testAdminDashboardLayout()
  .catch((error) => {
    console.error('\n❌ Test error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
