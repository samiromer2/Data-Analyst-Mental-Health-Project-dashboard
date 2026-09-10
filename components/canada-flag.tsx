import React from "react";

export function CanadaFlag({
  className = "h-6 w-6 mr-2",
}: {
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/canada-flag.png"
      alt="Canada Flag 🇨🇦"
      title="Canada 🇨🇦"
      className={`inline-block aspect-square object-contain align-middle shrink-0 ${className}`}
      width={24}
      height={24}
    />
  );
}
