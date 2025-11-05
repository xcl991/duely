/**
 * Currency utility functions for formatting and conversion
 */

/**
 * Format amount as currency string
 * @param amount - The amount to format
 * @param currency - Currency code (default: IDR)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "IDR",
  locale: string = "en-US"
): string {
  // Currencies that don't use decimal places
  const noDecimalCurrencies = ["IDR", "KRW", "JPY"];

  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency,
  };

  // Remove decimals for currencies with large nominal values
  if (noDecimalCurrencies.includes(currency)) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat(locale, options).format(amount);
}

/**
 * Convert subscription cost to monthly equivalent
 * @param amount - The subscription amount
 * @param frequency - Billing frequency (monthly, yearly, quarterly)
 * @returns Monthly equivalent amount
 */
export function convertToMonthly(amount: number, frequency: string): number {
  switch (frequency.toLowerCase()) {
    case "monthly":
      return amount;
    case "yearly":
    case "annual":
      return amount / 12;
    case "quarterly":
      return amount / 3;
    case "weekly":
      return amount * 4.33; // Average weeks per month
    case "daily":
      return amount * 30;
    default:
      return amount; // Default to monthly
  }
}

/**
 * Convert subscription cost to annual equivalent
 * @param amount - The subscription amount
 * @param frequency - Billing frequency (monthly, yearly, quarterly)
 * @returns Annual equivalent amount
 */
export function convertToAnnual(amount: number, frequency: string): number {
  switch (frequency.toLowerCase()) {
    case "monthly":
      return amount * 12;
    case "yearly":
    case "annual":
      return amount;
    case "quarterly":
      return amount * 4;
    case "weekly":
      return amount * 52;
    case "daily":
      return amount * 365;
    default:
      return amount * 12; // Default to monthly conversion
  }
}

/**
 * Format currency with frequency suffix
 * @param amount - The amount to format
 * @param frequency - Billing frequency
 * @param currency - Currency code (default: IDR)
 * @returns Formatted string with frequency
 */
export function formatCurrencyWithFrequency(
  amount: number,
  frequency: string,
  currency: string = "IDR"
): string {
  const formatted = formatCurrency(amount, currency);
  const freq = frequency.toLowerCase();

  const suffix = {
    monthly: "/mo",
    yearly: "/yr",
    annual: "/yr",
    quarterly: "/qtr",
    weekly: "/wk",
    daily: "/day",
  }[freq] || "";

  return `${formatted}${suffix}`;
}
