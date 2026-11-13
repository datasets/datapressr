---
name: story
description: "Use when turning one or more finished (structured, optionally enriched) datasets into a short data story: a single argument the data supports, with annotated charts as visible evidence. Separates the work into three committed, independently reviewable artefacts — outline (with chart plan), charts, prose — so the argument is reviewed and approved before any prose effort and the prose can be re-voiced later without re-litigating the argument. Charts are Observable Plot rendered to static SVG."
---

# Story: finished dataset(s) → a short data story

This skill is the **workflow**. The craft travels with it in `references/` — read these first; the skill does not restate them:

- [`references/story-craft.md`](references/story-craft.md) — what makes a good data story: the patterns, the anti-patterns, the default spine.
- [`references/voice-guide.md`](references/voice-guide.md) — the house voice.
- [`references/writing.md`](references/writing.md) — sentence and structure rules for the prose (step 4): open on the change, one or two numbers per sentence, definitions inline, claim headings, linked paragraphs, chart lead-ins, one plain caveat, yardsticks, a reader-facing close.
- [`references/scope-review.md`](references/scope-review.md) — the light, fresh-context fidelity-and-scope review after the draft (step 4): each measure's exact wording once, claim scope checked, at most 8 must-fix items.
- [`references/charting.md`](references/charting.md) — how charts are made (Observable Plot → static SVG at build time), with [`references/make-charts-template.mjs`](references/make-charts-template.mjs) to start from.

Proven on three stories: Keeling Curve (one time series), Planetary Boundaries (multi-indicator scoreboard) and "WTI Went Negative. Brent Didn't." (two resources compared at one moment — the first story written with the skill, in draft, with an independent outline review).

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
- Before any handoff for shipping, the finished draft has an independent agent's **APPROVED** editorial review using [the final-review template](references/editorial-review.md), with reviewer identity, exact commit and file SHA-256s, reproduced evidence and a saved review artifact (step 4). Outline approval alone does not clear this gate.
- Every chart: Observable Plot per `references/charting.md`, a committed `.svg` plus its `-mobile.svg`, built from one `chart()` spec, **framed** (takeaway title, subtitle with measure and unit, source line inside the SVG), **annotated on the chart** (direct labels, marked moments; no text key on phones), greys plus one accent, byte-identical across two builds. One chart = one idea; chart 1 proves the post title.
- Prose **opens with a standalone summary**: the first paragraph after the title, chart and caption, before any section heading, states the main finding with at least one number in at most 80 words (an optional `**In short:**` label is fine). A reader who stops there has the story. There is **no word limit**: length is free, but it should be earned — every section answers a question the reader will ask. The prose follows `references/voice-guide.md` and `references/writing.md`, does not narrate the chart, and **every data number in the prose is on a chart** — except the exempt kinds listed in `references/story-craft.md` §4, which the prose lists explicitly in its front matter (`story_check_exempt:`, format in step 4).
- The draft has had a **fidelity-and-scope review** by a fresh-context subagent per [`references/scope-review.md`](references/scope-review.md), its must-fix items applied, and the review pasted in NOTES.md (step 4).
- No causal claim the data can't support: explanations are attributed to a named, linked source.
- A short **"How this was made"** section, last: links the dataset and its build script, says re-running reproduces the numbers.
- The story is linked from the site's index pages (DataPressr: `site/datasets.md` and `site/README.md`).
- The **author's voice pass is flagged as outstanding** — a separate human stage, not part of this skill. The flag lives in NOTES.md and the front matter's `status: draft`, never in the reader text.

## Step by step

### 0. Find the argument

Read the dataset's `SUMMARY.md` if it has been enriched — the consolidated stats table is the fastest way to find the extreme, the anomaly, the one-way series. (Story #3's finding — a single negative value among 25,415 — came from scanning one `min` column across eight resources.) Enrichment is **recommended, not required**: a story can consume a `structured` dataset directly, as stories #1 and #2 did. If you don't have an argument yet, run `enrich` first.

Treat an extreme as a lead. Before fixing the argument, investigate a comparison that matters to the intended reader: what does the headline figure hide, which expectation does it test, or what everyday concern does it help explain? For example, compare national GDP per head with the regional distribution to ask how well the headline describes most regions; this does not measure household living standards. Choose the question the evidence can answer; a finding that confirms an expectation can still matter. A striking value alone does not establish the reader's payoff.

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
- **Chart plan** — a table: `# | chart | data (resource + fields) | transform, gaps, dates | purpose`. One row per chart, each serving one beat. The purpose column gives the chart's draft title (the point it proves), its accent (the same protagonist hue across the story; a second accent only for a two-way comparison) and its explanatory annotations (three or fewer; see `references/charting.md` design rules). The "transform, gaps, dates" column is where most review corrections land: say how the filter/transform is computed, how missing rows and different calendars are handled (never join two resources by date; never plot missing as zero), how period data is dated (e.g. week-ending), and what the y-domain must include. **Run any formula against the actual columns before submitting** — story #2's plan named a ratio that was undefined for one row and wrong-signed for three.
- **Voice** — one line pointing at the voice guide; the voice pass is separate.

