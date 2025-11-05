"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, DollarSign } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
              <div className="rounded-full bg-gradient-to-br from-green-100 to-green-50 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
              Password Reset Successfully!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Your password has been changed. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Link
              href="/auth/login"
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-11 px-8"
            >
              Sign In
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
        <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
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
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center text-base">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={6}
                className="h-11 focus-visible:ring-teal-500"
              />
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
                minLength={6}
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
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
            <Link
              href="/auth/login"
              className="text-sm text-center text-teal-600 hover:text-teal-700 font-medium hover:underline"
            >
              Back to Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
