"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDown,
  ChevronDown,
  Scan,
  X,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

const QRCode = dynamic(
  () => import("react-qrcode-logo").then((mod) => mod.QRCode),
  {
    ssr: false,
    loading: () => (
      <div className="w-[160px] h-[160px] bg-muted animate-pulse rounded-lg" />
    ),
  },
);

// Generate mock transaction hash
function generateTxHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function TransactionResult({
  message,
  txHash,
  onDismiss,
}: {
  message: string;
  txHash: string;
  onDismiss: () => void;
}) {
  const explorerUrl = `https://bscscan.com/tx/${txHash}`;
  const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

  return (
    <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">
          Transaction Submitted
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <span>View on Explorer: {shortHash}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <Button
        variant="outline"
        className="w-full h-10 mt-2 border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
        onClick={onDismiss}
      >
        Done
      </Button>
    </div>
  );
}

interface SwapCardProps {
  activeTab: "buy" | "send" | "receive";
  onTabChange: (tab: "buy" | "send" | "receive") => void;
  isConnected: boolean;
  onConnect: () => void;
  pusdBalance?: string;
}

export function SwapCard({
  activeTab,
  onTabChange,
  isConnected,
  onConnect,
  pusdBalance = "0.00",
}: SwapCardProps) {
  // Parse balance (remove commas for numeric comparison)
  const numericBalance = Number.parseFloat(pusdBalance.replace(/,/g, ""));
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [buyTxResult, setBuyTxResult] = useState<{
    message: string;
    txHash: string;
  } | null>(null);

  const rate = 0.017; // 1 PAZA = 0.017 PUSD

  const handlePayAmountChange = (value: string) => {
    setPayAmount(value);
    if (value && !isNaN(Number(value))) {
      setReceiveAmount((Number(value) / rate).toFixed(2));
    } else {
      setReceiveAmount("");
    }
  };

  return (
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
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-2xl" />
            <div className="relative space-y-4">
              {/* You Pay */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You Pay</span>
                  <button
                    className="text-xs text-primary font-medium"
                    onClick={() => handlePayAmountChange("100")}
                  >
                    MAX
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-secondary rounded-xl p-3 ring-1 ring-primary/20">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={payAmount}
                    onChange={(e) => handlePayAmountChange(e.target.value)}
                    className="border-0 bg-transparent text-xl font-semibold text-foreground p-0 h-auto focus-visible:ring-0"
                  />
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">
                        $
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      PUSD
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center ring-1 ring-primary/30 shadow-lg shadow-primary/10">
                  <ArrowDown className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* You Receive */}
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">
                  You Receive
                </span>
                <div className="flex items-center gap-2 bg-secondary rounded-xl p-3 ring-1 ring-primary/20">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={receiveAmount}
                    readOnly
                    className="border-0 bg-transparent text-xl font-semibold text-foreground p-0 h-auto focus-visible:ring-0"
                  />
                  <div className="flex items-center gap-2 bg-primary/20 rounded-lg px-3 py-2 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">
                        P
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      PAZA
                    </span>
                  </div>
                </div>
              </div>

              {/* Rate */}
              <div className="flex items-center justify-between py-2 px-1">
                <span className="text-xs text-muted-foreground">Rate</span>
                <span className="text-xs text-foreground">
                  1 PAZA ≈ {rate} PUSD
                </span>
              </div>

              {/* Action Button */}
              {!buyTxResult ? (
                <Button
                  className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                  onClick={
                    isConnected
                      ? () => {
                          if (!payAmount || Number(payAmount) <= 0) {
                            toast.error("Please enter an amount");
                            return;
                          }
                          if (Number(payAmount) > numericBalance) {
                            toast("Insufficient PUSD balance", {
                              description: `You have ${pusdBalance} PUSD but tried to spend ${payAmount} PUSD`,
                              style: {
                                background: "#451a03",
                                border: "1px solid #b45309",
                                color: "#fbbf24",
                              },
                            });
                            return;
                          }
                          const txHash = generateTxHash();
                          setBuyTxResult({
                            message: `Buying ${receiveAmount} PAZA for ${payAmount} PUSD`,
                            txHash,
                          });
                        }
                      : onConnect
                  }
                >
                  {isConnected ? "Buy PAZA" : "Connect Wallet to Buy"}
                </Button>
              ) : (
                <TransactionResult
                  message={buyTxResult.message}
                  txHash={buyTxResult.txHash}
                  onDismiss={() => {
                    setBuyTxResult(null);
                    setPayAmount("");
                    setReceiveAmount("");
                  }}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "send" && (
          <SendTab isConnected={isConnected} onConnect={onConnect} />
        )}

        {activeTab === "receive" && (
          <ReceiveTab isConnected={isConnected} onConnect={onConnect} />
        )}
      </div>
    </Card>
  );
}

type TokenType = "PAZA" | "PUSD";

function SendTab({
  isConnected,
  onConnect,
}: {
  isConnected: boolean;
  onConnect: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType>("PAZA");
  const [isTokenMenuOpen, setIsTokenMenuOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [sendTxResult, setSendTxResult] = useState<{
    message: string;
    txHash: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    setScanError(null);
    setIsScanning(true);

    // Wait for DOM to render the scanner container
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
        },
        (decodedText) => {
          // Clean the address (remove any ethereum: prefix if present)
          const cleanAddress = decodedText
            .replace(/^ethereum:/i, "")
            .split("@")[0];
          setRecipient(cleanAddress);
          stopScanner();
        },
        () => {
          // QR code not found - ignore silently
        },
      );
    } catch (err) {
      setScanError("Camera access denied or not available");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Ignore errors when stopping
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {isScanning ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Scan QR Code</span>
            <button
              onClick={stopScanner}
              className="flex items-center gap-1 text-xs text-destructive font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
          <div
            ref={scannerContainerRef}
            className="relative rounded-xl overflow-hidden bg-black"
          >
            <div id="qr-reader" className="w-full" />
          </div>
          {scanError && (
            <p className="text-xs text-destructive text-center">{scanError}</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Recipient Address
              </span>
              <button
                onClick={startScanner}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                <Scan className="w-4 h-4" />
                Scan QR
              </button>
            </div>
            <Input
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="bg-secondary border-0 h-12 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <button className="text-xs text-primary font-medium">MAX</button>
            </div>
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-3">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-0 bg-transparent text-xl font-semibold text-foreground p-0 h-auto focus-visible:ring-0"
              />
              <div className="relative">
                <button
                  onClick={() => setIsTokenMenuOpen(!isTokenMenuOpen)}
                  className="flex items-center gap-2 bg-primary/20 rounded-lg px-3 py-2 shrink-0 hover:bg-primary/30 transition-colors"
                >
                  {selectedToken === "PAZA" ? (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">
                        P
                      </span>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">
                        $
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {selectedToken}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isTokenMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isTokenMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                    <button
                      onClick={() => {
                        setSelectedToken("PAZA");
                        setIsTokenMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2.5 hover:bg-secondary transition-colors ${selectedToken === "PAZA" ? "bg-secondary" : ""}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          P
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        PAZA
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedToken("PUSD");
                        setIsTokenMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2.5 hover:bg-secondary transition-colors ${selectedToken === "PUSD" ? "bg-secondary" : ""}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          $
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        PUSD
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!sendTxResult ? (
            <Button
              className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={
                isConnected
                  ? () => {
                      if (!recipient) {
                        toast.error("Please enter a recipient address");
                        return;
                      }
                      if (!amount || Number(amount) <= 0) {
                        toast.error("Please enter an amount");
                        return;
                      }
                      const txHash = generateTxHash();
                      setSendTxResult({
                        message: `Sending ${amount} ${selectedToken} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
                        txHash,
                      });
                    }
                  : onConnect
              }
            >
              {isConnected ? `Send ${selectedToken}` : "Connect Wallet to Send"}
            </Button>
          ) : (
            <TransactionResult
              message={sendTxResult.message}
              txHash={sendTxResult.txHash}
              onDismiss={() => {
                setSendTxResult(null);
                setAmount("");
                setRecipient("");
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function ReceiveTab({
  isConnected,
  onConnect,
}: {
  isConnected: boolean;
  onConnect: () => void;
}) {
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
            <div className="w-[160px] h-[160px] bg-muted animate-pulse rounded-lg" />
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
