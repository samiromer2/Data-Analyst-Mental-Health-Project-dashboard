"use client";

import { useState } from "react";
import canada from "./canada-paths.json";

type Datum = { geo: string; value: number | null };

const paths = canada.paths as Record<string, string>;

function rampColor(t: number) {
  // light neutral -> primary teal
  const from = [241, 245, 249];
  const to = [0, 104, 95];
  const mix = from.map((c, i) => Math.round(c + (to[i] - c) * t));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

export function CanadaChoropleth({
  data,
  unit = "%",
  caption,
}: {
  data: Datum[];
  unit?: string;
  caption?: string;
}) {
  const [hover, setHover] = useState<Datum | null>(null);
  const values = data.map((d) => d.value).filter((v): v is number => v != null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const byGeo = new Map(data.map((d) => [d.geo, d.value]));

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <div
        className="relative w-full max-w-lg"
        style={{ aspectRatio: String((canada as { aspectRatio?: number }).aspectRatio ?? 1.16) }}
      >
        <svg
          viewBox={canada.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          role="img"
          aria-label="Map of Canada by province"
        >
          {Object.entries(paths).map(([name, d]) => {
            const value = byGeo.get(name) ?? null;
            const t = value == null || max === min ? null : (value - min) / (max - min);
            return (
              <path
                key={name}
                d={d}
                fill={t == null ? "#e2e8f0" : rampColor(t)}
                stroke="#ffffff"
                strokeWidth={0.75}
                onMouseEnter={() => setHover({ geo: name, value })}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })}
        </svg>
        {hover ? (
          <div className="pointer-events-none absolute left-3 top-3 border border-outline bg-surface-lowest px-3 py-2 text-xs shadow-sm">
            <p className="font-semibold text-charcoal">{hover.geo}</p>
            <p className="text-on-variant">
              {hover.value == null ? "No publishable value" : `${hover.value}${unit}`}
            </p>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 text-xs text-on-variant">
        {caption ? <p className="max-w-48 text-slate">{caption}</p> : null}
        <div className="flex items-center gap-2">
          <span>{Number.isFinite(min) ? `${Math.round(min * 10) / 10}${unit}` : ""}</span>
          <span
            className="h-3 w-24"
            style={{ background: `linear-gradient(to right, ${rampColor(0)}, ${rampColor(1)})` }}
          />
          <span>{Number.isFinite(max) ? `${Math.round(max * 10) / 10}${unit}` : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 border border-outline bg-surface-dim" />
          <span>No publishable value (suppressed / not available)</span>
        </div>
      </div>
    </div>
  );
}
