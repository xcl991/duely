"use client";

import { useState, useEffect } from "react";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pricingPlans, formatPrice } from "@/lib/pricing";
import { toast } from "sonner";
import { upgradePlan, getCurrentUserPlan } from "@/app/actions/subscription-plan";

export default function PlansDashboardPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentPlan, setCurrentPlan] = useState("free");
  const [currentStatus, setCurrentStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    try {
      setIsLoading(true);
      const result = await getCurrentUserPlan();
      if (result.success) {
        setCurrentPlan(result.plan || "free");
        setCurrentStatus(result.status || "active");
      }
    } catch (error) {
      console.error("Error loading plan:", error);
      toast.error("Failed to load current plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return;

    try {
      setIsUpgrading(true);
      const result = await upgradePlan({
        planId,
        billingCycle,
      });

      if (result.success) {
        toast.success(result.message);
        setCurrentPlan(planId);
        setCurrentStatus(result.status || "active");
      } else {
        toast.error(result.error || "Failed to upgrade plan");
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing Plans</h1>
        <p className="text-muted-foreground mt-2">
          Choose the perfect plan for your subscription management needs
        </p>
      </div>

      {/* Current Plan Badge */}
      <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-teal-600" />
          <div>
            <p className="font-semibold text-teal-900">Your Current Plan</p>
            <p className="text-sm text-teal-700">
              You are currently on the <strong className="capitalize">{currentPlan}</strong> plan
              {currentStatus === "trial" && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Trial</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm"
                : "text-gray-700 hover:text-teal-600"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === "yearly"
                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm"
                : "text-gray-700 hover:text-teal-600"
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? "border-teal-500 border-2 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md">
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white shadow-md">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price[billingCycle], plan.currency)}
                    </span>
                    {plan.price[billingCycle] > 0 && (
                      <span className="ml-2 text-gray-500 text-sm">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    )}
                  </div>
                  {billingCycle === "yearly" && plan.price.yearly > 0 && (
                    <p className="text-sm text-teal-600 mt-1">
                      {formatPrice(plan.price.yearly / 12, plan.currency)}/month billed annually
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-teal-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {plan.id === "business" ? (
                  <a href="mailto:sales@duely.app?subject=Business Plan Inquiry" className="w-full">
                    <Button
                      className="w-full border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                      variant="outline"
                    >
                      {plan.buttonText}
                    </Button>
                  </a>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan || isUpgrading || isLoading}
                    className={`w-full ${
                      plan.buttonVariant === "default"
                        ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                        : "border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                    } ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}`}
                    variant={plan.buttonVariant}
                  >
                    {isLoading ? "Loading..." : isUpgrading ? "Upgrading..." : isCurrentPlan ? "Current Plan" : plan.buttonText}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately for upgrades, or at the end of your billing period for downgrades.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, and local Indonesian payment methods for your convenience.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes! Pro plan comes with a 14-day free trial. No credit card required to start your trial.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day money-back guarantee. If you're not satisfied with Duely, we'll refund your payment, no questions asked.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-teal-900 mb-2">
              Need help choosing a plan?
            </h3>
            <p className="text-teal-700 mb-4">
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
