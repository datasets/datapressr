---
title: Next session brief — unattended, planned 2026-09-05
date: 2026-09-05
---

# Next session brief

You are running **unattended** — no one is available to answer questions. When
you hit a decision you'd normally ask about, make the reasonable call, write down
what you assumed, and keep moving. Commit small and often, straight to `main`
(nothing depends on this work).

**Read first:** [`docs/skills-roadmap.md`](./skills-roadmap.md) — the full plan.
Then `AGENTS.md`, `docs/skills-vision.md`, and the relevant `skills/*/SKILL.md`.

## Ground rules

- **Log your work in beads** (`bd`). At the start, `bd create` one issue per
  workstream you attempt (A benchmark, B1 research, B2 story #2, C1/C2/C3). Mark
  them in-progress / closed as you go. Put findings that need human review into
  their own beads issues rather than only in prose.
- **Commit per unit** to `main`. Conventional short messages. End every commit
  message with the `Claude-Session` trailer from this session's attribution.
- **Stop rule:** if a wrangling sample won't come clean in ~25 minutes, write
  down why it's hard and move on — a documented failure is a useful benchmark
  result. If a source is unreachable, skip it and note it.
- **Don't** rewrite `skills/structure/SKILL.md`, finalise `story`/`enrich`, or
  touch the charting-standard decision. Collect evidence and propose; leave edits
  for review.
- At the end: write a `changelog/2026-09-05-*.md` entry for anything that
  shipped, update `NEXT.md`, and leave a session report as a beads issue
  (`bd create --type note` or similar) summarising what landed, what didn't, and
  the recommended next moves.

## Order of work

Do these in order. It's fine to not finish — each is independently valuable.

### 1. C1 — Project Drawdown → its own repo (~35 min)

- The dataset is at `datasets/climate-and-environment/project-drawdown/`,
  structured and `/validate`-clean.
- `git init` a new sibling repo at `../project-drawdown` (i.e.
  `/Users/rgrp/src/datasets/project-drawdown`). Move the dataset's contents to
  the repo root. Keep `build.ts`, `archive/`, `data/`, `datapackage.json`,
  `README.md`, `AGENTS.md`, `scripts/`.
- `gh repo create datasets/project-drawdown --public --source . --remote origin
  --description "Project Drawdown — ranked climate solutions (2020 Table of
  Solutions), tidy typed data"`. Push `main`.
- `dh push` is **not** available (no `dh` CLI, no `DATAHUB_*` env) — skip it,
  note in the new repo's README that DataHub publish is pending.
- Back in datapressr: replace the dataset dir with a short `README.md` pointer to
  the new repo (or remove it and mention the move in the changelog). Update
  `NEXT.md` — the "Relocate Project Drawdown" item is done.

### 2. C2 — co2-ppm follow-ups (~30 min)

- In `datasets/climate-and-environment/co2-ppm/`, extend `build.ts` to also
  produce:
  - a **global** annual mean CO₂ series from NOAA GML
    (`https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_gl.csv` and the
    growth-rate file `co2_gr_gl.csv` / `co2_gr_mlo.csv`), as its own resource(s);
  - **growth-rate** columns: year-on-year ppm change for the MLO annual series,
    plus a small decadal-mean-growth resource.
- Add the new resources + typed schemas + `primaryKey` to `datapackage.json`.
  Add the new source URLs to `sources`.
- `node build.ts`, then `/validate` — must be clean, no warnings.
- Update the co2-ppm `README.md` (the comparison-vs-community section too if the
  new series changes anything).

### 3. Track A — `structure` benchmark (~90 min)

Follow `docs/skills-roadmap.md` Track A. Concretely:

- Choose 3–4 finds from `datasets/commons-issues/` spanning: clean CSV, messy
  multi-sheet xlsx, HTML table, JSON/API. Good candidates to look at first:
  `17-gold-prices.md`, `72-natural-gas-prices.md`, `35-euribor.md`,
  `179-gini-index.md`, `332-lazard-levelized-cost-of-energy-*.md`,
  `333-bp-statistical-review-of-world-energy.md` — but pick for source-format
  spread, not topic.
- **Plus one ground-truth rep:** re-wrangle `datasets/oil-prices` (or
  `gold-prices` / `natural-gas` — whichever has the cleanest primary source)
  from its *primary* source using `structure`, then `git clone` or fetch the
  published `datasets/<name>` and diff `data/*.csv` + `datapackage.json` schema
  against ours. Record each difference and a verdict (ours better / theirs
  better / neutral).
- For each rep, capture in notes: playbook gaps, recurring idioms, unguided
  judgment calls.
- Write **`docs/structure-benchmark.md`**: sample set + what each exercised;
  the rubric from the roadmap; scored results; the ground-truth diff; a
  prioritised list of proposed `skills/structure/SKILL.md` edits (as a list, not
  applied). File the top 3–5 proposed edits as individual beads issues.
- Datasets you build here can live under `datasets/<catalog>/<name>/` on `main`
  as normal, at whatever lifecycle stage you reach (`stub` / `archived` /
  `structured`) — a half-finished one is fine, just set `status` honestly.

### 4. B1 — Story craft research (~60 min)

Per roadmap Track B1. Write `docs/story-craft.md` and `docs/voice-guide.md`.
Concrete, example-driven, opinionated — not a link dump. Ground the voice guide
in the Keeling outline's stated preferences and in story #1's prose.

### 5. B2 — Story #2: Planetary Boundaries (if time)

Per roadmap Track B2. Minimum deliverable: `archive` step done +
`site/stories/planetary-boundaries-outline.md` committed. Then a viz plan
section, then prose — each its own commit. Don't rush prose; a committed outline
+ viz plan is a good stopping point.

### 6. C3 chart polish / B3 skill drafts — only if all the above landed

Per roadmap Track C3 / B3.

## Wrap-up checklist

- [ ] `changelog/2026-09-05-*.md` entry for what shipped
- [ ] `NEXT.md` updated (Project Drawdown done; benchmark + research added as
      context; new next-ups)
- [ ] beads issues closed / updated; session-report note filed
- [ ] `npm test` still green
- [ ] everything committed to `main`
