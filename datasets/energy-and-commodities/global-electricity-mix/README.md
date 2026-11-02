World electricity generation and the share generated from solar, wind, all
renewables, low-carbon sources (renewables + nuclear) and fossil fuels, one row
per year.

- `data/global-electricity-mix.csv` — 41 rows, 1985 → 2025.
- `build.ts` — reproduces it from the archived Our World in Data snapshot. Run:
  `node build.ts` (add `--refresh` to re-fetch the source first). The build
  script and raw snapshot live in the
  [DataPressr repository](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/global-electricity-mix),
  not on DataHub.

## Source & licence

[Our World in Data — Energy dataset](https://github.com/owid/energy-data)
(`owid-energy-data.csv`, retrieved 2026-11-02, snapshot in `archive/`), which
compiles [Ember's Yearly Electricity Data](https://ember-energy.org/data/yearly-electricity-data/)
for recent years and the [Energy Institute's Statistical Review of World Energy](https://www.energyinst.org/statistical-review)
for earlier years. Released here as **CC-BY-4.0**, per Our World in Data's
standard licensing for data it produces/compiles:

> All visualizations, data, and code produced by Our World in Data are
> completely open access under the Creative Commons BY license.

## Coverage

The World aggregate in the source has no `electricity_generation` figure
before 1985 — this dataset starts there rather than at the source file's
earliest (1900) row. Solar's share is a genuine, non-interpolated zero in the
earliest years (0.012 TWh out of 9,886 TWh in 1985), not a missing value.

## Scope

This is the World aggregate only. The source file (`archive/owid-energy-data.csv`)
also carries the same columns, plus many more, broken out by country — out of
scope for this dataset, which exists to back a single global-solar story.
