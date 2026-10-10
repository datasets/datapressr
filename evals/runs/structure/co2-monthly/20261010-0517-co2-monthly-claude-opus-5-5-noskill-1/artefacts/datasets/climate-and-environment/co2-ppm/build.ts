// Builds data/co2-mm-mlo.csv from the NOAA GML snapshot in archive/.
//
//   node build.ts
//
// Reads archive/co2_mm_mlo.csv and nothing else; no network, no dependencies.
// Numeric values are copied through as the source text (not parsed and
// re-printed), so the output is byte-identical on every run.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "archive", "co2_mm_mlo.csv");
const OUT = join(here, "data", "co2-mm-mlo.csv");

const SOURCE_HEADER = "year,month,decimal date,average,deseasonalized,ndays,sdev,unc";
const OUT_HEADER = [
  "date",
  "decimal_year",
  "co2_ppm",
  "co2_deseasonalized_ppm",
  "days_measured",
  "daily_sdev_ppm",
  "uncertainty_ppm",
];

// Source sentinels for "no value" (see the file's own header notes).
const NDAYS_MISSING = "-1";
const SDEV_MISSING = "-9.99";
const UNC_MISSING = "-0.99";

const DECIMAL = /^\d+\.\d+$/;
const fail = (line: number, msg: string): never => {
  throw new Error(`${SRC}:${line}: ${msg}`);
};

const lines = readFileSync(SRC, "utf8").split("\n");
if (lines.at(-1) === "") lines.pop();

let headerSeen = false;
let prev: number | null = null; // previous row as year * 12 + month - 1
const out: string[] = [OUT_HEADER.join(",")];

for (const [i, line] of lines.entries()) {
  const ln = i + 1;
  if (line.startsWith("#")) continue;
  if (!headerSeen) {
    if (line !== SOURCE_HEADER) fail(ln, `unexpected header ${JSON.stringify(line)}`);
    headerSeen = true;
    continue;
  }
  const cells = line.split(",");
  if (cells.length !== 8) fail(ln, `expected 8 cells, got ${cells.length}`);
  const [year, month, decimal, average, deseason, ndays, sdev, unc] = cells;

  if (!/^\d{4}$/.test(year)) fail(ln, `bad year ${year}`);
  if (!/^([1-9]|1[0-2])$/.test(month)) fail(ln, `bad month ${month}`);
  for (const [k, v] of [["decimal date", decimal], ["average", average], ["deseasonalized", deseason]]) {
    if (!DECIMAL.test(v)) fail(ln, `${k} ${JSON.stringify(v)} is not a positive decimal`);
  }

  // Rows must be one per month with no gaps or repeats.
  const key = Number(year) * 12 + Number(month) - 1;
  if (prev !== null && key !== prev + 1) fail(ln, `${year}-${month} does not follow the previous month`);
  prev = key;

  // ndays: -1 means no daily count (SIO era, or an interpolated NOAA month).
  let days = "";
  if (ndays !== NDAYS_MISSING) {
    if (!/^\d+$/.test(ndays)) fail(ln, `bad ndays ${ndays}`);
    days = ndays;
  }

  // sdev: -9.99 means not available.
  let sd = "";
  if (sdev !== SDEV_MISSING) {
    if (!DECIMAL.test(sdev)) fail(ln, `bad sdev ${sdev}`);
    sd = sdev;
  }

  // unc: -0.99 means not available. Two rows (1975-12, 1984-04) carry 0.00
  // alongside the -9.99 sdev sentinel; a zero uncertainty is not a measurement,
  // so it is treated as missing too. A 0.00 next to a real sdev would be a new
  // case and stops the build.
  let u = "";
  if (unc === "0.00" && sdev === SDEV_MISSING) {
    u = "";
  } else if (unc !== UNC_MISSING) {
    if (!DECIMAL.test(unc) || Number(unc) === 0) fail(ln, `bad unc ${unc}`);
    u = unc;
  }

  const date = `${year}-${month.padStart(2, "0")}`;
  out.push([date, decimal, average, deseason, days, sd, u].join(","));
}

if (!headerSeen) fail(lines.length, "no data header found");

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out.join("\n") + "\n");
console.log(`wrote ${out.length - 1} rows to ${OUT}`);
