"use client";

import { useState } from "react";
import { WalletHeader } from "@/components/wallet-header";
import { SwapCard } from "@/components/swap-card";
import { StepsSection } from "@/components/steps-section";
import { WalletBanner } from "@/components/wallet-banner";

export default function PazaWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"buy" | "send" | "receive">("buy");
  const [walletAddress, setWalletAddress] = useState<string>();
  const [pusdBalance, setPusdBalance] = useState<string>("0.00");
  const [usdtBalance, setUsdtBalance] = useState<string>("0.00"); // Declare usdtBalance variable

  const handleConnect = () => {
    // Simulate wallet connection
    setIsConnected(true);
    setWalletAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f8dE8A");
    setPusdBalance("100.00"); // Simulated balance
    setUsdtBalance("500.25"); // Simulated USDT balance
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(undefined);
    setUsdtBalance("0.00"); // Reset USDT balance on disconnect
  };

  return (
    <div className="min-h-screen bg-background">
      <WalletHeader
        isConnected={isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        address={walletAddress}
        pusdBalance={pusdBalance}
      />

      <main className="px-4 py-4 pb-8 max-w-md mx-auto space-y-4">
        <WalletBanner isConnected={isConnected} />

        <SwapCard
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isConnected={isConnected}
          onConnect={handleConnect}
          pusdBalance={pusdBalance}
        />

        <StepsSection />

        {/* Footer */}
        <footer className="pt-4 pb-safe text-center">
          <p className="text-xs text-muted-foreground">Powered by PAZA Chain</p>
        </footer>
      </main>
    </div>
  );
}
