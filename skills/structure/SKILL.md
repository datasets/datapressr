---
name: structure
description: Use this skill when turning a raw or archived data source (a downloaded file, scraped page, or API response) into a clean, typed, publishable dataset — moving a DataPressr dataset from archived to status: structured. Covers writing the reproducible build script, tidy-data conventions, concrete cleanup idioms for messy real-world sources (missing-value tokens, currency/date parsing, sparse Excel headers, formula cells), and when to reach for DuckDB instead of a plain script. Trigger whenever wrangling raw data into data/*.csv + datapackage.json for a dataset in this project.
---

# Structure: raw source → clean, typed dataset

This is the core wrangling step. Everything else in the lifecycle (`enrich`, `story`) assumes the dataset already cleared this bar. Read `AGENTS.md` in the dataset directory first — this skill is the *how*, `AGENTS.md` → "Data conventions" is the *contract*.

## The contract

A dataset is done with `structure` when, per `AGENTS.md`:

- Every resource has a `schema` with a `type` per field, and a `primaryKey` if one exists
- `licenses` and `sources` are filled in
- Encoding is UTF-8, columns are `snake_case` with units where ambiguous, missing values are genuinely empty cells (one convention, not three), dates are ISO 8601
- A checked-in `build.ts` reproduces `data/*.csv` deterministically from the raw snapshot
- `node scripts/validate-datapackage.mjs .` passes with no errors (aim for no warnings)

If you can't tick all of these, the dataset isn't structured yet — don't set `status: structured` prematurely.

## Step by step

### 0. Before you touch data

Capture the license and source URL *now*, while you have the source open — not as a follow-up. This is the single most-forgotten step (see the rigor pass in `docs/skills-vision.md`). If the license genuinely isn't stated anywhere, say so explicitly rather than leaving `licenses` empty and moving on.

Sanity-check scale: does the raw source comfortably fit in memory in a Node process (rule of thumb: well under ~1GB)? If not, stop and say so — this playbook assumes small data.

### 1. Snapshot the source

Save the raw file into `archive/` at the dataset root, next to (not inside) `data/`. This is real precedent, not invented: [`millennium-macroeconomic-data-uk`](https://github.com/datasets/economic-history/tree/main/millennium-macroeconomic-data-uk), in the sibling `datasets/economic-history` repo, does exactly this with its `archive/` for a 27MB source xlsx. Record where it came from and when — a comment at the top of `build.ts` is enough:

```ts
// Source: https://www.bankofengland.co.uk/statistics/research-datasets
// Retrieved: 2026-08-29
// archive/millennium-of-macroeconomic-data.xlsx
```

If the source is a live URL you'll re-fetch (not a one-off file), `build.ts` can fetch-then-cache into `archive/` itself — see the fetch pattern below.

### 2. Decide the shape before writing any code

- One row per observation. If the source is wide (one column per year, or per category), you're almost always reshaping to long format.
- Pick the primary key up front — usually an entity + a time period (`country_code, year`; `variable_id, period`). Name it in your head before you write the schema.
- **Then profile it, don't assume it.** Before you commit to that key, count blanks and duplicates in each candidate field against the actual snapshot. The obvious identifier is routinely blank for exactly the rows you didn't think about: in `population-growth`, `countryiso3code` is empty for the five World Bank income-group aggregates, so `(countryiso3code, date)` has 66 duplicate keys. When the obvious field fails, look for a second identifier that doesn't — there, the 2-letter `country.id`, which maps one-to-one onto the 3-letter World Bank id in the country metadata (`XD → HIC`) and resolves the key you actually wanted — and assert the two agree wherever both are present. Keep the profiling as assertions in `build.ts` — the key being unique and non-blank is a property of the source that can break on the next refresh, not a fact you establish once.
- Decide the one missing-value representation now (empty cell) and the one date format now (ISO 8601) so you're not retrofitting it after the fact.
- **Column and resource names: use our conventions by default** — `snake_case`, units where ambiguous, uniform resource names (`brent-daily`, `brent-weekly`, `brent-monthly` — not the source's `brent-week`/`brent-month`). Deviate *only* when you are deliberately re-wrangling a specific published dataset for a ground-truth comparison and matching its field names makes the diff meaningful — and when you do, record the deviation and why in the dataset README. It should be a conscious, written choice, never drift.

### 3. Write `build.ts`

Plain Node, run directly (`node build.ts`, no build step — verified working: Node's built-in TS support handles type annotations, interfaces, and generics with zero flags on Node 22+). Default to built-ins; reach for one targeted package only when the source format needs it.

**When the build needs a dependency** (a parser like `xlsx` or `csv-parse`): the dataset gets its own `package.json` (`"private": true`, pin exact versions, a one-line `description` noting it's build-only and not published) and its own `package-lock.json`, both committed. The README's run line becomes `npm install && node build.ts`. `.datahubignore` must exclude `node_modules/` and `package.json`/`package-lock.json` so they don't get published. Worked example: `datasets/energy-and-commodities/oil-prices/`.

**Fetching and snapshotting a live source** — built-in `fetch`, no dependency:

```ts
import { writeFile } from "node:fs/promises";

const SRC_URL = "https://stooq.com/q/d/l/?s=xagusd&i=m";
const ARCHIVE_PATH = "archive/xagusd-monthly.csv";

async function fetchAndArchive(): Promise<string> {
  const res = await fetch(SRC_URL);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const text = await res.text();
  await writeFile(ARCHIVE_PATH, text);
  return text;
}
```

**JSON / REST API sources** — paginated, keyed or not, the parsing is trivial (`JSON.parse`); the work is proving the download is complete and hasn't changed underneath you. Worked example: `datasets/demographics/population-growth` (World Bank Indicators API, 18 pages).

- **Two scripts.** `fetch.ts` is the only networked script; `build.ts` reads `archive/` and nothing else, so the build is provably offline. `fetch.ts` reuses an existing snapshot unless run with `--refresh`.
- **Archive the raw bytes, per response**, not a merged or re-serialised JSON. Write `archive/manifest.json` listing each file's URL, retrieval time, byte size and SHA-256.
- **Pagination completeness.** Loop to the `pages` the API reports, then assert the rows summed across pages equal its `total`. Re-check both from the archive in `build.ts`.
- **Snapshot consistency.** If responses carry a version marker (`lastupdated`, an ETag, a dataset version), assert it is identical on every page — otherwise the source changed mid-download and pages may overlap or skip rows.
- **Errors can arrive as HTTP 200.** Check the payload shape, not just the status (the World Bank API returns `[{"message": …}]` with a 200).
- **Be polite and bounded.** An explicit timeout (`AbortSignal.timeout`), a small retry cap with backoff, and a pause between requests.
- **Flatten deliberately.** Keep the nested fields you need, and assert-then-drop fields that are constant across every row rather than publishing them as columns.

**Parsing CSV** — Node has no built-in CSV parser (Python's stdlib does; this is the one place Node needs something extra even for the "simple" case). For an unquoted, comma-only source, a plain `.split()` is fine and needs nothing installed:

```ts
function parseSimpleCsv(text: string): string[][] {
  return text.trim().split("\n").map((line) => line.split(","));
}
```

The moment fields can contain commas or quotes, hand-rolling breaks silently — don't try to out-clever RFC 4180 by hand. Reach for a small, focused package (`csv-parse`) rather than a hand-rolled regex.

**Parsing xlsx / xls** — the format on disk decides the package:

- **Modern `.xlsx`** (Office Open XML, a zip) — `exceljs` (pure JS, no native bindings, installs instantly). One gotcha worth knowing before you hit it: cells computed by a spreadsheet formula don't come back as plain values — `cell.value` returns `{formula, result, ...}` for the master cell of a shared formula and `{result, sharedFormula}` for the rest. Verified directly against a real 27MB source with formula-computed year columns ([`millennium-macroeconomic-data-uk`](https://github.com/datasets/economic-history/tree/main/millennium-macroeconomic-data-uk), in the sibling `datasets/economic-history` repo) — without unwrapping, every year column silently comes back `[object Object]`. Python's `openpyxl` sidesteps this with `data_only=True` (reads cached computed values); ExcelJS has no equivalent flag, so unwrap by hand — see `cellValue()` below.
- **Legacy `.xls`** (BIFF8 / OLE2 — anything Excel saved as "Excel 97-2003", and what a lot of government portals still hand out) — `exceljs` **cannot open these**; use SheetJS `xlsx`. ESM gotcha: `import XLSX from "xlsx"` (default import) — `import * as XLSX from "xlsx"` gives a namespace object with no `readFile`. Worked example: `datasets/energy-and-commodities/oil-prices` (eight EIA `.xls` workbooks).

**Spreadsheet dates are timezone-naive — never round-trip them through a JS `Date`.** An Excel date cell is a serial day number with no zone. Reading it as a `Date` (SheetJS `cellDates:true`, or `new Date(serial * 86400000)`) materialises it at the *runner's* local midnight, and a later `.toISOString()` then rolls it back a day in any positive-offset zone — this silently turned `1987-05-20` into `1987-05-19` in the `oil-prices` build. Read the raw serial (`raw: true` / `cellDates:false`) and convert offset-free: `excelSerialToIsoDate()` in the idioms module, or `XLSX.SSF.parse_date_code(serial)` if you already depend on `xlsx`. Then **spot-check the first converted date against the source's documented start** before trusting the column.

**Cleanup idioms** — missing-value normalization, date parsing, fill-forward section headers, slug generation with dedup, the ExcelJS formula unwrap above, and a deterministic CSV writer. Drawn from real messy sources in `datasets/economic-history`, not hypothetical, and — unlike prose examples in most playbooks — these are a real, tested module rather than copy that can quietly drift out of date:

**`scripts/wrangling-idioms.mjs`** in this repo (`npm test` covers it, `scripts/wrangling-idioms.test.mjs`) — `cleanNumber` (lenient: strips `$£€,%`, maps text tokens to empty), `num` (strict: throws on garbage, takes a per-column list of numeric "no data" sentinels like `-99.99`), `cleanString` (whitespace — including the non-breaking and zero-width spaces HTML leaves behind once you have decoded the entities yourself — collapsed and trimmed, blank to empty; takes no placeholder list, on purpose), `toIsoDate`, `excelSerialToIsoDate`, `fillForwardSections`, `makeSlugger`, `cellValue`, `toCsv` (RFC 4180, LF endings). Copy whichever functions a given dataset's `build.ts` actually needs into that file — datasets are independent repos (catalog-as-repo), so this isn't meant to be a live cross-repo import, it's a tested source to copy from. Read the file directly for the implementations; don't re-derive them from memory.

**Government / scientific text data — two shapes to expect** (worked example: `datasets/climate-and-environment/co2-ppm`, NOAA Mauna Loa CO₂):

- **Comment / preamble lines.** Many `.txt`/`.csv` government sources start with dozens of `#`-prefixed lines (provenance, method notes, contact). Strip lines that are blank or start with `#` before parsing; don't hand-count how many to `tail` past. Preamble is not always `#`-prefixed text — in a spreadsheet it can be *structured rows* above the header (the EIA `.xls` in `oil-prices` has a title row, a "Sourcekey" row, then the header). Same rule: find the header, don't assume the row offset.
- **Negative sentinels instead of blanks.** Sources often encode "no information" as an out-of-range number (`-1`, `-9.99`, `-99.99`) rather than an empty field. Normalise these to empty cells — the `num(raw, sentinels)` helper takes the per-column sentinel list, keeps it to one line each, and stops a `-9.99` sailing through as a real measurement.
- **Assert the source header.** When you build from an archived snapshot of a source that still updates upstream, have the script check the header row it expects and throw if it changed — otherwise a column the source adds or reorders silently shifts every downstream value (this is exactly how the older community `co2-ppm` dataset ended up with `ndays` published under a `Trend` heading).

**Values that lie** — the sentinel rule above is about numbers, but text and metadata mislead in their own ways, and the two failure modes point in opposite directions. Some values *look* like data and aren't; some *look* like missing and aren't. Both were found in round 2 (`docs/benchmarks/round-2-json.md`, `docs/benchmarks/round-2-join.md`):

- **Decide by what the row is, not by what the string looks like.** The question is never "does this token look like a null" — it is "does this token name a real member of this column's domain, or does it stand for *this field does not apply to this row*?" A World Bank aggregate has no region, so `region = {id: "NA", value: "Aggregates"}` means "not applicable" and should become an empty cell — but it is emptied *because the row is an aggregate*, not because the string is `"NA"`. Do it as a rule about rows, and the next bullet can't bite you.
- **So the placeholder list is per column, never global.** `"NA"`, `"N/A"`, `"Aggregates"`, `"-"` are placeholders in *some* columns and real values in others, exactly like the numeric sentinel list `num(raw, sentinels)` takes per column. `cleanNumber` in `scripts/wrangling-idioms.mjs` carries a `MISSING_TOKENS` set including `"NA"` and `"-"`; it is for numeric columns, and pointing it at a coded string column is how you lose real data in bulk.
- **Trim whitespace on every string you keep.** `"Sub-Saharan Africa "` and `"Sub-Saharan Africa"` are two different keys and one real region; in `population-growth` four entity names in `countries.json` carry a trailing space, and for two of them that makes the metadata name disagree with the name that same entity's own observations use. Trim once, centrally, not per column when a mismatch surprises you — that is what `cleanString` in `scripts/wrangling-idioms.mjs` is for, and it also collapses the non-breaking (U+00A0) and zero-width (U+200B) spaces HTML sources are full of, once you have decoded the entities yourself; it does not decode HTML. Call it per cell, never on a block of text you mean to keep line-broken, and not at all in a build that republishes a source's free text verbatim — an internal double space in a place name is a real difference. It deliberately takes no placeholder list: which tokens mean "not applicable" is the previous two bullets' question, answered from the row at the call site.
- **Write those characters as escapes in the script itself, never as literals.** A raw U+00A0 or U+200B pasted into a character class is invisible in the editor, invisible in the diff and invisible in review — and a paste that flattens it to a plain space leaves code that still compiles and silently stops doing the one thing `\s` cannot do. The same bug was written twice here inside two days, and one of the two shipped. Spell them `[\u00a0\u200b]` (a literal backslash, `u`, four hex digits), and let `node scripts/check-invisible-characters.mjs .` — which `npm test` runs over every source file in the repo — keep them out.
- **A legitimate value that a tool reads as missing stays verbatim.** In OurAirports, `continent = NA` is North America (39,792 rows) and `iso_country = NA` is Namibia (303 rows) — both real codes in their column's code list (OurAirports' own continent codes, and ISO 3166-1 alpha-2). Emptying them would delete a continent and a country. Keep them exactly as the source has them, and **say so in the field description** — pandas' `read_csv` and R's `read.csv` both read a bare `NA` as missing by default, so a downstream reader will silently lose those rows unless warned.
- **Statistical portals mix aggregates in with units.** 48 of the 265 entities in the World Bank series are regions, income groups or "World" (the full entity list runs to 295, 78 of them aggregates). Don't silently drop them (they're legitimate data) and don't silently keep them (summing them with countries double-counts). Carry an explicit `is_aggregate` boolean and let the reader choose — and note that it is this flag, not a string match, that drives the "not applicable" emptying in the first bullet.
- **Keep the source's precision; a display hint is metadata, not an instruction.** The World Bank API returns `1.18734426572715` alongside `decimal: 1`. That `1` is how the portal's own UI rounds for display; it is not the measurement's precision. Publish the value the source gave you and record the hint in the field description if it's worth recording at all. Rounding at build time is irreversible and nobody downstream can tell it happened.

**Joining tables** — several primary tables linked by real keys, not same-schema files concatenated. Worked example: `datasets/transport/airports` (OurAirports: airports + countries + regions + runways). Joins are where a build silently produces plausible-looking wrong numbers, so write the plan down *before* you code it:

- **Record cardinality and orphan policy per join, up front.** A small table in the benchmark report or the dataset README — join, expected cardinality (many-to-one, one-to-one, many-to-many), what the profile actually says, and what happens to orphans. Deciding "fail the build" versus "keep with a blank" versus "drop the row" while you're debugging is how you end up choosing whichever one makes the error go away.
- **Assert the "one" side is unique and non-blank.** Every many-to-one lookup depends on it. One line each, and it's the assertion that catches an upstream change the day it happens.
- **Count orphans, in both directions.** Keys on the left with no match, and rows on the right nothing points at. Zero is a result worth asserting; non-zero is a decision, and either way the count belongs wherever the join plan is written down. Note that "no match" and "legitimately none" are different: 44,953 airports have no runway rows at all, which is a `0` count, not an orphan.
- **Assert row counts before and after.** Input rows in = output rows out for a lookup join; child rows consumed = child rows in for an aggregate. This is what proves no Cartesian expansion happened, rather than trusting that it couldn't.
- **Check redundant columns agree across tables.** Denormalised sources repeat themselves — `regions.iso_country` should match the airport's own `iso_country`, `runways.airport_ident` should match `airports.ident`. Where the source gives you a free cross-check, take it; a disagreement means your join key is wrong or the snapshot is inconsistent.
- **Define what an aggregate over a child table counts**, in the field description, and recompute a sample independently. Do closed runways count? Is a blank length "unknown" (skip) or zero (a real measurement)? `airports` counts closed runways in `runway_count` but excludes them from `open_runway_count`; 289 runways have no `length_ft` and 6 have a genuine `0`. Verify by recomputing the aggregate for a slice of keys with a separate script, not by re-reading the same loop.

**When to reach for DuckDB instead**: plain Node for keyed many-to-one lookups and simple group-bys, **even across several files** — a `Map` per lookup table and one aggregation loop, with the assertions above one line each. DuckDB earns its place when the problem is genuinely one SQL query that Node would fight: many-to-many joins, window functions (running totals, lag/lead, rank within group), or reshaping a genuinely wide table (dozens of year-columns) to long format. If it's mostly row-by-row string/date/number cleaning on a single source, a plain script is simpler and is what this playbook defaults to. The `airports` build is the calibration point: four linked CSVs, ~138,600 source rows, three joins — and still plain Node, because each of its per-key checks is one line in Node and a separate anti-join or count query in SQL.

### 4. Fill in `datapackage.json`

Schema with typed fields and a `primaryKey`, `licenses`, `sources`, `status: "structured"`. See `AGENTS.md`'s minimal example for the shape.

**CSV format:** write `data/*.csv` with **LF** line endings and a trailing newline (the `toCsv` idiom does this). **Do not** add a Frictionless `dialect` block per resource — comma delimiter, `"` quote char, LF are the defaults, and an explicit `dialect` is just more surface to drift. (Some long-running community datasets carry a full `dialect` with `"lineTerminator": "\r\n"`; that's their choice, not one to copy.)

### 5. Validate

```sh
node scripts/validate-datapackage.mjs .
```

Fix every error. Fix warnings unless there's a specific reason not to (e.g. genuinely no natural primary key).

### 6. Prove reproducibility

Re-run the build script a second time and confirm the output doesn't change:

```sh
node build.ts && cp data/*.csv /tmp/run1/
node build.ts && diff -r data/ /tmp/run1/  # should be empty
```

If it isn't empty, something in the script is non-deterministic (unsorted rows, a `Date.now()` timestamp, iteration order over an object) — fix that before calling the dataset structured. This is the closest thing a wrangling step gets to a test, per the "What's actually tested" note in `docs/skills-vision.md`.

## Real worked examples

- **Simple case** — [`precious-metals-prices`](https://github.com/datasets/energy-and-commodities/tree/main/precious-metals-prices), in the sibling `datasets/energy-and-commodities` repo: fetch a CSV from an API, filter by date, write out. No parsing library needed at all, source and output are both already tidy. This is the common case — don't over-build for it.
- **Government text + sentinels** — `datasets/climate-and-environment/co2-ppm`: NOAA plain-text CSV, ~40 `#` comment lines, `-99.99`/`-1`/`-9.99` "no data" markers, date split across year/month columns. Uses `num(raw, sentinels)` and assert-the-header.
- **Legacy `.xls` + spreadsheet dates** — `datasets/energy-and-commodities/oil-prices`: eight EIA BIFF8 `.xls` workbooks (`exceljs` can't read them → SheetJS `xlsx`, own `package.json`), a 3-row structured preamble, and timezone-naive serial dates converted offset-free. Output is content-identical to the long-running community `datasets/oil-prices` — the `structure` benchmark's ground-truth rep (`docs/structure-benchmark.md`).
- **Paginated JSON API** — `datasets/demographics/population-growth`: World Bank Indicators API, 18 pages × 1,000, nested objects, `null` values. Separate `fetch.ts` with a hashed manifest and completeness/consistency checks; offline `build.ts`. Scored in `docs/benchmarks/round-2-json.md`.
- **Relational join** — `datasets/transport/airports`: four linked OurAirports CSVs (86,094 airports, 249 countries, 3,987 regions, 48,248 runways) joined into one row per airport, plus three runway aggregates. Three many-to-one lookups and one group-by, in plain Node with `csv-parse` — the calibration point for the DuckDB threshold above. Cardinality and orphan policy recorded before coding; uniqueness, orphans, row counts and cross-table agreement all asserted. Scored in `docs/benchmarks/round-2-join.md`.
- **Messy xlsx** — [`millennium-macroeconomic-data-uk`](https://github.com/datasets/economic-history/tree/main/millennium-macroeconomic-data-uk), in the sibling `datasets/economic-history` repo: 27MB multi-sheet xlsx, sparse section headers needing fill-forward, formula-computed cells, three different grains (annual/quarterly/monthly) reshaped to long format. This is what justifies the cleanup idioms above — they're not hypothetical, they're what this source actually needed.

## Common mistakes

- Wrangling interactively in a chat session with no `build.ts` — can't be re-run, can't be reviewed, violates the reproducibility rule in `AGENTS.md`.
- Mixing missing-value conventions (`NA` **as a missing-value token** in one column, empty string in another) — pick one, apply it everywhere via a single `cleanNumber` helper, not ad hoc per column. This is about how you *represent* missing; where a literal `NA` is real data, see **Values that lie** above.
- Setting `status: structured` before `/validate` passes with no errors.
- Forgetting `licenses`/`sources` because they felt like a publishing-time concern — capture them in step 0, before the wrangling gets interesting and they get forgotten.
