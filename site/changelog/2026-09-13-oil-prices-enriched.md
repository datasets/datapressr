---
date: 2026-09-13
title: oil-prices enriched — second enrich rep settles the parallel-resources question
promote: false
---

[`oil-prices`](https://github.com/datasets/datapressr/blob/main/datasets/energy-and-commodities/oil-prices) moved `structured` → `enriched`, the second hand rep of the draft `enrich` skill (co2-ppm was the first). Its eight Brent/WTI series all share one measurement (`Price`), so this rep consolidates them into a single stats table keyed by resource + measurement instead of eight near-identical ones — resolving the "parallel resources" open question the skill draft left for exactly this case. The stats confirm the 2020-04-20 negative WTI spot price (-$36.98) survives the pipeline intact and washes out once averaged into the weekly/monthly/annual series, and that Brent and WTI both peaked on the same day, 2008-07-03. Along the way a stale view titled "Brent vs WTI" that only plotted one resource got split into two honest single-series views. [`enrich.ts`](https://github.com/datasets/datapressr/blob/main/datasets/energy-and-commodities/oil-prices/enrich.ts) ships with 19 tests covering empty/missing/zero/negative/constant inputs and byte-for-byte preservation of hand-written commentary across reruns.
