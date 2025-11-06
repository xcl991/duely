const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUsername() {
  // Get user by email
  const user = await prisma.user.findUnique({
    where: { email: 'xclnioneone@gmail.com' }
  });

  if (user) {
    console.log('Current user data:');
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Username:', user.username || 'NULL');

    // Update username
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { username: 'xcl991' }
    });

    console.log('\nUpdated successfully!');
    console.log('- New username:', updated.username);
  } else {
    console.log('User not found');
  }

  await prisma.$disconnect();
}

fixUsername().catch(console.error);
