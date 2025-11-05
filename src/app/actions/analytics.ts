"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { convertToMonthly } from "@/lib/utils/currency";
import { convertCurrency } from "@/lib/utils/exchange-rate";
import { startOfMonth, subMonths, format } from "date-fns";

export type MonthlySpendingData = {
  month: string;
  total: number;
};

export type TopServiceData = {
  id: string;
  serviceName: string;
  amount: number;
  billingFrequency: string;
  monthlyEquivalent: number;
};

export type BillingCycleData = {
  frequency: string;
  count: number;
  totalCost: number;
};

export type InsightData = {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
};

export type CategoryBreakdownData = {
  id: string;
  name: string;
  total: number;
  count: number;
  percentage: number;
  color: string | null;
};

/**
 * Get monthly spending trend for the last N months
 */
export async function getMonthlySpendingTrend(
  months: number = 12
): Promise<MonthlySpendingData[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for currency
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const displayCurrency = userSettings?.currency || "IDR";

  // Get active subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
    },
    select: {
      amount: true,
      currency: true,
      billingFrequency: true,
      startDate: true,
    },
  });

  // Generate data for last N months
  const trendData: MonthlySpendingData[] = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(startOfMonth(today), i);
    const monthKey = format(monthDate, "MMM yyyy");

    // Calculate total for subscriptions active in that month
    let monthTotal = 0;

    for (const sub of subscriptions) {
      // Only count if subscription started before or during this month
      if (new Date(sub.startDate) <= monthDate) {
        let monthlyAmount = convertToMonthly(sub.amount, sub.billingFrequency);

        // Convert to display currency if needed
        const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
        if (subCurrency !== displayCurrency) {
          monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
        }

        monthTotal += monthlyAmount;
      }
    }

    trendData.push({
      month: monthKey,
      total: Math.round(monthTotal * 100) / 100,
    });
  }

  return trendData;
}

/**
 * Get top expensive services ranked by monthly equivalent cost
 */
export async function getTopExpensiveServices(
  limit: number = 10
): Promise<TopServiceData[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for currency
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const displayCurrency = userSettings?.currency || "IDR";

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
    },
    select: {
      id: true,
      serviceName: true,
      amount: true,
      currency: true,
      billingFrequency: true,
    },
    orderBy: {
      amount: "desc",
    },
  });

  // Convert to monthly equivalent and sort
  const servicesWithMonthly: Array<{
    id: string;
    serviceName: string;
    amount: number;
    currency: string;
    billingFrequency: string;
    monthlyEquivalent: number;
  }> = [];

  for (const sub of subscriptions) {
    let monthlyEquivalent = convertToMonthly(sub.amount, sub.billingFrequency);

    // Convert to display currency if needed
    const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
    if (subCurrency !== displayCurrency) {
      monthlyEquivalent = await convertCurrency(monthlyEquivalent, subCurrency, displayCurrency);
    }

    servicesWithMonthly.push({
      ...sub,
      monthlyEquivalent,
    });
  }

  // Sort by monthly equivalent
  servicesWithMonthly.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);

  return servicesWithMonthly.slice(0, limit);
}

/**
 * Get billing cycle distribution
 */
export async function getBillingCycleDistribution(): Promise<
  BillingCycleData[]
> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for currency
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const displayCurrency = userSettings?.currency || "IDR";

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
    },
    select: {
      billingFrequency: true,
      amount: true,
      currency: true,
    },
  });

  // Aggregate by frequency
  const distribution: Record<string, { count: number; total: number }> = {};

  for (const sub of subscriptions) {
    const freq = sub.billingFrequency;
    if (!distribution[freq]) {
      distribution[freq] = { count: 0, total: 0 };
    }
    distribution[freq].count++;

    let monthlyAmount = convertToMonthly(sub.amount, freq);

    // Convert to display currency if needed
    const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
    if (subCurrency !== displayCurrency) {
      monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
    }

    distribution[freq].total += monthlyAmount;
  }

  // Convert to array
  return Object.entries(distribution).map(([frequency, data]) => ({
    frequency,
    count: data.count,
    totalCost: Math.round(data.total * 100) / 100,
  }));
}

/**
 * Get category breakdown with spending totals
 */
export async function getCategoryBreakdown(): Promise<CategoryBreakdownData[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for currency
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const displayCurrency = userSettings?.currency || "IDR";

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  // Group by category
  const categoryMap = new Map<
    string,
    { name: string; total: number; count: number; color: string | null }
  >();

  for (const sub of subscriptions) {
    const key = sub.categoryId || "uncategorized";
    const categoryName = sub.category?.name || "Uncategorized";
    let monthlyAmount = convertToMonthly(sub.amount, sub.billingFrequency);
    const color = sub.category?.color || null;

    // Convert to display currency if needed
    const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
    if (subCurrency !== displayCurrency) {
      monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
    }

    if (categoryMap.has(key)) {
      const existing = categoryMap.get(key)!;
      categoryMap.set(key, {
        ...existing,
        total: existing.total + monthlyAmount,
        count: existing.count + 1,
      });
    } else {
      categoryMap.set(key, {
        name: categoryName,
        total: monthlyAmount,
        count: 1,
        color,
      });
    }
  }

  // Convert to array and calculate percentages
  const totalSpending = Array.from(categoryMap.values()).reduce(
    (sum, cat) => sum + cat.total,
    0
  );

  const breakdown = Array.from(categoryMap.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    total: Math.round(data.total * 100) / 100,
    count: data.count,
    percentage:
      totalSpending > 0
        ? Math.round((data.total / totalSpending) * 100 * 10) / 10
        : 0,
    color: data.color,
  }));

  // Sort by total (descending)
  return breakdown.sort((a, b) => b.total - a.total);
}

