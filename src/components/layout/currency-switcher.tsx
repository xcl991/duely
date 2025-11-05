"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getUserSettings, updateUserSettings, getExchangeRatesForCurrencies } from "@/app/actions/settings";
import { toast } from "sonner";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

export function CurrencySwitcher() {
  const router = useRouter();
  const [currentCurrency, setCurrentCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number | null>>({});

  useEffect(() => {
    loadCurrency();
  }, []);

  useEffect(() => {
    if (currentCurrency) {
      loadExchangeRates();
    }
  }, [currentCurrency]);

  const loadCurrency = async () => {
    try {
      const settings = await getUserSettings();
      setCurrentCurrency(settings.currency);
    } catch (error) {
      console.error("Failed to load currency:", error);
    }
  };

  const loadExchangeRates = async () => {
    try {
      const currencyCodes = CURRENCIES.map(c => c.code);
      const rates = await getExchangeRatesForCurrencies(currencyCodes, currentCurrency);
      setExchangeRates(rates);
    } catch (error) {
      console.error("Failed to load exchange rates:", error);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    if (newCurrency === currentCurrency) return;

    try {
      setIsLoading(true);
      const result = await updateUserSettings({
        currency: newCurrency,
      });

      if (result.success) {
        setCurrentCurrency(newCurrency);
        toast.success(`Currency changed to ${newCurrency}`);
        // Refresh all server components to update currency display
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update currency");
      }
    } catch (error) {
      console.error("Error changing currency:", error);
      toast.error("Failed to change currency");
    } finally {
      setIsLoading(false);
    }
  };

  const currentCurrencyObj = CURRENCIES.find((c) => c.code === currentCurrency);

  const formatRate = (rate: number | null) => {
    if (!rate) return "";

    // For large numbers (IDR, KRW), show without decimals
    if (rate >= 100) {
      return rate.toLocaleString("en-US", {
        maximumFractionDigits: 0
      });
    }

    // For small numbers, show 2-4 decimals
    return rate.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10"
          disabled={isLoading}
        >
          <DollarSign className="h-5 w-5" />
          <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-background rounded px-1">
            {currentCurrencyObj?.symbol || "$"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Select Currency</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CURRENCIES.map((currency) => {
          const rate = exchangeRates[currency.code];
          const isCurrentCurrency = currency.code === currentCurrency;

          return (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => handleCurrencyChange(currency.code)}
              className={`cursor-pointer ${
                isCurrentCurrency
                  ? "bg-accent font-medium"
                  : ""
              }`}
            >
              <div className="flex-1 flex flex-col">
                <span className="text-sm">{currency.name}</span>
                {!isCurrentCurrency && rate && (
                  <span className="text-xs text-muted-foreground">
                    1 {currency.code} = {formatRate(rate)} {currentCurrency}
                  </span>
                )}
                {isCurrentCurrency && (
                  <span className="text-xs text-muted-foreground">
                    Current
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground ml-2">{currency.code}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
