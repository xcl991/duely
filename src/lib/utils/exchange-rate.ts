/**
 * Exchange Rate utility functions
 */

import { prisma } from "@/lib/prisma";

/**
 * Get the latest exchange rate between two currencies
 * @param fromCurrency - Source currency code (e.g., "USD")
 * @param toCurrency - Target currency code (e.g., "IDR")
 * @returns Exchange rate or null if not found
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  // If currencies are the same, rate is 1
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to get the rate from database (today's rate)
    const rate = await prisma.exchangeRate.findFirst({
      where: {
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency,
        date: {
          gte: today,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (rate) {
      return rate.rate;
    }

    // If not found, try the reverse (e.g., IDR to USD instead of USD to IDR)
    const reverseRate = await prisma.exchangeRate.findFirst({
      where: {
        baseCurrency: toCurrency,
        targetCurrency: fromCurrency,
        date: {
          gte: today,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (reverseRate) {
      return 1 / reverseRate.rate;
    }

    // If still not found, get the most recent rate (any date)
    const latestRate = await prisma.exchangeRate.findFirst({
      where: {
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency,
      },
      orderBy: {
        date: "desc",
      },
    });

    if (latestRate) {
      console.log(
        `Using older exchange rate from ${latestRate.date.toISOString()} for ${fromCurrency} to ${toCurrency}`
      );
      return latestRate.rate;
    }

    console.warn(
      `No exchange rate found for ${fromCurrency} to ${toCurrency}`
    );
    return null;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
}

/**
 * Convert an amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Converted amount or original if conversion fails
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = await getExchangeRate(fromCurrency, toCurrency);

  if (rate === null) {
    console.warn(
      `Failed to convert ${amount} ${fromCurrency} to ${toCurrency}, using original amount`
    );
    return amount;
  }

  const converted = amount * rate;
  console.log(
    `Converted ${amount} ${fromCurrency} to ${converted.toFixed(2)} ${toCurrency} (rate: ${rate})`
  );

  return converted;
}

/**
 * Fetch latest exchange rates from API and store in database
 * @param baseCurrency - Base currency to fetch rates for (default: USD)
 * @returns Success status and rates
 */
export async function fetchAndStoreExchangeRates(
  baseCurrency: string = "USD"
): Promise<{ success: boolean; rates?: Record<string, number>; error?: string }> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "EXCHANGE_RATE_API_KEY is not configured",
    };
  }

  try {
    // Fetch rates from ExchangeRate-API
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.result !== "success") {
      throw new Error(`API returned error: ${data["error-type"]}`);
    }

    const rates = data.conversion_rates as Record<string, number>;
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to 12 PM (noon)

    // Store rates in database
    const targetCurrencies = ["USD", "EUR", "GBP", "JPY", "IDR", "KRW", "CAD", "AUD", "INR"];

    for (const targetCurrency of targetCurrencies) {
      if (targetCurrency === baseCurrency) continue;

      const rate = rates[targetCurrency];
      if (!rate) continue;

      await prisma.exchangeRate.upsert({
        where: {
          baseCurrency_targetCurrency_date: {
            baseCurrency,
            targetCurrency,
            date: today,
          },
        },
        update: {
          rate,
          updatedAt: new Date(),
        },
        create: {
          baseCurrency,
          targetCurrency,
          rate,
          date: today,
        },
      });
    }

    console.log(`Successfully fetched and stored exchange rates for ${baseCurrency}`);

    return {
      success: true,
      rates,
    };
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
