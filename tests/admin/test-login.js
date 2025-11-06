const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  // Test dengan email
  const testEmail = 'test@duely.com';
  console.log('\n=== Testing login with EMAIL ===');
  console.log('Input:', testEmail);
  console.log('Contains @:', testEmail.includes('@'));

  const isEmail = testEmail.includes('@');
  console.log('isEmail:', isEmail);

  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: testEmail }
      : { username: testEmail.toLowerCase() },
  });

  console.log('User found:', user ? `Yes (${user.email})` : 'No');
  if (user) {
    console.log('User has password:', !!user.password);
    console.log('User has username:', user.username || 'NULL');

    // Test password
    const testPassword = 'test123'; // ganti dengan password yang benar
    if (user.password) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('Password test123 valid:', isValid);
    }
  }

  // Test dengan username
  console.log('\n=== Testing login with USERNAME ===');
  const testUsername = 'xcl991';
  console.log('Input:', testUsername);
  console.log('Contains @:', testUsername.includes('@'));

  const isEmail2 = testUsername.includes('@');
  console.log('isEmail:', isEmail2);

  const user2 = await prisma.user.findFirst({
    where: isEmail2
      ? { email: testUsername }
      : { username: testUsername.toLowerCase() },
  });

  console.log('User found:', user2 ? `Yes (${user2.email})` : 'No');
  if (user2) {
    console.log('User has password:', !!user2.password);
    console.log('User username:', user2.username);
  }

  await prisma.$disconnect();
}

testLogin().catch(console.error);
