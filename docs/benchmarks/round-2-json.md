---
title: "`structure` benchmark round 2 — JSON / REST API source"
date: 2026-09-18
---

# `structure` benchmark round 2 — JSON / REST API source

Sample 4 for the [`structure` benchmark](../structure-benchmark.md), and the first **JSON/API** source: round 1 covered a text file, a Markdown table and legacy `.xls`. Same rubric, same method: run `skills/structure/SKILL.md` (plus `skills/archive/SKILL.md`) against the source, score it, and log every decision the playbook did not guide. Skill and idiom edits are **not** made here; they go to the round-2 synthesis (datapressr-rlb).

## Source selection

Picked from `datasets/commons-issues/` — [#143 Population growth rate](../../datasets/commons-issues/143-population-growth-rate.md). The issue points at UN Population Division Excel files whose terms require permission to reuse. The same indicator is republished openly by the World Bank as WDI series `SP.POP.GROW` (derived from UN WPP, national statistical offices, Eurostat and UNSD), through a keyless JSON API.

| Criterion | Result |
|---|---|
| Primary JSON/API | World Bank Indicators API v2 — `https://api.worldbank.org/v2/country/all/indicator/SP.POP.GROW?format=json&per_page=1000&page=N` |
| Explicit licence | CC BY 4.0 — World Development Indicators, World Bank Data Catalog dataset 0037712 |
| Secrets | none |
| Stable snapshot | responses carry `lastupdated` (2026-07-13); fetch asserts it is identical on every page |
| Pagination | 18 pages × 1,000; `total` = 17,490 |
| Nesting / nulls | `indicator`, `country` are nested objects; `value` is `null` for 362 rows |
| Size | 20 files, 3,974,184 bytes raw; outputs 780 KB + 28 KB |
| Parameters recorded before build | endpoint, `format=json`, `per_page=1000`, `page=1..pages`; plus `/v2/country?format=json&per_page=1000` (295 entities, one page) and `/v2/indicator/SP.POP.GROW?format=json` |

**Catalog-as-repo:** the World Bank is a portal of ~1,500 indicators. This is **one** indicator, so it is one dataset in this repo (`datasets/demographics/population-growth`). If more WDI indicators follow, they belong in a separate World Bank catalog repo, not as siblings here.

## What was built

- `fetch.ts` — the only networked script. Paged retrieval with a 30 s timeout, 3 capped retries with backoff, 500 ms pacing. Saves every response **byte-for-byte** to `archive/` and writes `archive/manifest.json` (URL, retrieval time, bytes, SHA-256 per file). Reuses the snapshot unless `--refresh`. Throws on: an HTTP-200 error body (`[{message: …}]`), a page number mismatch, `pages`/`total`/`lastupdated` changing between pages, or summed rows ≠ `total`.
- `build.ts` — offline, zero dependencies. Two resources:
  - `population-growth` — `country_code, country_name, is_aggregate, year, population_growth_pct`; key `(country_code, year)`; foreign key to `countries`.
  - `countries` — 295 World Bank entities with region, income level, lending type and capital coordinates; key `country_code`.
- `datapackage.json` — typed schemas, primary keys, CC BY 4.0, three sources (API, catalog licence page, upstream organisations from the indicator metadata).

Run: `node fetch.ts && node build.ts` (network), or `node build.ts` alone from the committed archive.

## What the source actually needed

The interesting part of a JSON source is not the parsing (`JSON.parse` is built in) but that the obvious fields lie:

1. **The obvious key isn't one.** `countryiso3code` is empty for the five income-group aggregates (High, Low, Lower-middle, Upper-middle income, Not classified), so `(countryiso3code, date)` has **66 duplicate keys**. `country.id` is the entity's 2-letter `iso2Code`, which maps one-to-one onto the 3-letter World Bank id in the country metadata (`XD → HIC`). The build asserts the mapping is one-to-one and complete, and that iso3 agrees with it wherever iso3 is present.
2. **Aggregates sit alongside countries.** 48 of the 265 entities are regions, income groups or "World". Flagged `is_aggregate` in both resources rather than dropped — they are legitimate data, but summing them with countries double-counts.
3. **Placeholder values in metadata.** Aggregates carry `region = {id: "NA", value: "Aggregates"}` — and `NA` is also Namibia's iso2 code — plus the same placeholder for income level and lending type. Emptied for aggregates.
4. **Trailing spaces** in names (`"Sub-Saharan Africa "`), so observation names and metadata names disagreed for two regions. Trimmed.
5. **Constant fields.** `unit` (`""`), `obs_status` (`""`) and `decimal` (`1`) are constant across all 17,490 rows. Asserted constant, then dropped.
6. **Null vs zero.** 362 `null`s become empty cells; the one real `0` (Greenland, 1999) stays `0`; 1,487 negative values are kept.
7. **Errors arrive as HTTP 200.** The API reports a bad request as a 200 with a `[{"message": …}]` body; `fetch.ts` checks the body, not just the status.

## Checks

| Check | Result |
|---|---|
| Pagination complete | 18 pages, 17,490 rows = API `total`; every page same `pages`/`total`/`lastupdated` (in `fetch.ts`, re-checked from the archive in `build.ts`) |
| Archive integrity | all 20 files match their manifest SHA-256 |
| Rerun reuses snapshot | second `node fetch.ts` → "reusing snapshot", no requests |
| Offline build | `build.ts` has no network calls; builds from `archive/` only |
| Deterministic | two builds → identical SHA-256 for both CSVs (hashes in the Bead handoff) |
| Keys | `(country_code, year)` unique (asserted); `countries.country_code` and `iso2_code` unique (asserted); 0 foreign-key orphans |
| Nulls | 362 empty `population_growth_pct` = 362 API `null`s; 1 zero preserved |
| Validator | `node scripts/validate-datapackage.mjs datasets/demographics/population-growth` → 0 errors, 0 warnings |

## Rubric

| Check | 4 `population-growth` (JSON API) |
|-------|:-:|
| **Reproducible** — script regenerates `data/*.csv` deterministically from the archived snapshot | ✅ (separate `fetch.ts` for the network step) |
| **Typed schema + `primaryKey`** on every resource | ✅ (+ a `foreignKey`) |
| **`licenses` + `sources`**, SPDX id | ✅ `CC-BY-4.0` |
| **Tidy** — snake_case, one value per cell, one row per observation, ISO dates, one missing-value token | ✅ |
| **Validator clean, no warnings** | ✅ |
| **Low unguided judgment** | ⚠️ 11 unguided — the most of any sample; the skill has no JSON/API section |

## Unguided-judgment log

The skill's only API guidance is a four-line `fetchAndArchive()` for a single CSV URL. Everything below was decided without it:

1. **Fetch and build split into two scripts.** The skill suggests `build.ts` may fetch-then-cache. For a paginated API, a separate `fetch.ts` keeps the build provably offline.
2. **Archive format**: raw response bytes per page plus a hashed manifest, rather than one merged, re-serialised JSON.
3. **Pagination completeness**: loop to `pages`, then check summed rows against `total`.
4. **Snapshot consistency across pages**: `lastupdated`/`total` must not change mid-download.
5. **HTTP-200 error bodies**: check the payload shape as well as the status.
6. **Pacing, timeout and retries**: 500 ms, 30 s, 3 tries — chosen, not guided.
7. **Flattening nested objects**: keep `country.id` and names; drop `indicator` (constant) and the constant `unit`/`obs_status`/`decimal`.
8. **Key when the obvious key has blanks**: map via iso2 to the metadata id instead of using iso3.
9. **Aggregates**: flag rather than exclude or split into a separate resource.
10. **Placeholder metadata values** (`"NA"`, `"Aggregates"`): normalise to empty.
11. **Numeric precision**: keep the API's full float (`1.18734426572715`) rather than round to its `decimal: 1` display hint.

## Proposed skill edits (for the round-2 synthesis, not applied here)

1. **A "JSON / REST API sources" section** in `structure`: separate `fetch.ts` from an offline `build.ts`; archive raw bytes plus a manifest with SHA-256; paginate to `pages` and assert summed rows = `total`; assert the snapshot marker is stable across pages; check the payload for errors, not just HTTP status; bounded timeout, retries and pacing.
2. **"Verify the key, don't assume it"**: before declaring a `primaryKey`, count blanks and duplicates in each candidate key field. An ISO-code field can be blank for exactly the rows you don't expect.
3. **Statistical portals mix aggregates with units**: flag them (`is_aggregate`), don't silently drop or silently keep.
4. **Placeholder / sentinel strings in metadata** — extend the negative-sentinel rule to text placeholders (`"NA"`, `"Aggregates"`, trailing whitespace).
5. **Precision rule**: keep source precision; treat display hints (`decimal`) as metadata, not rounding instructions.
6. **Worked example**: add `datasets/demographics/population-growth` to the skill's list as the JSON/API case.

## Verdict

The core loop held: archive → assert shape → typed tidy output → deterministic script → validate. JSON parsing itself was trivial. The effort went into things the skill doesn't mention: proving the download was complete and self-consistent, and discovering that the "obvious" key field is blank for five entities. Those are the gaps to fix. With a JSON/API section covering items 1–3, a second runner would make most of the same choices.
