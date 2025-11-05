"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to error tracking service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-xl">Error Loading Dashboard</CardTitle>
          </div>
          <CardDescription>
            We encountered an issue while loading this page. This might be a temporary problem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Error Message:</p>
            <p className="text-sm font-mono text-muted-foreground">
              {error.message || "An unexpected error occurred"}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold mb-1">What you can try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Refresh the page</li>
              <li>Go back to the homepage</li>
              <li>Try again in a few moments</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex space-x-2">
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <a href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
