# Decisions

Decisions the task and `AGENTS.md` did not settle.

1. **Month column is `date`, typed `yearmonth` (`YYYY-MM`).** Alternatives: `YYYY-MM-01` as a `date`, or separate `year` and `month` integer columns. Why: the values are monthly means centred mid-month, so a day-of-month would claim precision the data lacks. `YYYY-MM` is valid ISO 8601 and the validator checks it. Separate year/month columns would repeat the same information.

2. **Kept the source's `decimal date` as `decimal_year`.** Alternative: drop it because it can be derived from `date`. Why: NOAA's mid-month decimal values are not a simple formula (pre-1974 SIO rows use different fractions, e.g. `1958.2027` vs `1975.2083`). Keeping them saves a user from recomputing them, slightly differently.

3. **Column names:** `co2_ppm`, `co2_deseasonalized_ppm`, `days_measured`, `daily_sdev_ppm`, `uncertainty_ppm`. Alternatives: keep the source names (`average`, `ndays`, `sdev`, `unc`), or follow the `datasets/co2-ppm` core naming. Why: snake_case with the unit in the name is required by the conventions, and the field descriptions give each source name.

4. **Sentinels become empty cells:** `ndays = -1`, `sdev = -9.99` and `unc = -0.99` are written as empty. Alternative: keep them verbatim as codes. Why: the conventions want a genuinely empty cell for missing values, and the header defines these negatives as "no information".

5. **`unc = 0.00` on 1975-12 and 1984-04 is treated as missing.** Alternative: keep `0.00`. Why: both rows have the `-9.99` sdev sentinel (1975-12 also has `ndays = -1`). A zero uncertainty is not physically meaningful and is clearly a variant of the sentinel. The build only accepts `0.00` next to a missing sdev and fails on any other zero, so a new case would be caught.

6. **1984-04 keeps `days_measured = 2`** even though sdev and unc are missing. Alternative: blank it as an interpolated month. Why: the source gives a real non-negative count, and the build copies values rather than deciding which months were "really" interpolated.

7. **No `interpolated` flag or `site`/`lab` column.** Alternatives: add a boolean interpolation flag, an SIO/NOAA column, or a Mauna Loa/Maunakea column. Why: the source can't support an interpolation flag (it says SIO months use the same negative codes whether or not they were interpolated), and the Maunakea period ends partway through July 2023, so a per-month site value would be wrong for that month. Both are stated in the dataset and field descriptions instead. This is open to revisit at `enriched`.

8. **Numbers are copied as source text**, not parsed and re-printed. Alternative: parse to floats and format with a fixed precision. Why: this keeps the output byte-identical to the source digits and makes the build deterministic. Each value is still checked with a regex.

9. **The build is strict:** it fails on an unexpected header, a wrong cell count, a gap or repeated month, or an unrecognised negative or zero value. Alternative: skip or blank bad rows. Why: if the source changes when it is next refreshed, it should stop the build rather than slip through.

10. **License entry:** `name: "NOAA-GML-data-use"`, with the terms summarised in `title` and linked to the GML data page. Alternatives: `CC0-1.0`/`PDDL-1.0` on the grounds that it is US federal government work, or "other-pd". Why: no SPDX id applies to the terms the file states, and the conventions say to use the license's own name and a link in that case. I did not claim a public-domain status that the file does not state.

11. **Sources:** the CSV URL (with the retrieval date), the GML data page, and the Scripps CO2 program for the March 1958 – April 1974 values. Alternative: list only the NOAA file. Why: the header credits Scripps for that period, and we are republishing their data too.

12. **Output file name:** `data/co2-mm-mlo.csv` (resource `co2-mm-mlo`). Alternative: `data/co2-ppm.csv` or `monthly.csv`. Why: it keeps the source file's identity (monthly mean, Mauna Loa) and is URL-safe.

13. **Added a non-standard `unit: "ppm"` property** to the CO2 fields, alongside the unit in the names and descriptions. Alternative: leave it out. Why: it is harmless extra metadata that the validator ignores. Easy to remove if the house style objects.

14. **`.datahubignore` excludes `archive/`, `scripts/` and `DECISIONS.md`, but publishes `build.ts`.** Alternative: exclude `build.ts` too. Why: the conventions say to exclude raw downloads. Publishing the script shows readers how the CSV was made, even though it needs the archive to run.

15. **`AGENTS.md` copied whole into the dataset directory.** Alternative: copy only the "dataset part". Why: the root file mentions a "repo-only marker", but there isn't one, and `scripts/sync-dataset-agents.mjs` does not exist in this repo, so there was no boundary to cut at.

16. **Adversarial review done as a self-review.** No independent reviewer was available. The parser is small, but the file has a comment preamble. Review: self (blind run, no reviewer available). I independently rebuilt the expected output from the raw file with `awk` (applying the same sentinel rules) and diffed it against `data/co2-mm-mlo.csv`: identical across 821 rows. Empty-cell counts are 195 for `days_measured` (194 all-sentinel rows plus 1975-12) and 196 for sdev and unc (those plus 1984-04), which matches the raw sentinel counts. The months run contiguously from 1958-03 to 2026-07, and two runs gave the same SHA-256 (`49c95f36…29cb`). Verdict: APPROVED.

17. **No `views` added.** Alternative: a first line chart of `co2_ppm` and `co2_deseasonalized_ppm`. Why: charts belong to the `enrich` stage, and the task asked for `structured`.
