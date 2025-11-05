"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { AlertTriangle, CheckCircle, Eye } from "lucide-react";

type OverdueSubscription = {
  id: string;
  serviceName: string;
  amount: number;
  nextBilling: Date;
  daysOverdue: number;
};

type OverdueAlertsProps = {
  overdueSubscriptions: OverdueSubscription[];
  currency?: string;
};

export default function OverdueAlerts({ overdueSubscriptions, currency = "USD" }: OverdueAlertsProps) {
  if (!overdueSubscriptions || overdueSubscriptions.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">All up to date!</p>
              <p className="text-sm text-green-700">No overdue subscriptions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Attention Required</CardTitle>
        </div>
        <CardDescription>
          {overdueSubscriptions.length} subscription{overdueSubscriptions.length !== 1 ? "s" : ""} need
          {overdueSubscriptions.length === 1 ? "s" : ""} review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {overdueSubscriptions.map((sub) => (
            <Alert key={sub.id} variant="destructive" className="bg-white">
              <AlertDescription>
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-medium">{sub.serviceName}</p>
                    <p className="text-sm">
                      Due {formatDate(sub.nextBilling)} • Overdue by {sub.daysOverdue} day
                      {sub.daysOverdue !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="text-right space-y-2 min-w-0">
                    <p className="font-semibold text-sm sm:text-base break-words">{formatCurrency(sub.amount, currency)}</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
