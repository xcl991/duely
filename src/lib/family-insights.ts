import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { convertToMonthly } from "@/lib/utils/currency";
import { convertCurrency } from "@/lib/utils/exchange-rate";

export type DuplicateService = {
  serviceName: string;
  memberCount: number;
  members: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  totalMonthlyCost: number;
  estimatedFamilyPlanCost: number;
  potentialSavings: number;
};

export type FamilySavingsInsight = {
  totalPotentialSavings: number;
  duplicateServices: DuplicateService[];
  hasOpportunities: boolean;
};

/**
 * Detect duplicate services across family members and calculate potential savings
 */
export async function detectFamilyPlanSavings(): Promise<FamilySavingsInsight> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user's default currency
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });
  const displayCurrency = userSettings?.currency || "IDR";

  // Get all active subscriptions for all members
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "active",
      memberId: { not: null }, // Only subscriptions assigned to members
    },
    include: {
      member: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Group subscriptions by service name
  const serviceGroups: Record<
    string,
    Array<{
      memberId: string;
      memberName: string;
      amount: number;
      currency: string;
      billingFrequency: string;
    }>
  > = {};

  subscriptions.forEach((sub) => {
    if (!sub.member) return;

    const serviceName = sub.serviceName.toLowerCase().trim();

    if (!serviceGroups[serviceName]) {
      serviceGroups[serviceName] = [];
    }

    serviceGroups[serviceName].push({
      memberId: sub.member.id,
      memberName: sub.member.name,
      amount: sub.amount,
      currency: sub.currency || "IDR",
      billingFrequency: sub.billingFrequency,
    });
  });

  // Find duplicate services (2+ members using same service)
  const duplicateServices: DuplicateService[] = [];

  for (const [serviceName, members] of Object.entries(serviceGroups)) {
    if (members.length >= 2) {
      // Convert all amounts to monthly cost in display currency
      const convertedMembers = await Promise.all(
        members.map(async (m) => {
          let monthlyAmount = convertToMonthly(m.amount, m.billingFrequency);
          if (m.currency !== displayCurrency) {
            monthlyAmount = await convertCurrency(monthlyAmount, m.currency, displayCurrency);
          }
          return {
            ...m,
            convertedAmount: monthlyAmount,
          };
        })
      );

      const totalMonthlyCost = convertedMembers.reduce((sum, m) => sum + m.convertedAmount, 0);

      // Estimate family plan cost (typically 1.5x of single plan)
      // This is a rough estimate - real family plans vary by service
      const estimatedFamilyPlanCost = Math.max(...convertedMembers.map((m) => m.convertedAmount)) * 1.5;

      const potentialSavings = totalMonthlyCost - estimatedFamilyPlanCost;

      // Only include if there's actual savings potential
      if (potentialSavings > 0) {
        duplicateServices.push({
          serviceName,
          memberCount: members.length,
          members: convertedMembers.map((m) => ({
            id: m.memberId,
            name: m.memberName,
            amount: m.convertedAmount,
          })),
          totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
          estimatedFamilyPlanCost:
            Math.round(estimatedFamilyPlanCost * 100) / 100,
          potentialSavings: Math.round(potentialSavings * 100) / 100,
        });
      }
    }
  }

  // Sort by potential savings (highest first)
  duplicateServices.sort((a, b) => b.potentialSavings - a.potentialSavings);

  const totalPotentialSavings = duplicateServices.reduce(
    (sum, service) => sum + service.potentialSavings,
    0
  );

  return {
    totalPotentialSavings: Math.round(totalPotentialSavings * 100) / 100,
    duplicateServices,
    hasOpportunities: duplicateServices.length > 0,
  };
}

/**
 * Get subscriptions for a specific member
 */
export async function getMemberSubscriptions(memberId: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
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
    include: {
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

  return {
    member,
    subscriptions,
  };
}
