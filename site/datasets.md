---
title: Datasets
description: Datasets produced with the DataPressr skills, with lifecycle status and links.
---

# Datasets

Datasets produced with the DataPressr skills. Status follows the lifecycle:
`capture → stub → archived → structured → enriched → monitored`.

| Dataset | Status | Source | Licence | Links |
|---------|--------|--------|---------|-------|
| **Project Drawdown — Table of Solutions (2020)** | structured | Project Drawdown, 2020 review (via community mirror) | PDDL-1.0 (facts) + attribution | [folder](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/project-drawdown) · [README](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/project-drawdown/README.md) |
| **CO2 concentration — Mauna Loa (Keeling Curve)** | *in progress* | NOAA GML | Public domain (US gov) | [#8](https://github.com/datasets/datapressr/issues/8) |

## Project Drawdown — notes

82 ranked climate solutions, total atmospheric CO₂-equivalent reduction (gigatons,
cumulative 2020–2050) under two scenarios, plus solution↔sector links. Two tidy
typed resources; reproducible `build.ts`; `/validate` clean.

Caveats worth knowing before reuse:

- **Licence.** drawdown.org's own terms are all-rights-reserved. Our position: the
  values are facts, not per se copyrightable, and we reproduce only the numbers as
  tidy tables — released as PDDL-1.0 with clear attribution to Project Drawdown.
- **Vintage.** This is the 2020 review. Project Drawdown redesigned its
  Table of Solutions in 2025 and no longer publishes the two-scenario table in
  this form; the data here comes from a dated community mirror.
- **Not yet relocated.** It currently sits inside the `datapressr` repo for review;
  it belongs in the `datasets/climate-and-environment` catalog repo.

## Data stories

None yet. [#9](https://github.com/datasets/datapressr/issues/9) — the Keeling Curve
before/after — is the first, and will appear here once written.
