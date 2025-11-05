"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils/currency";
import { TrendingUp, AlertTriangle } from "lucide-react";

type BudgetTrackerProps = {
  spent: number;
  budget?: number;
};

export default function BudgetTracker({ spent, budget }: BudgetTrackerProps) {
  // Default budget if not set (placeholder for future feature)
  const monthlyBudget = budget || 500;
  const percentage = (spent / monthlyBudget) * 100;
  const remaining = monthlyBudget - spent;

  const getProgressColor = () => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 90) return "bg-orange-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (percentage >= 100) return "Over budget";
    if (percentage >= 90) return "Approaching limit";
    if (percentage >= 70) return "On track";
    return "Well under budget";
  };

  const getStatusIcon = () => {
    if (percentage >= 90) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget</CardTitle>
        <CardDescription>Track your spending against budget</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className="font-semibold">{formatCurrency(spent)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-semibold">{formatCurrency(monthlyBudget)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {percentage > 100 ? 100 : percentage.toFixed(1)}%
            </span>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>

          <Progress
            value={percentage > 100 ? 100 : percentage}
            className={`h-3 ${getProgressColor()}`}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Remaining</span>
          <span className={`font-semibold ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
            {remaining < 0 ? "-" : ""}
            {formatCurrency(Math.abs(remaining))}
          </span>
        </div>

        {!budget && (
          <p className="text-xs text-muted-foreground italic">
            Tip: Set a custom budget in Settings (coming soon)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
