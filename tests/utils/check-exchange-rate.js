const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const rates = await prisma.exchangeRate.findMany({
    where: {
      OR: [
        { baseCurrency: 'USD', targetCurrency: 'IDR' },
        { baseCurrency: 'IDR', targetCurrency: 'USD' }
      ]
    }
  });

  console.log('Exchange rates USD-IDR:');
  console.table(rates);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
