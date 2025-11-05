"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
  subscriptionSchema,
  updateSubscriptionSchema,
  type SubscriptionFormData,
  type UpdateSubscriptionData,
  type SubscriptionFilterData,
} from "@/lib/validations/subscription";
import { getNextBillingDate } from "@/lib/utils/date";
import { canAddSubscription, canUsePlatform } from "@/lib/plan-limits";

export type SubscriptionWithRelations = {
  id: string;
  serviceName: string;
  serviceIcon: string | null;
  amount: number;
  currency: string;
  billingFrequency: string;
  startDate: Date;
  nextBilling: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
  member: {
    id: string;
    name: string;
    avatarColor: string | null;
  } | null;
};

/**
 * Create a new subscription
 */
export async function createSubscription(data: SubscriptionFormData) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Check if user can use the platform (trial not expired)
    const userWithPlan = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    if (!userWithPlan) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if trial has expired
    if (
      !canUsePlatform(
        userWithPlan.subscriptionPlan,
        userWithPlan.subscriptionStatus,
        userWithPlan.subscriptionEndDate
      )
    ) {
      return {
        success: false,
        error:
          "Your trial has expired. Please upgrade to continue using Duely.",
      };
    }

    // Check subscription limit for free tier
    const subscriptionCount = await prisma.subscription.count({
      where: { userId: user.id },
    });

    if (
      !canAddSubscription(
        userWithPlan.subscriptionPlan,
        subscriptionCount
      )
    ) {
      return {
        success: false,
        error: `You've reached the maximum of ${subscriptionCount} subscriptions for your plan. Upgrade to add more.`,
      };
    }

    // Validate input
    const validatedData = subscriptionSchema.parse(data);

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        serviceName: validatedData.serviceName,
        serviceIcon: validatedData.serviceIcon ?? null,
        amount: validatedData.amount,
        currency: validatedData.currency,
        billingFrequency: validatedData.billingFrequency,
        categoryId: validatedData.categoryId ?? null,
        memberId: validatedData.memberId ?? null,
        startDate: validatedData.startDate,
        nextBilling: validatedData.nextBilling,
        status: validatedData.status,
        notes: validatedData.notes ?? null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/analytics");

    return {
      success: true,
      data: subscription,
      message: "Subscription created successfully",
    };
  } catch (error) {
    console.error("Create subscription error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to create subscription",
    };
  }
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(data: UpdateSubscriptionData) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate input
    const validatedData = updateSubscriptionSchema.parse(data);

    // Check if subscription belongs to user
    const existing = await prisma.subscription.findUnique({
      where: { id: validatedData.id },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Subscription not found",
      };
    }

    if (existing.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Update subscription
    const { id, ...updateData } = validatedData;
    const subscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/analytics");

    return {
      success: true,
      data: subscription,
      message: "Subscription updated successfully",
    };
  } catch (error) {
    console.error("Update subscription error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update subscription",
    };
  }
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: string) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Check if subscription belongs to user
    const existing = await prisma.subscription.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Subscription not found",
      };
    }

    if (existing.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Delete subscription
    await prisma.subscription.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/analytics");

    return {
      success: true,
      message: "Subscription deleted successfully",
    };
  } catch (error) {
    console.error("Delete subscription error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to delete subscription",
    };
  }
}

/**
 * Get all subscriptions with optional filtering
 */
export async function getSubscriptions(
  filters?: SubscriptionFilterData
): Promise<SubscriptionWithRelations[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Build where clause
  const where: {
    userId: string;
    serviceName?: { contains: string; mode: "insensitive" };
    categoryId?: string;
    memberId?: string;
    status?: string;
    billingFrequency?: string;
  } = {
    userId: user.id,
  };

  if (filters?.search) {
    where.serviceName = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.memberId) {
    where.memberId = filters.memberId;
  }

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters?.billingFrequency && filters.billingFrequency !== "all") {
    where.billingFrequency = filters.billingFrequency;
  }

  // Build orderBy clause
  const orderBy: Record<string, "asc" | "desc"> = {};
  if (filters?.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder || "asc";
  } else {
    orderBy.nextBilling = "asc"; // Default sort by next billing
  }

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
      member: {
        select: {
          id: true,
          name: true,
          avatarColor: true,
        },
      },
    },
    orderBy,
  });

  return subscriptions;
}

/**
 * Get single subscription by ID
 */
export async function getSubscriptionById(
  id: string
): Promise<SubscriptionWithRelations | null> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
      member: {
        select: {
          id: true,
          name: true,
          avatarColor: true,
        },
      },
    },
  });

  return subscription;
}

/**
 * Mark subscription as renewed (update next billing date)
 */
export async function renewSubscription(id: string) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Get subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!subscription) {
      return {
        success: false,
        error: "Subscription not found",
      };
    }

    // Calculate next billing date
    const nextBilling = getNextBillingDate(
      subscription.nextBilling,
      subscription.billingFrequency
    );

    // Update subscription
    await prisma.subscription.update({
      where: { id },
      data: {
        nextBilling,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/analytics");

    return {
      success: true,
      message: "Subscription renewed successfully",
    };
  } catch (error) {
    console.error("Renew subscription error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to renew subscription",
    };
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats() {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const [total, active, paused, canceled, trial] = await Promise.all([
    prisma.subscription.count({
      where: { userId: user.id },
    }),
    prisma.subscription.count({
      where: { userId: user.id, status: "active" },
    }),
    prisma.subscription.count({
      where: { userId: user.id, status: "paused" },
    }),
    prisma.subscription.count({
      where: { userId: user.id, status: "canceled" },
    }),
    prisma.subscription.count({
      where: { userId: user.id, status: "trial" },
    }),
  ]);

  return {
    total,
    active,
    paused,
    canceled,
    trial,
  };
}

/**
 * Get all categories for current user
 */
export async function getCategories(): Promise<Array<{ id: string; name: string }>> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return categories;
}

/**
 * Get all members for current user
 */
export async function getMembers(): Promise<Array<{ id: string; name: string }>> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const members = await prisma.member.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return members;
}

/**
 * Calculate subscription totals (monthly and annual) with currency conversion
 */
export async function calculateSubscriptionTotals(
  subscriptions: SubscriptionWithRelations[],
  displayCurrency?: string
): Promise<{ monthlyTotal: number; annualProjection: number }> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user's default currency if not provided
  if (!displayCurrency) {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });
    displayCurrency = userSettings?.currency || "IDR";
  }

  // Import calculation functions
  const { calculateMonthlyTotal, calculateAnnualProjection } = await import("@/lib/utils/calculations");

  // Calculate totals with currency conversion
  const monthlyTotal = await calculateMonthlyTotal(subscriptions, false, displayCurrency);
  const annualProjection = await calculateAnnualProjection(subscriptions, false, displayCurrency);

  return {
    monthlyTotal: Math.round(monthlyTotal * 100) / 100,
    annualProjection: Math.round(annualProjection * 100) / 100,
  };
}
