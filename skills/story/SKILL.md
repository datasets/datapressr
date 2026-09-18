---
name: story
description: "Use when turning one or more finished (structured, optionally enriched) datasets into a short data story: a single argument the data supports, with annotated charts as visible evidence. Separates the work into three committed, independently reviewable artefacts — outline (with chart plan), charts, prose — so the argument is reviewed and approved before any prose effort and the prose can be re-voiced later without re-litigating the argument. Charts are Observable Plot rendered to static SVG."
---

# Story: finished dataset(s) → a short data story

This skill is the **workflow**. The craft travels with it in `references/` — read these first; the skill does not restate them:

- [`references/story-craft.md`](references/story-craft.md) — what makes a good data story: the patterns, the anti-patterns, the default spine.
- [`references/voice-guide.md`](references/voice-guide.md) — the house voice.
- [`references/charting.md`](references/charting.md) — how charts are made (Observable Plot → static SVG at build time), with [`references/make-charts-template.mjs`](references/make-charts-template.mjs) to start from.

Proven on three stories: Keeling Curve (one time series), Planetary Boundaries (multi-indicator scoreboard) and "WTI Went Negative. Brent Didn't." (two resources compared at one moment — the first run of this skill as written, with an independent outline review).

## What a story is

A short piece of writing that makes **one argument** the data supports, with the chart(s) as evidence you can see. Not a dataset description, not a dashboard, not a notebook. If you cannot state the argument in one sentence, there is no story yet.

## Where files go

**DataPressr default:** `site/stories/`, one set per story, slug = the dataset or topic name:

- `<slug>-outline.md` — argument, beats, numbers, chart plan
- `<slug>-make-charts.mjs` → `<slug>-*.svg`
- `<slug>.md` — the prose
- optional `<slug>-src/` — a snapshot of external source files with `PROVENANCE.md`

Chart-build dependencies live in one scoped `package.json` in that folder (`@observablehq/plot`, `jsdom`, pinned), not the project root.

**Other projects:** use the project's existing stories/posts folder if it has one; otherwise create `stories/` at the root. State the chosen location in the outline and keep the same file naming. A story is **not** a dataset — no `datapackage.json`, no `data/`.

**Links on a published site.** If only a subfolder is published (DataPressr publishes `site/`), links from a story to anything outside it (the dataset, its build script, docs) must be absolute URLs to the repository (e.g. `https://github.com/<org>/<repo>/blob/main/...`) — relative `../../` paths work on GitHub and 404 on the site. Links to the story's own files (charts, outline) stay relative.

## The contract — done when

- Three artefacts committed, in order, **each its own commit**: outline → charts → prose.
- The argument is stated in **one sentence** in the outline.
- The outline was **reviewed and approved before charts or prose** (see step 2). The approval is recorded with the reviewer, the exact revision (commit and file hash) and the reproduced numbers.
- Every chart: Observable Plot per `references/charting.md`, a committed `.svg`, **annotated on the chart** (direct labels, marked moments), byte-identical across two builds. One chart = one idea.
- Prose is **300–700 words**, follows `references/voice-guide.md`, does not narrate the chart, and **every data number in the prose is on a chart** — except the exempt kinds listed in `references/story-craft.md` §4, which the prose's friction notes or the task record list explicitly.
- No causal claim the data can't support: explanations are attributed to a named, linked source.
- A short **"How this was made"** section, last: links the dataset and its build script, says re-running reproduces the numbers.
- The story is linked from the site's index pages (DataPressr: `site/datasets.md` and `site/README.md`).
- The **author's voice pass is flagged as outstanding** — a separate human stage, not part of this skill.

## Step by step

### 0. Find the argument

Read the dataset's `SUMMARY.md` if it has been enriched — the consolidated stats table is the fastest way to find the extreme, the anomaly, the one-way series. (Story #3's finding — a single negative value among 25,415 — came from scanning one `min` column across eight resources.) Enrichment is **recommended, not required**: a story can consume a `structured` dataset directly, as stories #1 and #2 did. If you don't have an argument yet, run `enrich` first.

Inspect the data before choosing; don't invent the argument in advance. Check every number you intend to use against the rows, not memory.

