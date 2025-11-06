const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function validatePhase1() {
  console.log('🔍 PHASE 1 VALIDATION - Comprehensive Check\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allTestsPassed = true;
  const errors = [];

  // CHECK 1: Prisma Schema File
  console.log('✓ CHECK 1: Prisma Schema File');
  try {
    const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('schema.prisma not found');
    }
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    // Check for Admin model
    if (!schemaContent.includes('model Admin {')) {
      throw new Error('Admin model not found in schema');
    }

    // Check for AdminLog model
    if (!schemaContent.includes('model AdminLog {')) {
      throw new Error('AdminLog model not found in schema');
    }

    console.log('   ✅ Schema file exists');
    console.log('   ✅ Admin model defined');
    console.log('   ✅ AdminLog model defined\n');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Schema Check: ${error.message}`);
    allTestsPassed = false;
  }

  // CHECK 2: Migration Files
  console.log('✓ CHECK 2: Migration Files');
  try {
    const migrationsPath = path.join(__dirname, 'prisma', 'migrations');
    if (!fs.existsSync(migrationsPath)) {
      throw new Error('Migrations directory not found');
    }

    const migrations = fs.readdirSync(migrationsPath);
    const adminMigration = migrations.find(m => m.includes('add_admin'));

    if (!adminMigration) {
      throw new Error('Admin migration not found');
    }

    const migrationSqlPath = path.join(migrationsPath, adminMigration, 'migration.sql');
    if (!fs.existsSync(migrationSqlPath)) {
      throw new Error('Migration SQL file not found');
    }

    const migrationSql = fs.readFileSync(migrationSqlPath, 'utf-8');

    if (!migrationSql.includes('CREATE TABLE "admins"')) {
      throw new Error('admins table creation not found in migration');
    }

    if (!migrationSql.includes('CREATE TABLE "admin_logs"')) {
      throw new Error('admin_logs table creation not found in migration');
    }

    console.log(`   ✅ Migration directory exists`);
    console.log(`   ✅ Admin migration found: ${adminMigration}`);
    console.log(`   ✅ Migration SQL valid\n`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Migration Check: ${error.message}`);
    allTestsPassed = false;
  }

  // CHECK 3: Database Tables
  console.log('✓ CHECK 3: Database Tables');
  try {
    // Check admins table
    const adminCount = await prisma.admin.count();
    console.log(`   ✅ admins table accessible (${adminCount} records)`);

    // Check admin_logs table
    const logCount = await prisma.adminLog.count();
    console.log(`   ✅ admin_logs table accessible (${logCount} records)\n`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Database Tables: ${error.message}`);
    allTestsPassed = false;
  }

  // CHECK 4: Admin User Created
  console.log('✓ CHECK 4: Admin User Creation');
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
    });

    if (!admin) {
      throw new Error('Admin user not found');
    }

    if (!admin.password) {
      throw new Error('Admin password not set');
    }

    if (admin.password.length < 50) {
      throw new Error('Password does not appear to be hashed');
    }

    console.log(`   ✅ Admin user exists`);
    console.log(`   ✅ Email: ${admin.email}`);
    console.log(`   ✅ Name: ${admin.name || '(not set)'}`);
    console.log(`   ✅ Password hashed (${admin.password.length} chars)\n`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Admin User: ${error.message}`);
    allTestsPassed = false;
  }

  // CHECK 5: Password Authentication
  console.log('✓ CHECK 5: Password Authentication');
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
    });

    if (!admin) {
      throw new Error('Admin not found for password test');
    }

    const correctPassword = '90opklnm';
    const wrongPassword = 'wrongpassword123';

    const isCorrectValid = await bcrypt.compare(correctPassword, admin.password);
    const isWrongValid = await bcrypt.compare(wrongPassword, admin.password);

    if (!isCorrectValid) {
      throw new Error('Correct password validation failed');
    }

    if (isWrongValid) {
      throw new Error('Wrong password was incorrectly validated as correct');
    }

    console.log(`   ✅ Correct password ('90opklnm'): ACCEPTED`);
    console.log(`   ✅ Wrong password: REJECTED\n`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Password Auth: ${error.message}`);
    allTestsPassed = false;
  }

  // CHECK 6: Foreign Key Relations
  console.log('✓ CHECK 6: Foreign Key Relations');
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: 'stevenoklizz@gmail.com' },
      include: { logs: true },
    });

    if (!admin) {
      throw new Error('Admin not found for relation test');
    }

    console.log(`   ✅ Admin-to-Logs relation working`);
    console.log(`   ✅ Admin has ${admin.logs.length} log(s)\n`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Relations: ${error.message}`);
    allTestsPassed = false;
  }

  // CHECK 7: Prisma Client Generation
  console.log('✓ CHECK 7: Prisma Client');
  try {
    const prismaClientPath = path.join(__dirname, 'node_modules', '@prisma', 'client');
    if (!fs.existsSync(prismaClientPath)) {
      throw new Error('Prisma client not generated');
    }

    // Test if Prisma client has Admin types
    if (typeof prisma.admin === 'undefined') {
      throw new Error('Prisma client missing Admin model');
    }

    if (typeof prisma.adminLog === 'undefined') {
      throw new Error('Prisma client missing AdminLog model');
    }

    console.log(`   ✅ Prisma client generated`);
    console.log(`   ✅ Admin model available`);
    console.log(`   ✅ AdminLog model available\n`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Prisma Client: ${error.message}`);
    allTestsPassed = false;
  }

  // CHECK 8: Compatibility with Existing Models
  console.log('✓ CHECK 8: Compatibility with Existing Models');
  try {
    // Test User model still works
    const userCount = await prisma.user.count();
    console.log(`   ✅ User model still works (${userCount} users)`);

    // Test other models
    const subscriptionCount = await prisma.subscription.count();
    console.log(`   ✅ Subscription model works (${subscriptionCount} records)`);

    const categoryCount = await prisma.category.count();
    console.log(`   ✅ Category model works (${categoryCount} records)\n`);
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    errors.push(`Compatibility: ${error.message}`);
    allTestsPassed = false;
  }

  // FINAL REPORT
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (allTestsPassed) {
    console.log('✅ PHASE 1 VALIDATION: ALL CHECKS PASSED\n');
    console.log('Summary:');
    console.log('  ✅ Schema updated correctly');
    console.log('  ✅ Migration created and applied');
    console.log('  ✅ Admin tables created');
    console.log('  ✅ Admin user seeded');
    console.log('  ✅ Password authentication working');
    console.log('  ✅ Database relations working');
    console.log('  ✅ Prisma client regenerated');
    console.log('  ✅ Backward compatible with existing models\n');
    console.log('🎉 PHASE 1 COMPLETE - READY FOR PHASE 2\n');
  } else {
    console.log('❌ PHASE 1 VALIDATION: SOME CHECKS FAILED\n');
    console.log('Errors found:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('\n⚠️  Please fix errors before proceeding to Phase 2\n');
    process.exit(1);
  }
}

validatePhase1()
  .catch((error) => {
    console.error('\n❌ Validation script error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
