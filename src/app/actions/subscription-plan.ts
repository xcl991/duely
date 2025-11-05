"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCurrentUserPlan() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        billingCycle: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      billingCycle: user.billingCycle,
    };
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return { success: false, error: "Failed to fetch user plan" };
  }
}

export async function upgradePlan(data: {
  planId: string;
  billingCycle: "monthly" | "yearly";
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const now = new Date();
    let endDate: Date;
    let status = "active";

    // Calculate subscription end date based on billing cycle
    if (data.billingCycle === "monthly") {
      endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // If upgrading to pro or business, set as trial for first 14 days
    if ((data.planId === "pro" || data.planId === "business") && user.subscriptionPlan === "free") {
      status = "trial";
      // Set trial end date to 14 days from now
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 14);
    }

    // Update user subscription
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionPlan: data.planId,
        subscriptionStatus: status,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        billingCycle: data.billingCycle,
      },
    });

    // Revalidate the plans page and dashboard
    revalidatePath("/plans");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: status === "trial"
        ? `Successfully started ${data.planId} trial! Your trial ends on ${endDate.toLocaleDateString()}`
        : `Successfully upgraded to ${data.planId} plan!`,
      endDate: endDate.toISOString(),
      status,
    };
  } catch (error) {
    console.error("Error upgrading plan:", error);
    return { success: false, error: "Failed to upgrade plan" };
  }
}

export async function cancelPlan() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Update user subscription to canceled
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionStatus: "canceled",
        // Keep the plan active until the end date
      },
    });

    // Revalidate the plans page and dashboard
    revalidatePath("/plans");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Your subscription will be canceled at the end of the billing period",
    };
  } catch (error) {
    console.error("Error canceling plan:", error);
    return { success: false, error: "Failed to cancel plan" };
  }
}

export async function downgradePlan() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    // Downgrade to free plan
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionPlan: "free",
        subscriptionStatus: "active",
        subscriptionStartDate: new Date(),
        subscriptionEndDate: null,
        billingCycle: null,
      },
    });

    // Revalidate the plans page and dashboard
    revalidatePath("/plans");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Successfully downgraded to free plan",
    };
  } catch (error) {
    console.error("Error downgrading plan:", error);
    return { success: false, error: "Failed to downgrade plan" };
  }
}
