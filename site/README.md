---
title: DataPressr
description: An opinionated, skill-driven workflow for turning raw data finds into clean, published datasets — and eventually data stories.
---

# DataPressr

**Turn a raw data find into a clean, published dataset — the same way every time, whoever (or whichever model) does the work.**

DataPressr is a set of opinionated *skills* (prescriptive playbooks) that carry a dataset through its whole lifecycle. `/init`, `/validate` and `/push` already covered the last mile — packaging and shipping. The newer skills cover everything upstream: the judgement-heavy part that used to be done ad hoc in a chat window.

## The workflow

| Stage | Skill | What happens |
|-------|-------|--------------|
| capture | `capture` | A URL or idea becomes a GitHub issue — near-zero friction, no judgement |
| archived | `archive` | The raw source is snapshotted with provenance (URL, date, licence) |
| structured | `structure` | Raw → tidy, typed CSV(s) + a real `datapackage.json` schema |
| — | `init` / `validate` / `push` | Scaffold, deterministic checks, publish to DataHub |
| enriched | `enrich` | Descriptive stats + first charts + a note of what stands out |
| story | `story` | A short data story: reviewed outline → charts → prose |

The skills live in [`skills/`](https://github.com/datasets/datapressr/tree/main/skills) and install into any agent — `npx skills add datasets/datapressr` — not just Claude Code.

## Honest status

- **Solid:** the `validate` script and the shared wrangling idioms — a real test suite (`npm test`, 47 tests).
- **`structure` — proven and benchmarked.** Run end-to-end on three real sources: co2-ppm (NOAA text file), Project Drawdown (Markdown table), and oil-prices (eight legacy `.xls` workbooks) — the last diffed against the published community `datasets/oil-prices` and found content-identical. Scored in [`docs/structure-benchmark.md`](https://github.com/datasets/datapressr/blob/main/docs/structure-benchmark.md); eight prioritised skill edits, all applied 2026-09-06.
- **`capture` / `archive` — in use.** `archive` has snapshotted sources with provenance; `capture` files finds in an Inbox issue, or as a bead once substantive.
- **Three data stories:** [The Keeling Curve](stories/keeling-curve.md) ([#9](https://github.com/datasets/datapressr/issues/9)) and [Planetary Boundaries](stories/planetary-boundaries.md) ([#4](https://github.com/datasets/datapressr/issues/4)), written by hand, and [WTI Went Negative. Brent Didn't.](stories/oil-prices.md), the first written with the `story` skill. Each was built from a committed outline. The author's voice pass is outstanding on all three.
- **`story` and `enrich` — active.** Both were drafted from hand-made examples and graduated after real runs: `enrich` on co2-ppm and oil-prices, `story` on three stories, with an independent review gate on the outline. Each skill bundles its guidance in `references/` ([`skills/story/`](https://github.com/datasets/datapressr/tree/main/skills/story), [`skills/enrich/`](https://github.com/datasets/datapressr/tree/main/skills/enrich)). Stories chart with Observable Plot ([`charting.md`](docs/charting.md)).
- **Not designed yet:** `monitor`.

Full decision history: [`docs/plans/skills-vision.md`](https://github.com/datasets/datapressr/blob/main/docs/plans/skills-vision.md).

## Roadmap to v1

Tracked in Beads (`bd ready`); the original roadmap issue, [#14](https://github.com/datasets/datapressr/issues/14), is closed. **v1 — the `enrich` + `story` skills plus a settled near-term charting approach — is complete** (2026-09-18): both skills are active and proven on real runs, and charting is settled on Observable Plot for stories. Still open, not blocking: the author's voice passes. Post-v1: `monitor` + unattended cloud execution ([#6](https://github.com/datasets/datapressr/issues/6)); skill evals for the prompt-only skills; the [full plan](https://github.com/datasets/datapressr/blob/main/docs/plans/skills-roadmap.md).

## Pages

- **[What to review now](review.md)** — the short list of things that actually need eyes
- **[Datasets](datasets.md)** — what's been produced, with status and links
- **[Changelog](changelog/)** — what has shipped, newest first
- **Docs** — [setup, dataset workflow, source discovery and story-writing guides](docs/README.md).
- **[Data story: The Keeling Curve](stories/keeling-curve.md)** — the first hand-written story
- **[Data story: Planetary Boundaries](stories/planetary-boundaries.md)** — the second hand-written story
- **[Data story: WTI Went Negative. Brent Didn't.](stories/oil-prices.md)** — the third story, the first written with the `story` skill

---

<sub>This site is `site/` in [`datasets/datapressr`](https://github.com/datasets/datapressr). The official site at <https://datapressr-2-rufuspollock.flowershow.me> git-autosyncs from `site/` on every push to `main`; a preview site (`fl site --name datapressr-preview --yes`) is for checking changes first.</sub>
