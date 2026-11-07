// Global electricity generation mix, annual (World aggregate)
//
// Source:    Our World in Data, Energy dataset (compiles Ember's Yearly Electricity
//            Data, the Energy Institute's Statistical Review of World Energy, and
//            others) — https://github.com/owid/energy-data
//            Raw file: https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv
// Retrieved: 2026-11-02. Archived under archive/ (full multi-country file, as published).
// License:   CC BY 4.0 — "All visualizations, data, and code produced by Our World
//            in Data are completely open access under the Creative Commons BY
//            license." See datapackage.json and README.
//
// Run:  node build.ts   (Node 22+, native TS, no build step, no dependencies)
//       node build.ts --refresh   (re-fetch the source before building)
//
// Output (deterministic, sorted by year):
//   data/global-electricity-mix.csv   one row per year, World total, 1985 -> latest

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE_PATH = join(HERE, "archive", "owid-energy-data.csv");
const DATA_DIR = join(HERE, "data");
const SRC_URL = "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv";

async function fetchAndArchive(): Promise<void> {
  const res = await fetch(SRC_URL, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const text = await res.text();
  writeFileSync(ARCHIVE_PATH, text);
}

/** RFC 4180 CSV writer — quotes any field containing comma, quote, CR or LF. */
function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown): string => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n") + "\n";
}

// Source has no quoted fields anywhere (verified against the full 2026-11-02
// snapshot) and is comma-delimited, so a plain split is safe here.
function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const lines = text.split("\n").filter((l) => l.length > 0);
  const header = lines[0].split(",");
  const rows = lines.slice(1).map((l) => l.split(","));
  return { header, rows };
}

const EXPECTED_HEADER_PREFIX = ["country", "year", "iso_code", "population", "gdp"];

const SOURCE_COLUMNS = [
  "year",
  "electricity_generation",
  "solar_electricity",
  "solar_share_elec",
  "wind_electricity",
  "wind_share_elec",
  "renewables_electricity",
  "renewables_share_elec",
  "low_carbon_share_elec",
  "fossil_share_elec",
] as const;

const OUTPUT_COLUMNS = [
  "year",
  "electricity_generation_twh",
  "solar_electricity_twh",
  "solar_share_elec_pct",
  "wind_electricity_twh",
  "wind_share_elec_pct",
  "renewables_electricity_twh",
  "renewables_share_elec_pct",
  "low_carbon_share_elec_pct",
  "fossil_share_elec_pct",
];

async function main(): Promise<void> {
  if (process.argv.includes("--refresh") || !existsSync(ARCHIVE_PATH)) {
    await fetchAndArchive();
  }

  const text = readFileSync(ARCHIVE_PATH, "utf8");
  const { header, rows } = parseCsv(text);

  for (let i = 0; i < EXPECTED_HEADER_PREFIX.length; i++) {
    if (header[i] !== EXPECTED_HEADER_PREFIX[i]) {
      throw new Error(
        `unexpected source header at column ${i}: got "${header[i]}", expected "${EXPECTED_HEADER_PREFIX[i]}"`,
      );
    }
  }
  for (const col of SOURCE_COLUMNS) {
    if (!header.includes(col)) throw new Error(`source column missing: ${col}`);
  }

  const idx = (name: string) => header.indexOf(name);
  const countryIdx = idx("country");

  const worldRows = rows.filter((r) => r[countryIdx] === "World");
  if (worldRows.length === 0) throw new Error("no World rows found in source");

  const out: Record<string, unknown>[] = [];
  for (const r of worldRows) {
    const elecGen = r[idx("electricity_generation")];
    if (elecGen === "" || elecGen === undefined) continue; // no generation data this year
    const row: Record<string, unknown> = { year: Number(r[idx("year")]) };
    for (const col of SOURCE_COLUMNS) {
      if (col === "year") continue;
      const v = r[idx(col)];
      row[col] = v === "" || v === undefined ? "" : Number(v);
    }
    out.push({
      year: row.year,
      electricity_generation_twh: row.electricity_generation,
      solar_electricity_twh: row.solar_electricity,
      solar_share_elec_pct: row.solar_share_elec,
      wind_electricity_twh: row.wind_electricity,
      wind_share_elec_pct: row.wind_share_elec,
      renewables_electricity_twh: row.renewables_electricity,
      renewables_share_elec_pct: row.renewables_share_elec,
      low_carbon_share_elec_pct: row.low_carbon_share_elec,
      fossil_share_elec_pct: row.fossil_share_elec,
    });
  }

  out.sort((a, b) => (a.year as number) - (b.year as number));

  // Assert: one row per year, no gaps, no duplicates — this is a World
  // aggregate time series, so both would indicate an upstream change.
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1].year as number;
    const cur = out[i].year as number;
    if (cur !== prev + 1) throw new Error(`year gap or duplicate: ${prev} -> ${cur}`);
  }

  writeFileSync(join(DATA_DIR, "global-electricity-mix.csv"), toCsv(out, OUTPUT_COLUMNS));
  console.log(`wrote ${out.length} rows, ${out[0].year}-${out[out.length - 1].year}`);
}

main();
