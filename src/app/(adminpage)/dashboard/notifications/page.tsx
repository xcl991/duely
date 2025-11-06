'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  category: 'system' | 'security' | 'user_action' | 'subscription';
  severity: number;
  isRead: boolean;
  readAt: string | null;
  metadata: any;
  actionUrl: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter, categoryFilter]);

  const fetchNotifications = async () => {
    try {
      let url = '/api/admin/notifications?limit=100';

      if (filter === 'unread') {
        url += '&isRead=false';
      }

      if (categoryFilter !== 'all') {
        url += `&category=${categoryFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      } else {
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Marked as read');
        fetchNotifications();
      } else {
        toast.error('Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('All notifications marked as read');
        fetchNotifications();
      } else {
        toast.error('Failed to mark all as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Notification deleted');
        fetchNotifications();
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-600';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'security':
        return 'bg-purple-500';
      case 'system':
        return 'bg-gray-500';
      case 'user_action':
        return 'bg-green-500';
      case 'subscription':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredNotifications = notifications;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            System notifications and alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter(n => !n.isRead).length === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({notifications.filter(n => !n.isRead).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
          >
            All
          </Button>
          <Button
            variant={categoryFilter === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('system')}
          >
            System
          </Button>
          <Button
            variant={categoryFilter === 'security' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('security')}
          >
            Security
          </Button>
          <Button
            variant={categoryFilter === 'user_action' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('user_action')}
          >
            Users
          </Button>
          <Button
            variant={categoryFilter === 'subscription' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('subscription')}
          >
            Subscriptions
          </Button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground text-center">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : "No notifications to display."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all ${
                !notification.isRead ? 'bg-muted/50 border-l-4 border-l-primary' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {notification.title}
                      </h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <Badge className={getNotificationBadgeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        <Badge className={getCategoryBadgeColor(notification.category)}>
                          {notification.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {notification.severity && (
                          <span>Severity: {notification.severity}/5</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        {notification.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = notification.actionUrl!}
                          >
                            View Details
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
