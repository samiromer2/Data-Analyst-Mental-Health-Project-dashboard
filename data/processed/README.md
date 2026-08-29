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

Do not upload `mhacs_2022_pumf.csv` or the synthetic Kaggle file.

## Expected columns

`ref_date, geo, age_group, sex, indicator, characteristic, uom, value, status`

Percent rows are used for charts. Status `F` and `x` are dropped. Empty cells stay empty.
