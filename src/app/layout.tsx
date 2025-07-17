import "@/styles/globals.css";

import { type Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "./_components/theme-provider";
import { SessionProvider } from '@/contexts/SessionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SharedLayout from './_components/SharedLayout';

import { PWAProvider } from '@/components/pwa/PWAProvider';

export const metadata: Metadata = {
  title: "Essentials Studio",
  description: "Your personal fitness companion with AI-powered workout plans and progress tracking",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/logo/essentials_logo.png" },
  ],
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Essentials",
  },
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
          <ThemeProvider defaultTheme="light" storageKey="app-theme">
            <SessionProvider>
              <ProtectedRoute>
                <SharedLayout>
                  {children}
                </SharedLayout>
              </ProtectedRoute>
            </SessionProvider>
            <PWAProvider />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
