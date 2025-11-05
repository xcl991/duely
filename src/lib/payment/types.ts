// Payment Gateway Types & Interfaces

export type PaymentProvider = "midtrans" | "doku" | "stripe" | "xendit";

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "qris"
  | "gopay"
  | "shopeepay"
  | "dana"
  | "ovo"
  | "linkaja"
  | "bca_va"
  | "mandiri_va"
  | "bni_va"
  | "bri_va"
  | "permata_va"
  | "alfamart"
  | "indomaret"
  | "akulaku";

export type Currency = "IDR" | "USD" | "SGD";

export type PlanInterval = "month" | "year";

export type PlanTier = "free" | "pro" | "business";

export interface PlanConfig {
  id: string;
  tier: PlanTier;
  interval: PlanInterval;
  amount: number;
  currency: Currency;
  name: string;
  description: string;
}

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  userName?: string;
  planId: string;
  provider: PaymentProvider;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface CheckoutResponse {
  provider: PaymentProvider;
  checkoutUrl: string;
  transactionId: string;
  expiresAt?: Date;
}

export interface WebhookPayload {
  provider: PaymentProvider;
  event: string;
  data: any;
  signature?: string;
  timestamp?: string;
}

export interface PaymentGateway {
  // Create checkout/payment session
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse>;

  // Verify webhook signature
  verifyWebhook(payload: WebhookPayload): Promise<boolean>;

  // Process webhook event
  processWebhook(payload: WebhookPayload): Promise<void>;

  // Get transaction status
  getTransactionStatus(transactionId: string): Promise<PaymentStatus>;
}

export interface PaymentStatus {
  transactionId: string;
  status: "pending" | "success" | "failed" | "expired";
  amount: number;
  currency: Currency;
  paymentMethod?: PaymentMethod;
  paidAt?: Date;
  metadata?: Record<string, any>;
}

// Plan pricing configurations
export const PLAN_PRICING: Record<string, PlanConfig> = {
  // IDR Pricing
  "pro_monthly_idr": {
    id: "pro_monthly_idr",
    tier: "pro",
    interval: "month",
    amount: 149000,
    currency: "IDR",
    name: "Pro Monthly",
    description: "Pro plan billed monthly in IDR"
  },
  "pro_yearly_idr": {
    id: "pro_yearly_idr",
    tier: "pro",
    interval: "year",
    amount: 1490000,
    currency: "IDR",
    name: "Pro Yearly",
    description: "Pro plan billed yearly in IDR (save 17%)"
  },
  "business_monthly_idr": {
    id: "business_monthly_idr",
    tier: "business",
    interval: "month",
    amount: 299000,
    currency: "IDR",
    name: "Business Monthly",
    description: "Business plan billed monthly in IDR"
  },
  "business_yearly_idr": {
    id: "business_yearly_idr",
    tier: "business",
    interval: "year",
    amount: 2990000,
    currency: "IDR",
    name: "Business Yearly",
    description: "Business plan billed yearly in IDR (save 17%)"
  },

  // USD Pricing
  "pro_monthly_usd": {
    id: "pro_monthly_usd",
    tier: "pro",
    interval: "month",
    amount: 9.99,
    currency: "USD",
    name: "Pro Monthly",
    description: "Pro plan billed monthly in USD"
  },
  "pro_yearly_usd": {
    id: "pro_yearly_usd",
    tier: "pro",
    interval: "year",
    amount: 99.99,
    currency: "USD",
    name: "Pro Yearly",
    description: "Pro plan billed yearly in USD (save 17%)"
  },
  "business_monthly_usd": {
    id: "business_monthly_usd",
    tier: "business",
    interval: "month",
    amount: 19.99,
    currency: "USD",
    name: "Business Monthly",
    description: "Business plan billed monthly in USD"
  },
  "business_yearly_usd": {
    id: "business_yearly_usd",
    tier: "business",
    interval: "year",
    amount: 199.99,
    currency: "USD",
    name: "Business Yearly",
    description: "Business plan billed yearly in USD (save 17%)"
  },
};

// Helper to get plan config
export function getPlanConfig(planId: string): PlanConfig | null {
  return PLAN_PRICING[planId] || null;
}

// Helper to detect currency from user location or preference
export function detectCurrency(countryCode?: string): Currency {
  if (countryCode === "ID" || countryCode === "id") {
    return "IDR";
  }
  // Default to USD for international
  return "USD";
}

// Helper to get available payment methods by provider and currency
export function getAvailablePaymentMethods(
  provider: PaymentProvider,
  currency: Currency
): PaymentMethod[] {
  if (provider === "midtrans" && currency === "IDR") {
    return [
      "credit_card",
      "qris",
      "gopay",
      "shopeepay",
      "bca_va",
      "mandiri_va",
      "bni_va",
      "bri_va",
      "permata_va",
      "alfamart",
      "indomaret"
    ];
  }

  if (provider === "doku" && currency === "IDR") {
    return [
      "credit_card",
      "qris",
      "bca_va",
      "mandiri_va",
      "bni_va",
      "permata_va",
      "alfamart",
      "indomaret"
    ];
  }

  // Default for USD/international
  return ["credit_card", "debit_card"];
}
