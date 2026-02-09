"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Scan, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { TransactionResult } from "./transaction-result";
import { generateTxHash } from "./types";
import type { TokenType } from "./types";

interface SendTabProps {
  isConnected: boolean;
  onConnect: () => void;
}

export function SendTab({ isConnected, onConnect }: SendTabProps) {
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
    } catch {
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
                className="border-0 bg-transparent text-xl font-semibold text-foreground p-0 h-auto focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-30">
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
              {isConnected
                ? `Send ${selectedToken}`
                : "Connect Wallet to Send"}
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
