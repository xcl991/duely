"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

export async function registerUser(data: RegisterFormData) {
  try {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Check if user already exists (email or username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return {
          success: false,
          error: "User with this email already exists",
        };
      }
      if (existingUser.username === validatedData.username) {
        return {
          success: false,
          error: "Username is already taken",
        };
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    // Create default primary member for the user
    await prisma.member.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        isPrimary: true,
        avatarColor: "#3b82f6", // Blue color
      },
    });

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    console.error("Registration error:", error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as any;
      const firstError = zodError.errors?.[0];
      if (firstError?.message) {
        return {
          success: false,
          error: firstError.message,
        };
      }
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
