---
date: 2026-09-13
title: Story #3 outline drafted; Keeling curve charts ported to Observable Plot
promote: false
---

**Story #3 outline: "WTI Went Negative. Brent Didn't."** [The outline](https://github.com/datasets/datapressr/blob/main/site/stories/oil-prices-outline.md) argues from a single finding surfaced by the oil-prices enrich rep: of 25,415 observations across all eight Brent/WTI series, exactly one is negative — WTI's -$36.98 on 2020-04-20 — while Brent, priced the same day, held at $17.36. The wrinkle is structural, not accidental: WTI settles at landlocked Cushing, Oklahoma, Brent on seaborne cargoes that can be redirected when storage tightens. Every number in the outline is checked directly against the underlying CSVs. Awaiting outline review ([#10](https://github.com/datasets/datapressr/issues/10)'s sign-off step) before any prose is written.

**Keeling curve charts moved to Observable Plot**, replacing the original hand-rolled SVG generator and bringing story #1 in line with the [charting decision](../docs/charting.md) story #2 already uses. The 350 ppm and 400 ppm reference lines are now computed from the plotted annual series itself rather than hardcoded, and labelled as annual-mean crossings (1988, 2015) — the well-known 1986 and 2013 dates mark the first single *month* above each threshold, a materially different fact from the annual mean this chart shows. The monthly/seasonal chart now marks the year's actual high and low (May and September) directly on the line.
