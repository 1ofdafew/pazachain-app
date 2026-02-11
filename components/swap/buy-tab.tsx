"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TransactionResult } from "./transaction-result";
import {
  generateTxHash,
  Stablecoin,
  STABLECOIN_CONTRACTS,
  STABLECOIN_NAMES,
} from "./types";
import { useAccountBalances } from "@/contexts/acount-balances-context";
import { WalletSelector } from "../wallet-selector";
import { WalletType } from "@/contexts/wallet-context";
import { chain, formatCurrency, PAZAOpenSaleContract } from "@/lib/thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { parseUnits } from "ethers";
import { prepareContractCall } from "thirdweb";
import { base } from "thirdweb/chains";

interface BuyTabProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: (provider: WalletType) => void;
}

export function BuyTab({ isConnected, isConnecting, onConnect }: BuyTabProps) {
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [isPayTokenMenuOpen, setIsPayTokenMenuOpen] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [buyTxResult, setBuyTxResult] = useState<{
    message: string;
    txHash: string;
  } | null>(null);

  const {
    usdtBalance,
    usdcBalance,
    pusdBalance,
    refresh: refreshBalances,
  } = useAccountBalances();

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  const stableCoinOptions = [
    { type: Stablecoin.PUSD, balance: pusdBalance },
    { type: Stablecoin.USDT, balance: usdtBalance },
    { type: Stablecoin.USDC, balance: usdcBalance },
  ];

  // default balance to usdt balance
  const [currentBalance, setCurrentBalance] = useState<string>(usdtBalance);
  const [selectedStableCoin, setSelectedStableCoin] = useState<Stablecoin>(
    Stablecoin.USDT,
  );

  // purchasing
  const [txMessage, setTxMessage] = useState("Processing...");
  const [transactionStatus, setTransactionStatus] = useState<
    "success" | "error" | "idle"
  >("idle");
  const [notice, setNotice] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");

  const stableCoinName = STABLECOIN_NAMES[selectedStableCoin];

  const rate = 0.017; // 1 PAZA = 0.017 PUSD

  const hasInsufficientBalance = () => {
    if (!payAmount || payAmount === "0" || payAmount === "") return false;

    const amountNum = parseFloat(payAmount);
    return (
      isNaN(amountNum) ||
      amountNum <= 0 ||
      amountNum > parseFloat(currentBalance)
    );
  };

  const checkForBalance = () => {
    if (parseFloat(payAmount) > parseFloat(currentBalance)) {
      toast(`Insufficient ${stableCoinName} balance`, {
        description: `You have ${currentBalance} ${stableCoinName} but tried to spend ${payAmount} ${stableCoinName}`,
        style: {
          background: "#451a03",
          border: "1px solid #b45309",
          color: "#fbbf24",
        },
      });
    }
    return;
  };

  const handlePayAmountChange = (value: string) => {
    setPayAmount(value);
    if (value && !isNaN(Number(value))) {
      setReceiveAmount((Number(value) / rate).toFixed(2));
    } else {
      setReceiveAmount("");
    }
  };

  const { mutateAsync: sendTransaction } = useSendTransaction();
  const handlePurchase = async () => {
    const val = parseFloat(payAmount);
    if (!val || val < 5 || val > parseFloat(currentBalance)) return;

    setIsTransacting(true);
    try {
      setTxMessage(`Approving ${stableCoinName} spending...`);
      const approvalAmount = parseUnits(payAmount, 6);
      await sendTransaction(
        prepareContractCall({
          contract: STABLECOIN_CONTRACTS[selectedStableCoin],
          method:
            "function approve(address spender, uint256 amount) returns (bool)",
          params: [PAZAOpenSaleContract.address, approvalAmount],
        }),
      );
      setTxMessage(
        `${stableCoinName} spend approved. Proceeding to purchase...`,
      );

      // 2. Buy the tokens
      const result = await sendTransaction(
        prepareContractCall({
          contract: PAZAOpenSaleContract,
          method: "function buy(uint256 stablecoinAmount, uint8 stablecoin)",
          params: [approvalAmount, selectedStableCoin],
        }),
      );
      // setNoticeMessage(
      //   `Successfully purchased PAZA tokens worth ${payAmount} ${stableCoinName}!`
      // );
      // setNotice(true);
      // setTxMessage("");

      // 3. show the hash
      setBuyTxResult({
        message: `Successfully purchased PAZA tokens worth ${payAmount} ${stableCoinName}!`,
        txHash: result.transactionHash,
      });

      setPayAmount("");
      setTransactionStatus("success");
      await Promise.all([refreshBalances()]);
    } catch (error) {
      console.error("Token purchase failed:", error);
      setTransactionStatus("error");
      setNoticeMessage(`Transaction failed: ${error}`);
      setNotice(true);
    } finally {
      // setTimeout(() => setTxMessage(""), 5000);
      setTxMessage("");
      setTimeout(() => {
        setTransactionStatus("idle");
        setNotice(false);
        setNoticeMessage("");
      }, 7000);
      setIsTransacting(false);
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
              <span className="text-xs ">
                {formatCurrency(Number(currentBalance), 2)}
              </span>
              <button
                className="text-xs text-primary font-medium"
                onClick={() =>
                  handlePayAmountChange(currentBalance.replace(/,/g, ""))
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
                    {selectedStableCoin === Stablecoin.PUSD
                      ? "$"
                      : selectedStableCoin === Stablecoin.USDT
                        ? "T"
                        : "C"}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {stableCoinName}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${isPayTokenMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isPayTokenMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[180px]">
                  {stableCoinOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => {
                        setSelectedStableCoin(option.type);
                        setCurrentBalance(option.balance);
                        setIsPayTokenMenuOpen(false);
                      }}
                      className={`flex items-center justify-between w-full gap-x-4 px-3 py-2.5 hover:bg-secondary transition-colors ${
                        selectedStableCoin === Stablecoin.PUSD
                          ? "bg-secondary"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary-foreground">
                            {option.type === Stablecoin.PUSD
                              ? "$"
                              : option.type === Stablecoin.USDT
                                ? "T"
                                : "C"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {STABLECOIN_NAMES[option.type]}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(Number(option.balance), 2)}
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
              type="text"
              placeholder="0.00"
              value={formatCurrency(parseFloat(receiveAmount), 2)}
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
          <span className="text-xs text-foreground">1 PAZA = ${rate}</span>
        </div>

        {/* tx status */}
        {notice && noticeMessage !== "" && transactionStatus !== "idle" && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg my-4 ${
              transactionStatus === "success"
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : "bg-destructive/10 text-shadow-amber-400 border border-destructive/20"
            }`}
          >
            {transactionStatus === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">
              {/* {transactionStatus === "success" ? { txMessage } : { txMessage }} */}
              {noticeMessage}
            </span>
          </div>
        )}

        {/* Action Button */}
        {!buyTxResult ? (
          <Button
            className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
            disabled={
              isTransacting ||
              hasInsufficientBalance() ||
              payAmount === "" ||
              parseFloat(payAmount) < 5
            }
            onClick={handlePurchase}
          >
            {isConnected ? (
              "Buy PAZA"
            ) : (
              <WalletSelector
                onSelectWallet={onConnect}
                isConnecting={isConnecting}
              />
            )}
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
