---
date: 2026-09-05
title: A structure benchmark, more wrangling samples, and story #2 begun
promote: false
---

A session aimed at getting the skills better by benchmarking them and adding
samples, not just adding features.

**`structure` benchmark.** [`docs/structure-benchmark.md`](https://github.com/datasets/datapressr/blob/main/docs/structure-benchmark.md)
scores the wrangling skill across three real runs — the NOAA text file (comment
lines, sentinels), the Project Drawdown markdown table, and a new one: eight
legacy `.xls` workbooks of EIA oil prices. The oil-prices build is a
ground-truth test — its output is content-identical to the long-running
community [`datasets/oil-prices`](https://github.com/datasets/oil-prices) (the
only difference is LF vs CRLF line endings). The benchmark turned up a real bug
class the skill doesn't warn about — Excel serial dates are timezone-naive, and
parsing them via JavaScript `Date` shifts every date by a day — plus four other
prioritised skill edits, all filed as tracked issues. The edits aren't applied
yet; the point of this pass was to gather the evidence first.

**New datasets.** [`oil-prices`](https://github.com/datasets/datapressr/tree/main/datasets/energy-and-commodities/oil-prices)
(Brent + WTI spot prices, four frequencies, from EIA). And
[`co2-ppm`](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/co2-ppm)
gained the global CO₂ series, NOAA's published growth rates, and a decadal-mean
table.

**Project Drawdown moved to its own repo** —
<https://github.com/datasets/project-drawdown>.

**Story craft, written down.** [`docs/story-craft.md`](https://github.com/datasets/datapressr/blob/main/docs/story-craft.md)
(what makes a good data story) and [`docs/voice-guide.md`](https://github.com/datasets/datapressr/blob/main/docs/voice-guide.md)
(the house voice — let the numbers carry it), drafted from the best practitioners
and story #1.

**Data story #2 begun.** Planetary Boundaries — source snapshot archived and the
[outline + chart plan](https://github.com/datasets/datapressr/blob/main/site/stories/planetary-boundaries-outline.md)
committed, the #10 way (argument signed off before prose). Prose still to come.
