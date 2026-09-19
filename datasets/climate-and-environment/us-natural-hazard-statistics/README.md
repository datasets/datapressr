# U.S. weather-related fatalities, injuries and damage by hazard type

Deaths, injuries and property and crop damage caused by weather in the United States, by event type, for each year from 1997 to 2025 — 29 years, 759 event rows plus the 29 annual totals the source prints itself. Compiled by the National Weather Service from Storm Data and published one PDF per year as the *Summary of U.S. Natural Hazard Statistics*.

Over the 29 years the source counts **18,867** weather-related deaths. Heat is the largest single cause at 5,366, ahead of tornadoes (2,167) and flash floods (2,015). The deadliest year is 2005 (1,451, most of it Hurricane Katrina) and the costliest is also 2005, at about $100.8 billion of nominal property and crop damage.

## Rebuild

```sh
cd datasets/climate-and-environment/us-natural-hazard-statistics
NWS_USER_AGENT="<project> <your-email>" node fetch.ts   # 35 requests, paced; writes archive/
npm install && node build.ts                            # offline; archive/ → data/
node --test                                             # 36 tests
node ../../../scripts/validate-datapackage.mjs .
```

`fetch.ts` is the only networked script and refuses to run without an honest `NWS_USER_AGENT` naming a contact address. `build.ts` reads `archive/` and nothing else, checking every file against `archive/manifest.json`'s SHA-256 before parsing it, so the build is provably offline and reproducible: two runs produce byte-identical CSVs.

`pdfjs-dist` is the one dependency, and it is there because the source is PDFs. It is build-only: `package.json`, `package-lock.json` and `node_modules/` are excluded from what gets published.

## What the numbers mean

- **Damage is nominal.** Millions of US dollars *of the year reported*, never inflation-adjusted. Comparing 1997 to 2025 without deflating compares two different dollars. The source reports to one decimal place to 2006 and two from 2007.
- **Deaths are Storm Data's, not the CDC's.** The source's hub page (archived as `archive/hazstat.html`) says the Centers for Disease Control and Prevention "is the official government source of cause of death in the United States, including weather-related fatalities". The phrase appears there and in none of the 30 annual PDFs. These figures are the NWS's own attributions, direct and indirect, and are a different series from a death-certificate count.
- **A hurricane row is wind only.** The source attributes fatalities, injuries and damage under "Tropical Storm / Hurricane" to the wind alone; storm surge, rainfall flooding and tornadoes from the same storm are counted under Flood, Tornado and so on. **No row in this dataset is the full cost of a named storm**, and summing the tropical-cyclone rows across years does not give the cost of hurricanes. For that, the hub page points at "the Tropical Cyclone Reports issued by the National Weather Service at www.hurricanes.gov" — those reports are the National Hurricane Center's, though the hub page does not name it.
- **Coverage is the 50 states, Puerto Rico, Guam and the Virgin Islands** — the forecast offices Storm Data collects from.
- **The total row is the source's own.** Each year carries a row flagged `is_total`, which is what that year's PDF prints as its total. The event rows sum to it exactly for fatalities and injuries; the build stops if they ever do not. Summing a total row with its components double-counts.
- **A `0` is a reported zero.** There are no missing values in this dataset; every published row has all five figures.
- **The most recent year is preliminary, and earlier years get revised.** The hub page headlines the 2025 figures as "Preliminary". The PDFs' own `Report generated:` footers show the revisions are real: 2007–2015 were all regenerated on 2016-05-13, 2019 on 2021-09-21 and 2024 as recently as 2026-03-24. Re-fetching and diffing is the only way to see a restatement — the source publishes no change feed.

## The event vocabulary changes, and it is not smoothed over

`hazard` is the label the source prints, verbatim. Across 29 years it moves:

| What changes | When | What this dataset does |
|---|---|---|
| `Tstm Wind` → `Thunderstorm Wind` | 2007 | Folded into one `hazard_id`. An abbreviation, not a redefinition. |
| `Tropical Storm/Hurricane` → `Tropical Storm / Hurricane` | 2007 | Folded. Whitespace only. |
| `Rip Current` first reported | 2002 | **Not** folded into anything. Where rip-current deaths were counted in 1997–2001 is not stated. |
| `Small Stream/Urban Flood` last reported | 2006 | **Not** folded into anything. Whether it moved into Flash Flood or River Flood is not stated. |
| Total row spelled `TOTALS` (1997–98), `TOTAL` (1999–2001), `TOTALS` again (2002–06), `Total` (2007–25) | oscillates | Kept verbatim; use `is_total`, never the label. |

So `hazard_id` collapses exactly two pairs and nothing else, and the two genuine gaps in the vocabulary stay visible as gaps. Most years carry 26 event rows; 2002–2006 carry 27, the five years in which Rip Current and Small Stream/Urban Flood are both reported.

