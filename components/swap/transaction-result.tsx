"use client";

import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chain } from "@/lib/thirdweb";
import { base } from "thirdweb/chains";

interface TransactionResultProps {
  message: string;
  txHash: string;
  onDismiss: () => void;
}

export function TransactionResult({
  message,
  txHash,
  onDismiss,
}: TransactionResultProps) {
  const explorerUrl =
    chain === base
      ? `https://basescan.org/tx/${txHash}`
      : `https://sepolia.basescan.org/tx/${txHash}`;
  const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

  return (
    <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">
          Transaction Submitted
        </span>
      </div>
      <p className="text-sm text-green-400">{message}</p>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <span>View on Explorer: {shortHash}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <Button
        variant="outline"
        className="w-full h-10 mt-2 border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
        onClick={onDismiss}
      >
        Done
      </Button>
    </div>
  );
}
