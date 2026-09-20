---
date: 2026-09-18
title: "Two new datasets from the structure benchmark: population growth (World Bank API) and airports (OurAirports)"
promote: false
---

The `structure` skill has now been tested on the two source shapes it hadn't seen: a paginated JSON API and a join across several linked tables. Each run produced a new dataset.

- **[Population growth by country, 1960–2025](https://github.com/datasets/datapressr/tree/main/datasets/demographics/population-growth)**: the World Bank's annual population growth rate for 217 economies and 48 regional and income-group aggregates, flagged so they aren't summed with countries. A useful catch: the World Bank's country-code field is blank for its five income groups, so the obvious key didn't work.
- **[Airports with runway summaries](https://github.com/datasets/datapressr/tree/main/datasets/transport/airports)**: all 86,094 OurAirports sites, each joined to its country and region and to a count and longest length of its runways. Every link between the tables is checked. `NA` here means North America or Namibia, not missing, so tools that read `NA` as blank will drop real values.

Both met every hard bar on the first build. The [benchmark write-up](../docs/structure-benchmark.md) lists three gaps in the skill. The JSON/API guidance has already been added to the skill; the other two are queued.
