"use client";

import { useState } from "react";
import { PazaLogo } from "./paza-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  ChevronDown,
} from "lucide-react";

interface WalletHeaderProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  address?: string;
  pusdBalance?: string;
}

export function WalletHeader({
  isConnected,
  onConnect,
  onDisconnect,
  address,
  pusdBalance = "0.00",
}: WalletHeaderProps) {
  const [copied, setCopied] = useState(false);

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";
  const formattedBalance = Number.parseFloat(pusdBalance).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  );
  const explorerUrl = address ? `https://bscscan.com/address/${address}` : "";

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <PazaLogo className="w-8 h-8" />
          <span className="text-base font-semibold text-foreground tracking-tight">
            PAZA
          </span>
        </div>

        {isConnected && address ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                <Wallet className="w-4 h-4" />
                {displayAddress}
                <ChevronDown className="w-3 h-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">
                    Connected Wallet
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {displayAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <span className="text-[10px] font-bold text-primary-foreground">
                        $
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">PUSD</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formattedBalance}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyAddress} className="gap-3 py-2.5">
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copied ? "Copied!" : "Copy Address"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-3 py-2.5">
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Explorer</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDisconnect}
                variant="destructive"
                className="gap-3 py-2.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={onConnect}
            size="sm"
            className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            <Wallet className="w-4 h-4" />
            Connect
          </Button>
        )}
      </div>
    </header>
  );
}
