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

## ⚠️ Publication is NOT cleared — licensing blocker

Project Drawdown's [Terms of Use](https://drawdown.org/terms-of-use) reserve all
rights and prohibit "use, reproduction, modification, distribution or storage of
any Content for any purpose other than using the Services … without prior written
consent." There is **no Creative Commons or other open licence**.

The underlying numbers are facts (not themselves copyrightable in the US), but the
selection and arrangement, plus the explicit site terms, mean redistributing this
as an open dataset on DataHub is a judgement call for a human — not something this
automated pass can decide. The structuring work is done and validated so that
decision can be made quickly; **do not `dh push` this dataset until the licence
question is resolved** (e.g. written permission from Project Drawdown, or a
considered fair-use / factual-data position).

## Source moved on

Project Drawdown redesigned `/solutions/table-of-solutions` in 2025 (the "Drawdown
Explorer" / 2025 solutions framework). The live page no longer publishes the
two-scenario 2020 table in this form. `archive/table-of-solutions-live-2026-08-30.html`
is the live page as retrieved on 2026-08-30 for reference; the structured data here
is the 2020 review, taken from the community mirror at
[datasets/commons#329](https://github.com/datasets/commons/issues/329). A separate
dataset for the 2025 framework would be new work (and faces the same licensing
question).
