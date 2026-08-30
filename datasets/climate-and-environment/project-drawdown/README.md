# Project Drawdown — Table of Solutions (2020)

Ranked climate solutions from Project Drawdown's 2020 review: total atmospheric
CO2-equivalent reduction (gigatons, cumulative 2020–2050) for 82 solutions under
two scenarios, plus the sector(s) each belongs to.

- `data/solutions.csv` — one row per (solution, scenario). 164 rows; 12 empty
  values for the 6 solutions named but not modelled in 2020.
- `data/solution_sectors.csv` — one row per (solution, sector); a solution can
  belong to more than one of Drawdown's nine sectors.
- `build.ts` — reproduces both CSVs deterministically from
  `archive/commons-329-project-drawdown-snapshot.md`. Run: `node build.ts`.

## Licensing

Project Drawdown's own [Terms of Use](https://drawdown.org/terms-of-use) reserve
all rights and offer no Creative Commons or other open licence for the site's
content.

Our position: **the values in this dataset are facts** — measured and modelled
estimates of emissions impact — and facts are not per se copyrightable. What this
dataset reproduces is those numbers, restructured into tidy tables; it does not
copy Project Drawdown's prose, figures, or presentation. On that basis we treat
the data as freely reusable and release this compilation into the public domain
(PDDL-1.0).

We attribute Project Drawdown as the source, clearly and unambiguously — see
`sources` in `datapackage.json` and the citation below. Anyone reusing this data
should do the same. If Project Drawdown ever objects to redistribution, we'll
revisit.

**Citation:** Project Drawdown, *The Drawdown Review 2020* — Table of Solutions.
https://drawdown.org/solutions/table-of-solutions

## Source moved on

Project Drawdown redesigned `/solutions/table-of-solutions` in 2025 (the "Drawdown
Explorer" / 2025 solutions framework). The live page no longer publishes the
two-scenario 2020 table in this form, so the structured data here is the 2020
review, taken from the community mirror at
[datasets/commons#329](https://github.com/datasets/commons/issues/329)
(`archive/commons-329-project-drawdown-snapshot.md`). A separate dataset for the
2025 framework would be new work (and rests on the same facts-aren't-copyrightable
basis as this one).

The retrieved-on-2026-08-30 HTML of the live page is deliberately **not** archived
here: it embeds third-party API tokens (Mapbox) from Project Drawdown's site
scaffolding, which have no place in a data repo.
