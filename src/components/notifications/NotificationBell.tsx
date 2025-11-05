"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationList } from "./NotificationList";
import { getUnreadCount } from "@/app/actions/notifications";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Poll for new notifications every 60 seconds
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reload count when dropdown closes
      loadUnreadCount();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <NotificationList onUpdate={loadUnreadCount} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
