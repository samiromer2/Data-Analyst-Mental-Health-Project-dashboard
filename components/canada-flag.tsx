import React from "react";

export function CanadaFlag({
  className = "inline-block h-6 w-6 align-middle object-contain mr-2 shrink-0",
}: {
  className?: string;
}

export function CanadaFlag({ className = "h-4.5 w-auto", ...props }: CanadaFlagProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/apple-touch-icon.png"
      alt="Canada Flag 🇨🇦"
      title="Canada 🇨🇦"
      className={className}
    />
  );
}
