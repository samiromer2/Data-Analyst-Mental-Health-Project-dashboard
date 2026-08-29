import {
  DATASET_REGISTRY,
  HEADLINE_INDICATORS,
  NATIONAL_GEOS,
  REGION_ROLLUPS,
  getDataset,
} from "./datasets";
import { datasetPresence, isPercent, isPublishable, loadDataset } from "./store";
import type {
  BreakdownPoint,
  Filters,
  InsightBlock,
  MetaResponse,
  MetricCard,
  Observation,
  SeriesPoint,
} from "./types";

function norm(value: string) {
  return value.trim().toLowerCase();
}

export function yearSortKey(value: string) {
  const match = value.match(/(\d{4})(?:[/-](\d{2,4}))?/);
  if (!match) return 0;
  const year = Number(match[1]);
  const extra = match[2] ? Number(match[2].slice(-2)) : 0;
  return year * 100 + extra;
}

function isNational(geo: string) {
  return NATIONAL_GEOS.includes(norm(geo));
}

function isRollup(geo: string) {
  return REGION_ROLLUPS.includes(norm(geo));
}

function isTotalAge(age: string) {
  return !age || norm(age).startsWith("total");
}

function isBothSexes(sex: string) {
  const value = norm(sex);
  return (
    !value ||
    value.includes("both") ||
    value.includes("total") ||
    value === "all persons"
  );
}

function matchesIndicator(row: Observation, indicator?: string) {
  if (!indicator) return true;
  return norm(row.indicator).includes(norm(indicator));
}

function defaultGeo(rows: Observation[]) {
  return rows.find((row) => isNational(row.geo))?.geo;
}

function defaultSex(rows: Observation[]) {
  return rows.find((row) => isBothSexes(row.sex))?.sex;
}

function defaultAge(rows: Observation[]) {
  return rows.find((row) => isTotalAge(row.age_group))?.age_group;
}

function applyFilters(rows: Observation[], filters: Filters) {
  return rows.filter((row) => {
    if (!isPublishable(row) || !isPercent(row)) return false;
    if (filters.year && row.ref_date !== filters.year) return false;
    if (filters.geo && norm(row.geo) !== norm(filters.geo)) return false;
    if (filters.sex && norm(row.sex) !== norm(filters.sex)) return false;
    if (filters.indicator && !matchesIndicator(row, filters.indicator)) return false;
    if (filters.age && norm(row.age_group) !== norm(filters.age)) return false;
    return true;
  });
}

function uniqueSorted(values: string[], sortYears = false) {
  const items = [...new Set(values.filter(Boolean))];
  return sortYears
    ? items.sort((a, b) => yearSortKey(a) - yearSortKey(b))
    : items.sort((a, b) => a.localeCompare(b));
}

function latestPeriod(rows: Observation[]) {
  const years = uniqueSorted(
    rows.map((row) => row.ref_date),
    true,
  );
  return years.at(-1) ?? null;
}

function previousPeriod(rows: Observation[], current: string | null) {
  const years = uniqueSorted(
    rows.map((row) => row.ref_date),
    true,
  );
  if (!current) return null;
  const index = years.indexOf(current);
  return index > 0 ? years[index - 1] : null;
}

function geosAt(rows: Observation[], period: string | null) {
  return new Set(rows.filter((row) => row.ref_date === period).map((row) => row.geo));
}

function valueAt(rows: Observation[], period: string | null) {
  if (!period) return null;
  const values = rows
    .filter((row) => row.ref_date === period && row.value != null)
    .map((row) => row.value as number);
  return median(values);
}

function qualityAt(rows: Observation[], period: string | null) {
  if (!period) return "";
  return rows.find((row) => row.ref_date === period)?.status ?? "";
}

