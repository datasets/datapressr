Every airport, heliport, seaplane base and balloonport in [OurAirports](https://ourairports.com/), one row per site (86,094 rows, closed sites included), with its country and region names and a summary of its runways. Snapshot of 2026-09-18.

| Resource | Content |
|---|---|
| `data/airports.csv` | One row per OurAirports site, keyed on OurAirports' stable `id`: identifiers (`ident`, `icao_code`, `iata_code`, `gps_code`, `local_code`), type, name, position and elevation, continent, country and region (codes and names), municipality, scheduled service, and `runway_count`, `open_runway_count` and `longest_open_runway_ft` |

By type: 42,733 small airports, 23,215 heliports, 13,531 closed sites, 4,106 medium airports, 1,273 seaplane bases, 1,174 large airports and 62 balloonports. 9,055 have an IATA code and 4,335 currently have scheduled airline service. Every field is typed and described in `datapackage.json`.

## How it is built

`build.ts` joins four OurAirports tables, checking each join rather than assuming it:

- `airports.iso_country` → `countries.csv`, many-to-one, for `country_name`
- `airports.iso_region` → `regions.csv`, many-to-one, for `region_name`
- `runways.csv` → `airports.id`, aggregated per airport into the three runway columns

The "one" side of every join must be unique, every foreign key must resolve (a new orphan fails the build rather than leaving a silent blank), each region must belong to its airport's country, and the output must have exactly one row per source airport. `fetch.ts` snapshots the four CSVs into `archive/` with their URL, Last-Modified date and SHA-256; `build.ts` reads only that snapshot, so the output is reproducible offline:

```sh
node fetch.ts               # reuses the snapshot unless --refresh
npm install && node build.ts
```

The scripts and raw snapshot live in the [DataPressr repository](https://github.com/datasets/datapressr/tree/main/datasets/transport/airports), not on DataHub.

## Reading the data

- **`NA` is data, not missing.** `continent` `NA` is North America and `iso_country` `NA` is Namibia. Tools that read `NA` as missing by default (pandas, R) need that turned off. Missing values are empty cells.
- **Runways.** `runway_count` counts every runway listed for the site, closed ones included (helipads count as runways at heliports); 44,953 sites list none. `longest_open_runway_ft` is empty when there is no open runway or no open runway has a recorded length.
- **Coverage is OurAirports'.** It is a volunteer-maintained database; this dataset adds no sites and removes none.

## Source and licence

[OurAirports open data](https://ourairports.com/data/) (CSV mirror at `davidmegginson.github.io/ourairports-data`), retrieved 2026-09-18; field meanings from the [OurAirports data dictionary](https://ourairports.com/help/data-dictionary.html). OurAirports releases all its data to the public domain, and this compilation is dedicated to the public domain under [PDDL-1.0](https://opendatacommons.org/licenses/pddl/).

## Relation to core/airport-codes

DataHub also has [core/airport-codes](https://datahub.io/core/airport-codes), git-synced from [`datasets/airport-codes`](https://github.com/datasets/airport-codes) and built from the same OurAirports source. What differs:

- **Columns.** Core has one `airport-codes.csv` with 13 columns and a combined `coordinates` string (`"40.070985, -74.933689"`). This dataset keeps OurAirports' numeric `id` as the primary key, separate numeric `latitude_deg` and `longitude_deg`, and adds `country_name`, `region_name`, `scheduled_service` and the three runway columns joined from the other OurAirports tables.
- **Rows.** Both include closed sites. Core is refreshed daily from OurAirports (86,226 rows on 2026-10-09); this is a dated snapshot of 2026-09-18 with 86,094.

Both use LF line endings.
