# Heat deaths by state: NWS annual heat summaries

Context snapshot for the "Heat is the quiet killer" story. Not part of any dataset.

- **Source:** National Weather Service, *Heat Related Fatalities* annual summaries, one PDF per year, linked from the "Heat" menu on the [NWS hazard statistics hub page](https://www.weather.gov/hazstat/). URL pattern `https://www.weather.gov/media/hazstat/heat<yy>.pdf`, for 1997 to 2025.
- **Retrieved:** 2026-10-10, one request every 1.5 seconds, with a User-Agent naming the project and a contact address. All 29 requests returned HTTP 200. The PDFs are in `nws-heat-pdfs/`; `SHA256SUMS` holds their hashes (`shasum -a 256 -c SHA256SUMS` from `nws-heat-pdfs/`).
- **Licence:** NWS web material is in the public domain ([NWS disclaimer](https://www.weather.gov/disclaimer)). As 17 U.S.C. § 403 asks: the figures are extracted from National Weather Service publications, and that NWS material is not subject to copyright protection.
- **Revisions:** like the national summaries, these PDFs are regenerated without notice (their `Report generated:` footers run from 2022 to 2026-07-08 for 2020–2025). 2025 is preliminary.

## heat-deaths-arizona.csv

One row per year: `heat_all_states` (the PDF's own total row for the "Heat Related Fatalities by State and Location" table), `arizona` (that table's AZ row; 0 where the table has no AZ row, since the table lists only states with deaths) and `source_pdf`.

Extracted with `pdftotext -layout` (Poppler) and a regular expression over the state table: a two-letter state code, optionally followed by the state name in brackets, then nine integers, of which the last is the state total. For every year, the state rows sum exactly to the PDF's total row, and that total equals the `Heat` row of the [us-natural-hazard-statistics](https://github.com/datasets/datapressr/tree/main/datasets/climate-and-environment/us-natural-hazard-statistics) dataset for the same year. `heat-quiet-killer-make-charts.mjs` re-checks the second equality on every build and stops if it fails.
