import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/session';
import { Toaster } from '@/components/ui/sonner';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If no session and not on auth page, redirect to login
  // (middleware handles this too, but this is a backup)
  if (!session) {
    redirect('/adminpage/auth');
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