If the upstream data can change under you (someone else's dataset, still updating), snapshot the exact files into `<slug>-src/` with a `PROVENANCE.md` (source, retrieval date, licence) so the charts stay reproducible. A dataset in the same repository can be read directly.

### 1. Outline + chart plan — *commit*

`<slug>-outline.md`:

- **Frontmatter** — `title: "Outline: <Title>"`, one-line `description`.
- **A note** that the prose is a rendering of this — if the prose drifts from the argument, the prose is wrong.
- **The argument, in one sentence.**
- **What this story is about** — and what it is *not* about (almost always: not the wrangling). If the data shows *that* but not *why*, say so here.
- **Argument, in order** — numbered beats on the default spine (`references/story-craft.md` §5). Real numbers in the beats now, with dates and units. Include the numbers that **weaken** the argument, not only those that make it. Distinguish measurement kinds that readers conflate (spot vs futures, nominal vs inflation-adjusted, a monthly mean vs a single reading) and note any widely quoted figure that differs from yours.
- **Outside context** — any mechanism or explanation, attributed to a named source with a link, marked as not tested by this data.
- **Chart plan** — a table: `# | chart | data (resource + fields) | transform, gaps, dates | purpose`. One row per chart, each serving one beat. The "transform, gaps, dates" column is where most review corrections land: say how the filter/transform is computed, how missing rows and different calendars are handled (never join two resources by date; never plot missing as zero), how period data is dated (e.g. week-ending), and what the y-domain must include. **Run any formula against the actual columns before submitting** — story #2's plan named a ratio that was undefined for one row and wrong-signed for three.
- **Voice** — one line pointing at the voice guide; the voice pass is separate.
- **Friction notes** — what the story surfaced about the skill, the charts or the data.

The chart plan stays a section of the outline, not its own file: three stories with one or two charts each have not needed more. Split it out only if a story needs enough charts that the table dominates the outline.

Commit: `Story #N (<Title>): outline + chart plan`.

### 2. Outline review — *gate*

Someone other than the outline's author reviews it before any chart or prose work: a human, or an independent AI reviewer with no hand in the outline. The reviewer:

- reproduces every number from the data with their own scan;
- checks each chart plan row: fields exist, the transform is valid, dates exist, gaps and denominators are handled;
- checks the argument makes no causal claim beyond the evidence, and that numbers weakening it are present;
- returns **APPROVED** or numbered, line-referenced corrections.

Record the verdict with the reviewer's identity, the exact revision reviewed (commit + file SHA-256) and the reproduced numbers. Corrections go back to the outline; re-review the new revision. Elapsed time is not approval. On story #3, round 1 caught an unsupported *why*, a mis-stated one-day move and an omitted counter-number; round 2 approved.

### 3. Charts — *commit*

`<slug>-make-charts.mjs` from `references/make-charts-template.mjs`, following `references/charting.md`. Implement exactly the approved chart plan. Annotations read their values from the data rows. Build twice and compare SHA-256; inspect at desktop and phone width.

Commit: `Story #N (<Title>): charts` — the `.mjs` and `.svg`s only.

### 4. Prose — *commit*

`<slug>.md`. Render the approved outline — **wording only; the argument is fixed**. Lead with the headline chart and one line. Embed charts as `![alt](<slug>-chart.svg)` with alt text that states what the chart shows, including the key values. Method last and short. Keep a short "Friction notes" section while the skill is still evolving, and state that the author's voice pass is outstanding.

Before committing, check: word count (300–700, excluding frontmatter, alt text and friction notes); every local link resolves; every data number is on a chart or on the exempt list; no claim beyond the approved outline. A second, quick review of the prose against the outline is cheap and catches overstatement (story #3's caught an "all holders" that the source said was "some").

Commit: `Story #N (<Title>): prose`, together with the index-page links.

### 5. Voice pass — *human, separate*

The author's "sounds like me" rewrite. The argument is fixed and the charts are independent, so this can happen any time and only touches wording. The skill ends at step 4; flag the voice pass as outstanding.

## Common mistakes

- **The method memoir** — the wrangling as the story. It gets one short paragraph at the end.
- **Skipping the outline review** — the split exists so the argument is cheap to check before prose effort.
- **Explaining *why* from a dataset that only shows *what*** — attribute mechanisms to a source.
- **Leaving out the inconvenient number** — the counter-evidence belongs in the outline.
- **A chart plan formula never run against the columns.**
- **Joining two resources by date for one chart** — invents missing points.
- **Chart soup** / **a chart serving two points.**
- **Narrating the chart** instead of stating the conclusion.
- **Relative links that escape the published folder.**
- **Treating the voice pass as part of the draft.**

## Known limits

- The spine is proven on a single series, a scoreboard and a two-resource comparison. A genuinely dashboard-shaped story (many small multiples, no single headline) is untested; if one doesn't fit, say so in the outline.
- Charts are 720px wide with 12px text — on a phone that scales to about 6px. Fine on high-DPI screens; keep labels short.
