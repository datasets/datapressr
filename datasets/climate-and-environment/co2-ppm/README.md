# CO₂ concentration at Mauna Loa (the Keeling Curve)

The longest continuous record of atmospheric carbon dioxide — the Mauna Loa
series begun by C. David Keeling in March 1958 — plus the NOAA global mean and
NOAA's published growth rates, in parts per million (ppm) of dry air.

- `data/co2-monthly-mlo.csv` — Mauna Loa monthly mean (821 rows, 1958-03 → 2026-07)
- `data/co2-annual-mlo.csv` — Mauna Loa annual mean (67 rows, 1959 → 2025)
- `data/co2-annual-global.csv` — global marine-boundary-layer annual mean (47 rows, 1979 → 2025)
- `data/co2-growth-annual.csv` — annual growth rate (ppm/yr, 1 Jan → 31 Dec), Mauna Loa and global, as published by NOAA (67 rows, 1959 → 2025)
- `data/co2-growth-decadal.csv` — mean annual growth per decade, derived from the annual growth series (8 rows)
- `build.ts` — reproduces all five from the archived NOAA source. Run: `node build.ts`.

## Source & licence

NOAA Global Monitoring Laboratory, *Trends in Atmospheric Carbon Dioxide*
(<https://gml.noaa.gov/ccgg/trends/data.html>). Files `co2_mm_mlo.csv` and
`co2_annmean_mlo.csv` retrieved 2026-08-30; `co2_gr_mlo.csv`, `co2_annmean_gl.csv`
and `co2_gr_gl.csv` retrieved 2026-09-05 (snapshots in `archive/`).

NOAA GML data are a US Government work, made freely available to the public. The
Mauna Loa record is a joint **NOAA / Scripps** effort begun by **C. David Keeling**.
Released here as **PDDL-1.0** with citation requested:

> Xin Lan, Pieter Tans and Kirk W. Thoning, *Trends in globally-averaged CO₂*,
> NOAA GML. And: C. D. Keeling et al., Scripps Institution of Oceanography.

## Missing values

NOAA uses negative sentinels for "no information": `-1` (`num_days`), `-9.99`
(`std_dev`), `-0.99` (monthly `uncertainty`). These are all normalised to empty
cells. They occur for every month before May 1974 (that stretch comes from Scripps,
which didn't record daily-count statistics) and for interpolated missing months.
The `co2_ppm` value itself is never missing — NOAA interpolates gaps.

## Comparison with the community dataset (`github.com/datasets/co2-ppm`)

Issue [#8](https://github.com/datasets/datapressr/issues/8) called for diffing this
against the existing human-made version. What that turned up:

- **The community dataset's monthly file is currently mis-labelled.** It is kept
  up to date by `scripts/process.sh` + a GitHub Action, but NOAA restructured
  `co2_mm_mlo.csv` — it added `sdev` and `unc` columns and renamed `interpolated`
  to `deseasonalized`. The shell script wasn't updated, so the published header
  still reads `Date,Decimal Date,Average,Interpolated,Trend,Number of Days` (6
  names) while every data row now has 7 values. The upshot: their `Trend` column
  actually contains `ndays`, and their `Number of Days` column actually contains
  `sdev`. The declared schema no longer matches the data, and nothing flagged it
  because there's no check of the data against the schema.
- **This build guards against exactly that.** `build.ts` asserts the NOAA header
  it expects and throws a clear error if the shape changes, rather than silently
  emitting shifted columns. The column names here (`co2_ppm`,
  `co2_ppm_deseasonalized`, `num_days`, `std_dev`, `uncertainty`) track NOAA's
  current meanings, not a 2015-era layout.
- **Scope now overlaps closely.** As of 2026-09-05 this dataset also carries the
  global annual mean and NOAA's annual growth rates (Mauna Loa and global), plus
  a derived decadal-mean-growth table. It still omits the global *monthly* series
  (`co2_mm_gl.csv`), which is an easy further follow-up. Where the community
  dataset differences annual means to get a growth rate, this one carries NOAA's
  own published growth figures (computed from monthly data, Jan 1 → Dec 31).
- **Where they're better:** it's genuinely *monitored* (auto-updating) and has
  polished `views`. This one is a point-in-time snapshot with a reproducible
  build; wiring it to a schedule is the `monitor` skill's job
  ([#6](https://github.com/datasets/datapressr/issues/6)), not done here.

## What the `structure` skill made easy vs awkward

- **Easy:** the missing-value normalisation idiom (one `num(raw, sentinels)`
  helper applied per column), the deterministic re-run check, the typed-schema
  discipline that made the upstream drift obvious the moment the columns were
  named.
- **Awkward:** nothing in the skill covers *comment/preamble lines* (40 of them
  here, `#`-prefixed) — obvious to handle, but it's a near-universal shape for
  government text data and deserves a line in the playbook. Same for
  "source ships negative sentinels rather than blanks", which is common enough to
  name explicitly.
