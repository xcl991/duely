import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const callbackToken = req.headers.get("x-callback-token");

  // Verify webhook token
  const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!webhookToken) {
    console.error("XENDIT_WEBHOOK_TOKEN is not set");
    return NextResponse.json(
      { error: "Webhook token not configured" },
      { status: 500 }
    );
  }

  if (callbackToken !== webhookToken) {
    console.error("Invalid webhook token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const data = JSON.parse(body);
    const eventType = data.status;

    switch (eventType) {
      case "PAID":
      case "SETTLED":
        await handleInvoicePaid(data);
        break;

      case "EXPIRED":
        await handleInvoiceExpired(data);
        break;

      case "FAILED":
        await handleInvoiceFailed(data);
        break;

      default:
        console.log(`Unhandled Xendit event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Xendit webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleInvoicePaid(data: any) {
  const userId = data.metadata?.userId;
  const planId = data.metadata?.planId;
  const interval = data.metadata?.interval;

  if (!userId || !planId) {
    console.error("Missing metadata in Xendit invoice");
    return;
  }

  // Determine plan tier
  const [tier] = planId.split("_");
  const subscriptionPlan = tier; // "pro" or "business"
  const billingCycle = interval; // "month" or "year"

  // Calculate subscription period
  const startDate = new Date();
  const endDate = new Date();
  if (interval === "month") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Update user subscription
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan,
      subscriptionStatus: "active",
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      billingCycle,
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      provider: "xendit",
      providerPaymentId: data.id,
      amount: data.amount,
      currency: data.currency,
      status: "completed",
      paymentMethod: data.payment_method || "qris",
      plan: planId,
      billingPeriodStart: startDate,
      billingPeriodEnd: endDate,
      invoiceUrl: data.invoice_url,
      metadata: JSON.stringify({
        paymentChannel: data.payment_channel,
        paymentMethod: data.payment_method,
      }),
    },
  });

  // Create subscription history
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "upgraded",
      fromPlan: "free",
      toPlan: subscriptionPlan,
      effectiveDate: startDate,
    },
  });
}

async function handleInvoiceExpired(data: any) {
  const userId = data.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in Xendit invoice");
    return;
  }

  // Create failed payment record
  await prisma.payment.create({
    data: {
      userId,
      provider: "xendit",
      providerPaymentId: data.id,
      amount: data.amount,
      currency: data.currency,
      status: "failed",
      plan: data.metadata?.planId || "unknown",
      metadata: JSON.stringify({ reason: "expired" }),
    },
  });
}

async function handleInvoiceFailed(data: any) {
  const userId = data.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in Xendit invoice");
    return;
  }

  // Create failed payment record
  await prisma.payment.create({
    data: {
      userId,
      provider: "xendit",
      providerPaymentId: data.id,
      amount: data.amount,
      currency: data.currency,
      status: "failed",
      plan: data.metadata?.planId || "unknown",
      metadata: JSON.stringify({ reason: data.failure_code || "unknown" }),
    },
  });
}
