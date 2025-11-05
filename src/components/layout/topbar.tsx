"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import MobileNav from "./mobile-nav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CurrencySwitcher } from "./currency-switcher";
import { useTranslations } from "@/lib/i18n/hooks";

export default function TopBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const t = useTranslations();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Add swipe gesture globally for entire page
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const minSwipeDistance = 80;
    const maxSwipeAngle = 30; // Maximum vertical deviation in degrees

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const distanceX = touchEndX - touchStartX;
      const distanceY = Math.abs(touchEndY - touchStartY);
      const isRightSwipe = distanceX > minSwipeDistance;

      // Calculate angle to ensure mostly horizontal swipe
      const angle = Math.atan2(distanceY, distanceX) * (180 / Math.PI);
      const isHorizontal = Math.abs(angle) < maxSwipeAngle;

      // Swipe from anywhere in left 40% of screen, must be horizontal
      const screenWidth = window.innerWidth;
      const leftZone = screenWidth * 0.4; // 40% of screen width

      if (isRightSwipe && touchStartX < leftZone && isHorizontal) {
        setMobileNavOpen(true);
      }
    };

    // Add to document body for global detection
    document.body.addEventListener("touchstart", handleTouchStart);
    document.body.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.body.removeEventListener("touchstart", handleTouchStart);
      document.body.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return t('nav.dashboard');
    if (pathname.startsWith("/subscriptions")) return t('nav.subscriptions');
    if (pathname.startsWith("/analytics")) return t('nav.analytics');
    if (pathname.startsWith("/categories")) return t('nav.categories');
    if (pathname.startsWith("/members")) return t('nav.members');
    if (pathname.startsWith("/profile")) return t('nav.profile');
    if (pathname.startsWith("/settings")) return t('nav.settings');
    return t('nav.dashboard');
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="flex h-16 items-center justify-between border-b px-6" style={{ backgroundColor: '#3EBCB3' }}>
      {/* Mobile Navigation & Page Title */}
      <div className="flex items-center space-x-4">
        <MobileNav externalOpen={mobileNavOpen} onOpenChange={setMobileNavOpen} />
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Currency Switcher */}
        <CurrencySwitcher />

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                <AvatarFallback className="bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>{t('nav.profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('nav.settings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('nav.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
