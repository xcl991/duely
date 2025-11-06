import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  // Admin credentials
  const adminEmail = 'stevenoklizz@gmail.com';
  const adminPassword = '90opklnm';
  const adminName = 'Steven Admin';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`);
    console.log(`   ID: ${existingAdmin.id}`);
    console.log(`   Created: ${existingAdmin.createdAt}`);
    return;
  }

  // Hash password with bcrypt
  console.log('🔐 Hashing password...');
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create admin user
  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name: ${admin.name}`);
  console.log(`   ID: ${admin.id}`);
  console.log(`   Created: ${admin.createdAt}`);
  console.log('');
  console.log('🔑 Credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('');
  console.log('⚠️  Remember: Password is hashed in database for security!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
