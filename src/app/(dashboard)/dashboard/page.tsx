import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getDashboardStats, getUpcomingRenewals, getOverdueSubscriptions, getCategoryBreakdown } from "@/app/actions/dashboard";
import { getUserSettings } from "@/app/actions/settings";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Type guard: Redirect to login if user is not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all dashboard data including user settings for currency
  const [stats, upcomingRenewals, overdueSubscriptions, categoryData, userSettings] = await Promise.all([
    getDashboardStats(),
    getUpcomingRenewals(7),
    getOverdueSubscriptions(),
    getCategoryBreakdown(),
    getUserSettings(),
  ]);

  return (
    <DashboardClient
      userName={user.name || "User"}
      stats={stats}
      upcomingRenewals={upcomingRenewals}
      overdueSubscriptions={overdueSubscriptions}
      categoryData={categoryData}
      currency={userSettings.currency}
    />
  );
}
