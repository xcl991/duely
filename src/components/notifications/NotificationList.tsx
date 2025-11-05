"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  type NotificationWithSubscription,
} from "@/app/actions/notifications";
import { NotificationItem } from "./NotificationItem";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/hooks";

interface NotificationListProps {
  onUpdate?: () => void;
}

export function NotificationList({ onUpdate }: NotificationListProps) {
  const t = useTranslations();
  const [notifications, setNotifications] = useState<
    NotificationWithSubscription[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error(t('notifications.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markAsRead(notificationId);
    if (result.success) {
      loadNotifications();
      onUpdate?.();
    } else {
      toast.error(result.error || t('notifications.failedToMarkAsRead'));
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      toast.success(result.message);
      loadNotifications();
      onUpdate?.();
    } else {
      toast.error(result.error || t('notifications.failedToMarkAllAsRead'));
    }
  };

  const handleDelete = async (notificationId: string) => {
    const result = await deleteNotification(notificationId);
    if (result.success) {
      toast.success(result.message);
      loadNotifications();
      onUpdate?.();
    } else {
      toast.error(result.error || t('notifications.failedToDelete'));
    }
  };

  const handleClearRead = async () => {
    const result = await clearReadNotifications();
    if (result.success) {
      toast.success(result.message);
      loadNotifications();
      onUpdate?.();
    } else {
      toast.error(result.error || t('notifications.failedToClear'));
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div>
          <h3 className="font-semibold text-base">{t('notifications.title')}</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {t('notifications.unread', { count: unreadCount })}
            </p>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearRead}
              title="Clear read notifications"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Notification List */}
      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {t('notifications.loadingNotifications')}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="h-12 w-12 text-muted-foreground mb-3" />
            <h4 className="font-medium text-sm mb-1">{t('notifications.noNotifications')}</h4>
            <p className="text-xs text-muted-foreground text-center">
              {t('notifications.allCaughtUp')}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
