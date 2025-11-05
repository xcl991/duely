# Payment Gateway Setup Guide

This guide explains how to set up payment gateways for Duely subscription platform.

## Overview

Duely supports multiple payment gateways with a flexible architecture that allows:
- Easy switching between payment providers
- Multiple gateways running simultaneously
- Auto-detection based on environment variables
- Support for Indonesian payment methods (QRIS, Virtual Accounts, E-Wallets, etc.)

## Supported Payment Gateways

### 1. Midtrans (Recommended for Indonesia)

**Supported Payment Methods:**
- ✅ QRIS
- ✅ E-Wallets: GoPay, ShopeePay, OVO, DANA
- ✅ Virtual Accounts: BCA, Mandiri, BNI, BRI, Permata
- ✅ Credit/Debit Cards
- ✅ Convenience Stores: Alfamart, Indomaret
- ✅ Akulaku (Buy Now Pay Later)

**Setup Steps:**

1. **Create Midtrans Account**
   - Visit: https://dashboard.midtrans.com
   - Sign up for a free account
   - Verify your business details

2. **Get API Credentials**
   - Go to Settings → Access Keys
   - Copy your Server Key and Client Key
   - For testing, use **Sandbox** keys (starts with `SB-Mid-`)
   - For production, use **Production** keys (starts with `Mid-`)

3. **Configure Environment Variables**
   ```bash
   # Sandbox (for testing)
   MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxx"
   MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxx"

   # Production (for live)
   MIDTRANS_SERVER_KEY="Mid-server-xxxxxxxxxxxx"
   MIDTRANS_CLIENT_KEY="Mid-client-xxxxxxxxxxxx"
   ```

4. **Test Payment**
   - Use Midtrans test cards: https://docs.midtrans.com/docs/testing-payment
   - Test QRIS: Use Midtrans Simulator app
   - Test E-Wallet: Use OVO/GoPay test accounts

### 2. Doku (Alternative for Indonesia)

**Supported Payment Methods:**
- ✅ QRIS
- ✅ Virtual Accounts: BCA, Mandiri, BNI, Permata
- ✅ Credit/Debit Cards
- ✅ Convenience Stores: Alfamart, Indomaret

**Setup Steps:**

1. **Create Doku Account**
   - Visit: https://dashboard.doku.com
   - Register your business
   - Complete KYC verification

2. **Get API Credentials**
   - Go to Settings → API Credentials
   - Copy your Client ID and Shared Key
   - For testing, use **Sandbox** credentials
   - For production, use **Production** credentials

3. **Configure Environment Variables**
   ```bash
   # Sandbox (for testing)
   DOKU_CLIENT_ID="your-sandbox-client-id"
   DOKU_SHARED_KEY="your-sandbox-shared-key"

   # Production (for live)
   DOKU_CLIENT_ID="your-production-client-id"
   DOKU_SHARED_KEY="your-production-shared-key"
   ```

4. **Test Payment**
   - Use Doku test credentials: https://docs.doku.com/docs/testing

## Installation

1. **Install Dependencies**
   ```bash
   npm install midtrans-client doku-nodejs-library
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Add your payment gateway credentials
   - Configure at least ONE gateway (Midtrans or Doku)

3. **Verify Setup**
   - Start development server: `npm run dev`
   - Check console logs for gateway initialization:
     ```
     ✅ Midtrans gateway initialized
     ✅ Doku gateway initialized
     💳 Active payment gateways: midtrans, doku
     ```

## How It Works

### 1. Architecture

```
User → Payment Button → Provider Selection
     → API Route (/api/payment/create-checkout)
     → Gateway Factory (selects provider)
     → Payment Gateway (Midtrans/Doku)
     → External Payment Page
     → Webhook Handler (process payment result)
     → Database Update
```

### 2. Plan Configuration

Plans are configured in `src/lib/payment/types.ts`:

```typescript
export const PLAN_PRICING = {
  "pro_monthly_idr": {
    id: "pro_monthly_idr",
    tier: "pro",
    interval: "month",
    amount: 149000,     // IDR 149,000
    currency: "IDR",
    name: "Pro Monthly (IDR)",
  },
  "pro_monthly_usd": {
    id: "pro_monthly_usd",
    tier: "pro",
    interval: "month",
    amount: 10,          // USD $10
    currency: "USD",
    name: "Pro Monthly (USD)",
  },
  // ... more plans
}
```

### 3. Gateway Selection

The system automatically selects the best gateway based on:
- User location (country code)
- Available configured gateways
- Plan currency (IDR/USD)

```typescript
// For Indonesian users
const provider = getRecommendedProvider("ID");
// Returns: "midtrans" (if available)

// Manual selection
const gateway = getGateway("doku");
const checkoutUrl = await gateway.createCheckout({ ... });
```

## API Reference

### Gateway Factory Functions

```typescript
// Initialize gateways (auto-called on module load)
initializeGateways();

