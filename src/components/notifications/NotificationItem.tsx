"use client";

import { AlertTriangle, Bell, Calendar, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { NotificationWithSubscription } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/hooks";

interface NotificationItemProps {
  notification: NotificationWithSubscription;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const t = useTranslations();

  const getIcon = (type: string) => {
    switch (type) {
      case "renewal_reminder":
        return <Calendar className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      case "budget_alert":
        return <DollarSign className="h-4 w-4" />;
      case "info":
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "renewal_reminder":
        return "bg-blue-500/10 text-blue-600";
      case "overdue":
        return "bg-red-500/10 text-red-600";
      case "budget_alert":
        return "bg-yellow-500/10 text-yellow-600";
      case "info":
        return "bg-gray-500/10 text-gray-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "renewal_reminder":
        return t('notifications.reminder');
      case "overdue":
        return t('notifications.overdue');
      case "budget_alert":
        return t('notifications.budgetBadge');
      case "info":
        return t('notifications.info');
      default:
        return type;
    }
  };

  return (
    <div
      className={cn(
        "p-4 hover:bg-accent transition-colors",
        !notification.isRead && "bg-accent/50"
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={cn("p-2 rounded-full", getTypeColor(notification.type))}>
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-sm font-medium pr-2">{notification.title}</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1"
              onClick={() => onDelete(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {getTypeBadge(notification.type)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.createdAt, {
                  addSuffix: true,
                })}
              </span>
            </div>

            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onMarkAsRead(notification.id)}
              >
                {t('notifications.markAsRead')}
              </Button>
            )}
          </div>

          {/* Subscription info if available */}
          {notification.subscription && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">
                  {notification.subscription.serviceName}
                </span>{" "}
                • ${notification.subscription.amount.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
