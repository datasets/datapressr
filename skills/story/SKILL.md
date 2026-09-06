---
name: story
description: "DRAFT — not installable yet. Use when turning one or more published datasets into a short data story: a single argument the data supports, with annotated charts as visible evidence. Separates the work into three committed, independently reviewable artefacts — outline (+ chart plan), charts, prose — so the argument is signed off before any prose effort and the prose can be re-voiced later without re-litigating the argument. Drafted from stories #1–2; exercise it by hand before installing."
---

# Story: published dataset(s) → a short data story

> **DRAFT.** Written from the two hand-made stories ([Keeling Curve](../../site/stories/keeling-curve.md), [Planetary Boundaries](../../site/stories/planetary-boundaries.md)), not yet run *as a skill*. No `.claude/skills/story` symlink yet — it is here for review, not activation. Expect it to change after the next story or two.

This skill is the **workflow**. The craft lives in three docs and this skill does not restate them:

- [`docs/story-craft.md`](../../docs/story-craft.md) — what makes a good data story: the patterns, the anti-patterns, the spine.
- [`docs/voice-guide.md`](../../docs/voice-guide.md) — the house voice.
- [`docs/charting.md`](../../docs/charting.md) — how charts are authored (Observable Plot → static SVG at build time).

Read those first. What follows is the operational shape: which files, in which order, each its own commit.

## What a story is

A short piece of writing that makes **one argument** the data supports, with the chart(s) as evidence you can see. Not a dataset description, not a dashboard, not a notebook. If you cannot state the argument in one sentence, there is no story yet. (`docs/story-craft.md` → "What a data story is".)

## The contract — done when

- Three artefacts committed in `site/stories/`, in order, each its own commit:
  1. `<slug>-outline.md` — the argument, the ordered beats, the key numbers, **and** the chart plan.
  2. `<slug>-make-charts.mjs` (+ the `<slug>-*.svg` it writes) — the charts.
  3. `<slug>.md` — the prose.
- The **outline was signed off before the prose was written** — that is the point of splitting them.
- The argument is stated in **one sentence** in the outline.
- Every chart: authored with Observable Plot per `docs/charting.md`, rendered to a committed `.svg`, **annotated on the chart** (direct labels, marked moments) — not reliant on a legend. One chart = one idea.
- Prose is **300–700 words**, follows `docs/voice-guide.md`, does not narrate the chart line by line, and every number in the prose is findable on a chart.
- A **"How this was made"** section, last and short: links the dataset and its `build.ts`, notes that re-running reproduces the numbers.
- The story is listed in `site/datasets.md` (and `site/README.md` quick links).
- A **"sounds like me" voice pass by the author is a separate, later, human stage** — it is *not* in this definition of done, and the skill does not do it.

## Step by step

### 0. Pick the argument

One sentence: what does the data show? If you can't, stop — find the argument first, or accept there isn't a story. Decide which **published** dataset(s) it draws on. `structure` (and, if it exists, `enrich`) must already be done — a story consumes a finished dataset, it does not wrangle.

If the upstream dataset can change under you (it's someone else's, still updating), snapshot the exact files it uses into `site/stories/<slug>-src/` with a short `PROVENANCE.md` (source, retrieval date, licence) so the charts stay reproducible. Story #2 does this; story #1 reads its own repo dataset directly and does not need to.

### 1. Outline + chart plan — *commit*

`site/stories/<slug>-outline.md`. The structure, lifted from both existing outlines:

- **Frontmatter** — `title: "Outline: <Title>"`, a one-line `description`.
- **A note** that the prose is a rendering of this — if the prose drifts from the argument here, the prose is wrong.
- **What this story is about** — the argument in a sentence or two, *and what it is not about* (almost always: "not about the data wrangling").
- **Argument, in order** — numbered beats. The default spine (`docs/story-craft.md` §5): the finding → what you're looking at → what it says (2–4 concrete claims, each a number) → the wrinkle / caveat → how this was made. Put the real numbers in the beats now, not later.
- **Chart plan** — a table: `# | chart | data | purpose`. One row per chart. "Purpose" says what the reader should *see*. This is the viz-plan step; it is committed with the outline, not separately, but treat it as its own decision — one chart per beat, no chart that serves two points.
- **Voice** — one line pointing at `docs/voice-guide.md`; note the voice pass is a separate stage.
- **Friction notes** *(scaffolding — keep while the skills are still being written; drop once they stabilise)* — anything the story surfaced about the skill, the charting, or the data. Both existing stories carry these.

