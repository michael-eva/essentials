import "@/styles/globals.css";

import { type Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "./_components/theme-provider";
import { Toaster } from 'sonner'
import { SessionProvider } from '@/contexts/SessionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SharedLayout from './_components/SharedLayout';


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
            <SessionProvider>
              <ProtectedRoute>
                <SharedLayout>
                  {children}
                </SharedLayout>
              </ProtectedRoute>
            </SessionProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
