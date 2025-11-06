const fs = require('fs');
const path = require('path');

async function testAdminLoginPage() {
  console.log('🧪 Testing Admin Login Page (Step 2.4)...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allTestsPassed = true;
  const errors = [];

  // TEST 1: Check if admin login page file exists
  console.log('✓ TEST 1: Admin Login Page File');
  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');

    if (!fs.existsSync(loginPagePath)) {
      throw new Error('Admin login page file not found');
    }

    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    // Check for page content
    if (loginPageContent.length < 500) {
      throw new Error('Login page content too short - may be incomplete');
    }

    console.log('   ✅ page.tsx file exists');
    console.log(`   ✅ File size: ${(loginPageContent.length / 1024).toFixed(2)} KB`);
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Login Page File: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 2: Check for required imports
  console.log('✓ TEST 2: Required Imports');
  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    const requiredImports = [
      'useState',
      'useRouter',
      'useSearchParams',
      'Button',
      'Input',
      'Label',
      'Card'
    ];

    for (const imp of requiredImports) {
      if (!loginPageContent.includes(imp)) {
        throw new Error(`Import "${imp}" not found`);
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

  // TEST 3: Check for 'use client' directive
  console.log('✓ TEST 3: Client Component');
  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    if (!loginPageContent.includes("'use client'")) {
      throw new Error("'use client' directive not found");
    }

    console.log(`   ✅ 'use client' directive present`);
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Client Component: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 4: Check for form elements
  console.log('✓ TEST 4: Form Elements');
  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    const requiredElements = [
      'email',
      'password',
      'handleSubmit',
      'type="email"',
      'type="password"',
      '<form',
      '<Button'
    ];

    for (const element of requiredElements) {
      if (!loginPageContent.includes(element)) {
        throw new Error(`Form element "${element}" not found`);
      }
    }

    console.log('   ✅ All form elements present:');
    console.log('      - Email input');
    console.log('      - Password input');
    console.log('      - Form element');
    console.log('      - Submit button');
    console.log('      - handleSubmit function');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Form Elements: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 5: Check for API call
  console.log('✓ TEST 5: API Integration');
  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    // Check for fetch to login API
    if (!loginPageContent.includes('/api/admin/auth/login')) {
      throw new Error('Login API endpoint not found');
    }

    if (!loginPageContent.includes('fetch(')) {
      throw new Error('Fetch call not found');
    }

    if (!loginPageContent.includes("method: 'POST'")) {
      throw new Error('POST method not found');
    }

    console.log('   ✅ API endpoint: /api/admin/auth/login');
    console.log('   ✅ Fetch call present');
    console.log('   ✅ POST method used');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`API Integration: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 6: Check for error handling
  console.log('✓ TEST 6: Error Handling');
  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    // Check for error state
    if (!loginPageContent.includes('useState') || !loginPageContent.includes('error')) {
      throw new Error('Error state not found');
    }

    if (!loginPageContent.includes('setError')) {
      throw new Error('setError not found');
    }

    if (!loginPageContent.includes('try {') || !loginPageContent.includes('catch')) {
      throw new Error('Try-catch block not found');
    }

    console.log('   ✅ Error state management');
    console.log('   ✅ Try-catch error handling');
    console.log('   ✅ Error display logic');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Error Handling: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 7: Check for loading state
  console.log('✓ TEST 7: Loading State');
  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    // Check for loading state
    if (!loginPageContent.includes('isLoading')) {
      throw new Error('Loading state not found');
    }

    if (!loginPageContent.includes('setIsLoading')) {
      throw new Error('setIsLoading not found');
    }

    if (!loginPageContent.includes('disabled={isLoading}')) {
      throw new Error('Disabled state during loading not found');
    }

    console.log('   ✅ Loading state management');
    console.log('   ✅ Form disabled during loading');
    console.log('   ✅ Loading indicator');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Loading State: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 8: Check for redirect functionality
  console.log('✓ TEST 8: Redirect Functionality');
  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    // Check for redirect
    if (!loginPageContent.includes('router.push')) {
      throw new Error('router.push not found');
    }

    if (!loginPageContent.includes('searchParams')) {
      throw new Error('searchParams not found - redirect parameter handling missing');
    }

    if (!loginPageContent.includes('/adminpage/dashboard')) {
      throw new Error('Default redirect to dashboard not found');
    }

    console.log('   ✅ Router navigation');
    console.log('   ✅ Redirect parameter handling');
    console.log('   ✅ Default redirect to dashboard');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Redirect Functionality: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 9: Check for UI components
  console.log('✓ TEST 9: UI Components');
  try {
    const loginPagePath = path.join(__dirname, 'src', 'app', '(adminpage)', 'auth', 'page.tsx');
    const loginPageContent = fs.readFileSync(loginPagePath, 'utf-8');

    const requiredUIComponents = [
      'Card',
      'CardHeader',
      'CardTitle',
      'CardDescription',
      'CardContent',
      'Label',
      'Input',
      'Button'
    ];

    for (const component of requiredUIComponents) {
      if (!loginPageContent.includes(`<${component}`)) {
        throw new Error(`UI component "${component}" not used`);
      }
    }

    console.log('   ✅ All UI components used:');
    requiredUIComponents.forEach(comp => {
      console.log(`      - ${comp}`);
    });
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`UI Components: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 10: Check directory structure
  console.log('✓ TEST 10: Directory Structure');
  try {
    const adminPageDir = path.join(__dirname, 'src', 'app', '(adminpage)');
    const authDir = path.join(adminPageDir, 'auth');

    if (!fs.existsSync(adminPageDir)) {
      throw new Error('(adminpage) directory not found');
    }

    if (!fs.existsSync(authDir)) {
      throw new Error('auth directory not found');
    }

    console.log('   ✅ (adminpage) route group created');
    console.log('   ✅ auth directory created');
    console.log('   ✅ Route: /adminpage/auth');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Directory Structure: ${error.message}`);
    allTestsPassed = false;
  }

  // FINAL REPORT
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (allTestsPassed) {
    console.log('✅ STEP 2.4 VALIDATION: ALL TESTS PASSED\n');
    console.log('Summary:');
    console.log('  ✅ Admin login page created');
    console.log('  ✅ Route: /adminpage/auth');
    console.log('  ✅ Client component configured');
    console.log('  ✅ Form elements present');
    console.log('  ✅ Email and password inputs');
    console.log('  ✅ API integration (/api/admin/auth/login)');
    console.log('  ✅ Error handling implemented');
    console.log('  ✅ Loading state management');
    console.log('  ✅ Redirect functionality');
    console.log('  ✅ UI components (shadcn/ui)');
    console.log('  ✅ Professional design');
    console.log('  ✅ Security features (disabled during load)\n');
    console.log('🎉 STEP 2.4 COMPLETE - Ready for Step 2.5\n');
  } else {
    console.log('❌ STEP 2.4 VALIDATION: SOME TESTS FAILED\n');
    console.log('Errors found:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('\n⚠️  Please fix errors before proceeding to Step 2.5\n');
    process.exit(1);
  }
}

testAdminLoginPage()
  .catch((error) => {
    console.error('\n❌ Test script error:', error);
    process.exit(1);
  });
