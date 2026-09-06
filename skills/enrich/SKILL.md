---
name: enrich
description: "DRAFT — not installable yet. Use when a structured dataset is headed for analysis or a story and needs to be *looked at* first: descriptive statistics, one to three first charts, and a short written note of what stands out — moving a DataPressr dataset from structured to status: enriched. Produces a reproducible enrich.ts + a SUMMARY.md whose stats block regenerates in place. Drafted from one hand rep (co2-ppm); exercise it on a second dataset before installing."
---

# Enrich: structured dataset → enriched

> **DRAFT.** Written from one hand pass ([co2-ppm](../../datasets/climate-and-environment/co2-ppm/SUMMARY.md)), not yet run *as a skill*. No `.claude/skills/enrich` symlink — it is here for review, not activation. Expect it to change once it has been run on a second dataset (oil-prices is the obvious next).

Sits between `structure` and `story`. A *structured* dataset is correct — typed, tidy, reproducible. An *enriched* one has also been **looked at**: you know its shape, its gaps and what is surprising in it, and a reader can see that at a glance. Optional stage — not every dataset needs it, but one headed for a story does.

Craft references (this skill does not restate them): [`docs/charting.md`](../../docs/charting.md) for the charting split, `AGENTS.md` → "Adding charts (views)" for the `views` mechanism, [`docs/voice-guide.md`](../../docs/voice-guide.md) for the commentary's tone.

## What "enriched" means

Per [`docs/lifecyle.md`](../../docs/lifecyle.md) §5 — a quick statistical summary, first charts, any derived datasets, short commentary, cross-linking to related sources. The bar this skill sets:

## The contract — done when

- **`enrich.ts`** — reproducible, deterministic, zero-dependency native TS, exactly like `build.ts`. Computes the descriptive statistics.
- **`SUMMARY.md`** — committed. A **fenced generated stats block** (`enrich.ts` rewrites only that), plus a hand-written **"What stands out"** and **"See also"**.
- **`views`** in `datapackage.json` — one to three first charts, declarative simple specs (`AGENTS.md` → "Adding charts (views)"). *Not* hand-authored Observable Plot SVGs — those belong to a story (`docs/charting.md`).
- **`status: "enriched"`** in `datapackage.json`, `/validate` still clean.
- Any **derived resource** carries its own typed schema and is produced by a build step — same bar as `structure`, no exceptions for "it's just an aggregate".

## Step by step

### 1. Stats — `enrich.ts`

Zero-dep, native TS, deterministic (same input → byte-identical output). Per resource: row count, coverage (the range of its date / period / key column), and for each **measurement** column: `n`, `missing`, `min`, `max`, `mean`, `median`, `std dev`.

- **Skip identifier columns.** A number-typed column that encodes a point in time — `decimal_date`, a bare decimal year — is not a measurement; its min/max/mean say nothing. Use an **explicit key list** (`decimal_date`, `date`, `year`, `month`, `day`, `decade`, `*_date`), not substring matching — `mlo_ppm_per_year` contains "year" and is a real measurement.
- **Write between markers.** `SUMMARY.md` carries `<!-- STATS:BEGIN … --> … <!-- STATS:END -->`. Rewrite only what is between them; leave the title and the hand-written sections untouched. First run lays the whole file down from a template (Statistics / What stands out / See also).
- **`.datahubignore` it**, next to `build.ts`. `SUMMARY.md` itself publishes.

### 2. Read the stats — `SUMMARY.md` → "What stands out"

The judgement step, and the reason the stage exists. Three to six bullets: what a reader should take from the numbers. The stats hand you most of them:

- a column with **std dev 0** is constant — it carries no information; say so.
- **min = the first row, max = the last row** on a time series → it only moves one way.
- a **`missing` count that clusters** (a date range, a coincidence with a source change) → explain the cluster, don't just report the number.
- a **derived / aggregate row that is partial** (fewer periods than its siblings) → flag it as noisier.

Plain and factual, per `docs/voice-guide.md`. Don't narrate every number; state the few that matter.

### 3. First charts — `views`

One to three `views` in `datapackage.json`: the headline series, plus whatever the stats flagged (an acceleration, a two-series comparison). Declarative `"specType": "simple"` specs — they render on the dataset page with no build step. This is deliberately *not* where hand-rolled or Observable Plot SVGs go; a story that needs an annotated chart authors its own (`docs/charting.md`).

### 4. Cross-link — `SUMMARY.md` → "See also"

A few links, not prose: the story (if one exists), the source, the community or related dataset, any downstream use of this data.

### 5. Bump status

`datapackage.json` `status`: `"structured"` → `"enriched"`. Re-run `/validate`.

## Where enrich output lives

In the dataset directory: `enrich.ts`, `SUMMARY.md`, and the `views` array in `datapackage.json`. No new top-level location, no new directory.

## Common mistakes

- **Stats on identifier columns** (`decimal_date`, an id) — pure noise in the table.
- **A script that rewrites the whole `SUMMARY.md`** and eats the hand-written commentary on the next run — fence the generated block.
- **Reaching for a hand-rolled or Plot SVG** — that is a story's job; enrich uses `views`.
- **Shipping bare stats tables with no "What stands out"** — numbers without the reading is a printout, not enrichment.
- **A derived resource with no schema or no build step** — it is still a resource; it clears the `structure` bar too.

## Open questions (DRAFT — resolve when enrich is run on a second dataset)

- **Parallel resources.** A dataset of N same-schema series (oil-prices: eight `.xls` → eight CSVs) produces N near-identical stats tables. Collapse to one table with a `resource` column? Decide when enrich runs on oil-prices.
- **Where's the line for derived datasets?** co2-ppm's decadal-mean table was built during `structure`. A simple aggregate in `structure` vs an analytical derivation in `enrich` — needs a rule.
- **Exploratory SVGs.** Some datasets may want a distribution or residual chart a `view` can't express. Currently: `views` only; add an SVG only if a specific question demands it.
- **Is enrich a real precondition for `story`?** Assumed useful, not required (`story` currently consumes a `structured` dataset directly). Confirm once a story actually uses an enriched dataset's `SUMMARY.md` / `views`.
- **Portability.** As with `story` — repo-relative links, and the `views` mechanism is DataHub-specific.
