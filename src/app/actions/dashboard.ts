"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  calculateMonthlyTotal,
  calculateAnnualProjection,
  calculateCategoryTotals,
  calculateAnnualSavings,
} from "@/lib/utils/calculations";
import { isWithinDays, isOverdue } from "@/lib/utils/date";
import { convertToMonthly } from "@/lib/utils/currency";

export type DashboardStats = {
  monthlySpending: number;
  annualProjection: number;
  activeSubscriptions: number;
  upcomingRenewals: number;
  overdueCount: number;
  topCategory: {
    name: string;
    amount: number;
  } | null;
  nextRenewal: {
    serviceName: string;
    amount: number;
    date: Date;
  } | null;
  potentialSavings: number;
  monthlyBudgetLimit: number | null;
  budgetUtilization: number | null; // Percentage of budget used (0-100+)
};

export type UpcomingRenewal = {
  id: string;
  serviceName: string;
  amount: number;
  currency: string;
  billingFrequency: string;
  nextBilling: Date;
  categoryName: string | null;
  memberName: string | null;
  daysUntil: number;
};

export type OverdueSubscription = {
  id: string;
  serviceName: string;
  amount: number;
  nextBilling: Date;
  daysOverdue: number;
};

export type CategoryBreakdown = {
  categoryId: string | null;
  categoryName: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
};

/**
 * Get dashboard statistics for current user
 * @returns Dashboard stats object
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for currency and budget limit
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const displayCurrency = userSettings?.currency || "IDR";

  // Fetch all active subscriptions with relations
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
    },
    include: {
      category: true,
      member: true,
    },
    orderBy: {
      nextBilling: "asc",
    },
  });

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");

  // Calculate monthly and annual totals (with currency conversion)
  const monthlySpending = await calculateMonthlyTotal(activeSubscriptions, false, displayCurrency);
  const annualProjection = await calculateAnnualProjection(activeSubscriptions, false, displayCurrency);

  // Count upcoming renewals (next 7 days)
  const upcomingRenewals = activeSubscriptions.filter((sub) =>
    isWithinDays(sub.nextBilling, 7)
  ).length;

  // Count overdue subscriptions
  const overdueCount = activeSubscriptions.filter((sub) =>
    isOverdue(sub.nextBilling)
  ).length;

  // Calculate potential savings (with currency conversion)
  const potentialSavings = await calculateAnnualSavings(activeSubscriptions, 15, displayCurrency);

  // Find top spending category
  const categories = new Map<string, string>(
    subscriptions
      .filter((sub) => sub.category)
      .map((sub) => [sub.category!.id, sub.category!.name])
  );

  const categoryTotals = await calculateCategoryTotals(activeSubscriptions, categories, displayCurrency);
  const topCategory = categoryTotals[0] || null;

  // Find next renewal
  const nextActiveRenewal = activeSubscriptions
    .filter((sub) => !isOverdue(sub.nextBilling))
    .sort((a, b) => a.nextBilling.getTime() - b.nextBilling.getTime())[0];

  const monthlyBudgetLimit = userSettings?.monthlyBudgetLimit || null;

  // Calculate budget utilization percentage
  const budgetUtilization = monthlyBudgetLimit
    ? (monthlySpending / monthlyBudgetLimit) * 100
    : null;

  return {
    monthlySpending,
    annualProjection,
    activeSubscriptions: activeSubscriptions.length,
    upcomingRenewals,
    overdueCount,
    topCategory: topCategory
      ? {
          name: topCategory.categoryName,
          amount: topCategory.total,
        }
      : null,
    nextRenewal: nextActiveRenewal
      ? {
          serviceName: nextActiveRenewal.serviceName,
          amount: convertToMonthly(
            nextActiveRenewal.amount,
            nextActiveRenewal.billingFrequency
          ),
          date: nextActiveRenewal.nextBilling,
        }
      : null,
    potentialSavings,
    monthlyBudgetLimit,
    budgetUtilization,
  };
}

/**
 * Get upcoming renewals for next N days
 * @param days - Number of days to look ahead (default: 7)
 * @returns Array of upcoming renewals
 */
export async function getUpcomingRenewals(
  days: number = 7
): Promise<UpcomingRenewal[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
    },
    include: {
      category: true,
      member: true,
    },
    orderBy: {
      nextBilling: "asc",
    },
  });

  return subscriptions
    .filter((sub) => isWithinDays(sub.nextBilling, days))
    .map((sub) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextBilling = new Date(sub.nextBilling);
      nextBilling.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil(
        (nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: sub.id,
        serviceName: sub.serviceName,
        amount: sub.amount,
        currency: sub.currency,
        billingFrequency: sub.billingFrequency,
        nextBilling: sub.nextBilling,
        categoryName: sub.category?.name ?? null,
        memberName: sub.member?.name ?? null,
        daysUntil,
      };
    });
}

/**
 * Get overdue subscriptions
 * @returns Array of overdue subscriptions
 */
export async function getOverdueSubscriptions(): Promise<OverdueSubscription[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
    },
    orderBy: {
      nextBilling: "asc",
    },
  });

  return subscriptions
    .filter((sub) => isOverdue(sub.nextBilling))
    .map((sub) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextBilling = new Date(sub.nextBilling);
      nextBilling.setHours(0, 0, 0, 0);
      const daysOverdue = Math.abs(
        Math.ceil((nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        id: sub.id,
        serviceName: sub.serviceName,
        amount: sub.amount,
        nextBilling: sub.nextBilling,
        daysOverdue,
      };
    });
}

/**
 * Get category breakdown for charts
 * @returns Array of category data
 */
export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for currency
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const displayCurrency = userSettings?.currency || "USD";

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
    },
    include: {
      category: true,
    },
  });

  // Create categories map
  const categories = new Map<string, { name: string; color: string }>();
  subscriptions.forEach((sub) => {
    if (sub.category) {
      categories.set(sub.category.id, {
        name: sub.category.name,
        color: sub.category.color || "#3b82f6",
      });
    }
  });

  const categoryMap = new Map(
    Array.from(categories.entries()).map(([id, data]) => [id, data.name])
  );

  const categoryTotals = await calculateCategoryTotals(subscriptions, categoryMap, displayCurrency);

  // Predefined color palette for categories
  const colorPalette = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
  ];

  return categoryTotals.map((cat, index) => {
    const color =
      cat.categoryId && categories.has(cat.categoryId)
        ? categories.get(cat.categoryId)!.color
        : colorPalette[index % colorPalette.length];

    return {
      ...cat,
      color,
    };
  });
}
