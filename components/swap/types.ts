import {
  PUSDTokenContract,
  USDCTokenContract,
  USDTTokenContract,
} from "@/lib/thirdweb";

export type TokenType = "USDT" | "USDC" | "PUSD" | "PAZA";

export type TokenOptionsType = {
  type: TokenType;
  balance: string;
};

// Define stablecoin types
export enum Stablecoin {
  PUSD = 0,
  USDT = 1,
  USDC = 2,
}

// Contract addresses (update with your actual addresses)
export const STABLECOIN_CONTRACTS = {
  [Stablecoin.PUSD]: PUSDTokenContract,
  [Stablecoin.USDT]: USDTTokenContract,
  [Stablecoin.USDC]: USDCTokenContract,
};

export const STABLECOIN_NAMES = {
  [Stablecoin.PUSD]: "PUSD",
  [Stablecoin.USDT]: "USDT",
  [Stablecoin.USDC]: "USDC",
};

export function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
