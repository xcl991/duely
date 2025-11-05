import { config } from 'dotenv';
config(); // Load .env file

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@duely.com' },
    update: {},
    create: {
      email: 'test@duely.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  console.log('✅ User created:', user.email);

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      currency: 'USD',
      emailReminders: true,
      reminderDaysBefore: 3,
      weeklyDigest: false,
    },
  });

  console.log('✅ User settings created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Entertainment',
        icon: '🎬',
        color: '#8b5cf6',
        budgetLimit: 50.00,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Productivity',
        icon: '💼',
        color: '#3b82f6',
        budgetLimit: 30.00,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Education',
        icon: '📚',
        color: '#22c55e',
        budgetLimit: 40.00,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Health & Fitness',
        icon: '💪',
        color: '#ef4444',
        budgetLimit: 60.00,
      },
    }),
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create family members
  const members = await Promise.all([
    prisma.member.create({
      data: {
        userId: user.id,
        name: 'John Doe',
        avatarColor: '#3b82f6',
        isPrimary: true,
      },
    }),
    prisma.member.create({
      data: {
        userId: user.id,
        name: 'Jane Doe',
        avatarColor: '#ec4899',
        isPrimary: false,
      },
    }),
    prisma.member.create({
      data: {
        userId: user.id,
        name: 'Kids',
        avatarColor: '#f59e0b',
        isPrimary: false,
      },
    }),
  ]);

  console.log('✅ Members created:', members.length);

  // Create subscriptions
  const now = new Date();
  const subscriptions = await Promise.all([
    // Entertainment subscriptions
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[0].id,
        memberId: members[0].id,
        serviceName: 'Netflix',
        amount: 15.99,
        currency: 'USD',
        billingFrequency: 'monthly',
        startDate: new Date('2024-01-01'),
        nextBilling: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        status: 'active',
        notes: 'Premium plan for family',
      },
    }),
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[0].id,
        memberId: members[1].id,
        serviceName: 'Spotify',
        amount: 10.99,
        currency: 'USD',
        billingFrequency: 'monthly',
        startDate: new Date('2024-02-01'),
        nextBilling: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        status: 'active',
        notes: 'Individual premium',
      },
    }),
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[0].id,
        memberId: members[2].id,
        serviceName: 'Disney+',
        amount: 7.99,
        currency: 'USD',
        billingFrequency: 'monthly',
        startDate: new Date('2024-03-01'),
        nextBilling: new Date(now.getFullYear(), now.getMonth() + 1, 5),
        status: 'active',
      },
    }),

    // Productivity subscriptions
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[1].id,
        memberId: members[0].id,
        serviceName: 'GitHub',
        amount: 4.00,
        currency: 'USD',
        billingFrequency: 'monthly',
        startDate: new Date('2024-01-15'),
        nextBilling: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        status: 'active',
        notes: 'Pro plan',
      },
    }),
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[1].id,
        memberId: members[0].id,
        serviceName: 'Notion',
        amount: 8.00,
        currency: 'USD',
        billingFrequency: 'monthly',
        startDate: new Date('2024-02-01'),
        nextBilling: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        status: 'active',
        notes: 'Personal Pro',
      },
    }),

    // Education subscriptions
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[2].id,
        memberId: members[0].id,
        serviceName: 'Coursera',
        amount: 59.00,
        currency: 'USD',
        billingFrequency: 'monthly',
        startDate: new Date('2024-03-01'),
        nextBilling: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        status: 'active',
        notes: 'Plus subscription',
      },
    }),

    // Health & Fitness subscriptions
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[3].id,
        memberId: members[0].id,
        serviceName: 'Planet Fitness',
        amount: 22.99,
        currency: 'USD',
        billingFrequency: 'monthly',
        startDate: new Date('2024-01-01'),
        nextBilling: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        status: 'active',
        notes: 'Black card membership',
      },
    }),
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[3].id,
        memberId: members[1].id,
        serviceName: 'Headspace',
        amount: 12.99,
        currency: 'USD',
        billingFrequency: 'monthly',
        startDate: new Date('2024-02-15'),
        nextBilling: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        status: 'active',
        notes: 'Meditation app',
      },
    }),

    // Yearly subscription example
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[1].id,
        memberId: members[0].id,
        serviceName: 'Adobe Creative Cloud',
        amount: 599.88,
        currency: 'USD',
        billingFrequency: 'yearly',
        startDate: new Date('2024-01-01'),
        nextBilling: new Date(now.getFullYear() + 1, 0, 1),
        status: 'active',
        notes: 'Photography plan',
      },
    }),

    // Trial subscription example
    prisma.subscription.create({
      data: {
        userId: user.id,
        categoryId: categories[2].id,
        memberId: members[0].id,
        serviceName: 'Udemy Pro',
        amount: 29.99,
        currency: 'USD',
        billingFrequency: 'monthly',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
        nextBilling: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 23),
        status: 'trial',
        notes: '30-day trial period',
      },
    }),
  ]);

  console.log('✅ Subscriptions created:', subscriptions.length);

  // Create sample notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: user.id,
        subscriptionId: subscriptions[0].id,
        type: 'renewal_reminder',
        title: 'Netflix renewal coming up',
        message: 'Your Netflix subscription will renew in 3 days for $15.99',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        type: 'budget_alert',
        title: 'Entertainment budget alert',
        message: 'You have spent 90% of your Entertainment budget this month',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        subscriptionId: subscriptions[9].id,
        type: 'info',
        title: 'Trial ending soon',
        message: 'Your Udemy Pro trial will end in 7 days',
        isRead: true,
      },
    }),
  ]);

  console.log('✅ Notifications created:', notifications.length);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📧 Test Account:');
  console.log('   Email: test@duely.com');
  console.log('   Password: password123');
  console.log('\n📊 Sample Data:');
  console.log('   - Categories: 4');
  console.log('   - Members: 3');
  console.log('   - Subscriptions: 11');
  console.log('   - Notifications: 3');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
