---
title: "`structure` skill — benchmark v1"
date: 2026-09-05
---

# `structure` skill — benchmark v1

First scored pass over the `structure` skill (`skills/structure/SKILL.md`), per
[`skills-roadmap.md`](./skills-roadmap.md) Track A. Purpose: find where the
playbook is silent, ambiguous, or wrong, and turn that into a prioritised edit
list — **not** to rewrite the skill yet.

Method borrowed from the sibling bake-off repos (`../line-charts`,
`../tables-bakeoff`): run the same skill against deliberately different source
shapes, score each against a fixed rubric, and — where a canonical version
already exists — diff the output against it for ground truth.

## Sample set

| # | Dataset | Source shape | Why it's here | Built |
|---|---------|--------------|---------------|-------|
| 1 | `co2-ppm` | NOAA GML plain-text CSV with ~40 `#` comment lines and negative "no data" sentinels | Government/scientific text data — the most common primary-source shape | 2026-08-30, extended 2026-09-05 |
| 2 | `project-drawdown` | A Markdown table pasted into a GitHub issue (community mirror) | Semi-structured prose source; no clean download | 2026-08-30 |
| 3 | `oil-prices` | 8 legacy BIFF8 `.xls` workbooks (EIA), two sheets each, 3 preamble rows | Binary spreadsheet format `exceljs` can't read; **and** a published `datasets/oil-prices` exists to diff against | 2026-09-05 |

Not yet exercised (next round): a JSON / REST-API source, and a genuine
multi-file relational join (the DuckDB escape-hatch case).

## Rubric

Six checks, from `AGENTS.md`'s "definition of done for `status: structured`"
plus one process check.

| Check | 1 `co2-ppm` | 2 `project-drawdown` | 3 `oil-prices` |
|-------|:-:|:-:|:-:|
| **Reproducible** — one `build.ts`, `node build.ts` regenerates `data/*.csv` deterministically from the archived snapshot | ✅ | ✅ | ✅ (needs `npm install` first — one dep) |
| **Typed schema + `primaryKey`** on every resource | ✅ | ✅ | ✅ |
| **`licenses` + `sources`** filled, SPDX id where one exists | ✅ | ✅ (bespoke reasoning documented) | ✅ |
| **Tidy** — snake_case, one value per cell, one row per observation, ISO dates, consistent missing-value token | ✅ | ✅ | ⚠️ kept upstream `Date`/`Price` capitalisation to match the published dataset — violates the snake_case convention |
| **`/validate` clean, no warnings** | ✅ | ✅ | ✅ |
| **Low unguided judgment** — decisions the playbook actually covers vs. calls made with no guidance | ⚠️ 3 unguided | ⚠️ 4 unguided | ⚠️ 4 unguided |

### Ground-truth diff (sample 3 vs `github.com/datasets/oil-prices`)

All eight CSVs are **content-identical** to the published dataset: same row
count, same dates, same prices, same coverage (both current to 2026-09-01).

The only difference: **line terminator** — LF here, CRLF in the published files
(its `datapackage.json` declares `"lineTerminator": "\r\n"`). `AGENTS.md` and the
skill say nothing about line endings, so this was not a decision, just a
divergence. LF is the better default; worth stating so explicitly.

Second-order observations from the diff:

- The published dataset carries a full Frictionless `dialect` block per resource
  (`delimiter`, `quoteChar`, `doubleQuote`, `lineTerminator`, …). Our output
  omits `dialect` entirely and relies on defaults. Defensible, but we should
  decide deliberately whether `structure` emits a `dialect` or not.
- Published field names are `Date` / `Price` (title case). We matched them for a
  clean diff — but that meant knowingly breaking our own snake_case rule. The
  skill has no guidance for "match an existing published dataset's names" vs
  "apply our conventions"; this tension is real and recurring.
- Published resource `name`s are inconsistent in the original
  (`brent-daily`, then `brent-week`, `brent-month`). Ours are uniform
  (`brent-weekly`, `brent-monthly`). A win for the skill's consistency pressure.

## What the playbook covered well

- **The missing-value idiom.** `num(raw, sentinels)` — one helper, applied per
  column, sentinel list explicit — handled NOAA's `-99.99` / `-1` / `-9.99`
  cleanly and is now reused in `co2-ppm`'s growth-rate extension. This is the
  single most-reused pattern across all three builds.
- **Assert-the-header.** All three builds check the source's header/shape and
  throw loudly on drift rather than silently emitting shifted columns. This
  directly caught the column-drift bug in the community `co2-ppm` and protected
  the `oil-prices` 3-row preamble parse. The skill's "government/scientific text
  data" note (added 2026-08-30) earns its place.
