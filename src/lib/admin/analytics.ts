import { Subscription, User } from '@prisma/client';
import {
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  subYears,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  startOfWeek,
  startOfMonth,
} from 'date-fns';

/**
 * Period types for analytics
 */
export type Period = '7d' | '30d' | '90d' | '1y' | 'custom';
export type TimeGroup = 'day' | 'week' | 'month';

/**
 * Revenue data for time series
 */
export interface RevenueData {
  date: string;
  amount: number;
  subscriptionCount: number;
}

/**
 * User growth data for time series
 */
export interface UserGrowthData {
  date: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
}

/**
 * Distribution data for pie charts
 */
export interface DistributionData {
  name: string;
  value: number;
  percentage: number;
}

/**
 * Comparison data for period-over-period analysis
 */
export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Forecast data
 */
export interface ForecastData {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

/**
 * Analytics overview
 */
export interface AnalyticsOverview {
  mrr: number;
  arr: number;
  totalUsers: number;
  activeUsers: number;
  activeSubscriptions: number;
  churnRate: number;
  retentionRate: number;
  arpu: number;
  revenueData: RevenueData[];
  userGrowthData: UserGrowthData[];
  subscriptionDistribution: DistributionData[];
  planDistribution: DistributionData[];
}

/**
 * Get date range based on period
 */
export function getDateRange(period: Period, startDate?: Date, endDate?: Date): { start: Date; end: Date } {
  const now = new Date();

  if (period === 'custom' && startDate && endDate) {
    return {
      start: startOfDay(startDate),
      end: endOfDay(endDate),
    };
  }

  switch (period) {
    case '7d':
      return { start: subDays(now, 7), end: now };
    case '30d':
      return { start: subDays(now, 30), end: now };
    case '90d':
      return { start: subDays(now, 90), end: now };
    case '1y':
      return { start: subYears(now, 1), end: now };
    default:
      return { start: subDays(now, 30), end: now };
  }
}

/**
 * Calculate Monthly Recurring Revenue (MRR)
 */
export function calculateMRR(subscriptions: Subscription[]): number {
  const activeSubscriptions = subscriptions.filter(
    sub => sub.status === 'active' || sub.status === 'trial'
  );

  return activeSubscriptions.reduce((total, sub) => {
    const amount = Number(sub.amount) || 0;

    // Convert to monthly amount
    switch (sub.billingFrequency) {
      case 'monthly':
        return total + amount;
      case 'yearly':
        return total + (amount / 12);
      case 'quarterly':
        return total + (amount / 3);
      default:
        return total + amount;
    }
  }, 0);
}

/**
 * Calculate Annual Recurring Revenue (ARR)
 */
export function calculateARR(mrr: number): number {
  return mrr * 12;
}

/**
 * Calculate revenue by period
 */
export function calculateRevenueByPeriod(
  subscriptions: Subscription[],
  period: Period,
  groupBy: TimeGroup = 'day'
): RevenueData[] {
  const { start, end } = getDateRange(period);

  let intervals: Date[];
  let formatString: string;

  switch (groupBy) {
    case 'month':
      intervals = eachMonthOfInterval({ start, end });
      formatString = 'MMM yyyy';
      break;
    case 'week':
      intervals = eachWeekOfInterval({ start, end });
      formatString = 'MMM dd';
      break;
    case 'day':
    default:
      intervals = eachDayOfInterval({ start, end });
      formatString = 'MMM dd';
      break;
  }

  return intervals.map(date => {
    const dateStr = format(date, formatString);

    const intervalEnd = groupBy === 'month' ?
      startOfMonth(subMonths(date, -1)) :
      groupBy === 'week' ?
      startOfWeek(subDays(date, -7)) :
      endOfDay(date);

    const activeInPeriod = subscriptions.filter(sub => {
      const subStart = new Date(sub.createdAt);
      return subStart <= intervalEnd && (sub.status === 'active' || sub.status === 'trial');
    });

    const revenue = activeInPeriod.reduce((total, sub) => {
      const amount = Number(sub.amount) || 0;

      // Prorate to period
      switch (sub.billingFrequency) {
        case 'monthly':
          return total + amount;
        case 'yearly':
          return total + (amount / 12);
        case 'quarterly':
          return total + (amount / 3);
        default:
          return total + amount;
      }
    }, 0);

    return {
      date: dateStr,
      amount: Math.round(revenue * 100) / 100,
      subscriptionCount: activeInPeriod.length,
    };
  });
}

/**
 * Calculate user growth rate
 */
export function calculateUserGrowthRate(users: User[], period: Period): number {
  const { start, end } = getDateRange(period);

  const usersAtStart = users.filter(user => new Date(user.createdAt) < start).length;
  const usersAtEnd = users.filter(user => new Date(user.createdAt) <= end).length;

  if (usersAtStart === 0) return 100;

  return ((usersAtEnd - usersAtStart) / usersAtStart) * 100;
}

/**
 * Calculate active users rate
 */
export function calculateActiveUsersRate(users: User[]): number {
  if (users.length === 0) return 0;

  const activeUsers = users.filter(
    user => user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial'
  ).length;

  return (activeUsers / users.length) * 100;
}

/**
 * Get users by period (time series)
 */
export function getUsersByPeriod(
  users: User[],
  period: Period,
  groupBy: TimeGroup = 'day'
): UserGrowthData[] {
  const { start, end } = getDateRange(period);

  let intervals: Date[];
  let formatString: string;

  switch (groupBy) {
    case 'month':
      intervals = eachMonthOfInterval({ start, end });
      formatString = 'MMM yyyy';
      break;
    case 'week':
      intervals = eachWeekOfInterval({ start, end });
      formatString = 'MMM dd';
      break;
    case 'day':
    default:
      intervals = eachDayOfInterval({ start, end });
      formatString = 'MMM dd';
      break;
  }

  return intervals.map(date => {
    const dateStr = format(date, formatString);
    const intervalEnd = groupBy === 'month' ?
      startOfMonth(subMonths(date, -1)) :
      groupBy === 'week' ?
      startOfWeek(subDays(date, -7)) :
      endOfDay(date);

    const intervalStart = groupBy === 'week' ? startOfWeek(date) :
                          groupBy === 'month' ? startOfMonth(date) :
                          startOfDay(date);

    const totalUsers = users.filter(user => new Date(user.createdAt) <= intervalEnd).length;
    const newUsers = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= intervalStart && createdAt <= intervalEnd;
    }).length;

    const activeUsers = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt <= intervalEnd &&
             (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial');
    }).length;

