"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslations } from "@/lib/i18n/hooks";

type MonthlyBudgetTrackerProps = {
  monthlySpending: number;
  monthlyBudgetLimit: number | null;
  budgetUtilization: number | null;
  currency: string;
};

export default function MonthlyBudgetTracker({
  monthlySpending,
  monthlyBudgetLimit,
  budgetUtilization,
  currency,
}: MonthlyBudgetTrackerProps) {
  const t = useTranslations();

  // If no budget is set, don't show the component
  if (!monthlyBudgetLimit || budgetUtilization === null) {
    return null;
  }

  // Format currency
  const formatAmount = (amount: number) => {
    // Currencies that don't use decimal places
    const noDecimalCurrencies = ["IDR", "KRW", "JPY"];

    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency: currency,
    };

    // Remove decimals for currencies with large nominal values
    if (noDecimalCurrencies.includes(currency)) {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    } else {
      options.minimumFractionDigits = 2;
    }

    return new Intl.NumberFormat("en-US", options).format(amount);
  };

  // Determine status and colors based on utilization percentage
  const getStatusInfo = () => {
    if (budgetUtilization >= 100) {
      return {
        status: "overbudget",
        color: "bg-red-500",
        badgeVariant: "destructive" as const,
        icon: AlertTriangle,
        textColor: "text-red-600",
        message: t("budget.overBudget"),
      };
    } else if (budgetUtilization >= 80) {
      return {
        status: "warning",
        color: "bg-amber-500",
        badgeVariant: "default" as const,
        icon: TrendingUp,
        textColor: "text-amber-600",
        message: t("budget.nearLimit"),
      };
    } else {
      return {
        status: "ontrack",
        color: "bg-green-500",
        badgeVariant: "secondary" as const,
        icon: CheckCircle,
        textColor: "text-green-600",
        message: t("budget.onTrack"),
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const remaining = monthlyBudgetLimit - monthlySpending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          {t("budget.monthlyBudget")}
        </CardTitle>
        <Badge variant={statusInfo.badgeVariant} className="flex items-center gap-1">
          <StatusIcon className="h-3 w-3" />
          {statusInfo.message}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={Math.min(budgetUtilization, 100)}
            className="h-3"
            indicatorClassName={statusInfo.color}
          />
          <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
            <span className="text-muted-foreground break-words">
              {formatAmount(monthlySpending)} {t("budget.of")} {formatAmount(monthlyBudgetLimit)}
            </span>
            <span className={`font-medium ${statusInfo.textColor}`}>
              {budgetUtilization.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Remaining/Overspent Amount */}
        <div className="flex items-start gap-2 rounded-lg border p-3">
          <DollarSign className={`h-5 w-5 mt-0.5 ${statusInfo.textColor}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {remaining >= 0 ? t("budget.remaining") : t("budget.overspent")}
            </p>
            <p className={`text-base sm:text-lg font-bold ${statusInfo.textColor} break-words`}>
              {formatAmount(Math.abs(remaining))}
            </p>
            {remaining < 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("budget.overspentDesc")}
              </p>
            )}
            {remaining >= 0 && budgetUtilization >= 80 && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("budget.nearLimitDesc")}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
