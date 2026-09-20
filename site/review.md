---
title: What to review now
description: The short list of things that actually need a human look, newest first.
---

# What to review now

Newest first. Everything is on `main` — GitHub renders the Markdown and shows CSVs
as sortable tables, so no local checkout or DataHub account is needed.

## 2026-09-18 — v1: `story` and `enrich` activated

| Thing | Look at | Why it needs eyes |
|-------|---------|-------------------|
| Story #3 prose | [WTI Went Negative. Brent Didn't.](stories/oil-prices.md) | **Your voice pass is outstanding.** The argument was approved by an independent AI reviewer; the prose is an AI draft rendered from it. |
| Story #3 outline | [outline](stories/oil-prices-outline.md) | Approved after one round of corrections: the first draft explained *why* WTI went negative from price data alone and left out Brent's $9.12 the next day. The mechanism is now attributed to EIA and the CFTC. Agree with where the line was drawn? |
| The two new skills | [`skills/story/`](https://github.com/datasets/datapressr/tree/main/skills/story) · [`skills/enrich/`](https://github.com/datasets/datapressr/tree/main/skills/enrich) | Now active, with their guidance packaged in `references/` so an installed copy doesn't need this repo. Each former open question has a written policy — do the defaults match your intent? |

## 2026-08-30 — autonomous session + follow-ups

**One diff with everything:**
<https://github.com/datasets/datapressr/compare/7eca8eb...main>

| Thing | Look at | Why it needs eyes |
|-------|---------|-------------------|
| Project Drawdown dataset | [repo](https://github.com/datasets/project-drawdown) · [README](https://github.com/datasets/project-drawdown/blob/main/README.md) · [solutions.csv](https://github.com/datasets/project-drawdown/blob/main/data/solutions.csv) | Is the tidy shape right? Is the **licensing call** (facts → PDDL-1.0 + attribution) one you're comfortable with? |
| Portable skills | [`skills/`](https://github.com/datasets/datapressr/tree/main/skills) · [`skills/README.md`](https://github.com/datasets/datapressr/blob/main/skills/README.md) | Do the six skills read consistently? Is the `npx skills` layout what you expected? |
| This site | [`site/`](https://github.com/datasets/datapressr/tree/main/site) | Is the landing page's framing of the product right? |

## Open questions parked for you

- **Project Drawdown** now lives in its own repo at <https://github.com/datasets/project-drawdown> (moved out of `datapressr` on 2026-09-05); DataHub publish still pending.
- **Charting approach** is decided for the near term: Observable Plot rendered to static SVG for stories, declarative `views` for dataset pages ([`docs/charting.md`](docs/charting.md)). A DataHub-native charting standard is still deferred.

## Tracking

Active work is tracked in Beads (`bd ready`). These GitHub issues preserve the earlier discussion:
[#6](https://github.com/datasets/datapressr/issues/6) cloud execution ·
[#7](https://github.com/datasets/datapressr/issues/7) this site ·
[#8](https://github.com/datasets/datapressr/issues/8) wrangle co2-ppm ·
[#9](https://github.com/datasets/datapressr/issues/9) first data story.
Start a working session with [NEXT.md](https://github.com/datasets/datapressr/blob/main/NEXT.md), which selects ready work from Beads.