// Get specific gateway
const gateway = getGateway("midtrans"); // "midtrans" | "doku" | "stripe" | "xendit"

// Check available providers
const providers = getAvailableProviders(); // ["midtrans", "doku"]

// Check if provider is available
const isAvailable = isProviderAvailable("midtrans"); // true/false

// Get recommended provider
const provider = getRecommendedProvider("ID"); // "midtrans"

// Get gateway status (for debugging)
const status = getGatewayStatus();
// { midtrans: true, doku: true, stripe: false, xendit: false }
```

### Payment Gateway Interface

All payment gateways implement this interface:

```typescript
interface PaymentGateway {
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse>;
  verifyWebhook(payload: WebhookPayload): Promise<boolean>;
  processWebhook(payload: WebhookPayload): Promise<void>;
  getTransactionStatus(transactionId: string): Promise<PaymentStatus>;
}
```

## Webhooks

### Setup Webhook URLs

Configure these webhook URLs in your payment provider dashboard:

**Midtrans:**
- Webhook URL: `https://yourdomain.com/api/payment/webhook/midtrans`
- Payment Notification URL: Same as above

**Doku:**
- Notification URL: `https://yourdomain.com/api/payment/webhook/doku`

### Webhook Security

- Webhooks are verified using signature validation
- Each gateway has its own signature algorithm
- Invalid signatures are rejected automatically

## Pricing Plans

### Current Plans

| Plan | Monthly (IDR) | Yearly (IDR) | Monthly (USD) | Yearly (USD) |
|------|--------------|--------------|---------------|--------------|
| Free | 0 | 0 | 0 | 0 |
| Pro | 149,000 | 1,490,000 | 10 | 100 |
| Business | Contact | Contact | Contact | Contact |

### Modifying Plans

Edit `src/lib/payment/types.ts` to add/modify plans:

```typescript
export const PLAN_PRICING: Record<string, PlanConfig> = {
  "new_plan_monthly_idr": {
    id: "new_plan_monthly_idr",
    tier: "premium",
    interval: "month",
    amount: 299000,
    currency: "IDR",
    name: "Premium Monthly (IDR)",
  },
  // ... more variants
}
```

## Troubleshooting

### Gateway Not Initializing

**Problem:** Console shows "No payment gateways configured"

**Solutions:**
1. Check `.env.local` file exists and has correct values
2. Verify environment variable names match exactly
3. Restart development server after changing env vars
4. Check for typos in credentials

### Payment Creation Fails

**Problem:** Error "Provider 'midtrans' is not configured"

**Solutions:**
1. Verify credentials in `.env.local`
2. Check gateway initialization logs in console
3. Ensure you're using correct keys (sandbox vs production)
4. Test with `getAvailableProviders()` to see active gateways

### Webhook Not Working

**Problem:** Payments succeed but database doesn't update

**Solutions:**
1. Check webhook URL is configured in provider dashboard
2. Verify webhook signature validation logic
3. Check server logs for webhook errors
4. Use provider's webhook testing tools (Midtrans Dashboard → Webhook → Test)
5. Ensure webhook route is publicly accessible (not behind auth)

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different credentials for dev/staging/production
   - Rotate keys regularly

2. **Webhook Validation**
   - Always verify webhook signatures
   - Don't trust webhook data without verification
   - Log all webhook attempts for audit

3. **Error Handling**
   - Don't expose sensitive error details to users
   - Log detailed errors server-side only
   - Return generic error messages to client

4. **HTTPS**
   - Always use HTTPS in production
   - Payment providers may reject HTTP webhooks

## Migration from Stripe/Xendit

If you're migrating from the old Stripe/Xendit setup:

1. **Code Changes**
   - Old: `import { createStripeCheckoutSession } from "@/lib/stripe"`
   - New: `import { getGateway } from "@/lib/payment"`

2. **Environment Variables**
   - Remove old Stripe/Xendit env vars
   - Add new Midtrans/Doku env vars

3. **Database**
   - Existing subscriptions will continue to work
   - New subscriptions will use new gateways

4. **UI**
   - Payment button now shows both gateway options
   - Users can choose between Midtrans and Doku

## Support

For payment gateway specific issues:
- **Midtrans:** https://support.midtrans.com
- **Doku:** https://support.doku.com

For Duely platform issues:
- Create an issue in the repository
- Contact development team

## Future Gateways

The architecture supports adding more gateways:
- ✅ Midtrans (implemented)
- ✅ Doku (implemented)
- ⏳ Stripe (for international markets)
- ⏳ Xendit (alternative for Indonesia)
- ⏳ PayPal (for international markets)

To add a new gateway, implement the `PaymentGateway` interface and register it in `gateway-factory.ts`.
