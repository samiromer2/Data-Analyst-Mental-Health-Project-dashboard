import React from "react";

export function FormattedText({ text }: { text?: string | null }) {
  if (!text) return null;

  // Auto-insert ** around targeted metric phrases if not already present
  let processedText = text;
  if (!processedText.includes("**") && !processedText.includes("<strong>")) {
    processedText = processedText
      .replace(/(rose from 6\.9% in 2002 to 15\.3% in 2022)/gi, "**$1**")
      .replace(/(fell from 67\.1% to 53\.1%)/gi, "**$1**")
      .replace(/(rose from \d+(?:\.\d+)?% in \d{4} to \d+(?:\.\d+)?% in \d{4})/gi, "**$1**")
      .replace(/(fell from \d+(?:\.\d+)?% to \d+(?:\.\d+)?%)/gi, "**$1**");
  }

  // Split by markdown bold (**...**) or HTML strong (<strong>...</strong>)
  const parts = processedText.split(/(\*\*.*?\*\*|<strong>.*?<\/strong>)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const content = part.slice(2, -2);
          return (
            <strong key={index} className="font-black text-charcoal underline decoration-primary/50 underline-offset-2">
              {content}
            </strong>
          );
        }
        if (part.startsWith("<strong>") && part.endsWith("</strong>")) {
          const content = part.slice(8, -9);
          return (
            <strong key={index} className="font-black text-charcoal underline decoration-primary/50 underline-offset-2">
              {content}
            </strong>
          );
        }
        return part;
      })}
    </>
  );
}
