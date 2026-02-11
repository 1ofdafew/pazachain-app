"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useReadContract } from "thirdweb/react";
import {
  PAZATokenContract,
  PUSDTokenContract,
  USDCTokenContract,
  USDTTokenContract,
} from "@/lib/thirdweb";
import { useWallet } from "./wallet-context";
import { formatUnits } from "ethers";
import { ContractOptions } from "thirdweb";

const AccountBalancesContext = createContext<{
  usdtBalance: string;
  usdcBalance: string;
  pusdBalance: string;
  pazaBalance: string;
  pazaFrozen: string;
  pazaAvailable: string;
  refresh: () => Promise<void>;
} | null>(null);

type ContractType = Readonly<ContractOptions<[], `0x${string}`>>;

const getBalance = (contract: ContractType, address: string) => {
  return useReadContract({
    contract: contract,
    method: "function balanceOf(address) view returns (uint256)",
    params: [address],
  });
};

export function AccountBalancesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useWallet();

  const usdtRead = getBalance(USDTTokenContract, address);
  const usdcRead = getBalance(USDCTokenContract, address);
  const pusdRead = getBalance(PUSDTokenContract, address);
  const pazaRead = getBalance(PAZATokenContract, address);

  const frozenRead = useReadContract({
    contract: PAZATokenContract,
    method:
      "function frozenAmount(address account) external view returns (uint256)",
    params: [address],
  });

  const refresh = useCallback(async () => {
    await Promise.all([
      usdtRead.refetch(),
      usdcRead.refetch(),
      pusdRead.refetch(),
      pazaRead.refetch(),
      frozenRead.refetch(),
    ]);
  }, [usdtRead, usdcRead, pusdRead, pazaRead, frozenRead]);

  const value = useMemo(
    () => ({
      usdtBalance: usdtRead.data ? formatUnits(usdtRead.data, 6) : "0",
      usdcBalance: usdcRead.data ? formatUnits(usdcRead.data, 6) : "0",
      pusdBalance: pusdRead.data ? formatUnits(pusdRead.data, 6) : "0",
      pazaBalance: pazaRead.data ? formatUnits(pazaRead.data, 6) : "0",
      pazaFrozen: frozenRead.data ? formatUnits(frozenRead.data, 6) : "0",
      pazaAvailable:
        pazaRead.data && frozenRead.data
          ? formatUnits(pazaRead.data - frozenRead.data, 6)
          : "0",
      refresh,
    }),
    [
      usdtRead.data,
      usdcRead.data,
      pusdRead.data,
      pazaRead.data,
      frozenRead.data,
      refresh,
    ],
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
