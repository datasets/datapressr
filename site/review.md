---
title: What to review now
description: The short list of things that actually need a human look, newest first.
---

# What to review now

Newest first. Everything is on `main` — GitHub renders the Markdown and shows CSVs
as sortable tables, so no local checkout or DataHub account is needed.

## 2026-08-30 — autonomous session + follow-ups

**One diff with everything:**
<https://github.com/datasets/datapressr/compare/7eca8eb...main>

| Thing | Look at | Why it needs eyes |
|-------|---------|-------------------|
| Project Drawdown dataset | [folder](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/project-drawdown) · [README](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/project-drawdown/README.md) · [solutions.csv](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/project-drawdown/data/solutions.csv) | Is the tidy shape right? Is the **licensing call** (facts → PDDL-1.0 + attribution) one you're comfortable with? |
| Portable skills | [`skills/`](https://github.com/datasets/datapressr/tree/main/skills) · [`skills/README.md`](https://github.com/datasets/datapressr/blob/main/skills/README.md) | Do the six skills read consistently? Is the `npx skills` layout what you expected? |
| This site | [`site/`](https://github.com/datasets/datapressr/tree/main/site) | Is the landing page's framing of the product right? |

## Open questions parked for you

- **Project Drawdown** still needs relocating into the real `datasets/climate-and-environment` repo before it goes live (it's staged inside `datapressr` for review).
- **Charting approach** is undecided on purpose — it gets picked from the friction of writing the first data story ([#9](https://github.com/datasets/datapressr/issues/9)), not before.

## Tracking

Active work is in GitHub issues so nothing gets lost:
[#6](https://github.com/datasets/datapressr/issues/6) cloud execution ·
[#7](https://github.com/datasets/datapressr/issues/7) this site ·
[#8](https://github.com/datasets/datapressr/issues/8) wrangle co2-ppm ·
[#9](https://github.com/datasets/datapressr/issues/9) first data story.
Short "what's actionable" view: [`datasets/NEXT.md`](https://github.com/datasets/datapressr/blob/main/datasets/NEXT.md).
