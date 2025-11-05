import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-center mb-8 text-teal-900">Privacy Policy</h1>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <p className="text-sm text-muted-foreground mb-6">
                Last updated: November 4, 2025
              </p>
              <p className="text-base text-gray-700 mb-4">
                At Duely, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our subscription tracking service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4">Information We Collect</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Personal Information</h3>
              <p className="text-gray-700 mb-4">
                When you register for an account, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Name and email address</li>
                <li>Username and password (encrypted)</li>
                <li>Profile information you choose to provide</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">Subscription Data</h3>
              <p className="text-gray-700 mb-4">
                To provide our service, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Subscription names and details</li>
                <li>Billing amounts and renewal dates</li>
                <li>Categories and custom notes</li>
                <li>Budget and spending information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide and maintain our subscription tracking service</li>
                <li>Send you notifications about upcoming renewals</li>
                <li>Generate spending analytics and insights</li>
                <li>Improve our service and develop new features</li>
                <li>Communicate with you about updates and support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>All data is encrypted in transit using SSL/TLS</li>
                <li>Passwords are hashed using industry-standard algorithms</li>
                <li>Access to personal data is restricted to authorized personnel only</li>
                <li>We regularly update our security practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share your information only:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who help us operate our service (under strict confidentiality agreements)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Maintain your session</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Children's Privacy</h2>
              <p className="text-gray-700">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-900 mb-4 mt-8">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-teal-600 font-medium mt-2">
                privacy@duely.app
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
