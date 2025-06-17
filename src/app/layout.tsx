import "@/styles/globals.css";

import { type Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "./_components/theme-provider";
import { Toaster } from 'sonner'
import AppLayout from "./_components/common/DashboardLayout";
import { AuthProvider } from './_components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: "Essentials Studio",
  description: "Essentials Studio",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
            <AuthProvider>
              <ProtectedRoute>
                {children}
              </ProtectedRoute>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
