# Charting for stories — Observable Plot → static SVG

Packaged with the `story` skill so it works from an installed copy. The DataPressr repo's `site/docs/charting.md` records why this was chosen (a seven-library bake-off; Plot gave the best chart per line of code for a one-off annotated chart).

## The decision

Story charts are authored with [Observable Plot](https://observablehq.com/plot/) and rendered to **static SVG at build time** in Node. The page embeds the committed `.svg` as a Markdown image — no JavaScript runs on it, so it works on any static site and on GitHub.

(Dataset-page charts made by the `enrich` skill are different: declarative `views` in `datapackage.json`, no build step. Don't use Plot there, and don't use `views` for a story — they can't annotate.)

## The pattern

A `<slug>-make-charts.mjs` next to the story. Start from [`make-charts-template.mjs`](make-charts-template.mjs) in this folder.

- `import * as Plot from "@observablehq/plot"` and `import { JSDOM } from "jsdom"` — Plot needs a DOM; jsdom supplies one in Node.
- `Plot.plot({ document, ... })`, then serialise with `.outerHTML`; if Plot wrapped the SVG in a `<figure>`, move its scoped `<style>` into the `<svg>` and add `xmlns`.
- Dependencies live in a scoped `package.json` beside the stories (DataPressr: `site/stories/package.json`, pinned `@observablehq/plot` and `jsdom`), never the project root. Commit `package.json` + `package-lock.json`; gitignore `node_modules/`. Run with `npm ci && node <slug>-make-charts.mjs`.
- **Deterministic output.** Re-running must produce byte-identical SVG — check with two builds and `shasum -a 256`. Plot estimates text width in Node, so set explicit margins rather than relying on measured auto-margins. Plot's scoped class name is stable across runs.

## Rules that came out of real stories

- **Read values, don't type them.** Annotations take their numbers from the CSV rows at build time (look the row up by key and throw if it's missing), so a label can never disagree with the data.
- **Each series from its own rows.** Two resources on different calendars (e.g. two markets with different holidays) must not be joined into one wide table by date — the join invents null or zero points. Pass each resource to its own `Plot.line`.
- **Respect gaps; never plot missing as zero.** Filter to finite values or let Plot break the line.
- **Show period data as periods.** A weekly average stamped on the Friday ending the week is drawn as a step (`curve: "step-before"`) so each value spans the days it averages; say "week ending" in the label.
- **Direct labels, not legends.** Name each series at its end or in empty space; mark the points the prose cites with `Plot.dot` + `Plot.text`.
- **Include the reference the argument needs** — a zero line, a threshold rule — and make the y-domain include every annotated value.
- **Label units on the axis** (currency, per what, nominal or real).

## Check before committing

- Two builds → identical SHA-256.
- Visual check at desktop width and in a ~360px container (a phone). Look for labels colliding with lines or ticks; a title overlapping the top tick usually needs `marginTop` ≈ 28. A 720px-wide chart with 12px text scales to ~6px on a phone — legible on high-DPI screens but small; keep labels short.
- `grep` the SVG's text for each number the prose cites.

## Palette

Line `#2563eb`, secondary line `#9ca3af`, ink `#111827`, highlight/exceeded `#dc2626`, safe `#16a34a`. Override with the project's own palette if it has one.

## When not to use Plot

- A genuinely one-of-a-kind visual that isn't a chart — hand-rolled SVG is fine.
- An interactive or exploratory piece — ship a standalone HTML page with its JS and data alongside.
