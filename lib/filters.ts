import type { Filters } from "./types";

type RawParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseFilters(params: RawParams): Filters {
  return {
    dataset: one(params.dataset),
    year: one(params.year),
    geo: one(params.geo),
    sex: one(params.sex),
    indicator: one(params.indicator),
    age: one(params.age),
  };
}

export function toSearchParams(filters: Filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}
