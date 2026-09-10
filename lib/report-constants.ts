/**
 * Values that were hardcoded as DAX measures in the teammate's Power BI file
 * (powerpi/Data-Analyst-Mental-Health-Project.pbix) rather than computed from a
 * table. Kept here verbatim so the rebuilt report matches the .pbix. Anything
 * derivable from a CSV is computed in report.ts instead.
 */
export const PBIX_CONSTANTS = {
  nationalFairPoorRate: 15.3, // National_MH_Rate (0.153)
  provincesWorsening: "10 / 10", // Province_Worsening_Rate
  postCovidDeteriorationMillions: 1.91, // PostCovid_Deterioration ("1.91 M")
  regionalConcentration: "60%+ in ON/QC", // Concentration_ON_QC
  peakInpatientRatePer100k: 1934.1, // PeakInpatientRate
  eatingDisorderConversionPct: 121.2, // EatingDisorderConversion
  anxietyConversionPct: 10.4, // AnxietyConversion
} as const;

export const REPORT_TABS = [
  { href: "/dashboard/report", label: "Executive Overview" },
  { href: "/dashboard/report/provincial", label: "Provincial Explorer" },
  { href: "/dashboard/report/demographics", label: "Demographics" },
  { href: "/dashboard/report/youth", label: "Youth Crisis Monitor" },
] as const;

export const PROVINCES = [
  "Newfoundland and Labrador",
  "Prince Edward Island",
  "Nova Scotia",
  "New Brunswick",
  "Quebec",
  "Ontario",
  "Manitoba",
  "Saskatchewan",
  "Alberta",
  "British Columbia",
  "Yukon",
  "Northwest Territories",
  "Nunavut",
];