## Coverage, and what is not here

The hub page's menu offers 31 annual summaries. `data/source-documents.csv` accounts for all 31:

| Range | Documents | Status |
|---|--:|---|
| 1997–2025 | 29 | **Extracted.** No gaps. |
| 1996 | 1 | **Discovered, not extracted.** The PDF is page images with no extractable text — 4 image objects and no rendered glyphs, against 305 text-showing operators in the 1997 file. The table would need OCR, which this build does not do. |
| 1995 | 1 | **Does not exist.** The hub page's menu links `sum95.pdf`; the server returns **HTTP 404**. The listing is wrong, not the fetch. |

Two layouts, read from the header each document prints rather than inferred from its year:

- **legacy, 1997–2006** — damage headed `Damage (M)`, one decimal place, currency symbols as separate text runs, and a hand-drawn brace on the `River Flood` line carrying a Flood-category subtotal that is *not* a component row. The build checks that subtotal against the flood rows it brackets.
- **modern, 2007–2025** — damage headed `(million $)`, two decimal places, no brace, and a `Report generated:` footer that dates the PDF's own last revision.

The two eras' column positions overlap: a legacy *injuries* figure sits almost exactly where a modern *fatalities* figure sits. A single hard-coded column template would therefore mis-read an entire era while still producing a full-looking table, so `build.ts` calibrates the five columns per document from the right edges of that document's own well-formed rows, and throws if a figure lands in no column.

Also present in the source and deliberately not extracted: per-state summaries and per-hazard breakdowns (nine further menus on the same page), the fatalities-by-sex-and-age table on the last page of each modern PDF, and the "80-Year List of Severe Weather Fatalities" the hub page links. All are real follow-ups, not oversights.

## What the checks actually check

Counting rows is necessary and not sufficient — the first draft of this build published an event called `River Flood}}` for six years, with every row count and every sum check passing, because only the label was wrong. So, beyond the counts:

- Each year publishes exactly the event labels the source is known to report that year. This is the only check that can see a dropped row: an event with no deaths, no injuries and little damage subtracts nothing from any total, so the arithmetic below cannot notice it going missing.
- Property + crop equals the row's own printed total, in every row.
- Event rows sum to the year's own total row, exactly, for fatalities and injuries.
- The legacy brace's Flood subtotal equals the flood rows it brackets.
- Every event label matches the shape of a label; `River Flood}}` does not.
- Categories appear once each, in the source's own order.
- Every figure-less row inside the table is either a known category or the one page-furniture shape that occurs there (the modern layout's `Report generated:` footer) — anything else stops the build rather than being skipped. The list was derived by enumerating every such row across all 29 extractable years.
- The extracted years are contiguous *and* the newest served document produced rows. A gap check alone cannot see a series truncated at its far end.
- All seven categories appear, once each, in the source's own order; a legacy document without its braced subtotal is an error, because that brace is the legacy era's only independent cross-check.
- And, in the tests rather than the build: six five-tuples read off the PDFs **by hand**, one per era plus the awkward rows. Everything else here is derived from the pipeline it is checking and moves with it — a whole-era column swap keeps every sum, every count and the coverage table intact. The hand-read values are the only assertions anchored outside the build, and they are what catches it.

## Licence

The NWS states its position plainly, and `archive/disclaimer.html` holds the page as retrieved on 2026-09-19:

> The information on National Weather Service (NWS) Web pages are in the public domain, unless specifically noted otherwise, and may be used without charge for any lawful purpose so long as you do not: 1) claim it is your own […], 2) use it in a manner that implies an endorsement or affiliation with NOAA/NWS, or 3) modify its content and then present it as official government material.

This dataset attributes the source, claims nothing as its own, and is a derived compilation rather than an official NWS product. `archive/` holds the retrieved PDFs as evidence for the build.

The same page asks, under 17 U.S.C. § 403, that a third party publishing work consisting predominantly of NWS material identify that material **and state that it is not subject to copyright protection**. So, plainly: the figures in `data/` are extracted from National Weather Service publications, and **that NWS material is not subject to copyright protection**.

The compilation itself — the extracted figures, the schema and the build scripts — is dedicated to the public domain under **PDDL-1.0**, which is what `co2-ppm` (NOAA) and `oil-prices` (EIA) do for the same situation: a US Government work whose agency states it is public domain and asks to be cited.

No robots.txt and no sitemap are served for `weather.gov` — `fetch.ts` probes both on every run and records the answer in `archive/manifest.json`, so that claim is checkable from the archive rather than taken on trust, and a future 200 will show up as a failing test. The source states no rate limit either; `fetch.ts` therefore paces itself at one request every 1.5 seconds and declares who is asking.
