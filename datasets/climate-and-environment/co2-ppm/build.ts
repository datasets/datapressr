// CO2 concentration at Mauna Loa (the Keeling Curve)
//
// Source:    NOAA Global Monitoring Laboratory — Trends in Atmospheric Carbon Dioxide
//            https://gml.noaa.gov/ccgg/trends/data.html
//            - MLO monthly:  https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv
//            - MLO annual:   https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.csv
//            - MLO growth:   https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_gr_mlo.csv
//            - global annual: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_gl.csv
//            - global growth: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_gr_gl.csv
// Retrieved: 2026-08-30 (MLO monthly + annual); 2026-09-05 (growth + global). Archived under archive/.
// License:   NOAA GML data are "made freely available to the public" (US Government
//            work — public domain). The record is a joint NOAA / Scripps (C.D. Keeling)
//            effort; NOAA asks that users cite the data providers. Released here as
//            PDDL-1.0 with citation — see datapackage.json and README.
//
// Run:  node build.ts   (Node 22+, native TS, no build step, no dependencies)
//
// Output (deterministic, sorted):
//   data/co2-monthly-mlo.csv    one row per month, Mar 1958 onward
//   data/co2-annual-mlo.csv     one row per year, 1959 onward
//   data/co2-annual-global.csv  global marine-boundary-layer annual mean, 1979 onward
//   data/co2-growth-annual.csv  annual growth (ppm/yr, Jan 1 -> Dec 31), MLO + global, 1959 onward
//   data/co2-growth-decadal.csv mean annual growth per decade, derived from co2-growth-annual
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

function buildAnnualGlobal(): Record<string, unknown>[] {
  const [header, ...rows] = readTable("co2_annmean_gl.csv");
  assertHeader(header, ["year", "mean", "unc"], "co2_annmean_gl.csv");
  const out = rows.map((r) => {
    const [year, mean, unc] = r;
    return { year: Number(year), co2_ppm_mean: num(mean), uncertainty: num(unc) };
  });
  out.sort((a, b) => Number(a.year) - Number(b.year));
  return out;
}

/** Annual CO2 mole-fraction increase (ppm, Jan 1 -> Dec 31) as published by NOAA,
 *  merged year-by-year for Mauna Loa and the global network. NOAA computes this from
 *  monthly data, not by differencing annual means — so it's their number, not ours. */
function buildGrowthAnnual(): Record<string, unknown>[] {
  const read = (file: string) => {
    const [header, ...rows] = readTable(file);
    assertHeader(header, ["year", "ann inc", "unc"], file);
    return new Map(
      rows.map((r) => [Number(r[0]), { inc: num(r[1]), unc: num(r[2]) }] as const),
    );
  };
  const mlo = read("co2_gr_mlo.csv");
  const gl = read("co2_gr_gl.csv");
  const years = [...new Set([...mlo.keys(), ...gl.keys()])].sort((a, b) => a - b);
  return years.map((year) => ({
    year,
    mlo_ppm_per_year: mlo.get(year)?.inc,
    mlo_uncertainty: mlo.get(year)?.unc,
    global_ppm_per_year: gl.get(year)?.inc,
    global_uncertainty: gl.get(year)?.unc,
  }));
}

/** Mean annual growth per decade, derived from co2-growth-annual. The most recent
 *  decade is partial — `n_years` says how many years it averages over. */
function buildGrowthDecadal(growth: Record<string, unknown>[]): Record<string, unknown>[] {
  const decades = new Map<number, { mlo: number[]; gl: number[] }>();
  for (const r of growth) {
    const d = Math.floor(Number(r.year) / 10) * 10;
    if (!decades.has(d)) decades.set(d, { mlo: [], gl: [] });
    const bucket = decades.get(d)!;
    if (typeof r.mlo_ppm_per_year === "number") bucket.mlo.push(r.mlo_ppm_per_year);
    if (typeof r.global_ppm_per_year === "number") bucket.gl.push(r.global_ppm_per_year);
  }
  const mean = (xs: number[]): number | undefined =>
    xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : undefined;
  return [...decades.keys()]
    .sort((a, b) => a - b)
    .map((d) => {
      const b = decades.get(d)!;
      return {
        decade: `${d}s`,
        mlo_mean_ppm_per_year: mean(b.mlo),
        global_mean_ppm_per_year: mean(b.gl),
        n_years: Math.max(b.mlo.length, b.gl.length),
      };
    });
}

function main(): void {
  const monthly = buildMonthly();
  const annual = buildAnnual();
  const annualGlobal = buildAnnualGlobal();
  const growthAnnual = buildGrowthAnnual();
  const growthDecadal = buildGrowthDecadal(growthAnnual);
  if (monthly.length < 800) throw new Error(`only ${monthly.length} monthly rows — expected ~820+`);
  if (annual.length < 60) throw new Error(`only ${annual.length} annual rows — expected ~65+`);
  if (annualGlobal.length < 40) throw new Error(`only ${annualGlobal.length} global annual rows — expected ~47+`);
  if (growthAnnual.length < 60) throw new Error(`only ${growthAnnual.length} growth rows — expected ~67+`);

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
  writeFileSync(
    join(DATA, "co2-annual-global.csv"),
    toCsv(annualGlobal, ["year", "co2_ppm_mean", "uncertainty"]),
  );
  writeFileSync(
    join(DATA, "co2-growth-annual.csv"),
    toCsv(growthAnnual, [
      "year",
      "mlo_ppm_per_year",
      "mlo_uncertainty",
      "global_ppm_per_year",
      "global_uncertainty",
    ]),
  );
  writeFileSync(
    join(DATA, "co2-growth-decadal.csv"),
    toCsv(growthDecadal, [
      "decade",
      "mlo_mean_ppm_per_year",
      "global_mean_ppm_per_year",
      "n_years",
    ]),
  );

  console.log(
    `wrote data/co2-monthly-mlo.csv (${monthly.length} rows, ${monthly[0].date} → ${monthly.at(-1)!.date}), ` +
      `data/co2-annual-mlo.csv (${annual.length} rows, ${annual[0].year} → ${annual.at(-1)!.year}), ` +
      `data/co2-annual-global.csv (${annualGlobal.length} rows, ${annualGlobal[0].year} → ${annualGlobal.at(-1)!.year}), ` +
      `data/co2-growth-annual.csv (${growthAnnual.length} rows), ` +
      `data/co2-growth-decadal.csv (${growthDecadal.length} rows)`,
  );
}

main();
