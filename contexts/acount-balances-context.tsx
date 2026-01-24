"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useReadContract } from "thirdweb/react";
import { PAZATokenContract, PUSDTokenContract } from "@/lib/thirdweb";
import { useWallet } from "./wallet-context";

const AccountBalancesContext = createContext<{
  pazaBalance: bigint;
  pazaFrozen: bigint;
  pusdBalance: bigint;
  refresh: () => Promise<void>;
} | null>(null);

export function AccountBalancesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useWallet();

  const pazaRead = useReadContract({
    contract: PAZATokenContract,
    method: "function balanceOf(address) view returns (uint256)",
    params: [address],
  });

  const frozenRead = useReadContract({
    contract: PAZATokenContract,
    method:
      "function frozenAmount(address account) external view returns (uint256)",
    params: [address],
  });

  const pusdRead = useReadContract({
    contract: PUSDTokenContract,
    method: "function balanceOf(address) view returns (uint256)",
    params: [address],
  });
  const refresh = useCallback(async () => {
    await Promise.all([
      pazaRead.refetch(),
      frozenRead.refetch(),
      pusdRead.refetch(),
    ]);
  }, [pazaRead, frozenRead, pusdRead]);

  const value = useMemo(
    () => ({
      pazaBalance: pazaRead.data ?? 0n,
      pazaFrozen: frozenRead.data ?? 0n,
      pusdBalance: pusdRead.data ?? 0n,
      refresh,
    }),
    [pazaRead.data, frozenRead.data, pusdRead.data, refresh]
  );

  return (
    <AccountBalancesContext.Provider value={value}>
      {children}
    </AccountBalancesContext.Provider>
  );
}

export function useAccountBalances() {
  const ctx = useContext(AccountBalancesContext);
  if (!ctx) throw new Error("useAccountBalances must be used within provider");
  return ctx;
}
