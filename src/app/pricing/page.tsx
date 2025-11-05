"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingPlans, formatPrice } from "@/lib/pricing";
import { PaymentButton } from "@/components/payment/payment-button";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50/30">
      {/* Header/Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-teal-700 hover:text-teal-800 transition-colors">
              <Image src="/logo.png" alt="Duely Logo" width={24} height={24} className="h-6 w-6" />
              <span className="font-semibold text-lg">Duely</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-teal-600">
                Pricing
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your subscription management needs. Upgrade, downgrade, or cancel anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border border-teal-100">
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
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? "border-teal-500 border-2 shadow-xl scale-105"
                  : "border-gray-200 shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">{plan.description}</CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      {formatPrice(plan.price[billingCycle], plan.currency)}
                    </span>
                    {plan.price[billingCycle] > 0 && (
                      <span className="ml-2 text-gray-500">
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
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                {plan.id === "free" ? (
                  <Link href="/auth/register" className="w-full">
                    <Button
                      className="w-full h-11 border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                      variant="outline"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                ) : plan.id === "business" ? (
                  <a href="mailto:sales@duely.app?subject=Business Plan Inquiry" className="w-full">
                    <Button
                      className="w-full h-11 border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                      variant="outline"
                    >
                      {plan.buttonText}
                    </Button>
                  </a>
                ) : (
                  <PaymentButton
                    planId={`${plan.id}_${billingCycle === "monthly" ? "monthly" : "yearly"}`}
                    label={plan.buttonText}
                    className={`w-full h-11 ${
                      plan.buttonVariant === "default"
                        ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg"
                        : "border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                    }`}
                  />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately for upgrades, or at the end of your billing period for downgrades.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We support Indonesian payment methods including QRIS, e-wallets (GoPay, ShopeePay, OVO), Virtual Accounts (BCA, Mandiri, BNI, BRI), credit cards, and retail stores (Alfamart, Indomaret) through Midtrans and Doku.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes! Pro plan comes with a 14-day free trial. No credit card required to start your trial.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you're not satisfied with Duely, we'll refund your payment, no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to take control of your subscriptions?
            </h2>
            <p className="text-teal-50 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already saving money and staying organized with Duely.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all h-12 px-8 text-lg font-semibold"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image src="/logo.png" alt="Duely Logo" width={20} height={20} className="h-5 w-5" />
              <span className="font-semibold text-gray-900">Duely</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2025 Duely. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
