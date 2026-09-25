---
title: "Backlog triage for a throughput pipeline"
date: 2026-09-25
---

# Backlog triage for a throughput pipeline

Research only; nothing in the repo was changed. Sources checked on **2026-09-25** with plain HTTP probes (status code, a grep of the page for licence wording, and the head of the file where there was one). "Verified" means one of those probes returned it. "Unverified" means it's from memory or from the issue text and needs a check before `archive`.

## Inputs read

| Input | What it held | Useful yield |
|---|---|---|
| `datasets/BACKLOG.md` | Superseded list, 23 items, 22 already published into catalog repos (`climate-and-environment`, `economic-history`, `society-and-living-standards`, `energy-and-commodities`, `technology`, `ai`) | Only Project Drawdown was open, and it has since shipped (`datasets/project-drawdown`). **Nothing left to triage here.** |
| `datasets/commons-issues/` | 324 cached issues: 79 closed, about 245 open. Roughly 60 open ones are meta, tooling or reference code lists | About 25 are real, story-bearing data finds that aren't published yet. They're the main source for this shortlist. |
| Issue #2 plus `docs/inbox-triage.md` | 7 legacy finds, already triaged on 2026-09-18 | One to build (causes-of-death comparison, #5). The rest are drops or need the owner. One new fact below: FiveThirtyEight is already mirrored. |
| Bead `datapressr-s6e` | NWS state-level and per-hazard summaries | Confirmed feasible. The hub menu lists 31 `state<yy>.pdf` (1995 to 2025) plus 31 each of cold/flood/heat/lightning/tornado/wind, 30 hurricane and 30 winter. `state24.pdf` returns 200 at 13 KB. |
| Bead `datapressr-jn8` | Source-discovery rep 3 (a source whose licence is ambiguous) | Fed SEP confirmed as the candidate; reasons below. |

What's published already: 168 repos under `github.com/datasets`, plus the six in-repo datasets (co2-ppm, oil-prices, us-natural-hazard-statistics, tesla-quarterly-deliveries, airports, population-growth). None of the shortlisted candidates exists as a repo or catalog subfolder. Checked against the full repo list and the directory listings of all six catalog repos.

## Ranked shortlist (15)

Score is out of 5 on each axis: **L** = licence cleanliness, **R** = primary source reachable in a clean format, **S** = story strength, plus a flag for a living source. Effort: S is one session with plain Node and one file. M means PDF or HTML extraction, several files, or a reshape. L means many sources, a large file, or reconciling definitions.

