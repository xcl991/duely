const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('\n=== Creating Test User ===\n');

  const email = 'stevenoklizz@gmail.com';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('✓ User already exists:');
    console.log('  - Email:', existingUser.email);
    console.log('  - Username:', existingUser.username);
    console.log('  - Name:', existingUser.name);
    console.log('\n✓ You can now use forgot password with this email!');
    await prisma.$disconnect();
    return;
  }

  // Create new user
  const hashedPassword = await bcrypt.hash('testpassword123', 10);

  const user = await prisma.user.create({
    data: {
      email: email,
      username: 'stevenoklizz',
      name: 'Steve Noklizz',
      password: hashedPassword,
    }
  });

  console.log('✅ Test user created successfully!\n');
  console.log('User Details:');
  console.log('  - Email:', user.email);
  console.log('  - Username:', user.username);
  console.log('  - Name:', user.name);
  console.log('  - Password: testpassword123');
  console.log('\n✓ You can now:');
  console.log('  1. Login with: stevenoklizz@gmail.com / testpassword123');
  console.log('  2. Or login with: stevenoklizz / testpassword123');
  console.log('  3. Test forgot password with: stevenoklizz@gmail.com');
  console.log('\n=== Done ===\n');

  await prisma.$disconnect();
}

createTestUser().catch(console.error);
