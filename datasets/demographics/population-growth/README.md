Annual population growth, as a percentage, for 217 economies and 48 World Bank aggregates (regions, income groups and the World), 1960–2025. This is World Bank World Development Indicators series `SP.POP.GROW`: the exponential rate of growth of midyear population from year t-1 to t. Snapshot of the World Bank Indicators API taken 2026-09-18 (WDI last updated 2026-07-13).

| Resource | Content |
|---|---|
| `data/population-growth.csv` | One row per entity and year (17,490 rows), keyed on `country_code` + `year`, with `country_name`, `is_aggregate` and `population_growth_pct` |
| `data/countries.csv` | One row per World Bank entity (295, of which 78 aggregates), keyed on `country_code`: 2-letter code, region, income level, lending type, capital city and its coordinates |

World population growth peaked at 2.12% in 1963 and was 0.91% in 2025. In 2025, 49 of the 217 economies shrank. Every field is typed and described in `datapackage.json`.

## Reading the data

- **Do not sum aggregates with countries.** Rows for regions, income groups and the World have `is_aggregate` `true`. Filter on it before adding anything up.
- **Missing values are empty cells.** An empty `population_growth_pct` (362 rows) means the World Bank publishes no estimate for that entity and year. A `0` is a real value.
- **Aggregates have no region, income level or lending type.** The API gives them a placeholder region `NA`, "Aggregates", which would collide with Namibia's 2-letter code `NA`, so those columns are left empty for aggregates.
- **Codes.** `country_code` is the World Bank's 3-letter code: ISO 3166-1 alpha-3 for economies, World Bank codes such as `WLD`, `HIC` and `SSF` for aggregates. The API leaves the 3-letter code empty for the five income-group aggregates; the build maps them from their 2-letter codes (for example `XD` to `HIC`).

## How it is built

`fetch.ts` snapshots the paged API responses, the country metadata and the indicator metadata into `archive/`, recording each URL, retrieval time and SHA-256. `build.ts` reads only that snapshot, asserts the shape it expects (one-to-one code mapping, constant unit and decimal fields, every observation matched to an entity) and writes both CSVs deterministically. No dependencies:

```sh
node fetch.ts     # reuses the snapshot unless --refresh
node build.ts
```

The scripts and raw snapshot live in the [DataPressr repository](https://github.com/datasets/datapressr/tree/main/datasets/demographics/population-growth), not on DataHub.

## Source and licence

World Bank, [World Development Indicators](https://datacatalog.worldbank.org/search/dataset/0037712/world-development-indicators), indicator [`SP.POP.GROW`](https://api.worldbank.org/v2/indicator/SP.POP.GROW?format=json), via the Indicators API v2. The World Bank compiles it from the UN Population Division's World Population Prospects, national statistical offices, Eurostat and the UN Statistics Division. Licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): attribute the World Bank.

## Relation to core datasets

DataHub has no `core/population-growth`. [core/population](https://datahub.io/core/population) is a different World Bank indicator (total population, `SP.POP.TOTL`), not growth rates.
