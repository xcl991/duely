import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  getGateway,
  isProviderAvailable,
  getAvailableProviders,
  type PaymentProvider,
} from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, provider } = body;

    if (!planId || !provider) {
      return NextResponse.json(
        { error: "Missing required fields: planId, provider" },
        { status: 400 }
      );
    }

    // Validate provider is available
    if (!isProviderAvailable(provider as PaymentProvider)) {
      const availableProviders = getAvailableProviders();
      return NextResponse.json(
        {
          error: `Provider '${provider}' is not configured. Available providers: ${availableProviders.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email!;
    const userName = session.user.name || undefined;

    // Base URLs for success and cancel
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    // Use unified payment gateway factory
    const gateway = getGateway(provider as PaymentProvider);
    const checkoutResponse = await gateway.createCheckout({
      provider: provider as PaymentProvider,
      userId,
      userEmail,
      userName,
      planId,
      successUrl,
      cancelUrl,
      metadata: {
        createdAt: new Date().toISOString(),
        source: "web",
      },
    });

    return NextResponse.json({
      provider: checkoutResponse.provider,
      checkoutUrl: checkoutResponse.checkoutUrl,
      transactionId: checkoutResponse.transactionId,
      expiresAt: checkoutResponse.expiresAt,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}
