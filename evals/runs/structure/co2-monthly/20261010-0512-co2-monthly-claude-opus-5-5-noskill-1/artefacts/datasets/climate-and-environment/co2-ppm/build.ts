// Builds data/co2-mm-mlo.csv from the raw NOAA GML snapshot archive/co2_mm_mlo.csv.
// Run: node build.ts   (no dependencies, no network)
//
// The source is a plain CSV behind a `#` comment preamble. Numbers are copied as
// the source wrote them (no float round-trip), so the output is byte-stable.
// Missing-value sentinels become empty cells; see DECISIONS.md for each rule.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "archive", "co2_mm_mlo.csv");
const OUT = join(here, "data", "co2-mm-mlo.csv");

const SOURCE_HEADER = "year,month,decimal date,average,deseasonalized,ndays,sdev,unc";
const OUT_HEADER = [
  "date",
  "decimal_date",
  "co2_ppm",
  "co2_deseasonalized_ppm",
  "days_measured",
  "daily_sdev_ppm",
  "monthly_mean_unc_ppm",
];

// The source marks "no value" with these negatives (file header: "indicated by
// negative stdev and uncertainty ... indicated by negative numbers").
const NDAYS_MISSING = "-1";
const SDEV_MISSING = "-9.99";
const UNC_MISSING = "-0.99";

const DECIMAL = /^\d+\.\d+$/;
const fail = (line: number, msg: string): never => {
  throw new Error(`archive/co2_mm_mlo.csv:${line}: ${msg}`);
};

const lines = readFileSync(SRC, "utf8").split("\n");
if (lines.at(-1) === "") lines.pop();

let headerSeen = false;
let prevIndex: number | null = null;
const out: string[] = [OUT_HEADER.join(",")];

for (const [i, line] of lines.entries()) {
  const ln = i + 1;
  if (line.includes("\r")) fail(ln, "unexpected CR");
  if (line.startsWith("#")) {
    if (headerSeen) fail(ln, "comment line after the column header");
    continue;
  }
  if (!headerSeen) {
    if (line !== SOURCE_HEADER) fail(ln, `unexpected column header: ${line}`);
    headerSeen = true;
    continue;
  }

  const cells = line.split(",");
  if (cells.length !== 8) fail(ln, `expected 8 cells, got ${cells.length}`);
  const [year, month, decimalDate, average, deseasonalized, ndays, sdev, unc] = cells;

  if (!/^\d{4}$/.test(year)) fail(ln, `bad year ${year}`);
  if (!/^(?:[1-9]|1[0-2])$/.test(month)) fail(ln, `bad month ${month}`);
  const index = Number(year) * 12 + Number(month) - 1;
  if (prevIndex !== null && index !== prevIndex + 1) fail(ln, "months are not consecutive");
  prevIndex = index;

  if (!DECIMAL.test(decimalDate) || Math.floor(Number(decimalDate)) !== Number(year)) {
    fail(ln, `bad decimal date ${decimalDate}`);
  }
  for (const v of [average, deseasonalized]) {
    if (!DECIMAL.test(v)) fail(ln, `CO2 value is not a positive decimal: ${v}`);
  }

  // Each statistic column is either its sentinel or a non-negative value.
  if (ndays !== NDAYS_MISSING && !/^\d+$/.test(ndays)) fail(ln, `bad ndays ${ndays}`);
  if (sdev !== SDEV_MISSING && !DECIMAL.test(sdev)) fail(ln, `bad sdev ${sdev}`);
  if (unc !== UNC_MISSING && !DECIMAL.test(unc)) fail(ln, `bad unc ${unc}`);

  const daysOut = ndays === NDAYS_MISSING ? "" : ndays;
  const sdevOut = sdev === SDEV_MISSING ? "" : sdev;
  // Two rows (1975-12, 1984-04) give unc as 0.00 next to a missing sdev. The
  // uncertainty is derived from the sdev, so 0.00 there is a placeholder, not a
  // measured zero: treat it as missing too.
  const uncOut = unc === UNC_MISSING || (sdev === SDEV_MISSING && Number(unc) === 0) ? "" : unc;

  out.push(
    [`${year}-${month.padStart(2, "0")}`, decimalDate, average, deseasonalized, daysOut, sdevOut, uncOut].join(","),
  );
}

if (!headerSeen) fail(lines.length, "no column header found");

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out.join("\n") + "\n");
console.log(`wrote ${out.length - 1} rows to data/co2-mm-mlo.csv`);
