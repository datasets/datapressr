// Builds data/co2-mm-mlo.csv from the raw NOAA GML snapshot archive/co2_mm_mlo.csv.
// Run from this directory: `node build.ts` (no dependencies, no network).
//
// The source is a plain CSV behind a `#` comment preamble. The transform:
// - drops the preamble, checks the header and that every row is well formed;
// - turns year + month into an ISO 8601 year-month (`YYYY-MM`);
// - replaces NOAA's "no value" sentinels with empty cells: negative ndays
//   (-1), negative sdev (-9.99), and an uncertainty that is negative (-0.99) or
//   zero (0.00, in two rows where sdev is also -9.99);
// - copies every other value verbatim as text, so numbers are not reformatted.
// It stops with an error on anything it doesn't expect rather than guess.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "archive/co2_mm_mlo.csv";
const OUT = "data/co2-mm-mlo.csv";
const SRC_HEADER = "year,month,decimal date,average,deseasonalized,ndays,sdev,unc";
const OUT_HEADER = [
  "date",
  "decimal_date",
  "co2_ppm",
  "co2_deseasonalized_ppm",
  "days_measured",
  "daily_std_dev_ppm",
  "uncertainty_ppm",
];

const fail = (msg: string): never => {
  throw new Error(`${SRC}: ${msg}`);
};

const text = readFileSync(SRC, "utf8");
if (text.includes("\r")) fail("unexpected CR line endings");
const lines = text.split("\n");
if (lines.at(-1) === "") lines.pop();

let i = 0;
while (i < lines.length && lines[i].startsWith("#")) i++;
if (lines[i] !== SRC_HEADER) fail(`line ${i + 1}: expected header "${SRC_HEADER}", got "${lines[i]}"`);

const ROW_RE = /^(\d{4}),(\d{1,2}),(\d{4}\.\d+),(\d+\.\d+),(\d+\.\d+),(-?\d+),(-?\d+\.\d+),(-?\d+\.\d+)$/;
const out = [OUT_HEADER.join(",")];
let prev: number | null = null;
for (const [n, line] of lines.slice(i + 1).entries()) {
  const lineNo = i + 2 + n;
  const m = ROW_RE.exec(line);
  if (!m) fail(`line ${lineNo}: unexpected row "${line}"`);
  const [, year, month, decimalDate, average, deseasonalized, ndays, sdev, unc] = m!;
  const mo = Number(month);
  if (mo < 1 || mo > 12) fail(`line ${lineNo}: month ${month} out of range`);
  const index = Number(year) * 12 + mo - 1;
  if (prev !== null && index !== prev + 1) fail(`line ${lineNo}: ${year}-${month} does not follow the previous month`);
  prev = index;

  out.push(
    [
      `${year}-${month.padStart(2, "0")}`,
      decimalDate,
      average,
      deseasonalized,
      Number(ndays) < 0 ? "" : ndays,
      Number(sdev) < 0 ? "" : sdev,
      Number(unc) <= 0 ? "" : unc,
    ].join(","),
  );
}
if (out.length === 1) fail("no data rows");

mkdirSync("data", { recursive: true });
writeFileSync(OUT, out.join("\n") + "\n");
console.log(`wrote ${OUT}: ${out.length - 1} rows`);
