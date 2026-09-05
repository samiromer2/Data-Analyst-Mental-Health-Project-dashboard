# Processed CSVs

Drop cleaned Track A files here. The API reads this folder on each request.

Start with:

- `perceived_mh_annual.csv`
- `suicidal_thoughts.csv`

Optional later:

- `stress_coping.csv`
- `cchs_mh_disorders.csv` (large)
- `perceived_health_quarterly.csv` (general health, not mental health)
- `cihi_mh_services.csv`
- `04_kpi_summary.csv` (curated scorecard from the analysis notebook — mortality ratio, 2015 consultation headcount, and other facts the percent-only charts cannot rebuild)

Do not upload `mhacs_2022_pumf.csv` or the synthetic Kaggle file.

## Expected columns

`ref_date, geo, age_group, sex, indicator, characteristic, uom, value, status`

Percent rows are used for charts. Status `F` and `x` are dropped. Empty cells stay empty.

## `trend_predictions.csv`

Precomputed output of the real-data Trend Direction Model (`06_trend_direction_model.ipynb` in
the analysis repo, `HistGradientBoostingClassifier`, test accuracy 0.758 / macro-F1 0.745). The
dashboard never trains or runs sklearn — this file is the only bridge between the notebook and
the UI. Regenerate it from the analysis repo's `data/processed/mh_long.csv` +
`models/06_trend_direction_model.joblib` and copy it here; do not hand-edit it.

Columns: `source, geo, geo_level, sex, age_group, indicator, year_t, year_t1, value_t, delta,
actual_direction, is_latest_observed_cycle, model_signal, model_probability_up,
model_probability_down, quality_flag_t, ci_width_t, within_ci_margin`.

`is_latest_observed_cycle = true` rows are the only ones with a forward "model signal" (no
`year_t1`/`delta` — there is no next real cycle yet, by design). `is_latest_observed_cycle = false`
rows are backtest transitions with a known `actual_direction`, used for the Top Trends table.

Note: `sex` here uses `Both/Female/Male`, while the other CSVs in this folder use
`"Both sexes"/"Females"/"Males"` (and `cchs_mh_disorders.csv` uses `Men+`/`Women+`). `lib/trend.ts`
normalizes this when matching a series to the dashboard's current filters — do not assume an
exact string match against the other files here.
