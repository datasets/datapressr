---
title: Charting approach
date: 2026-09-06
---

# Charting approach

The near-term decision from [#11](https://github.com/datasets/datapressr/issues/11), settled by the [line-charts bake-off](https://github.com/datasets/line-charts) and the friction of writing the first two data stories.

## Decision

**Story and `enrich` charts are authored with [Observable Plot](https://observablehq.com/plot/) and rendered to static SVG at build time.** The published page embeds the `.svg` as a Markdown image — no JavaScript runs on it, same as when the charts were hand-rolled.

Why Plot:

- The bake-off's [evaluation](https://github.com/datasets/line-charts/blob/main/EVALUATION.md) rates it the best chart-per-line-of-code for a data story or a one-off analytical chart, of seven libraries tested. Its grammar reads close to how you'd describe the chart aloud; gap handling and axis defaults are sane.
- Both stories' friction notes pointed the same way. Story #2's scoreboard — a normalised ranged-bar chart with a clipped outlier — was about the ceiling of what hand-rolled SVG is comfortable for.
- Rendered server-side it keeps the existing deployment model exactly: a committed `.svg`, no client JS, works in Flowershow and on GitHub.

The [Keeling Curve](../site/stories/keeling-curve.md) charts (story #1) are still hand-rolled SVG; port them if they get touched ([#12](https://github.com/datasets/datapressr/issues/12)).

## The pattern

A `*-make-charts.mjs` next to the story. See [`site/stories/planetary-boundaries-make-charts.mjs`](../site/stories/planetary-boundaries-make-charts.mjs) for the reference.

- `import * as Plot from "@observablehq/plot"` and `import { JSDOM } from "jsdom"` — Plot needs a DOM; jsdom supplies one in Node.
- `Plot.plot({ document, ... })`, then serialise the returned node with `.outerHTML` (pull Plot's scoped `<style>` into the `<svg>` if Plot wrapped it in a `<figure>`).
- Write the `.svg` beside the story; reference it from the Markdown as `![alt](chart.svg)`.
- Build-only dependencies live in a scoped `package.json` (`site/stories/package.json`), not the repo root — the same convention as a dataset's `build.ts` deps (`oil-prices/`). `node_modules/` is gitignored; commit `package.json` + `package-lock.json`.
- Re-running the script must produce byte-identical SVG. Plot's Node render estimates text width (no browser layout engine), so set explicit margins rather than relying on measured auto-margins.

Shared palette (also used by the story SVGs): line `#2563eb`, safe `#16a34a`, exceeded `#dc2626`, ink `#111827` — the categorical set from Anthropic's dataviz guidance, as used across the bake-off.

## When not to use Plot

- **A genuinely bespoke, one-of-a-kind visual** — hand-rolled SVG is still fine. Don't fight Plot's grammar to get a picture that isn't a chart.
- **An interactive or exploratory piece** — Flowershow serves raw HTML pages (drop the `.html` in `site/`, ship its JS and data alongside). [`site/charting-spike.html`](../site/charting-spike.html) is an example of a shipped standalone page.

## Still deferred

A DataHub / Flowershow-**native** charting standard — `datapackage.json` `views` that render on the dataset page without a build step. That is the longer half of [#11](https://github.com/datasets/datapressr/issues/11). Revisit when the bake-off's component set is finalised, or when DataHub renders `views` directly.
