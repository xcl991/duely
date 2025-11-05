import { z } from "zod";

/**
 * Schema for creating a new category
 */
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  budgetLimit: z
    .number()
    .positive("Budget limit must be positive")
    .nullable()
    .optional(),
  budgetCurrency: z.string().nullable().optional(),
});

/**
 * Schema for updating an existing category
 */
export const updateCategorySchema = categorySchema.extend({
  id: z.string().min(1, "Category ID is required"),
});

/**
 * Type definitions
 */
export type CategoryFormData = z.infer<typeof categorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
