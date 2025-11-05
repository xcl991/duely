// Payment Gateway Factory
// Manages multiple payment gateway instances

import type { PaymentGateway, PaymentProvider } from "./types";
import { midtransGateway } from "./midtrans";
import { dokuGateway } from "./doku";

// Gateway registry
const gatewayRegistry: Record<PaymentProvider, PaymentGateway | null> = {
  midtrans: null,
  doku: null,
  stripe: null, // Reserved for future
  xendit: null, // Reserved for future
};

/**
 * Initialize payment gateways based on available environment variables
 */
export function initializeGateways(): void {
  // Initialize Midtrans if credentials available
  if (process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_CLIENT_KEY) {
    gatewayRegistry.midtrans = midtransGateway;
    console.log("✅ Midtrans gateway initialized");
  } else {
    console.warn("⚠️  Midtrans credentials not found - gateway disabled");
  }

  // Initialize Doku if credentials available
  if (process.env.DOKU_CLIENT_ID && process.env.DOKU_SHARED_KEY) {
    gatewayRegistry.doku = dokuGateway;
    console.log("✅ Doku gateway initialized");
  } else {
    console.warn("⚠️  Doku credentials not found - gateway disabled");
  }

  // Log active gateways
  const activeGateways = getAvailableProviders();
  if (activeGateways.length === 0) {
    console.error("❌ No payment gateways configured! Please set environment variables.");
  } else {
    console.log(`💳 Active payment gateways: ${activeGateways.join(", ")}`);
  }
}

/**
 * Get payment gateway instance by provider
 */
export function getGateway(provider: PaymentProvider): PaymentGateway {
  const gateway = gatewayRegistry[provider];

  if (!gateway) {
    throw new Error(
      `Payment gateway "${provider}" is not configured. ` +
      `Available gateways: ${getAvailableProviders().join(", ")}`
    );
  }

  return gateway;
}

/**
 * Get list of available (configured) payment providers
 */
export function getAvailableProviders(): PaymentProvider[] {
  return (Object.keys(gatewayRegistry) as PaymentProvider[]).filter(
    (provider) => gatewayRegistry[provider] !== null
  );
}

/**
 * Check if a specific provider is available
 */
export function isProviderAvailable(provider: PaymentProvider): boolean {
  return gatewayRegistry[provider] !== null;
}

/**
 * Get recommended provider based on user location/currency
 */
export function getRecommendedProvider(countryCode?: string): PaymentProvider {
  const availableProviders = getAvailableProviders();

  if (availableProviders.length === 0) {
    throw new Error("No payment gateways configured");
  }

  // For Indonesia users
  if (countryCode === "ID" || countryCode === "id") {
    // Prefer Midtrans for Indonesian users
    if (isProviderAvailable("midtrans")) {
      return "midtrans";
    }
    // Fallback to Doku
    if (isProviderAvailable("doku")) {
      return "doku";
    }
  }

  // For international users
  if (isProviderAvailable("stripe")) {
    return "stripe";
  }

  // Default: return first available
  return availableProviders[0];
}

/**
 * Get gateway configuration status for admin/debugging
 */
export function getGatewayStatus(): Record<PaymentProvider, boolean> {
  return {
    midtrans: isProviderAvailable("midtrans"),
    doku: isProviderAvailable("doku"),
    stripe: isProviderAvailable("stripe"),
    xendit: isProviderAvailable("xendit"),
  };
}

// Auto-initialize gateways on module load
initializeGateways();
