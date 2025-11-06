import { getAdminSession } from '@/lib/admin/session';
import { redirect } from 'next/navigation';
import { MetricCard } from '@/components/admin/analytics/MetricCard';
import { RevenueChart } from '@/components/admin/analytics/RevenueChart';
import { UserGrowthChart } from '@/components/admin/analytics/UserGrowthChart';
import { DistributionChart } from '@/components/admin/analytics/DistributionChart';
import { DollarSign, Users, Activity, TrendingDown } from 'lucide-react';
import { comparePeriods } from '@/lib/admin/analytics';

/**
 * Fetch analytics data
 */
async function getAnalyticsData(period: string = '30d') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/admin/analytics/overview?period=${period}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }

  return response.json();
}

/**
 * Analytics Dashboard Page
 */
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  // Check authentication
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  // Get analytics data
  const period = searchParams.period || '30d';
  let analyticsData;

  try {
    analyticsData = await getAnalyticsData(period);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error Loading Analytics</h2>
          <p className="text-muted-foreground mt-2">
            Unable to load analytics data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const { metrics, previousPeriod, chartData } = analyticsData;

  // Calculate comparisons if previous period data available
  const mrrComparison = previousPeriod
    ? comparePeriods(metrics.mrr, previousPeriod.mrr)
    : null;

  const userComparison = previousPeriod
    ? comparePeriods(metrics.totalUsers, previousPeriod.totalUsers)
    : null;

  const subscriptionComparison = previousPeriod
    ? comparePeriods(metrics.activeSubscriptions, previousPeriod.activeSubscriptions)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analytics and insights for your subscriptions
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={period}
            onChange={(e) => {
              const newPeriod = e.target.value;
              window.location.href = `/dashboard/analytics?period=${newPeriod}`;
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`$${metrics.mrr.toLocaleString()}`}
          previousValue={previousPeriod?.mrr}
          trend={mrrComparison?.trend}
          changePercent={mrrComparison?.changePercent}
          icon={<DollarSign className="h-4 w-4" />}
          valueColor="text-green-600"
        />

        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          previousValue={previousPeriod?.totalUsers}
          trend={userComparison?.trend}
          changePercent={userComparison?.changePercent}
          icon={<Users className="h-4 w-4" />}
        />

        <MetricCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions.toLocaleString()}
          previousValue={previousPeriod?.activeSubscriptions}
          trend={subscriptionComparison?.trend}
          changePercent={subscriptionComparison?.changePercent}
          icon={<Activity className="h-4 w-4" />}
        />

        <MetricCard
          title="Churn Rate"
          value={`${metrics.churnRate.toFixed(1)}%`}
          description={`Retention: ${metrics.retentionRate.toFixed(1)}%`}
          icon={<TrendingDown className="h-4 w-4" />}
          valueColor={metrics.churnRate > 5 ? 'text-red-600' : 'text-green-600'}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Annual Recurring Revenue"
          value={`$${metrics.arr.toLocaleString()}`}
          description="ARR = MRR × 12"
        />

        <MetricCard
          title="Average Revenue Per User"
          value={`$${metrics.arpu.toFixed(2)}`}
          description="ARPU = MRR / Total Users"
        />

        <MetricCard
          title="Active Users Rate"
          value={`${metrics.activeUsersRate.toFixed(1)}%`}
          description={`${metrics.activeUsers} active users`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <RevenueChart
          data={chartData.revenue}
          description={`Revenue trend for the ${period === '7d' ? 'last 7 days' : period === '30d' ? 'last 30 days' : period === '90d' ? 'last 90 days' : 'last year'}`}
        />

        {/* User Growth Chart */}
        <UserGrowthChart
          data={chartData.userGrowth}
          description="Total and active users over time"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Status Distribution */}
        <DistributionChart
          data={chartData.subscriptionDistribution}
          title="Subscription Status Distribution"
          description="Breakdown by subscription status"
        />

        {/* Plan Distribution */}
        <DistributionChart
          data={chartData.planDistribution}
          title="Plan Distribution"
          description="User distribution by subscription plan"
        />
      </div>
    </div>
  );
}
