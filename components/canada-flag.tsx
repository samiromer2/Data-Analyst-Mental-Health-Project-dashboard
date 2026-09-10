import React from "react";

export function CanadaFlag({
  className = "inline-block h-5 w-7 align-middle rounded-xs shadow-2xs mr-2 shrink-0",
}: {
  className?: string;
}) {
  return (
    <span className="inline-flex items-center align-middle" title="Canada 🇨🇦">
      <svg
        className={className}
        viewBox="0 0 640 480"
        aria-label="Canada Flag"
        role="img"
      >
        <path fill="#d80027" d="M0 0h160v480H0zM480 0h160v480H480z" />
        <path fill="#ffffff" d="M160 0h320v480H160z" />
        <path
          fill="#d80027"
          d="M347.8 287l14.3 29.5-23.7-2.3 8.3 45.4-23.6-14.7-3.1 35.1h-16.1l-3.1-35.1-23.6 14.7 8.3-45.4-23.7 2.3 14.3-29.5-27.4-11.4 17.5-26-28.7-22 35.5-2.7-2.6-32.9 33.7 20.3 12.3-30.8 12.3 30.8 33.7-20.3-2.6 32.9 35.5 2.7-28.7 22 17.5 26z"
        />
      </svg>
    </span>
  );
}
