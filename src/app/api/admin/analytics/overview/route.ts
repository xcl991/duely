import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateMRR,
  calculateARR,
  calculateUserGrowthRate,
  calculateActiveUsersRate,
  calculateChurnRate,
  calculateRetentionRate,
  calculateARPU,
  calculateRevenueByPeriod,
  getUsersByPeriod,
  getSubscriptionDistribution,
  getPlanDistribution,
  getDateRange,
  type Period,
  type TimeGroup,
} from '@/lib/admin/analytics';

/**
 * GET /api/admin/analytics/overview
 * Get comprehensive analytics overview
 *
 * Query Parameters:
 * - period: 7d | 30d | 90d | 1y | custom (default: 30d)
 * - groupBy: day | week | month (default: day)
 * - startDate: ISO date string (for custom period)
 * - endDate: ISO date string (for custom period)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || '30d') as Period;
    const groupBy = (searchParams.get('groupBy') || 'day') as TimeGroup;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Get date range
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    const { start, end } = getDateRange(period, startDate, endDate);

    // Fetch all data
    const [allUsers, allSubscriptions] = await Promise.all([
      prisma.user.findMany({
        where: {
          createdAt: {
            lte: end,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.subscription.findMany({
        where: {
          createdAt: {
            lte: end,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    // Calculate active subscriptions
    const activeSubscriptions = allSubscriptions.filter(
      sub => sub.status === 'active' || sub.status === 'trial'
    );

    // Calculate key metrics
    const mrr = calculateMRR(allSubscriptions);
    const arr = calculateARR(mrr);
    const totalUsers = allUsers.length;
    const activeUsersRate = calculateActiveUsersRate(allUsers);
    const activeUsers = Math.round((totalUsers * activeUsersRate) / 100);
    const churnRate = calculateChurnRate(allSubscriptions, period);
    const retentionRate = calculateRetentionRate(churnRate);
    const arpu = calculateARPU(mrr, totalUsers);

    // Calculate time series data
    const revenueData = calculateRevenueByPeriod(allSubscriptions, period, groupBy);
    const userGrowthData = getUsersByPeriod(allUsers, period, groupBy);

    // Calculate distributions
    const subscriptionDistribution = getSubscriptionDistribution(allSubscriptions);
    const planDistribution = getPlanDistribution(allUsers);

    // Calculate user growth rate
    const userGrowthRate = calculateUserGrowthRate(allUsers, period);

    // Calculate period-over-period comparisons
    let previousPeriodData: { mrr: number; activeSubscriptions: number; totalUsers: number } | null = null;
    try {
      // Calculate previous period data for comparison
      const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
      const previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - periodDays);
      const previousEnd = start;

      const [previousUsers, previousSubscriptions] = await Promise.all([
        prisma.user.findMany({
          where: {
            createdAt: {
              gte: previousStart,
              lt: previousEnd,
            },
          },
        }),
        prisma.subscription.findMany({
          where: {
            createdAt: {
              gte: previousStart,
              lt: previousEnd,
            },
          },
        }),
      ]);

      const previousMRR = calculateMRR(previousSubscriptions);
      const previousActiveSubscriptions = previousSubscriptions.filter(
        sub => sub.status === 'active' || sub.status === 'trial'
      ).length;

      previousPeriodData = {
        mrr: previousMRR,
        activeSubscriptions: previousActiveSubscriptions,
        totalUsers: previousUsers.length,
      };
    } catch (error) {
      console.error('Error calculating previous period data:', error);
    }

    // Return comprehensive analytics
    return NextResponse.json({
      success: true,
      period,
      groupBy,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      metrics: {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        totalUsers,
        activeUsers,
        activeUsersRate: Math.round(activeUsersRate * 100) / 100,
        activeSubscriptions: activeSubscriptions.length,
        churnRate: Math.round(churnRate * 100) / 100,
        retentionRate: Math.round(retentionRate * 100) / 100,
        arpu: Math.round(arpu * 100) / 100,
        userGrowthRate: Math.round(userGrowthRate * 100) / 100,
      },
      previousPeriod: previousPeriodData,
      chartData: {
        revenue: revenueData,
        userGrowth: userGrowthData,
        subscriptionDistribution,
        planDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}
