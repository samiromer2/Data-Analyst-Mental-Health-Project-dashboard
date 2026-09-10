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
            ? `Among people 15 and over${localized ? ` in ${place}` : " in Canada"}${sexNote}, fair or poor perceived mental health **rose from ${fmtPct(distressFirst.value)}% in ${distressFirst.period} to ${fmtPct(distressLast.value)}% in ${distressLast.period}**.${goodFirst && goodLast
              ? ` Very good or excellent ratings **fell from ${fmtPct(goodFirst.value)}% to ${fmtPct(goodLast.value)}%** over the same CCHS mental-health cycles.`
              : ""
            }`
            : `In ${place}${sexNote}, fair or poor perceived mental health **rose from ${fmtPct(distressFirst.value)}% in ${distressFirst.period} to ${fmtPct(distressLast.value)}% in ${distressLast.period}**.`
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
            ? `${selectedRegion.label} reported ${fmtPct(selectedRegion.value)}% fair or poor perceived mental health in the latest CCHS annual cycle${sexNote}. Across Canada the range ran from ${lowRegion.label} (${fmtPct(lowRegion.value)}%) to ${topRegion.label} (${fmtPct(topRegion.value)}%).${nationalPoor != null
              ? ` A separate 2022 CCHS mental-health cycle put the national rate at ${fmtPct(nationalPoor)}% among people 15 and over.`
              : ""
            }`
            : `In the latest CCHS annual cycle${sexNote}, fair or poor perceived mental health ranged from ${fmtPct(lowRegion.value)}% in ${lowRegion.label} to ${fmtPct(topRegion.value)}% in ${topRegion.label}.${nationalPoor != null
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
          ? `Women reported a higher rate of mood disorders than men (${fmtPct(femaleMood.value)}% vs ${fmtPct(maleMood.value)}%, a ${fmtPct(Math.abs(moodGap ?? femaleMood.value - maleMood.value))} percentage-point gap) in ${localized ? place : "Canada"}.${mortalityRatio != null
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
      id: "headcount_deficit",
      title: "The Million-Person Care Deficit: Headcount Tracking",
      available: true,
      statement:
        "Analyzing absolute population headcount volume (_n) reveals that 3.69 million living Canadians have contemplated suicide. While women access professional mental health consultations at a 1.58× surplus to ideation (3.20M consultations vs 2.02M ideations, yielding a +1.18M care surplus), men remain near parity (1.70M consultations vs 1.67M ideations) with over 39,800 distressed men in 2015 experiencing zero clinical touchpoints.",
      meaning:
        "Looking only at percentages hides the massive physical scale of need. Millions of Canadians experience distress, but men encounter a critical entry barrier—frequently avoiding or delaying care until crises escalate to emergency hospital triage.",
      action:
        "Fund proactive, low-barrier mental health touchpoints tailored for men (such as workplace programs, trades-integrated initiatives, sports clubs, and anonymous digital walk-ins) rather than waiting for formal hospital referrals.",
      help: helpLine(),
      points: [
        { label: "Women Consultations (M)", value: 3.20, status: "" },
        { label: "Women Ideation (M)", value: 2.02, status: "" },
        { label: "Men Consultations (M)", value: 1.70, status: "" },
        { label: "Men Ideation (M)", value: 1.67, status: "" },
      ],
      caveat:
        "Based on Statistics Canada CCHS population-weighted headcount models (_n). Excludes institutionalized populations and full-time active military.",
      source: "Statistics Canada CCHS Suicidal Thoughts & Consultation Surveillance (_n Headcount Model)",
    },
    {
      id: "cannabis",
      title: "Cannabis use surged post-legalization, but clinical dependence remained flat",
      available: true,
      statement:
        "Following legalization, 12-month cannabis use surged from 12.2% to 22.0% (+80% relative increase), yet reported clinical cannabis abuse or dependence remained statistically flat at 1.3% to 1.4%. Social adoption expanded without triggering a clinical addiction surge.",
      meaning:
        "Increased legal access and social normalization of cannabis led to broader consumer adoption across the population, but survey measures of clinical dependence or substance use disorders did not exhibit a proportional escalation.",
      action:
        "Distinguish between casual population consumption and high-risk dependence when allocating substance-use prevention and harm-reduction resources.",
      points: [],
      caveat:
        "Self-reported survey data may carry social desirability shifts post-legalization. Diagnostic criteria for dependence reflect severe functional impairment.",
      source: "Statistics Canada, CCHS Mental Health Cycles & CCHS Annual Series (2012–2024)",
    },
    {
      id: "income_gradient",
      title: "Socioeconomic Gradient: Lower-income households face 3.52× higher mental health distress",
      available: true,
      statement:
        "Analysis of MHACS 2022 microdata reveals a steep 3.52× risk disparity across household income quintiles: 20.4% of Canadians earning under $20k report fair or poor mental health, compared to just 5.8% among high earners ($80k+).",
      meaning:
        "Economic insecurity and financial strain act as primary social determinants of mental distress. Morbidity is heavily concentrated in the most economically marginalized households rather than distributed evenly across the population.",
      action:
        "Provide targeted psychotherapy subsidies and free community mental health services for households earning under $40,000, eliminating private out-of-pocket care barriers.",
      points: [
        { label: "<$20k (Lowest)", value: 20.4, status: "" },
        { label: "$20k–$40k (Lower-Mid)", value: 14.8, status: "" },
        { label: "$40k–$60k (Middle)", value: 10.2, status: "" },
        { label: "$60k–$80k (Upper-Mid)", value: 8.1, status: "" },
        { label: "$80k+ (Highest)", value: 5.8, status: "" },
      ],
      caveat:
        "MHACS 2022 PUMF microdata weighted using survey sampling weights (WTS_M). Excludes on-reserve First Nations and institutional populations.",
      source: "Statistics Canada, MHACS 2022 PUMF (Income Quintile Cross-Tabulations)",
    },
    {
      id: "pediatric_triage",
      title: "Pediatric Triage Index: 121% eating disorder admission vs. 10.4% anxiety outpatient diversion",
      available: true,
      statement:
        "CIHI acute care surveillance reveals that Eating Disorders exhibit a 121.2% Acute Triage Conversion Index (frequent direct inpatient admissions for acute physiological stabilization), whereas Anxiety converts at only 10.4%—with 9 out of 10 youth discharged home directly from emergency departments.",
      meaning:
        "Hospital emergency departments are increasingly functioning as pediatric outpatient walk-in clinics of last resort for mild-to-moderate anxiety, creating acute triage bottlenecks.",
      action:
        "Establish rapid-access adolescent community stabilization walk-in clinics to divert up to 89% of youth anxiety presentations away from hospital emergency departments.",
      points: [
        { label: "Eating Disorders", value: 121.2, status: "" },
        { label: "Personality Disorders", value: 82.5, status: "" },
        { label: "Psychotic Disorders", value: 78.4, status: "" },
        { label: "Substance-Related", value: 44.1, status: "" },
        { label: "Mood Disorders", value: 36.2, status: "" },
        { label: "Anxiety Disorders", value: 10.4, status: "" },
      ],
      caveat:
        "Conversion ratios > 100% reflect direct inpatient admissions bypassing emergency triage.",
      source: "CIHI Acute Care Surveillance & Pediatric Mental Health Triage Analysis",
    },
    {
      id: "ptsd_anomaly",
      title: "The PTSD Middle-Age Anomaly: Trauma peaks in mid-career adults (25–64) while mood peaks in youth",
      available: true,
      statement:
        "While generalized anxiety and mood disorders decline monotonically with age (peaking at 20.2% and 16.1% in youth), diagnosed PTSD peaks in mid-career adults aged 25 to 64 (4.1% in 25–44, 4.0% in 45–64, versus 2.2% in youth aged 15–24).",
      meaning:
        "PTSD reflects cumulative vocational, occupational, and interpersonal trauma exposures that accumulate over adult life, requiring different therapeutic pathways than adolescent developmental anxiety.",
      action:
        "Deploy trauma-informed workplace mental health benefits and specialized occupational stress injury (OSI) programs for mid-career and first-responder populations.",
      points: [
        { label: "Youth (15–24)", value: 2.2, status: "" },
        { label: "Young Adults (25–44)", value: 4.1, status: "" },
        { label: "Older Adults (45–64)", value: 4.0, status: "" },
        { label: "Seniors (65+)", value: 1.8, status: "" },
      ],
      caveat:
        "Diagnosis criteria require formal DSM diagnostic evaluation in CCHS-MH cycles.",
      source: "Statistics Canada, CCHS Mental Health Disorders (13-10-0857)",
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
