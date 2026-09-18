// Population growth (annual %) — World Bank WDI indicator SP.POP.GROW
//
// Source:    World Bank Indicators API v2 (no key), snapshotted by fetch.ts into archive/
//            — see archive/manifest.json for every URL, retrieval time and SHA-256.
// Retrieved: 2026-09-18 (WDI lastupdated 2026-07-13)
// License:   CC BY 4.0 — World Development Indicators, World Bank Data Catalog dataset 0037712.
//
// Run:  node build.ts   (Node 22+, native TS, no dependencies, no network)
//
// Output (deterministic, sorted by country_code then year):
//   data/population-growth.csv  one row per entity + year, 1960 onward
//   data/countries.csv          one row per World Bank entity (countries and aggregates)
//
// Shape decisions, all asserted below rather than assumed:
// - The API's `countryiso3code` is EMPTY for the five income-group aggregates (High
//   income, Low income, ...), so iso3 + year is not a key. `country.id` is the entity's
//   2-letter `iso2Code`; we map it to the 3-letter World Bank id via countries.json
//   (e.g. XD -> HIC). The mapping must be one-to-one and cover every observation.
// - `value: null` means no estimate -> empty cell. 0 is a real value and is kept.
// - `unit`, `obs_status` and `decimal` are constant in this indicator ("", "", 1);
//   we assert that and drop them rather than publish three constant columns.
// - Aggregates (regions, income groups, "World") are flagged with is_aggregate so
//   nobody sums them with countries. The API gives aggregates a placeholder region
//   {id: "NA", value: "Aggregates"} — "NA" is also Namibia's iso2 code — and the same
//   placeholder for income level and lending type, so for aggregates region_*,
//   income_level_* and lending_type_* are left empty.
// - Metadata names carry trailing spaces ("Sub-Saharan Africa "); trimmed.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");
const INDICATOR = "SP.POP.GROW";

type Ref = { id: string; iso2code?: string; value: string };
type Obs = { indicator: Ref; country: Ref; countryiso3code: string; date: string; value: number | null; unit: string; obs_status: string; decimal: number };
type Country = { id: string; iso2Code: string; name: string; region: Ref; incomeLevel: Ref; lendingType: Ref; capitalCity: string; longitude: string; latitude: string };

function fail(msg: string): never {
  throw new Error(`build.ts: ${msg}`);
}

/** RFC 4180 CSV, LF endings, trailing newline (toCsv idiom from scripts/wrangling-idioms.mjs). */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n") + "\n";
}

export function loadObservations(archive: string): Obs[] {
  const manifest = JSON.parse(readFileSync(join(archive, "manifest.json"), "utf8"));
  const files = readdirSync(join(archive, "observations")).filter((f) => f.endsWith(".json")).sort();
  if (files.length !== manifest.pages) fail(`manifest says ${manifest.pages} pages, archive has ${files.length}`);
  const rows: Obs[] = [];
  files.forEach((f, i) => {
    const [meta, data] = JSON.parse(readFileSync(join(archive, "observations", f), "utf8"));
    if (Number(meta.page) !== i + 1) fail(`${f} is page ${meta.page}, expected ${i + 1}`);
    if (Number(meta.total) !== manifest.total || meta.lastupdated !== manifest.lastupdated) fail(`${f} is from a different snapshot`);
    rows.push(...data);
  });
  if (rows.length !== manifest.total) fail(`${rows.length} rows, API total ${manifest.total}`);
  return rows;
}

export function buildCountries(countries: Country[]) {
  const out = countries.map((c) => {
    const agg = c.region.value.trim() === "Aggregates";
    const num = (s: string) => (s.trim() === "" ? null : Number(s));
    return {
      country_code: c.id,
      iso2_code: c.iso2Code,
      country_name: c.name.trim(),
      is_aggregate: agg,
      region_code: agg ? null : c.region.id || null,
      region_name: agg ? null : c.region.value.trim() || null,
      income_level_code: agg ? null : c.incomeLevel.id || null,
      income_level_name: agg ? null : c.incomeLevel.value.trim() || null,
      lending_type_code: agg ? null : c.lendingType.id || null,
      lending_type_name: agg ? null : c.lendingType.value.trim() || null,
      capital_city: c.capitalCity.trim() || null,
      longitude: num(c.longitude),
      latitude: num(c.latitude),
    };
  });
  const ids = new Set(out.map((c) => c.country_code));
  if (ids.size !== out.length) fail("duplicate country id in countries.json");
  const iso2 = new Set(out.map((c) => c.iso2_code));
  if (iso2.size !== out.length) fail("duplicate iso2Code in countries.json");
  return out.sort((a, b) => (a.country_code < b.country_code ? -1 : 1));
}

export function buildObservations(obs: Obs[], countries: ReturnType<typeof buildCountries>) {
  const byIso2 = new Map(countries.map((c) => [c.iso2_code, c]));
  const seen = new Set<string>();
  const out = obs.map((o) => {
    if (o.indicator.id !== INDICATOR) fail(`unexpected indicator ${o.indicator.id}`);
    if (o.unit !== "" || o.obs_status !== "" || o.decimal !== 1) fail(`non-constant unit/obs_status/decimal: ${JSON.stringify(o)}`);
    if (!/^\d{4}$/.test(o.date)) fail(`non-annual date ${o.date}`);
    if (o.value !== null && !Number.isFinite(o.value)) fail(`non-numeric value ${o.value}`);
    const c = byIso2.get(o.country.id) ?? fail(`observation entity ${o.country.id} not in countries.json`);
    if (o.countryiso3code !== "" && o.countryiso3code !== c.country_code) fail(`iso3 ${o.countryiso3code} != ${c.country_code}`);
    const key = `${c.country_code}|${o.date}`;
    if (seen.has(key)) fail(`duplicate key ${key}`);
    seen.add(key);
    return {
      country_code: c.country_code,
      country_name: c.country_name,
      is_aggregate: c.is_aggregate,
      year: o.date,
      population_growth_pct: o.value, // null -> empty cell; 0 stays 0
    };
  });
  return out.sort((a, b) => (a.country_code < b.country_code ? -1 : a.country_code > b.country_code ? 1 : a.year < b.year ? -1 : a.year > b.year ? 1 : 0));
}

function main(): void {
  const obs = loadObservations(ARCHIVE);
  const [, countriesRaw] = JSON.parse(readFileSync(join(ARCHIVE, "countries.json"), "utf8"));
  const countries = buildCountries(countriesRaw);
  const rows = buildObservations(obs, countries);
  writeFileSync(join(HERE, "data", "population-growth.csv"), toCsv(rows, ["country_code", "country_name", "is_aggregate", "year", "population_growth_pct"]));
  writeFileSync(
    join(HERE, "data", "countries.csv"),
    toCsv(countries, ["country_code", "iso2_code", "country_name", "is_aggregate", "region_code", "region_name", "income_level_code", "income_level_name", "lending_type_code", "lending_type_name", "capital_city", "longitude", "latitude"]),
  );
  const missing = rows.filter((r) => r.population_growth_pct === null).length;
  console.log(`population-growth.csv: ${rows.length} rows (${missing} empty), countries.csv: ${countries.length} rows`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
