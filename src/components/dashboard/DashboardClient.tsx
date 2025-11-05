"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, AlertCircle, CalendarClock, PiggyBank, FolderPlus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { getRelativeTimeString } from "@/lib/utils/date";
import { useTranslations } from "@/lib/i18n/hooks";
import CategoryChart from "./CategoryChart";
import UpcomingRenewals from "./UpcomingRenewals";
import MonthlyBudgetTracker from "./MonthlyBudgetTracker";
import OverdueAlerts from "./OverdueAlerts";
import type { DashboardStats, UpcomingRenewal, OverdueSubscription, CategoryBreakdown } from "@/app/actions/dashboard";
import Link from "next/link";

type DashboardClientProps = {
  userName: string;
  stats: DashboardStats;
  upcomingRenewals: UpcomingRenewal[];
  overdueSubscriptions: OverdueSubscription[];
  categoryData: CategoryBreakdown[];
  currency: string;
};

export default function DashboardClient({
  userName,
  stats,
  upcomingRenewals,
  overdueSubscriptions,
  categoryData,
  currency,
}: DashboardClientProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('dashboard.title')}, {userName}!
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Overdue Alerts Section */}
      {overdueSubscriptions.length > 0 && (
        <OverdueAlerts overdueSubscriptions={overdueSubscriptions} currency={currency} />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Spending Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.monthlySpending')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">{formatCurrency(stats.monthlySpending, currency)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions === 0
                ? t('subscriptions.noSubscriptions')
                : t('subscriptions.subscriptionsFound', { count: stats.activeSubscriptions })
              }
            </p>
          </CardContent>
        </Card>

        {/* Active Subscriptions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeSubscriptions')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions === 0
                ? t('subscriptions.addFirstSubscription')
                : `${formatCurrency(stats.annualProjection, currency)}/${t('common.perYear')}`
              }
            </p>
          </CardContent>
        </Card>

        {/* Top Category or Yearly Projection Card */}
        {stats.topCategory ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics.topServices')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">{formatCurrency(stats.topCategory.amount, currency)}</div>
              <p className="text-xs text-muted-foreground truncate">
                {stats.topCategory.name}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('subscriptions.annualProjection')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">{formatCurrency(stats.annualProjection, currency)}</div>
              <p className="text-xs text-muted-foreground">
                {t('subscriptions.basedOnCurrent')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Next Renewal or Upcoming Renewals Card */}
        {stats.nextRenewal ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('subscriptions.nextBilling')}</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">{formatCurrency(stats.nextRenewal.amount, currency)}</div>
              <p className="text-xs text-muted-foreground truncate">
                {stats.nextRenewal.serviceName} • {getRelativeTimeString(stats.nextRenewal.date)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.upcomingRenewals')}</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingRenewals}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.nextMonth')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Two Column Layout for Charts and Widgets */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Chart */}
        <CategoryChart data={categoryData} />

        {/* Upcoming Renewals Widget */}
        <UpcomingRenewals renewals={upcomingRenewals} />
      </div>

      {/* Monthly Budget Tracker */}
      <MonthlyBudgetTracker
        monthlySpending={stats.monthlySpending}
        monthlyBudgetLimit={stats.monthlyBudgetLimit}
        budgetUtilization={stats.budgetUtilization}
        currency={currency}
      />

      {/* Potential Savings Card */}
      {stats.potentialSavings > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">{t('members.potentialSavings')}</CardTitle>
            </div>
            <CardDescription>
              {t('dashboard.savingsInsights')} {formatCurrency(stats.potentialSavings, currency)}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Getting Started - Only show if no subscriptions */}
      {stats.activeSubscriptions === 0 && (
        <Card className="border-teal-200 bg-gradient-to-br from-teal-50/50 to-white">
          <CardHeader>
            <CardTitle className="text-teal-900">{t('auth.getStarted')}</CardTitle>
            <CardDescription>
              {t('subscriptions.noSubscriptionsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress checklist */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-teal-700">✓ {t('auth.createAccount')}</p>
                <p className="text-sm text-muted-foreground">• {t('subscriptions.addFirstSubscription')}</p>
                <p className="text-sm text-muted-foreground">• {t('categories.createFirstCategory')}</p>
                <p className="text-sm text-muted-foreground">• {t('members.addFirstMember')}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3 text-teal-900">{t('dashboard.quickActions')}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/categories"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-10 px-4 flex-1"
                  >
                    <FolderPlus className="h-4 w-4" />
                    {t('categories.addCategory')}
                  </Link>
                  <Link
                    href="/subscriptions"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-10 px-4 flex-1"
                  >
                    <Plus className="h-4 w-4" />
                    {t('subscriptions.addSubscription')}
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {t('dashboard.startByCreating')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
