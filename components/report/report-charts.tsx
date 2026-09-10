"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axis = { fontSize: 12, fill: "#64748B" };
const grid = "#E2E8F0";
const tooltipStyle = { border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 12 };

// Colour-blind-safe categorical ramp (Okabe–Ito), primary teal first.
const PALETTE = [
  "#00685f",
  "#E69F00",
  "#56B4E9",
  "#009E73",
  "#CC79A7",
  "#0072B2",
  "#D55E00",
  "#8c6d1f",
  "#7a5195",
  "#ef5675",
  "#955196",
  "#003f5c",
  "#bc5090",
];

export function MultiLineChart({
  data,
  series,
  xKey,
  unit = "%",
}: {
  data: Record<string, number | string | null>[];
  series: string[];
  xKey: string;
  unit?: string;
}) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey={xKey} tick={axis} axisLine={{ stroke: grid }} />
          <YAxis tick={axis} unit={unit} axisLine={{ stroke: grid }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => (v == null ? "—" : `${v}${unit}`)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={PALETTE[index % PALETTE.length]}
              strokeWidth={name.startsWith("Canada") ? 3 : 1.75}
              strokeDasharray={name.startsWith("Canada") ? "5 3" : undefined}
              dot={{ r: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GroupedBar({
  data,
  series,
  xKey,
  unit = "%",
  horizontal = false,
  height = 320,
}: {
  data: Record<string, number | string | null>[];
  series: string[];
  xKey: string;
  unit?: string;
  horizontal?: boolean;
  height?: number;
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 16, left: horizontal ? 40 : 0, bottom: 8 }}
        >
          <CartesianGrid stroke={grid} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={axis} unit={unit} axisLine={{ stroke: grid }} />
              <YAxis
                type="category"
                dataKey={xKey}
                tick={axis}
                width={190}
                axisLine={{ stroke: grid }}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={axis} axisLine={{ stroke: grid }} />
              <YAxis tick={axis} unit={unit} axisLine={{ stroke: grid }} />
            </>
          )}
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => (v == null ? "—" : `${v}${unit}`)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((name, index) => (
            <Bar key={name} dataKey={name} fill={PALETTE[index % PALETTE.length]} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StackedShare({
  data,
  series,
  xKey,
}: {
  data: Record<string, number | string | null>[];
  series: string[];
  xKey: string;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey={xKey} tick={axis} axisLine={{ stroke: grid }} />
          <YAxis tick={axis} unit="%" axisLine={{ stroke: grid }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => (v == null ? "—" : `${v}%`)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((name, index) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="a"
              fill={PALETTE[index % PALETTE.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AreaTrend({
  data,
  series,
  xKey,
}: {
  data: Record<string, number | string | null>[];
  series: string[];
  xKey: string;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey={xKey} tick={axis} axisLine={{ stroke: grid }} />
          <YAxis tick={axis} axisLine={{ stroke: grid }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((name, index) => (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              stroke={PALETTE[index % PALETTE.length]}
              fill={PALETTE[index % PALETTE.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
