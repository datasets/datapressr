// Snapshot the source data for the "birth-rates" story.
//   cd site/stories && npm ci && node birth-rates-src/fetch.mjs
//
// Downloads UN World Population Prospects 2024 (medium variant, demographic
// indicators, one gzipped CSV of ~16 MB), checks its SHA-256 against the one
// recorded in PROVENANCE.md, and writes two small extracts next to this file:
//
//   wpp2024-countries.csv  one row per country/area and year, 1950-2023:
//                          iso3, location, year, tfr, population_thousands
//   wpp2024-regions.csv    World and the eight SDG regions, 1950-2023:
//                          location, year, tfr, births_thousands, population_thousands
//
// It also writes a small World Bank WDI cross-check (worldbank-tfr-check.csv).
// Only 1950-2023 is kept: in WPP 2024, 2024 onwards are projections.
// The raw download is not committed (size); re-running reproduces the extracts.

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { csvParse, csvFormat } from "d3-dsv";

const HERE = dirname(fileURLToPath(import.meta.url));
const WPP_URL =
  "https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_Demographic_Indicators_Medium.csv.gz";
const WPP_SHA256 = "286ac36bb1415e2e1ade03acfef0a29f0e4c087e2f78e38c48f50c5df89082bc";
const WB_URL =
  "https://api.worldbank.org/v2/country/KOR;CHN;CHL;FIN;SWE;NOR;IND;USA;FRA;GBR;ITA;JPN;BRA;MEX;DEU;HUN;SSF;WLD/indicator/SP.DYN.TFRT.IN?format=json&per_page=1000&date=2010:2024";
const LAST_ESTIMATE_YEAR = 2023;
const SDG_REGIONS = [
  "Sub-Saharan Africa",
  "Northern Africa and Western Asia",
  "Central and Southern Asia",
  "Eastern and South-Eastern Asia",
  "Latin America and the Caribbean",
  "Australia/New Zealand",
  "Oceania (excluding Australia and New Zealand)",
  "Europe and Northern America",
];

const res = await fetch(WPP_URL);
if (!res.ok) throw new Error(`WPP download failed: ${res.status}`);
const gz = Buffer.from(await res.arrayBuffer());
const sha = createHash("sha256").update(gz).digest("hex");
if (sha !== WPP_SHA256) throw new Error(`WPP file changed upstream: sha256 ${sha}`);
const rows = csvParse(gunzipSync(gz).toString("utf8").replace(/^\uFEFF/, "")).filter(
  (r) => r.Variant === "Medium" && Number(r.Time) <= LAST_ESTIMATE_YEAR,
);

const countries = rows
  .filter((r) => r.LocTypeName === "Country/Area")
  .map((r) => ({ iso3: r.ISO3_code, location: r.Location, year: r.Time, tfr: r.TFR, population_thousands: r.TPopulation1July }))
  .sort((a, b) => a.iso3.localeCompare(b.iso3) || a.year - b.year);
const regionOrder = ["World", ...SDG_REGIONS];
const regions = rows
  .filter((r) => (r.LocTypeName === "World" || r.LocTypeName === "SDG region") && regionOrder.includes(r.Location))
  .map((r) => ({ location: r.Location, year: r.Time, tfr: r.TFR, births_thousands: r.Births, population_thousands: r.TPopulation1July }))
  .sort((a, b) => regionOrder.indexOf(a.location) - regionOrder.indexOf(b.location) || a.year - b.year);
if (new Set(countries.map((r) => r.iso3)).size !== 237) throw new Error("expected 237 countries/areas");
if (regions.length !== regionOrder.length * (LAST_ESTIMATE_YEAR - 1950 + 1)) throw new Error("region rows missing");

writeFileSync(join(HERE, "wpp2024-countries.csv"), csvFormat(countries) + "\n");
writeFileSync(join(HERE, "wpp2024-regions.csv"), csvFormat(regions) + "\n");

// World Bank WDI cross-check (not charted): a few countries, 2010 and 2023-2024.
const wb = await (await fetch(WB_URL)).json();
const check = wb[1]
  .filter((r) => ["2010", "2023", "2024"].includes(r.date))
  .map((r) => ({ iso3: r.countryiso3code, country: r.country.value, year: r.date, tfr: r.value == null ? "" : r.value.toFixed(3) }))
  .sort((a, b) => a.iso3.localeCompare(b.iso3) || a.year - b.year);
writeFileSync(join(HERE, "worldbank-tfr-check.csv"), csvFormat(check) + "\n");

console.log(`wpp sha256 ${sha}; wrote ${countries.length} country rows, ${regions.length} region rows, ${check.length} World Bank rows`);
