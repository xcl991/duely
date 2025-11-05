"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Repeat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, getUrgencyLevel } from "@/lib/utils/date";
import type { SubscriptionWithRelations } from "@/app/actions/subscriptions";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/hooks";

interface SubscriptionCardProps {
  subscription: SubscriptionWithRelations;
  onEdit: (subscription: SubscriptionWithRelations) => void;
  onDelete: (id: string) => void;
  onRenew?: (id: string) => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onRenew,
}: SubscriptionCardProps) {
  const t = useTranslations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "rgba(62, 188, 179, 0.1)", border: "#3EBCB3", text: "#3EBCB3" }; // Teal
      case "trial":
        return { bg: "rgba(197, 146, 168, 0.1)", border: "#C592A8", text: "#C592A8" }; // Mauve
      case "paused":
        return { bg: "rgba(219, 219, 219, 0.1)", border: "#DBDBDB", text: "#999999" }; // Gray
      case "canceled":
        return { bg: "rgba(244, 204, 156, 0.1)", border: "#F4CC9C", text: "#F4CC9C" }; // Peach
      default:
        return { bg: "rgba(219, 219, 219, 0.1)", border: "#DBDBDB", text: "#999999" }; // Gray
    }
  };

  const getCategoryColor = (category: any) => {
    if (!category) return { bg: "rgba(156, 163, 175, 0.082)", border: "rgba(156, 163, 175, 0.314)", text: "rgb(107, 114, 128)" };
    const color = category.color || "#6B7280";
    return {
      bg: `${color}21`,
      border: `${color}50`,
      text: color,
    };
  };

  const getUrgencyBadge = (date: Date) => {
    const urgency = getUrgencyLevel(date);
    switch (urgency) {
      case "overdue":
        return <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-red-600 text-white dark:bg-red-600 dark:text-white font-medium">{t('subscriptions.overdue')}</span>;
      case "high":
        return <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-orange-600 text-white dark:bg-orange-600 dark:text-white font-medium">{t('subscriptions.dueSoon')}</span>;
      case "medium":
        return <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">{t('subscriptions.upcoming')}</span>;
      default:
        return null;
    }
  };

  const isRecurring = subscription.status === "active";
  const statusColors = getStatusColor(subscription.status);
  const categoryStyles = getCategoryColor(subscription.category);

  return (
    <Card className="overflow-hidden p-3 transition-all">
      <div className="flex flex-col gap-3">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2 flex-1">
            {/* Service Icon */}
            {subscription.serviceIcon && (
              <div className="relative shrink-0 size-10">
                <Image
                  alt={`${subscription.serviceName} logo`}
                  src={subscription.serviceIcon}
                  fill
                  className="rounded-lg object-contain"
                  sizes="48px"
                />
              </div>
            )}

            {/* Service Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="truncate font-semibold text-base">
                  {subscription.serviceName}
                </h3>

                {/* Member Avatar */}
                {subscription.member && (
                  <div className="flex shrink-0 items-center gap-1">
                    <div
                      className="flex size-5 items-center justify-center rounded-full border text-xs font-medium"
                      style={{
                        backgroundColor: `${subscription.member.avatarColor || "#3b82f6"}21`,
                        borderColor: subscription.member.avatarColor || "#3b82f6",
                        color: subscription.member.avatarColor || "#3b82f6",
                      }}
                    >
                      {subscription.member.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Recurring Indicator */}
                {isRecurring && (
                  <Repeat className="size-3.5 shrink-0 text-green-600 dark:text-green-400" />
                )}
              </div>

              {/* Badges */}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {/* Category Badge */}
                {subscription.category && (
                  <div
                    className="inline-flex items-center border rounded-full px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs capitalize"
                    style={{
                      backgroundColor: categoryStyles.bg,
                      borderColor: categoryStyles.border,
                      color: categoryStyles.text,
                    }}
                  >
                    {subscription.category.name}
                  </div>
                )}

                {/* Status Badge */}
                <div
                  className="inline-flex items-center border rounded-full px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs font-medium capitalize"
                  style={{
                    backgroundColor: statusColors.bg,
                    borderColor: statusColors.border,
                    color: statusColors.text,
                  }}
                >
                  {subscription.status}
                </div>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-2xl hover:bg-muted"
                aria-label="More actions"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(subscription)}
                onTouchStart={(e) => {
                  e.currentTarget.style.setProperty('background-color', '#3EBCB3', 'important');
                  e.currentTarget.style.setProperty('color', 'white', 'important');
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.removeProperty('background-color');
                  e.currentTarget.style.removeProperty('color');
                }}
              >
                {t('common.edit')}
              </DropdownMenuItem>
              {onRenew && subscription.status === "active" && (
                <DropdownMenuItem onClick={() => onRenew(subscription.id)}>
                  {t('subscriptions.markAsRenewed')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(subscription.id)}
                className="text-destructive"
                onTouchStart={(e) => {
                  e.currentTarget.style.setProperty('background-color', '#3EBCB3', 'important');
                  e.currentTarget.style.setProperty('color', 'white', 'important');
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.removeProperty('background-color');
                  e.currentTarget.style.removeProperty('color');
                }}
              >
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer Section */}
        <div className="flex items-baseline justify-between gap-2">
          {/* Price */}
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold break-words leading-tight">
              {formatCurrency(subscription.amount, subscription.currency)}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {t('subscriptions.per')} {subscription.billingFrequency}
            </p>
          </div>

          {/* Next Billing */}
          <div className="min-w-0 text-right shrink-0">
            <div>
              <p className="text-sm font-medium">
                {formatDate(subscription.nextBilling)}
              </p>
              <p className="text-xs text-muted-foreground">{t('subscriptions.nextBilling')}</p>
              {getUrgencyBadge(subscription.nextBilling) && (
                <div className="mt-1">
                  {getUrgencyBadge(subscription.nextBilling)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
