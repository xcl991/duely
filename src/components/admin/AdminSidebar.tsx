'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  LogOut,
  Shield,
  BarChart3,
  Settings,
  Bell,
  Activity,
  Construction
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/adminpage/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Analytics',
    href: '/adminpage/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Users',
    href: '/adminpage/dashboard/users',
    icon: Users,
  },
  {
    title: 'Subscriptions',
    href: '/adminpage/dashboard/subscriptions',
    icon: CreditCard,
  },
  {
    title: 'Notifications',
    href: '/adminpage/dashboard/notifications',
    icon: Bell,
  },
  {
    title: 'System Health',
    href: '/adminpage/dashboard/system/health',
    icon: Activity,
  },
  {
    title: 'Maintenance',
    href: '/adminpage/dashboard/maintenance',
    icon: Construction,
  },
  {
    title: 'Settings',
    href: '/adminpage/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Admin Logs',
    href: '/adminpage/dashboard/logs',
    icon: FileText,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/adminpage/auth');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50 dark:bg-gray-900">
      {/* Logo/Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Shield className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </div>
  );
}
