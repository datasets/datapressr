---
date: 2026-09-18
title: "Story #3 published; story and enrich skills now active"
promote: true
---

**Data story #3: [WTI Went Negative. Brent Didn't.](https://github.com/datasets/datapressr/blob/main/site/stories/oil-prices.md)** On 20 April 2020 the WTI spot price was -$36.98 a barrel, the only negative value in 25,415 Brent and WTI prices going back to 1986; Brent that day was $17.36. It is the first story written with the `story` skill as designed: outline, then an independent review, then charts, then prose. The review changed the argument. The first outline explained *why* WTI went negative, which a price-only dataset cannot show, and left out Brent falling to $9.12 the next day, two cents above its all-time low. The published story shows what the data shows and attributes the explanation to EIA and the CFTC. This corrects the 13 September outline entry, which presented the storage explanation as the finding. The author's voice pass is still to come.

![Brent and WTI daily spot prices, March to May 2020: WTI drops to -$36.98 on 20 April while Brent is at $17.36](https://raw.githubusercontent.com/datasets/datapressr/main/site/stories/oil-prices-brent-wti.svg)

**The `story` and `enrich` skills are active.** Both were drafted from hand-made examples and have now been through real runs: `enrich` on two datasets, `story` on three stories. Every open question in the drafts has a written policy based on those runs. Each skill now carries its guidance and a working starter script in its own folder, so `npx skills add datasets/datapressr` installs something usable outside this repository. That was checked with a clean install. Charts in stories use Observable Plot; charts on dataset pages use declarative views.
