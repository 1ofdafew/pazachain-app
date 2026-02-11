"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { WalletConnectModal } from "./wallet-connect-modal";
import { BuyTab } from "./swap/buy-tab";
import { SendTab } from "./swap/send-tab";
import { ReceiveTab } from "./swap/receive-tab";
import { useAccountBalances } from "@/contexts/acount-balances-context";
import { useWallet } from "@/contexts/wallet-context";
import { TokenOptionsType } from "./swap/types";

interface SwapCardProps {
  activeTab: "buy" | "send" | "receive";
  onTabChange: (tab: "buy" | "send" | "receive") => void;
}

export function SwapCard({ activeTab, onTabChange }: SwapCardProps) {
  // const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { address, isConnected, isConnecting, connectWallet } = useWallet();

  return (
    <>
      <Card className="bg-card border-border overflow-hidden min-h-[520px]">
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
              isConnecting={isConnecting}
              onConnect={connectWallet}
            />
          )}

          {activeTab === "send" && (
            <SendTab
              isConnected={isConnected}
              isConnecting={isConnecting}
              onConnect={connectWallet}
            />
          )}

          {activeTab === "receive" && (
            <ReceiveTab
              address={address}
              isConnected={isConnected}
              isConnecting={isConnecting}
              onConnect={connectWallet}
            />
          )}
        </div>
      </Card>
    </>
  );
}
