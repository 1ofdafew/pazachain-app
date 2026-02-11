"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { WalletSelector } from "../wallet-selector";
import { WalletType } from "@/contexts/wallet-context";

const QRCode = dynamic(
  () => import("react-qrcode-logo").then((mod) => mod.QRCode),
  {
    ssr: false,
    loading: () => (
      <div className="w-40 h-40 bg-muted animate-pulse rounded-lg" />
    ),
  },
);

interface ReceiveTabProps {
  address: string;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: (provider: WalletType) => void;
}

export function ReceiveTab({
  address,
  isConnected,
  isConnecting,
  onConnect,
}: ReceiveTabProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="bg-white rounded-xl p-3">
          {mounted ? (
            <QRCode
              value={address || "..."}
              size={160}
              bgColor="#FFFFFF"
              fgColor="#1e293b"
              qrStyle="dots"
              logoImage="/paza-logo.png"
              logoWidth={36}
              logoHeight={36}
              logoPadding={3}
              logoPaddingStyle="circle"
              removeQrCodeBehindLogo={true}
              eyeRadius={[
                { outer: 8, inner: 2 },
                { outer: 8, inner: 2 },
                { outer: 8, inner: 2 },
              ]}
              eyeColor="#3B82F6"
            />
          ) : (
            <div className="w-40 h-40 bg-muted animate-pulse rounded-lg" />
          )}
        </div>
        <div className="text-center space-y-2 w-full">
          <p className="text-sm text-muted-foreground">Your Wallet Address</p>
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 bg-secondary rounded-lg px-4 py-3 w-full transition-colors hover:bg-secondary/80 active:scale-[0.98]"
          >
            <code className="text-sm text-foreground break-all px-0">
              {address || "..."}
            </code>
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4 text-primary" />
            )}
          </button>
          {copied && <p className="text-xs text-primary">Address copied!</p>}
        </div>
        {!isConnected && (
          <WalletSelector
            onSelectWallet={onConnect}
            isConnecting={isConnecting}
            buttonClassName="w-full"
          />
        )}
      </div>
    </div>
  );
}