| # | Candidate | Origin | Primary source and format | Licence | Living? | Story (one argument) | Effort | L/R/S |
|---|---|---|---|---|---|---|---|---|
| 1 | **Arctic sea ice extent** (NSIDC Sea Ice Index G02135 v4) | commons#138 | `noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_MM_extent_v4.0.csv`, plain CSV, one per month, 1978 to 2025. **Verified 200**; Sept 2025 = 4.75 M km² | NOAA@NSIDC. Page says "as a condition of using these data, you must cite" (DOI 10.7265/a98x-0f50). NOAA-funded, so public domain plus a citation condition; record it the way co2-ppm does | **Daily and monthly** | The September minimum is about 40% below 1979 levels, and no year since 2007 has recovered to the pre-2000 range | S | 5/5/5 |
| 2 | **Fed Summary of Economic Projections** (FOMC SEP) | jn8 / 2w5 | `federalreserve.gov/monetarypolicy/fomcprojtabl<yyyymmdd>.htm`, HTML tables (Table 1 medians, central tendency, ranges; dot-plot figure data). 2012 onwards, four times a year. **Verified 200** for 2025-09-17. No sitemap, robots.txt, API or bulk download | **Ambiguous.** No reuse statement; four likely terms URLs return 404 (run 2 evidence). Owner ruling of 2026-09-20 allows assuming public domain for the Board's own tables | **Quarterly** | The Fed's own projections kept missing: in 2021 the median inflation forecast said "transitory" at every meeting until it didn't | M | 2/4/5 |
| 3 | **NWS state-level hazard statistics** | s6e | `weather.gov/media/hazstat/state<yy>.pdf`, 31 PDFs from 1995 to 2025, same hub and same `pdfjs-dist` pipeline as the national set | NWS public-domain statement already archived (`archive/disclaimer.html`) | Annual | Where weather kills: per-capita fatality rates by state, and heat concentrated in a few states | S–M (reuses fetch.ts/build.ts; per-year layout calibration is the risk) | 5/4/4 |
| 4 | **UCDP battle-related deaths** | commons#241; also strand 1 of inbox #5 | `ucdp.uu.se/downloads/brd/ucdp-brd-dyadic-261-csv.zip`, CSV, dyad-year 1989 to 2023 (v26.1). **Verified link.** | **CC BY 4.0**, stated on the downloads page | Annual (versioned releases) | Battle deaths fell for 20 years after the Cold War, then hit post-1989 highs in 2021–22 (Ethiopia, Ukraine) | S | 5/5/4 |
| 5 | **IEA Global EV Outlook: EV sales and share** | commons#273 (car sales) | IEA GEVO 2025 data product / EV Data Explorer, CSV/xlsx. Product page **verified 200**; direct file URL not found by probe, and an IEA free login may be needed (unverified) | **CC BY 4.0**, stated on the product page | Annual | Pairs with tesla-quarterly-deliveries: global EV sales kept rising in 2024–25 while Tesla's fell two years running (1.81M, then 1.79M, then 1.64M) | S–M | 5/3/5 |
| 6 | **Big Mac Index** | commons#122 | `github.com/TheEconomist/big-mac-data`, `output-data/big-mac-full-index.csv`, 2000 to July 2026. **Verified** | Repo licence **MIT** (a code licence applied to data, so worth a README note, but it is stated) | Twice a year | Burgernomics: which currencies are "overvalued", and the index's track record | S | 4/5/4 |
| 7 | **Penn World Table 11.0** | commons#99 | `rug.nl/ggdc/productivity/pwt/`, xlsx/dta, about 180 countries from 1950 to 2023 | **CC BY 4.0**, stated | Every few years | Convergence: which poor countries caught up and which didn't (real GDP per capita, PPP) | M (wide sheet, chooses a subset of variables) | 5/5/4 |
| 8 | **US Electoral College results 1788–2024** | commons#328; run-2 reject | archives.gov per-election HTML pages; `sitemap.xml` lists all 61. Crawl-delay 10. **Verified 200** | US federal, public domain | Every 4 years | Electoral-vote margins against popular-vote margins: how often the two diverge. Popular vote needs FEC reports, from 1976 onwards | M (61 HTML pages) | 5/4/4 |
| 9 | **HURDAT2 Atlantic hurricane best tracks** | commons#144 | `nhc.noaa.gov/data/hurdat/hurdat2-1851-2024-040425.txt`, fixed-width text. **Verified 200** | NOAA, public domain | Annual | Continental US landfalls and major hurricanes by decade since 1851. A natural sequel to the hazard dataset, which counts hurricane wind deaths only | M (custom parser, header/row record structure) | 5/5/4 |
| 10 | **Famine deaths** (World Peace Foundation via OWID) | inbox #5 strand | OWID famines page and grapher CSV, WPF Historic Famines dataset | OWID CC BY; WPF terms not checked (unverified) | Irregular | Famine deaths per decade since 1870 have collapsed | S | 4/4/5 |
| 11 | **American Time Use Survey summary** | commons#188 | BLS API `api.bls.gov/publicAPI/v2/timeseries/data/TUU…` returns JSON (**verified**); the bls.gov HTML tables return 403 to curl | BLS, public domain | Annual | How Americans' time changed 2003–2025: screen/leisure up, socialising down | M (choosing the series is the work) | 5/4/4 |
| 12 | **EDGAR GHG emissions by country** | commons#336 | `edgar.jrc.ec.europa.eu/dataset_ghg2025`, xlsx | **CC BY 4.0** for EDGAR GHG, **but** the IEA-EDGAR CO₂ series is CC BY-NC-ND. Use GHG only | Annual | Total GHG (not just fossil CO₂) by country. Methane and agriculture change the ranking | M | 3/5/4 |
| 13 | **NCD-RisC adult height by country** | commons#301 | ncdrisc.org, CSV downloads, 1896–1996 birth cohorts | **No licence found** (probe of downloads page found no terms). Unresolved | Irregular | Dutch men gained about 20 cm in a century, while some countries got shorter | S | 2/4/5 |
| 14 | **US road deaths (NHTSA FARS summary)** | commons#192, #302 | NHTSA FARS; nhtsa.gov returned 403 to curl, so reach via FARS API/CrashStats (unverified) | US federal, public domain | Annual | US road deaths rose after 2019 while peer countries' kept falling | M | 5/3/5 |
| 15 | **US aviation accidents (NTSB)** | commons#87 | NTSB CAROL / avall.mdb (Access database) (unverified) | US federal, public domain | Monthly | Commercial flying got about 100 times safer per departure | L (Access format, deciding what counts as commercial) | 5/2/5 |

