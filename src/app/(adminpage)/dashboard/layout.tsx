import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
