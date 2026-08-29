export type Observation = {
  dataset: string;
  ref_date: string;
  geo: string;
  age_group: string;
  sex: string;
  indicator: string;
  characteristic: string;
  uom: string;
  value: number | null;
  status: string;
};

export type Filters = {
  dataset?: string;
  year?: string;
  geo?: string;
  sex?: string;
  indicator?: string;
  age?: string;
};

export type DatasetConfig = {
  id: string;
  file: string;
  label: string;
  ageSupported: boolean;
  defaultIndicator: string;
  role: "core" | "risk" | "support" | "comparison" | "context";
};

export type MetricCard = {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  delta: number | null;
  period: string | null;
  note: string;
  quality: string;
};

export type SeriesPoint = {
  period: string;
  value: number;
  status: string;
};

export type BreakdownPoint = {
  label: string;
  value: number;
  status: string;
};

export type InsightBlock = {
  id: string;
  title: string;
  statement: string;
  meaning: string;
  points: SeriesPoint[] | BreakdownPoint[];
  available: boolean;
  caveat: string;
};

export type MetaResponse = {
  available: boolean;
  dataset: string | null;
  ageSupported: boolean;
  years: string[];
  geos: string[];
  sexes: string[];
  indicators: string[];
  ageGroups: string[];
  present: string[];
  missing: string[];
  registry: Array<Pick<DatasetConfig, "id" | "file" | "label" | "ageSupported" | "role">>;
};
