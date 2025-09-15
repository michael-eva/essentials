import "@/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "./_components/theme-provider";
import { SessionProvider } from '@/contexts/SessionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SharedLayout from './_components/SharedLayout';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import ClarityProvider from "./_components/ClarityProvider";

export const metadata: Metadata = {
  title: "Essentials Studio",
  description: "Your personal fitness companion with AI-powered workout plans and progress tracking",
  icons: [
    { rel: "icon", type: "image/x-icon", url: "/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes: "48x48", url: "/favicon-48x48.png" },
    { rel: "apple-touch-icon", sizes: "192x192", url: "/icons/icon-192x192.png" },
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Essentials",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Essentials",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <TRPCReactProvider>
          <ClarityProvider />
          <SessionProvider>
            <ThemeProvider defaultTheme="light" storageKey="app-theme">
              <ProtectedRoute>
                <SharedLayout>
                  {children}
                </SharedLayout>
              </ProtectedRoute>
              <PWAProvider />
            </ThemeProvider>
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
