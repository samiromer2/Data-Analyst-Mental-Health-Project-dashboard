"use client";

import { useEffect, useMemo, useState } from "react";
import { BreakdownChart, TrendChart } from "@/components/charts/analytics-charts";
import { EmptyState } from "@/components/empty-state";
import type { MetaResponse, Observation, SeriesPoint, BreakdownPoint } from "@/lib/types";

type ChartKind = "line" | "bar";

export default function ExplorerPage() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [dataset, setDataset] = useState("perceived_mh_annual");
  const [x, setX] = useState<"ref_date" | "geo" | "age_group" | "sex">("ref_date");
  const [indicator, setIndicator] = useState("");
  const [chart, setChart] = useState<ChartKind>("line");
  const [year, setYear] = useState("");
  const [geo, setGeo] = useState("");
  const [rows, setRows] = useState<Observation[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/meta?dataset=${encodeURIComponent(dataset)}`)
      .then((response) => response.json())
      .then((data: MetaResponse) => {
        setMeta(data);
        setIndicator((current) =>
          data.indicators.includes(current) ? current : (data.indicators[0] ?? ""),
        );
      });
  }, [dataset]);

  useEffect(() => {
    const params = new URLSearchParams({
      dataset,
      limit: "100",
    });
    if (indicator) params.set("indicator", indicator);
    if (year) params.set("year", year);
    if (geo) params.set("geo", geo);
    fetch(`/api/table?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setRows(data.rows ?? []);
        setTotal(data.total ?? 0);
      });
  }, [dataset, indicator, year, geo]);

  const points = useMemo(() => {
    const usable = rows.filter((row) => row.value != null);
    if (x === "ref_date") {
      const map = new Map<string, number>();
      for (const row of usable) {
        if (!map.has(row.ref_date)) map.set(row.ref_date, row.value as number);
      }
      return [...map.entries()].map(([period, value]) => ({ period, value, status: "" }));
    }
    const key = x === "geo" ? "geo" : x === "age_group" ? "age_group" : "sex";
    const map = new Map<string, number>();
    for (const row of usable) {
      const label = row[key];
      if (label && !map.has(label)) map.set(label, row.value as number);
    }
    return [...map.entries()].map(([label, value]) => ({ label, value, status: "" }));
  }, [rows, x]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-10">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Data Explorer</h1>
        <p className="mt-2 max-w-3xl text-on-variant">
          Choose a table, an indicator, and a chart. This is exploratory. The
          Dashboard stays curated.
        </p>
      </header>

      <section className="grid gap-3 border border-outline bg-surface-dim p-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-medium text-slate">
          Dataset
          <select
            className="mt-1 w-full border border-outline bg-surface-lowest px-3 py-2 text-sm"
            value={dataset}
            onChange={(event) => setDataset(event.target.value)}
          >
            {(meta?.registry ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate">
          Indicator
          <select
            className="mt-1 w-full border border-outline bg-surface-lowest px-3 py-2 text-sm"
            value={indicator}
            onChange={(event) => setIndicator(event.target.value)}
          >
            {(meta?.indicators ?? []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate">
          X-axis
          <select
            className="mt-1 w-full border border-outline bg-surface-lowest px-3 py-2 text-sm"
            value={x}
            onChange={(event) => setX(event.target.value as typeof x)}
          >
            <option value="ref_date">Year / cycle</option>
            <option value="geo">Province</option>
            <option value="sex">Sex</option>
            {meta?.ageSupported ? <option value="age_group">Age group</option> : null}
          </select>
        </label>
        <label className="text-xs font-medium text-slate">
          Year filter
          <select
            className="mt-1 w-full border border-outline bg-surface-lowest px-3 py-2 text-sm"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="">All cycles</option>
            {(meta?.years ?? []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate">
          Province filter
          <select
            className="mt-1 w-full border border-outline bg-surface-lowest px-3 py-2 text-sm"
            value={geo}
            onChange={(event) => setGeo(event.target.value)}
          >
            <option value="">All geographies</option>
            {(meta?.geos ?? []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate">
          Chart type
          <select
            className="mt-1 w-full border border-outline bg-surface-lowest px-3 py-2 text-sm"
            value={chart}
            onChange={(event) => setChart(event.target.value as ChartKind)}
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
        </label>
      </section>

      <section className="border border-outline bg-surface-lowest p-6">
        {points.length === 0 ? (
          <EmptyState
            title="Nothing to plot yet"
            body="Upload a CSV into data/processed/, then pick a dataset and indicator."
          />
        ) : chart === "line" && x === "ref_date" ? (
          <TrendChart points={points as SeriesPoint[]} title={`${indicator || "Value"} over cycles`} />
        ) : (
          <BreakdownChart
            points={
              x === "ref_date"
                ? (points as SeriesPoint[]).map((point) => ({
                    label: point.period,
                    value: point.value,
                    status: point.status,
                  }))
                : (points as BreakdownPoint[])
            }
            title={`${indicator || "Value"} by ${x}`}
            layout={x === "geo" ? "horizontal" : "vertical"}
          />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-charcoal">Underlying data</h2>
        <p className="mb-3 text-sm text-slate">{total} matching rows · showing {rows.length}</p>
        <div className="overflow-x-auto border border-outline">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-dim text-slate">
              <tr>
                {["Cycle", "Geography", "Age", "Sex", "Indicator", "Value", "Status"].map((header) => (
                  <th key={header} className="px-3 py-2 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.dataset}-${row.ref_date}-${row.geo}-${index}`} className="border-t border-outline">
                  <td className="px-3 py-2 font-data">{row.ref_date}</td>
                  <td className="px-3 py-2">{row.geo}</td>
                  <td className="px-3 py-2">{row.age_group || "—"}</td>
                  <td className="px-3 py-2">{row.sex}</td>
                  <td className="px-3 py-2">{row.indicator}</td>
                  <td className="px-3 py-2 font-data">{row.value ?? "—"}</td>
                  <td className="px-3 py-2">{row.status || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
