"use client";

import { Wallet, ArrowLeftRight, Zap } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    number: "1",
    title: "Connect Your Wallet",
    description:
      "Use the PAZA Wallet button to connect your preferred wallet method.",
  },
  {
    icon: ArrowLeftRight,
    number: "2",
    title: "Buy, Send or Receive",
    description:
      "Use the tabs to Buy PAZA, Send to others, or Receive via QR code.",
  },
  {
    icon: Zap,
    number: "3",
    title: "Instant Transactions",
    description: "Transactions are deposited into your wallet instantly.",
  },
];

export function StepsSection() {
  return (
    <section className="py-6 lg:py-0">
      <div className="text-center lg:text-left mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-1">
          Buying PAZA in
        </h2>
        <p className="text-lg lg:text-xl text-primary font-medium">
          Just a Few Steps
        </p>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex items-start gap-4 bg-card rounded-xl p-4 lg:p-5 border border-border hover:border-primary/30 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <step.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs lg:text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Step {step.number}
                </span>
              </div>
              <h3 className="text-base lg:text-lg font-medium text-foreground mb-1">
                {step.title}
              </h3>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
