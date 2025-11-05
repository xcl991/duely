import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Duely Logo" width={32} height={32} className="h-8 w-8" />
            <span className="text-xl font-bold">Duely</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-teal-50 text-teal-700 hover:bg-teal-100 h-9 px-4 py-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-teal-50/30 via-white to-teal-50/30">
        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-8 text-teal-900">Terms of Service</h1>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <p className="text-sm text-muted-foreground mb-6">
                Last updated: November 4, 2025
              </p>
              <p className="text-base text-gray-700 mb-4">
                Welcome to Duely. These Terms of Service govern your use of our subscription tracking service. By accessing or using Duely, you agree to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By creating an account or using our service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4">User Accounts</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To use Duely, you must:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Be at least 13 years of age</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">Account Security</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Subscription Service</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Free Tier</h3>
              <p className="text-gray-700 mb-4">
                Our free tier includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Track up to 3 subscriptions</li>
                <li>1 team member</li>
                <li>Basic subscription tracking features</li>
                <li>Email notifications</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">Premium Plans</h3>
              <p className="text-gray-700 mb-4">
                Premium plans offer additional features:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Unlimited subscription tracking</li>
                <li>Multiple team members</li>
                <li>Advanced analytics and insights</li>
                <li>Budget management tools</li>
                <li>Priority support</li>
                <li>Custom categories and tags</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Payment and Billing</h2>
              <p className="text-gray-700 mb-4">
                By subscribing to a paid plan, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide accurate payment information</li>
                <li>Automatic renewal unless cancelled</li>
                <li>Pay all applicable fees and taxes</li>
                <li>Our refund policy as stated separately</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We reserve the right to change our pricing with 30 days notice to existing subscribers. Price changes will not affect your current billing cycle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">User Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Use the service for any illegal purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Transmit malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated systems to access the service without permission</li>
                <li>Resell or redistribute the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content, features, and functionality of Duely are owned by us and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700 mb-4">
                You retain ownership of your subscription data. By using our service, you grant us a license to use your data solely to provide and improve our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Data and Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your use of Duely is also governed by our Privacy Policy. We collect, use, and protect your data as described in our Privacy Policy.
              </p>
              <p className="text-gray-700">
                You can export or delete your data at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Service Availability</h2>
              <p className="text-gray-700 mb-4">
                We strive to provide reliable service, but we cannot guarantee:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Uninterrupted or error-free service</li>
                <li>Complete security of data transmission</li>
                <li>Specific uptime guarantees for free tier users</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We may perform maintenance and updates that temporarily affect service availability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, Duely shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Service interruptions or data loss</li>
                <li>Third-party actions or content</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Termination</h2>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time through your account settings.
              </p>
              <p className="text-gray-700 mb-4">
                We may suspend or terminate your account if you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent activity</li>
                <li>Fail to pay applicable fees</li>
                <li>Use the service in a manner that harms us or other users</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Upon termination, your right to use the service will immediately cease. We may delete your data after a reasonable period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Modifications to Service</h2>
              <p className="text-gray-700">
                We reserve the right to modify or discontinue the service (or any part thereof) at any time, with or without notice. We will not be liable for any modification, suspension, or discontinuance of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these Terms from time to time. We will notify you of significant changes by email or through the service. Continued use of the service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-teal-600 font-medium mt-2">
                support@duely.app
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-teal-50/30 to-white py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Duely Logo" width={20} height={20} className="h-5 w-5" />
              <span className="font-semibold text-teal-900">Duely</span>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              © 2025 Duely. All rights reserved.
            </div>
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
