"use client";

import { useState } from "react";
import { WalletHeader } from "@/components/wallet-header";
import { SwapCard } from "@/components/swap-card";
import { StepsSection } from "@/components/steps-section";
import { WalletBanner } from "@/components/wallet-banner";
import { useWallet } from "@/contexts/wallet-context";
import { useAccountBalances } from "@/contexts/acount-balances-context";

export default function PazaWallet() {
  // const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"buy" | "send" | "receive">("buy");
  // const [walletAddress, setWalletAddress] = useState<string>();
  // const [pusdBalance, setPusdBalance] = useState<string>("0.00");
  // const [usdtBalance, setUsdtBalance] = useState<string>("0.00"); // Declare usdtBalance variable

  const {
    address,
    isConnecting,
    isConnected,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const { pusdBalance } = useAccountBalances();

  const handleConnect = () => {
    // Simulate wallet connection
    // setIsConnected(ttue);
    // setWalletAddress(address);
    // setPusdBalance("100.00"); // Simulated balance
    // setUsdtBalance("500.25"); // Simulated USDT balance
  };

  const handleDisconnect = () => {
    // setIsConnected(false);
    // setWalletAddress(undefined);
    // setUsdtBalance("0.00"); // Reset USDT balance on disconnect
  };

  return (
    <div className="min-h-screen bg-background">
      <WalletHeader />
      {/* isConnected
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        address={address}
        pusdBalance={pusdBalance}
      /> */}

      <main className="px-4 py-4 pb-8 lg:px-0 lg:py-0">
        {/* Desktop Hero Layout */}
        <div className="hidden lg:block relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-primary/5" />

          {/* Glowing orbs - More prominent */}
          <div className="absolute top-20 right-40 w-150 h-150 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-20 left-40 w-125 h-125 bg-primary/15 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          />

          {/* Grid pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-40"
            xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse">
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Floating hexagons - More visible */}
          <svg
            className="absolute top-32 right-48 w-80 h-80 opacity-30 animate-float"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100">
            <defs>
              <linearGradient id="hexGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <polygon
              points="50 1 95 25 95 75 50 99 5 75 5 25"
              fill="url(#hexGrad1)"
              stroke="#3B82F6"
              strokeWidth="1.5"
              opacity="0.4"
            />
            <polygon
              points="50 15 80 30 80 70 50 85 20 70 20 30"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1"
              opacity="0.6"
            />
          </svg>

          <svg
            className="absolute bottom-48 left-32 w-64 h-64 opacity-25 animate-float-delayed"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100">
            <defs>
              <linearGradient id="hexGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <polygon
              points="50 1 95 25 95 75 50 99 5 75 5 25"
              fill="url(#hexGrad2)"
              stroke="#3B82F6"
              strokeWidth="1.5"
              opacity="0.35"
            />
          </svg>

          {/* Concentric circles - Pulsating */}
          <svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-225 opacity-20 animate-circle-pulse"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1"
              opacity="0.3">
              <animate
                attributeName="r"
                values="90;95;90"
                dur="4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.5;0.3"
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1"
              opacity="0.4">
              <animate
                attributeName="r"
                values="70;74;70"
                dur="3.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.4;0.6;0.4"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="100"
              cy="100"
              r="50"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1.5"
              opacity="0.5">
              <animate
                attributeName="r"
                values="50;53;50"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.5;0.7;0.5"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="100"
              cy="100"
              r="30"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1"
              opacity="0.3">
              <animate
                attributeName="r"
                values="30;33;30"
                dur="2.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.5;0.3"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>

          <div className="relative max-w-7xl mx-auto px-8 py-20 min-h-[calc(100vh-4rem)]">
            <div className="grid grid-cols-2 gap-16 items-center">
              {/* Left Column - Hero Content */}
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-primary">
                      Web3 Wallet Integration
                    </span>
                  </div>

                  <h1 className="text-6xl font-bold text-foreground leading-tight text-balance">
                    Buy, Send & Receive{" "}
                    <span className="text-primary bg-linear-to-r from-primary to-primary/60 bg-clip-text">
                      PAZA
                    </span>{" "}
                    Tokens
                  </h1>

                  <p className="text-xl text-muted-foreground leading-relaxed text-pretty max-w-xl">
                    The fastest and easiest way to manage your PAZA tokens.
                    Connect your wallet and start transacting instantly on the
                    blockchain.
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-foreground">
                      1:0.017
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Exchange Rate
                    </span>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-foreground">
                      Instant
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Transactions
                    </span>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-foreground">
                      Secure
                    </span>
                    <span className="text-sm text-muted-foreground">
                      On-Chain
                    </span>
                  </div>
                </div>

                <StepsSection />
              </div>

              {/* Right Column - Swap Card */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md">
                  <WalletBanner isConnected={isConnected} />
                  <SwapCard activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
              </div>
            </div>

            <footer className="absolute bottom-8 left-8 right-8 text-center">
              <p className="text-sm text-muted-foreground">
                Powered by PAZA Chain
              </p>
            </footer>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden max-w-md mx-auto space-y-4">
          <WalletBanner isConnected={isConnected} />

          <SwapCard activeTab={activeTab} onTabChange={setActiveTab} />

          <StepsSection />

          <footer className="pt-4 pb-safe text-center">
            <p className="text-xs text-muted-foreground">
              Powered by PAZA Chain
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
