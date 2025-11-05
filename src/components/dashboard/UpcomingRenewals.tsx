"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyWithFrequency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { Calendar } from "lucide-react";

type UpcomingRenewal = {
  id: string;
  serviceName: string;
  amount: number;
  currency: string;
  billingFrequency: string;
  nextBilling: Date;
  categoryName: string | null;
  memberName: string | null;
  daysUntil: number;
};

type UpcomingRenewalsProps = {
  renewals: UpcomingRenewal[];
};

export default function UpcomingRenewals({ renewals }: UpcomingRenewalsProps) {
  if (!renewals || renewals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals</CardTitle>
          <CardDescription>Next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No renewals in the next 7 days
          </p>
        </CardContent>
      </Card>
    );
  }

  const getDaysText = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  const getUrgencyColor = (days: number) => {
    if (days === 0) return "destructive";
    if (days <= 2) return "default";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Renewals</CardTitle>
        <CardDescription>Next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renewals.map((renewal) => (
            <div
              key={renewal.id}
              className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{renewal.serviceName}</p>
                  <Badge variant={getUrgencyColor(renewal.daysUntil)} className="text-xs">
                    {getDaysText(renewal.daysUntil)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(renewal.nextBilling)}</span>
                  </div>

                  {renewal.categoryName && (
                    <span className="text-xs">• {renewal.categoryName}</span>
                  )}

                  {renewal.memberName && (
                    <span className="text-xs">• {renewal.memberName}</span>
                  )}
                </div>
              </div>

              <div className="text-right min-w-0">
                <p className="font-semibold text-sm sm:text-base break-words">
                  {formatCurrencyWithFrequency(renewal.amount, renewal.billingFrequency, renewal.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
