# Payment Integration Setup Guide

This guide will help you set up payment processing for Duely using Stripe (global) and Xendit (Indonesia).

## Prerequisites

- Stripe account ([sign up here](https://stripe.com))
- Xendit account ([sign up here](https://xendit.co))
- Node.js and npm installed
- Duely project running locally

## 1. Install Dependencies

Dependencies are already installed:
- `stripe` - Stripe SDK
- `xendit-node` - Xendit SDK

## 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Stripe Configuration (Global Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product Price IDs (create these in Stripe Dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_...

# Xendit Configuration (Indonesia Payments)
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_PUBLIC_KEY=xnd_public_development_...
XENDIT_WEBHOOK_TOKEN=your_webhook_verification_token
```

## 3. Stripe Setup

### 3.1 Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API keys**
3. Copy your **Secret key** and **Publishable key**
4. Add them to your `.env` file

### 3.2 Create Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Create products for each plan:

**Pro Plan:**
- Name: Duely Pro
- Description: Professional subscription tracking
- Create prices:
  - Monthly: $9.99/month
  - Yearly: $99.99/year

**Business Plan:**
- Name: Duely Business
- Description: Business subscription management
- Create prices:
  - Monthly: $19.99/month
  - Yearly: $199.99/year

3. Copy each Price ID (starts with `price_...`) to your `.env` file

### 3.3 Enable Payment Methods

1. Go to **Settings > Payment methods**
2. Enable:
   - ✅ Card payments
   - ✅ PayPal
   - ✅ Apple Pay
   - ✅ Google Pay

### 3.4 Setup Webhook

1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add it to your `.env` as `STRIPE_WEBHOOK_SECRET`

## 4. Xendit Setup

### 4.1 Get API Keys

1. Go to [Xendit Dashboard](https://dashboard.xendit.co)
2. Navigate to **Settings > API Keys**
3. Copy your **Secret Key** and **Public Key**
4. Add them to your `.env` file

### 4.2 Setup Webhook

1. Go to **Settings > Webhooks**
2. Click **Add webhook**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/xendit`
4. Create a verification token (any random string)
5. Add it to your `.env` as `XENDIT_WEBHOOK_TOKEN`
6. Select events:
   - ✅ Invoice paid
   - ✅ Invoice expired
   - ✅ Invoice failed

### 4.3 Enable Payment Methods

Xendit automatically enables:
- QRIS (all banks and e-wallets)
- OVO
- DANA
- LinkAja
- ShopeePay
- Bank transfers (BCA, BNI, BRI, Mandiri, Permata)

## 5. Test the Integration

### 5.1 Test Stripe

Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

### 5.2 Test Xendit

In development mode, Xendit provides test credentials and a sandbox environment.

1. Use test mode API keys
2. Generate test invoices
3. Simulate payments in dashboard

## 6. Webhook Testing (Local Development)

### Option 1: Using Stripe CLI

```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5566/api/webhooks/stripe
```

### Option 2: Using ngrok/Tailscale

```bash
# With ngrok
ngrok http 5566

# With Tailscale
# Enable HTTPS on your Tailscale domain
# Use your Tailscale URL in webhook settings
```

## 7. Database Migration

The payment schema has been added to Prisma. Run migration:

```bash
npx prisma migrate deploy
```

## 8. Features Implemented

### Payment Flow

1. User clicks "Subscribe" on pricing page
2. PaymentButton component shows provider choice:
   - **Global**: Card/PayPal/Apple Pay/Google Pay (Stripe)
   - **Indonesia**: QRIS/E-Wallet/Bank Transfer (Xendit)
3. User is redirected to payment page
4. After successful payment, webhook updates user subscription
5. User is redirected to success page

### Payment Models

- **Payment**: Tracks all payment transactions
- **SubscriptionHistory**: Records plan changes

### API Endpoints

- `POST /api/payment/create-checkout`: Create payment session
- `POST /api/webhooks/stripe`: Handle Stripe webhooks
- `POST /api/webhooks/xendit`: Handle Xendit webhooks

### Pages

- `/pricing`: Pricing page with payment buttons
- `/payment/success`: Payment success page

## 9. Production Deployment

### Before Going Live

1. ✅ Replace test API keys with production keys
2. ✅ Update webhook URLs to production domain
3. ✅ Test all payment flows thoroughly
4. ✅ Enable live mode in Stripe and Xendit
5. ✅ Set up proper error logging and monitoring
6. ✅ Review security settings

### Security Checklist

- ✅ Webhook signatures are verified
- ✅ API keys are stored in environment variables
- ✅ No sensitive data in client-side code
- ✅ HTTPS enabled for all endpoints
- ✅ Rate limiting enabled
- ✅ Database transactions for critical operations

## 10. Pricing Configuration

Current pricing is configured in:
- `src/lib/stripe.ts`: Stripe plans (USD)
- `src/lib/xendit.ts`: Xendit plans (IDR)

**Global (Stripe - USD):**
- Pro Monthly: $9.99/month
- Pro Yearly: $99.99/year
- Business Monthly: $19.99/month
- Business Yearly: $199.99/year

**Indonesia (Xendit - IDR):**
- Pro Monthly: Rp 149,000/month
- Pro Yearly: Rp 1,499,000/year
- Business Monthly: Rp 299,000/month
- Business Yearly: Rp 2,999,000/year

## 11. Support

For issues with:
- **Stripe**: Check [Stripe Docs](https://stripe.com/docs) or [Contact Support](https://support.stripe.com)
- **Xendit**: Check [Xendit Docs](https://developers.xendit.co) or [Contact Support](https://help.xendit.co)

## 12. Next Steps

After setup is complete:
1. Test all payment flows
2. Customize email templates for payment notifications
3. Add subscription management UI in settings
4. Implement invoice download feature
5. Set up analytics for payment tracking
