const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testForgotPassword() {
  console.log('\n=== Testing Forgot Password Flow ===\n');

  // Check if test user exists
  const user = await prisma.user.findUnique({
    where: { email: 'xclnioneone@gmail.com' }
  });

  if (user) {
    console.log('✓ Test user found:');
    console.log('  - Email:', user.email);
    console.log('  - Username:', user.username);
    console.log('  - Has password:', !!user.password);
  } else {
    console.log('✗ Test user not found');
  }

  // Check VerificationToken table
  console.log('\n--- Checking VerificationToken table ---');
  const tokens = await prisma.verificationToken.findMany();
  console.log(`Found ${tokens.length} token(s):`);

  tokens.forEach((token, index) => {
    console.log(`\nToken ${index + 1}:`);
    console.log('  - Identifier (Email):', token.identifier);
    console.log('  - Token:', token.token.substring(0, 20) + '...');
    console.log('  - Expires:', token.expires);
    console.log('  - Is Expired:', token.expires < new Date());
  });

  console.log('\n=== Test Complete ===\n');

  await prisma.$disconnect();
}

testForgotPassword().catch(console.error);
