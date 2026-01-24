"use client"

import { AlertCircle } from "lucide-react"

interface WalletBannerProps {
  isConnected: boolean
}

export function WalletBanner({ isConnected }: WalletBannerProps) {
  if (isConnected) return null
  
  return (
    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
      <AlertCircle className="w-4 h-4 text-primary shrink-0" />
      <p className="text-sm text-foreground">
        <span className="font-medium">Activate your wallet</span>
        <span className="text-muted-foreground"> to transact assets from this account</span>
      </p>
    </div>
  )
}
