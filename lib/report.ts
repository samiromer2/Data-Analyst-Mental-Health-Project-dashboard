import { promises as fs } from "fs";
import path from "path";
import { parseCsvObjects } from "./csv";
import { loadKpiSummary } from "./store";
import { PROVINCES } from "./report-constants";

const processedDir = path.join(process.cwd(), "data", "processed");
const fileCache = new Map<string, Record<string, string>[]>();

async function load(file: string): Promise<Record<string, string>[]> {
  const cached = fileCache.get(file);
  if (cached) return cached;
  try {
    const text = await fs.readFile(path.join(processedDir, file), "utf8");
    const rows = parseCsvObjects(text);
    fileCache.set(file, rows);
    return rows;
  } catch {
    return [];
  }
}

function num(value: string | undefined): number | null {
  if (value == null || value === "" || value === "..") return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function publishable(row: Record<string, string>): boolean {
  const flag = (row.quality_flag ?? "").trim().toUpperCase();
  return flag !== "F" && flag !== "X";
}

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

const round1 = (v: number | null) => (v == null ? null : Math.round(v * 10) / 10);

// ---------------------------------------------------------------------------
// Tab 1 — Executive Overview
// ---------------------------------------------------------------------------

export type TrajectoryPoint = Record<string, number | string | null>;

export async function executiveOverview(region?: string) {
  const rows = (await load("mh_long.csv")).filter(
    (r) =>
      r.source === "perceived_mh_annual" &&
      r.indicator === "Perceived mental health, fair or poor" &&
      r.sex === "Both" &&
      r.measure === "percent" &&
      publishable(r) &&
      num(r.value) != null,
  );

  const periods = [...new Set(rows.map((r) => r.period))].sort();
  const geos = region && region !== "all" ? [region] : PROVINCES;

  const trajectory: TrajectoryPoint[] = periods.map((period) => {
    const point: TrajectoryPoint = { period };
    const inPeriod = rows.filter((r) => r.period === period);
    for (const geo of geos) {
      const match = inPeriod.find((r) => r.geo === geo);
      point[geo] = match ? round1(num(match.value)) : null;
    }
    point["Canada (13-region avg)"] = round1(
      mean(inPeriod.filter((r) => PROVINCES.includes(r.geo)).map((r) => num(r.value) as number)),
    );
    return point;
  });

  const kpi = await loadKpiSummary();
  return {
    trajectory,
    series: [...geos, "Canada (13-region avg)"],
    latestNationalRate: kpi["national_fair_poor_mh_latest_pct"] ?? "15.3",
  };
}

// ---------------------------------------------------------------------------
// Tab 2 — Provincial Explorer
// ---------------------------------------------------------------------------

export async function provincialExplorer() {
  const rows = (await load("mh_long.csv")).filter(
    (r) =>
      r.source === "perceived_mh_annual" &&
      r.indicator === "Perceived mental health, fair or poor" &&
      r.sex === "Both" &&
      r.measure === "percent" &&
      publishable(r) &&
      num(r.value) != null,
  );
  const latestYear = Math.max(...rows.map((r) => Number(r.year)));
  const latest = rows.filter((r) => Number(r.year) === latestYear);

  const byProvince = PROVINCES.map((geo) => {
    const match = latest.find((r) => r.geo === geo);
    return { geo, value: match ? round1(num(match.value)) : null };
  }).sort((a, b) => (b.value ?? -1) - (a.value ?? -1));

  const kpi = await loadKpiSummary();
  return {
    period: latest[0]?.period ?? String(latestYear),
    byProvince,
    highestBurden: kpi["highest_burden_province"] ?? "Nova Scotia (19.7%)",
    lowestBurden: kpi["lowest_burden_province"] ?? "Quebec (8.8%)",
  };
}

// ---------------------------------------------------------------------------
// Tab 3 — Demographics & the gender paradox
// ---------------------------------------------------------------------------

function isTotalAge(age: string) {
  return /^total,/i.test(age.trim());
}

function nationalBySex(
  rows: Record<string, string>[],
  source: string,
  indicator: string,
) {
  const base = rows.filter(
    (r) =>
      r.source === source &&
      r.indicator === indicator &&
      r.measure === "percent" &&
      isTotalAge(r.age_group) &&
      publishable(r) &&
      num(r.value) != null,
  );
  const latestYear = base.length ? Math.max(...base.map((r) => Number(r.year))) : null;
  const latest = base.filter((r) => Number(r.year) === latestYear);

  const out: Record<string, number | null> = {};
  for (const sex of ["Female", "Male"]) {
    const forSex = latest.filter((r) => r.sex === sex);
    const canada = forSex.find((r) => r.geo.startsWith("Canada"));
    out[sex] = canada
      ? round1(num(canada.value))
      : round1(
          mean(forSex.filter((r) => PROVINCES.includes(r.geo)).map((r) => num(r.value) as number)),
        );
  }
  return out;
}

export async function demographics() {
  const mh = await load("mh_long.csv");

  const ideation = nationalBySex(mh, "suicidal_thoughts", "Suicidal thoughts (15 years and over)");
  const consult = nationalBySex(
    mh,
    "suicidal_thoughts",
    "Consultation with a health professional about emotional or mental health",
  );
  const ideationVsConsult = ["Female", "Male"].map((sex) => ({
    sex,
    "Reported suicidal thoughts": ideation[sex],
    "Consulted a professional": consult[sex],
  }));

  const mood = nationalBySex(mh, "perceived_mh_annual", "Mood disorder");
  const moodVsIdeation = ["Female", "Male"].map((sex) => ({
    sex,
    "Mood disorder": mood[sex],
    "Suicidal thoughts": ideation[sex],
  }));

  const socio = (await load("socioeconomic_gradient.csv"))
    .map((r) => ({
      bracket: r.income_bracket.replace(/^\d+\.\s*/, ""),
      order: Number(r.income_bracket.match(/^\d+/)?.[0] ?? 0),
      "Fair or poor mental health": round1(num(r.pct_fair_poor_mh)),
      "Excellent or very good": round1(num(r.pct_excellent_vg_mh)),
    }))
    .sort((a, b) => a.order - b.order);

  return { ideationVsConsult, moodVsIdeation, incomeGradient: socio };
}

// ---------------------------------------------------------------------------
// Tab 4 — Youth acute crisis monitor
// ---------------------------------------------------------------------------

const AGE_LABELS: Record<string, string> = {
  "Agegroup:5–9years–Rate": "5–9 years",
  "Agegroup:10–14years–Rate": "10–14 years",
  "Agegroup:15–17years–Rate": "15–17 years",
  "Agegroup:18–24years–Rate": "18–24 years",
  "Agegroup:5–24years–Rate": "5–24 years (all)",
};

export const YOUTH_AGE_OPTIONS = Object.values(AGE_LABELS);

export async function youthCrisis(ageGroup?: string) {
  const rows = await load("cihi_children.csv");
  const selectedLabel =
    ageGroup && YOUTH_AGE_OPTIONS.includes(ageGroup) ? ageGroup : "5–24 years (all)";
  const ageKey =
    Object.entries(AGE_LABELS).find(([, label]) => label === selectedLabel)?.[0] ??
    "Agegroup:5–24years–Rate";

  const scoped = rows.filter(
    (r) => r.sex === "Total" && r.age_group === ageKey && num(r.rate_per_100k) != null,
  );

  const fiscalYears = [...new Set(scoped.map((r) => r.fiscal_year))].sort();

  const admissionTrend = fiscalYears.map((fy) => {
    const inYear = scoped.filter((r) => r.fiscal_year === fy);
    const sum = (service: string) =>
      Math.round(
        inYear
          .filter((r) => r.service === service)
          .reduce((total, r) => total + (num(r.rate_per_100k) ?? 0), 0),
      );
    return { fiscal_year: fy, Hospitalisation: sum("hospitalisation"), "ED visit": sum("ED visit") };
  });

  const latestFy = fiscalYears[fiscalYears.length - 1];
  const inLatest = scoped.filter((r) => r.fiscal_year === latestFy);
  const categories = [...new Set(inLatest.map((r) => r.diagnosis_category.trim()))];
  const edVsInpatient = categories
    .map((category) => {
      const forCat = inLatest.filter((r) => r.diagnosis_category.trim() === category);
      const rate = (service: string) =>
        Math.round(
          forCat
            .filter((r) => r.service === service)
            .reduce((total, r) => total + (num(r.rate_per_100k) ?? 0), 0),
        );
      return { category, "ED visits": rate("ED visit"), "Inpatient": rate("hospitalisation") };
    })
    .sort((a, b) => b["Inpatient"] - a["Inpatient"]);

  return {
    selectedAgeGroup: selectedLabel,
    latestFiscalYear: latestFy,
    admissionTrend,
    edVsInpatient,
  };
}
