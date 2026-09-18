// Airports with country, region and runway summary — joined from four OurAirports tables.
//
// Source:    OurAirports open data, https://ourairports.com/data/ (CSV mirror
//            https://davidmegginson.github.io/ourairports-data/), snapshotted by fetch.ts
//            into archive/ — see archive/manifest.json for URLs, Last-Modified and SHA-256.
// Retrieved: 2026-09-18 (files Last-Modified 2026-09-18 01:54:08 GMT)
// License:   Public domain — "All data is released to the Public Domain" (ourairports.com/data).
//
// Run:  npm install && node build.ts   (Node 22+, one dependency: csv-parse; no network)
//
// Output: data/airports.csv — one row per airport (86,094), sorted by id.
//
// The join, with the cardinality checked rather than assumed:
//   airports.iso_country  -> countries.code   many-to-one  (country_name)
//   airports.iso_region   -> regions.code     many-to-one  (region_name)
//   runways.airport_ref   -> airports.id      many-to-one, aggregated per airport
//                                             (runway_count, open_runway_count,
//                                              longest_open_runway_ft)
// Checks: the "one" side of every join is unique; every foreign key resolves (orphan
// policy: fail the build — a new orphan means the source changed and needs a look,
// not a silent blank); each region belongs to the airport's country; runway
// airport_ident agrees with the airport's ident; output row count = airports row count
// (no Cartesian expansion); output ids unique.
//
// Missing values: empty cells. "NA" is data here, not missing — continent NA = North
// America, iso_country NA = Namibia — so tools that read "NA" as missing by default
// (pandas, R) need that turned off.

import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");

type Row = Record<string, string>;

function fail(msg: string): never {
  throw new Error(`build.ts: ${msg}`);
}

/** Parse an archived CSV and assert its header is exactly what the build expects. */
export function readTable(text: string | Buffer, expected: string[]): Row[] {
  const rows: string[][] = parse(text, { bom: true });
  const [head, ...body] = rows;
  if (head.join(",") !== expected.join(",")) fail(`header changed:\n  got      ${head.join(",")}\n  expected ${expected.join(",")}`);
  return body.map((r, i) => {
    if (r.length !== head.length) fail(`row ${i + 2} has ${r.length} fields, expected ${head.length}`);
    return Object.fromEntries(head.map((h, j) => [h, r[j]]));
  });
}

/** Map key -> row, asserting the key is unique and never blank (the "one" side of a join). */
export function indexUnique(rows: Row[], key: string, table: string): Map<string, Row> {
  const m = new Map<string, Row>();
  for (const r of rows) {
    const k = r[key];
    if (k === "") fail(`${table}.${key} is blank`);
    if (m.has(k)) fail(`${table}.${key} not unique: ${k}`);
    m.set(k, r);
  }
  return m;
}

const INT = /^-?\d+$/;
const DEC = /^-?\d+(\.\d+)?$/;
const int = (v: string, what: string): number | null => (v === "" ? null : INT.test(v) ? Number(v) : fail(`${what}: not an integer: ${v}`));
const dec = (v: string, what: string): string | null => (v === "" ? null : DEC.test(v) ? v : fail(`${what}: not a number: ${v}`));
const flag01 = (v: string, what: string): boolean => (v === "1" ? true : v === "0" ? false : fail(`${what}: expected 0/1, got ${v}`));

export type RunwaySummary = { runway_count: number; open_runway_count: number; longest_open_runway_ft: number | null };

/** Aggregate runways per airport id. Closed runways count toward runway_count only.
 * A blank length is unknown, not zero, and is skipped for the maximum. */
export function summariseRunways(runways: Row[], airportsById: Map<string, Row>): Map<string, RunwaySummary> {
  const out = new Map<string, RunwaySummary>();
  for (const r of runways) {
    const a = airportsById.get(r.airport_ref) ?? fail(`runway ${r.id}: airport_ref ${r.airport_ref} not in airports`);
    if (a.ident !== r.airport_ident) fail(`runway ${r.id}: airport_ident ${r.airport_ident} != airports.ident ${a.ident}`);
    const s = out.get(r.airport_ref) ?? { runway_count: 0, open_runway_count: 0, longest_open_runway_ft: null };
    s.runway_count++;
    if (!flag01(r.closed, `runway ${r.id} closed`)) {
      s.open_runway_count++;
      const len = int(r.length_ft, `runway ${r.id} length_ft`);
      if (len !== null && (s.longest_open_runway_ft === null || len > s.longest_open_runway_ft)) s.longest_open_runway_ft = len;
    }
    out.set(r.airport_ref, s);
  }
  return out;
}

