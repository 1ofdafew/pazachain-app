"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { WalletConnectModal } from "./wallet-connect-modal";
import { BuyTab } from "./swap/buy-tab";
import { SendTab } from "./swap/send-tab";
import { ReceiveTab } from "./swap/receive-tab";
import type { TokenBalances } from "./swap/types";

interface SwapCardProps {
  activeTab: "buy" | "send" | "receive";
  onTabChange: (tab: "buy" | "send" | "receive") => void;
}

export function SwapCard({
  activeTab,
  onTabChange,
  isConnected,
  onConnect,
  pusdBalance = "0.00",
}: SwapCardProps) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const tokenBalances: TokenBalances = {
    PUSD: pusdBalance,
    USDT: "1,250.00",
    USDC: "850.50",
    PAZA: "1,000.00",
  };

  const handleWalletSelect = (walletId: string) => {
    onConnect();
  };

  const handleConnect = () => setIsWalletModalOpen(true);

  return (
    <>
      <Card className="bg-card border-border overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          {(["buy", "send", "receive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {activeTab === "buy" && (
            <BuyTab
              isConnected={isConnected}
              onConnect={handleConnect}
              tokenBalances={tokenBalances}
              pusdBalance={pusdBalance}
            />
          )}

          {activeTab === "send" && (
            <SendTab isConnected={isConnected} onConnect={handleConnect} />
          )}

          {activeTab === "receive" && (
            <ReceiveTab isConnected={isConnected} onConnect={handleConnect} />
          )}
        </div>
      </Card>

      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleWalletSelect}
      />
    </>
  );
}
