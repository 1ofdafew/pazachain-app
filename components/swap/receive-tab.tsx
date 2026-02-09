"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

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
  isConnected: boolean;
  onConnect: () => void;
}

export function ReceiveTab({ isConnected, onConnect }: ReceiveTabProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fullAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f8dE8A";
  const displayAddress = `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = fullAddress;
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
              value={fullAddress}
              size={160}
              bgColor="#FFFFFF"
              fgColor="#1e293b"
              qrStyle="squares"
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
          <p className="text-sm text-muted-foreground">Your PAZA Address</p>
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 bg-secondary rounded-lg px-4 py-3 w-full transition-colors hover:bg-secondary/80 active:scale-[0.98]"
          >
            <code className="text-sm text-foreground">{displayAddress}</code>
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4 text-primary" />
            )}
          </button>
          {copied && <p className="text-xs text-primary">Address copied!</p>}
        </div>
        {!isConnected && (
          <div className="w-full pt-2">
            <Button
              className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onConnect}
            >
              Connect Wallet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
