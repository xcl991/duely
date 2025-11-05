import * as crypto from "crypto";
import type {
  PaymentGateway,
  CreateCheckoutParams,
  CheckoutResponse,
  WebhookPayload,
  PaymentStatus,
} from "./types";
import { getPlanConfig } from "./types";

const DOKU_BASE_URL = process.env.NODE_ENV === "production"
  ? "https://api.doku.com"
  : "https://sandbox.doku.com";

export class DokuGateway implements PaymentGateway {
  private clientId: string;
  private sharedKey: string;

  constructor() {
    this.clientId = process.env.DOKU_CLIENT_ID || "";
    this.sharedKey = process.env.DOKU_SHARED_KEY || "";
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
    const plan = getPlanConfig(params.planId);

    if (!plan) {
      throw new Error(`Invalid plan ID: ${params.planId}`);
    }

    // Doku requires amount in IDR (no decimals)
    const amount = Math.round(plan.amount);
    const invoiceNumber = `DLY-${Date.now()}-${params.userId.substring(0, 8)}`;

    // Create payment request
    const paymentData = {
      order: {
        invoice_number: invoiceNumber,
        amount: amount,
        currency: "IDR",
      },
      payment: {
        payment_due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 24 hours
      },
      customer: {
        name: params.userName || params.userEmail.split("@")[0],
        email: params.userEmail,
      },
      item_details: [
        {
          name: plan.name,
          price: amount,
          quantity: 1,
        },
      ],
      additional_info: {
        metadata: {
          userId: params.userId,
          planId: params.planId,
          tier: plan.tier,
          interval: plan.interval,
          ...params.metadata,
        },
      },
      callback_url: params.successUrl.replace("{CHECKOUT_SESSION_ID}", invoiceNumber),
      callback_url_cancel: params.cancelUrl,
    };

    try {
      // Generate signature
      const signature = this.generateSignature(invoiceNumber, amount.toString());

      const response = await fetch(`${DOKU_BASE_URL}/v1/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Id": this.clientId,
          "Signature": signature,
          "Request-Id": invoiceNumber,
          "Request-Timestamp": new Date().toISOString(),
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`Doku API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        provider: "doku",
        checkoutUrl: result.payment.url,
        transactionId: invoiceNumber,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error("Doku checkout error:", error);
      throw new Error("Failed to create Doku checkout session");
    }
  }

  async verifyWebhook(payload: WebhookPayload): Promise<boolean> {
    try {
      const { data, signature } = payload;

      if (!signature) {
        return false;
      }

      // Verify signature
      const expectedSignature = this.generateWebhookSignature(data);
      return signature === expectedSignature;
    } catch (error) {
      console.error("Doku webhook verification failed:", error);
      return false;
    }
  }

  async processWebhook(payload: WebhookPayload): Promise<void> {
    const data = payload.data;
    const transactionStatus = data.transaction?.status;

    console.log("Processing Doku webhook:", {
      invoice_number: data.order?.invoice_number,
      status: transactionStatus,
    });

    if (transactionStatus === "SUCCESS") {
      await this.handleSuccessfulPayment(data);
    } else if (transactionStatus === "FAILED" || transactionStatus === "EXPIRED") {
      await this.handleFailedPayment(data);
    } else if (transactionStatus === "PENDING") {
      await this.handlePendingPayment(data);
    }
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const signature = this.generateSignature(transactionId, "");

      const response = await fetch(`${DOKU_BASE_URL}/v1/payment/status/${transactionId}`, {
        headers: {
          "Client-Id": this.clientId,
          "Signature": signature,
          "Request-Id": `status-${Date.now()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get Doku transaction status`);
      }

      const result = await response.json();
      const txStatus = result.transaction?.status;

      let status: "pending" | "success" | "failed" | "expired" = "pending";
      if (txStatus === "SUCCESS") {
        status = "success";
      } else if (txStatus === "FAILED") {
        status = "failed";
      } else if (txStatus === "EXPIRED") {
        status = "expired";
      }

      return {
        transactionId,
        status,
        amount: parseFloat(result.order?.amount || "0"),
        currency: "IDR",
        paymentMethod: this.mapPaymentMethod(result.payment?.payment_method),
        paidAt: status === "success" ? new Date(result.transaction?.transaction_time) : undefined,
        metadata: result.additional_info?.metadata,
      };
    } catch (error) {
      console.error("Failed to get Doku transaction status:", error);
      throw error;
    }
  }

  private generateSignature(invoiceNumber: string, amount: string): string {
    const stringToSign = `${this.clientId}${invoiceNumber}${amount}${this.sharedKey}`;
    return crypto.createHash("sha256").update(stringToSign).digest("hex");
  }

  private generateWebhookSignature(data: any): string {
    const stringToSign = JSON.stringify(data) + this.sharedKey;
    return crypto.createHash("sha256").update(stringToSign).digest("hex");
  }

  private async handleSuccessfulPayment(data: any): Promise<void> {
    console.log("Doku payment successful:", data.order?.invoice_number);
  }

  private async handleFailedPayment(data: any): Promise<void> {
    console.log("Doku payment failed:", data.order?.invoice_number);
  }

  private async handlePendingPayment(data: any): Promise<void> {
    console.log("Doku payment pending:", data.order?.invoice_number);
  }

  private mapPaymentMethod(paymentMethod: string): any {
    const mapping: Record<string, any> = {
      CREDIT_CARD: "credit_card",
      QRIS: "qris",
      BCA_VA: "bca_va",
      MANDIRI_VA: "mandiri_va",
      BNI_VA: "bni_va",
      PERMATA_VA: "permata_va",
      ALFAMART: "alfamart",
      INDOMARET: "indomaret",
    };
    return mapping[paymentMethod] || paymentMethod?.toLowerCase();
  }
}

// Export singleton instance
export const dokuGateway = new DokuGateway();
