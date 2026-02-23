"use client";

import { useState } from "react";
import {
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  WalletIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { chain, client } from "@/lib/thirdweb";

interface ConnectWalletProps {
  buttonLabel?: string; // Custom text
  // buttonClassName?: string; // Additional custom classes
  hideLabel?: boolean;
}

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "telegram", "x", "passkey", "apple"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

export function ConnectWallet({ buttonLabel, hideLabel }: ConnectWalletProps) {
  const [copied, setCopied] = useState(false);
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const disconnectWallet = () => {
    if (wallet) disconnect(wallet);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account?.address || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function shortenAddress(address: string, length: number = 4): string {
    if (!address) return "";
    return `${address.slice(0, 2 + length)}...${address.slice(-length)}`;
  }
  return (
    <>
      {account?.address ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg border border-gold text-foreground bg-card px-2 py-2 transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <WalletIcon className="w-4 h-4" />
              <span className="hidden sm:block text-sm font-mono font-medium text-foreground">
                {shortenAddress(account.address)}
              </span>
              <ChevronDown className="h-4 w-4 text-gold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-border/60 bg-card">
            <div className="px-4 py-2">
              <p className="text-xs text-muted-foreground">Connected Wallet</p>
              <div
                onClick={copyAddress}
                className="flex items-center gap-x-4 mt-1 truncate text-sm font-medium font-mono text-foreground">
                {shortenAddress(account.address, 6)}
                <span>
                  <Copy className="h-4 w-4" />
                </span>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-border/60" />
            <DropdownMenuItem
              onClick={copyAddress}
              className="flex items-center cursor-pointer gap-2 py-4 text-xs text-foreground focus:bg-secondary focus:text-foreground">
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Address"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 py-4 text-xs text-foreground focus:bg-secondary focus:text-foreground"
              asChild>
              <a
                href={`${chain.blockExplorers?.at(0)?.url}/address/${account.address}`}
                target="_blank"
                rel="noopener noreferrer">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View on Explorer
                </div>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/60" />
            <DropdownMenuItem
              onClick={disconnectWallet}
              className="flex items-center cursor-pointer gap-2 py-4 text-xs text-amber-500 focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Disconnect Wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <ConnectButton
          appMetadata={{
            name: "PAZA Wallet",
            description:
              "PAZA Wallet - Buy, Send and Receive PAZA tokens instantly",
            url: "https://pazachain.io",
            logoUrl: "https://pazachain.io/icon-64x64.png",
          }}
          accountAbstraction={{
            chain: chain,
            sponsorGas: true,
          }}
          client={client}
          connectButton={{
            label: (
              <div
                className={`flex items-center gap-2 px-4 py-2 ${hideLabel ? "px-2" : ""}`}>
                <WalletIcon className="w-4 h-4" />
                <span>{buttonLabel ? buttonLabel : "Connect Wallet"}</span>
              </div>
            ),
            style: {
              padding: "0px",
              margin: "0px",
              width: "auto",
              height: "38px",
              fontSize: "0.75rem",
              border: "oklch(0.62 0.19 250) 1px solid",
              backgroundColor: "oklch(0.62 0.19 250)",
              color: "oklch(0.98 0 0)",
            },
          }}
          connectModal={{
            showThirdwebBranding: false,
            size: "compact",
            title: "PAZA Sign In",
            titleIcon: "/icon-64x64.png",
          }}
          wallets={wallets}
        />
      )}
    </>
  );
}