- **Deterministic sort + RFC-4180 writer.** The same `toCsv()` helper and an
  explicit final sort appear in all three; output is stable across runs. Good
  candidate to promote from copy-paste into `scripts/wrangling-idioms.mjs`.
- **Reproducibility rule.** Having the archived snapshot + script as the source
  of truth made the `oil-prices` ground-truth diff trivial to run and trust.

## Gaps found — proposed `structure/SKILL.md` edits (prioritised)

Filed individually in beads; summarised here.

> **Applied 2026-09-06.** All eight landed: 1, 4, 8 → `scripts/wrangling-idioms.mjs`
> (`excelSerialToIsoDate`, `num`, RFC-4180 `toCsv`) with tests; 1, 2, 3, 5, 6, 7 →
> `skills/structure/SKILL.md` (xlsx vs legacy `.xls`; timezone-naive dates;
> naming-vs-published rule; LF + no `dialect`; structured preamble; dependency ⇒
> own `package.json`); the `exceljs`/`.xls` and reproducibility notes also went
> into `AGENTS.md`. Beads `datapressr-{pao,dlc,jbz,31i,ejh}` closed.

1. **Excel/spreadsheet dates are timezone-naive — never parse via `Date`.**
   High priority. Reading Excel serials as JS `Date` (e.g. SheetJS
   `cellDates:true`) shifts every date by the runner's UTC offset; it silently
   turned `1987-05-20` into `1987-05-19`. The skill must say: read raw serials,
   convert with an offset-free function (`XLSX.SSF.parse_date_code`), and
   spot-check the first date against the source's documented start. Add to
   `wrangling-idioms` with a test.
2. **Legacy `.xls` needs SheetJS, not `exceljs`.** `AGENTS.md` names `exceljs`
   as *the* xlsx package; it cannot read BIFF8 `.xls` (OLE2). The skill should
   name SheetJS `xlsx` for legacy `.xls` and note the ESM gotcha (`import XLSX
   from "xlsx"`, default import — `import * as XLSX` gives a namespace with no
   `readFile`).
3. **Naming: our conventions vs. an existing published dataset.** No guidance
   today. Proposed rule: default to our conventions (snake_case, uniform
   resource names); deviate only to match a dataset we are explicitly
   re-wrangling for comparison, and say so in the README. Make it a conscious,
   recorded choice.
4. **Line terminator.** State it: `structure` writes LF. One line in the skill +
   the `toCsv` helper already does this; just make it non-accidental.
5. **`dialect` block — emit or not?** Decide whether `structure`'s
   `datapackage.json` carries a Frictionless `dialect` per resource. Leaning no
   (defaults are fine, less to drift), but it should be a documented decision.
6. **Comment/preamble lines** — already noted in the skill (2026-08-30). Reaffirm
   with the `oil-prices` variant: preamble can be *structured rows* inside a
   sheet (title / sourcekey / header), not just `#`-prefixed text lines. The
   "assert the header, don't assume the offset" rule covers both.
7. **Build-time dependency ⇒ `npm install` step.** When a build needs a package,
   the dataset gets its own `package.json` and the README's run line becomes
   `npm install && node build.ts`. `.datahubignore` must exclude `node_modules/`
   and `package.json`. Worth a short "dependencies" section in the skill.
8. **Promote shared helpers.** `toCsv()` (RFC-4180 writer) and the
   `num(raw, sentinels)` missing-value parser are now copy-pasted across three
   builds. Move them into `scripts/wrangling-idioms.mjs` (already the skill's
   tested-idiom module) and have `structure` import rather than inline them.

## Unguided-judgment log (the "⚠️" in the rubric)

Decisions made during these builds that the playbook does not address:

- co2-ppm: whether to date monthly rows to the 1st or the 15th; whether to keep
  NOAA's `decimal_date` column; how to name the deseasonalised column.
- project-drawdown: how to split a multi-sector cell (`/`-separated) into a link
  table; whether "named but not modelled" solutions get a row with an empty
  value or no row; what to do with the all-rights-reserved source terms
  (resolved with a documented facts-not-copyrightable position).
- oil-prices: title-case vs snake_case field names; whether to emit a `dialect`;
  whether to include all four frequencies or just daily; resource-name scheme.

Each is defensible as made, but two runners could reasonably diverge — which is
exactly what the skill is supposed to prevent.

## Verdict

`structure`'s core loop (archive snapshot → assert shape → typed tidy output →
reproducible script → validate) is sound and produced a **byte-for-content-exact**
reproduction of a mature community dataset on the first try. The gaps are at the
edges: spreadsheet dates, dependency handling, and a handful of naming/format
micro-decisions that currently rely on the runner's taste. Items 1–3 above are
the ones worth doing before the next real wrangle.
