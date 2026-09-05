# Provenance — oil-prices raw snapshot

Source: U.S. Energy Information Administration (EIA), Petroleum & Other Liquids,
Spot Prices. <https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm>

Downloaded 2026-09-05 from the EIA "historical data" `.xls` endpoints:

| File | Series | Frequency | URL |
|------|--------|-----------|-----|
| `RBRTEd.xls` | Europe Brent Spot Price FOB | daily   | <https://www.eia.gov/dnav/pet/hist_xls/RBRTEd.xls> |
| `RBRTEw.xls` | Europe Brent Spot Price FOB | weekly  | <https://www.eia.gov/dnav/pet/hist_xls/RBRTEw.xls> |
| `RBRTEm.xls` | Europe Brent Spot Price FOB | monthly | <https://www.eia.gov/dnav/pet/hist_xls/RBRTEm.xls> |
| `RBRTEa.xls` | Europe Brent Spot Price FOB | annual  | <https://www.eia.gov/dnav/pet/hist_xls/RBRTEa.xls> |
| `RWTCd.xls` | Cushing OK WTI Spot Price FOB | daily   | <https://www.eia.gov/dnav/pet/hist_xls/RWTCd.xls> |
| `RWTCw.xls` | Cushing OK WTI Spot Price FOB | weekly  | <https://www.eia.gov/dnav/pet/hist_xls/RWTCw.xls> |
| `RWTCm.xls` | Cushing OK WTI Spot Price FOB | monthly | <https://www.eia.gov/dnav/pet/hist_xls/RWTCm.xls> |
| `RWTCa.xls` | Cushing OK WTI Spot Price FOB | annual  | <https://www.eia.gov/dnav/pet/hist_xls/RWTCa.xls> |

Each workbook has two sheets: `Contents` (a description block) and `Data 1`
(row 1 title, row 2 `Sourcekey`, row 3 header, then `date, price` rows). Dates are
stored as Excel serial numbers; EIA's own date conventions: daily = observation
date, weekly = Friday ending the week, monthly = 15th, annual = 30 June.

Legacy BIFF8 `.xls` (OLE2 compound document) — not readable by `exceljs`; parsed
with SheetJS `xlsx`.

License: U.S. government work, public domain. EIA asks for acknowledgement with a
publication date. Compilation released as PDDL-1.0. See dataset README.
