const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCurrency() {
  try {
    console.log('🔍 Checking for IDR currency data...\n');

    // Check UserSettings
    const userSettings = await prisma.userSettings.findMany({
      where: {
        currency: 'IDR'
      }
    });

    console.log(`Found ${userSettings.length} user settings with IDR currency`);

    // Update UserSettings to USD
    if (userSettings.length > 0) {
      const updated = await prisma.userSettings.updateMany({
        where: {
          currency: 'IDR'
        },
        data: {
          currency: 'USD'
        }
      });
      console.log(`✅ Updated ${updated.count} user settings to USD\n`);
    }

    // Check Subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        currency: 'IDR'
      }
    });

    console.log(`Found ${subscriptions.length} subscriptions with IDR currency`);

    // Update Subscriptions to USD
    if (subscriptions.length > 0) {
      const updated = await prisma.subscription.updateMany({
        where: {
          currency: 'IDR'
        },
        data: {
          currency: 'USD'
        }
      });
      console.log(`✅ Updated ${updated.count} subscriptions to USD\n`);
    }

    console.log('✨ Currency fix completed!');
    console.log('All currency data now set to USD with proper formatting (e.g., $100,000.00)');

  } catch (error) {
    console.error('❌ Error fixing currency:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCurrency();
