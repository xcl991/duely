import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import TrialExpiredBanner from "@/components/TrialExpiredBanner";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { canUsePlatform } from "@/lib/plan-limits";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check trial status
  const user = await getCurrentUser();
  let showTrialBanner = false;
  let trialEndDate = "";

  if (user) {
    const userWithPlan = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    if (userWithPlan) {
      const isActive = canUsePlatform(
        userWithPlan.subscriptionPlan,
        userWithPlan.subscriptionStatus,
        userWithPlan.subscriptionEndDate
      );

      if (
        !isActive &&
        userWithPlan.subscriptionStatus === "trial" &&
        userWithPlan.subscriptionEndDate
      ) {
        showTrialBanner = true;
        trialEndDate = userWithPlan.subscriptionEndDate.toISOString();
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
          {showTrialBanner && <TrialExpiredBanner endDate={trialEndDate} />}
          {children}
        </main>
      </div>
    </div>
  );
}
