"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const walletOptions: WalletOption[] = [
  { id: "google", name: "Google", icon: "G", color: "bg-red-500" },
  { id: "apple", name: "Apple", icon: "A", color: "bg-gray-900" },
  { id: "passkey", name: "Passkey", icon: "P", color: "bg-blue-600" },
  { id: "metamask", name: "MetaMask", icon: "M", color: "bg-orange-500" },
  { id: "base", name: "Base", icon: "B", color: "bg-blue-700" },
  { id: "binance", name: "Binance", icon: "B", color: "bg-yellow-500" },
  { id: "tokenpocket", name: "TokenPocket", icon: "TP", color: "bg-blue-500" },
  { id: "safe", name: "Safe", icon: "S", color: "bg-green-600" },
  { id: "trust", name: "Trust", icon: "TW", color: "bg-blue-400" },
];

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletId: string) => void;
}

export function WalletConnectModal({
  isOpen,
  onClose,
  onSelectWallet,
}: WalletConnectModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Connect Wallet
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose your preferred wallet
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Wallet Options */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-2">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => {
                  onSelectWallet(wallet.id);
                  onClose();
                }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-secondary/50 transition-all group"
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl ${wallet.color} text-white font-bold text-lg shrink-0`}
                >
                  {wallet.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {wallet.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connect with {wallet.name}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <p className="text-xs text-center text-muted-foreground">
            By connecting a wallet, you agree to PAZA Chain&apos;s{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
