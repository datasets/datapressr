# DataPressr Skill Suite — Vision & Outline

*Outline only — no skills implemented yet. This records the plan and the decisions behind it so we can build against it.*

## Why

`/init`, `/validate`, `/push` cover the *last mile*: you already have clean data, package it, ship it. Everything upstream — turning a raw find into something clean and structured, then into something worth reading — is still done ad hoc in conversation.

The goal is a small set of opinionated skills, in the spirit of the "immaculate" web-design skill: prescriptive enough that the output is consistent regardless of who (or which model) runs them, covering the whole path from raw find to published dataset to data story. Small-data oriented (DataHub-scale), not a big-data pipeline product — though nothing here should block scaling up later.

## Where we are

Already established (see `docs/`):
- **Lifecycle**: capture → stub → archived → structured → enriched → monitored (`docs/lifecyle.md`)
- **Hierarchy**: catalog → dataset → data file (`docs/data-hierarchy.md`)
- **Catalog-as-repo**: one portal/collection = one repo = one DataHub publication (`docs/pattern-catalog-as-repo.md`)
- **Skills**: `/init`, `/validate`, `/push` — all at the `structured → published` end
- **Capture layer**: `datasets/BACKLOG.md` and `datasets/INBOX.md` — plain markdown, manual, no skill wraps it yet
- Proof this works end to end: 20+ datasets already published to DataHub from the backlog

## The gap

| Lifecycle stage | Skill today |
|---|---|
| capture | none — manual markdown edit |
| archived | none |
| structured | none — the actual wrangling is done free-form in conversation |
| enriched | none |
| monitored | none |
| *(structured → published)* | `/init`, `/validate`, `/push` |

## Proposed skill suite

One `SKILL.md` playbook per stage (see format decision below), not thin slash-commands — these are the judgment-heavy stages where an opinionated, prescriptive process is the whole point.

1. **`capture`** — turn a URL/note into a `BACKLOG.md`/`INBOX.md` entry. Mechanical, but worth codifying so entries stay consistent (what fields, what tagging).
2. **`archive`** — fetch and snapshot raw source data with provenance: source URL, retrieval date, license if known, checksum. Never overwrite a snapshot. Writes into a `raw/` (or similar, `.datahubignore`'d) folder, distinct from `data/`.
3. **`structure`** — the core wrangling skill. Raw → tidy CSV(s) + a proper `datapackage.json` schema (types, titles, primary key, missing-value handling). This is where "opinionated data wrangling" actually lives — see tooling decision below.
4. **`enrich`** — quick descriptive stats + first charts on a structured dataset.
5. **`story`** — compose a narrative write-up (prose + charts) from one or more datasets. See output-format decision below.
6. **`monitor`** — recurring pull/diff for living sources. Lower priority — no dataset currently needs it; design later once we feel the need.

Plus: extend `/validate` to check declared schema *types* against actual data (currently only structural checks — file exists, JSON valid, resources non-empty).

## Decisions

### Wrangling engine: DuckDB-first, with a thin scripting escape hatch

Pandas rejected as the default — heavy to install for what should be a lightweight, repeatable step ("sledgehammer for a nut"). DuckDB is the starting point:

- Runs as a single binary/embedded lib, no environment to manage
- SQL is a fine fit for the shape-changing work: joins, aggregation, reshaping, type casting
- A surprising amount of "messy data" cleanup — stripping currency symbols, parsing dates — is doable directly in SQL (`regexp_replace`, `strptime`, `try_cast`) and the `structure` playbook should lead with these before reaching for anything else

Known limitation, called out directly from experience: some string/date cleanup gets awkward in pure SQL. So: when a transform stops being readable as SQL, drop to a small script rather than fighting DuckDB. Leaning toward **TypeScript/Node** for that escape hatch over Python — lighter to run, and it gives us a typed layer for free, which matters for the validation point below. Not fully closed — Rust was mentioned as an interest too, but Node's ecosystem and immediacy make it the more practical default for a scripting fallback right now.

**Validation** should be a first-class concern, not an afterthought: `datapackage.json` already carries a Frictionless Table Schema per resource declaring column types — `structure` should always fill this in, and `/validate` should check actual data against it, not just check the file exists. Whether we also want a typed validation layer (e.g. a schema library on the TS side) for anything Frictionless types can't express is a research question, not decided.

### Skill format: rich `SKILL.md` playbooks

Confirmed. The new stage skills (`capture`, `archive`, `structure`, `enrich`, `story`) are prescriptive playbooks with decision criteria baked in — not terse mechanical commands like the existing three. `structure` and `story` in particular need room for judgment calls (when to drop to a script, which chart shape fits which data) that a short command can't carry.

### Story output: markdown-first; charting approach is a research spike, not decided

Primary artifact is a **markdown write-up** (prose + charts), not required to render on GitHub — it gets published somewhere (DataHub, most likely; DataHub itself may need to grow support for this). This explicitly **moves away from `datapackage.json`'s `views` array** as the charting mechanism for stories — `views` stays fine for a quick chart on a dataset page, but isn't rich enough for a real story.

Direction (not a final decision): fenced code-block chart specs inside the markdown, Evidence.dev-style — author a chart declaratively next to the prose rather than hand-writing HTML/JS per story (a maintenance nightmare over time, per direct experience). Vega-Lite is the leading candidate for the declarative spec language; Observable Plot was also raised. Keep it simple to start, expect to need an escape hatch to real JS for anything genuinely custom, and don't over-invest before the research spike below happens.

## Open research spikes

These block finalizing `enrich`/`story`, but not `capture`/`archive`/`structure` — build order below sequences around that.

1. **Charting standard** — survey Vega-Lite vs Observable Plot (vs others); decide the fenced-block syntax for markdown; decide who renders it (DataHub itself, or a renderer we own).
2. **Validation depth** — how far Frictionless Table Schema types get us vs. where real validation is needed, and what implements the gap.
3. **DuckDB cleanup idioms** — a cheat-sheet of SQL patterns for common messy-data problems (currency symbols, date formats, whitespace, encoding), plus a clear rule of thumb for "stay in SQL" vs "drop to a script," so `structure` doesn't reinvent this per dataset.

## Proposed build order

1. **`structure.md`** — biggest gap, most value, doesn't depend on the charting spike. DuckDB-first wrangling checklist + schema authoring.
2. **`capture.md`** + **`archive.md`** — mechanical, quick wins, formalize what `BACKLOG.md`/`INBOX.md` already do informally.
3. **Charting research spike** (timeboxed) → then **`enrich.md`** and **`story.md`**.
4. **Extend `/validate`** to check schema types against real data.
5. **`monitor.md`** — later, once a living source actually needs it.

## Explicitly not decided yet

- Final chart library/syntax for stories
- Whether the TS escape hatch is genuinely the right call vs. Rust, or something else, long-term
- Whether DataHub gets extended to render story markdown, or stories live somewhere else
- Any monitoring/scheduling mechanism
