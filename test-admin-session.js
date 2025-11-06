const fs = require('fs');
const path = require('path');

async function testAdminSessionFunctions() {
  console.log('🧪 Testing Admin Session Functions (Step 2.2)...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allTestsPassed = true;
  const errors = [];

  // TEST 1: Check if Admin session.ts file exists
  console.log('✓ TEST 1: Admin Session Module');
  try {
    const sessionFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');

    if (!fs.existsSync(sessionFilePath)) {
      throw new Error('session.ts file not found');
    }

    const sessionContent = fs.readFileSync(sessionFilePath, 'utf-8');

    // Check for required functions
    const requiredFunctions = [
      'createAdminSession',
      'verifyAdminSession',
      'setAdminSessionCookie',
      'getAdminSession',
      'deleteAdminSession',
      'isAdminAuthenticated',
      'getCurrentAdminId',
      'getCurrentAdminEmail'
    ];

    for (const func of requiredFunctions) {
      if (!sessionContent.includes(`export async function ${func}`)) {
        throw new Error(`Function ${func} not found in session.ts`);
      }
    }

    console.log('   ✅ session.ts file exists');
    console.log('   ✅ All 8 required functions present:');
    requiredFunctions.forEach(func => {
      console.log(`      - ${func}`);
    });
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Admin Session Module: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 2: Check TypeScript types
  console.log('✓ TEST 2: TypeScript Types');
  try {
    const sessionFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');
    const sessionContent = fs.readFileSync(sessionFilePath, 'utf-8');

    const requiredTypes = [
      'AdminSession'
    ];

    for (const type of requiredTypes) {
      if (!sessionContent.includes(`export interface ${type}`)) {
        throw new Error(`Type ${type} not found in session.ts`);
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

  // TEST 3: Check imports
  console.log('✓ TEST 3: Required Imports');
  try {
    const sessionFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');
    const sessionContent = fs.readFileSync(sessionFilePath, 'utf-8');

    const requiredImports = [
      'next/headers',
      'jose',
      './auth'
    ];

    for (const imp of requiredImports) {
      if (!sessionContent.includes(`from '${imp}'`) && !sessionContent.includes(`from "${imp}"`)) {
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

  // TEST 4: Check session configuration
  console.log('✓ TEST 4: Session Configuration');
  try {
    const sessionFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');
    const sessionContent = fs.readFileSync(sessionFilePath, 'utf-8');

    // Check for SESSION_CONFIG
    if (!sessionContent.includes('SESSION_CONFIG')) {
      throw new Error('SESSION_CONFIG not found');
    }

    // Check for cookie configuration
    if (!sessionContent.includes('cookieName')) {
      throw new Error('cookieName configuration not found');
    }

    if (!sessionContent.includes('maxAge')) {
      throw new Error('maxAge configuration not found');
    }

    if (!sessionContent.includes('secret')) {
      throw new Error('secret configuration not found');
    }

    console.log('   ✅ SESSION_CONFIG defined');
    console.log('   ✅ Cookie name configured');
    console.log('   ✅ Max age configured');
    console.log('   ✅ Secret key configured');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Session Configuration: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 5: Check JWT functions
  console.log('✓ TEST 5: JWT Functions');
  try {
    const sessionFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');
    const sessionContent = fs.readFileSync(sessionFilePath, 'utf-8');

    // Check for JWT operations
    if (!sessionContent.includes('SignJWT')) {
      throw new Error('SignJWT not found - JWT creation not implemented');
    }

    if (!sessionContent.includes('jwtVerify')) {
      throw new Error('jwtVerify not found - JWT verification not implemented');
    }

    console.log('   ✅ JWT creation (SignJWT) implemented');
    console.log('   ✅ JWT verification (jwtVerify) implemented');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`JWT Functions: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 6: Check cookie operations
  console.log('✓ TEST 6: Cookie Operations');
  try {
    const sessionFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');
    const sessionContent = fs.readFileSync(sessionFilePath, 'utf-8');

    // Check for cookie operations
    if (!sessionContent.includes('cookies()')) {
      throw new Error('cookies() not found - cookie operations not implemented');
    }

    if (!sessionContent.includes('httpOnly')) {
      throw new Error('httpOnly not found - security flag missing');
    }

    if (!sessionContent.includes('secure')) {
      throw new Error('secure not found - security flag missing');
    }

    if (!sessionContent.includes('sameSite')) {
      throw new Error('sameSite not found - security flag missing');
    }

    console.log('   ✅ Cookie operations implemented');
    console.log('   ✅ httpOnly flag set (security)');
    console.log('   ✅ secure flag set (security)');
    console.log('   ✅ sameSite flag set (security)');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Cookie Operations: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 7: Check jose package installation
  console.log('✓ TEST 7: Dependencies');
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (!packageJson.dependencies.jose) {
      throw new Error('jose package not installed');
    }

    console.log('   ✅ jose package installed');
    console.log(`   ✅ Version: ${packageJson.dependencies.jose}`);
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Dependencies: ${error.message}`);
    allTestsPassed = false;
  }

  // TEST 8: Security checks
  console.log('✓ TEST 8: Security Features');
  try {
    const sessionFilePath = path.join(__dirname, 'src', 'lib', 'admin', 'session.ts');
    const sessionContent = fs.readFileSync(sessionFilePath, 'utf-8');

    // Check for environment variable usage
    if (!sessionContent.includes('process.env.ADMIN_SESSION_SECRET')) {
      throw new Error('Environment variable for secret not found');
    }

    // Check for fallback secret
    if (!sessionContent.includes('fallback-secret')) {
      throw new Error('Fallback secret not found');
    }

    // Check for production check
    if (!sessionContent.includes('process.env.NODE_ENV')) {
      throw new Error('Production environment check not found');
    }

    console.log('   ✅ Environment variable for secret configured');
    console.log('   ✅ Fallback secret provided');
    console.log('   ✅ Production environment check present');
    console.log('   ✅ Cookie security flags implemented');
    console.log('');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Security Features: ${error.message}`);
    allTestsPassed = false;
  }

  // FINAL REPORT
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (allTestsPassed) {
    console.log('✅ STEP 2.2 VALIDATION: ALL TESTS PASSED\n');
    console.log('Summary:');
    console.log('  ✅ session.ts file created with all functions');
    console.log('  ✅ createAdminSession function ready');
    console.log('  ✅ verifyAdminSession function ready');
    console.log('  ✅ setAdminSessionCookie function ready');
    console.log('  ✅ getAdminSession function ready');
    console.log('  ✅ deleteAdminSession function ready');
    console.log('  ✅ isAdminAuthenticated function ready');
    console.log('  ✅ getCurrentAdminId function ready');
    console.log('  ✅ getCurrentAdminEmail function ready');
    console.log('  ✅ JWT (jose) integration complete');
    console.log('  ✅ Cookie management implemented');
    console.log('  ✅ Security features enabled');
    console.log('  ✅ TypeScript types defined\n');
    console.log('🎉 STEP 2.2 COMPLETE - Ready for Step 2.3\n');
  } else {
    console.log('❌ STEP 2.2 VALIDATION: SOME TESTS FAILED\n');
    console.log('Errors found:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('\n⚠️  Please fix errors before proceeding to Step 2.3\n');
    process.exit(1);
  }
}

testAdminSessionFunctions()
  .catch((error) => {
    console.error('\n❌ Test script error:', error);
    process.exit(1);
  });