Commit: `Story #N (<Title>): outline + chart plan`. **Get the argument signed off here** before step 3.

### 2. Charts — *commit*

`site/stories/<slug>-make-charts.mjs`, following `docs/charting.md`: Observable Plot, rendered to `<slug>-*.svg` in Node, committed, embedded in the prose as `![alt](chart.svg)`. Reads the published dataset or the `<slug>-src/` snapshot. Deterministic output (re-run → byte-identical). One chart per beat in the chart plan; annotate the moments the prose will refer to.

Commit: `Story #N (<Title>): the charts` (the `.mjs`, the `.svg`s, any `site/stories/package.json` change).

### 3. Prose — *commit*

`site/stories/<slug>.md`. Render the outline into finished writing — **wording only, the argument is already fixed**. `docs/voice-guide.md` is the floor. Lead with the headline chart + one line. State conclusions; let the chart corroborate. Method last, short, linked. Keep the friction notes inline if the outline has them.

Commit: `Story #N (<Title>): prose`. Add the story to `site/datasets.md` and `site/README.md` in the same commit.

### 4. Voice pass — *human, separate, not the skill*

The author's "sounds like me" rewrite. Because the argument is fixed in the outline and the charts are independent, this can happen any time and only touches wording. The skill's job ends at step 3; flag that the voice pass is outstanding.

## Where stories live

`site/stories/`. A story is **not** a dataset — no `datapackage.json`, no `data/`. Files per story: `<slug>-outline.md`, `<slug>.md`, `<slug>-make-charts.mjs`, the `<slug>-*.svg` outputs, and optionally `<slug>-src/`.

## Common mistakes

- **The method memoir** — writing the data wrangling as the story. This is exactly what went wrong in story #1's first draft. Wrangling gets one short "how this was made" paragraph at the end.
- **Writing prose before the outline is signed off** — the split exists so the argument is cheap to review and cheap to argue with. Skipping step 1's sign-off throws that away.
- **A chart plan that names a formula without checking it against the columns** — story #2's scoreboard plan said `current ÷ boundary`; it was undefined for one row and wrong-signed for three. Run the transform before the plan is signed off.
- **Chart soup** — several charts, no hierarchy, no single one that is *the* chart. Also: a chart that serves two points (split it).
- **Narrating the chart** — "then it rises, then dips". State the conclusion; the chart is the evidence, not the subject.
- **Fake precision / decoration / dual-axis correlation tricks** — see `docs/story-craft.md` anti-patterns.
- **Treating the voice pass as part of the draft** — it's a separate human stage; don't block the skill on it or attempt it.

## Open questions (DRAFT — resolve with the next story or two)

- **Viz plan as its own file** vs a section of the outline. Currently a section — both stories did it that way and it held. Revisit if a story has enough charts that the plan wants to stand alone.
- **Reference the craft docs vs inline/bundle them.** Referenced here. For `npx skills` portability the craft would need to travel with the skill — decide at graduation.
- **`enrich` as a precondition.** Currently no — a story consumes a `structured` dataset directly. Revisit once `enrich` exists and there's a story that actually used its output.
- **Portability.** The `site/stories/` layout and the repo-relative doc links are DataPressr-specific. A generic install needs a layout convention and the craft bundled.
- **Multi-indicator stories.** Story #2 (a scoreboard, not a series) still fit the finding→wrinkle→method spine, with the comparison as the headline chart. Holds for now; watch whether a genuinely dashboard-shaped story breaks it.
