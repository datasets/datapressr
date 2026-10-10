# Data notes — "Why did the Allies win the Second World War?"

What was searched, found, chosen and rejected for this story. Retrieval date for everything: 2026-10-10. Per-file URLs, licences and hashes are in [PROVENANCE.md](PROVENANCE.md).

## What I looked for

The five kinds of evidence in the brief: war production by country and year; manpower; GDP by country and year; oil and raw materials; casualties by country.

## Where I looked, and what I found

| Searched | Found | Decision |
|---|---|---|
| Mark Harrison's Warwick pages (web search: "The economics of World War II: an overview" pdf) | Data page for Harrison (ed.) 1998, with the chapter 1 tables as an Excel 97 file "including underlying data and calculations, with a correction" to table 1-3, and all book tables as a Word file | **Used** the Excel file: GDP 1938–45 (table 1-3), armed forces 1939–45 (table 1-5), weapons output in units 1939–45 (table 1-6). It is the standard comparative source the brief names, and the spreadsheet is the author's corrected version (the printed table 1-3 has a spreadsheet error in the Soviet figures). The Word file was downloaded and then dropped: everything the story uses is in the Excel file. |
| Harrison 1988, "Resource mobilization for World War II" (web search) | Author's postprint PDF on warwick.ac.uk | **Used** table 1 (Goldsmith's 1946 estimate of combat munitions output by value, US 1944 prices, 1935–44), transcribed by hand. It is the only series I found that puts all weapons in one unit for both coalitions, year by year. Also used for attributed context (eastern-front share, Lend-Lease). |
| Maddison Project Database 2023 (rug.nl release page) | Excel file at `dataverse.nl/api/access/datafile/421302` | **Unreachable**: dataverse.nl redirects the download to `objectstore.surf.nl`, which the sandbox blocks. Not worked around. |
| Our World in Data grapher, "GDP — Maddison Project Database" | CSV of MPD 2023 GDP (GDP per head × population, 2011 international $) | **Used** as a second GDP estimate to cross-check Harrison. It has no Soviet figures for 1941–45, so the cross-check uses a fixed set (US + UK vs Germany + Italy + Japan), 1938–43. |
| Wikipedia, "World War II casualties" (revision 1376835265) | Table "Total deaths by country", with a low–high range and a cited source for most cells | **Used** for deaths, because it shows the disagreement between named sources (Krivosheev vs Hartmann for Soviet military deaths; Zemskov vs Andreev et al. for Soviet total deaths; the Statistisches Jahrbuch vs Overmans for Germany). The ranges are Wikipedia editors' compilation, not a single study; some cells (Germany's total, Italy's high, UK and US totals) cite no single source, and that is recorded in the CSV. |
| Wikipedia, "Military production during World War II" (revision 1365704058) | Totals for all aircraft, tanks, ships; a resources table (coal, iron ore, crude oil, steel, 1939–45); and a copy of Goldsmith's munitions table | **Rejected.** The oil and raw-materials table is largely marked "citation needed" (US, Japan, Italy, Hungary, Romania rows); I did not want an unsourced number carrying a chart. The Goldsmith table on the page omits Canada; I took the table from Harrison 1988 directly instead. Snapshot downloaded, then dropped from `raw/` as unused. |
| Oil, separately | Not searched beyond the Wikipedia table above | **Not used.** The story leaves oil out rather than chart an unsourced number; a sourced country-by-year oil series (e.g. from the official histories) is the obvious next addition. |
| Broadberry & Harrison (eds.), *Economics of the Second World War: Seventy-Five Years On* (CEPR e-book, 2020) | Found by search on cepr.org | **Not used**: cepr.org is not on the sandbox's download list, and the brief forbids copying numbers from a page summary. It is the natural next source for revised estimates. |

## What I chose, and why

- **Munitions (headline):** Goldsmith 1946 via Harrison 1988. One unit across all weapons, both coalitions, every year 1940–44. Caveats kept in the story: Italy is missing; Soviet and German figures are Goldsmith's 1946 estimates, which Harrison flags as uncertain for the USSR; the Allied line includes the US and USSR before they entered the war.
- **GDP:** Harrison 1998 table 1-3 (1990 international dollars, Maddison 1995 base), cross-checked against MPD 2023 (2011 international dollars) on a fixed country set. The two disagree by 0.1 or less in the US+UK : Germany+Italy+Japan ratio for 1938–43; the levels differ because the price bases differ, so only ratios are compared.
- **Units (tanks, aircraft) and armed forces:** Harrison 1998 tables 1-5 and 1-6. Used only for the Soviet–German comparison in 1942, where value (Goldsmith) and units (Harrison, from the Soviet official history IVMV) give different answers. That disagreement is on the chart.
- **Deaths:** Wikipedia's ranges, ten countries, military and total.

## Licence and vintage of each source used

| Source | Licence | Vintage |
|---|---|---|
| Harrison 1998, chapter 1 tables (Excel) | No licence stated; author-posted research data; book © CUP | 1998 book, corrected spreadsheet |
| Harrison 1988, postprint (table 1 from Goldsmith 1946) | © Economic History Society; author postprint; one table transcribed | 1988 article; Goldsmith's 1946 estimates |
| Maddison Project Database 2023 via OWID | CC BY 4.0 | MPD 2023; OWID update 2024-04-26 |
| Wikipedia "World War II casualties" | CC BY-SA 4.0 | revision 1376835265, 2026-09-26 |

## What this data does not test

Strategy, command, intelligence (Ultra, Magic), technology and its quality, morale, the timing of decisions, and luck. Production and GDP measure capacity, not how it was used; deaths measure cost, not contribution.
