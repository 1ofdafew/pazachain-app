export type TokenType = "PAZA" | "PUSD" | "USDT" | "USDC";

export interface TokenBalances {
  PUSD: string;
  USDT: string;
  USDC: string;
  PAZA: string;
}

export function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
