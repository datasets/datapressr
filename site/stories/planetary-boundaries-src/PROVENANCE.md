# Source snapshot — Planetary Boundaries story

The story consumes an already-published dataset. These files are a dated snapshot
so the story's charts stay reproducible if the upstream dataset changes.

- Source: **`datasets/climate-and-environment/planetary-boundaries`**
  (published at <https://datahub.io/climate-and-environment/planetary-boundaries>)
- Retrieved: 2026-09-05, from
  <https://github.com/datasets/climate-and-environment/tree/main/planetary-boundaries>
- Licence: CC-BY-4.0 (as declared by the source dataset)
- Underlying science: Steffen et al. 2015 (*Science*) and Richardson et al. 2023
  (*Science Advances*); temporal-evolution series compiled by Bastien Gauthier
  ([BastienGauthier/planetary-flag](https://github.com/BastienGauthier/planetary-flag)).

Files:

| File | What it is |
|------|-----------|
| `boundaries.csv` | One row per indicator (12 sub-indicators across 9 boundaries): boundary value, zone of uncertainty, current value + year, whether exceeded. |
| `boundary-evolution.csv` | Long time series per indicator, pre-industrial (1850, some to year 0) → 2025. |
| `source-datapackage.json` | The source dataset's `datapackage.json`, as retrieved. |

This is **not** a re-wrangle — no `build.ts` here. If this becomes a DataPressr
dataset in its own right, that's separate work.
