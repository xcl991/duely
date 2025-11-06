const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminDatabase() {
  console.log('🧪 Testing Admin Database...\n');

  try {
    // Test 1: Check if admin table exists and has data
    console.log('Test 1: Check Admin Table');
    const adminCount = await prisma.admin.count();
    console.log(`   ✅ Admin table exists`);
    console.log(`   📊 Total admins: ${adminCount}\n`);

    // Test 2: Find admin by email
    console.log('Test 2: Find Admin by Email');
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
    });

    if (admin) {
      console.log(`   ✅ Admin found`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   👤 Name: ${admin.name}`);
      console.log(`   🆔 ID: ${admin.id}`);
      console.log(`   📅 Created: ${admin.createdAt}\n`);
    } else {
      console.log(`   ❌ Admin not found!\n`);
      throw new Error('Admin not found in database');
    }

    // Test 3: Verify password hash
    console.log('Test 3: Verify Password Hash');
    const testPassword = '90opklnm';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log(`   Password to test: "${testPassword}"`);
    console.log(`   Stored hash: ${admin.password.substring(0, 30)}...`);
    console.log(`   Match result: ${isValid ? '✅ VALID' : '❌ INVALID'}\n`);

    if (!isValid) {
      throw new Error('Password verification failed!');
    }

    // Test 4: Check AdminLog table
    console.log('Test 4: Check AdminLog Table');
    const logCount = await prisma.adminLog.count();
    console.log(`   ✅ AdminLog table exists`);
    console.log(`   📊 Total logs: ${logCount}\n`);

    // Test 5: Create test log entry
    console.log('Test 5: Create Test Log Entry');
    const testLog = await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'database_test',
        target: null,
        metadata: JSON.stringify({ test: true, timestamp: new Date() }),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
      },
    });
    console.log(`   ✅ Test log created`);
    console.log(`   🆔 Log ID: ${testLog.id}`);
    console.log(`   📝 Action: ${testLog.action}\n`);

    // Test 6: Query logs for admin
    console.log('Test 6: Query Admin Logs');
    const adminLogs = await prisma.adminLog.findMany({
      where: { adminId: admin.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    console.log(`   ✅ Logs retrieved`);
    console.log(`   📊 Total logs for this admin: ${adminLogs.length}`);
    adminLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.action} at ${log.createdAt}`);
    });

    console.log('\n✅ All database tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Summary:');
    console.log(`✅ Admin table: Working`);
    console.log(`✅ AdminLog table: Working`);
    console.log(`✅ Admin user exists: stevenoklizz@gmail.com`);
    console.log(`✅ Password authentication: Working`);
    console.log(`✅ Foreign key relations: Working`);
    console.log(`✅ Logging system: Working\n`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAdminDatabase()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
