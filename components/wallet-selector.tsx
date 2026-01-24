"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet as WalletIcon, Apple, Chrome, Key, Shield } from "lucide-react";
import type { WalletType } from "@/contexts/wallet-context";

interface WalletSelectorProps {
  onSelectWallet: (provider: WalletType) => void;
  isConnecting: boolean;
  buttonLabel?: string; // Custom text
  buttonClassName?: string; // Additional custom classes
  hideLabel?: boolean;
}

const walletOptions = [
  {
    id: "apple" as WalletType,
    name: "Apple",
    description: "Sign in with Apple",
    icon: Apple,
    bgColor: "bg-gray-900/10",
    iconColor: "text-gray-900 dark:text-gray-100",
    category: "social",
  },
  {
    id: "google" as WalletType,
    name: "Google",
    description: "Sign in with Google",
    icon: Chrome,
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-600",
    category: "social",
  },
  {
    id: "passkey" as WalletType,
    name: "Passkey",
    description: "Use device passkey",
    icon: Key,
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-600",
    category: "social",
  },
  {
    id: "metamask" as WalletType,
    name: "MetaMask",
    description: "Browser extension",
    bgColor: "bg-orange-500/10",
    customIcon: (
      <svg className="w-6 h-6" viewBox="0 0 318.6 318.6" fill="none">
        <path
          d="M274.1 35.5l-99.5 73.9 18.4-43.6z"
          fill="#E2761B"
          stroke="#E2761B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zm111.3 0l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5l33.9 16.5-4.7-39.3z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    category: "crypto",
  },
  {
    id: "base" as WalletType,
    name: "Base",
    description: "Coinbase L2",
    bgColor: "bg-blue-600/10",
    customIcon: (
      <svg className="w-6 h-6" viewBox="0 0 111 111" fill="none">
        <path
          d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
          fill="#0052FF"
        />
      </svg>
    ),
    category: "crypto",
  },
  {
    id: "binance" as WalletType,
    name: "Binance",
    description: "Binance Chain",
    bgColor: "bg-yellow-500/10",
    customIcon: (
      <svg className="w-6 h-6" viewBox="0 0 126.61 126.61" fill="none">
        <path
          fill="#F3BA2F"
          d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0l-38.9 38.9zm-24.58 24.6l14.3-14.31 14.31 14.3-14.3 14.32zM38.73 103.4l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88zm63.18-25.6l14.3-14.31 14.31 14.3-14.3 14.32z"
        />
        <path
          fill="#F3BA2F"
          d="M77.83 63.3L63.32 48.78 52.61 59.5l-3.46 3.46-.34.34 14.51 14.52 14.51-14.52z"
        />
      </svg>
    ),
    category: "crypto",
  },
  {
    id: "safe" as WalletType,
    name: "Safe",
    description: "Multi-sig wallet",
    icon: Shield,
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    category: "crypto",
  },
];

export function WalletSelector({
  onSelectWallet,
  isConnecting,
  buttonLabel = "Connect Wallet",
  buttonClassName = "",
  hideLabel = false,
}: WalletSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (provider: WalletType) => {
    setOpen(false);
    onSelectWallet(provider);
  };

  const socialWallets = walletOptions.filter((w) => w.category === "social");
  const cryptoWallets = walletOptions.filter((w) => w.category === "crypto");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={"sm"}
          disabled={isConnecting}
          className={`gap-2 h-11 px-4 ${buttonClassName}`}>
          <WalletIcon className="w-4 h-4" />
          {buttonLabel && (
            <span
              className={`ml-2 ${hideLabel ? "hidden sm:inline" : "inline"}`}>
              {isConnecting ? "Connecting..." : buttonLabel}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-scroll ">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-xl">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose how you&apos;d like to connect
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Social Login Section */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
              Social Login
            </h3>
            <div className="grid gap-2">
              {socialWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleSelect(wallet.id)}
                  disabled={isConnecting}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <div
                    className={`w-10 h-10 rounded-lg ${wallet.bgColor} flex items-center justify-center shrink-0`}>
                    {wallet.icon && (
                      <wallet.icon className={`w-5 h-5 ${wallet.iconColor}`} />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm text-foreground">
                      {wallet.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {wallet.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Crypto Wallets Section */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
              Crypto Wallets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {cryptoWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleSelect(wallet.id)}
                  disabled={isConnecting}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <div
                    className={`w-12 h-12 rounded-lg ${wallet.bgColor} flex items-center justify-center shrink-0`}>
                    {wallet.customIcon ? (
                      wallet.customIcon
                    ) : wallet.icon ? (
                      <wallet.icon className={`w-6 h-6 ${wallet.iconColor}`} />
                    ) : null}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="font-medium text-sm text-foreground">
                      {wallet.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {wallet.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
