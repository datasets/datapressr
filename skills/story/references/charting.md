# Charting for stories — Observable Plot → static SVG

Packaged with the `story` skill so it works from an installed copy. The DataPressr repo's [`site/docs/charting.md`](https://github.com/datasets/datapressr/blob/main/site/docs/charting.md) records why this was chosen (a seven-library bake-off; Plot gave the best chart per line of code for a one-off annotated chart).

## The decision

Story charts are authored with [Observable Plot](https://observablehq.com/plot/) and rendered to **static SVG at build time** in Node. The page embeds the committed `.svg` as a Markdown image — no JavaScript runs on it, so it works on any static site and on GitHub.

(Dataset-page charts made by the `enrich` skill are different: declarative `views` in `datapackage.json`, no build step. Don't use Plot there, and don't use `views` for a story — they can't annotate.)

## Choose the comparison before the chart form

In the chart plan's existing purpose column, name the comparison the reader needs to make and the visual feature that exposes it. Choose the marks for that task: aligned positions on a common scale help compare values precisely; a distribution beside its aggregate shows how representative the headline is. For a question about who gains and loses, separate the affected groups or outcomes so a pooled result cannot hide the trade-off. A display of study-result directions can show disagreement across outcomes, but cannot show effect magnitude. Inspect the chart before reading its explanatory prose: does it make the intended comparison visible, or leave the reader to reconstruct it from labels? A chart can contain every cited number and still leave the question unanswered.

## The pattern

A `<slug>-make-charts.mjs` next to the story. Start from [`make-charts-template.mjs`](make-charts-template.mjs) in this folder.

- `import * as Plot from "@observablehq/plot"` and `import { JSDOM } from "jsdom"` — Plot needs a DOM; jsdom supplies one in Node.
- `Plot.plot({ document, ... })`, then serialise with `.outerHTML`; if Plot wrapped the SVG in a `<figure>`, move its scoped `<style>` into the `<svg>` and add `xmlns`.
- Dependencies live in a scoped `package.json` beside the stories (DataPressr: `site/stories/package.json`, pinned `@observablehq/plot` and `jsdom`), never the project root. Commit `package.json` + `package-lock.json`; gitignore `node_modules/`. Run with `npm ci && node <slug>-make-charts.mjs`.
- **Deterministic output.** Re-running must produce byte-identical SVG — check with two builds and `shasum -a 256`. Plot estimates text width in Node, so set explicit margins rather than relying on measured auto-margins. Plot's scoped class name is stable across runs.

## Rules that came out of real stories

- **Round once, from full precision, with the template's `round()`.** `toFixed` rounds 94.55 down to 94.5 (binary storage), and rounding a CSV to 3 decimals then a label to 2 turned 0.7249… into 0.72 while statistics.json said 0.73. Keep derived CSVs at full precision and round only for display, with the same helper in the calculate and chart scripts (us-measles-2026, us-inflation-components).
- **Read values, don't type them.** Annotations take their numbers from the CSV rows at build time (look the row up by key and throw if it's missing), so a label can never disagree with the data.
- **Each series from its own rows.** Two resources on different calendars (e.g. two markets with different holidays) must not be joined into one wide table by date — the join invents null or zero points. Pass each resource to its own `Plot.line`.
- **Respect gaps; never plot missing as zero.** Filter to finite values or let Plot break the line.
- **Show period data as periods.** A weekly average stamped on the Friday ending the week is drawn as a step (`curve: "step-before"`) so each value spans the days it averages; say "week ending" in the label.
- **Direct labels, not legends.** Name each series at its end (the template's `endLabels()`) or in empty space; mark the points the prose cites with `Plot.dot` + `Plot.text`. See the design rules below for keys on phones.
- **Include the reference the argument needs** — a zero line, a threshold rule — and make the y-domain include every annotated value.
- **State units in the subtitle** (currency, per what, nominal or real), not as a y-axis title.
- **Pass constants, not functions, for `dx`, `dy`, `textAnchor` and `fontWeight`** (to vary them, split into two marks): Plot writes a function's source text into the SVG. Then `grep -E 'NaN|Infinity|undefined|=>'` the built SVG; it must find nothing.
- **Where lines converge, labels need their own space, not a small `dy` nudge.** A value label placed a few pixels off its point (the usual pattern) works when the point sits in open space. Where two series converge — e.g. a crossover chart near the year the lines meet — the point itself is crowded, and a small offset still lands the label on the other line. Reserve a few hundred data-units of headroom above the series' max (extend the y-domain, not just the margin) and place labels for that region there, as flat text at a fixed y, rather than offset from the data point; add dots at the actual points if the reader needs to see exactly which point each label describes. Caught in solar-overtakes-wind's chart 2 (two stacked value labels for a converging pair, placed `dy: -14`/`16` from their points, sat directly on the other series' line) — not caught by the desktop/phone screenshot check at the time, because the overlap was easy to miss at a glance; a reviewer zooming in on the convergence region is what found it.

## Check before committing

- Two builds → identical SHA-256.
- Visual check: render the desktop SVG at 720 px and the `-mobile.svg` at 326 px (a 390 px phone less gutters) and look at both. Look for labels colliding with lines or ticks, and clipped tick labels.
- `npm run story-check -- <package-dir>` (DataPressr): the `chart-*` checks below. Every chart ships a `-mobile.svg`; a 720 px chart shown on a phone has ~5 px text.
- `grep` the SVG's text for each number the prose cites.

## Design rules

House defaults from the 2026-11 design audit (Factory `projects/story-remakes/design-audit.md`, benchmarked on FT, Our World in Data, Datawrapper, Pew, Ember, The Economist) and the principle notes in Factory `projects/information-design-corpus/principles/` (cited as KFL = knaflic-few-lupton.md, T = tufte.md, MWT = munzner-ware-tukey.md). Each rule ends with its check question. **[checked]** means `story-check` tests it: a FAIL for charts built with the template's `frame()` (they carry `data-dp-frame`), a warning for older charts. **[warns]** is always a warning, because legitimate charts trip it. Everything else is for the reviewer.

### Every chart

1. **Title states the point; subtitle names measure, unit, place, years; source line at the foot, all inside the SVG** — use `chart()`/`frame()`. A shared or screenshotted chart must still carry what, where, when, unit and source. Write a takeaway title (a sentence with a verb, often the key number) for an explanatory chart; keep it neutral and say so where the finding is uncertain, and don't drop a qualifier to shorten it. The H2 can stay; the HTML caption shrinks to notes or goes. *Check: cropped from the page, does the chart still give claim, what, where, when, unit and source?* [checked: `chart-frame`, which also needs `<title>` for screen readers; the `<img>` alt text is still required] (KFL 7–8; T 18–19)
2. **One spec, two sizes.** Build desktop (720) and mobile (360) from one `chart()` call; they share title, labels and source, and differ only in ticks, margins and line breaks. *Check: does the mobile chart say everything the desktop one does?* (T 23)
3. **Text ≥ 11 px as rendered, ≥ 4.5:1 contrast.** Use the template's `T` sizes (mobile 13–19 px in a 360 px SVG renders at 11.8–17 px). Grey text is `C.muted` or `C.faint`; `#9ca3af` and `C.context` are mark colours only. Text in a series colour uses its darker `*Text` shade. *Check: at 326 px wide, can you read every tick and source line?* [checked: `chart-text-size`, `chart-contrast` (3:1 for large text)] (KFL 25; MWT B8, B15)
4. **Greys plus one accent.** The accent is the story's protagonist, in the same hue in every chart of the story. Add a second accent (`C.accent2`) only for a genuine two-way comparison named in the chart plan. Red is not a generic "highlight"; use it only where it means the same thing throughout the post. Sequential, diverging and genuinely categorical charts are exceptions: name them in the chart plan and keep to about five hues. *Check: with the accent removed, is every mark neutral, and does each colour mean one thing across the whole story?* [warns: `chart-accents` above two hues] (KFL 13, 16–17; T 12, 14; MWT B5–B6)
5. **Colour-blind safe: never rely on red against green** (or orange against green); blue and orange are the default pair. Where two coloured series must be told apart, also label them or vary lightness or dash. *Check: in a deuteranopia render, can you still tell every coded series apart?* [warns: `chart-colour-blind`, which simulates protanopia and deuteranopia] (KFL 15; T 13; MWT B7)
6. **Quiet chrome.** The template's defaults: no tick marks, no axis line, no axis title, grey tick labels, an ink rule at zero, no gridlines. Turn a light grid on (`y: { grid: true }`) only when readers must read values off the axis; otherwise label the values. Dashes are for things that mean something (a threshold, a projection, half). *Check: is every axis, tick and rule lighter than every data mark, and styled the same in every chart?* (KFL 10–11; T 11)
7. **Label marks directly, in reserved space.** End labels (name + latest value) go in the reserved right margin via `endLabels()`. Where lines converge, give each label its own slot with a leader line, not a small nudge. *Check: is every label within a few pixels of its mark, or joined to it by a line?* [checked: `chart-clipping` warns when a label or tick seems to run off the canvas (estimated widths)] (MWT B11; T 16)
8. **Budget explanatory annotations: three is the review trigger** (series labels, values, ticks and caveats don't count). One of them is the key point, at the point, with its value. The chart plan lists them; anything else the prose needs goes in the prose. *Check: where does the eye land first at phone width — on the point, or on a pile of notes?* (KFL 14, 16; MWT B13)

### Phones

9. **No text key on phones.** Keep the desktop's in-plot labels, shortened (`mobileText`). A compact one-line key is fine where it is clearer than labels; a 3–6 line coloured header is not. Never refer to marks by their looks ("black dot", "red = …", "Grey: 2025"). *Check: can a reader decode the phone chart without matching colours to a key?* [warns: `chart-mobile-key`] (KFL 9; MWT B14)
10. **Phone chart ≤ 560 px tall at 360 wide**, plot about 1:1. Ranked bars: about 15 rows on phones (top and bottom N, with "N more in the data" and the full list linked). Disclose any selection. *Check: does the whole chart fit on one phone screen?* [warns: `chart-mobile-height`] (T 23)

### Across the story

11. **Chart 1 proves the post title.** The lead chart shows exactly the comparison the headline makes. *Check: does the first chart a reader sees show the title's claim?* (KFL 5; T 5)
12. **Choose the scale for the comparison.** Bars start at zero. Lines and dots need a defensible domain, not compulsory zero; say in the subtitle when an axis starts at zero and leaves empty space, or doesn't. Use a log scale when values span orders of magnitude or the story is about rates of growth or ratios, and say so in the subtitle ("log scale: each step is ×10"). *Check: for a series spanning over tenfold, was a log view tried, and is the chosen scale stated?* (MWT A4; KFL 20; T 1)
13. **Shared scales for compared charts.** When the prose compares values across charts, give them the same axis ranges, units and order, or make them one chart or small multiples. *Check: could the reader compare these two charts without re-reading the axes?* (MWT B12; T 14–15; KFL 22)
14. **Crop the window to the story's period** where the long history isn't the point, and show enough history to judge the change where it is. *Check: does the window show the change and its context, nothing more?* (T 4)

### Palette (`C` in the template)

Accent `#2563eb` (text `#1d4ed8`), second accent `#ea580c` (text `#c2410c`), context grey `#b6bcc6` (marks only), named grey `#6b7280`, ink `#111827`, muted text `#4b5563`, faint text `#6b7280`, grid `#e5e7eb`. Override with the project's own palette if it has one, and keep it passing the checks.

## When not to use Plot

- A genuinely one-of-a-kind visual that isn't a chart — hand-rolled SVG is fine.
- An interactive or exploratory piece — ship a standalone HTML page with its JS and data alongside.
