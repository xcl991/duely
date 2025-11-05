"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  getMemberSubscriptions,
  type MemberWithStats
} from "@/app/actions/members";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

interface MemberSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberWithStats | null;
  currency?: string;
}

export function MemberSubscriptionModal({
  isOpen,
  onClose,
  member,
  currency = "IDR",
}: MemberSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [totalMonthly, setTotalMonthly] = useState(0);

  useEffect(() => {
    if (isOpen && member) {
      loadSubscriptions();
    }
  }, [isOpen, member, currency]);

  const loadSubscriptions = async () => {
    if (!member) return;

    try {
      setIsLoading(true);
      // Pass currency to server action for currency conversion
      const data = await getMemberSubscriptions(member.id, currency);
      setSubscriptions(data.subscriptions);

      // Use pre-calculated total from server (already converted)
      setTotalMonthly(data.totalMonthly);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "trial":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "paused":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "canceled":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback
                style={{
                  backgroundColor: member.avatarColor || "#3b82f6",
                  color: "white",
                }}
              >
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{member.name}&apos;s Subscriptions</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {subscriptions.length} subscription
                {subscriptions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Summary Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Total Monthly Cost</span>
                </div>
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary break-words leading-tight">
                  {formatCurrency(totalMonthly)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Subscriptions List */}
          {!isLoading && subscriptions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No subscriptions assigned to this member
              </p>
            </div>
          )}

          {!isLoading && subscriptions.length > 0 && (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Service Name & Category */}
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">
                            {subscription.serviceName}
                          </h4>
                          {subscription.category && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{
                                backgroundColor: subscription.category.color
                                  ? `${subscription.category.color}20`
                                  : undefined,
                              }}
                            >
                              {subscription.category.icon}{" "}
                              {subscription.category.name}
                            </Badge>
                          )}
                        </div>

                        {/* Amount & Frequency */}
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">
                              {formatCurrencyUtil(subscription.amount, subscription.currency || "IDR")}
                            </span>
                            <span>/ {subscription.billingFrequency}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              Next:{" "}
                              {format(
                                new Date(subscription.nextBilling),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Notes (if any) */}
                        {subscription.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {subscription.notes}
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <Badge
                        variant="outline"
                        className={getStatusColor(subscription.status)}
                      >
                        {subscription.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
