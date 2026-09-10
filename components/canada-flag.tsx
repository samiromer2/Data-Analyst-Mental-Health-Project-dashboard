import React from "react";

export function CanadaFlag({
  className = "inline-block h-6 w-auto aspect-square align-middle object-contain mr-2 shrink-0",
}: {
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/apple-touch-icon.png"
      alt="Canada Flag 🇨🇦"
      title="Canada 🇨🇦"
      className={className}
      style={{ aspectRatio: "1 / 1", objectFit: "contain" }}
    />
  );
}
