import Link from "next/link";
import { ArrowRight, BarChart3, Bell, Users } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Duely Logo" width={32} height={32} className="h-8 w-8" />
            <span className="text-xl font-bold">Duely</span>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 h-9 px-4 py-2"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 h-9 px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-teal-600 text-white shadow hover:bg-teal-700 h-9 px-4 py-2"
            >
              Get Started
            </Link>
          </div>
          {/* Mobile Navigation */}
          <div className="flex sm:hidden items-center space-x-2">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-teal-50 text-teal-700 hover:bg-teal-100 h-9 px-3"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-teal-50 text-teal-700 hover:bg-teal-100 h-9 px-3"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-teal-600 text-white shadow hover:bg-teal-700 h-9 px-3"
            >
              Start
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Track Your Subscriptions
              <span className="block text-teal-600 mt-2">All in One Place</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground px-4">
              Never miss a payment. Manage your subscriptions, set budgets, and get insights
              into your spending habits with Duely.
            </p>
            {/* Desktop Hero Buttons */}
            <div className="mt-10 hidden sm:flex justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-teal-700 transform hover:scale-105 h-11 rounded-lg px-8"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 border-2 border-teal-600 bg-transparent text-teal-700 shadow-sm hover:bg-teal-50 hover:text-teal-800 h-11 rounded-lg px-8"
              >
                Sign In
              </Link>
            </div>
            {/* Mobile Hero Buttons */}
            <div className="mt-8 flex sm:hidden flex-col gap-3 px-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium transition-all bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg hover:shadow-xl active:scale-95 h-12 rounded-lg px-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center text-sm font-medium transition-colors border-2 border-teal-600 text-teal-700 hover:bg-teal-50 active:bg-teal-100 h-12 rounded-lg px-6"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gradient-to-b from-teal-50/50 to-white py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-center text-2xl sm:text-3xl font-bold mb-8 sm:mb-12">Features</h2>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 p-3 sm:p-4 mb-4 shadow-sm">
                  <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-teal-600" />
                </div>
                <h3 className="font-semibold mb-2 text-base sm:text-lg">Smart Reminders</h3>
                <p className="text-sm text-muted-foreground px-2">
                  Get notified before your subscriptions renew
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 p-3 sm:p-4 mb-4 shadow-sm">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-teal-600" />
                </div>
                <h3 className="font-semibold mb-2 text-base sm:text-lg">Analytics</h3>
                <p className="text-sm text-muted-foreground px-2">
                  Visualize your spending with detailed charts
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 p-3 sm:p-4 mb-4 shadow-sm">
                  <Image src="/dollar-icon.png" alt="Budget" width={28} height={28} className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-semibold mb-2 text-base sm:text-lg">Budget Tracking</h3>
                <p className="text-sm text-muted-foreground px-2">
                  Set budgets and stay within your limits
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 p-3 sm:p-4 mb-4 shadow-sm">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-teal-600" />
                </div>
                <h3 className="font-semibold mb-2 text-base sm:text-lg">Family Members</h3>
                <p className="text-sm text-muted-foreground px-2">
                  Track subscriptions for your whole family
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-teal-50/30 to-white py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Duely Logo" width={20} height={20} className="h-5 w-5" />
              <span className="font-semibold text-teal-900">Duely</span>
            </div>
            {/* Copyright */}
            <div className="text-center text-sm text-muted-foreground">
              © 2025 Duely. All rights reserved.
            </div>
            {/* Links (Optional) */}
            <div className="flex items-center gap-4 text-sm">
              <Link href="/privacy" className="text-teal-600 hover:text-teal-700 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-teal-600 hover:text-teal-700 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
