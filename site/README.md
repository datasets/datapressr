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
| enriched | `enrich` *(draft)* | Descriptive stats + first charts |
| story | `story` *(draft)* | A narrative write-up from one or more datasets |

The skills live in [`skills/`](https://github.com/datasets/datapressr/tree/main/skills) and install into any agent — `npx skills add datasets/datapressr` — not just Claude Code.

## Honest status

- **Solid:** the `validate` script — a real test suite (`npm test`), 24 assertions.
- **`structure` — proven and benchmarked.** Run end-to-end on three real sources: co2-ppm (NOAA text file), Project Drawdown (Markdown table), and oil-prices (eight legacy `.xls` workbooks) — the last diffed against the published community `datasets/oil-prices` and found content-identical. Scored in [`docs/structure-benchmark.md`](https://github.com/datasets/datapressr/blob/main/docs/structure-benchmark.md); five prioritised skill edits filed, not yet applied.
- **`capture` / `archive` — in use.** `archive` has snapshotted sources with provenance; `capture` files finds as GitHub issues.
- **Two hand-written data stories:** [The Keeling Curve](stories/keeling-curve.md) ([#9](https://github.com/datasets/datapressr/issues/9)) and [Planetary Boundaries](stories/planetary-boundaries.md) ([#4](https://github.com/datasets/datapressr/issues/4), draft) — each built from a committed outline.
- **`story` and `enrich` — first drafts written** ([`skills/story/SKILL.md`](https://github.com/datasets/datapressr/blob/main/skills/story/SKILL.md) from the two hand-made stories; [`skills/enrich/SKILL.md`](https://github.com/datasets/datapressr/blob/main/skills/enrich/SKILL.md) from one hand rep on co2-ppm), plus the craft docs ([`story-craft.md`](https://github.com/datasets/datapressr/blob/main/docs/story-craft.md), [`voice-guide.md`](https://github.com/datasets/datapressr/blob/main/docs/voice-guide.md), [`charting.md`](https://github.com/datasets/datapressr/blob/main/docs/charting.md)). Neither activated yet — each needs a real run.
- **Not designed yet:** `monitor`.

Full decision history: [`docs/skills-vision.md`](https://github.com/datasets/datapressr/blob/main/docs/skills-vision.md).

## Roadmap to v1

Tracked in [epic #14](https://github.com/datasets/datapressr/issues/14). In short: prove the skills by using them for real, then write the missing ones from what that teaches. `structure` is proven and benchmarked, the site is shipped, and two hand-written stories are done (#2 in draft). **v1 is the `enrich` + `story` skills plus a settled near-term charting approach.** Post-v1: `monitor` + unattended cloud execution ([#6](https://github.com/datasets/datapressr/issues/6)); skill evals for the prompt-only skills.

## Pages

- **[What to review now](review.md)** — the short list of things that actually need eyes
- **[Datasets](datasets.md)** — what's been produced, with status and links
- **[Data story: The Keeling Curve](stories/keeling-curve.md)** — the first hand-written story
- **[Data story: Planetary Boundaries](stories/planetary-boundaries.md)** — the second hand-written story

---

<sub>This site is `site/` in [`datasets/datapressr`](https://github.com/datasets/datapressr). The official site at <https://datapressr-2-rufuspollock.flowershow.me> git-autosyncs from `site/` on every push to `main`; a preview site (`fl site --name datapressr-preview --yes`) is for checking changes first.</sub>
