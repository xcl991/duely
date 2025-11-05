"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        // Give webhook some time to process
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsVerifying(false);
      } catch (err) {
        setError("Failed to verify payment");
        setIsVerifying(false);
      }
    };

    verify();
  }, []);

  if (isVerifying) {
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
                <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
              Verifying Payment...
            </CardTitle>
            <CardDescription className="text-center text-base">
              Please wait while we confirm your payment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50/30 p-4">
        <Link
          href="/"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 text-teal-700 hover:text-teal-800 transition-colors"
        >
          <Image src="/logo.png" alt="Duely Logo" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="font-semibold text-sm sm:text-base">Duely</span>
        </Link>

        <Card className="w-full max-w-md shadow-xl border-red-100">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-red-600">
              Payment Verification Failed
            </CardTitle>
            <CardDescription className="text-center text-base">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Link
              href="/pricing"
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-11 px-8"
            >
              Back to Pricing
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
            <div className="rounded-full bg-gradient-to-br from-green-100 to-green-50 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-center text-base">
            Thank you for subscribing to Duely. Your account has been upgraded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-sm text-teal-900 text-center">
              Your subscription is now active and you can access all premium features.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-11 px-8"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/settings"
            className="text-sm text-center text-teal-600 hover:text-teal-700 font-medium hover:underline"
          >
            Manage Subscription
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
