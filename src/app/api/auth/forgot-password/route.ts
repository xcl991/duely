import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        {
          error: "No account found with this email address",
          userExists: false
        },
        { status: 404 }
      );
    }

    // Check if user has password (not OAuth-only account)
    if (!user.password) {
      return NextResponse.json(
        {
          error: "This account uses Google sign-in. Please use 'Sign in with Google' instead.",
          userExists: true
        },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in VerificationToken table
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: resetToken,
        expires: resetTokenExpiry,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // Send email via Resend
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      resetLink,
      userName: user.name || undefined,
    });

    // If email service is not configured, show link in console
    if (!emailResult.success) {
      console.log("\n=================================");
      console.log("PASSWORD RESET REQUEST");
      console.log("=================================");
      console.log(`User: ${user.email}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log(`Token expires in: 1 hour`);
      console.log("=================================\n");
    }

    return NextResponse.json(
      {
        message: "Password reset link has been sent to your email.",
        userExists: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
