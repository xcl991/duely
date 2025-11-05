"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Password reset link sent! Check your email.");
      } else {
        // Show specific error message
        if (response.status === 404) {
          toast.error(data.error || "No account found with this email address");
        } else if (response.status === 400 && data.error.includes("Google")) {
          toast.error(data.error);
        } else {
          toast.error(data.error || "Something went wrong");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50/30 p-4">
        <Link
          href="/"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 text-teal-700 hover:text-teal-800 transition-colors"
        >
          <Image src="/logo.png" alt="Duely Logo" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="font-semibold text-sm sm:text-base">Duely</span>
        </Link>

        <Card className="w-full max-w-md shadow-xl border-teal-100">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-gradient-to-br from-teal-100 to-teal-50 p-3">
                <Image src="/logo.png" alt="Duely Logo" width={32} height={32} className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center text-base">
              We've sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>

            {/* Warning untuk check spam */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    Check Your Spam Folder
                  </p>
                  <p className="text-xs text-amber-800">
                    The email might be in your spam/junk folder. If you find it there, mark it as "Not Spam" to receive future emails in your inbox.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Didn't receive the email? Wait a few minutes or try again.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Link
              href="/auth/login"
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-11 px-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50/30 p-4">
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 text-teal-700 hover:text-teal-800 transition-colors"
      >
        <Image src="/logo.png" alt="Duely Logo" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="font-semibold text-sm sm:text-base">Duely</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-teal-100">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-gradient-to-br from-teal-100 to-teal-50 p-3">
              <Image src="/logo.png" alt="Duely Logo" width={32} height={32} className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-center text-base">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 focus-visible:ring-teal-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-11 px-8"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link
              href="/auth/login"
              className="text-sm text-center text-teal-600 hover:text-teal-700 font-medium hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
