---
title: Skills Roadmap — benchmark-driven development of `structure` and `story`
date: 2026-09-05
---

# Skills Roadmap

Planning doc for the next phase of work. Supersedes the "Proposed build order"
section of [`skills-vision.md`](./skills-vision.md) — that doc still holds the
decision history and the vision; this one is the *what next, in what order*.

## North star

DataPressr's skills should produce consistent, high-quality output regardless of
who (or which model) runs them. Today `capture` / `archive` / `structure` exist
as playbooks; `enrich` / `story` / `monitor` don't; only `validate` has a test.
The gap has three parts:

1. **Too few real reps through `structure`.** Two datasets built with it
   (co2-ppm, project-drawdown). Not enough to know where the playbook is silent,
   ambiguous, or wrong.
2. **`story` never designed.** One hand-written story (the Keeling Curve).
   [#10](https://github.com/datasets/datapressr/issues/10) sketches the intended
   shape (outline → viz plan → prose); it needs a second story felt by hand and
   some real craft research before the skill is written.
3. **No benchmark.** Nothing tells us whether a skill is actually good. The
   sibling bake-off repos (`../line-charts`, `../tables-bakeoff`, each with an
   `ANALYSIS.md` + `EVALUATION.md`) are the method to copy: run the same task
   several ways / several times, score against a rubric, write it up.

## Resources to draw on

- **`datasets/commons-issues/`** — a partial local cache of
  <https://github.com/datasets/commons/issues>. ~320 real data finds: a sample
  bank for wrangling reps and for benchmarking `structure`.
- **`github.com/datasets/*`** — already-published datasets (e.g.
  [`oil-prices`](https://github.com/datasets/oil-prices),
  [`gold-prices`](https://github.com/datasets/gold-prices),
  [`s-and-p-500`](https://github.com/datasets/s-and-p-500), many more). Re-wrangle
  one from its *primary* source with `structure`, then diff our output against
  the published version. This is the stronger benchmark — there is ground truth
  to compare against, not just a rubric.
- **Sibling bake-off repos** `../line-charts` and `../tables-bakeoff` — the
  method template, and (once finalised) the source of standard chart/table
  components DataPressr stories will embed. Until then, charting stays
  hand-rolled and the charting-standard decision stays deferred
  ([#11](https://github.com/datasets/datapressr/issues/11)).
- **Beads** (`bd`) is enabled in this repo — use it to log tasks and findings
  locally; it syncs. Prefer it over new GitHub issues or a scratch markdown list
  for session working-state.

## Track A — Wrangling skill: reps + a benchmark

Goal: a scored, written benchmark of `structure` and a prioritised list of
concrete `skills/structure/SKILL.md` edits.

1. **Pick a deliberate spread** from `commons-issues/` — one each of: a clean
   CSV source, a messy multi-sheet `.xlsx`, an HTML table, a JSON / API source,
   and a multi-file join. 3–4 is enough for one session; note the rest for next
   time.
2. **Plus one ground-truth rep:** re-wrangle a published `datasets/*` dataset
   (`oil-prices` is the reference candidate) from its primary source, then diff
   our `data/*.csv` and schema against the published one. Record every
   difference and whether ours or theirs is better.
3. **For each rep, log:** every point where the playbook was silent, ambiguous,
   or wrong; every cleanup idiom that recurred (candidate for
   `scripts/wrangling-idioms.mjs`); every judgment call made with no guidance.
4. **Write `docs/structure-benchmark.md`:** the sample set and what each
   exercised; a rubric (reproducible build? typed schema + `primaryKey`?
   `licenses` + `sources` filled? tidy per `AGENTS.md`? `/validate` clean with
   no warnings? how much unguided human judgment leaked in?); scored results;
   the ground-truth diff; a prioritised list of `structure/SKILL.md` edits.
5. **Do not** rewrite `structure/SKILL.md` this pass — collect the evidence
   first, propose the edits, leave them for review.

## Track B — Story skill: research + a second hand-written story

### B1 — Craft research (write-ups)

- **`docs/story-craft.md`** — what makes a good data story. Survey exemplars
  (FT, NYT / The Upshot, The Pudding, Our World in Data, Reuters Graphics,
  FiveThirtyEight). Extract repeatable patterns: lead with the finding; one
  chart, one idea; annotation over legend; when scrollytelling earns its weight
  vs a static piece; length; how the "how it was made" material is handled
  (late, as a tutorial, or not at all — the Keeling lesson).
- **`docs/voice-guide.md`** — DataPressr's house voice. The Keeling outline
  already gestures at it ("plain and factual, let the numbers carry it; no
  'most important line in climate science', no 'the planet's breathing'").
  Collect good and bad samples, write do / don't rules, and give before/after
  rewrites. Note that a "sounds like me" pass by the author stays a separate
  final stage.
- **Visualisation approach** — a short section (in `story-craft.md` is fine):
  inventory `datapackage.json` `views` (fine for a dataset-page chart, too thin
  for a story), hand-rolled inline SVG (current), and the coming bake-off
  components. Recommend what to do in the interim and the trigger for adopting
  the standard components.

### B2 — Story #2: Planetary Boundaries, the #10 way

[#4](https://github.com/datasets/datapressr/issues/4). Dataset already published
at <https://datahub.io/climate-and-environment/planetary-boundaries>.

1. `archive` the dataset (and note its primary source — Steffen et al. 2015;
   Richardson et al. 2023 for the 2023 update — see
   `commons-issues/338-steffen-et-al-planetary-boundaries-*.md`).
2. Commit **outline** → commit **viz plan** → commit **prose**, each as its own
   commit, mirroring `site/stories/keeling-curve-outline.md`.
3. Keep friction notes inline in the outline (as the Keeling one does).

### B3 — Draft `story` + `enrich` skills (stretch)

Only if A + B1 + B2 land cleanly. Draft `skills/story/SKILL.md` and
`skills/enrich/SKILL.md` from stories #1 + #2 + the research, following the
outline → viz plan → prose separation from #10. Mark them **DRAFT** — not ready
to install.

## Track C — Ship the easy wins

- **C1 — Project Drawdown → its own repo.** The structured dataset is on `main`
  at `datasets/climate-and-environment/project-drawdown/`. No
  `datasets/project-drawdown` GitHub repo exists (checked 2026-09-05); this is
  original packaging, not a reproduction. `git init` a sibling
  `../project-drawdown`, move the dataset in, `gh repo create
  datasets/project-drawdown --public`, push `main`. No `dh push` — the `dh` CLI
  isn't installed here; leave a note. Then drop the dataset from datapressr (it
  lives in its own repo now) or leave a pointer. [#3](https://github.com/datasets/datapressr/issues/3)
- **C2 — co2-ppm follow-ups.** Add the NOAA global mean CO₂ series and a
  growth-rate resource (annual ppm change, and decadal mean growth). Regenerate
  via `build.ts`, re-validate, update the README. [NEXT.md]
- **C3 — Chart polish** ([#12](https://github.com/datasets/datapressr/issues/12)).
  The two Keeling SVGs in `site/stories/make-charts.mjs`: consistent type scale,
  cleaner axis ticks, inline callouts for the 350 ppm (~1988) and 400 ppm (2015)
  crossings, seasonal min/max markers on the sawtooth, colours that read on both
  Flowershow themes. Skip the interactive HTML variant unless there's time.

## Sequencing (for an unattended session)

Ordered so partial completion is still valuable, and nothing downstream depends
on any of it:

1. C1 Project Drawdown (~35 min) — self-contained, visible outcome.
2. C2 co2-ppm follow-ups (~30 min) — self-contained.
3. Track A benchmark (~90 min) — 3–4 samples + the ground-truth rep. Highest
   learning value.
4. B1 story research (~60 min).
5. B2 story #2 — outline + viz plan at minimum; prose if time.
6. C3 chart polish / B3 skill drafts — only if everything above lands.

## Not in this phase

- Finalising `story` / `enrich` (draft only — need the reps first).
- The charting-standard decision (waiting on the bake-off repos).
- The Keeling "sounds like me" voice pass (author's, by hand).
- Inbox triage ([#2](https://github.com/datasets/datapressr/issues/2)).
- `monitor` + unattended cloud execution ([#6](https://github.com/datasets/datapressr/issues/6)).
