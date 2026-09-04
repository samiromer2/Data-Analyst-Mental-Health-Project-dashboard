import { promises as fs } from "fs";
import path from "path";
import { getDataset } from "./datasets";
import type { Filters } from "./types";

export type TrendDirection = "Up" | "Down" | "Flat";

export type TrendSignal = {
  source: string;
  geo: string;
  geoLevel: string;
  sex: string;
  ageGroup: string;
  indicator: string;
  yearT: number;
  yearT1: number | null;
  valueT: number;
  delta: number | null;
  actualDirection: TrendDirection | null;
  isLatestObservedCycle: boolean;
  modelSignal: "Up" | "Down";
  modelProbabilityUp: number;
  modelProbabilityDown: number;
  qualityFlagT: string;
  ciWidthT: number | null;
  withinCiMargin: boolean | null;
};

export type TrendSignalResult =
  | { status: "ok"; row: TrendSignal }
  | { status: "insufficient" };

export type TopTrendRow = TrendSignal & { forwardSignal?: TrendSignal };

const processedDir = path.join(process.cwd(), "data", "processed");
let cache: TrendSignal[] | null = null;

// Quote-aware CSV parser, intentionally duplicated from lib/csv.ts's private
// parseCsv rather than exporting it there - see data/processed/README.md.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (char === "\r") continue;
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((item) => item.some((cell) => cell.trim() !== ""));
}

function toNum(value: string): number | null {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBool(value: string): boolean {
  return value.trim().toLowerCase() === "true";
}

function toBoolOrNull(value: string): boolean | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "") return null;
  return trimmed === "true";
}

export async function loadTrendPredictions(): Promise<TrendSignal[]> {
  if (cache) return cache;

  try {
    const text = await fs.readFile(path.join(processedDir, "trend_predictions.csv"), "utf8");
    const table = parseCsv(text.replace(/^﻿/, ""));
    if (table.length < 2) return [];

    const headers = table[0];
    const col = (name: string) => headers.indexOf(name);
    const at = (cells: string[], name: string) => (cells[col(name)] ?? "").trim();

    const rows: TrendSignal[] = table.slice(1).map((cells) => ({
      source: at(cells, "source"),
      geo: at(cells, "geo"),
      geoLevel: at(cells, "geo_level"),
      sex: at(cells, "sex"),
      ageGroup: at(cells, "age_group"),
      indicator: at(cells, "indicator"),
      yearT: Number(at(cells, "year_t")),
      yearT1: toNum(at(cells, "year_t1")),
      valueT: Number(at(cells, "value_t")),
      delta: toNum(at(cells, "delta")),
      actualDirection: (at(cells, "actual_direction") || null) as TrendDirection | null,
      isLatestObservedCycle: toBool(at(cells, "is_latest_observed_cycle")),
      modelSignal: at(cells, "model_signal") as "Up" | "Down",
      modelProbabilityUp: Number(at(cells, "model_probability_up")),
      modelProbabilityDown: Number(at(cells, "model_probability_down")),
      qualityFlagT: at(cells, "quality_flag_t"),
      ciWidthT: toNum(at(cells, "ci_width_t")),
      withinCiMargin: toBoolOrNull(at(cells, "within_ci_margin")),
    }));

    cache = rows;
    return rows;
  } catch {
    return [];
  }
}

function norm(value: string) {
  return value.trim().toLowerCase();
}

/**
 * The dashboard's per-source CSVs use "Both sexes"/"Females"/"Males" (and
 * cchs_mh_disorders.csv uses "Men+"/"Women+"). trend_predictions.csv uses
 * "Both"/"Female"/"Male". Bucket both conventions the same way so a filter
 * selection matches the model's series key. Order matters: check "fem"/"wom"
 * before "male"/"men" - "female".includes("male") is true in JS.
 */
export function normalizeSexBucket(sex: string | undefined): "both" | "female" | "male" | "other" {
  const value = norm(sex ?? "");
  if (!value || value.includes("both") || value.includes("total")) return "both";
  if (value.includes("fem") || value.startsWith("wom")) return "female";
  if (value.includes("male") || value.startsWith("men")) return "male";
  return "other";
}

function isTotalAge(age: string) {
  return !age || norm(age).startsWith("total");
}

