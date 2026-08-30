// CO2 concentration at Mauna Loa (the Keeling Curve)
//
// Source:    NOAA Global Monitoring Laboratory — Trends in Atmospheric Carbon Dioxide
//            https://gml.noaa.gov/ccgg/trends/data.html
//            - monthly: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv
//            - annual:  https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.csv
// Retrieved: 2026-08-30  (archived under archive/)
// License:   NOAA GML data are "made freely available to the public" (US Government
//            work — public domain). The record is a joint NOAA / Scripps (C.D. Keeling)
//            effort; NOAA asks that users cite the data providers. Released here as
//            PDDL-1.0 with citation — see datapackage.json and README.
//
// Run:  node build.ts   (Node 22+, native TS, no build step, no dependencies)
//
// Output (deterministic, sorted):
//   data/co2-monthly-mlo.csv  one row per month, Mar 1958 onward
//   data/co2-annual-mlo.csv   one row per year, 1959 onward
//
// Note vs the community dataset at github.com/datasets/co2-ppm: that one is kept
// current by a shell script + GitHub Action, but NOAA restructured this CSV (added
// `sdev`/`unc`, renamed `interpolated`->`deseasonalized`) and the script did not
// follow — its published header still says `...,Trend,Number of Days` while the data
// rows now carry `ndays,sdev,unc`, so its last two columns are mislabelled. This
// build reads the *current* NOAA columns by name-independent position against a
// header we assert, and fails loudly if the shape changes. See README.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");
const DATA = join(HERE, "data");

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

/** Drop `#` comment lines and blank lines, return remaining rows split on comma. */
function readTable(file: string): string[][] {
  return readFileSync(join(ARCHIVE, file), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"))
    .map((l) => l.split(",").map((c) => c.trim()));
}

/** Parse a number, treating any of `sentinels` (NOAA "no information" markers) as missing. */
function num(raw: string, sentinels: number[] = []): number | undefined {
  if (raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`non-numeric value: ${JSON.stringify(raw)}`);
  return sentinels.includes(n) ? undefined : n;
}

function assertHeader(got: string[], want: string[], file: string): void {
  if (got.join(",") !== want.join(",")) {
    throw new Error(
      `${file}: unexpected header.\n  expected: ${want.join(",")}\n  got:      ${got.join(",")}\n` +
        `NOAA may have restructured the file — update build.ts deliberately, don't paper over it.`,
    );
  }
}

function buildMonthly(): Record<string, unknown>[] {
  const [header, ...rows] = readTable("co2_mm_mlo.csv");
  assertHeader(
    header,
    ["year", "month", "decimal date", "average", "deseasonalized", "ndays", "sdev", "unc"],
    "co2_mm_mlo.csv",
  );
  const out = rows.map((r) => {
    const [year, month, decimal, average, deseason, ndays, sdev, unc] = r;
    const mm = String(Number(month)).padStart(2, "0");
    return {
      date: `${year}-${mm}-01`,
      decimal_date: num(decimal),
      co2_ppm: num(average, [-99.99]),
      co2_ppm_deseasonalized: num(deseason, [-99.99]),
      num_days: num(ndays, [-1]),
      std_dev: num(sdev, [-9.99]),
      uncertainty: num(unc, [-0.99]),
    };
  });
  out.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return out;
}

function buildAnnual(): Record<string, unknown>[] {
  const [header, ...rows] = readTable("co2_annmean_mlo.csv");
  assertHeader(header, ["year", "mean", "unc"], "co2_annmean_mlo.csv");
  const out = rows.map((r) => {
    const [year, mean, unc] = r;
    return { year: Number(year), co2_ppm_mean: num(mean), uncertainty: num(unc) };
  });
  out.sort((a, b) => Number(a.year) - Number(b.year));
  return out;
}

function main(): void {
  const monthly = buildMonthly();
  const annual = buildAnnual();
  if (monthly.length < 800) throw new Error(`only ${monthly.length} monthly rows — expected ~820+`);
  if (annual.length < 60) throw new Error(`only ${annual.length} annual rows — expected ~65+`);

  writeFileSync(
    join(DATA, "co2-monthly-mlo.csv"),
    toCsv(monthly, [
      "date",
      "decimal_date",
      "co2_ppm",
      "co2_ppm_deseasonalized",
      "num_days",
      "std_dev",
      "uncertainty",
    ]),
  );
  writeFileSync(
    join(DATA, "co2-annual-mlo.csv"),
    toCsv(annual, ["year", "co2_ppm_mean", "uncertainty"]),
  );

  console.log(
    `wrote data/co2-monthly-mlo.csv (${monthly.length} rows, ${monthly[0].date} → ${monthly.at(-1)!.date}), ` +
      `data/co2-annual-mlo.csv (${annual.length} rows, ${annual[0].year} → ${annual.at(-1)!.year})`,
  );
}

main();
