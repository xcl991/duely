"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import type { CategoryWithStats } from "@/app/actions/categories";
import { useTranslations } from "@/lib/i18n/hooks";
import { formatCurrency } from "@/lib/utils/currency";

interface CategoryCardProps {
  category: CategoryWithStats;
  onEdit: (category: CategoryWithStats) => void;
  onDelete: (categoryId: string, categoryName: string) => void;
  currency: string;
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  currency,
}: CategoryCardProps) {
  const t = useTranslations();

  const getProgressColor = (utilization: number | null) => {
    if (!utilization) return "bg-gray-300";
    if (utilization >= 100) return "bg-[#C592A8]"; // Mauve - Over budget
    if (utilization >= 80) return "bg-[#F4CC9C]"; // Peach - Near limit
    return "bg-[#3EBCB3]"; // Teal - On track
  };

  const getUtilizationText = (utilization: number | null) => {
    if (!utilization) return t('categories.noBudgetSet');
    if (utilization >= 100) return t('categories.overBudget');
    if (utilization >= 80) return t('categories.nearLimit');
    return t('categories.onTrack');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 pb-2 md:p-4 md:pb-2 lg:p-6 lg:pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
            {/* Category Icon */}
            <div
              className="flex h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg text-lg md:text-xl lg:text-2xl flex-shrink-0"
              style={{
                backgroundColor: category.color || "#e5e7eb",
              }}
            >
              {category.icon || "📁"}
            </div>

            {/* Category Name */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm md:text-base lg:text-lg truncate">{category.name}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t('categories.subscriptionCount', { count: category.subscriptionCount })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-0.5 md:space-x-1 flex-shrink-0 ml-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(category)}
              className="h-7 w-7 md:h-8 md:w-8 transition-colors [&:hover]:!bg-[#3EBCB3] [&:hover]:!text-white [&:active]:!bg-[#3EBCB3] [&:active]:!text-white"
              onTouchStart={(e) => {
                e.currentTarget.style.setProperty('background-color', '#3EBCB3', 'important');
                e.currentTarget.style.setProperty('color', 'white', 'important');
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.removeProperty('background-color');
                e.currentTarget.style.removeProperty('color');
              }}
            >
              <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(category.id, category.name)}
              className="h-7 w-7 md:h-8 md:w-8 text-destructive transition-colors [&:hover]:!bg-[#3EBCB3] [&:hover]:!text-white [&:active]:!bg-[#3EBCB3] [&:active]:!text-white"
              onTouchStart={(e) => {
                e.currentTarget.style.setProperty('background-color', '#3EBCB3', 'important');
                e.currentTarget.style.setProperty('color', 'white', 'important');
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.removeProperty('background-color');
                e.currentTarget.style.removeProperty('color');
              }}
            >
              <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 md:p-4 md:pt-0 lg:p-6 lg:pt-0 space-y-2 md:space-y-3 lg:space-y-4">
        {/* Monthly Spending */}
        <div>
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <span className="text-xs md:text-sm text-muted-foreground">
              {t('categories.monthlySpending')}
            </span>
            <span className="font-semibold text-xs sm:text-sm md:text-base break-words leading-tight">
              {formatCurrency(category.monthlySpending, currency)}
            </span>
          </div>

          {/* Budget Progress */}
          {category.budgetLimit && (
            <>
              <Progress
                value={
                  category.budgetUtilization
                    ? Math.min(category.budgetUtilization, 100)
                    : 0
                }
                className="h-1.5 md:h-2 bg-gray-200 dark:bg-gray-800"
                indicatorClassName={getProgressColor(
                  category.budgetUtilization
                )}
              />
              <div className="flex flex-col gap-0.5 mt-0.5 md:flex-row md:items-center md:justify-between md:mt-1 md:gap-0">
                <span className="text-xs text-muted-foreground break-words leading-tight">
                  {t('categories.budget')}: {formatCurrency(category.budgetLimit, category.budgetCurrency || currency)}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs w-fit border"
                  style={{
                    backgroundColor: category.budgetUtilization && category.budgetUtilization >= 100
                      ? 'rgba(197, 146, 168, 0.1)' // Mauve with opacity
                      : category.budgetUtilization && category.budgetUtilization >= 80
                      ? 'rgba(244, 204, 156, 0.1)' // Peach with opacity
                      : 'rgba(62, 188, 179, 0.1)', // Teal with opacity
                    borderColor: category.budgetUtilization && category.budgetUtilization >= 100
                      ? '#C592A8' // Mauve
                      : category.budgetUtilization && category.budgetUtilization >= 80
                      ? '#F4CC9C' // Peach
                      : '#3EBCB3', // Teal
                    color: category.budgetUtilization && category.budgetUtilization >= 100
                      ? '#C592A8' // Mauve
                      : category.budgetUtilization && category.budgetUtilization >= 80
                      ? '#F4CC9C' // Peach (darker for readability)
                      : '#3EBCB3', // Teal
                  }}
                >
                  {getUtilizationText(category.budgetUtilization)}
                </Badge>
              </div>
            </>
          )}

          {!category.budgetLimit && (
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">
              {t('categories.noBudgetLimitSet')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
