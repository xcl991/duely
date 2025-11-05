"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  FolderKanban,
  Users,
  Settings,
  Menu,
  Crown,
} from "lucide-react";
import Image from "next/image";
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
];

type MobileNavProps = {
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function MobileNav({ externalOpen, onOpenChange }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  // Sync with external control
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => handleOpenChange(false)}>
              <Image src="/logo.png" alt="Duely Logo" width={24} height={24} className="h-6 w-6" />
              <span className="text-xl font-bold">Duely</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.nameKey}
                  href={item.href}
                  onClick={() => handleOpenChange(false)}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:bg-[#3EBCB3] hover:text-white"
                  )}
                  style={isActive ? { backgroundColor: '#3EBCB3' } : {}}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{t(item.nameKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <p className="text-xs text-center text-muted-foreground">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
