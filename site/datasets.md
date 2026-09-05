---
title: Datasets
description: Datasets produced with the DataPressr skills, with lifecycle status and links.
---

# Datasets

Datasets produced with the DataPressr skills. Status follows the lifecycle:
`capture → stub → archived → structured → enriched → monitored`.

| Dataset | Status | Source | Licence | Links |
|---------|--------|--------|---------|-------|
| **Project Drawdown — Table of Solutions (2020)** | structured · own repo | Project Drawdown, 2020 review (via community mirror) | PDDL-1.0 (facts) + attribution | [repo](https://github.com/datasets/project-drawdown) · [README](https://github.com/datasets/project-drawdown/blob/main/README.md) |
| **CO₂ concentration — Mauna Loa (Keeling Curve)** | structured | NOAA GML | PDDL-1.0 (US-gov public domain) + citation | [folder](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/co2-ppm) · [README](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/co2-ppm/README.md) · [story](stories/keeling-curve.md) |

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
- **Own repo.** Moved out of `datapressr` on 2026-09-05 to
  <https://github.com/datasets/project-drawdown> (a single dataset, so its own
  repo rather than a catalog). DataHub publish is still pending.

## Data stories

- **[The Keeling Curve](stories/keeling-curve.md)** — from a NOAA text file to the
  single most important line in climate science, and what the line says. The first
  hand-written story; its friction notes feed the charting decision and the future
  `enrich` / `story` skills.
