"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
  updateSettingsSchema,
  type UpdateSettingsData,
} from "@/lib/validations/settings";
import { getExchangeRate } from "@/lib/utils/exchange-rate";

export type UserSettingsData = {
  id: string;
  userId: string;
  currency: string;
  language: string;
  emailReminders: boolean;
  reminderDaysBefore: number;
  weeklyDigest: boolean;
  monthlyBudgetLimit: number | null;
  monthlyBudgetCurrency: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get user settings (create default if not exists)
 */
export async function getUserSettings(): Promise<UserSettingsData> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Try to get existing settings
  let settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  // Create default settings if not exists
  if (!settings) {
    // Verify user exists in database before creating settings
    const userExists = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

    if (!userExists) {
      throw new Error(`User with ID ${user.id} not found in database`);
    }

    settings = await prisma.userSettings.create({
      data: {
        userId: user.id,
        currency: "IDR",
        language: "en",
        emailReminders: true,
        reminderDaysBefore: 3,
        weeklyDigest: false,
        monthlyBudgetLimit: null,
        monthlyBudgetCurrency: "IDR",
      },
    });
  }

  return settings;
}

/**
 * Update user settings
 */
export async function updateUserSettings(data: UpdateSettingsData) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate input
    const validatedData = updateSettingsSchema.parse(data);

    // Get or create settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      // Verify user exists in database before creating settings
      const userExists = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true },
      });

      if (!userExists) {
        return {
          success: false,
          error: `User with ID ${user.id} not found in database`,
        };
      }

      // Create with default values + provided data
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          currency: validatedData.currency ?? "IDR",
          language: validatedData.language ?? "en",
          emailReminders: validatedData.emailReminders ?? true,
          reminderDaysBefore: validatedData.reminderDaysBefore ?? 3,
          weeklyDigest: validatedData.weeklyDigest ?? false,
          monthlyBudgetLimit: validatedData.monthlyBudgetLimit ?? null,
          monthlyBudgetCurrency: validatedData.monthlyBudgetCurrency ?? "IDR",
        },
      });
    } else {
      // Update existing settings
      settings = await prisma.userSettings.update({
        where: { userId: user.id },
        data: validatedData,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return {
      success: true,
      data: settings,
      message: "Settings updated successfully",
    };
  } catch (error) {
    console.error("Update settings error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update settings",
    };
  }
}

/**
 * Reset settings to default
 */
export async function resetSettings() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        currency: "IDR",
        language: "en",
        emailReminders: true,
        reminderDaysBefore: 3,
        weeklyDigest: false,
        monthlyBudgetLimit: null,
        monthlyBudgetCurrency: "IDR",
      },
      create: {
        userId: user.id,
        currency: "IDR",
        language: "en",
        emailReminders: true,
        reminderDaysBefore: 3,
        weeklyDigest: false,
        monthlyBudgetLimit: null,
        monthlyBudgetCurrency: "IDR",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return {
      success: true,
      data: settings,
      message: "Settings reset to default",
    };
  } catch (error) {
    console.error("Reset settings error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to reset settings",
    };
  }
}

/**
 * Get exchange rates for multiple currencies
 * @param currencyCodes - Array of currency codes to get rates for
 * @param targetCurrency - The currency to convert to
 * @returns Record of currency code to exchange rate
 */
export async function getExchangeRatesForCurrencies(
  currencyCodes: string[],
  targetCurrency: string
): Promise<Record<string, number | null>> {
  const rates: Record<string, number | null> = {};

  for (const currencyCode of currencyCodes) {
    if (currencyCode === targetCurrency) {
      // Same currency, rate is 1
      rates[currencyCode] = 1;
    } else {
      // Fetch the rate from database
      const rate = await getExchangeRate(currencyCode, targetCurrency);
      rates[currencyCode] = rate;
    }
  }

  return rates;
}
