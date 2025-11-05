"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Something went wrong!</CardTitle>
          <CardDescription className="text-center">
            An unexpected error has occurred. We apologize for the inconvenience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Error details:</strong>
            </p>
            <p className="text-sm font-mono bg-muted p-3 rounded-md overflow-auto max-h-32">
              {error.message || "Unknown error"}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/">Go to Homepage</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
