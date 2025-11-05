import { NextResponse } from "next/server";
import { fetchAndStoreExchangeRates } from "@/lib/utils/exchange-rate";

/**
 * API Route to fetch and update exchange rates
 * Can be called manually or via cron job
 *
 * GET /api/exchange-rates/update
 */
export async function GET() {
  try {
    console.log("Fetching exchange rates...");

    // Fetch rates for USD as base currency
    const usdResult = await fetchAndStoreExchangeRates("USD");

    if (!usdResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: usdResult.error || "Failed to fetch exchange rates",
        },
        { status: 500 }
      );
    }

    // Also fetch rates for IDR as base (untuk reverse conversion)
    const idrResult = await fetchAndStoreExchangeRates("IDR");

    const response = {
      success: true,
      message: "Exchange rates updated successfully",
      timestamp: new Date().toISOString(),
      rates: {
        USD: usdResult.rates,
        IDR: idrResult.success ? idrResult.rates : undefined,
      },
    };

    console.log("Exchange rates updated successfully");

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating exchange rates:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST method for manual triggers (optional)
 */
export async function POST() {
  return GET();
}
