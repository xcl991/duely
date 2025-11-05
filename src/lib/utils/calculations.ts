/**
 * Calculation utilities for subscription analytics
 */

import { convertToMonthly, convertToAnnual } from "./currency";
import { convertCurrency } from "./exchange-rate";

export type Subscription = {
  id: string;
  amount: number;
  currency?: string;
  billingFrequency: string;
  categoryId?: string | null | undefined;
  memberId?: string | null | undefined;
  status: string;
  nextBilling: Date;
};

export type CategoryTotal = {
  categoryId: string | null;
  categoryName: string;
  total: number;
  count: number;
  percentage: number;
};

/**
 * Calculate total monthly spending from subscriptions
 * @param subscriptions - Array of subscriptions
 * @param includeInactive - Whether to include non-active subscriptions
 * @param displayCurrency - Currency to convert amounts to (optional)
 * @returns Total monthly spending
 */
export async function calculateMonthlyTotal(
  subscriptions: Subscription[],
  includeInactive: boolean = false,
  displayCurrency?: string
): Promise<number> {
  let total = 0;

  for (const sub of subscriptions) {
    if (!includeInactive && sub.status !== "active") continue;

    let amount = convertToMonthly(sub.amount, sub.billingFrequency);

    // Convert to display currency if needed
    const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
    if (displayCurrency && subCurrency !== displayCurrency) {
      amount = await convertCurrency(amount, subCurrency, displayCurrency);
    }

    total += amount;
  }

  return total;
}

/**
 * Calculate annual projection from subscriptions
 * @param subscriptions - Array of subscriptions
 * @param includeInactive - Whether to include non-active subscriptions
 * @param displayCurrency - Currency to convert amounts to (optional)
 * @returns Annual projection
 */
export async function calculateAnnualProjection(
  subscriptions: Subscription[],
  includeInactive: boolean = false,
  displayCurrency?: string
): Promise<number> {
  let total = 0;

  for (const sub of subscriptions) {
    if (!includeInactive && sub.status !== "active") continue;

    let amount = convertToAnnual(sub.amount, sub.billingFrequency);

    // Convert to display currency if needed
    const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
    if (displayCurrency && subCurrency !== displayCurrency) {
      amount = await convertCurrency(amount, subCurrency, displayCurrency);
    }

    total += amount;
  }

  return total;
}

/**
 * Calculate average subscription cost (monthly)
 * @param subscriptions - Array of subscriptions
 * @param displayCurrency - Currency to convert amounts to (optional)
 * @returns Average monthly cost
 */
export async function calculateAverageCost(
  subscriptions: Subscription[],
  displayCurrency?: string
): Promise<number> {
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");

  if (activeSubscriptions.length === 0) {
    return 0;
  }

  const total = await calculateMonthlyTotal(activeSubscriptions, false, displayCurrency);
  return total / activeSubscriptions.length;
}

/**
 * Calculate spending totals by category
 * @param subscriptions - Array of subscriptions
 * @param categories - Map of category ID to category name
 * @param displayCurrency - Currency to convert amounts to (optional)
 * @returns Array of category totals
 */
export async function calculateCategoryTotals(
  subscriptions: Subscription[],
  categories: Map<string, string>,
  displayCurrency?: string
): Promise<CategoryTotal[]> {
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
  const totalMonthly = await calculateMonthlyTotal(activeSubscriptions, false, displayCurrency);

  // Group by category
  const categoryMap = new Map<string | null, { total: number; count: number }>();

  for (const sub of activeSubscriptions) {
    const key = sub.categoryId ?? null;
    let monthlyAmount = convertToMonthly(sub.amount, sub.billingFrequency);

    // Convert to display currency if needed
    const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
    if (displayCurrency && subCurrency !== displayCurrency) {
      monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
    }

    if (categoryMap.has(key)) {
      const existing = categoryMap.get(key)!;
      categoryMap.set(key, {
        total: existing.total + monthlyAmount,
        count: existing.count + 1,
      });
    } else {
      categoryMap.set(key, {
        total: monthlyAmount,
        count: 1,
      });
    }
  }

  // Convert to array
  const result: CategoryTotal[] = [];
  categoryMap.forEach((value, key) => {
    result.push({
      categoryId: key,
      categoryName: key ? categories.get(key) || "Unknown" : "Uncategorized",
      total: value.total,
      count: value.count,
      percentage: totalMonthly > 0 ? (value.total / totalMonthly) * 100 : 0,
    });
  });

  // Sort by total (descending)
  return result.sort((a, b) => b.total - a.total);
}

/**
 * Calculate spending totals by member
 * @param subscriptions - Array of subscriptions
 * @param members - Map of member ID to member name
 * @param displayCurrency - Currency to convert amounts to (optional)
 * @returns Array of member totals
 */
export async function calculateMemberTotals(
  subscriptions: Subscription[],
  members: Map<string, string>,
  displayCurrency?: string
): Promise<Array<{
  memberId: string | null;
  memberName: string;
  total: number;
  count: number;
}>> {
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");

  // Group by member
  const memberMap = new Map<string | null, { total: number; count: number }>();

  for (const sub of activeSubscriptions) {
    const key = sub.memberId ?? null;
    let monthlyAmount = convertToMonthly(sub.amount, sub.billingFrequency);

    // Convert to display currency if needed
    const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
    if (displayCurrency && subCurrency !== displayCurrency) {
      monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
    }

    if (memberMap.has(key)) {
      const existing = memberMap.get(key)!;
      memberMap.set(key, {
        total: existing.total + monthlyAmount,
        count: existing.count + 1,
      });
    } else {
      memberMap.set(key, {
        total: monthlyAmount,
        count: 1,
      });
    }
  }

  // Convert to array
  const result: Array<{
    memberId: string | null;
    memberName: string;
    total: number;
    count: number;
  }> = [];

  memberMap.forEach((value, key) => {
    result.push({
      memberId: key,
      memberName: key ? members.get(key) || "Unknown" : "Unassigned",
      total: value.total,
      count: value.count,
    });
  });

  // Sort by total (descending)
  return result.sort((a, b) => b.total - a.total);
}

/**
 * Calculate potential savings from switching monthly to annual plans
 * @param subscriptions - Array of subscriptions
 * @param savingsPercentage - Assumed savings percentage (default: 15%)
 * @param displayCurrency - Currency to convert amounts to (optional)
 * @returns Potential annual savings amount
 */
export async function calculateAnnualSavings(
  subscriptions: Subscription[],
  savingsPercentage: number = 15,
  displayCurrency?: string
): Promise<number> {
  const monthlyPlans = subscriptions.filter(
    (sub) =>
      sub.status === "active" &&
      sub.billingFrequency.toLowerCase() === "monthly"
  );

  const monthlyTotal = await calculateMonthlyTotal(monthlyPlans, false, displayCurrency);
  const annualCost = monthlyTotal * 12;

  return (annualCost * savingsPercentage) / 100;
}
