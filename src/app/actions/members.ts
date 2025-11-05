"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
  memberSchema,
  updateMemberSchema,
  type MemberFormData,
  type UpdateMemberData,
} from "@/lib/validations/member";
import { convertToMonthly } from "@/lib/utils/currency";
import { convertCurrency } from "@/lib/utils/exchange-rate";
import { detectFamilyPlanSavings as detectFamilyPlanSavingsLib } from "@/lib/family-insights";
import { canAddMember, canUsePlatform } from "@/lib/plan-limits";

// Re-export types from family-insights
export type { FamilySavingsInsight, DuplicateService } from "@/lib/family-insights";

export type MemberWithStats = {
  id: string;
  name: string;
  avatarColor: string | null;
  avatarImage: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriptionCount: number;
  monthlySpending: number;
  topSubscription: {
    serviceName: string;
    amount: number;
  } | null;
};

/**
 * Create a new member
 */
export async function createMember(data: MemberFormData) {
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

    // Check member limit for free tier
    const memberCount = await prisma.member.count({
      where: { userId: user.id },
    });

    if (!canAddMember(userWithPlan.subscriptionPlan, memberCount)) {
      return {
        success: false,
        error: `You've reached the maximum of ${memberCount} member(s) for your plan. Upgrade to add more.`,
      };
    }

    // Validate input
    const validatedData = memberSchema.parse(data);

    // If setting as primary, unset other primary members
    if (validatedData.isPrimary) {
      await prisma.member.updateMany({
        where: {
          userId: user.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        avatarColor: validatedData.avatarColor ?? null,
        avatarImage: validatedData.avatarImage ?? null,
        isPrimary: validatedData.isPrimary,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/members");

    return {
      success: true,
      data: member,
      message: "Member created successfully",
    };
  } catch (error) {
    console.error("Create member error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to create member",
    };
  }
}

/**
 * Update an existing member
 */
export async function updateMember(data: UpdateMemberData) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate input
    const validatedData = updateMemberSchema.parse(data);

    // Check if member belongs to user
    const existing = await prisma.member.findUnique({
      where: { id: validatedData.id },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Member not found",
      };
    }

    if (existing.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // If setting as primary, unset other primary members
    if (validatedData.isPrimary) {
      await prisma.member.updateMany({
        where: {
          userId: user.id,
          isPrimary: true,
          id: {
            not: validatedData.id,
          },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Update member
    const { id, ...updateData } = validatedData;
    const member = await prisma.member.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/members");

    return {
      success: true,
      data: member,
      message: "Member updated successfully",
    };
  } catch (error) {
    console.error("Update member error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update member",
    };
  }
}

/**
 * Delete a member
 */
export async function deleteMember(id: string) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Check if member belongs to user
    const existing = await prisma.member.findUnique({
      where: { id },
      select: {
        userId: true,
        isPrimary: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Member not found",
      };
    }

    if (existing.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Prevent deleting primary member if there are other members
    if (existing.isPrimary) {
      const otherMembers = await prisma.member.count({
        where: {
          userId: user.id,
          id: { not: id },
        },
      });

      if (otherMembers > 0) {
        return {
          success: false,
          error:
            "Cannot delete primary member. Please assign another member as primary first.",
        };
      }
    }

    // Check if member has subscriptions
    if (existing._count.subscriptions > 0) {
      // Set memberId to null for all subscriptions assigned to this member
      await prisma.subscription.updateMany({
        where: { memberId: id },
        data: { memberId: null },
      });
    }

    // Delete member
    await prisma.member.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/members");

    return {
      success: true,
      message: "Member deleted successfully",
    };
  } catch (error) {
    console.error("Delete member error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to delete member",
    };
  }
}

/**
 * Get all members with statistics
 */
export async function getMembersWithStats(): Promise<MemberWithStats[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for display currency
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const displayCurrency = userSettings?.currency || "IDR";

  const members = await prisma.member.findMany({
    where: { userId: user.id },
    include: {
      subscriptions: {
        where: { status: "active" },
        select: {
          serviceName: true,
          amount: true,
          currency: true,
          billingFrequency: true,
        },
      },
    },
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
  });

  // Process members with async currency conversion
  const membersWithStats = await Promise.all(
    members.map(async (member) => {
      let monthlySpending = 0;

      // Convert each subscription to display currency
      for (const sub of member.subscriptions) {
        let monthlyAmount = convertToMonthly(sub.amount, sub.billingFrequency);

        // Convert to display currency if needed
        const subCurrency = sub.currency || "IDR";
        if (subCurrency !== displayCurrency) {
          monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
        }

        monthlySpending += monthlyAmount;
      }

      // Get top subscription by monthly equivalent (after conversion)
      let topSubscription: { serviceName: string; amount: number } | null = null;
      if (member.subscriptions.length > 0) {
        const subscriptionsWithMonthly = await Promise.all(
          member.subscriptions.map(async (sub) => {
            let monthlyAmount = convertToMonthly(sub.amount, sub.billingFrequency);

            const subCurrency = sub.currency || "IDR";
            if (subCurrency !== displayCurrency) {
              monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
            }

            return {
              serviceName: sub.serviceName,
              monthlyAmount,
            };
          })
        );

        const sorted = subscriptionsWithMonthly.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
        const top = sorted[0];
        topSubscription = {
          serviceName: top.serviceName,
          amount: top.monthlyAmount,
        };
      }

      return {
        id: member.id,
        name: member.name,
        avatarColor: member.avatarColor,
        avatarImage: member.avatarImage,
        isPrimary: member.isPrimary,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        subscriptionCount: member.subscriptions.length,
        monthlySpending: Math.round(monthlySpending * 100) / 100,
        topSubscription,
      };
    })
  );

  return membersWithStats;
}

/**
 * Get single member by ID
 */
export async function getMemberById(id: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const member = await prisma.member.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  return member;
}

/**
 * Get member statistics overview
 */
export async function getMemberStats() {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const members = await getMembersWithStats();

  const totalMembers = members.length;
  const totalSpending = members.reduce(
    (sum, member) => sum + member.monthlySpending,
    0
  );

  // Find most active member (by spending)
  const mostActiveMember =
    members.length > 0
      ? members.reduce((prev, current) =>
          prev.monthlySpending > current.monthlySpending ? prev : current
        )
      : null;

  return {
    totalMembers,
    totalSpending: Math.round(totalSpending * 100) / 100,
    mostActiveMember: mostActiveMember
      ? {
          id: mostActiveMember.id,
          name: mostActiveMember.name,
          avatarColor: mostActiveMember.avatarColor,
          spending: mostActiveMember.monthlySpending,
          subscriptionCount: mostActiveMember.subscriptionCount,
        }
      : null,
  };
}

/**
 * Detect family plan savings opportunities (Server Action wrapper)
 * This wraps the library function to make it callable from client components
 */
export async function detectFamilyPlanSavings() {
  try {
    const result = await detectFamilyPlanSavingsLib();
    return result;
  } catch (error) {
    console.error("Detect family plan savings error:", error);
    // Return empty result on error instead of throwing
    return {
      totalPotentialSavings: 0,
      duplicateServices: [],
      hasOpportunities: false,
    };
  }
}

/**
 * Get subscriptions for a specific member (Server Action)
 */
export async function getMemberSubscriptions(memberId: string, displayCurrency?: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for display currency if not provided
  if (!displayCurrency) {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });
    displayCurrency = userSettings?.currency || "IDR";
  }

  // Verify member belongs to user
  const member = await prisma.member.findFirst({
    where: {
      id: memberId,
      userId: user.id,
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      memberId,
      userId: user.id,
    },
    select: {
      id: true,
      serviceName: true,
      serviceIcon: true,
      amount: true,
      currency: true,
      billingFrequency: true,
      startDate: true,
      nextBilling: true,
      status: true,
      notes: true,
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: {
      nextBilling: "asc",
    },
  });

  // Calculate total monthly cost with currency conversion (server-side)
  let totalMonthly = 0;
  for (const sub of subscriptions) {
    let monthlyAmount = convertToMonthly(sub.amount, sub.billingFrequency);

    // Convert to display currency if needed
    const subCurrency = sub.currency || "IDR";
    if (subCurrency !== displayCurrency) {
      monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
    }

    totalMonthly += monthlyAmount;
  }

  return {
    member,
    subscriptions,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    displayCurrency,
  };
}