/**
 * Generate insights and recommendations
 */
export async function generateInsights(): Promise<InsightData[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const insights: InsightData[] = [];

  // Get all active subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
    },
    include: {
      category: true,
    },
  });

  if (subscriptions.length === 0) {
    return insights;
  }

  // Calculate average cost
  const totalMonthly = subscriptions.reduce(
    (sum, sub) => sum + convertToMonthly(sub.amount, sub.billingFrequency),
    0
  );
  const averageCost = totalMonthly / subscriptions.length;

  // Insight 1: High-cost subscriptions (> 2x average)
  const expensiveSubs = subscriptions.filter(
    (sub) => convertToMonthly(sub.amount, sub.billingFrequency) > averageCost * 2
  );

  if (expensiveSubs.length > 0) {
    insights.push({
      id: "high-cost-alert",
      type: "warning",
      title: "High-Cost Subscriptions Detected",
      description: `You have ${expensiveSubs.length} subscription${
        expensiveSubs.length > 1 ? "s" : ""
      } that cost more than twice your average. Consider reviewing ${
        expensiveSubs.length > 1 ? "these services" : "this service"
      } for potential savings.`,
      actionLabel: "View Details",
      actionUrl: "/subscriptions",
    });
  }

  // Insight 2: Category concentration (>30% in one category)
  const categoryTotals: Record<string, number> = {};
  subscriptions.forEach((sub) => {
    if (sub.category) {
      const catId = sub.category.id;
      if (!categoryTotals[catId]) {
        categoryTotals[catId] = 0;
      }
      categoryTotals[catId] += convertToMonthly(sub.amount, sub.billingFrequency);
    }
  });

  Object.entries(categoryTotals).forEach(([catId, total]) => {
    const percentage = (total / totalMonthly) * 100;
    if (percentage > 30) {
      const category = subscriptions.find((s) => s.category?.id === catId)?.category;
      insights.push({
        id: `category-concentration-${catId}`,
        type: "info",
        title: "Category Spending Alert",
        description: `${category?.name || "One category"} accounts for ${Math.round(
          percentage
        )}% of your total spending. Consider diversifying or reviewing subscriptions in this category.`,
        actionLabel: "View Category",
        actionUrl: "/subscriptions",
      });
    }
  });

  // Insight 3: Annual plan savings opportunity
  const monthlyPlans = subscriptions.filter((sub) => sub.billingFrequency === "monthly");
  if (monthlyPlans.length >= 3) {
    const monthlyCost = monthlyPlans.reduce(
      (sum, sub) => sum + sub.amount,
      0
    );
    const potentialSavings = monthlyCost * 12 * 0.15; // Assume 15% savings

    insights.push({
      id: "annual-savings",
      type: "success",
      title: "Annual Plan Savings Opportunity",
      description: `You have ${monthlyPlans.length} monthly subscriptions. Switching to annual plans could save you approximately $${potentialSavings.toFixed(
        0
      )} per year (assuming 15% discount).`,
      actionLabel: "Review Subscriptions",
      actionUrl: "/subscriptions",
    });
  }

  // Insight 4: Spending trend
  const last3Months = await getMonthlySpendingTrend(3);
  if (last3Months.length >= 2) {
    const current = last3Months[last3Months.length - 1].total;
    const previous = last3Months[last3Months.length - 2].total;
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    if (change > 10) {
      insights.push({
        id: "spending-increase",
        type: "warning",
        title: "Spending Increase Detected",
        description: `Your subscription spending has increased by ${Math.round(
          change
        )}% compared to last month. Review your subscriptions to ensure they align with your budget.`,
        actionLabel: "View Trend",
        actionUrl: "/analytics",
      });
    } else if (change < -10) {
      insights.push({
        id: "spending-decrease",
        type: "success",
        title: "Great Progress!",
        description: `Your subscription spending has decreased by ${Math.abs(
          Math.round(change)
        )}% compared to last month. Keep up the good work!`,
      });
    }
  }

  return insights;
}

/**
 * Get analytics overview stats
 */
export async function getAnalyticsStats() {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for currency
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const displayCurrency = userSettings?.currency || "IDR";

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
    },
    select: {
      amount: true,
      currency: true,
      billingFrequency: true,
    },
  });

  let totalMonthly = 0;

  for (const sub of subscriptions) {
    let monthlyAmount = convertToMonthly(sub.amount, sub.billingFrequency);

    // Convert to display currency if needed
    const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
    if (subCurrency !== displayCurrency) {
      monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
    }

    totalMonthly += monthlyAmount;
  }

  const totalAnnual = totalMonthly * 12;
  const count = subscriptions.length;
  const averageCost = count > 0 ? totalMonthly / count : 0;

  return {
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalAnnual: Math.round(totalAnnual * 100) / 100,
    activeCount: count,
    averageCost: Math.round(averageCost * 100) / 100,
  };
}
