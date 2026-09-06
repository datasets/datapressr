---
title: DataPressr
description: An opinionated, skill-driven workflow for turning raw data finds into clean, published datasets — and eventually data stories.
---

# DataPressr

**Turn a raw data find into a clean, published dataset — the same way every time, whoever (or whichever model) does the work.**

DataPressr is a set of opinionated *skills* (prescriptive playbooks) that carry a
dataset through its whole lifecycle. `/init`, `/validate` and `/push` already
covered the last mile — packaging and shipping. The newer skills cover everything
upstream: the judgement-heavy part that used to be done ad hoc in a chat window.

## The workflow

| Stage | Skill | What happens |
|-------|-------|--------------|
| capture | `capture` | A URL or idea becomes a GitHub issue — near-zero friction, no judgement |
| archived | `archive` | The raw source is snapshotted with provenance (URL, date, licence) |
| structured | `structure` | Raw → tidy, typed CSV(s) + a real `datapackage.json` schema |
| — | `init` / `validate` / `push` | Scaffold, deterministic checks, publish to DataHub |
| enriched | `enrich` *(planned)* | Descriptive stats + first charts |
| story | `story` *(planned)* | A narrative write-up from one or more datasets |

The skills live in [`skills/`](https://github.com/datasets/datapressr/tree/main/skills)
and install into any agent — `npx skills add datasets/datapressr` — not just Claude Code.

## Honest status

- **Solid:** the `validate` script — a real test suite (`npm test`), 24 assertions.
- **One trial so far:** the `structure` playbook has been run end-to-end exactly
  once ([Project Drawdown](datasets.md)), and on an easy case. Its cleanup-idiom
  *module* is unit-tested; the workflow itself needs a genuinely messy source to
  prove out — [in progress](https://github.com/datasets/datapressr/issues/8).
- **Written, not yet exercised in anger:** `capture`, `archive`.
- **No data story exists yet.** [#9](https://github.com/datasets/datapressr/issues/9) is the first.
- **Not designed:** `enrich`, `story`, `monitor` — deliberately waiting on 1–2
  hand-written stories first.

Full decision history: [`docs/skills-vision.md`](https://github.com/datasets/datapressr/blob/main/docs/skills-vision.md).

## Roadmap to v1

1. Prove `structure` on one genuinely messy source, from raw → typed dataset, with a committed `build.ts`. ([#8](https://github.com/datasets/datapressr/issues/8))
2. Write 1–2 data stories by hand — plain Markdown + whatever charts are fastest. ([#9](https://github.com/datasets/datapressr/issues/9))
3. Decide a charting standard, driven by the friction from step 2.
4. Write the `enrich` + `story` skills from what steps 2–3 taught.
5. Ship this site: landing → datasets → stories → docs. ([#7](https://github.com/datasets/datapressr/issues/7))

*Post-v1:* `monitor` + unattended cloud execution ([#6](https://github.com/datasets/datapressr/issues/6)); skill evals for the prompt-only skills.

## Pages

- **[What to review now](review.md)** — the short list of things that actually need eyes
- **[Datasets](datasets.md)** — what's been produced, with status and links
- **[Data story: The Keeling Curve](stories/keeling-curve.md)** — the first hand-written story
- **[Data story: Planetary Boundaries](stories/planetary-boundaries.md)** — the second hand-written story

---

<sub>This site is `site/` in [`datasets/datapressr`](https://github.com/datasets/datapressr). The official site at <https://datapressr-2-rufuspollock.flowershow.me> git-autosyncs from `site/` on every push to `main`; a preview site (`fl site --name datapressr-preview --yes`) is for checking changes first.</sub>
