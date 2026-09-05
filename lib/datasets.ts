import type { DatasetConfig } from "./types";

export const DATASET_REGISTRY: DatasetConfig[] = [
  {
    id: "perceived_mh_annual",
    file: "perceived_mh_annual.csv",
    label: "Perceived mental health (CCHS)",
    ageSupported: false,
    defaultIndicator: "Perceived mental health, very good or excellent",
    role: "core",
  },
  {
    id: "suicidal_thoughts",
    file: "suicidal_thoughts.csv",
    label: "Suicidal thoughts and positive mental health",
    ageSupported: true,
    defaultIndicator: "Suicidal thoughts (15 years and over)",
    role: "risk",
  },
  {
    id: "stress_coping",
    file: "stress_coping.csv",
    label: "Stress and coping",
    ageSupported: true,
    defaultIndicator:
      "Ability to handle the day-to-day demands in life, good or excellent",
    role: "support",
  },
  {
    id: "cchs_mh_disorders",
    file: "cchs_mh_disorders.csv",
    label: "CCHS mental health disorders",
    ageSupported: true,
    defaultIndicator: "Any selected disorder, 12 months",
    role: "comparison",
  },
  {
    id: "perceived_health_quarterly",
    file: "perceived_health_quarterly.csv",
    label: "Perceived general health (context only)",
    ageSupported: false,
    defaultIndicator: "Excellent or very good perceived health",
    role: "context",
  },
  {
    id: "cihi_mh_services",
    file: "cihi_mh_services.csv",
    label: "CIHI mental-health services",
    ageSupported: false,
    defaultIndicator: "Self-rated mental health in youth",
    role: "support",
  },
];

export const SECTION_DATASET: Record<string, string> = {
  "/dashboard": "perceived_mh_annual",
  "/dashboard/trends": "perceived_mh_annual",
  "/dashboard/geographic": "perceived_mh_annual",
  "/dashboard/demographics": "stress_coping",
  "/dashboard/risk": "suicidal_thoughts",
  "/insights": "perceived_mh_annual",
};

export const SECTION_AGE: Record<string, boolean> = {
  "/dashboard": false,
  "/dashboard/trends": false,
  "/dashboard/geographic": false,
  "/dashboard/demographics": true,
  "/dashboard/risk": true,
  "/insights": false,
};

export const HEADLINE_INDICATORS = {
  mhGood: "Perceived mental health, very good or excellent",
  mhPoor: "Perceived mental health, fair or poor",
  ideation: "Suicidal thoughts (15 years and over)",
};

export const NATIONAL_GEOS = [
  "canada",
  "canada (excluding territories)",
  "canada excluding territories",
];

export const REGION_ROLLUPS = [
  "atlantic",
  "atlantic region",
  "atlantic provinces",
  "prairies",
  "prairie region",
  "prairies region",
];

export function getDataset(id?: string) {
  return DATASET_REGISTRY.find((item) => item.id === id) ?? DATASET_REGISTRY[0];
}
