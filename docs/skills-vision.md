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
- **Capture layer**: GitHub issues + `datasets/NEXT.md` (was plain markdown in `datasets/BACKLOG.md`/`INBOX.md`/`DASHBOARDS.md` — retired, see the build order below)
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

### Wrangling engine: Node/TypeScript-first, DuckDB as an escape hatch

**Reversed from the previous decision.** The first pass here landed on DuckDB-first with a TS escape hatch, reasoned from general preference. Testing against real data changed that: every dataset in `datasets/economic-history` and `datasets/energy-and-commodities` (7 checked) was actually wrangled with a checked-in `process.py`, and 6 of 7 use it — zero use DuckDB, zero use TypeScript. On review, that precedent doesn't actually settle the question: it's the work of human data engineers, some of it years old, reflecting what tooling existed *then* (DuckDB and good TS tooling are both newer than some of these scripts), not a signal about what's best to standardize on *now*. The one thing it does confirm, strongly, independent of language: a checked-in, re-runnable build script per dataset is already how this kind of work gets done well — see the reproducibility rule below, which this evidence validates rather than complicates.

Decision, as an actual opinion rather than a default-by-inertia: **Node, written as `.ts` files with type annotations, run directly with no build step.** Verified in this sandbox — `node script.ts` runs today on Node 22 with zero flags, zero `tsc`, zero bundler. Reasoning:

- **Already proven in this exact repo.** `scripts/validate-datapackage.mjs` — zero dependencies, instant to run, has a real test suite — is the one piece of working, tested infrastructure this project has. That's a stronger precedent than any of the older catalog repos, because it's ours, written under our own rules, today.
- **One language across the whole pipeline.** Charting/story output is inherently JS/declarative-spec territory (Vega-Lite, Observable Plot — see the story decision below) — wrangling in the same language means one runtime, one test framework, shared utilities (a date parser, a schema checker) reusable between `structure` and `story` instead of duplicated across Python and JS.
- **Lowest friction to write and run correctly**, which is the actual criterion right now — not deployability. Built-in `fetch`/`fs`/`URL` cover most sources without any dependency at all, matching what the Python precedent got right (stdlib first) without Python's environment/venv overhead.

Stdlib-first, same principle as before, different language:
- Plain Node built-ins (`fetch`, `fs`, `URL`, `Intl`) for straightforward CSV/JSON sources — the common case.
- One targeted, pure-JS package only when the source format demands it — e.g. `exceljs` for xlsx (no native bindings, `npm install` just works here, unlike some Python xlsx libraries).
- **DuckDB is a real escape hatch, not abandoned** — reach for it (via its Node binding) when a transform is genuinely relational: multi-file joins, heavy aggregation, reshaping wide-to-long across many columns. That's a SQL-shaped problem no matter what language wraps it. Just not the default for the common case of "clean up one messy source into one tidy CSV."
- Deployability (can this run unattended in CI, a scheduled job, a worker) matters for `monitor` — a source that updates and needs re-wrangling on a schedule — but not for a one-off `structure` pass on a source we'll never re-fetch. Don't let that constraint drive the default; it's a real factor for exactly one future skill (`monitor`), not for `structure` itself.

**Reproducibility is the actual requirement, not just engine choice.** A transform that only exists as commands typed into a chat session can't be re-run when the source updates and can't be reviewed in a PR diff. Every `structured` dataset needs a checked-in build script (`build.ts`, run directly with `node`) that deterministically turns the raw snapshot into `data/*.csv`. This is now written into `AGENTS.md`, not just this doc, since it's a rule every wrangling session needs at hand — and it's the one part of the old Python precedent this project should keep doing, just in the new language.

**Validation** is a first-class concern, not an afterthought: `datapackage.json` already carries a Frictionless Table Schema per resource declaring column types and a `primaryKey` — `structure` must always fill these in, and `/validate` now checks for their presence (see updated `.claude/commands/validate.md`), not just that the file exists. Whether we also want a typed validation layer (e.g. a schema library on the TS side) for anything Frictionless types can't express is still a research question.

**Provenance uses Frictionless's own fields, not a bespoke scheme.** The first draft of this doc proposed inventing new provenance tracking for `archive`; `datapackage.json` already has `licenses` and `sources` fields for exactly this, and — a genuine gap found on review — the existing `/init` scaffold and `AGENTS.md` example didn't use them. Fixed: both now include `licenses`/`sources`, and `AGENTS.md` states they're required past `stub`. This matters beyond tidiness — this project republishes other people's data; shipping a dataset with no recorded license is a real liability, not a nice-to-have.

**Scale ceiling**: "small data" now has a stated rule of thumb (in `AGENTS.md`) — comfortably fits in memory in a single Node process, well under ~1GB raw. Past that, the workflow should say so explicitly rather than silently forcing it through.

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

1. ~~**`structure.md`**~~ — done: `.claude/skills/structure/SKILL.md`. Node/TS-first (see the reversed engine decision above), grounded in two real datasets (`precious-metals-prices` for the simple case, `millennium-macroeconomic-data-uk`'s 27MB multi-sheet xlsx for the messy one). Cleanup idioms aren't just prose in the playbook — they're a tested module, `scripts/wrangling-idioms.mjs` + `scripts/wrangling-idioms.test.mjs`, so the skill's code examples can't silently drift out of correctness the way most playbook prose can.
2. ~~**`capture.md`** + **`archive.md`**~~ — done: `.claude/skills/capture/SKILL.md`, `.claude/skills/archive/SKILL.md`. Along the way, `datasets/BACKLOG.md`/`INBOX.md`/`DASHBOARDS.md` were actually retired, not just described as informal precedent — freeform markdown doesn't scale as a queue (no search, no triage state). Replaced with [GitHub issues](https://github.com/datasets/datapressr/issues) (one consolidated Inbox issue for small finds, individual issues once something's substantive) and `datasets/NEXT.md` as the short "what's actionable now" view. (Beads was evaluated as an alternative — installs fine, but its real cross-session continuity needs a Dolt remote, not just the JSONL export its own docs call "not the source of truth." More infrastructure than this project's backlog needs right now; plain issues won.)
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
- **`structure.md` exists now; `capture`/`archive`/`enrich`/`story` still don't** — nothing to test for those yet, expected at this stage.
- **`structure.md`'s own code examples are tested** (`scripts/wrangling-idioms.mjs` + tests), not just prose that could drift. The playbook itself (the step-by-step judgment calls) still isn't eval-tested — same gap as the other prompts, not solved, just smaller than it was.
- The reproducibility rule in `AGENTS.md` (a checked-in `build.ts` per dataset, re-run and diffed) is the closest thing a wrangling step gets to a test — `structure.md`'s step 6 makes this explicit. No dataset in this project has one yet — the 20+ published datasets were wrangled ad hoc, before this rule existed. Real prior work (`datasets/economic-history`, `datasets/energy-and-commodities`) independently converged on the same idea with `process.py`, which is reassuring, but those predate the rule too.
