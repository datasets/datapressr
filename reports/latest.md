# Commons dataset check, 2026-11-22

Standard: https://github.com/datasets/datapressr/blob/main/docs/dataset-standard.md (stock level).

164 repos: 23 fail, 106 warn, 8 pass, 27 skipped (no datapackage.json).

| Dataset | Status | Upkeep | Errors | First finding |
|---|---|---|---|---|
| [airport-codes](https://github.com/datasets/airport-codes) | fail | living (inferred), daily | 1 | refresh job failing: last scheduled run failure on 2026-11-22 |
| [bond-yields-uk-10y](https://github.com/datasets/bond-yields-uk-10y) | fail | living (inferred), quarterly | 1 | refresh job failing: last scheduled run failure on 2026-10-01 |
| [covid-19](https://github.com/datasets/covid-19) | fail | frozen (inferred) | 1 | README.md:113:244: will not render on DataHub (MDX, dependency-free scan): autolink <https://www.thelancet.com/journals/laninf/article/PIIS1473-3099(20)30120-1/ |
| [emojis](https://github.com/datasets/emojis) | fail | living (inferred), daily | 1 | refresh job failing: last scheduled run failure on 2026-11-22 |
| [employment-us](https://github.com/datasets/employment-us) | fail | living (inferred), monthly | 1 | refresh job failing: last scheduled run failure on 2026-09-01 |
| [exchange-rates-usd](https://github.com/datasets/exchange-rates-usd) | fail | frozen (inferred) | 1 | `resources` is missing or empty (only allowed while `status` is `capture` or `stub`) |
| [finance-vix](https://github.com/datasets/finance-vix) | fail | living (inferred), daily | 1 | refresh job failing: last scheduled run failure on 2026-11-21 |
| [gdp](https://github.com/datasets/gdp) | fail | living (inferred), monthly | 2 | refresh job failing: last scheduled run failure on 2026-11-01 |
| [glwd](https://github.com/datasets/glwd) | fail | frozen (inferred) | 1 | resource "Level 2 (GLWD-2) comprises permanent open water bodies with a surface area ≥ 0.1 km2 excluding the water bodies contained in GLWD-1. Compressed becaus |
| [language-codes](https://github.com/datasets/language-codes) | fail | living (inferred), weekly | 1 | refresh job failing: last scheduled run failure on 2026-11-16 |
| [london-population](https://github.com/datasets/london-population) | fail | living (inferred), monthly | 1 | refresh job failing: last scheduled run failure on 2026-06-01 |
| [pharmaceutical-drug-spending](https://github.com/datasets/pharmaceutical-drug-spending) | fail | living (inferred), quarterly | 1 | refresh job failing: last scheduled run failure on 2026-10-01 |
| [population-growth-estimates-and-projections](https://github.com/datasets/population-growth-estimates-and-projections) | fail | living (inferred), monthly | 1 | refresh job failing: last scheduled run failure on 2026-06-01 |
| [ppp](https://github.com/datasets/ppp) | fail | living (inferred), monthly | 1 | refresh job failing: last scheduled run failure on 2026-06-01 |
| [project-drawdown](https://github.com/datasets/project-drawdown) | fail | frozen (inferred) | 1 | https://datahub.io/core/project-drawdown returns HTTP 404 |
| [publicbodies](https://github.com/datasets/publicbodies) | fail | living (inferred), weekly | 1 | refresh job failing: last scheduled run failure on 2026-11-15 |
| [s-and-p-500-companies](https://github.com/datasets/s-and-p-500-companies) | fail | living (inferred), daily | 1 | https://datahub.io/core/s-and-p-500-companies returns HTTP 404 |
| [threatened-species](https://github.com/datasets/threatened-species) | fail | living (inferred), weekly | 1 | refresh job failing: last scheduled run failure on 2026-05-10 |
| [top-level-domain-names](https://github.com/datasets/top-level-domain-names) | fail | living (inferred), monthly | 1 | refresh job failing: last scheduled run failure on 2026-10-01 |
| [unicode-characters](https://github.com/datasets/unicode-characters) | fail | living (inferred), monthly | 1 | https://datahub.io/core/unicode-characters returns HTTP 404 |
| [usa-education-budget-analysis](https://github.com/datasets/usa-education-budget-analysis) | fail | living (inferred), monthly | 1 | refresh job failing: last scheduled run failure on 2026-06-01 |
| [world-religion-projections](https://github.com/datasets/world-religion-projections) | fail | frozen (inferred) | 2 | README.md:7:83: will not render on DataHub (MDX, dependency-free scan): "<1" cannot start a tag: MDX fails; write "less than" or put it in code — DataHub would  |
| [zopa](https://github.com/datasets/zopa) | fail | living (inferred), monthly | 1 | refresh job failing: last scheduled run failure on 2026-07-01 |
| [bond-yields-gov-long-term](https://github.com/datasets/bond-yields-gov-long-term) | warn | living (inferred), monthly | 0 | us-treasury-10y-yields:1: CR line endings (house format is LF) |
| [bond-yields-us-10y](https://github.com/datasets/bond-yields-us-10y) | warn | living (inferred), monthly | 0 | `description` is missing |
| [breast-cancer](https://github.com/datasets/breast-cancer) | warn | frozen (inferred) | 0 | `description` is missing |
| [browser-stats](https://github.com/datasets/browser-stats) | warn | frozen (inferred) | 0 | `description` is missing |
| [cash-surplus-deficit](https://github.com/datasets/cash-surplus-deficit) | warn | living (inferred), monthly | 0 | cash-surp-def:1: CR line endings (house format is LF) |
| [cervical-cancer](https://github.com/datasets/cervical-cancer) | warn | frozen (inferred) | 0 | `description` is missing |
| [cirp-survey-of-freshmen](https://github.com/datasets/cirp-survey-of-freshmen) | warn | frozen (inferred) | 0 | `description` is missing |
| [clinical-trials-us](https://github.com/datasets/clinical-trials-us) | warn | frozen (inferred) | 0 | resource "nct00000102" has no `schema.fields` — column types aren't declared |
| [co2-fossil-by-nation](https://github.com/datasets/co2-fossil-by-nation) | warn | frozen (inferred) | 0 | top-emitters:1: CR line endings (house format is LF) |
| [co2-fossil-global](https://github.com/datasets/co2-fossil-global) | warn | living (inferred), annual | 0 | `description` is missing |
| [co2-ppm](https://github.com/datasets/co2-ppm) | warn | living (inferred), monthly | 0 | 13 data value(s) don't match the schema; first: co2-mm-mlo:2: row has 7 cell(s), header has 6 |
| [co2-ppm-daily](https://github.com/datasets/co2-ppm-daily) | warn | frozen (inferred) | 0 | `description` is missing |
| [cofog](https://github.com/datasets/cofog) | warn | frozen (inferred) | 0 | 1 data value(s) don't match the schema; first: cofog: header [Code, Description_EN, Description_FR, Description_ES, ExplanatoryNote] does not match schema field |
| [commodity-prices](https://github.com/datasets/commodity-prices) | warn | living (inferred), weekly | 0 | `description` is missing |
| [continent-codes](https://github.com/datasets/continent-codes) | warn | frozen (inferred) | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [core-datasets](https://github.com/datasets/core-datasets) | warn | frozen (inferred) | 0 | core-list:40: name has leading/trailing whitespace: "household-income-us-historical " |
| [corruption-perceptions-index](https://github.com/datasets/corruption-perceptions-index) | warn | frozen (inferred) | 0 | licence "CC-BY-ND-4.0" is not on the open allowlist (CC0-1.0, PDDL-1.0, CC-BY-4.0, CC-BY-3.0, ODC-BY-1.0, ODbL-1.0, CC-BY-SA-4.0, OGL-UK-3.0, US-PD, other-pd);  |
| [country-codes](https://github.com/datasets/country-codes) | warn | living (inferred), monthly | 0 | country-codes:3: MARC has leading/trailing whitespace: " " |
| [country-list](https://github.com/datasets/country-list) | warn | living (inferred), monthly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [cpi](https://github.com/datasets/cpi) | warn | living (inferred), monthly | 0 | 1 data value(s) don't match the schema; first: cpi: header [Country, Country Code, Year, CPI] does not match schema fields [Country Name, Country Code, Year, CP |
| [cpi-change](https://github.com/datasets/cpi-change) | warn | living (inferred), annual | 0 | annual-consumer-price-index-percent-change-1974-2016-csv:2: CR line endings (house format is LF) |
| [cpi-gb](https://github.com/datasets/cpi-gb) | warn | living (inferred), monthly | 0 | `description` is missing |
| [cpi-us](https://github.com/datasets/cpi-us) | warn | living (inferred), monthly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [crime-uk](https://github.com/datasets/crime-uk) | warn | living (inferred), daily | 0 | resource "forces" has a field that looks like an identifying column but no `schema.primaryKey` is set |
| [currency-codes](https://github.com/datasets/currency-codes) | warn | living (inferred), monthly | 0 | codes-all:56: Currency has leading/trailing whitespace: "Comorian Franc " |
| [dac-and-crs-code-lists](https://github.com/datasets/dac-and-crs-code-lists) | warn | living (inferred), daily | 0 | dac-members:1: CR line endings (house format is LF) |
| [datapackage-factory-openMV](https://github.com/datasets/datapackage-factory-openMV) | warn | frozen (inferred) | 0 | `name` "datapackage-factory-openmv" differs from the repo name "datapackage-factory-openMV" |
| [dermatology](https://github.com/datasets/dermatology) | warn | frozen (inferred) | 0 | `description` is missing |
| [diagnosed-diabetes-prevalence](https://github.com/datasets/diagnosed-diabetes-prevalence) | warn | frozen (inferred) | 0 | diagnosed-diabetes-prevalence-2004-2013-csv: Year has format "any", which this validator does not check |
| [edgar](https://github.com/datasets/edgar) | warn | frozen (inferred) | 0 | resource "sec-financials-readme" has no `schema.fields` — column types aren't declared |
| [eeg-eye-state](https://github.com/datasets/eeg-eye-state) | warn | frozen (inferred) | 0 | `description` is missing |
| [eu-emissions-trading-system](https://github.com/datasets/eu-emissions-trading-system) | warn | living (inferred), monthly | 0 | resource "eu-ets" has a field that looks like an identifying column but no `schema.primaryKey` is set |
| [euribor](https://github.com/datasets/euribor) | warn | living (inferred), monthly | 0 | no `sources` entry with an http(s) `path`: a clear primary source is required (standard rule 4) |
| [exchange-rates](https://github.com/datasets/exchange-rates) | warn | living (inferred), daily | 0 | `description` is missing |
| [expenditure-on-research-and-development](https://github.com/datasets/expenditure-on-research-and-development) | warn | frozen (inferred) | 0 | `description` is missing |
| [fertility](https://github.com/datasets/fertility) | warn | frozen (inferred) | 0 | `description` is missing |
| [fips-10-4](https://github.com/datasets/fips-10-4) | warn | frozen (inferred) | 0 | data:1: CR line endings (house format is LF) |
| [five-thirty-eight-datasets](https://github.com/datasets/five-thirty-eight-datasets) | warn | frozen (inferred) | 0 | resource "datasets-ahca-polls-data-ahca_polls" has no `schema.fields` — column types aren't declared |
| [gdp-uk](https://github.com/datasets/gdp-uk) | warn | living (inferred), monthly | 0 | `description` is missing |
| [gdp-us](https://github.com/datasets/gdp-us) | warn | living (inferred), monthly | 0 | `description` is missing |
| [genome-sequencing-costs](https://github.com/datasets/genome-sequencing-costs) | warn | living (inferred), monthly | 0 | sequencing-costs:1: CR line endings (house format is LF) |
| [geo-admin1-us](https://github.com/datasets/geo-admin1-us) | warn | frozen (inferred) | 0 | resource "admin1-us" has a field that looks like an identifying column but no `schema.primaryKey` is set |
| [geo-boundaries-us-110m](https://github.com/datasets/geo-boundaries-us-110m) | warn | frozen (inferred) | 0 | no `sources` entry with an http(s) `path`: a clear primary source is required (standard rule 4) |
| [geo-boundaries-world-110m](https://github.com/datasets/geo-boundaries-world-110m) | warn | frozen (inferred) | 0 | no `sources` entry with an http(s) `path`: a clear primary source is required (standard rule 4) |
| [geo-countries](https://github.com/datasets/geo-countries) | warn | living (inferred), monthly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [geo-ne-admin1](https://github.com/datasets/geo-ne-admin1) | warn | living (inferred), monthly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [geo-nuts-administrative-boundaries](https://github.com/datasets/geo-nuts-administrative-boundaries) | warn | living (inferred), monthly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [geoip2-ipv4](https://github.com/datasets/geoip2-ipv4) | warn | frozen (inferred) | 0 | `description` is missing |
| [gini-index](https://github.com/datasets/gini-index) | warn | living (inferred), quarterly | 0 | 1 data value(s) don't match the schema; first: gini-index: header [Country Name, Country Code, Year, Value] does not match schema fields [Year, Value] (values n |
| [glacier-mass-balance](https://github.com/datasets/glacier-mass-balance) | warn | living (inferred), monthly | 0 | glaciers:1: CR line endings (house format is LF) |
| [global-temp](https://github.com/datasets/global-temp) | warn | living (inferred), monthly | 0 | monthly: Year has format "any", which this validator does not check |
| [global-temp-anomalies](https://github.com/datasets/global-temp-anomalies) | warn | frozen (inferred) | 0 | annual: Year has format "any", which this validator does not check |
| [gold-prices](https://github.com/datasets/gold-prices) | warn | living (inferred), daily | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [harmonized-system](https://github.com/datasets/harmonized-system) | warn | frozen (inferred) | 0 | 1 data value(s) don't match the schema; first: sections: file starts with a UTF-8 BOM (house format is UTF-8 without BOM) |
| [hepatitis](https://github.com/datasets/hepatitis) | warn | frozen (inferred) | 0 | `description` is missing |
| [historical-adoption-of-technology](https://github.com/datasets/historical-adoption-of-technology) | warn | frozen (inferred) | 0 | `description` is missing |
| [house-prices-fr](https://github.com/datasets/house-prices-fr) | warn | living (inferred), monthly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [house-prices-global](https://github.com/datasets/house-prices-global) | warn | living (inferred), quarterly | 0 | nominal-index:1: CR line endings (house format is LF) |
| [house-prices-uk](https://github.com/datasets/house-prices-uk) | warn | living (inferred), quarterly | 0 | `description` is missing |
| [house-prices-us](https://github.com/datasets/house-prices-us) | warn | living (inferred), monthly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [household-income-us-historical](https://github.com/datasets/household-income-us-historical) | warn | frozen (inferred) | 0 | 6 data value(s) don't match the schema; first: household-income-us-historical:3: Year = "2017 (40)" is not a 4-digit year |
| [ICC-Incoterms](https://github.com/datasets/ICC-Incoterms) | warn | frozen (inferred) | 0 | `name` "icc-incoterms" differs from the repo name "ICC-Incoterms" |
| [imf-weo](https://github.com/datasets/imf-weo) | warn | frozen (inferred) | 0 | `description` is missing |
| [IMO-IMDG-Codes](https://github.com/datasets/IMO-IMDG-Codes) | warn | frozen (inferred) | 0 | 2 data value(s) don't match the schema; first: data:6: division = " 1.5" is not a number |
| [inflation](https://github.com/datasets/inflation) | warn | living (inferred), quarterly | 0 | `description` is missing |
| [interest-rates-gb](https://github.com/datasets/interest-rates-gb) | warn | living (inferred), monthly | 0 | `description` is missing |
| [investor-flow-of-funds-us](https://github.com/datasets/investor-flow-of-funds-us) | warn | living (inferred), monthly | 0 | `description` is missing |
| [ISO-Container-Codes](https://github.com/datasets/ISO-Container-Codes) | warn | frozen (inferred) | 0 | iso-container-codes:1: CR line endings (house format is LF) |
| [land-matrix](https://github.com/datasets/land-matrix) | warn | living (inferred), monthly | 0 | 2 data value(s) don't match the schema; first: land-deals:100: quote character inside an unquoted field (not RFC 4180) |
| [lme-large-marine-ecosystems](https://github.com/datasets/lme-large-marine-ecosystems) | warn | frozen (inferred) | 0 | no `sources` entry with an http(s) `path`: a clear primary source is required (standard rule 4) |
| [london-air-quality](https://github.com/datasets/london-air-quality) | warn | frozen (inferred) | 0 | `description` is missing |
| [london-crime](https://github.com/datasets/london-crime) | warn | frozen (inferred) | 0 | `description` is missing |
| [london-gva](https://github.com/datasets/london-gva) | warn | living (inferred), monthly | 0 | `description` is missing |
| [london-life-expectancy](https://github.com/datasets/london-life-expectancy) | warn | living (inferred), monthly | 0 | `description` is missing |
| [london-median-housing-affordability](https://github.com/datasets/london-median-housing-affordability) | warn | living (inferred), monthly | 0 | `description` is missing |
| [london-transport](https://github.com/datasets/london-transport) | warn | living (inferred), monthly | 0 | london-public-transport:1: CR line endings (house format is LF) |
| [london-underground-report](https://github.com/datasets/london-underground-report) | warn | living (inferred), monthly | 0 | key-trends:1: CR line endings (house format is LF) |
| [london-unemployment](https://github.com/datasets/london-unemployment) | warn | living (inferred), monthly | 0 | unemployment-rate:1: CR line endings (house format is LF) |
| [lymph](https://github.com/datasets/lymph) | warn | frozen (inferred) | 0 | `description` is missing |
| [media-types](https://github.com/datasets/media-types) | warn | living (inferred), weekly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [membership-to-copyright-treaties](https://github.com/datasets/membership-to-copyright-treaties) | warn | living (inferred), monthly | 0 | `description` is missing |
| [nasdaq-listings](https://github.com/datasets/nasdaq-listings) | warn | living (inferred), monthly | 0 | nasdaq-listed:3100: Security Name has leading/trailing whitespace: "MDB Capital Holdings, LLC - Class A common " |
| [natural-gas](https://github.com/datasets/natural-gas) | warn | living (inferred), daily | 0 | monthly-processed:1: CR line endings (house format is LF) |
| [nyse-other-listings](https://github.com/datasets/nyse-other-listings) | warn | living (inferred), daily | 0 | nyse-listed:3: Company Name has leading/trailing whitespace: "Alcoa Corporation Common Stock " |
| [oil-prices](https://github.com/datasets/oil-prices) | warn | living (inferred), daily | 0 | brent-daily:1: CR line endings (house format is LF) |
| [openml-datasets](https://github.com/datasets/openml-datasets) | warn | frozen (inferred) | 0 | resource "abalone" has no `schema.fields` — column types aren't declared |
| [political_geography](https://github.com/datasets/political_geography) | warn | frozen (inferred) | 0 | `name` "political-geography" differs from the repo name "political_geography" |
| [population](https://github.com/datasets/population) | warn | living (inferred), quarterly | 0 | population:1: CR line endings (house format is LF) |
| [population-city](https://github.com/datasets/population-city) | warn | living (inferred), quarterly | 0 | 2 data value(s) don't match the schema; first: unsd-citypopulation-year-both-footnotes:27: text after a closing quote (not RFC 4180) |
| [population-global-historical](https://github.com/datasets/population-global-historical) | warn | living (inferred), monthly | 0 | `description` is missing |
| [population-reference-bureau](https://github.com/datasets/population-reference-bureau) | warn | living (inferred), monthly | 0 | 60 data value(s) don't match the schema; first: us-bachelors-degree:3: TimeFrame = "2006-2010" is not an integer |
| [primary-tumor](https://github.com/datasets/primary-tumor) | warn | living (inferred), monthly | 0 | `description` is missing |
| [race-and-ethnicity-codes-us](https://github.com/datasets/race-and-ethnicity-codes-us) | warn | frozen (inferred) | 0 | `name` "us-race-and-ethnicity-codes" differs from the repo name "race-and-ethnicity-codes-us" |
| [s-and-p-500](https://github.com/datasets/s-and-p-500) | warn | living (inferred), monthly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [s-and-p-500-companies-financials](https://github.com/datasets/s-and-p-500-companies-financials) | warn | living (inferred), daily | 0 | scatter-data:1: CR line endings (house format is LF) |
| [sea-level-rise](https://github.com/datasets/sea-level-rise) | warn | living (inferred), monthly | 0 | 2 data value(s) don't match the schema; first: csiro_alt_seas_inc:2: GMSL (smoothed) = "#N/A" is not a number |
| [seismic-bumps](https://github.com/datasets/seismic-bumps) | warn | living (inferred), monthly | 0 | `description` is missing |
| [smdg-master-terminal-facilities-list](https://github.com/datasets/smdg-master-terminal-facilities-list) | warn | living (inferred), quarterly | 0 | smdg-master-terminal-facilities-list:246: Terminal Website has leading/trailing whitespace: "https://www.impalaterminals.com/our-global-network/latin-america/co |
| [speed-dating](https://github.com/datasets/speed-dating) | warn | living (inferred), monthly | 0 | `description` is missing |
| [tic-tac-toe](https://github.com/datasets/tic-tac-toe) | warn | living (inferred), monthly | 0 | `description` is missing |
| [uk-sic-2007-condensed](https://github.com/datasets/uk-sic-2007-condensed) | warn | frozen (inferred) | 0 | `description` is missing |
| [un-locode](https://github.com/datasets/un-locode) | warn | living (inferred), monthly | 0 | country-codes:90: CountryName has leading/trailing whitespace: "Hong Kong " |
| [unece-package-codes](https://github.com/datasets/unece-package-codes) | warn | frozen (inferred) | 0 | data:12: Description has leading/trailing whitespace: "A type of plastic bag, typically used to wrap promotional pieces, publications, product samples, and/or c |
| [unece-units-of-measure](https://github.com/datasets/unece-units-of-measure) | warn | living (inferred), monthly | 0 | `description` is missing |
| [world-cities](https://github.com/datasets/world-cities) | warn | living (inferred), monthly | 0 | no `upkeep`: declare `{"mode": "frozen", "snapshot": "YYYY-MM-DD"}` or `{"mode": "living", "refresh": "<cadence>", "workflow": "<file>"}` (standard rule 6) |
| [world-wealth-and-income-database](https://github.com/datasets/world-wealth-and-income-database) | warn | frozen (inferred) | 0 | `description` is missing |
| [atlantic-hurricanes](https://github.com/datasets/atlantic-hurricanes) | pass | frozen | 0 |  |
| [extreme-poverty](https://github.com/datasets/extreme-poverty) | pass | frozen | 0 |  |
| [gdp-per-capita-long-run](https://github.com/datasets/gdp-per-capita-long-run) | pass | frozen | 0 |  |
| [orbital-launches](https://github.com/datasets/orbital-launches) | pass | frozen | 0 |  |
| [protein-structures](https://github.com/datasets/protein-structures) | pass | frozen | 0 |  |
| [us-drug-overdose-deaths](https://github.com/datasets/us-drug-overdose-deaths) | pass | living, monthly | 0 |  |
| [us-energy-consumption-by-source](https://github.com/datasets/us-energy-consumption-by-source) | pass | frozen | 0 |  |
| [us-measles-cases](https://github.com/datasets/us-measles-cases) | pass | living, weekly | 0 |  |
| [ai](https://github.com/datasets/ai) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [carbon-capture-cant-solve-climate-change](https://github.com/datasets/carbon-capture-cant-solve-climate-change) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [carbondoomsday](https://github.com/datasets/carbondoomsday) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [climate-and-environment](https://github.com/datasets/climate-and-environment) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [collective](https://github.com/datasets/collective) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [commons](https://github.com/datasets/commons) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [datacatalogs.org](https://github.com/datasets/datacatalogs.org) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [datapressr](https://github.com/datasets/datapressr) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [datasets.github.com](https://github.com/datasets/datasets.github.com) | skip | - | 0 | empty repository (no commits on the default branch) |
| [economic-history](https://github.com/datasets/economic-history) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [energy-and-commodities](https://github.com/datasets/energy-and-commodities) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [football-datasets](https://github.com/datasets/football-datasets) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [gcat-artificial-space-objects](https://github.com/datasets/gcat-artificial-space-objects) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [giveth](https://github.com/datasets/giveth) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [giving-data](https://github.com/datasets/giving-data) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [labs](https://github.com/datasets/labs) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [line-charts](https://github.com/datasets/line-charts) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [opented](https://github.com/datasets/opented) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [polls-us-presidential](https://github.com/datasets/polls-us-presidential) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [product-data](https://github.com/datasets/product-data) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [reference-staging](https://github.com/datasets/reference-staging) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [seshat](https://github.com/datasets/seshat) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [society-and-living-standards](https://github.com/datasets/society-and-living-standards) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [socrata-opendata](https://github.com/datasets/socrata-opendata) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [tables-bakeoff](https://github.com/datasets/tables-bakeoff) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [technology](https://github.com/datasets/technology) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
| [world-happiness-report](https://github.com/datasets/world-happiness-report) | skip | - | 0 | no datapackage.json (catalog, tooling or not a dataset yet) |
