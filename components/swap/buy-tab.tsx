"use client";

import { useState } from "react";
import { ArrowDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TransactionResult } from "./transaction-result";
import { generateTxHash } from "./types";
import type { TokenType, TokenBalances } from "./types";

interface BuyTabProps {
  isConnected: boolean;
  onConnect: () => void;
  tokenBalances: TokenBalances;
  pusdBalance: string;
}

export function BuyTab({
  isConnected,
  onConnect,
  tokenBalances,
  pusdBalance,
}: BuyTabProps) {
  const numericBalance = Number.parseFloat(pusdBalance.replace(/,/g, ""));
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [selectedPayToken, setSelectedPayToken] = useState<TokenType>("PUSD");
  const [isPayTokenMenuOpen, setIsPayTokenMenuOpen] = useState(false);
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
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-2xl" />
      <div className="relative space-y-4">
        {/* You Pay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">You Pay</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Balance: {tokenBalances[selectedPayToken]}
              </span>
              <button
                className="text-xs text-primary font-medium"
                onClick={() =>
                  handlePayAmountChange(
                    tokenBalances[selectedPayToken].replace(/,/g, ""),
                  )
                }
              >
                MAX
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-secondary rounded-xl p-3 ring-1 ring-primary/20">
            <Input
              type="number"
              placeholder="0.00"
              value={payAmount}
              onChange={(e) => handlePayAmountChange(e.target.value)}
              className="border-0 bg-transparent text-xl font-semibold text-foreground p-0 h-auto focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="relative">
              <button
                onClick={() => setIsPayTokenMenuOpen(!isPayTokenMenuOpen)}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 shrink-0 hover:bg-muted/80 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">
                    {selectedPayToken === "PUSD"
                      ? "$"
                      : selectedPayToken === "USDT"
                        ? "T"
                        : "C"}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {selectedPayToken}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${isPayTokenMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isPayTokenMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[180px]">
                  {(["PUSD", "USDT", "USDC"] as const).map((token) => (
                    <button
                      key={token}
                      onClick={() => {
                        setSelectedPayToken(token);
                        setIsPayTokenMenuOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2.5 hover:bg-secondary transition-colors ${
                        selectedPayToken === token ? "bg-secondary" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary-foreground">
                            {token === "PUSD"
                              ? "$"
                              : token === "USDT"
                                ? "T"
                                : "C"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {token}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {tokenBalances[token]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
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
          <span className="text-sm text-muted-foreground">You Receive</span>
          <div className="flex items-center gap-2 bg-secondary rounded-xl p-3 ring-1 ring-primary/20">
            <Input
              type="number"
              placeholder="0.00"
              value={receiveAmount}
              readOnly
              className="border-0 bg-transparent text-xl font-semibold text-foreground p-0 h-auto focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex items-center gap-2 bg-primary/20 rounded-lg px-3 py-2 shrink-0">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">
                  P
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">PAZA</span>
            </div>
          </div>
        </div>

        {/* Rate */}
        <div className="flex items-center justify-between py-2 px-1">
          <span className="text-xs text-muted-foreground">Rate</span>
          <span className="text-xs text-foreground">1 PAZA = {rate} PUSD</span>
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
                      message: `Buying ${receiveAmount} PAZA for ${payAmount} ${selectedPayToken}`,
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
  );
}
