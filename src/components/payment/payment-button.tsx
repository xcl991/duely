"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentButtonProps {
  planId: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  disabled?: boolean;
}

export function PaymentButton({
  planId,
  label = "Subscribe",
  variant = "default",
  className,
  disabled = false,
}: PaymentButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showProviderChoice, setShowProviderChoice] = useState(false);

  const handleClick = async () => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      toast.error("Please sign in to subscribe");
      router.push("/auth/login?callbackUrl=/pricing");
      return;
    }

    if (status === "loading") {
      return;
    }

    // Show provider choice
    setShowProviderChoice(true);
  };

  const handleProviderSelect = async (provider: "midtrans" | "doku") => {
    setIsLoading(true);
    setShowProviderChoice(false);

    try {
      const response = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to checkout page
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  if (showProviderChoice) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-center font-medium text-gray-700 mb-2">
          Pilih Metode Pembayaran:
        </p>
        <Button
          onClick={() => handleProviderSelect("midtrans")}
          disabled={isLoading}
          className="w-full bg-[#FF5F6D] hover:bg-[#FF4757] text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Midtrans - QRIS / E-Wallet / Virtual Account / Kartu Kredit
            </>
          )}
        </Button>
        <Button
          onClick={() => handleProviderSelect("doku")}
          disabled={isLoading}
          variant="outline"
          className="w-full border-[#FF6B00] text-[#FF6B00] hover:bg-orange-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Doku - QRIS / Virtual Account / Alfamart / Indomaret
            </>
          )}
        </Button>
        <Button
          onClick={() => setShowProviderChoice(false)}
          variant="ghost"
          size="sm"
          className="text-gray-600"
        >
          Batal
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading || status === "loading"}
      variant={variant}
      className={className}
    >
      {isLoading || status === "loading" ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
