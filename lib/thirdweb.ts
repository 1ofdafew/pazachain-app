import { createThirdwebClient, getContract } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  throw new Error("No client ID provided");
}

// Create the thirdweb client (clientId only for client-side usage)
export const client = createThirdwebClient({
  clientId: clientId,
});

// Use `baseSepolia` for Sepolia Testnet
// Use `base` for Mainnet
//
export const chain = base;

// Contract addresses
export const PAZA_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_PAZA_TOKEN_ADDRESS || "0x...";
export const PUSD_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_PUSD_TOKEN_ADDRESS || "0x...";
export const SALE_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SALE_CONTRACT_ADDRESS || "0x...";
export const VESTING_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_VESTING_CONTRACT_ADDRESS || "0x...";

export const MANAGED_ACCOUNT_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_MANAGED_ACCOUNT_FACTORY_ADDRESS || "0x...";

export const BIG_DECIMALS = BigInt(1e6);
export const DECIMALS = 6;
export const SHOW_DECIMALS = 2;

// Get contract instances
export const PAZATokenContract = getContract({
  client,
  chain,
  address: PAZA_TOKEN_ADDRESS,
});

export const PUSDTokenContract = getContract({
  client,
  chain,
  address: PUSD_TOKEN_ADDRESS,
});

export const PAZASaleContract = getContract({
  client,
  chain,
  address: SALE_CONTRACT_ADDRESS,
});

export const PAZAVestingContract = getContract({
  client,
  chain,
  address: VESTING_CONTRACT_ADDRESS,
});

export const formatCurrency = (num: number, dec: number): string => {
  const formatted = num.toFixed(dec);
  const [integer, decimals] = formatted.split(".");
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${decimals}`;
};

export function formatTokenAmount(
  value: bigint,
  decimals: number,
  displayDecimals: number = 2,
): string {
  if (value === 0n) return `0.${"0".repeat(displayDecimals)}`;

  const divisor = 10n ** BigInt(decimals);
  const integerPart = value / divisor;
  const fractionPart = value % divisor;

  const integerFormatted = integerPart
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fractionStr = fractionPart
    .toString()
    .padStart(decimals, "0")
    .slice(0, displayDecimals);

  return `${integerFormatted}.${fractionStr}`;
}
