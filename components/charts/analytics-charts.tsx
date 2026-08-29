"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BreakdownPoint, SeriesPoint } from "@/lib/types";

const axis = { fontSize: 12, fill: "#64748B" };
const grid = "#E2E8F0";

export function TrendChart({
  points,
  title,
}: {
  points: SeriesPoint[];
  title: string;
}) {
  return (
    <div className="h-72 w-full">
      <p className="mb-4 text-sm font-medium text-slate">{title}</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="period" tick={axis} axisLine={{ stroke: grid }} />
          <YAxis tick={axis} axisLine={{ stroke: grid }} unit="%" />
          <Tooltip
            formatter={(value) => [`${value}%`, "Value"]}
            contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 4 }}
          />
          <Line type="monotone" dataKey="value" stroke="#00685f" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BreakdownChart({
  points,
  title,
  layout = "vertical",
}: {
  points: BreakdownPoint[];
  title: string;
  layout?: "vertical" | "horizontal";
}) {
  const horizontal = layout === "horizontal";
  return (
    <div className={horizontal ? "h-96 w-full" : "h-72 w-full"}>
      <p className="mb-4 text-sm font-medium text-slate">{title}</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 12, left: horizontal ? 24 : 0, bottom: 8 }}
        >
          <CartesianGrid stroke={grid} vertical={!horizontal} horizontal={horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={axis} unit="%" axisLine={{ stroke: grid }} />
              <YAxis type="category" dataKey="label" tick={axis} width={120} axisLine={{ stroke: grid }} />
            </>
          ) : (
            <>
              <XAxis dataKey="label" tick={axis} axisLine={{ stroke: grid }} />
              <YAxis tick={axis} unit="%" axisLine={{ stroke: grid }} />
            </>
          )}
          <Tooltip
            formatter={(value) => [`${value}%`, "Value"]}
            contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 4 }}
          />
          <Bar dataKey="value" fill="#00685f" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
