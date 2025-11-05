"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Crown, Eye } from "lucide-react";
import type { MemberWithStats } from "@/app/actions/members";
import { useTranslations } from "@/lib/i18n/hooks";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

interface MemberCardProps {
  member: MemberWithStats;
  onEdit: (member: MemberWithStats) => void;
  onDelete: (memberId: string, memberName: string) => void;
  onViewSubscriptions: (member: MemberWithStats) => void;
  currency: string;
}

export function MemberCard({ member, onEdit, onDelete, onViewSubscriptions, currency }: MemberCardProps) {
  const t = useTranslations();

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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Member Avatar */}
            <Avatar className="h-12 w-12">
              {member.avatarImage && <AvatarImage src={member.avatarImage} />}
              <AvatarFallback
                style={{
                  backgroundColor: member.avatarColor || "#3b82f6",
                  color: "white",
                }}
              >
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>

            {/* Member Name */}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                {member.isPrimary && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              {member.isPrimary && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {t('members.primary')}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(member)}
              className="h-8 w-8 transition-colors [&:hover]:!bg-[#3EBCB3] [&:hover]:!text-white [&:active]:!bg-[#3EBCB3] [&:active]:!text-white"
              onTouchStart={(e) => {
                e.currentTarget.style.setProperty('background-color', '#3EBCB3', 'important');
                e.currentTarget.style.setProperty('color', 'white', 'important');
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.removeProperty('background-color');
                e.currentTarget.style.removeProperty('color');
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(member.id, member.name)}
              className="h-8 w-8 text-destructive transition-colors [&:hover]:!bg-[#3EBCB3] [&:hover]:!text-white [&:active]:!bg-[#3EBCB3] [&:active]:!text-white"
              onTouchStart={(e) => {
                e.currentTarget.style.setProperty('background-color', '#3EBCB3', 'important');
                e.currentTarget.style.setProperty('color', 'white', 'important');
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.removeProperty('background-color');
                e.currentTarget.style.removeProperty('color');
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('members.subscriptions')}</p>
            <p className="text-2xl font-bold">{member.subscriptionCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('members.monthlySpend')}</p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">
              {formatCurrency(member.monthlySpending)}
            </p>
          </div>
        </div>

        {/* Top Subscription */}
        {member.topSubscription && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1">
              {t('members.topSubscription')}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {member.topSubscription.serviceName}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(member.topSubscription.amount)}/mo
              </span>
            </div>
          </div>
        )}

        {!member.topSubscription && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              {t('members.noActiveSubscriptions')}
            </p>
          </div>
        )}

        {/* View Subscriptions Button */}
        {member.subscriptionCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => onViewSubscriptions(member)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('members.viewSubscriptions')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
