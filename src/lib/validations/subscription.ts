import { z } from "zod";

/**
 * Subscription validation schema with comprehensive field validation
 */
export const subscriptionSchema = z.object({
  serviceName: z
    .string()
    .trim()
    .min(1, "Service name is required")
    .max(100, "Service name is too long"),

  serviceIcon: z.string().optional(),

  amount: z
    .number()
    .positive("Amount must be positive")
    .max(100000000, "Amount is too large (max 100,000,000)"),

  currency: z
    .string()
    .refine((val) => ["USD", "EUR", "GBP", "JPY", "IDR", "CAD", "AUD", "INR", "KRW"].includes(val), {
      message: "Invalid currency",
    }),

  billingFrequency: z.enum(["monthly", "yearly", "quarterly", "weekly"]),

  categoryId: z.string().optional().nullable(),

  memberId: z.string().optional().nullable(),

  startDate: z.date(),

  nextBilling: z.date(),

  status: z.enum(["active", "trial", "paused", "canceled"]),

  notes: z.string().max(500, "Notes are too long").optional().nullable(),
}).refine(
  (data) => {
    // Ensure next billing is after start date
    return data.nextBilling >= data.startDate;
  },
  {
    message: "Next billing date must be after start date",
    path: ["nextBilling"],
  }
);

/**
 * Update subscription schema - all fields optional except ID
 */
export const updateSubscriptionSchema = z.object({
  id: z.string().min(1, "Subscription ID is required"),
  serviceName: z.string().trim().min(1).max(100).optional(),
  serviceIcon: z.string().optional(),
  amount: z.number().positive().max(100000000).optional(),
  currency: z.string().optional(),
  billingFrequency: z.enum(["monthly", "yearly", "quarterly", "weekly"]).optional(),
  categoryId: z.string().optional().nullable(),
  memberId: z.string().optional().nullable(),
  startDate: z.date().optional(),
  nextBilling: z.date().optional(),
  status: z.enum(["active", "trial", "paused", "canceled"]).optional(),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * Filter subscription schema for search and filtering
 */
export const subscriptionFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  memberId: z.string().optional(),
  status: z.enum(["active", "trial", "paused", "canceled", "all"]).optional(),
  billingFrequency: z.enum(["monthly", "yearly", "quarterly", "weekly", "all"]).optional(),
  sortBy: z.enum(["serviceName", "amount", "nextBilling", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Type exports
export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
export type UpdateSubscriptionData = z.infer<typeof updateSubscriptionSchema>;
export type SubscriptionFilterData = z.infer<typeof subscriptionFilterSchema>;
