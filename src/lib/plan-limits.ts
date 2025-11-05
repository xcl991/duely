/**
 * Plan limits and feature restrictions
 */

export interface PlanLimits {
  maxSubscriptions: number;
  maxMembers: number;
  hasAnalytics: boolean;
  hasAdvancedReports: boolean;
  hasExport: boolean;
  hasMultiCurrency: boolean;
  hasTeamCollaboration: boolean;
  hasApiAccess: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxSubscriptions: 3,
    maxMembers: 1,
    hasAnalytics: false,
    hasAdvancedReports: false,
    hasExport: false,
    hasMultiCurrency: false,
    hasTeamCollaboration: false,
    hasApiAccess: false,
  },
  pro: {
    maxSubscriptions: -1, // unlimited
    maxMembers: -1, // unlimited
    hasAnalytics: true,
    hasAdvancedReports: true,
    hasExport: true,
    hasMultiCurrency: true,
    hasTeamCollaboration: false,
    hasApiAccess: false,
  },
  business: {
    maxSubscriptions: -1, // unlimited
    maxMembers: -1, // unlimited
    hasAnalytics: true,
    hasAdvancedReports: true,
    hasExport: true,
    hasMultiCurrency: true,
    hasTeamCollaboration: true,
    hasApiAccess: true,
  },
};

/**
 * Get plan limits for a specific plan
 */
export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

/**
 * Check if user can add more subscriptions
 */
export function canAddSubscription(
  plan: string,
  currentCount: number
): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxSubscriptions === -1) return true; // unlimited
  return currentCount < limits.maxSubscriptions;
}

/**
 * Check if user can add more members
 */
export function canAddMember(plan: string, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxMembers === -1) return true; // unlimited
  return currentCount < limits.maxMembers;
}

/**
 * Check if plan has access to analytics
 */
export function hasAnalyticsAccess(plan: string): boolean {
  const limits = getPlanLimits(plan);
  return limits.hasAnalytics;
}

/**
 * Check if user's subscription status is active
 * Returns false if trial has expired or subscription is canceled/expired
 */
export function isSubscriptionActive(
  status: string,
  endDate: Date | null
): boolean {
  if (status === "canceled" || status === "expired") {
    return false;
  }

  // If trial, check if it's still valid
  if (status === "trial" && endDate) {
    return new Date() < new Date(endDate);
  }

  return status === "active";
}

/**
 * Check if user can use the platform
 * Blocks access if trial has expired
 */
export function canUsePlatform(
  plan: string,
  status: string,
  endDate: Date | null
): boolean {
  // Free plan is always usable
  if (plan === "free") {
    return true;
  }

  // For paid plans, check if subscription is active
  return isSubscriptionActive(status, endDate);
}
