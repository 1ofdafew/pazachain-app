"use client"

import { Wallet, ArrowLeftRight, Zap } from "lucide-react"

const steps = [
  {
    icon: Wallet,
    number: "1",
    title: "Connect Your Wallet",
    description: "Use the PAZA Wallet button to connect your preferred wallet method."
  },
  {
    icon: ArrowLeftRight,
    number: "2", 
    title: "Buy, Send or Receive",
    description: "Use the tabs to Buy PAZA, Send to others, or Receive via QR code."
  },
  {
    icon: Zap,
    number: "3",
    title: "Instant Transactions",
    description: "Transactions are deposited into your wallet instantly."
  }
]

export function StepsSection() {
  return (
    <section className="py-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Buying PAZA in</h2>
        <p className="text-lg text-primary font-medium">Just a Few Steps</p>
      </div>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div 
            key={step.number}
            className="flex items-start gap-4 bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <step.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Step {step.number}
                </span>
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
