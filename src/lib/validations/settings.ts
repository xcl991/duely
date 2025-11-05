import { z } from "zod";

export const settingsSchema = z.object({
  currency: z.string().min(3).max(3).default("USD"),
  language: z.enum(["en", "id"]).default("en"),
  emailReminders: z.boolean().default(true),
  reminderDaysBefore: z.number().int().min(1).max(30).default(3),
  weeklyDigest: z.boolean().default(false),
  monthlyBudgetLimit: z.number().positive().nullable().optional(),
  monthlyBudgetCurrency: z.string().nullable().optional(),
});

export const updateSettingsSchema = settingsSchema.partial();

export type SettingsFormData = z.infer<typeof settingsSchema>;
export type UpdateSettingsData = z.infer<typeof updateSettingsSchema>;