The chart plan stays a section of the outline, not its own file: three stories with one or two charts each have not needed more. Split it out only if a story needs enough charts that the table dominates the outline.

Commit: `Story #N (<Title>): outline + chart plan`.

### 2. Outline review — *gate*

Someone other than the outline's author reviews it before any chart or prose work: a human, or an independent AI reviewer with no hand in the outline. The reviewer:

- reproduces every number from the data with their own scan;
- checks each chart plan row: fields exist, the transform is valid, dates exist, gaps and denominators are handled;
- checks the argument makes no causal claim beyond the evidence, and that numbers weakening it are present;
- **reader questions:** writes down, before reading the outline, the five to eight questions a curious reader brings to the topic, and says which the outline answers, partly answers or misses (`references/story-craft.md` §10). Correctness alone is not enough: an outline can pass every check and still be shallow;
- returns **APPROVED** or numbered, line-referenced corrections.

Record the verdict with the reviewer's identity, the exact revision reviewed (commit + file SHA-256) and the reproduced numbers. Corrections go back to the outline; re-review the new revision. Elapsed time is not approval. On story #3, round 1 caught an unsupported *why*, a mis-stated one-day move and an omitted counter-number; round 2 approved.

### 3. Charts — *commit*

`<slug>-make-charts.mjs` from `references/make-charts-template.mjs`, following `references/charting.md`. Implement exactly the approved chart plan. Annotations read their values from the data rows. Build twice and compare SHA-256; render the desktop SVG at 720 px and the mobile one at 326 px and look at both. Run `npm run story-check -- <dir>` (DataPressr) on the charts: no `chart-*` FAIL; fix each `chart-*` warning or record in the chart plan why it stands (e.g. a categorical chart with four hues).

Commit: `Story #N (<Title>): charts` — the `.mjs` and `.svg`s only.

### 4. Prose — *commit*

`<slug>.md`. Render the approved outline — **wording only; the argument is fixed**. Write it with [`references/writing.md`](references/writing.md): the outline's beat order is the argument, but the prose turns it into a connected read (claim headings, each paragraph linked to the last, definitions inline, a close that answers the opening question). Lead with the headline chart, then the opening summary (the contract's first prose rule): the finding and its key number, standalone. The chart's own title, subtitle and source line travel with it, so a caption below holds only notes the chart can't (or nothing). Embed charts as `![alt](<slug>-chart.svg)` (or a `<picture>` with the `-mobile.svg` as `<source media="(max-width: 600px)">`) with alt text that states what the chart shows, including the key values. Method last and short. The README is reader text only: no friction notes, no draft or voice-pass status (those go in NOTES.md, below; story-check fails a README that says "Draft:" or "voice pass").

Frontmatter: `title`, one-line `description`, and a `datahub` block with the story's DataHub slug (short, title-derived, never a dataset name, since stories and datasets share a publication's namespace) and `status: draft`. Only after the voice pass or an explicit owner OK does it become `status: approved` with an `approved:` line giving the date and basis:

```yaml
datahub:
  slug: wti-went-negative
  status: draft          # or: approved
  # approved: 2026-10-12 owner voice pass
```

List every exempt number in the front matter (no reader sees it), one item per number, written exactly as it appears in the prose, with its exempt kind:

```yaml
story_check_exempt:
  - "25,415: dataset-wide count"
  - "$9.10: all-time low outside the chart's window"
```

**NOTES.md** — the writer's notes beside the story package, never published (for a story in DataPressr `site/stories/`, `docs/reviews/<slug>-notes.md`). It holds the fidelity-and-scope review (below), the **friction notes** (what the story surfaced about the skill, the charts or the data, from the outline on), the line **"Voice pass: outstanding"** (the author's separate stage, step 5) and the **time spent**: run `date` when you start and again when you finish, and paste both timestamps and the difference; never estimate. None of this goes in the outline or the README; older stories that carry a "Friction notes" section still pass story-check.

**Story-check — required, after drafting.** Run `story-check` on the draft's package folder, the one holding the `README.md` you deliver (`npm run story-check -- <dir>` in DataPressr, on the bundled package for a `site/stories/` draft; elsewhere `node scripts/story-check.mjs <dir>` from the skill folder, which needs only Node), and fix every FAIL. Its `density` line is information only.

