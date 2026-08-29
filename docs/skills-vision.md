# DataPressr Skill Suite — Vision & Outline

*Outline only — no stage skills implemented yet. This records the plan and the decisions behind it so we can build against it.*

*Revised after a rigor pass (2026-08-28): the first draft was strategy without a data-quality bar. The actual tidy-data conventions, reproducibility rule, and license/provenance requirement now live in `AGENTS.md` — the file every wrangling session actually reads — rather than being duplicated here. This doc also reordered the charting spike to come after manual stories, not before, per the project's own founding insight (see `SHARING.md`: "ten manual posts will teach more than ten hours of architecture") — the first draft of this plan violated that for the `story` skill specifically.*

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

Plus: `/validate` now also checks for `licenses`, `sources`, and a typed `schema`/`primaryKey` per resource (previously only structural checks — file exists, JSON valid, resources non-empty). Full type-level validation against the actual data (not just that a schema is declared) is still open — see research spikes below.

## Decisions

### Wrangling engine: DuckDB-first, with a thin scripting escape hatch

Pandas rejected as the default — heavy to install for what should be a lightweight, repeatable step ("sledgehammer for a nut"). DuckDB is the starting point:

- Runs as a single binary/embedded lib, no environment to manage
- SQL is a fine fit for the shape-changing work: joins, aggregation, reshaping, type casting
- A surprising amount of "messy data" cleanup — stripping currency symbols, parsing dates — is doable directly in SQL (`regexp_replace`, `strptime`, `try_cast`) and the `structure` playbook should lead with these before reaching for anything else

Known limitation, called out directly from experience: some string/date cleanup gets awkward in pure SQL. So: when a transform stops being readable as SQL, drop to a small script rather than fighting DuckDB. Leaning toward **TypeScript/Node** for that escape hatch over Python — lighter to run, and it gives us a typed layer for free, which matters for the validation point below. Not fully closed — Rust was mentioned as an interest too, but Node's ecosystem and immediacy make it the more practical default for a scripting fallback right now.

**Reproducibility is the actual requirement, not just engine choice.** A transform that only exists as commands typed into a chat session can't be re-run when the source updates and can't be reviewed in a PR diff. Every `structured` dataset needs a checked-in build script (`build.sql` via DuckDB, or `build.ts`) that deterministically turns the raw snapshot into `data/*.csv`. This is now written into `AGENTS.md`, not just this doc, since it's a rule every wrangling session needs at hand.

**Validation** is a first-class concern, not an afterthought: `datapackage.json` already carries a Frictionless Table Schema per resource declaring column types and a `primaryKey` — `structure` must always fill these in, and `/validate` now checks for their presence (see updated `.claude/commands/validate.md`), not just that the file exists. Whether we also want a typed validation layer (e.g. a schema library on the TS side) for anything Frictionless types can't express is still a research question.

**Provenance uses Frictionless's own fields, not a bespoke scheme.** The first draft of this doc proposed inventing new provenance tracking for `archive`; `datapackage.json` already has `licenses` and `sources` fields for exactly this, and — a genuine gap found on review — the existing `/init` scaffold and `AGENTS.md` example didn't use them. Fixed: both now include `licenses`/`sources`, and `AGENTS.md` states they're required past `stub`. This matters beyond tidiness — this project republishes other people's data; shipping a dataset with no recorded license is a real liability, not a nice-to-have.

**Scale ceiling**: "small data" now has a stated rule of thumb (in `AGENTS.md`) — comfortably fits in memory / a local DuckDB instance, well under ~1GB raw. Past that, the workflow should say so explicitly rather than silently forcing it through.

### Skill format: rich `SKILL.md` playbooks

Confirmed. The new stage skills (`capture`, `archive`, `structure`, `enrich`, `story`) are prescriptive playbooks with decision criteria baked in — not terse mechanical commands like the existing three. `structure` and `story` in particular need room for judgment calls (when to drop to a script, which chart shape fits which data) that a short command can't carry.

### Story output: markdown-first; charting approach is a research spike, not decided

Primary artifact is a **markdown write-up** (prose + charts), not required to render on GitHub — it gets published somewhere (DataHub, most likely; DataHub itself may need to grow support for this). This explicitly **moves away from `datapackage.json`'s `views` array** as the charting mechanism for stories — `views` stays fine for a quick chart on a dataset page, but isn't rich enough for a real story.

