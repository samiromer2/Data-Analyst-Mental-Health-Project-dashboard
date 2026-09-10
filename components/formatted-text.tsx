import React from "react";

export function FormattedText({ text }: { text?: string | null }) {
  if (!text) return null;

  let processedText = text;

  // Auto-insert ** around target metric phrases if not already formatted with **
  if (!processedText.includes("**") && !processedText.includes("<strong>")) {
    processedText = processedText
      .replace(/(rose from 6\.9% in 2002 to 15\.3% in 2022|from 6\.9% in 2002 to 15\.3% in 2022)/gi, "**$1**")
      .replace(/(fell from 67\.1% to 53\.1%|from 67\.1% to 53\.1%)/gi, "**$1**")
      .replace(/(rose from \d+(?:\.\d+)?% in \d{4} to \d+(?:\.\d+)?% in \d{4})/gi, "**$1**")
      .replace(/(fell from \d+(?:\.\d+)?% to \d+(?:\.\d+)?%)/gi, "**$1**");
  }

  // Split by markdown bold (**...**) or HTML strong (<strong>...</strong>)
  const parts = processedText.split(/(\*\*.*?\*\*|<strong>.*?<\/strong>)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-black text-charcoal underline decoration-primary/50 underline-offset-2">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("<strong>") && part.endsWith("</strong>")) {
          return (
            <strong key={index} className="font-black text-charcoal underline decoration-primary/50 underline-offset-2">
              {part.slice(8, -9)}
            </strong>
          );
        }
        return part;
      })}
    </>
  );
}
