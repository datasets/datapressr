---
date: 2026-09-06
title: Observable Plot for charts; story #2 drafted; structure benchmark applied; story + enrich skills drafted
promote: false
---

A session that got the drafting work for v1 done: settled the charting tool,
finished the story #2 draft, applied the `structure` benchmark's findings, ran a
first `enrich` rep, and wrote first drafts of both the `story` and `enrich`
skills. Also trimmed a `NEXT.md` that had grown into a second backlog.

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

**`structure` benchmark findings applied.** All eight edits from
[`docs/structure-benchmark.md`](https://github.com/datasets/datapressr/blob/main/docs/structure-benchmark.md)
(benchmark v1, 2026-09-05) landed. In
[`scripts/wrangling-idioms.mjs`](https://github.com/datasets/datapressr/blob/main/scripts/wrangling-idioms.mjs)
(tests 24 → 28): `excelSerialToIsoDate()` — an offset-free Excel-serial → ISO
date converter, because reading a spreadsheet date through a JS `Date` shifts it
a day in positive-UTC zones and silently turned `1987-05-20` into `1987-05-19` in
the oil-prices build; `num(raw, sentinels)` — a strict numeric parser with a
per-column "no data" sentinel list; and `toCsv()` upgraded to real RFC 4180
quoting. In `skills/structure/SKILL.md`: `exceljs` vs SheetJS `xlsx` for legacy
`.xls`, the timezone-naive-date rule, naming conventions vs a published dataset,
LF line endings with no Frictionless `dialect` block, and a "build needs a
dependency ⇒ its own `package.json`" section. `AGENTS.md` picked up the
`exceljs`/SheetJS split and the dependency rule.

**`story` skill — first draft.**
[`skills/story/SKILL.md`](https://github.com/datasets/datapressr/blob/main/skills/story/SKILL.md),
from the two hand-made stories plus the craft docs
([`story-craft.md`](https://github.com/datasets/datapressr/blob/main/docs/story-craft.md),
[`voice-guide.md`](https://github.com/datasets/datapressr/blob/main/docs/voice-guide.md),
[`charting.md`](https://github.com/datasets/datapressr/blob/main/docs/charting.md)).
It is the *workflow* — three committed, independently reviewable artefacts
(outline + chart plan → charts → prose), the outline template lifted from the two
stories, a definition of done, and the "sounds like me" voice pass kept as a
separate human stage — and it references the craft docs rather than restating
them. Deliberately not symlinked into `.claude/skills/`: it is there for review,
not activation, until it has been run on a real story
([#10](https://github.com/datasets/datapressr/issues/10)).

**`enrich` skill — first draft, after one hand rep.** The rep:
[`enrich.ts`](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/co2-ppm/enrich.ts)
+ [`SUMMARY.md`](https://github.com/datasets/datapressr/blob/main/datasets/climate-and-environment/co2-ppm/SUMMARY.md)
for `co2-ppm` — a reproducible zero-dependency stats script (per-resource `n` /
`missing` / `min` / `max` / `mean` / `median` / std dev, skipping time-encoding
identifier columns) that rewrites only a fenced block in `SUMMARY.md`, plus a
hand-written "What stands out" (the Mauna Loa uncertainty columns are constant
and carry no information; the growth rate is never negative; the rise is
accelerating; two decadal rows are partial) and "See also". `status` bumped
`structured` → `enriched`. The skill
([`skills/enrich/SKILL.md`](https://github.com/datasets/datapressr/blob/main/skills/enrich/SKILL.md))
generalises that: `enrich.ts` + fenced `SUMMARY.md` + one to three declarative
`views` for first charts (not Observable Plot SVGs — those stay a story's job) +
the status bump. Also DRAFT, also unsymlinked, pending a second rep (oil-prices,
to settle how parallel same-schema resources are summarised).

**`NEXT.md` trimmed; roadmap moved to an epic.** The "Roadmap to v1" arc and a
growing "Already done" log had turned `NEXT.md` into a second backlog plus a
duplicate changelog. The five-step arc is now
[epic #14](https://github.com/datasets/datapressr/issues/14); `NEXT.md` is back
to a short pointer. `site/README.md`'s status and roadmap sections, stale since
before the benchmark, were refreshed to match.