Direction (not a final decision): fenced code-block chart specs inside the markdown, Evidence.dev-style — author a chart declaratively next to the prose rather than hand-writing HTML/JS per story (a maintenance nightmare over time, per direct experience). Vega-Lite is the leading candidate for the declarative spec language; Observable Plot was also raised. Keep it simple to start, expect to need an escape hatch to real JS for anything genuinely custom.

**Corrected ordering, on review**: the first draft of this plan put a charting research spike *before* a single story had been written by hand — which is precisely the mistake this project already learned not to make once (`SHARING.md`: "don't design the system before you've felt the workflow. Ten manual posts will teach more than ten hours of architecture" — that was about publishing datasets; it applies just as much to stories). Fixed below: write 2–3 stories completely by hand — plain markdown, embed a static chart image or raw Vega-Lite JSON if needed, whatever's fastest — *before* spending any time deciding on a standard chart-block syntax. Let real friction pick the tool instead of guessing at it.

## Open research spikes

These block finalizing a *reusable* `story` skill, but not `capture`/`archive`/`structure`, and not writing individual stories by hand right now.

1. **Charting standard** — informed by 2–3 hand-written stories, not before. Survey Vega-Lite vs Observable Plot (vs others); decide the fenced-block syntax for markdown; decide who renders it (DataHub itself, or a renderer we own).
2. ~~**Validation depth**~~ — partially answered: `/validate`'s deterministic checks now live in `scripts/validate-datapackage.mjs` (zero dependencies, plain Node), copied into each dataset by `/init` so it's self-contained and portable to whatever repo the dataset ends up in. It has a real test suite (`npm test`, Node's built-in test runner, fixtures in `scripts/fixtures/`) — the first actually-tested piece of this project. Still open: this validates *structure* (schema declared, types present, license/source recorded) — it does not check the *data* against its declared schema (e.g. that every `year` cell really parses as a year). That's real type-level validation and is still undecided — plausibly a job for the `structure` skill's build script rather than `/validate` itself, since DuckDB's `try_cast` already does this at build time.
3. **DuckDB cleanup idioms** — a cheat-sheet of SQL patterns for common messy-data problems (currency symbols, date formats, whitespace, encoding), plus a clear rule of thumb for "stay in SQL" vs "drop to a script," so `structure` doesn't reinvent this per dataset.

## Proposed build order

1. **`structure.md`** — biggest gap, most value, doesn't depend on any research spike. DuckDB-first wrangling checklist + schema authoring, built on the data conventions and definition-of-done now in `AGENTS.md`.
2. **`capture.md`** + **`archive.md`** — mechanical, quick wins, formalize what `BACKLOG.md`/`INBOX.md` already do informally.
3. **Write 2–3 stories by hand**, no skill, no standard chart syntax — plain markdown, whatever charting gets it done fastest.
4. **Charting research spike** (timeboxed), informed by what actually caused friction in step 3 → then **`enrich.md`** and **`story.md`**.
5. **`monitor.md`** — later, once a living source actually needs it.

(`/validate`'s schema/license/source checks are already extended — see the changes to `.claude/commands/validate.md` above — so that item is done rather than upcoming.)

## Explicitly not decided yet

- Final chart library/syntax for stories
- Whether the TS escape hatch is genuinely the right call vs. Rust, or something else, long-term
- Whether DataHub gets extended to render story markdown, or stories live somewhere else
- Any monitoring/scheduling mechanism

## What's actually tested (and what isn't)

Worth being blunt about, since it's easy to assume more rigor exists than does. As of this pass:

- **`scripts/validate-datapackage.mjs` is tested** — real fixtures, real assertions, `npm test`. This is the only code in the repo, and the only thing with a test suite.
- **`/init`, `/push`, and the rest of `/validate`'s fallback path are prompts, not code.** An LLM reads English instructions and decides what to do each run. There's no meaningful way to unit-test that the way you'd test a function — the closest available tool is skill evals (see the `skill-creator` skill's "benchmark skill performance" capability), which hasn't been applied here. That's a real, separate gap, not a solved one.
- **The `capture`/`archive`/`structure`/`enrich`/`story` playbooks don't exist yet**, so there's nothing to test for them yet — that's expected at this stage, not a gap.
- **Once `structure.md` exists**, the reproducibility rule already in `AGENTS.md` (a checked-in `build.sql`/`build.ts` per dataset) doubles as that dataset's test: re-running the build script against the raw snapshot and diffing the output is the closest thing to a test a wrangling step gets. No dataset in this project currently has one — the 20+ published datasets were wrangled ad hoc, before this rule existed.
