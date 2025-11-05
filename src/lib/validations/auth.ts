import { z } from "zod";

// Email validation with sanitization
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .max(255, "Email is too long");

// Password validation with security requirements
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password is too long")
  .refine((password) => {
    // Check for at least one letter and one number for better security
    return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  }, "Password must contain at least one letter and one number");

// Name validation with sanitization (prevent XSS)
const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name is too long")
  .regex(/^[a-zA-Z0-9\s'-]+$/, "Please use alphabets and numbers only. Special characters are not allowed")
  .transform((name) => {
    // Capitalize first letter of each word
    return name.replace(/\b\w/g, (char) => char.toUpperCase());
  });

// Username validation (alphanumeric, underscore, hyphen only)
const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username is too long")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens");

export const loginSchema = z.object({
  emailOrUsername: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"), // Don't validate password format on login
});

export const registerSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
