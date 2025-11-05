import Xendit from "xendit-node";

if (!process.env.XENDIT_SECRET_KEY) {
  throw new Error("XENDIT_SECRET_KEY is not defined in environment variables");
}

export const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

// Price configuration for Indonesian market (QRIS)
export const XENDIT_PLANS = {
  pro_monthly: {
    amount: 149000, // IDR 149,000 (~$9.99)
    currency: "IDR",
    interval: "month",
  },
  pro_yearly: {
    amount: 1499000, // IDR 1,499,000 (~$99.99)
    currency: "IDR",
    interval: "year",
  },
  business_monthly: {
    amount: 299000, // IDR 299,000 (~$19.99)
    currency: "IDR",
    interval: "month",
  },
  business_yearly: {
    amount: 2999000, // IDR 2,999,000 (~$199.99)
    currency: "IDR",
    interval: "year",
  },
} as const;

export type XenditPlanId = keyof typeof XENDIT_PLANS;

// Helper function to create Xendit invoice for QRIS payment
export async function createXenditInvoice({
  userId,
  userEmail,
  planId,
  successUrl,
  failureUrl,
}: {
  userId: string;
  userEmail: string;
  planId: XenditPlanId;
  successUrl: string;
  failureUrl: string;
}) {
  const plan = XENDIT_PLANS[planId];
  const { Invoice } = xenditClient;

  // Generate unique external ID
  const externalId = `duely-${userId}-${planId}-${Date.now()}`;

  const invoice = await Invoice.createInvoice({
    data: {
      externalId,
      amount: plan.amount,
      payerEmail: userEmail,
      description: `Duely ${planId.replace("_", " ").toUpperCase()} Subscription`,
      invoiceDuration: 86400, // 24 hours expiry
      currency: plan.currency,
      reminderTime: 1,
      successRedirectUrl: successUrl,
      failureRedirectUrl: failureUrl,
      metadata: {
        userId,
        planId,
        interval: plan.interval,
      },
      // Enable QRIS and other Indonesian payment methods
      paymentMethods: [
        "QRIS",
        "OVO",
        "DANA",
        "LINKAJA",
        "SHOPEEPAY",
        "BCA",
        "BNI",
        "BRI",
        "MANDIRI",
        "PERMATA",
      ],
    },
  });

  return invoice;
}

// Helper function to get invoice details
// NOTE: Xendit SDK API may have changed - verify method name before using
// export async function getXenditInvoice(invoiceId: string) {
//   const { Invoice } = xenditClient;
//   const invoice = await Invoice.getInvoice({
//     invoiceId,
//   });
//   return invoice;
// }

// Helper function to expire invoice
// NOTE: Xendit SDK API may have changed - verify method name before using
// export async function expireXenditInvoice(invoiceId: string) {
//   const { Invoice } = xenditClient;
//   const invoice = await Invoice.expireInvoice({
//     invoiceId,
//   });
//   return invoice;
// }

// Helper to create recurring payment (for subscription)
// NOTE: Xendit SDK API may have changed - verify API before using
// export async function createXenditRecurringPayment({
//   userId,
//   userEmail,
//   planId,
// }: {
//   userId: string;
//   userEmail: string;
//   planId: XenditPlanId;
// }) {
//   const plan = XENDIT_PLANS[planId];
//   const { RecurringPayment } = xenditClient;

//   const recurringPayment = await RecurringPayment.createRecurringPayment({
//     data: {
//       externalId: `duely-recurring-${userId}-${planId}-${Date.now()}`,
//       payerEmail: userEmail,
//       description: `Duely ${planId.replace("_", " ").toUpperCase()} Subscription`,
//       amount: plan.amount,
//       interval: plan.interval === "month" ? "MONTH" : "YEAR",
//       intervalCount: 1,
//       currency: plan.currency,
//       metadata: {
//         userId,
//         planId,
//       },
//     },
//   });

//   return recurringPayment;
// }

// Helper function to stop recurring payment
// NOTE: Xendit SDK API may have changed - verify API before using
// export async function stopXenditRecurringPayment(recurringPaymentId: string) {
//   const { RecurringPayment } = xenditClient;
//   const result = await RecurringPayment.stopRecurringPayment({
//     id: recurringPaymentId,
//   });
//   return result;
// }