    return {
      date: dateStr,
      totalUsers,
      newUsers,
      activeUsers,
    };
  });
}

/**
 * Calculate churn rate
 */
export function calculateChurnRate(subscriptions: Subscription[], period: Period): number {
  const { start, end } = getDateRange(period);

  const activeAtStart = subscriptions.filter(sub => {
    const createdAt = new Date(sub.createdAt);
    return createdAt < start && (sub.status === 'active' || sub.status === 'trial');
  }).length;

  const churned = subscriptions.filter(sub => {
    const updatedAt = new Date(sub.updatedAt);
    return updatedAt >= start && updatedAt <= end && sub.status === 'canceled';
  }).length;

  if (activeAtStart === 0) return 0;

  return (churned / activeAtStart) * 100;
}

/**
 * Calculate retention rate
 */
export function calculateRetentionRate(churnRate: number): number {
  return 100 - churnRate;
}

/**
 * Get subscription distribution by status
 */
export function getSubscriptionDistribution(subscriptions: Subscription[]): DistributionData[] {
  const total = subscriptions.length;
  if (total === 0) return [];

  const distribution: Record<string, number> = {};

  subscriptions.forEach(sub => {
    const status = sub.status || 'unknown';
    distribution[status] = (distribution[status] || 0) + 1;
  });

  return Object.entries(distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    percentage: Math.round((value / total) * 10000) / 100,
  }));
}

/**
 * Get plan distribution
 */
export function getPlanDistribution(users: User[]): DistributionData[] {
  const total = users.length;
  if (total === 0) return [];

  const distribution: Record<string, number> = {};

  users.forEach(user => {
    const plan = user.subscriptionPlan || 'free';
    distribution[plan] = (distribution[plan] || 0) + 1;
  });

  return Object.entries(distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    percentage: Math.round((value / total) * 10000) / 100,
  }));
}

/**
 * Calculate Average Revenue Per User (ARPU)
 */
export function calculateARPU(totalRevenue: number, totalUsers: number): number {
  if (totalUsers === 0) return 0;
  return totalRevenue / totalUsers;
}

/**
 * Calculate Customer Lifetime Value (CLV)
 * CLV = ARPU × Average Customer Lifespan (in months)
 */
export function calculateCLV(arpu: number, averageLifespanMonths: number = 24): number {
  return arpu * averageLifespanMonths;
}

/**
 * Compare two periods
 */
export function comparePeriods(current: number, previous: number): ComparisonData {
  const change = current - previous;
  const changePercent = previous === 0 ? 100 : (change / previous) * 100;

  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(changePercent) < 1) {
    trend = 'stable';
  } else if (changePercent > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  return {
    current,
    previous,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    trend,
  };
}

/**
 * Simple linear regression forecast
 */
export function forecastRevenue(
  historicalData: RevenueData[],
  monthsToForecast: number
): ForecastData[] {
  if (historicalData.length < 2) return [];

  // Calculate linear regression
  const n = historicalData.length;
  const sumX = historicalData.reduce((sum, _, i) => sum + i, 0);
  const sumY = historicalData.reduce((sum, data) => sum + data.amount, 0);
  const sumXY = historicalData.reduce((sum, data, i) => sum + (i * data.amount), 0);
  const sumX2 = historicalData.reduce((sum, _, i) => sum + (i * i), 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate standard deviation for confidence interval
  const predictions = historicalData.map((_, i) => slope * i + intercept);
  const errors = historicalData.map((data, i) => data.amount - predictions[i]);
  const variance = errors.reduce((sum, error) => sum + error * error, 0) / n;
  const stdDev = Math.sqrt(variance);

  // Generate forecasts
  const forecasts: ForecastData[] = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);

  for (let i = 1; i <= monthsToForecast; i++) {
    const predicted = slope * (n + i - 1) + intercept;
    const forecastDate = new Date(lastDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);

    forecasts.push({
      date: format(forecastDate, 'MMM yyyy'),
      predicted: Math.max(0, Math.round(predicted * 100) / 100),
      lower: Math.max(0, Math.round((predicted - 2 * stdDev) * 100) / 100),
      upper: Math.round((predicted + 2 * stdDev) * 100) / 100,
    });
  }

  return forecasts;
}

/**
 * Forecast user growth
 */
export function forecastUserGrowth(
  historicalData: UserGrowthData[],
  monthsToForecast: number
): ForecastData[] {
  if (historicalData.length < 2) return [];

  const revenueData: RevenueData[] = historicalData.map(data => ({
    date: data.date,
    amount: data.totalUsers,
    subscriptionCount: 0,
  }));

  return forecastRevenue(revenueData, monthsToForecast);
}
