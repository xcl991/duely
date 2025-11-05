import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

// Price IDs for different plans (you'll need to create these in Stripe Dashboard)
export const STRIPE_PLANS = {
  pro_monthly: {
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
    amount: 9.99,
    currency: "usd",
    interval: "month",
  },
  pro_yearly: {
    priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
    amount: 99.99,
    currency: "usd",
    interval: "year",
  },
  business_monthly: {
    priceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || "",
    amount: 19.99,
    currency: "usd",
    interval: "month",
  },
  business_yearly: {
    priceId: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || "",
    amount: 199.99,
    currency: "usd",
    interval: "year",
  },
} as const;

export type StripePlanId = keyof typeof STRIPE_PLANS;

// Helper function to create Stripe checkout session
export async function createStripeCheckoutSession({
  userId,
  userEmail,
  planId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  planId: StripePlanId;
  successUrl: string;
  cancelUrl: string;
}) {
  const plan = STRIPE_PLANS[planId];

  if (!plan.priceId) {
    throw new Error(`Price ID not configured for plan: ${planId}`);
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ["card", "paypal"],
    mode: "subscription",
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
    // Enable Apple Pay and Google Pay
    payment_method_options: {
      card: {
        request_three_d_secure: "automatic",
      },
    },
  });

  return session;
}

// Helper function to create Stripe portal session (for managing subscription)
export async function createStripePortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Helper function to get subscription details
export async function getStripeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

// Helper function to cancel subscription
export async function cancelStripeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}
