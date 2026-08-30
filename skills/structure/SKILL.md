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

Save the raw file into `archive/` at the dataset root, next to (not inside) `data/`. This is real precedent, not invented: `datasets/economic-history/millennium-macroeconomic-data-uk/archive/` does exactly this for its 27MB source xlsx. Record where it came from and when — a comment at the top of `build.ts` is enough:

```ts
// Source: https://www.bankofengland.co.uk/statistics/research-datasets
// Retrieved: 2026-08-29
// archive/millennium-of-macroeconomic-data.xlsx
```

If the source is a live URL you'll re-fetch (not a one-off file), `build.ts` can fetch-then-cache into `archive/` itself — see the fetch pattern below.

### 2. Decide the shape before writing any code

- One row per observation. If the source is wide (one column per year, or per category), you're almost always reshaping to long format.
- Pick the primary key up front — usually an entity + a time period (`country_code, year`; `variable_id, period`). Name it in your head before you write the schema.
- Decide the one missing-value representation now (empty cell) and the one date format now (ISO 8601) so you're not retrofitting it after the fact.

### 3. Write `build.ts`

Plain Node, run directly (`node build.ts`, no build step — verified working: Node's built-in TS support handles type annotations, interfaces, and generics with zero flags on Node 22+). Default to built-ins; reach for one targeted package only when the source format needs it.

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

**Parsing CSV** — Node has no built-in CSV parser (Python's stdlib does; this is the one place Node needs something extra even for the "simple" case). For an unquoted, comma-only source, a plain `.split()` is fine and needs nothing installed:

```ts
function parseSimpleCsv(text: string): string[][] {
  return text.trim().split("\n").map((line) => line.split(","));
}
```

The moment fields can contain commas or quotes, hand-rolling breaks silently — don't try to out-clever RFC 4180 by hand. Reach for a small, focused package (`csv-parse`) rather than a hand-rolled regex.

**Parsing xlsx** — `exceljs` (pure JS, no native bindings, installs instantly). One gotcha worth knowing before you hit it: cells computed by a spreadsheet formula don't come back as plain values — `cell.value` returns `{formula, result, ...}` for the master cell of a shared formula and `{result, sharedFormula}` for the rest. Verified directly against a real 27MB source with formula-computed year columns (`datasets/economic-history/millennium-macroeconomic-data-uk`) — without unwrapping, every year column silently comes back `[object Object]`. Python's `openpyxl` sidesteps this with `data_only=True` (reads cached computed values); ExcelJS has no equivalent flag, so unwrap by hand — see `cellValue()` below.

**Cleanup idioms** — missing-value normalization, date parsing, fill-forward section headers, slug generation with dedup, the ExcelJS formula unwrap above, and a deterministic CSV writer. Drawn from real messy sources in `datasets/economic-history`, not hypothetical, and — unlike prose examples in most playbooks — these are a real, tested module rather than copy that can quietly drift out of date:

**`scripts/wrangling-idioms.mjs`** in this repo (`npm test` covers it, `scripts/wrangling-idioms.test.mjs`) — `cleanNumber`, `toIsoDate`, `fillForwardSections`, `makeSlugger`, `cellValue`, `toCsv`. Copy whichever functions a given dataset's `build.ts` actually needs into that file — datasets are independent repos (catalog-as-repo), so this isn't meant to be a live cross-repo import, it's a tested source to copy from. Read the file directly for the implementations; don't re-derive them from memory.

**Government / scientific text data — two shapes to expect** (worked example: `datasets/climate-and-environment/co2-ppm`, NOAA Mauna Loa CO₂):

- **Comment / preamble lines.** Many `.txt`/`.csv` government sources start with dozens of `#`-prefixed lines (provenance, method notes, contact). Strip lines that are blank or start with `#` before parsing; don't hand-count how many to `tail` past.
- **Negative sentinels instead of blanks.** Sources often encode "no information" as an out-of-range number (`-1`, `-9.99`, `-99.99`) rather than an empty field. Normalise these to empty cells — a `num(raw, sentinels)` helper that takes the per-column sentinel list keeps it to one line each and stops a `-9.99` sailing through as a real measurement.
- **Assert the source header.** When you build from an archived snapshot of a source that still updates upstream, have the script check the header row it expects and throw if it changed — otherwise a column the source adds or reorders silently shifts every downstream value (this is exactly how the older community `co2-ppm` dataset ended up with `ndays` published under a `Trend` heading).

**When to reach for DuckDB instead**: if the transform is naturally *one SQL query* — joining several files on a key, a groupby/aggregate, reshaping a genuinely wide table (dozens of year-columns) to long format — DuckDB will be less error-prone than hand-rolled loops. If it's mostly row-by-row string/date/number cleaning on a single source, a plain script is simpler and is what this playbook defaults to. Don't reach for DuckDB by default; reach for it when the problem is actually relational.

### 4. Fill in `datapackage.json`

Schema with typed fields and a `primaryKey`, `licenses`, `sources`, `status: "structured"`. See `AGENTS.md`'s minimal example for the shape.

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

## Two real worked examples

- **Simple case** — `datasets/energy-and-commodities/precious-metals-prices`: fetch a CSV from an API, filter by date, write out. No parsing library needed at all, source and output are both already tidy. This is the common case — don't over-build for it.
- **Messy case** — `datasets/economic-history/millennium-macroeconomic-data-uk`: 27MB multi-sheet xlsx, sparse section headers needing fill-forward, formula-computed cells, three different grains (annual/quarterly/monthly) reshaped to long format. This is what justifies the cleanup idioms above — they're not hypothetical, they're what this source actually needed.

## Common mistakes

- Wrangling interactively in a chat session with no `build.ts` — can't be re-run, can't be reviewed, violates the reproducibility rule in `AGENTS.md`.
- Mixing missing-value conventions (`NA` in one column, empty string in another) — pick one, apply it everywhere via a single `cleanNumber`/`cleanString` helper, not ad hoc per column.
- Setting `status: structured` before `/validate` passes with no errors.
- Forgetting `licenses`/`sources` because they felt like a publishing-time concern — capture them in step 0, before the wrangling gets interesting and they get forgotten.
