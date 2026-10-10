# Decisions

Decisions made while structuring `co2-ppm` that the task, `AGENTS.md` and the `structure` skill did not settle.

1. **License entry: NOAA's own terms, not an SPDX id.** Decided: `licenses[0]` is `NOAA-GML-data-use`, titled with the terms quoted in the file header ("made freely available to the public", credit requested via citation) and linked to the GML data page. Alternatives: `CC0-1.0` or `PDDL-1.0` (US federal works are generally public domain), or `"other"`. Why: the source never names a licence, and `AGENTS.md` says to use the licence's own name and a link when there is no SPDX id. Putting a public-domain SPDX id on it would claim something NOAA did not say.

2. **Date column: one `date` field typed `yearmonth` (`YYYY-MM`).** Alternatives: `date` typed `date` with an invented day (`1958-03-01`, as the old community dataset does), or keeping separate `year` + `month` integers. Why: the observation is a month. A day-of-month would be made up, and `YYYY-MM` is ISO 8601. The validator checks `yearmonth`, and `AGENTS.md` lists it as a valid chart axis type.

3. **`year` and `month` dropped; `decimal_date` kept.** Alternatives: keep all three, or drop `decimal_date` too. Why: `year`/`month` exactly duplicate `date`. `decimal_date` is the source's own mid-month position (SIO and NOAA eras compute it slightly differently) and is handy for numeric plotting, so it stays. `build.ts` checks it against year/month.

4. **Column names.** Decided: `average_ppm`, `deseasonalized_ppm`, `n_days`, `daily_sdev_ppm`, `uncertainty_ppm`. Alternatives: the source names (`average`, `ndays`, `sdev`, `unc`), or longer ones (`co2_monthly_mean_ppm`). Why: snake_case with units per `AGENTS.md`. "daily_" makes clear that sdev is the spread of daily means within the month. Kept short and close to the source names so they are easy to map back.

5. **Sentinels emptied, per column.** `ndays = -1`, `sdev = -9.99`, `unc = -0.99` become empty cells. Any other negative value fails the build. Alternative: keep the sentinels and declare them in `missingValues`. Why: `AGENTS.md` says missing is a genuinely empty cell.

6. **`unc = 0.00` in 1975-12 and 1984-04 emptied.** These are the only two rows with zero uncertainty, and both carry the `sdev = -9.99` sentinel (1975-12 is an interpolated month with `ndays = -1`; 1984-04 has `ndays = 2`). Decided: the rule is per row. When sdev is the sentinel, a zero unc means "no information" and becomes empty. A zero unc anywhere else would fail the build. Alternative: publish `0.00` verbatim. Why: the preamble says interpolated or no-information months show negative stdev *and* uncertainty, and a zero uncertainty on a monthly mean is not a real measurement. The two rows are named in the field description. `n_days = 2` for 1984-04 is kept, because it is a real count.

7. **No `interpolated` or `site`/`lab` column.** Alternatives: derive `is_interpolated` from the sentinels, a `source_lab` (SIO/NOAA) column, or a `site` column for the Maunakea period (Dec 2022 to 4 July 2023). Why: the source does not give interpolation per row. For SIO data the sentinels mean "no information", not "interpolated", so a flag would be a guess. July 2023 mixes the two sites, so a per-month site value would be wrong for it. These facts are in the dataset and field descriptions instead.

8. **Numbers published as the source's text.** Every kept value is copied verbatim after a strict numeric parse, so `314.80` stays `314.80` and `1958.2027` keeps four decimals. Alternative: re-serialise through JS numbers, which turns `314.80` into `314.8`. Why: keep the source's precision. Byte-for-byte copying is also the simplest deterministic output.

9. **Build assertions.** The build throws if: the header is not the exact expected one; there are CR line endings; a row is not 8 cells; months are not contiguous and strictly increasing (this also proves the `date` key is unique); `decimal_date` disagrees with year/month by more than 0.01; average or deseasonalized are missing or outside 250 to 600 ppm; there are fewer than 821 rows; or the first row is not `1958-03, 315.71`. Alternative: rely on the validator only. Why: the skill says to keep profiling as assertions, because an upstream refresh can break them. The ≥ 821 row check and plausible-range bounds were my own choices.

10. **One resource named `co2-ppm-monthly` at `data/co2-ppm-monthly.csv`.** Alternatives: `data/co2-mm-mlo.csv` (source name) or `data/monthly.csv`. Why: follows the skill's uniform `<dataset>-<grain>` naming (`brent-monthly`), which leaves room for annual or weekly resources later.

11. **No adversarial review (step 7) was run.** Why: the skill says it is not needed for a single-file CSV read without a custom parser that passes the validator, and names `co2-ppm` as that case. The only parsing here is dropping `#` lines and a plain comma split. In this run I checked the outputs myself instead: the first and last rows, and the two `0.00` rows, by hand against the archive.

12. **`AGENTS.md` copied whole into the dataset directory.** The root file mentions a "repo-only marker" but contains none, and `scripts/sync-dataset-agents.mjs` does not exist in this workspace. Alternative: cut it off at a guessed point (for example before `## Skills`). Why: with no marker, the whole file is "above the marker", and copying verbatim avoids guessing.

13. **`.datahubignore` excludes `archive/`, `scripts/`, `DECISIONS.md`, `AGENTS.md`.** Alternative: publish the raw snapshot too. Why: `AGENTS.md` says to exclude raw downloads. The snapshot stays in git for reproducibility. `build.ts` is published so readers can see the transform.

14. **No `views` added.** Why: charts belong to the `enrich` stage, and the `structured` definition of done does not require them.
