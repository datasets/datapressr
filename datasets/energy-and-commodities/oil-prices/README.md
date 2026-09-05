# Crude oil spot prices — Brent and WTI

Europe Brent and Cushing/OK WTI crude oil spot prices, US dollars per barrel
(FOB), from the U.S. Energy Information Administration, at four frequencies.

| Resource | Coverage |
|----------|----------|
| `data/brent-daily.csv` | 1987-05-20 → present |
| `data/brent-weekly.csv` | Friday ending each week |
| `data/brent-monthly.csv` | dated to the 15th; monthly average |
| `data/brent-year.csv` | dated to 30 June; annual average |
| `data/wti-daily.csv` | 1986-01-02 → present |
| `data/wti-weekly.csv` / `wti-monthly.csv` / `wti-year.csv` | as Brent |

`build.ts` reproduces all eight CSVs from the archived EIA `.xls` workbooks.
Run: `npm install && node build.ts`.

## Source & licence

U.S. Energy Information Administration, *Petroleum & Other Liquids — Spot Prices*
(<https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm>). Raw `.xls` workbooks and
retrieval details in `archive/PROVENANCE.md`, retrieved 2026-09-05.

EIA data are a U.S. Government work and in the public domain; EIA asks for an
acknowledgement that includes a publication date, e.g. *"Source: U.S. Energy
Information Administration (Sep 2026)."* This tidy compilation is released as
**PDDL-1.0**.

## Notes

- **Date conventions come from EIA**, not imposed here: daily = observation date,
  weekly = Friday ending the week, monthly = 15th, annual = 30 June.
- **Excel serial dates are timezone-naive.** Parsing them via JS `Date` objects
  shifts every date by the local UTC offset (it turned 1987-05-20 into
  1987-05-19 here). `build.ts` converts the raw serials with
  `XLSX.SSF.parse_date_code`, which has no offset.
- **One dependency**: SheetJS `xlsx`. The EIA files are legacy BIFF8 `.xls`
  (OLE2 compound documents), which `exceljs` cannot read.

## Relationship to `datasets/oil-prices`

This is an independent re-wrangle of the same EIA source as the community
[`datasets/oil-prices`](https://github.com/datasets/oil-prices), done with the
DataPressr `structure` skill as a benchmark. The eight output CSVs are
**content-identical** to the published dataset (same rows, same coverage); the
only difference is the line terminator (LF here, CRLF there). See
`docs/structure-benchmark.md` in `datasets/datapressr` for the full comparison.