function scopeNote(base: string, rows: Observation[], period: string | null) {
  const count = geosAt(rows, period).size;
  if (count > 1) {
    return `${base} Unweighted median of ${count} provinces/territories; this table has no Canada total.`;
  }
  return base;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function rowsFor(datasetId: string, filters: Filters, defaults: "series" | "raw" = "series") {
  const rows = await loadDataset(datasetId);
  const config = getDataset(datasetId);
  const next: Filters = { ...filters, dataset: datasetId };

  if (defaults === "series") {
    next.geo = filters.geo ?? defaultGeo(rows);
    next.sex = filters.sex ?? defaultSex(rows);
    next.age = config.ageSupported ? (filters.age ?? defaultAge(rows)) : undefined;
  }

  return applyFilters(rows, next);
}

function seriesFromRows(rows: Observation[]): SeriesPoint[] {
  const byPeriod = new Map<string, number[]>();
  const statusByPeriod = new Map<string, string>();
  for (const row of rows) {
    if (row.value == null) continue;
    const list = byPeriod.get(row.ref_date) ?? [];
    list.push(row.value);
    byPeriod.set(row.ref_date, list);
    if (!statusByPeriod.has(row.ref_date)) statusByPeriod.set(row.ref_date, row.status);
  }

  return [...byPeriod.entries()]
    .sort((a, b) => yearSortKey(a[0]) - yearSortKey(b[0]))
    .flatMap(([period, values]) => {
      const value = median(values);
      if (value == null) return [];
      return [{ period, value, status: statusByPeriod.get(period) ?? "" }];
    });
}

export async function getMeta(datasetId?: string): Promise<MetaResponse> {
  const config = getDataset(datasetId);
  const { present, missing } = await datasetPresence();
  const rows = await loadDataset(config.id);
  const usable = rows.filter((row) => isPublishable(row) && isPercent(row));

  return {
    available: usable.length > 0,
    dataset: config.id,
    ageSupported: config.ageSupported,
    years: uniqueSorted(
      usable.map((row) => row.ref_date),
      true,
    ),
    geos: uniqueSorted(usable.map((row) => row.geo)),
    sexes: uniqueSorted(usable.map((row) => row.sex)),
    indicators: uniqueSorted(usable.map((row) => row.indicator)),
    ageGroups: config.ageSupported
      ? uniqueSorted(usable.map((row) => row.age_group))
      : [],
    present,
    missing,
    registry: DATASET_REGISTRY.map((item) => ({
      id: item.id,
      file: item.file,
      label: item.label,
      ageSupported: item.ageSupported,
      role: item.role,
    })),
  };
}

export async function getMetrics(filters: Filters): Promise<MetricCard[]> {
  const coreFilters = {
    geo: filters.geo,
    sex: filters.sex,
    year: undefined,
  };

  const mhGood = await rowsFor("perceived_mh_annual", {
    ...coreFilters,
    indicator: HEADLINE_INDICATORS.mhGood,
    age: undefined,
  });
  const mhPoor = await rowsFor("perceived_mh_annual", {
    ...coreFilters,
    indicator: HEADLINE_INDICATORS.mhPoor,
    age: undefined,
  });
  const ideation = await rowsFor("suicidal_thoughts", {
    geo: filters.geo,
    sex: filters.sex,
    age: filters.age,
    indicator: HEADLINE_INDICATORS.ideation,
  });

  const selected = await rowsFor("perceived_mh_annual", {
    ...coreFilters,
    indicator: filters.indicator ?? HEADLINE_INDICATORS.mhGood,
  });

  const goodPeriod = filters.year ?? latestPeriod(mhGood);
  const poorPeriod = filters.year ?? latestPeriod(mhPoor);
  const selectedPeriod = filters.year ?? latestPeriod(selected);
  const selectedPrev = previousPeriod(selected, selectedPeriod);
  const ideaPeriod = latestPeriod(ideation);
  const current = valueAt(selected, selectedPeriod);
  const previous = valueAt(selected, selectedPrev);

  return [
    {
      id: "mh-good",
      label: "Perceived mental health, very good or excellent",
      value: valueAt(mhGood, goodPeriod),
      unit: "%",
      delta: null,
      period: goodPeriod,
      note: scopeNote("CCHS two-year estimates, age 18+.", mhGood, goodPeriod),
      quality: qualityAt(mhGood, goodPeriod),
    },
    {
      id: "mh-poor",
      label: "Perceived mental health, fair or poor",
      value: valueAt(mhPoor, poorPeriod),
      unit: "%",
      delta: null,
      period: poorPeriod,
      note: scopeNote("CCHS two-year estimates, age 18+.", mhPoor, poorPeriod),
      quality: qualityAt(mhPoor, poorPeriod),
    },
    {
      id: "cycle-change",
      label: "Change from previous cycle",
      value: current != null && previous != null ? current - previous : null,
      unit: "pp",
      delta: current != null && previous != null ? current - previous : null,
      period: selectedPeriod && selectedPrev ? `${selectedPrev} → ${selectedPeriod}` : selectedPeriod,
      note: "Percentage-point change, not a continuous trend",
      quality: qualityAt(selected, selectedPeriod),
    },
    {
      id: "ideation",
      label: "Suicidal thoughts (ideation, not deaths)",
      value: valueAt(ideation, ideaPeriod),
      unit: "%",
      delta: null,
      period: ideaPeriod,
      note: "Latest available cycle. Not a suicide mortality rate.",
      quality: qualityAt(ideation, ideaPeriod),
    },
  ];
}

export async function getSeries(filters: Filters): Promise<SeriesPoint[]> {
  const dataset = filters.dataset ?? "perceived_mh_annual";
  const config = getDataset(dataset);
  const rows = await rowsFor(dataset, {
    ...filters,
    year: undefined,
    age: config.ageSupported ? filters.age : undefined,
    indicator: filters.indicator ?? config.defaultIndicator,
  });

  return seriesFromRows(rows);
}

export async function getBreakdown(
  filters: Filters & { dimension: "geo" | "age" | "sex" },
): Promise<BreakdownPoint[]> {
  const dataset = filters.dataset ?? "perceived_mh_annual";
  const config = getDataset(dataset);
  const rows = await loadDataset(dataset);
  const period =
    filters.year ??
    latestPeriod(rows.filter((row) => isPublishable(row) && isPercent(row)));

  const filtered = rows.filter((row) => {
    if (!isPublishable(row) || !isPercent(row)) return false;
    if (period && row.ref_date !== period) return false;
    if (filters.indicator && !matchesIndicator(row, filters.indicator ?? config.defaultIndicator)) {
      return false;
    }
    if (!filters.indicator && !matchesIndicator(row, config.defaultIndicator)) return false;
    if (filters.dimension !== "geo" && filters.geo && norm(row.geo) !== norm(filters.geo)) {
      return false;
    }
    if (filters.dimension !== "sex" && filters.sex && norm(row.sex) !== norm(filters.sex)) {
      return false;
    }
    if (
      filters.dimension !== "age" &&
      config.ageSupported &&
      filters.age &&
      norm(row.age_group) !== norm(filters.age)
    ) {
      return false;
    }
    if (filters.dimension === "geo" && (isNational(row.geo) || isRollup(row.geo) || !row.geo)) {
      return false;
    }
    if (filters.dimension === "age" && isTotalAge(row.age_group)) return false;
    if (filters.dimension === "sex" && isBothSexes(row.sex)) return false;
    if (filters.dimension !== "age" && config.ageSupported && !filters.age && !isTotalAge(row.age_group)) {
      return false;
    }
    if (filters.dimension !== "sex" && !filters.sex && !isBothSexes(row.sex)) return false;
    return true;
  });

  const byLabel = new Map<string, Observation>();
  for (const row of filtered) {
    const label =
      filters.dimension === "geo"
        ? row.geo
        : filters.dimension === "age"
          ? row.age_group
          : row.sex;
    if (!byLabel.has(label)) byLabel.set(label, row);
  }

  return [...byLabel.values()]
    .map((row) => ({
      label:
        filters.dimension === "geo"
          ? row.geo
          : filters.dimension === "age"
            ? row.age_group
            : row.sex,
      value: row.value as number,
      status: row.status,
    }))
    .sort((a, b) => b.value - a.value);
}

export async function getTable(filters: Filters, limit = 50, offset = 0) {
  const dataset = filters.dataset ?? "perceived_mh_annual";
  const rows = await loadDataset(dataset);
  const filtered = rows.filter((row) => {
    if (filters.year && row.ref_date !== filters.year) return false;
    if (filters.geo && norm(row.geo) !== norm(filters.geo)) return false;
    if (filters.sex && norm(row.sex) !== norm(filters.sex)) return false;
    if (filters.indicator && !matchesIndicator(row, filters.indicator)) return false;
    if (filters.age && norm(row.age_group) !== norm(filters.age)) return false;
    return true;
  });

  return {
    total: filtered.length,
    rows: filtered.slice(offset, offset + limit),
  };
}

export async function getInsights(filters: Filters): Promise<InsightBlock[]> {
  const trend = await getSeries({
    ...filters,
    dataset: "perceived_mh_annual",
    indicator: filters.indicator ?? HEADLINE_INDICATORS.mhPoor,
  });
  const regions = await getBreakdown({
    ...filters,
    dataset: "perceived_mh_annual",
    dimension: "geo",
    indicator: filters.indicator ?? HEADLINE_INDICATORS.mhPoor,
  });
  const ages = await getBreakdown({
    ...filters,
    dataset: "suicidal_thoughts",
    dimension: "age",
    indicator: HEADLINE_INDICATORS.ideation,
  });
  const risk = await getSeries({
    ...filters,
    dataset: "suicidal_thoughts",
    indicator: HEADLINE_INDICATORS.ideation,
  });

  const first = trend[0];
  const last = trend.at(-1);
  const topRegion = regions[0];
  const topAge = ages[0];
  const lastRisk = risk.at(-1);

  return [
    {
      id: "trend",
      title: "Trend insight",
      available: trend.length >= 2 && first != null && last != null,
      statement:
        first && last
          ? `${filters.indicator ?? HEADLINE_INDICATORS.mhPoor} moved from ${first.value}% in ${first.period} to ${last.value}% in ${last.period}.`
          : "Cycle-to-cycle change will appear after perceived_mh_annual.csv is uploaded.",
      meaning:
        "CCHS cycles are two-year estimates. This is a comparison between cycles, not a continuous national trend line.",
      points: trend,
      caveat: "The 2019–2024 window includes COVID-related collection changes.",
    },
    {
      id: "regional",
      title: "Regional insight",
      available: Boolean(topRegion),
      statement: topRegion
        ? `${topRegion.label} is the highest province/territory in the current filter at ${topRegion.value}%.`
        : "Provincial comparisons will appear after perceived_mh_annual.csv is uploaded.",
      meaning:
        "Use this to see where burden is higher than other provinces. It is not a ranking of individual risk.",
      points: regions.slice(0, 8),
      caveat: "Small provinces and territories are more often suppressed.",
    },
    {
      id: "demographic",
      title: "Demographic insight",
      available: Boolean(topAge),
      statement: topAge
        ? `${topAge.label} has the highest reported suicidal thoughts in the latest available cycle (${topAge.value}%).`
        : "Age-group differences require suicidal_thoughts.csv or stress_coping.csv.",
      meaning:
        "Age is only available on some tables. Perceived mental health is 18+ only.",
      points: ages,
      caveat: "Suicidal thoughts data currently ends in 2019 in the source extract.",
    },
    {
      id: "risk",
      title: "Risk insight",
      available: Boolean(lastRisk),
      statement: lastRisk
        ? `Reported suicidal thoughts were ${lastRisk.value}% in ${lastRisk.period}. This is ideation, not suicide mortality.`
        : "Risk indicators will appear after suicidal_thoughts.csv is uploaded.",
      meaning:
        "These figures support prevention-resource planning at the population level. They do not predict individual risk.",
      points: risk,
      caveat: "If this content is distressing, call or text 9-8-8 in Canada.",
    },
  ];
}
