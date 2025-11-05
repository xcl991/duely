"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, CheckCircle } from "lucide-react";
import { formatCurrencyWithFrequency } from "@/lib/utils/currency";
import { formatDate, getUrgencyLevel } from "@/lib/utils/date";
import type { SubscriptionWithRelations } from "@/app/actions/subscriptions";
import { SubscriptionCard } from "./SubscriptionCard";
import { useTranslations } from "@/lib/i18n/hooks";

type SubscriptionsTableProps = {
  subscriptions: SubscriptionWithRelations[];
  onEdit: (subscription: SubscriptionWithRelations) => void;
  onDelete: (id: string) => void;
  onRenew?: (id: string) => void;
};

export default function SubscriptionsTable({
  subscriptions,
  onEdit,
  onDelete,
  onRenew,
}: SubscriptionsTableProps) {
  const t = useTranslations();

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold text-muted-foreground">{t('subscriptions.noSubscriptions')}</p>
        <p className="text-sm text-muted-foreground">{t('subscriptions.noSubscriptionsDesc')}</p>
      </div>
    );
  }

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

  const getUrgencyColor = (date: Date) => {
    const urgency = getUrgencyLevel(date);
    switch (urgency) {
      case "overdue":
        return "bg-destructive/10 text-destructive";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden">
        <div className="grid gap-3">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={onEdit}
              onDelete={onDelete}
              onRenew={onRenew}
            />
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('subscriptions.serviceName')}</TableHead>
              <TableHead>{t('common.amount')}</TableHead>
              <TableHead>{t('subscriptions.billingFrequency')}</TableHead>
              <TableHead>{t('subscriptions.category')}</TableHead>
              <TableHead>{t('subscriptions.member')}</TableHead>
              <TableHead>{t('subscriptions.nextBilling')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id} className={getUrgencyColor(subscription.nextBilling)}>
                <TableCell className="font-medium">{subscription.serviceName}</TableCell>
                <TableCell>
                  {formatCurrencyWithFrequency(
                    subscription.amount,
                    subscription.billingFrequency,
                    subscription.currency
                  )}
                </TableCell>
                <TableCell className="capitalize">{subscription.billingFrequency}</TableCell>
                <TableCell>
                  {subscription.category ? (
                    <span className="text-sm">{subscription.category.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {subscription.member ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                        style={{ backgroundColor: subscription.member.avatarColor || "#3b82f6" }}
                      >
                        {subscription.member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{subscription.member.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(subscription.nextBilling)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="capitalize border"
                    style={{
                      backgroundColor: getStatusColor(subscription.status).bg,
                      borderColor: getStatusColor(subscription.status).border,
                      color: getStatusColor(subscription.status).text,
                    }}
                  >
                    {subscription.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('common.actions')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(subscription)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      {onRenew && (
                        <DropdownMenuItem onClick={() => onRenew(subscription.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {t('subscriptions.markAsRenewed')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(subscription.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
