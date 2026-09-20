---
title: "`structure` benchmark round 2 — relational multi-file join"
date: 2026-09-18
---

# `structure` benchmark round 2 — relational multi-file join

Sample 5 for the [`structure` benchmark](../structure-benchmark.md): the first source that needs a **genuine join**, i.e. several primary tables linked by real keys, not same-schema files concatenated. Same rubric as round 1 and the [JSON round](round-2-json.md). Skill and idiom edits are not made here; they go to the round-2 synthesis (datapressr-rlb).

## Source selection

[OurAirports](https://ourairports.com/data/) — the community-maintained airport database behind commons issue [#26 Airport Codes](https://github.com/datasets/datapressr/blob/main/datasets/commons-issues/26-airport-codes.md). "All data is released to the Public Domain" (ourairports.com/data). Four CSVs, snapshotted 2026-09-18 (all `Last-Modified: 2026-09-18 01:54:08 GMT`):

| Table | Rows | Bytes | Key |
|---|--:|--:|---|
| `airports.csv` | 86,094 | 12,724,965 | `id` (also `ident`) |
| `countries.csv` | 249 | 24,583 | `code` |
| `regions.csv` | 3,987 | 485,253 | `code` |
| `runways.csv` | 48,248 | 3,964,801 | `id`; `airport_ref` → `airports.id` |

**Output:** `data/airports.csv` — one row per airport, with `country_name` and `region_name` joined in, and three runway aggregates (`runway_count`, `open_runway_count`, `longest_open_runway_ft`).

## Join plan — recorded before transforming

Profiled from the snapshot before `build.ts` was written:

| Join | Expected cardinality | Profile | Orphan policy |
|---|---|---|---|
| `airports.iso_country → countries.code` | many-to-one | `code` unique (249/249); 0 orphans | **fail the build** |
| `airports.iso_region → regions.code` | many-to-one | `code` unique (3,987/3,987); 0 orphans; every region's `iso_country` agrees with the airport's | **fail the build** |
| `runways.airport_ref → airports.id` | many-to-one, aggregated to one row per airport | `airports.id` unique (86,094/86,094); 0 orphan runways; `airport_ident` agrees with `airports.ident` for all 48,248 | **fail the build** |
| airports without runways | one-to-zero | 44,953 airports have no runway rows | keep; counts `0`, longest empty |

Why fail on orphans rather than keep the row with a blank name: the build runs against a pinned snapshot. An orphan can only appear after `node fetch.ts --refresh` pulls a changed upstream, and that deserves a look before publishing, not a silently blank `country_name`.

**Row counts:** airports in = airports out (86,094), asserted. Runways aggregated = runways in (48,248), asserted. Output `id` unique. Because every join is a keyed lookup into a map, there can be no Cartesian expansion. The row-count assertion proves it rather than trusting it.

## Engine: Node, not DuckDB

The skill's rule is "reach for DuckDB when the problem is actually relational — joining several files on a key". This problem is relational, but it was built in plain Node plus one parser (`csv-parse`, pinned 7.0.2, in a dataset-local `package.json`), for four reasons:

1. **Every join is a many-to-one lookup plus one group-by.** Three `Map` lookups and one aggregation loop; no join produces more than one row per airport.
2. **The checks are the point.** Uniqueness, orphans, cross-table consistency (region ↔ country, runway ident ↔ airport ident) and exact failure messages naming the row are each one line in Node. In SQL, each is a separate anti-join or count query whose results still need checking in a host script.
3. **Smaller dependency surface.** A pure-JS parser, versus DuckDB's native binary per platform.
4. **Scale is small.** 17 MB in memory; the build runs in about a second.

DuckDB would earn its place with many-to-many joins, window functions, or a wide-to-long reshape over dozens of columns. The skill doesn't give a threshold; this report proposes one below.

## Findings from the data

- **`NA` is data.** `continent = NA` is North America (39,792 rows) and `iso_country = NA` is Namibia (303 rows). pandas' `read_csv` and R's `read.csv` read `NA` as missing by default. Documented in the field descriptions and the package description; values kept verbatim.
- **Blank ≠ zero.** 289 runways have no `length_ft` (unknown) and 6 have `0`. Blanks are skipped for the maximum; the zeros are kept as the source recorded them. 148 airports have open runways but no recorded length, so `longest_open_runway_ft` is empty for them.
- **Closed runways.** 1,069 runways are marked `closed`. They count toward `runway_count` and are excluded from `open_runway_count` and the longest-runway figure.
- **Helipads are runways.** At heliports, `runways.csv` lists helipads (`H1`…). Kept as-is and stated in the field description.
- **Dropped columns.** `home_link`, `wikipedia_link`, `keywords` and all runway-end geometry were dropped as out of scope for a summary table. The archive keeps them.

## Checks

| Check | Result |
|---|---|
| Source header asserted | all four tables, exact column lists |
| Field count per row | asserted for every row |
| Keys | `countries.code`, `regions.code`, `airports.id`, `airports.ident` unique and non-blank (asserted) |
| Orphans | 0 in all three joins (asserted — the build fails otherwise) |
| Row counts | 86,094 in → 86,094 out; 48,248 runways aggregated |
| Independent recompute | runway summaries recomputed from raw rows for 498 airports (every 173rd) by a separate script: 0 mismatches |
| Spot checks | JFK: 4 runways, longest 14,511 ft; Heathrow: 2 runways, longest 12,799 ft |
| Deterministic | two offline builds → identical SHA-256 (in the Bead handoff) |
| Offline | `build.ts` reads `archive/` only; `fetch.ts` is the only networked script and reuses the snapshot unless `--refresh` |
| Validator | 0 errors, 0 warnings |

## Rubric

| Check | 5 `airports` (join) |
|-------|:-:|
| **Reproducible** | ✅ (`npm install && node build.ts`, one pinned dependency) |
| **Typed schema + `primaryKey`** | ✅ |
| **`licenses` + `sources`** | ✅ `PDDL-1.0` (source is public domain) |
| **Tidy** | ✅ one row per airport; joined names are denormalised context, aggregates are per-airport facts |
| **Validator clean** | ✅ |
| **Low unguided judgment** | ⚠️ 8 unguided, 1 where the skill's guidance pointed the other way (engine choice) |

## Unguided-judgment log

1. **Engine**: the skill says a multi-file join is DuckDB territory; Node was chosen for the reasons above. The guidance and the call diverged.
2. **Orphan policy**: fail vs keep-with-blank vs drop. There is no guidance.
3. **Where the join lives**: one denormalised output, rather than publishing the four normalised tables with foreign keys.
4. **Aggregate definitions**: whether closed runways count; blank vs 0 length; what "longest" means when the lengths are unknown.
5. **Cross-table consistency checks** (region ↔ country, ident ↔ ref): not mentioned in the skill; added because both columns exist.
6. **Literal `NA` as data**: the skill covers numeric sentinels, but not a legitimate value that common tools read as missing.
7. **Column scope**: which source columns to drop (links, keywords, runway-end geometry).
8. **Fetch/build split and manifest**: same call as the JSON round, again without guidance.

## Proposed skill edits (for the round-2 synthesis, not applied here)

1. **A "joining tables" checklist** in `structure`: write down cardinality and orphan policy before coding; assert one-side uniqueness; count orphans in each direction; assert row counts before and after; check that redundant columns agree across tables.
2. **Refine the DuckDB rule**: "Plain Node for keyed many-to-one lookups and simple group-bys, even across files. DuckDB for many-to-many joins, window functions, or reshaping many columns." That replaces "several files on a key", which reads as "always DuckDB" for this case.
3. **"Values that look missing"**: document literal `NA`/`N/A`/`null` strings that are real data (ISO codes, continent codes). Keep them verbatim, and warn in field descriptions.
4. **Aggregates over child tables**: define what is counted (closed, blank, zero) in the field description, and recompute a sample independently.
5. **Worked example**: add `datasets/transport/airports` as the join case.

## Verdict

The core loop carried over to a relational source unchanged. Joins made the "assert, don't assume" habit more valuable: the checks that matter here (uniqueness, orphans, row counts) cost a few lines each and would catch an upstream change the day it happens. The main gap is that the skill steers a keyed-lookup join towards DuckDB and says nothing about orphan policy or cardinality. That is the edit to make.