export const COLUMNS = [
  "id", "ident", "type", "name", "latitude_deg", "longitude_deg", "elevation_ft",
  "continent", "iso_country", "country_name", "iso_region", "region_name", "municipality",
  "scheduled_service", "icao_code", "iata_code", "gps_code", "local_code",
  "runway_count", "open_runway_count", "longest_open_runway_ft",
];

export function joinAirports(airports: Row[], countries: Row[], regions: Row[], runways: Row[]) {
  const byCountry = indexUnique(countries, "code", "countries");
  const byRegion = indexUnique(regions, "code", "regions");
  const byId = indexUnique(airports, "id", "airports");
  indexUnique(airports, "ident", "airports");
  const runwaysByAirport = summariseRunways(runways, byId);

  const out = airports.map((a) => {
    const c = byCountry.get(a.iso_country) ?? fail(`airport ${a.id}: iso_country ${a.iso_country} not in countries`);
    const r = byRegion.get(a.iso_region) ?? fail(`airport ${a.id}: iso_region ${a.iso_region} not in regions`);
    if (r.iso_country !== a.iso_country) fail(`airport ${a.id}: region ${a.iso_region} belongs to ${r.iso_country}, not ${a.iso_country}`);
    const rw = runwaysByAirport.get(a.id) ?? { runway_count: 0, open_runway_count: 0, longest_open_runway_ft: null };
    const sched = a.scheduled_service === "yes" ? true : a.scheduled_service === "no" ? false : fail(`airport ${a.id}: scheduled_service ${a.scheduled_service}`);
    return {
      id: int(a.id, "airports.id"),
      ident: a.ident,
      type: a.type,
      name: a.name,
      latitude_deg: dec(a.latitude_deg, `airport ${a.id} latitude_deg`),
      longitude_deg: dec(a.longitude_deg, `airport ${a.id} longitude_deg`),
      elevation_ft: int(a.elevation_ft, `airport ${a.id} elevation_ft`),
      continent: a.continent,
      iso_country: a.iso_country,
      country_name: c.name,
      iso_region: a.iso_region,
      region_name: r.name,
      municipality: a.municipality,
      scheduled_service: sched,
      icao_code: a.icao_code,
      iata_code: a.iata_code,
      gps_code: a.gps_code,
      local_code: a.local_code,
      ...rw,
    };
  });

  if (out.length !== airports.length) fail(`row count changed in join: ${airports.length} -> ${out.length}`);
  const runwayTotal = [...runwaysByAirport.values()].reduce((n, s) => n + s.runway_count, 0);
  if (runwayTotal !== runways.length) fail(`runways aggregated ${runwayTotal} != runways ${runways.length}`);
  return out.sort((x, y) => (x.id as number) - (y.id as number));
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

function main(): void {
  const read = (t: string) => readFileSync(join(ARCHIVE, `${t}.csv`));
  const airports = readTable(read("airports"), ["id", "ident", "type", "name", "latitude_deg", "longitude_deg", "elevation_ft", "continent", "iso_country", "iso_region", "municipality", "scheduled_service", "icao_code", "iata_code", "gps_code", "local_code", "home_link", "wikipedia_link", "keywords"]);
  const countries = readTable(read("countries"), ["id", "code", "name", "continent", "wikipedia_link", "keywords"]);
  const regions = readTable(read("regions"), ["id", "code", "local_code", "name", "continent", "iso_country", "wikipedia_link", "keywords"]);
  const runways = readTable(read("runways"), ["id", "airport_ref", "airport_ident", "length_ft", "width_ft", "surface", "lighted", "closed", "le_ident", "le_latitude_deg", "le_longitude_deg", "le_elevation_ft", "le_heading_degT", "le_displaced_threshold_ft", "he_ident", "he_latitude_deg", "he_longitude_deg", "he_elevation_ft", "he_heading_degT", "he_displaced_threshold_ft"]);
  const rows = joinAirports(airports, countries, regions, runways);
  writeFileSync(join(HERE, "data", "airports.csv"), toCsv(rows, COLUMNS));
  const withRunways = rows.filter((r) => r.runway_count > 0).length;
  console.log(`airports.csv: ${rows.length} rows (${withRunways} with runways; joined ${countries.length} countries, ${regions.length} regions, ${runways.length} runways)`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
