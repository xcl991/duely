"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid email or password. Please try again.";
      case "OAuthSignin":
        return "Error signing in with OAuth provider.";
      case "OAuthCallback":
        return "Error handling OAuth callback.";
      case "OAuthCreateAccount":
        return "Could not create OAuth account.";
      case "EmailCreateAccount":
        return "Could not create email account.";
      case "Callback":
        return "Error in callback.";
      case "OAuthAccountNotLinked":
        return "Email already exists with different provider.";
      case "EmailSignin":
        return "Error sending email.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An error occurred during authentication.";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center text-muted-foreground">
            If this problem persists, please contact support.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/register">Create Account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