function isNational(geo: string) {
  const value = norm(geo);
  return (
    value === "canada" ||
    value === "canada (excluding territories)" ||
    value === "canada excluding territories"
  );
}

type ResolvedSeriesKey = {
  source: string;
  geo?: string;
  sexBucket: ReturnType<typeof normalizeSexBucket>;
  age?: string;
  ageSupported: boolean;
  indicator: string;
};

// Mirrors the defaulting already used by rowsFor() in lib/query.ts (national
// geo, "both sexes", total age, config.defaultIndicator). Kept independent
// on purpose: changing getSeries()'s return shape would touch three existing
// pages, this file touches none of them.
function resolveSeriesKey(filters: Filters, sourceRows: TrendSignal[]): ResolvedSeriesKey {
  const source = filters.dataset ?? "perceived_mh_annual";
  const config = getDataset(source);

  const geoCandidates = [...new Set(sourceRows.map((row) => row.geo))].sort();
  const geo =
    filters.geo ?? sourceRows.find((row) => isNational(row.geo))?.geo ?? geoCandidates[0];

  const sexBucket = normalizeSexBucket(filters.sex);

  const age = config.ageSupported
    ? (filters.age ?? sourceRows.find((row) => isTotalAge(row.ageGroup))?.ageGroup)
    : undefined;

  return {
    source,
    geo,
    sexBucket,
    age,
    ageSupported: config.ageSupported,
    indicator: filters.indicator ?? config.defaultIndicator,
  };
}

function isPublishable(row: TrendSignal) {
  const flag = row.qualityFlagT.trim().toUpperCase();
  return flag !== "F" && flag !== "X";
}

/**
 * Looks up the model's forward signal (the series' latest observed cycle -
 * there is never a real next cycle for this row, by construction) for the
 * dashboard's currently selected filters. Returns "insufficient" rather than
 * a guess when no matching series exists.
 */
export async function getTrendSignal(filters: Filters): Promise<TrendSignalResult> {
  const all = await loadTrendPredictions();
  const publishable = all.filter(isPublishable);
  const sourceRows = publishable.filter((row) => row.source === (filters.dataset ?? "perceived_mh_annual"));
  const key = resolveSeriesKey(filters, sourceRows);

  const match = sourceRows.find((row) => {
    if (!row.isLatestObservedCycle) return false;
    // "Canada" vs "Canada (excluding territories)" varies by source and by file
    // (the dashboard's own CSVs vs trend_predictions.csv) - treat any national
    // variant as equivalent rather than requiring an exact string match.
    if (key.geo) {
      const geoMatches = isNational(key.geo)
        ? isNational(row.geo)
        : norm(row.geo) === norm(key.geo);
      if (!geoMatches) return false;
    }
    if (normalizeSexBucket(row.sex) !== key.sexBucket) return false;
    if (key.ageSupported && key.age && norm(row.ageGroup) !== norm(key.age)) return false;
    if (key.indicator && norm(row.indicator) !== norm(key.indicator)) return false;
    return true;
  });

  return match ? { status: "ok", row: match } : { status: "insufficient" };
}

/**
 * Biggest real, observed cycle-to-cycle movers (backtest rows only - a known
 * actual_direction exists), paired with the model's forward signal for the
 * same series where one exists. Ranked by |delta|, per spec: absolute
 * percentage-point change, not raw percentage.
 */
export async function getTopTrends(limit = 10): Promise<TopTrendRow[]> {
  const all = await loadTrendPredictions();
  const publishable = all.filter(isPublishable);

  const seriesKey = (row: TrendSignal) =>
    [row.source, row.geo, row.sex, row.ageGroup, row.indicator].join("|");

  const latestBacktestBySeries = new Map<string, TrendSignal>();
  for (const row of publishable) {
    if (row.isLatestObservedCycle || row.delta == null) continue;
    const key = seriesKey(row);
    const existing = latestBacktestBySeries.get(key);
    if (!existing || row.yearT > existing.yearT) latestBacktestBySeries.set(key, row);
  }

  const forwardBySeries = new Map<string, TrendSignal>();
  for (const row of publishable) {
    if (row.isLatestObservedCycle) forwardBySeries.set(seriesKey(row), row);
  }

  return [...latestBacktestBySeries.entries()]
    .map(([key, row]) => ({ ...row, forwardSignal: forwardBySeries.get(key) }))
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))
    .slice(0, limit);
}
