// Static, versioned facts about the trained Trend Direction Model.
// Sourced from models/06_metrics.json in the analysis repo (this describes
// one specific trained model, not live data - same pattern as
// HEADLINE_INDICATORS in lib/datasets.ts).

export const TREND_MODEL_INFO = {
  name: "Trend Direction Model",
  algorithm: "HistGradientBoostingClassifier",
  target: "Direction (Up / Down) of the next reported percentage in a comparable series",
  trainingData:
    "Real, cleaned Statistics Canada and CIHI observations (data/processed/mh_long.csv) - no synthetic data",
  nTransitions: 8142,
  testAccuracy: 0.758,
  testMacroF1: 0.745,
  perClassF1: {
    Down: 0.687,
    Up: 0.803,
  },
  pctMovesWithinCiMargin: 0.793,
  summary:
    "The Trend Direction Model analyzes historical StatCan/CIHI observations and estimates " +
    "whether the next reported percentage in a comparable series is more likely to move up or " +
    "down. It is an analytical signal based on historical patterns, not a clinical prediction " +
    "and not evidence of a statistically significant change.",
  limitation:
    "This model predicts the direction of the reported point estimate, not statistical " +
    "significance. Confidence intervals on these estimates are often 7-11 percentage points " +
    "wide, so a small predicted move may fall well within normal sampling variation. " +
    "“Up” is not the same as “worse” - it depends on what the indicator measures.",
} as const;
