"use client";

import Image from "next/image";

export function PazaLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <Image
      src="/paza-logo.png"
      alt="PAZA"
      width={32}
      height={32}
      className={className}
    />
  );
}
