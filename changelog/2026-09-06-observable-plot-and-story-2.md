---
date: 2026-09-06
title: Charting settled on Observable Plot; story #2 drafted; NEXT.md trimmed
promote: false
---

A session that closed three loose ends: the charting-tool question, the story #2
draft, and a `NEXT.md` that had grown into a second backlog.

**Charting: Observable Plot.** The near-term half of
[#11](https://github.com/datasets/datapressr/issues/11) is decided. The
[line-charts bake-off](https://github.com/datasets/line-charts) rates Plot the
best chart-per-line-of-code for a data story, and both hand-written stories'
friction notes pointed the same way — story #2's normalised ranged-bar
scoreboard was about the ceiling of what hand-rolled inline SVG is comfortable
for. [`docs/charting.md`](https://github.com/datasets/datapressr/blob/main/docs/charting.md)
records the decision and the pattern: Plot authored in a `*-make-charts.mjs`,
rendered to static SVG in Node (jsdom for the DOM), committed and embedded as a
Markdown image — no JavaScript on the published page, same deployment as before.
Build-only dependencies live in a scoped `site/stories/package.json`, the same
convention as a dataset's `build.ts` deps.
[`planetary-boundaries-make-charts.mjs`](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries-make-charts.mjs)
is the reference — ~45 lines for the scoreboard against ~120 hand-rolled, with
byte-identical output across runs. The side-by-side that settled it is shipped at
[`site/charting-spike.html`](https://github.com/datasets/datapressr/blob/main/site/charting-spike.html).
The longer half of #11 — a DataHub/Flowershow-native `views` standard — stays
deferred. The Keeling Curve charts (story #1) stay hand-rolled until touched
([#12](https://github.com/datasets/datapressr/issues/12)).

**Data story #2 drafted.** Planetary Boundaries: the
[outline + chart plan](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries-outline.md)
were committed on 2026-09-05; this session added the two charts and the
[prose](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries.md),
each its own commit, the [#10](https://github.com/datasets/datapressr/issues/10)
way. The scoreboard needed a modelling call the outline's chart plan didn't
survive: `current ÷ boundary` is undefined for novel entities (boundary = 0) and
wrong-signed for the "less is worse" indicators, so it uses the framework's own
normalisation instead — `(current − pre-industrial) / (boundary −
pre-industrial)`, boundary = 1×. Six of nine boundaries crossed; the counter-note
is stratospheric ozone, dipping toward the boundary through the twentieth century
and recovering after the Montreal Protocol. Left: the author's "sounds like me"
voice pass. [#4](https://github.com/datasets/datapressr/issues/4).

**`NEXT.md` trimmed; roadmap moved to an epic.** The "Roadmap to v1" arc and a
growing "Already done" log had turned `NEXT.md` into a second backlog plus a
duplicate changelog. The five-step arc is now
[epic #14](https://github.com/datasets/datapressr/issues/14); `NEXT.md` is back
to a short pointer. `site/README.md`'s status and roadmap sections, stale since
before the benchmark, were refreshed to match.
