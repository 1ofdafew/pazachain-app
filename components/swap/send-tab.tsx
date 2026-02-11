"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Scan, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { TransactionResult } from "./transaction-result";
import { generateTxHash, TokenOptionsType, TokenType } from "./types";
import { WalletSelector } from "../wallet-selector";
import { WalletType } from "@/contexts/wallet-context";
import {
  formatCurrency,
  PAZATokenContract,
  PUSDTokenContract,
  USDCTokenContract,
  USDTTokenContract,
} from "@/lib/thirdweb";
import { useAccountBalances } from "@/contexts/acount-balances-context";
import { useSendTransaction } from "thirdweb/react";
import { shortenAddress, shortenHex } from "thirdweb/utils";
import { parseUnits } from "ethers";
import { prepareContractCall } from "thirdweb";

interface SendTabProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: (provider: WalletType) => void;
}

export function SendTab({
  isConnected,
  isConnecting,
  onConnect,
}: SendTabProps) {
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

  // sending
  const [isTransacting, setIsTransacting] = useState(false);
  const [txMessage, setTxMessage] = useState("Processing...");
  const [transactionStatus, setTransactionStatus] = useState<
    "success" | "error" | "idle"
  >("idle");
  const [notice, setNotice] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");

  const {
    usdtBalance,
    usdcBalance,
    pusdBalance,
    pazaBalance,
    pazaFrozen,
    refresh: refreshBalances,
  } = useAccountBalances();

  // console.log(
  //   `PAZA: available - ${pazaAvailable}, balance - ${pazaBalance}, frozen: ${pazaFrozen}`
  // );

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  const tokenOptions: TokenOptionsType[] = [
    { type: "PUSD", balance: pusdBalance },
    { type: "USDT", balance: usdtBalance },
    { type: "USDC", balance: usdcBalance },
    { type: "PAZA", balance: `${Number(pazaBalance) - Number(pazaFrozen)}` },
  ];

  const tokenBalances = {
    ["PUSD"]: pusdBalance,
    ["USDT"]: usdtBalance,
    ["USDC"]: usdcBalance,
    ["PAZA"]: `${Number(pazaBalance) - Number(pazaFrozen)}`,
  };

  const tokenContracts = {
    ["PUSD"]: PUSDTokenContract,
    ["USDT"]: USDTTokenContract,
    ["USDC"]: USDCTokenContract,
    ["PAZA"]: PAZATokenContract,
  };

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

  const handleMaxAmount = () => {
    const max = tokenBalances[selectedToken];
    setAmount(max);
  };

  const hasInsufficientBalance = () => {
    if (!amount || amount === "0" || amount === "") return false;

    const amountNum = parseFloat(amount);
    return (
      isNaN(amountNum) ||
      amountNum <= 0 ||
      amountNum > parseFloat(tokenBalances[selectedToken])
    );
  };

  const { mutateAsync: sendTransaction } = useSendTransaction();
  const handleSendTokens = async () => {
    const val = parseFloat(amount);
    if (!val || val < 0 || !recipient || !amount) return;

    try {
      setIsTransacting(true);

      // do the send transaction logic here
      //
      const amountToSend = parseUnits(amount, 6);
      setTxMessage(
        `Sending ${val.toLocaleString()} ${selectedToken} to ${shortenHex(recipient, 4)}...`,
      );
      const txSend = await sendTransaction(
        prepareContractCall({
          contract: tokenContracts[selectedToken],
          method: "function transfer(address to, uint256 value) returns (bool)",
          params: [recipient, amountToSend],
        }),
      );
      // setTxHash("0x33f1ede39a8821cbfa6f716f2ab42b5ecc43b1b5683e0799e2ea3d8340a21365"); //txSend.transactionHash);
      // setTxHash(txSend.transactionHash);

      // setTxMessage(
      //   `Successfully sent ${amount} ${selectedToken} to ${recipient}!`
      // );
      setTransactionStatus("success");

      setSendTxResult({
        message: `Successfully sent ${amount} ${selectedToken} to ${shortenHex(recipient)}!`,
        txHash: txSend.transactionHash,
      });
      await Promise.all([refreshBalances()]);
    } catch (error) {
      setIsTransacting(false);
      setTransactionStatus("error");
    } finally {
      // Reset form
      setRecipient("");
      setAmount("");
      setIsTransacting(false);
      setTimeout(() => setTxMessage(""), 2000);
      setTimeout(() => setTransactionStatus("idle"), 10000);
    }
  };

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
              <div className="flex items-center gap-x-2">
                <span className="text-xs">
                  {formatCurrency(Number(tokenBalances[selectedToken]), 2)}
                </span>
                <button
                  className="text-xs text-primary font-medium"
                  onClick={handleMaxAmount}
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-3">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-0 bg-transparent text-base font-semibold text-foreground p-0 h-auto focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="relative">
                <button
                  onClick={() => setIsTokenMenuOpen(!isTokenMenuOpen)}
                  className="flex items-center gap-2 bg-primary/20 rounded-lg px-3 py-2 shrink-0 hover:bg-primary/30 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-foreground">
                      {selectedToken === "PAZA"
                        ? "P"
                        : selectedToken === "PUSD"
                          ? "$"
                          : selectedToken === "USDT"
                            ? "T"
                            : "C"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {selectedToken}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isTokenMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isTokenMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-30">
                    {tokenOptions.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => {
                          setSelectedToken(option.type);
                          setIsTokenMenuOpen(false);
                        }}
                        className={`flex items-center justify-between w-full gap-x-4 px-3 py-2.5 hover:bg-secondary transition-colors ${
                          selectedToken === "PAZA" ? "bg-secondary" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary-foreground">
                              {option.type === "PAZA"
                                ? "P"
                                : option.type === "PUSD"
                                  ? "$"
                                  : option.type === "USDT"
                                    ? "T"
                                    : "C"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {option.type}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground text-right pl-2">
                          {formatCurrency(Number(option.balance), 2)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
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

          {!sendTxResult ? (
            <Button
              className="mt-4 w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={
                !recipient ||
                recipient === "" ||
                !amount ||
                amount === "" ||
                Number(amount) <= 0 ||
                hasInsufficientBalance() ||
                isTransacting
              }
              onClick={handleSendTokens}
              // if (!recipient) {
              //   toast.error("Please enter a recipient address");
              //   return;
              // }
              // if (!amount || Number(amount) <= 0) {
              //   toast.error("Please enter an amount");
              //   return;
              // }
              // const txHash = generateTxHash();
              // setSendTxResult({
              //   message: `Sending ${amount} ${selectedToken} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
              //   txHash,
              // });
              // }}
            >
              {isConnected ? (
                `Send ${selectedToken}`
              ) : (
                <>
                  <WalletSelector
                    onSelectWallet={onConnect}
                    isConnecting={isConnecting}
                  />
                </>
              )}
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
