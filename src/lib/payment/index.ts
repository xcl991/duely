// Payment Gateway Module
// Central export point for all payment-related functionality

// Export types
export type {
  PaymentProvider,
  PaymentMethod,
  Currency,
  PlanInterval,
  PlanTier,
  PlanConfig,
  CreateCheckoutParams,
  CheckoutResponse,
  WebhookPayload,
  PaymentGateway,
  PaymentStatus,
} from "./types";

// Export plan configuration utilities
export {
  PLAN_PRICING,
  getPlanConfig,
  detectCurrency,
  getAvailablePaymentMethods,
} from "./types";

// Export gateway instances
export { midtransGateway } from "./midtrans";
export { dokuGateway } from "./doku";

// Export gateway factory (recommended way to access gateways)
export {
  getGateway,
  getAvailableProviders,
  isProviderAvailable,
  getRecommendedProvider,
  getGatewayStatus,
  initializeGateways,
} from "./gateway-factory";
