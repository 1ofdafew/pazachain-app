"use client";

import { createContext, useContext, useCallback } from "react";
import {
  useConnect,
  useDisconnect,
  useActiveAccount,
  useActiveWallet,
} from "thirdweb/react";
import { createWallet, Wallet } from "thirdweb/wallets";
import { hasStoredPasskey } from "thirdweb/wallets/in-app";
import { client, chain } from "@/lib/thirdweb";

export type WalletType =
  | "apple"
  | "google"
  | "passkey"
  | "metamask"
  | "base"
  | "binance"
  | "safe";

type WalletContextType = {
  address: string;
  connectWallet: (type: WalletType) => Promise<Wallet | null | undefined>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  isConnected: boolean;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { connect, isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  const connectWallet = useCallback(
    async (type: WalletType) => {
      if (account || isConnecting) return;

      return connect(async () => {
        let wallet: Wallet;

        // Mapping wallet types to Thirdweb wallet IDs or inApp strategies
        const inAppStrategies: Record<string, "apple" | "google" | "passkey"> =
          {
            apple: "apple",
            google: "google",
            passkey: "passkey",
          };

        if (type === "metamask") {
          wallet = createWallet("io.metamask");
          await wallet.connect({ client });
        } else if (type === "base") {
          wallet = createWallet("com.coinbase.wallet");
          await wallet.connect({ client });
        } else if (type === "binance") {
          wallet = createWallet("com.binance.wallet");
          await wallet.connect({ client });
        } else if (type in inAppStrategies) {
          const strategy = inAppStrategies[type];
          wallet = createWallet("inApp", {
            auth: {
              options: ["apple", "google", "passkey"],
              passkeyDomain: window.location.hostname,
              // mode: "popup",
            }, // define available options
            executionMode: {
              mode: "EIP7702", // modern AA if available
              sponsorGas: true, // enable gasless
            },
          });

          const hasPasskeyStored = await hasStoredPasskey(client);
          await wallet.connect({
            client,
            chain,
            strategy,
            type: hasPasskeyStored ? "sign-in" : "sign-up",
          });
        } else {
          throw new Error("Unsupported wallet type");
        }

        return wallet;
      });
    },
    [account, isConnecting, connect]
  );

  const disconnectWallet = () => {
    if (wallet) disconnect(wallet);
  };

  return (
    <WalletContext.Provider
      value={{
        address: account?.address || "",
        connectWallet,
        disconnectWallet,
        isConnecting,
        isConnected: !!account,
      }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
