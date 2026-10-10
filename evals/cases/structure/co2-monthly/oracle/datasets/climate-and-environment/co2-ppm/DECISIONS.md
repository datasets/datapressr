# Decisions

Canned for the eval oracle (the reference build); a real run writes its own.

1. **Day of month.** Each monthly row is dated the 1st (`YYYY-MM-01`), not the 15th. Alternatives: the 15th (NOAA centres monthly values on mid-month) or a `YYYY-MM` string. Why: a full ISO date keeps the `date` type; the field description says the value refers to the whole month.
2. **`decimal_date` kept.** Alternative: drop it as derivable from `date`. Why: it is NOAA's own mid-month timestamp, not exactly derivable from the 1st-of-month date.
3. **Sentinels per column.** `-1` (ndays), `-9.99` (sdev) and `-0.99` (unc) become empty cells, each only in its own column; `0.00` uncertainty is kept as a value. Alternative: one global list. Why: the file header names a different marker per column, and zero is a real value.
4. **Deseasonalised column name.** `co2_ppm_deseasonalized`, following NOAA's current header. Alternative: `trend`, the older label. Why: matches the source as it is now.
5. **Licence.** `PDDL-1.0` with a request to cite NOAA and Scripps. Alternative: no SPDX id, quote NOAA's terms only. Why: NOAA GML data are a US Government work made freely available; PDDL is the closest SPDX id.
