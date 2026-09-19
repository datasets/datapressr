---
date: 2026-09-19
title: "What weather kills, from a source with no index"
promote: true
---

**A new dataset: [U.S. weather-related fatalities, injuries and damage by hazard type](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/us-natural-hazard-statistics).** 29 years, 1997 to 2025, from the National Weather Service's annual hazard summaries. Over the range the source counts 18,867 weather-related deaths: heat is the largest single cause at 5,366, ahead of tornadoes at 2,167 and flash floods at 2,015. The deadliest and costliest year is the same one, 2005.

Two things are worth knowing before anyone quotes it. Damage is in dollars of the year reported and is never inflation-adjusted. And a hurricane row counts **wind only** — the same storm's storm surge, rainfall flooding and tornadoes are filed under Flood and Tornado — so no row in the dataset is the full cost of a named storm. Neither fact is visible in the table; both are now in the dataset's own metadata.

This was the second run of the [source-discovery playbook](https://github.com/datasets/datapressr/blob/main/docs/source-discovery-playbook.md), and it was chosen to test the case the first one could not: a source with **no machine-readable index at all**. No API, no feed, no sitemap, no bulk download. The only listing of these 31 documents anywhere is a Dreamweaver-era drop-down menu on one page — and it offers a 1995 summary that the server does not have. That is the finding the run existed to produce: when the listing is typed by hand rather than generated from holdings, it can be wrong, so a 404 is data about the source rather than a failed fetch. All 31 candidates are published in a coverage table, the missing year and the 1996 scan-with-no-text-layer included.

Four other sources were probed and rejected first, and one rejection is worth recording. The Federal Reserve's economic projections were the best-shaped candidate found — no index, served reliably back to 2012 — and were dropped because no reuse statement for the Board's own material could be found anywhere on the site. A public-domain argument was available and was not taken; "arguable" is not "stated". The NWS says it in its own words, and that page is archived alongside the data.

The [walkthrough](https://github.com/datasets/datapressr/blob/main/docs/examples/nws-hazard-source-discovery.md) records the route, including two bugs that reached the CSV and that no assertion caught: an event published for six years as `River Flood}}`, because a brace drawn beside the label was being read as part of it, and a coverage column that described every one of the 29 documents with the wrong layout. Both had correct numbers and wrong names — which is exactly what went wrong in the first run too. The playbook now says so plainly: arithmetic checks the figures, and nothing checks the labels except printing them and reading them.

On the question the playbook exists to settle — whether discovery should become a skill — the answer is still no, and now for a specific reason. The playbook asked for two more runs, one without an index and one where the licence does not resolve cleanly. The first is done. The second is not, and this run made its absence sharper by meeting a licence-ambiguous source and walking away from it rather than through it.
