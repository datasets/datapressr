// Builds data/co2-mm-mlo.csv from the raw NOAA GML snapshot archive/co2_mm_mlo.csv.
// Run from anywhere: `node build.ts`. No dependencies, no network.
//
// Numbers are copied through as the source's own strings (never parsed and
// re-printed), so the output keeps NOAA's precision and is byte-stable.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "archive", "co2_mm_mlo.csv");
const OUT = join(here, "data", "co2-mm-mlo.csv");

const SRC_HEADER = "year,month,decimal date,average,deseasonalized,ndays,sdev,unc";
const ROW_RE = /^(\d{4}),(\d{1,2}),(\d{4}\.\d{4}),(\d+\.\d{2}),(\d+\.\d{2}),(-?\d+),(-?\d+\.\d{2}),(-?\d+\.\d{2})$/;

// From the file's header notes: March 1958 – April 1974 is Scripps (SIO) data;
// Mauna Loa was shut by the eruption from 29 Nov 2022 and measurements came from
// Maunakea from December 2022 to 4 July 2023, after which Mauna Loa resumed.
const LAST_SIO_MONTH = "1974-04";
const MAUNAKEA_FROM = "2022-12";
const MAUNAKEA_TO = "2023-06"; // last full month at Maunakea
const MIXED_MONTH = "2023-07"; // Maunakea to 4 July, Mauna Loa after

const fail = (msg: string): never => {
  throw new Error(`build.ts: ${msg}`);
};

const lines = readFileSync(SRC, "utf8").split("\n");
if (lines.at(-1) === "") lines.pop();
const body = lines.filter((l) => !l.startsWith("#"));
if (body[0] !== SRC_HEADER) fail(`unexpected header: ${body[0]}`);

const out = [
  "date,decimal_date,co2_ppm,co2_deseasonalized_ppm,days_measured,daily_sdev_ppm,uncertainty_ppm,interpolated,provider,site",
];
let prev: number | null = null;
for (const line of body.slice(1)) {
  const m = ROW_RE.exec(line) ?? fail(`unexpected row: ${line}`);
  const [, year, month, decimal, average, deseasonalized, ndays, sdev, unc] = m;
  const mm = Number(month);
  if (mm < 1 || mm > 12) fail(`bad month: ${line}`);
  const index = Number(year) * 12 + mm;
  if (prev !== null && index !== prev + 1) fail(`months not contiguous at ${line}`);
  prev = index;
  const date = `${year}-${String(mm).padStart(2, "0")}`;

  // Negative ndays/sdev/unc are "no value" sentinels (-1, -9.99, -0.99). An unc of
  // 0.00 only ever appears next to a missing sdev: NOAA's uncertainty is derived
  // from sdev and ndays, so it is missing too, not a zero uncertainty.
  const sdevMissing = sdev.startsWith("-");
  if (unc === "0.00" && !sdevMissing) fail(`zero uncertainty with a real sdev: ${line}`);
  const days = ndays.startsWith("-") ? "" : ndays;
  const sd = sdevMissing ? "" : sdev;
  const u = unc.startsWith("-") || unc === "0.00" ? "" : unc;

  const sio = date <= LAST_SIO_MONTH;
  if (sio && (days || sd || u)) fail(`SIO-era row carries NOAA metadata: ${line}`);
  // SIO rows carry no ndays, so whether a month was interpolated is unknown.
  const interpolated = sio ? "" : days ? "false" : "true";
  const site =
    date === MIXED_MONTH
      ? "Maunakea and Mauna Loa"
      : date >= MAUNAKEA_FROM && date <= MAUNAKEA_TO
        ? "Maunakea"
        : "Mauna Loa";

  out.push(
    [date, decimal, average, deseasonalized, days, sd, u, interpolated, sio ? "SIO" : "NOAA", site].join(","),
  );
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out.join("\n") + "\n");
console.log(`wrote ${out.length - 1} rows to ${OUT}`);
