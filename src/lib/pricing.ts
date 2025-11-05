export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  buttonVariant: "default" | "outline";
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out Duely",
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: "IDR",
    features: [
      "Up to 3 subscriptions",
      "Up to 1 member",
      "Basic subscription tracking",
      "Email notifications",
      "Mobile responsive",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Best for individuals and small teams",
    price: {
      monthly: 49000,
      yearly: 490000, // ~2 months free
    },
    currency: "IDR",
    features: [
      "Unlimited subscriptions",
      "Advanced analytics & insights",
      "Custom categories",
      "Priority email support",
      "Export to CSV/PDF",
      "Multi-currency support",
      "Spending insights & reports",
    ],
    highlighted: true,
    buttonText: "Start Pro Trial",
    buttonVariant: "default",
  },
  {
    id: "business",
    name: "Business",
    description: "For teams and organizations",
    price: {
      monthly: 99000,
      yearly: 990000, // ~2 months free
    },
    currency: "IDR",
    features: [
      "Everything in Pro",
      "Team collaboration (up to 10 users)",
      "Shared subscription management",
      "Advanced reporting",
      "API access",
      "Priority support (24/7)",
      "Custom integrations",
      "Dedicated account manager",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
];

export function formatPrice(amount: number, currency: string = "IDR"): string {
  if (amount === 0) return "Free";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
