import midtransClient from "midtrans-client";
import type {
  PaymentGateway,
  CreateCheckoutParams,
  CheckoutResponse,
  WebhookPayload,
  PaymentStatus,
} from "./types";
import { getPlanConfig } from "./types";

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export class MidtransGateway implements PaymentGateway {
  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
    const plan = getPlanConfig(params.planId);

    if (!plan) {
      throw new Error(`Invalid plan ID: ${params.planId}`);
    }

    // Midtrans requires amount in IDR (no decimals)
    const amount = Math.round(plan.amount);

    const transactionDetails = {
      order_id: `duely-${params.userId}-${Date.now()}`,
      gross_amount: amount,
    };

    const itemDetails = [
      {
        id: plan.id,
        price: amount,
        quantity: 1,
        name: plan.name,
        category: "subscription",
      },
    ];

    const customerDetails = {
      first_name: params.userName || params.userEmail.split("@")[0],
      email: params.userEmail,
    };

    const snapParameter = {
      transaction_details: transactionDetails,
      item_details: itemDetails,
      customer_details: customerDetails,
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: params.successUrl.replace("{CHECKOUT_SESSION_ID}", transactionDetails.order_id),
        error: params.cancelUrl,
        pending: params.cancelUrl,
      },
      metadata: {
        userId: params.userId,
        planId: params.planId,
        tier: plan.tier,
        interval: plan.interval,
        ...params.metadata,
      },
      expiry: {
        start_time: new Date().toISOString(),
        unit: "hour",
        duration: 24,
      },
    };

    try {
      const transaction = await snap.createTransaction(snapParameter);

      return {
        provider: "midtrans",
        checkoutUrl: transaction.redirect_url,
        transactionId: transactionDetails.order_id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };
    } catch (error) {
      console.error("Midtrans checkout error:", error);
      throw new Error("Failed to create Midtrans checkout session");
    }
  }

  async verifyWebhook(payload: WebhookPayload): Promise<boolean> {
    try {
      const apiClient = new midtransClient.Snap({
        isProduction: process.env.NODE_ENV === "production",
        serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      });

      // Verify notification using Midtrans SDK
      const statusResponse = await apiClient.transaction.notification(payload.data);

      // Verify signature hash
      const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
      const orderId = statusResponse.order_id;
      const statusCode = statusResponse.status_code;
      const grossAmount = statusResponse.gross_amount;

      const signatureKey = statusResponse.signature_key;
      const crypto = require("crypto");
      const hash = crypto
        .createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest("hex");

      return hash === signatureKey;
    } catch (error) {
      console.error("Midtrans webhook verification failed:", error);
      return false;
    }
  }

  async processWebhook(payload: WebhookPayload): Promise<void> {
    const data = payload.data;
    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    console.log("Processing Midtrans webhook:", {
      order_id: data.order_id,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
    });

    // Handle different transaction statuses
    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        // Payment successful
        await this.handleSuccessfulPayment(data);
      }
    } else if (transactionStatus === "settlement") {
      // Payment settled
      await this.handleSuccessfulPayment(data);
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      // Payment failed
      await this.handleFailedPayment(data);
    } else if (transactionStatus === "pending") {
      // Payment pending
      await this.handlePendingPayment(data);
    }
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const statusResponse = await snap.transaction.status(transactionId);

      let status: "pending" | "success" | "failed" | "expired" = "pending";

      if (statusResponse.transaction_status === "settlement" ||
          (statusResponse.transaction_status === "capture" && statusResponse.fraud_status === "accept")) {
        status = "success";
      } else if (
        statusResponse.transaction_status === "cancel" ||
        statusResponse.transaction_status === "deny"
      ) {
        status = "failed";
      } else if (statusResponse.transaction_status === "expire") {
        status = "expired";
      }

      return {
        transactionId,
        status,
        amount: parseFloat(statusResponse.gross_amount),
        currency: statusResponse.currency === "IDR" ? "IDR" : "USD",
        paymentMethod: this.mapPaymentMethod(statusResponse.payment_type),
        paidAt: status === "success" ? new Date(statusResponse.transaction_time) : undefined,
        metadata: statusResponse.custom_field1 ? JSON.parse(statusResponse.custom_field1) : undefined,
      };
    } catch (error) {
      console.error("Failed to get Midtrans transaction status:", error);
      throw error;
    }
  }

  private async handleSuccessfulPayment(data: any): Promise<void> {
    // This will be handled by the webhook route which has access to Prisma
    console.log("Midtrans payment successful:", data.order_id);
  }

  private async handleFailedPayment(data: any): Promise<void> {
    console.log("Midtrans payment failed:", data.order_id);
  }

  private async handlePendingPayment(data: any): Promise<void> {
    console.log("Midtrans payment pending:", data.order_id);
  }

  private mapPaymentMethod(paymentType: string): any {
    const mapping: Record<string, any> = {
      credit_card: "credit_card",
      gopay: "gopay",
      shopeepay: "shopeepay",
      qris: "qris",
      bank_transfer: "bca_va",
      echannel: "mandiri_va",
      bca_va: "bca_va",
      bni_va: "bni_va",
      bri_va: "bri_va",
      permata_va: "permata_va",
      cstore: "alfamart",
      akulaku: "akulaku",
    };
    return mapping[paymentType] || paymentType;
  }
}

// Export singleton instance
export const midtransGateway = new MidtransGateway();