## Suggested first batch of 5

Picked to cover different formats (CSV, HTML, PDF, zipped CSV, xlsx or login) and topics (climate, macro, hazards, conflict, transport), with one living source that updates at least monthly and one source with an ambiguous licence.

| Order | Candidate | Format exercised | Role in the batch | Why this one |
|---|---|---|---|---|
| 1 | **Arctic sea ice extent** | Clean CSV, many files | **Living source, updates monthly or faster**; first new entry for the `monitored` workstream | Quickest win in the list: public domain plus a citation condition, verified live file, a strong single-chart story, and it sits beside co2-ppm in climate-and-environment |
| 2 | **Fed SEP** | Scraped HTML tables, no index | **Source-discovery rep 3** (jn8), quarterly living source | **Confirmed as the rep 3 candidate.** Still reachable, still no reuse statement, the best story in the list. One extra point makes it a true licence case rather than a formality: the SEP pools projections from 12 **Reserve Bank presidents**, and the Reserve Banks are not federal agencies. So the "the Board's own tables" assumption from the 2026-09-20 ruling has to be argued, not just assumed. Useful evidence to record: FRED republishes the SEP medians (e.g. FEDTARMD) with a Board of Governors source line and, as far as recalled, no copyright notice (unverified). Fallback if it dead-ends: NCD-RisC height (#13), an academic source with no stated licence at all. |
| 3 | **NWS state-level hazard stats** (s6e) | PDF extraction | Second pass through a pipeline we already have; tests how reusable `fetch.ts`/`build.ts` are | Cheapest new dataset per unit of effort. It also moves the existing hazards story from national to local |
| 4 | **UCDP battle-related deaths** | Zipped CSV | First conflict dataset, first strand of the inbox #5 causes-of-death comparison | Clean CC BY 4.0, a verified download link, and a clear argument |
| 5 | **IEA Global EV Outlook** | xlsx/CSV behind a data-product page (login possible) | First cross-dataset story, combined with Tesla | Gives tesla-quarterly-deliveries a context series and a story ("the market grew, Tesla didn't"). If the IEA login blocks an agent, swap in Big Mac (#6) |

## Enrich or story work on existing datasets

| Dataset | Current status | Proposed work | The argument | Effort |
|---|---|---|---|---|
| us-natural-hazard-statistics | structured | `enrich` then `story` (also closes beads x5a, 3j8) | Heat is the quiet killer: 5,366 deaths from 1997 to 2025 (**verified from the CSV**), more than tornadoes (2,167) and flash floods (2,015) combined, with hardly any property damage, which is why it gets overlooked | S |
| tesla-quarterly-deliveries | structured | `enrich` (bead 86o) plus a short story, stronger once paired with IEA EV data | Tesla's first two down years: deliveries peaked at 1,808,581 in 2023, then fell to 1,789,226 in 2024 and 1,636,129 in 2025 (**verified from the CSV**) | S |
| population-growth | structured | `enrich` plus `story` | World population growth has halved since the 1960s (2.08% in 1970, 0.91% in 2025, **verified**), and a growing number of countries are now below zero | S |
| co2-ppm and oil-prices | enriched, with stories | Move to **`monitored`**: scheduled refresh plus a manifest-hash diff (bead 02p) | They're the obvious first living sources (NOAA monthly, EIA daily), so the monitoring machinery can be proven on data we already hold | M (tooling, not data) |
| airports | structured | `enrich` only; story is weak | Runway and airport counts by country (the US has an outsized share). Worth an enrich pass, not a story | S |

## Drop list

| Item | Origin | Reason |
|---|---|---|
| Kenneth French Data Library | commons#278 | The page states reproduction is "illegal, except by permission of Ken French or Dimensional". That's an explicit restriction, not an ambiguity |
| Freddie Mac mortgage rates (PMMS) | commons#286, #295 | Freddie Mac terms: "You may not redistribute Data, publish Data … without a separate written agreement" |
| FRED as a source | commons#226 | Aggregator; third-party series carry their own copyright. Go to the primary source for each series |
| Human Rights Measurement Initiative | inbox | CC BY-NC 4.0. Blocked until the owner rules on NC data (inbox-triage decision 1) |
| FiveThirtyEight | inbox | **Already mirrored** at `datasets/five-thirty-eight-datasets` and `datasets/archive-fivethirtyeight`, and frozen since 2023. Close the inbox line with a pointer |
| "Wiser metrics" | inbox | No referent. Owner context or drop |
| Fischer, *The Great Wave* | inbox | Book appendix, no dataset. Covered by millennium-macroeconomic-data-uk; keep as a story idea |
| 40,000 TV commercials | inbox | Single 2006 factoid, not a series |
| Fashion "3rd most polluting" | inbox | No primary source for the ranking |
| IHME Global Burden of Disease | commons#162 | IHME terms are non-commercial; OWID derivatives inherit them |
| World Values Survey, ESS, Pew, Roper, Putnam, K-12 school shooting DB | commons#205, #206, #259, #327, #213, #267, #371 | Registration, closed access or microdata surveys. Wrong shape for this pipeline |
| World Religion Database, Pharmaprojects, Crunchbase, Timatic, Conference Board LEI | commons#262, #214, #8, #209, #60 | Proprietary |
| GDELT, BigQuery, OpenAddresses, GeoArrow buildings, GSOD, HM Land Registry price-paid | commons#246, #245, #97, #414, #198, #271 | Too large for the in-memory, small-data workflow |
| Data breaches | commons#274 | The Privacy Rights Clearinghouse DB is now paid; Information is Beautiful is CC BY-NC |
| Charles Booth poverty map | commons#266 | Archival map images, not tabular; NC terms |
| Global Religious Futures | commons#261 | Covered by `datasets/world-religion-projections` |
| Novel coronavirus | commons#312 | Covered by `datasets/covid-19`; frozen |
| Historical US house prices (Shiller) | commons#61 | Covered by `datasets/house-prices-us` |
| Arctic sea ice **volume** (PIOMAS) | commons#138 | Use NSIDC extent (shortlist #1) instead. PIOMAS terms are unclear and it's a model product |
| Top 1M websites (Majestic) | commons#320 | Open (CC BY 3.0) and living, but no story |
| Reference code lists (IBAN, Unicode, ICD, LEI, IMO vessels, SCAC, NGA codes, CLDR…) | commons#10, #13, #2, #37, #109, #233, #212, #235 | May be worth it as reference data, but no story. Belongs to a separate reference workstream, not the story pipeline |
| Meta and tooling issues | commons#44, #75, #113, #114, #117, #217, #218, #229, #230, #232, #374, #376, #378, #379, #417 | Not datasets |

## Held back (plausible, not shortlisted)

| Item | Origin | Why not now |
|---|---|---|
| Opportunity Insights | commons#324 | Large, micro-leaning files; "free with citation" terms not checked |
| Water scarcity (WRI Aqueduct) | commons#255 | CC BY 4.0 but geodata-heavy; better after a GeoJSON view path exists |
| Obesity (NCD-RisC BMI) | commons#191 | Same source as height (#13). Do it after that licence is resolved |
| UNFCCC GHG inventories | commons#135 | Messy API. EDGAR (#12) answers most of the same questions |
| Inside Airbnb | commons#279 | CC BY 4.0 but per-city scrapes, low story value per unit of effort |
| Solar production and cost | commons#204 | Partly covered by lazard-lcoe; IRENA cost series would be the add-on |
| Government debt, tax and spending history (IMF Public Finances in Modern History) | commons#53, #161 | Good story, but the IMF licence and file shape weren't checked |

## Notes for the pipeline

- **Licence and index go together, as run 2 found.** The clean-licence candidates here (UCDP, IEA, PWT, EDGAR, NSIDC) are also the ones with a proper download page. The public-domain US-gov ones that have no index (NWS, Fed) are where the effort goes.
- **Two probes fail against bot protection:** bls.gov and nhtsa.gov both return 403 to plain curl. Plan API routes (BLS API works) or a browser UA before scheduling those.
- **Living-source roster for `monitored`:** NSIDC sea ice (daily), EIA oil (daily, existing), NOAA co2-ppm (monthly, existing), Fed SEP (quarterly), Big Mac (twice a year), UCDP/IEA/PWT (annual).
