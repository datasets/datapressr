---
name: enrich
description: "Use when a structured dataset is headed for analysis or a story and needs to be looked at first: descriptive statistics, one to three first charts, and a short written note of what stands out — moving a DataPressr dataset from structured to status: enriched. Produces a reproducible enrich.ts, a SUMMARY.md whose stats block regenerates in place, and declarative views in datapackage.json."
---

# Enrich: structured dataset → enriched

Sits between `structure` and `story`. A *structured* dataset is correct — typed, tidy, reproducible. An *enriched* one has also been **looked at**: you know its shape, its gaps and what is surprising in it, and a reader can see that at a glance. The stage is optional; a dataset headed for a story benefits most.

Proven on two datasets: co2-ppm (several measurements per resource) and oil-prices (eight same-schema resources; its consolidated stats table is what surfaced story #3's finding).

Bundled in `references/`:

- [`references/enrich-template.ts`](references/enrich-template.ts) — a working, zero-dependency `enrich.ts` to copy into the dataset directory. It reads `datapackage.json` for field types and produces the consolidated stats table. It reproduces oil-prices' table byte for byte and runs unchanged on co2-ppm.
- [`references/views.md`](references/views.md) — the `views` mechanism for dataset-page charts.

## Layout

**DataPressr default:** everything lives in the dataset directory, next to `build.ts` and `datapackage.json`: `enrich.ts`, `SUMMARY.md`, and a `views` array in `datapackage.json`. No new directories. Add `enrich.ts` (and any test file) to `.datahubignore`; `SUMMARY.md` is published.

**Other projects:** any Frictionless-style data package works the same way — the template only needs `datapackage.json` with typed `schema.fields` and CSV resources. If there is no `datapackage.json`, write the stats script against the files directly and keep the same `SUMMARY.md` shape.

## The contract — done when

- **`enrich.ts`** — reproducible, deterministic (two runs → byte-identical `SUMMARY.md`), zero-dependency native TypeScript (`node enrich.ts`, Node 22+), like `build.ts`.
- **`SUMMARY.md`** — a fenced, generated stats block (`<!-- STATS:BEGIN … -->` … `<!-- STATS:END -->`; `enrich.ts` rewrites only that), plus hand-written **"What stands out"** and **"See also"** sections that survive re-runs.
- **One consolidated stats table**, one row per resource + measurement column. Its caption states the standard-deviation convention.
- **`views`** in `datapackage.json` — one to three declarative charts whose titles match what they plot.
- Any **derived resource** has its own typed schema and is produced by a script — the same bar as `structure`.
- **`status: "enriched"`** in `datapackage.json`, and the validator still reports zero errors and zero warnings.
- The source CSVs are unchanged (`git status` shows no diff under `data/`).

## Step by step

### 1. Stats — `enrich.ts`

Copy `references/enrich-template.ts` to `enrich.ts` and run it. Per resource: row count, coverage (range of the first date/year/string field), and for each **measurement** column: `n`, `missing`, `min`, `max`, `mean`, `median`, `std dev`.

Rules the template already implements (keep them if you adapt it):

- **One consolidated table** keyed by resource + measurement, not one table per resource. Eight same-schema resources as eight one-row tables was unreadable; one table puts every resource's `min` in a single column, which is how story #3's finding surfaced.
- **Skip identifier columns.** A number-typed column that encodes a point in time (`decimal_date`, a bare year) is not a measurement. Use an explicit key list (`decimal_date`, `date`, `year`, `month`, `day`, `decade`, `*_date`), not substring matching — `mlo_ppm_per_year` contains "year" and is a real measurement.
- **Missing means empty or unparseable only.** Zero and negative values are data. A guard like `Number(v) || undefined` silently drops zeros. Test it: oil-prices' only negative value (-36.98) must survive into the table.
- **Empty population (`n = 0`)** → blank cells, never `NaN` or `0`.
- **State the denominator.** Population standard deviation (denominator n) unless you have reason otherwise, and the caption says which.
- **Write between markers.** Rewrite only the fenced block; the first run lays down the whole file from a template.

Test it: two runs byte-identical; hand-written text preserved; zero, negative, empty and constant columns handled. A small `enrich.test.mjs` with `node --test` is enough.

### 2. Read the stats — "What stands out"

The judgement step, and the reason the stage exists. Three to six bullets: what a reader should take from the numbers. Plain and factual; state the few numbers that matter, with units. The table hands you most of them:

- **`std dev` = 0** → the column is constant and carries no information; say so.
- **The extremes.** Look at `min` and `max` down the whole table: a sign change, a value far outside the others, two resources peaking on the same date. Find the row and give its date.
- **Direction over time.** `min` in the first row and `max` in the last only *suggests* a one-way series — it can dip in between. To claim "it never fell", check every consecutive difference, or cite a growth/difference column whose minimum is above zero (co2-ppm: annual growth never below 0.31 ppm/yr). State which check you ran.
- **A `missing` count that clusters** in a date range or coincides with a source change → explain the cluster, don't just report the number.
- **A partial aggregate row** (fewer periods than its siblings) → flag it as noisier.
- **Averaging hides extremes.** Compare daily vs weekly vs monthly minima if the dataset has several frequencies; an event can vanish one level up (oil-prices: daily -36.98, weekly 3.32).

Keep explanations out of this section unless you attribute them: "EIA attributes it to…" with a link, not "caused by…". The stats show *what*, not *why*.

### 3. First charts — `views`

One to three `views` (see `references/views.md`): the headline series, plus whatever the stats flagged. Check each view's title against its `resources` and `series` — oil-prices had a "Brent vs WTI" view that plotted only Brent.

Annotated, direct-labelled charts are a story's job (Observable Plot SVGs via the `story` skill), not enrich's. If a question needs a chart that `views` can't express, write the question in "What stands out" and leave the chart for a story.

### 4. Cross-link — "See also"

A few links, not prose: the source, the community or related dataset, any story that uses this data. Update this section when a story is published.

### 5. Bump status

`datapackage.json` `status`: `"structured"` → `"enriched"`. Re-run the validator (DataPressr: `node scripts/validate-datapackage.mjs .`).

## Derived data: build.ts or enrich.ts?

- **Structural reshaping stays in `build.ts`** (`structure`): parsing, unpivoting, renaming, typing, splitting a source into tidy resources. Anything needed to make the source *correct*.
- **Analytical transforms go in `enrich`**: aggregates, growth rates, decadal means, spreads between series, rolling statistics — anything that *interprets* the data. Produce them from `enrich.ts` (or a separate script it documents) as typed resources.
- Existing datasets aren't moved retroactively: co2-ppm's decadal-growth table was built in `structure` before this rule and stays there.

## Common mistakes

- **Stats on identifier columns** — pure noise.
- **Rewriting the whole `SUMMARY.md`** and wiping the hand-written commentary — fence the generated block.
- **Dropping zeros or negatives as "missing".**
- **"Min first, max last, so it only goes up"** without checking the steps in between.
- **A view whose title promises more than it plots.**
- **Bare stats with no "What stands out"** — a printout, not enrichment.
- **A derived resource with no schema or no script.**
- **An unattributed cause** in "What stands out".

## Known limits

- `views` is a DataHub feature; on other hosts the dataset page shows no chart, so `SUMMARY.md` has to stand on its own.
- The template's CSV reader assumes clean, unquoted CSV (as a structure build writes it). For quoted fields, swap in a real parser.
