import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SessionProvider from "@/components/providers/session-provider";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSyncProvider } from "@/components/providers/language-sync-provider";
import LanguageDetector from "@/components/providers/language-detector";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Duely - Subscription Tracker",
  description: "Track your subscriptions, manage budgets, and gain insights into your spending.",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <LanguageProvider>
            <LanguageDetector />
            <LanguageSyncProvider>
              <SidebarProvider>
                {children}
                <Toaster />
              </SidebarProvider>
            </LanguageSyncProvider>
          </LanguageProvider>
        </SessionProvider>

        {/* Service Worker Registration for Push Notifications */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('Service Worker registered:', registration.scope);
                  })
                  .catch(function(error) {
                    console.error('Service Worker registration failed:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
