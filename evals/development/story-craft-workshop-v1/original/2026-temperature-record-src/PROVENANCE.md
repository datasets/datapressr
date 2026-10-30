# Data, methods and licence

This story uses the Copernicus Climate Change Service (C3S)/ECMWF [September 2026 ERA5 monthly global surface-air-temperature CSV](https://climate.copernicus.eu/sites/default/files/2026-10/C3S_Bulletin_temp_202609_FigSupp2a_timeseries_anomalies_ref1850-1900_global_allmonths_DATA.csv). Observations cover January 1940–September 2026. The frozen [CSV](https://datahub.io/blog/2026-temperature-record-hurdle/_r/-/2026-temperature-record-src/global-monthly.csv) was retrieved on 15 October 2026 and rechecked unchanged on 24 October 2026. SHA-256: `b31271d6984e7e4cc02bedffd268e68d7b5cda571fb521dcedf435c2eca5407e`; 51,706 bytes.

Underlying product: [ERA5 monthly averaged data on single levels from 1940 to present](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels-monthly-means?tab=overview), DOI [10.24381/cds.f17050d7](https://doi.org/10.24381/cds.f17050d7). The [Copernicus licence](https://cds.climate.copernicus.eu/licences/cc-by) specifies [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Data: C3S/ECMWF, ERA5 (September 2026 bulletin snapshot); calculations: DataHub. Contains modified Copernicus Climate Change Service information 2026. Modifications comprise monthly grouping, averaging under two temporal weighting conventions, historical rankings and conditional calculations. Source observations are unchanged.

The [C3S September bulletin](https://climate.copernicus.eu/surface-air-temperature-september-2026) supplies the year-to-date and late-2023 comparisons and the attributed El Niño context. The [methods page](https://climate.copernicus.eu/climate-bulletin-about-data-and-analysis) explains ERA5 surface air temperature and temperature baselines. This analysis uses the supplied `ano_91-20` monthly anomalies throughout; it does not convert the chart scale to pre-industrial anomalies.

## Reproduction and limits

From the parent folder containing the story README, run:

```sh
python3 2026-temperature-record-src/calculate.py
npm ci
node 2026-temperature-record-make-charts.mjs
```

Installing pinned JavaScript dependencies requires network access or a populated npm cache. Once installed, the calculation and chart build use only the bundled files. The [calculation](https://datahub.io/blog/2026-temperature-record-hurdle/_r/-/2026-temperature-record-src/calculate.py) checks the input hash, monthly coverage, finite values and source identities, then reproduces [statistics.json](https://datahub.io/blog/2026-temperature-record-hurdle/_r/-/2026-temperature-record-src/statistics.json). The [chart builder](https://datahub.io/blog/2026-temperature-record-hurdle/_r/-/2026-temperature-record-make-charts.mjs) checks data against those statistics before writing the two SVGs.

Equal-month and calendar-day weighted alternatives are calculated separately, using actual calendars. Their displayed range is sensitivity to the averaging convention, not observational uncertainty. Overtaking requires exceeding the unrounded tie hurdle. The result is a conditional calculation on the supplied snapshot, not an official annual classification, a forecast or an estimated probability. A historical maximum is not a physical ceiling. The source's reference webpages are linked, not redistributed in this package.
