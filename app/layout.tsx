import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

import { ThirdwebProvider } from "thirdweb/react";
import { WalletProvider } from "@/contexts/wallet-context";
import { AccountBalancesProvider } from "@/contexts/acount-balances-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PAZA Wallet",
  description: "Buy, Send and Receive PAZA tokens instantly",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icon-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-64x64.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: "/icon-180x180.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e2a3d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThirdwebProvider>
          <WalletProvider>
            <AccountBalancesProvider>{children}</AccountBalancesProvider>
          </WalletProvider>
        </ThirdwebProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
