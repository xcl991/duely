"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  FolderKanban,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  Crown,
} from "lucide-react";
import Image from "next/image";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "@/lib/i18n/hooks";

const navigation = [
  {
    nameKey: "nav.dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    nameKey: "nav.subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    nameKey: "nav.analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    nameKey: "nav.categories",
    href: "/categories",
    icon: FolderKanban,
  },
  {
    nameKey: "nav.members",
    href: "/members",
    icon: Users,
  },
  {
    nameKey: "nav.pricing",
    href: "/plans",
    icon: Crown,
  },
  {
    nameKey: "nav.settings",
    href: "/settings",
    icon: Settings,
  },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [collapseTimeout, setCollapseTimeout] = useState<NodeJS.Timeout | null>(null);
  const t = useTranslations();

  // Determine if sidebar should be expanded (either not collapsed or being hovered)
  const isExpanded = !isCollapsed || isHovered;

  // Handle mouse enter - expand immediately
  const handleMouseEnter = () => {
    // Clear any pending collapse timeout
    if (collapseTimeout) {
      clearTimeout(collapseTimeout);
      setCollapseTimeout(null);
    }
    setIsHovered(true);
  };

  // Handle mouse leave - collapse with delay
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsHovered(false);
    }, 300); // 300ms delay before collapsing
    setCollapseTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeout) {
        clearTimeout(collapseTimeout);
      }
    };
  }, [collapseTimeout]);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex h-full flex-col border-r bg-card transition-[width] duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-20"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-expanded={isExpanded}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b transition-all duration-300",
          isExpanded ? "px-6" : "px-0 justify-center"
        )}>
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center transition-all duration-300",
              isExpanded ? "space-x-2" : "justify-center"
            )}
          >
            <Image src="/logo.png" alt="Duely Logo" width={24} height={24} className="h-6 w-6 flex-shrink-0" />
            <span
              className={cn(
                "text-xl font-bold transition-all duration-300",
                isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              )}
            >
              Duely
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 space-y-1 py-4 transition-all duration-300",
          isExpanded ? "px-3" : "px-2"
        )}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            const navLink = (
              <Link
                key={item.nameKey}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200",
                  isExpanded ? "space-x-3 px-3" : "justify-center px-0",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:bg-[#3EBCB3] hover:text-white"
                )}
                style={isActive ? { backgroundColor: '#3EBCB3' } : {}}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={cn(
                    "transition-all duration-300",
                    isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                  )}
                >
                  {t(item.nameKey)}
                </span>
              </Link>
            );

            // Show tooltip only when collapsed
            if (!isExpanded) {
              return (
                <Tooltip key={item.nameKey}>
                  <TooltipTrigger asChild>
                    {navLink}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {t(item.nameKey)}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navLink;
          })}
        </nav>

        {/* Toggle Button */}
        <div className={cn(
          "border-t transition-all duration-300",
          isExpanded ? "p-3" : "p-2"
        )}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center rounded-lg py-2 text-sm font-medium transition-all duration-200 w-full",
              "text-muted-foreground hover:bg-[#3EBCB3] hover:text-white",
              isExpanded ? "space-x-3 px-3" : "justify-center px-0"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 flex-shrink-0" />
            ) : (
              <ChevronLeft className="h-5 w-5 flex-shrink-0" />
            )}
            <span
              className={cn(
                "transition-all duration-300",
                isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              )}
            >
              {isCollapsed ? t('common.expand') : t('common.collapse')}
            </span>
          </button>
        </div>

        {/* Footer */}
        <div
          className={cn(
            "border-t transition-all duration-300 overflow-hidden",
            isExpanded ? "p-4 h-12" : "p-0 h-0"
          )}
        >
          <p className="text-xs text-center text-muted-foreground whitespace-nowrap">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