**Fidelity-and-scope review — required, after story-check.** Give a fresh-context subagent only the README, the chart SVGs, DATA.md, PROVENANCE.md and the source metadata pages you saved (never your notes or outline), with the brief in [`references/scope-review.md`](references/scope-review.md). It checks that each measure's exact source wording appears once, where it is defined, and that every causal, comparative or general claim is supported at its strength, and returns at most 8 must-fix items. Paste its review into NOTES.md and apply each item, or say in one line why not. It fixes errors; it is not a call for hedges. Keep the headline punchy: a fix never lengthens the title, and never spreads the finding over more numbers. After a measure is defined, use a short plain name that keeps it. Re-run `story-check`.

Before committing, run the writing checks at the end of `references/writing.md` and the [claim checks](references/editorial-review.md#claim-checks--writer-runs-before-handoff-reviewer-re-runs) on every sentence, then check: the opening paragraph stands alone as a summary (before any section heading, at least one number, at most 80 words); the length is earned, with no section the reader would skip; every local link resolves; every data number is on a chart or on the exempt list; no claim beyond the approved outline. Follow the project's draft visibility rules: in DataPressr, both outline and prose also carry `publish: false` and stay out of the public stories index until owner approval.

Commit: `Story #N (<Title>): prose`, together with the index-page links.

**Final editorial review — mandatory gate before handoff for shipping.** Give an independent agent with no hand in writing or revising the story the committed outline, prose, charts, build script, exact data and source context, plus [the review instructions and template](references/editorial-review.md). The outline reviewer may return if they did not write or revise the artifacts. The reviewer starts with reader questions, then independently checks interest and coverage honesty, evidence and calculations, argument and counterevidence, chart integrity and desktop/phone rendering, writing and house voice, and reproducibility and draft readiness. They record the strongest objection and most valuable revision, supported by specific evidence; checklist scores cannot average away a failure.

Save their completed review in the project's internal review folder (DataPressr: `docs/reviews/<slug>-editorial-review.md`), recording reviewer identity, reviewed commit, SHA-256 manifest and evidence. Require **APPROVED** or numbered, located **CHANGES_REQUIRED** with a concrete fix and verification for each. Resolve required changes and obtain independent re-review of the new revision before presenting the story for shipping. An unavailable reviewer or incomplete check leaves the gate open. Changes to the argument or chart plan return to step 2; material changes to title, claims, numbers, charts or method after approval require final re-review, including after a human voice pass.

Handoff links the exact approved draft and review artifact, summarises the verdict and remaining human voice/owner stage. Agent approval clears this draft handoff only: it cannot certify the author's voice, change publication status or authorise publishing.

**Pre-publish check.** Before a blog-layout package (`README.md` + SVGs + `<slug>-src/`) goes to `dh publish -p blog`, run `npm run story-check -- <package-dir>` in DataPressr and fix every FAIL: front matter, no H1, DataHub MDX, images present (mobile SVGs too), clean SVGs, absolute `https://datahub.io/blog/<slug>/_r/-/<path>` download links. Exempt numbers stay in the front matter's `story_check_exempt:` list (step 4; DataHub does not render it), and friction notes and the voice-pass flag stay in NOTES.md. The push skill's blog mode has the publish steps.

### 5. Voice pass — *human, separate*

The author's "sounds like me" rewrite. The argument is fixed and the charts are independent, so this can happen any time and only touches wording. The skill ends at step 4; flag the voice pass as outstanding in NOTES.md, not in the story.

Keep the owner's remarks on any draft verbatim in `docs/reviews/<slug>-user-feedback.md` (or the project's equivalent) before revising — they are the evidence for improving this skill.

## Common mistakes

- **The method memoir** — the wrangling as the story. It gets one short paragraph at the end.
- **Skipping the outline review** — the split exists so the argument is cheap to check before prose effort.
- **Explaining *why* from a dataset that only shows *what*** — attribute mechanisms to a source.
- **Leaving out the inconvenient number** — the counter-evidence belongs in the outline.
- **A chart plan formula never run against the columns.**
- **Joining two resources by date for one chart** — invents missing points.
- **Chart soup** / **a chart serving two points.**
- **Narrating the chart** instead of stating the conclusion.
- **The dense report** — every value in every sentence, a definitions block after the lede, label headings, a methods ending. Accurate and unread; see `references/writing.md`.
- **Relative links that escape the published folder.**
- **Treating the voice pass as part of the draft.**

## Known limits

- The spine is proven on a single series, a scoreboard and a two-resource comparison. A genuinely dashboard-shaped story (many small multiples, no single headline) is untested; if one doesn't fit, say so in the outline.
- Chart text widths are estimated (no font measuring in Node), so `frame()` wraps and `chart-clipping` checks with average glyph widths: look at the rendered PNGs, especially long labels and wide tick values.
