import { NextRequest, NextResponse } from "next/server";
import { generateAllNotifications } from "@/lib/notifications/generator";

/**
 * API route to generate notifications
 * This can be called by a cron job or manually for testing
 *
 * Usage:
 * - POST /api/cron/generate-notifications
 * - Optional header: Authorization: Bearer YOUR_SECRET_TOKEN
 */
export async function POST(_request: NextRequest) {
  try {
    // Optional: Add authentication for production
    // const authHeader = _request.headers.get("authorization");
    // const token = authHeader?.split(" ")[1];
    // if (token !== process.env.CRON_SECRET) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const results = await generateAllNotifications();

    return NextResponse.json({
      success: results.success,
      totalNotificationsCreated: results.totalNotificationsCreated,
      details: {
        renewalReminders: results.results.renewalReminders.notificationsCreated || 0,
        overdueNotifications: results.results.overdueNotifications.notificationsCreated || 0,
        budgetAlerts: results.results.budgetAlerts.notificationsCreated || 0,
      },
    });
  } catch (error) {
    console.error("Generate notifications error:", error);
    return NextResponse.json(
      { error: "Failed to generate notifications" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing/health check
 */
export async function GET() {
  return NextResponse.json({
    message: "Notification generation endpoint. Use POST to generate notifications.",
    note: "This endpoint should be called daily via a cron job.",
  });
}
