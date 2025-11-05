import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        await handleCheckoutCompleted(session);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Get subscription details
  const subscription: any = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Determine plan tier and interval
  const [tier, interval] = planId.split("_");
  const subscriptionPlan = tier; // "pro" or "business"
  const billingCycle = interval; // "monthly" or "yearly"

  // Update user subscription
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan,
      subscriptionStatus: "active",
      subscriptionStartDate: new Date(subscription.current_period_start * 1000),
      subscriptionEndDate: new Date(subscription.current_period_end * 1000),
      billingCycle,
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      provider: "stripe",
      providerPaymentId: session.payment_intent as string,
      providerCustomerId: session.customer as string,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase() || "USD",
      status: "completed",
      paymentMethod: session.payment_method_types?.[0] || "card",
      plan: planId,
      billingPeriodStart: new Date(subscription.current_period_start * 1000),
      billingPeriodEnd: new Date(subscription.current_period_end * 1000),
      invoiceUrl: session.invoice as string,
    },
  });

  // Create subscription history
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "upgraded",
      fromPlan: "free",
      toPlan: subscriptionPlan,
      effectiveDate: new Date(),
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const userId = invoice.subscription_details?.metadata?.userId;
  const planId = invoice.subscription_details?.metadata?.planId;

  if (!userId) {
    console.error("Missing userId in invoice metadata");
    return;
  }

  // Create payment record for recurring payment
  await prisma.payment.create({
    data: {
      userId,
      provider: "stripe",
      providerPaymentId: invoice.payment_intent as string,
      providerCustomerId: invoice.customer as string,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: "completed",
      plan: planId || "unknown",
      invoiceUrl: invoice.hosted_invoice_url || undefined,
      receiptUrl: invoice.invoice_pdf || undefined,
    },
  });
}

async function handleInvoicePaymentFailed(invoice: any) {
  const userId = invoice.subscription_details?.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in invoice metadata");
    return;
  }

  // Update payment record
  await prisma.payment.create({
    data: {
      userId,
      provider: "stripe",
      providerPaymentId: invoice.payment_intent as string,
      providerCustomerId: invoice.customer as string,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: "failed",
      plan: "unknown",
    },
  });

  // You might want to send notification to user
  console.log(`Payment failed for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus:
        subscription.status === "active" ? "active" : "canceled",
      subscriptionEndDate: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: "free",
      subscriptionStatus: "canceled",
    },
  });

  // Create subscription history
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "canceled",
      fromPlan: user?.subscriptionPlan || "unknown",
      toPlan: "free",
      effectiveDate: new Date(),
    },
  });
}
