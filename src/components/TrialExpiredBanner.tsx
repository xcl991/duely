"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TrialExpiredBannerProps {
  endDate: string;
}

export default function TrialExpiredBanner({
  endDate,
}: TrialExpiredBannerProps) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Trial Expired</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Your trial ended on {new Date(endDate).toLocaleDateString()}. Upgrade
          now to continue using Duely.
        </span>
        <Link href="/plans">
          <Button size="sm" variant="outline" className="bg-background">
            Upgrade Now
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
