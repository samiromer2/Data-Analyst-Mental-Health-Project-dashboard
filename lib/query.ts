import {
  DATASET_REGISTRY,
  HEADLINE_INDICATORS,
  NATIONAL_GEOS,
  REGION_ROLLUPS,
  getDataset,
} from "./datasets";
import {
  datasetPresence,
  isPercent,
  isPublishable,
  kpiNumber,
  loadDataset,
  loadKpiSummary,
} from "./store";
import { getTrendSignal, normalizeSexBucket } from "./trend";
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

function fmtPct(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function fmtCount(value: number) {
  return Math.round(value).toLocaleString("en-CA");
}

function isProvinceFilter(geo?: string) {
  return Boolean(geo) && !isNational(geo ?? "");
}

function scopeLabel(filters: Filters) {
  if (isProvinceFilter(filters.geo)) return filters.geo as string;
  return "Canada";
}

function sexScopeNote(filters: Filters) {
  const bucket = normalizeSexBucket(filters.sex);
  if (bucket === "female") return " among females";
  if (bucket === "male") return " among males";
  return "";
}

function helpLine() {
  return "This is a population pattern, not a personal diagnosis. If you or someone you know is in crisis, support is available.";
}

export async function getInsights(filters: Filters): Promise<InsightBlock[]> {
  const kpis = await loadKpiSummary();
  const scoped: Filters = {
    geo: filters.geo,
    sex: filters.sex,
    year: filters.year,
  };
  const national: Filters = { sex: filters.sex };
  const localized = isProvinceFilter(filters.geo);

  const ideationGeo = localized ? filters.geo : "Canada (excluding territories)";
  const disorderGeo = localized ? filters.geo : "Canada";
  const watchFilters: Filters = localized
    ? {
        ...filters,
        dataset: filters.dataset ?? "perceived_mh_annual",
        indicator: filters.indicator ?? HEADLINE_INDICATORS.mhPoor,
      }
    : {
        dataset: "cchs_mh_disorders",
        geo: "Canada",
        sex: filters.sex,
        indicator: HEADLINE_INDICATORS.mhPoor,
      };

  const [longPoor, longGood, annualPoor, regions, ages, moodBySex, consultBySex, trendResult] =
    await Promise.all([
      getSeries({
        ...scoped,
        dataset: "cchs_mh_disorders",
        indicator: HEADLINE_INDICATORS.mhPoor,
      }),
      getSeries({
        ...scoped,
        dataset: "cchs_mh_disorders",
        indicator: HEADLINE_INDICATORS.mhGood,
      }),
      getSeries({
        ...scoped,
        dataset: "perceived_mh_annual",
        indicator: HEADLINE_INDICATORS.mhPoor,
      }),
      getBreakdown({
        ...scoped,
        dataset: "perceived_mh_annual",
        dimension: "geo",
        indicator: HEADLINE_INDICATORS.mhPoor,
      }),
      getBreakdown({
        ...scoped,
        geo: ideationGeo,
        dataset: "suicidal_thoughts",
        dimension: "age",
        indicator: HEADLINE_INDICATORS.ideation,
      }),
      getBreakdown({
        ...national,
        geo: disorderGeo,
        dataset: localized ? "perceived_mh_annual" : "cchs_mh_disorders",
        dimension: "sex",
        indicator: localized ? "Mood disorder" : "Any mood disorder, 12 months",
      }),
      getBreakdown({
        ...national,
        geo: "Canada (excluding territories)",
        dataset: "suicidal_thoughts",
        year: "2015",
        dimension: "sex",
        indicator: "Consultation with a health professional about emotional or mental health",
      }),
      getTrendSignal(watchFilters),
    ]);

  const useLongTrack = longPoor.length >= 2;
  const distress = useLongTrack ? longPoor : annualPoor;
  const distressFirst = distress[0];
  const distressLast = distress.at(-1);
  const goodFirst = longGood[0];
  const goodLast = longGood.at(-1);
  const place = scopeLabel(filters);
  const sexNote = sexScopeNote(filters);

  const topRegion = regions[0];
  const lowRegion = regions.at(-1);
  const selectedRegion = localized
    ? regions.find((row) => norm(row.label) === norm(filters.geo ?? ""))
    : undefined;
  const nationalPoor = kpiNumber(kpis, "national_fair_poor_mh_latest_pct");

  const young = ages.find((row) => /18\s*to\s*34/i.test(row.label));
  const older = ages.find((row) => /65/.test(row.label));
  const topAge = young ?? ages[0];
  const agePhrase = (label: string) =>
    /65/.test(label) ? "people 65 and over" : `people aged ${label.replace(/\s*years.*$/i, "")}`;

  const femaleMood = moodBySex.find((row) => normalizeSexBucket(row.label) === "female");
  const maleMood = moodBySex.find((row) => normalizeSexBucket(row.label) === "male");
  const moodGap =
    femaleMood && maleMood ? femaleMood.value - maleMood.value : kpiNumber(kpis, "female_minus_male_mood_disorder_pp");
  const mortalityRatio = kpiNumber(kpis, "male_to_female_suicide_mortality_ratio");
  const contactGap = kpiNumber(kpis, "national_unassisted_crisis_headcount");

  const blocks: InsightBlock[] = [
    {
      id: "distress",
      title: "Reported distress rose between survey cycles",
      available: Boolean(distressFirst && distressLast && distress.length >= 2),
      statement:
        distressFirst && distressLast
          ? useLongTrack
            ? `Among people 15 and over${localized ? ` in ${place}` : " in Canada"}${sexNote}, fair or poor perceived mental health rose from ${fmtPct(distressFirst.value)}% in ${distressFirst.period} to ${fmtPct(distressLast.value)}% in ${distressLast.period}.${
                goodFirst && goodLast
                  ? ` Very good or excellent ratings fell from ${fmtPct(goodFirst.value)}% to ${fmtPct(goodLast.value)}% over the same CCHS mental-health cycles.`
                  : ""
              }`
            : `In ${place}${sexNote}, fair or poor perceived mental health rose from ${fmtPct(distressFirst.value)}% in ${distressFirst.period} to ${fmtPct(distressLast.value)}% in ${distressLast.period}.`
          : "Cycle-to-cycle change will appear after the perceived-mental-health tables are uploaded.",
      meaning:
        "More people in later survey cycles described their mental health as fair or poor. That is a planning signal for capacity and access — not a diagnosis of any person, and not a continuous year-by-year national trend line.",
      action:
        "Treat the rise as a reason to review local wait times, after-hours access, and community programs — especially where the later cycle is well above the earlier one.",
      points: distress,
      caveat:
        "CCHS cycles are far apart, and the 2019–2024 window includes COVID-related collection changes. Different tables use different age cut-offs (15+ vs 18+).",
      source: useLongTrack
        ? "Statistics Canada, CCHS mental-health cycles (2002, 2012, 2022)"
        : "Statistics Canada, CCHS annual perceived mental health (2019/2020–2023/2024), age 18+",
    },
    {
      id: "place",
      title: "Place matters for where support may be needed",
      available: Boolean(topRegion && lowRegion),
      statement:
        topRegion && lowRegion
          ? selectedRegion
            ? `${selectedRegion.label} reported ${fmtPct(selectedRegion.value)}% fair or poor perceived mental health in the latest CCHS annual cycle${sexNote}. Across Canada the range ran from ${lowRegion.label} (${fmtPct(lowRegion.value)}%) to ${topRegion.label} (${fmtPct(topRegion.value)}%).${
                nationalPoor != null
                  ? ` A separate 2022 CCHS mental-health cycle put the national rate at ${fmtPct(nationalPoor)}% among people 15 and over.`
                  : ""
              }`
            : `In the latest CCHS annual cycle${sexNote}, fair or poor perceived mental health ranged from ${fmtPct(lowRegion.value)}% in ${lowRegion.label} to ${fmtPct(topRegion.value)}% in ${topRegion.label}.${
                nationalPoor != null
                  ? ` A separate 2022 CCHS mental-health cycle put the national rate at ${fmtPct(nationalPoor)}% among people 15 and over.`
                  : ""
              }`
          : "Provincial comparisons will appear after perceived_mh_annual.csv is uploaded.",
      meaning:
        "Provinces and territories do not report the same burden. Differences can reflect both how people are feeling and how they answer surveys. This is an ecological pattern — it does not rank individual risk.",
      action: localized
        ? `Compare ${place} with the national and provincial range when deciding where outreach and prevention resources should go.`
        : "Use the provincial range to see which places sit well above or below the rest of the country before allocating outreach.",
      points: regions,
      caveat:
        "Small provinces and territories are more often suppressed. The annual CCHS table has no Canada total; the 15.3% national figure comes from the 2022 mental-health cycle.",
      source: "Statistics Canada, CCHS annual perceived mental health, latest cycle, age 18+",
    },
    {
      id: "youth",
      title: "Younger adults report more suicidal thoughts",
      available: Boolean(topAge),
      statement:
        young && older
          ? `In ${place === "Canada" ? "Canada (excluding territories)" : place}, ${agePhrase(young.label)} reported suicidal thoughts at ${fmtPct(young.value)}%, compared with ${fmtPct(older.value)}% among ${agePhrase(older.label)} in the latest available cycle.${sexNote ? ` Figures are${sexNote}.` : ""} This is self-reported ideation, not suicide deaths.`
          : topAge
            ? `${agePhrase(topAge.label)} had the highest reported suicidal thoughts in the latest available cycle (${fmtPct(topAge.value)}%) in ${place === "Canada" ? "Canada (excluding territories)" : place}. This is ideation, not suicide deaths.`
            : "Age-group differences require suicidal_thoughts.csv.",
      meaning:
        "Younger adults were more likely to report having had suicidal thoughts. That is a population-level pattern about who is asking for help in surveys — it does not mean any young person is in danger, and it is not a suicide mortality rate.",
      action:
        "Communities can prioritize after-hours and low-barrier support for people 18–34, and keep crisis access visible where younger adults already go.",
      help: helpLine(),
      points: ages,
      caveat:
        "The suicidal-thoughts extract currently ends in 2019. CCHS excludes people living on First Nations reserves, in institutions, and full-time military.",
      source: "Statistics Canada, CCHS suicidal thoughts table, latest cycle (2019)",
    },
    {
      id: "gender",
      title: "Women report more distress; men die by suicide more often",
      available: Boolean(femaleMood && maleMood) || mortalityRatio != null,
      statement:
        femaleMood && maleMood
          ? `Women reported a higher rate of mood disorders than men (${fmtPct(femaleMood.value)}% vs ${fmtPct(maleMood.value)}%, a ${fmtPct(Math.abs(moodGap ?? femaleMood.value - maleMood.value))} percentage-point gap) in ${localized ? place : "Canada"}.${
              mortalityRatio != null
                ? ` In CIHI mortality data, men died by suicide about ${fmtPct(mortalityRatio)} times as often as women.`
                : ""
            }`
          : mortalityRatio != null
            ? `Women were more likely to report mood disorders and suicidal thoughts in the survey tables. In CIHI mortality data, men died by suicide about ${fmtPct(mortalityRatio)} times as often as women.`
            : "Gender comparisons will appear after the disorder and KPI tables are uploaded.",
      meaning:
        "Survey reporting, service use, and death records do not tell the same story by sex. The pattern is consistent with differences in help-seeking and in how distress is recorded — not a claim that one group is “at risk” as individuals.",
      action:
        "Plan for both sides: accessible care for women, who report more illness, and outreach for men that does not wait until a crisis.",
      help: helpLine(),
      points: moodBySex,
      caveat:
        "Mood-disorder rates and suicide deaths come from different sources and years. They are not one combined score. Language here is associational only.",
      source: localized
        ? "Statistics Canada CCHS annual mood disorder (18+) and CIHI suicide mortality (KPI scorecard)"
        : "Statistics Canada CCHS-MH 2022, any mood disorder in the past 12 months; CIHI suicide mortality ratio from the analysis scorecard",
    },
    {
      id: "contact",
      title: "A large gap between men’s reported thoughts and consultation",
      available: contactGap != null,
      statement:
        contactGap != null
          ? `In the 2015 national survey, about ${fmtCount(contactGap)} more men reported suicidal thoughts than appeared in professional consultation counts.${
              localized
                ? ` That headcount is Canada-level, not a ${place} total.`
                : ""
            } Consultation rates were also lower for men than for women.`
          : "The 2015 consultation gap will appear after 04_kpi_summary.csv is uploaded.",
      meaning:
        "A population can report thoughts of suicide and still not show up in professional consultation statistics. The gap is a survey headcount from 2015, useful for outreach design, not a current-year caseload.",
      action:
        "Prefer lower-barrier entry points — anonymous, after-hours, or peer options — over awareness campaigns alone.",
      help: helpLine(),
      points: consultBySex,
      caveat:
        "2015 survey headcounts, not administrative records. Ideation is not the same as suicide deaths. Do not treat this as a prediction for any person.",
      source: "Statistics Canada CCHS 2015 suicidal-thoughts and consultation tables; analysis KPI scorecard",
    },
  ];

  if (trendResult.status === "ok") {
    const row = trendResult.row;
    const probability =
      row.modelSignal === "Up" ? row.modelProbabilityUp : row.modelProbabilityDown;
    blocks.push({
      id: "watchlist",
      title: "A model watch list for the next published cycle",
      available: true,
      statement: `For ${row.indicator} in ${row.geo}, the model suggests the next published cycle is more likely to move ${row.modelSignal.toLowerCase()} (probability ${fmtPct(probability * 100)}%). The latest reported value was ${fmtPct(row.valueT)}% in ${row.yearT}.`,
      meaning:
        "This is a triage signal for which series to watch before the next Statistics Canada release. It is not a forecast of anyone’s health and not evidence that a change will be statistically significant.",
      action:
        "Use an “up” or “down” flag to decide which indicator to review next — then read the actual table, confidence interval, and indicator polarity.",
      points: useLongTrack ? longPoor : annualPoor,
      caveat:
        "Most historical moves on these tables are smaller than the estimate’s own confidence interval. “Up” is not the same as “worse” — it depends on what the indicator measures.",
      source: "Trend Direction Model on real StatCan/CIHI series (see About the Data)",
    });
  }

  return blocks;
}
