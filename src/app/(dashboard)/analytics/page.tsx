import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { TrendingUp, DollarSign, CreditCard, PieChart, Lock } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getAnalyticsStats,
  getMonthlySpendingTrend,
  getTopExpensiveServices,
  getBillingCycleDistribution,
  generateInsights,
  getCategoryBreakdown,
} from "@/app/actions/analytics";
import { getUserSettings } from "@/app/actions/settings";
import { formatCurrency } from "@/lib/utils/currency";
import SpendingTrendChart from "@/components/analytics/SpendingTrendChart";
import TopServicesChart from "@/components/analytics/TopServicesChart";
import BillingCycleChart from "@/components/analytics/BillingCycleChart";
import InsightsPanel from "@/components/analytics/InsightsPanel";
import CategoryChart from "@/components/dashboard/CategoryChart";
import { hasAnalyticsAccess } from "@/lib/plan-limits";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  // Type guard: Redirect to login if user is not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Check if user has analytics access
  const userWithPlan = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      subscriptionPlan: true,
    },
  });

  if (!userWithPlan || !hasAnalyticsAccess(userWithPlan.subscriptionPlan)) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Analytics is Locked</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Analytics and insights are only available on Pro and Business plans.
              Upgrade now to unlock advanced reporting features.
            </p>
            <div className="space-y-2">
              <Link href="/plans">
                <Button className="w-full">
                  Upgrade to Pro
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all analytics data in parallel
  const [stats, trendData, topServices, billingCycle, insights, categoryData, userSettings] =
    await Promise.all([
      getAnalyticsStats(),
      getMonthlySpendingTrend(12),
      getTopExpensiveServices(5),
      getBillingCycleDistribution(),
      generateInsights(),
      getCategoryBreakdown(),
      getUserSettings(),
    ]);

  const currency = userSettings.currency;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm md:text-base text-muted-foreground">
          Deep insights into your subscription spending
        </p>
      </div>

      {/* Key Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Monthly Spend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Spending
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">
              {formatCurrency(stats.totalMonthly, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.activeCount} active subscription{stats.activeCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Yearly Projection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Annual Projection
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">
              {formatCurrency(stats.totalAnnual, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current subscriptions
            </p>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        {/* Average Cost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">
              {formatCurrency(stats.averageCost, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Per subscription</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Panel */}
      <InsightsPanel insights={insights} />

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <SpendingTrendChart data={trendData} currency={currency} />
        <CategoryChart data={categoryData} currency={currency} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopServicesChart data={topServices} limit={5} currency={currency} />
        <BillingCycleChart data={billingCycle} />
      </div>
    </div>
  );
}
