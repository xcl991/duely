import { z } from "zod";

/**
 * Schema for creating a new member
 */
export const memberSchema = z.object({
  name: z
    .string()
    .min(1, "Member name is required")
    .max(50, "Member name must be less than 50 characters"),
  avatarColor: z.string().nullable().optional(),
  avatarImage: z.string().nullable().optional(),
  isPrimary: z.boolean(),
});

/**
 * Schema for updating an existing member
 */
export const updateMemberSchema = memberSchema.extend({
  id: z.string().min(1, "Member ID is required"),
});

/**
 * Type definitions
 */
export type MemberFormData = z.infer<typeof memberSchema>;
export type UpdateMemberData = z.infer<typeof updateMemberSchema>;
