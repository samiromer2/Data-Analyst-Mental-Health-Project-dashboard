import React from "react";

export function FormattedText({ text }: { text?: string | null }) {
  if (!text) return null;

  // Split by markdown bold (**...**) or HTML strong (<strong>...</strong>)
  const parts = text.split(/(\*\*.*?\*\*|<strong>.*?<\/strong>)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-bold text-charcoal">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("<strong>") && part.endsWith("</strong>")) {
          return (
            <strong key={index} className="font-bold text-charcoal">
              {part.slice(8, -9)}
            </strong>
          );
        }
        return part;
      })}
    </>
  );
}
