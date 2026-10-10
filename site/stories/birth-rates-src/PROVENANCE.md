# Source snapshot — birth-rates story

Retrieved **10 October 2026** by [`fetch.mjs`](fetch.mjs) (`cd site/stories && npm ci && node birth-rates-src/fetch.mjs`). These are small extracts, not a DataPressr dataset: no `datapackage.json`, no `build.ts`.

## UN World Population Prospects 2024

- **Publisher:** United Nations, Department of Economic and Social Affairs, Population Division (2024). *World Population Prospects 2024*, Online Edition.
- **File:** `WPP2024_Demographic_Indicators_Medium.csv.gz` (demographic indicators, medium variant, 1950–2100), from <https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_Demographic_Indicators_Medium.csv.gz>, listed on <https://population.un.org/wpp/downloads>.
- **SHA-256 of the download:** `286ac36bb1415e2e1ade03acfef0a29f0e4c087e2f78e38c48f50c5df89082bc` (16,557,272 bytes). `fetch.mjs` refuses to write extracts if this changes. The raw file is not committed (size).
- **Licence:** Creative Commons Attribution 3.0 IGO (CC BY 3.0 IGO), <https://creativecommons.org/licenses/by/3.0/igo/>, as stated in the WPP 2024 publications (e.g. the Summary of Results' copyright page: "can be reproduced without prior permission under a Creative Commons license (CC BY 3.0 IGO)").
- **Extracts (1950–2023 only; 2024 onwards in this file are projections and are dropped):**

| File | Rows | Columns | SHA-256 |
|------|------|---------|---------|
| `wpp2024-countries.csv` | 17,538 (237 countries and areas × 74 years) | `iso3`, `location`, `year`, `tfr` (births per woman), `population_thousands` (1 July) | `c1b78fed93f2fcc877c4d656b4bd205668a9d1ad6b294e8f1f5354eed775e255` |
| `wpp2024-regions.csv` | 666 (World + 8 SDG regions × 74 years) | `location`, `year`, `tfr`, `births_thousands`, `population_thousands` | `f98973d4bbbc1cebf4eb37a58c6c02e2147bbf389c35309847e91c1d4620de52` |

Values are copied as published (no rounding).

## World Bank World Development Indicators (cross-check only, not charted)

- **Indicator:** `SP.DYN.TFRT.IN`, Fertility rate, total (births per woman), via the API <https://api.worldbank.org/v2/country/KOR;CHN;CHL;FIN;SWE;NOR;IND;USA;FRA;GBR;ITA;JPN;BRA;MEX;DEU;HUN;SSF;WLD/indicator/SP.DYN.TFRT.IN?format=json&per_page=1000&date=2010:2024>. The API reported the series last updated 2026-10-08. WDI's sources for this indicator are UN WPP plus national statistical offices and Eurostat.
- **Licence:** Creative Commons Attribution 4.0 (CC BY 4.0), <https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets>.
- **Extract:** `worldbank-tfr-check.csv` (54 rows: 18 places × 2010, 2023, 2024; `iso3`, `country`, `year`, `tfr` rounded to 3 decimals), SHA-256 `d448277c4818228637c489b3e294295a79047e09b2f20cf1eaaf93a49dac6a16`. Not hash-checked on re-fetch: WDI revises in place, so a later run may differ.

## Context documents cited, not snapshotted

- UN DESA Population Division, *World Population Prospects 2024: Summary of Results*, <https://population.un.org/wpp/assets/Files/WPP2024_Summary-of-Results.pdf> (Box 2.2; key messages).
- Kearney, Levine and Pardue (2022), "The Puzzle of Falling US Birth Rates since the Great Recession", *Journal of Economic Perspectives* 36(1), <https://www.aeaweb.org/articles?id=10.1257/jep.36.1.151>.
- Hellstrand, Nisén, Miranda, Fallesen, Dommermuth and Myrskylä (2021), "Not Just Later, but Fewer: Novel Trends in Cohort Fertility in the Nordic Countries", *Demography* 58(4), <https://doi.org/10.1215/00703370-9373618>.
