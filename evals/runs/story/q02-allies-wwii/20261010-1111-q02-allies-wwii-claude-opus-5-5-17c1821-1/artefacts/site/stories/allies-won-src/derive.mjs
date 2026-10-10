// Derive the tidy CSVs in tidy/ from the snapshots in raw/ and transcribed/.
//   node derive.mjs
// Plain Node, no dependencies, no network. Deterministic: re-running rewrites
// identical files. See PROVENANCE.md for every input.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, "raw");
const TRANSCRIBED = join(HERE, "transcribed");
const TIDY = join(HERE, "tidy");
mkdirSync(TIDY, { recursive: true });

/** RFC 4180 CSV → array of string arrays. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function readCsvObjects(path) {
  const [head, ...rows] = parseCsv(readFileSync(path, "utf8"));
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

function writeCsv(name, columns, rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const out = [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
  writeFileSync(join(TIDY, name), out);
  console.log(`wrote tidy/${name} (${rows.length} rows)`);
}

const round = (x, d) => Number(x.toFixed(d));
const num = (s) => {
  const t = (s ?? "").trim();
  if (t === "" || t === "..") return null;
  const n = Number(t);
  if (!Number.isFinite(n)) throw new Error(`not a number: ${JSON.stringify(s)}`);
  return n;
};
function must(cond, msg) { if (!cond) throw new Error(msg); }

// --- Harrison (1998), chapter 1 tables (sheet "Tables" exported to CSV) -------
const H = parseCsv(readFileSync(join(RAW, "harrison-1998-chapter_1_tables.Tables.csv"), "utf8"));
const label = (r) => (r[0] ?? "").trim();
const startOf = (prefix) => {
  const i = H.findIndex((r) => label(r).startsWith(prefix));
  must(i >= 0, `table not found: ${prefix}`);
  return i;
};

/** A year-by-country block: Allied and Axis sections, "Allied total"/"Axis total" rows. */
function coalitionBlock(tablePrefix, stopLabel) {
  const start = startOf(tablePrefix);
  const headerIdx = H.findIndex((r, i) => i > start && /^19\d\d$/.test((r[1] ?? "").trim()));
  const years = H[headerIdx].slice(1).map((s) => s.trim()).filter((s) => /^19\d\d$/.test(s)).map(Number);
  const rows = [], totals = {};
  let coalition = null;
  for (let i = headerIdx + 1; i < H.length; i++) {
    const l = label(H[i]);
    if (l.startsWith(stopLabel)) break;
    if (l === "Allied powers") { coalition = "Allies"; continue; }
    if (l === "Axis powers") { coalition = "Axis"; continue; }
    if (!coalition || l === "" || l === "-") continue;
    const values = years.map((_, k) => num(H[i][k + 1]));
    if (/total$/i.test(l)) { totals[coalition] = values; continue; }
    years.forEach((y, k) => { if (values[k] !== null) rows.push({ coalition, country: l, year: y, value: values[k] }); });
  }
  return { years, rows, totals };
}

// Table 1-3: GDP, international dollars and 1990 prices, $ billion.
const gdp = coalitionBlock("Table 1-3.", "Allies/Axis");
writeCsv("gdp-harrison-1998.csv", ["coalition", "country", "year", "gdp_bn_1990_intl_usd"],
  gdp.rows.map((r) => ({ ...r, gdp_bn_1990_intl_usd: round(r.value, 3) })));

const gdpTotals = gdp.years.map((year, k) => {
  const sum = (c) => gdp.rows.filter((r) => r.coalition === c && r.year === year).reduce((s, r) => s + r.value, 0);
  const allies = sum("Allies"), axis = sum("Axis");
  // Our sums must reproduce Harrison's own total rows.
  must(Math.abs(allies - gdp.totals.Allies[k]) < 0.01, `Allied GDP total mismatch ${year}`);
  must(Math.abs(axis - gdp.totals.Axis[k]) < 0.01, `Axis GDP total mismatch ${year}`);
  return { year, allies_gdp_bn_1990_intl_usd: round(allies, 1), axis_gdp_bn_1990_intl_usd: round(axis, 1), allies_to_axis: round(allies / axis, 2) };
});
writeCsv("gdp-coalition-totals-harrison-1998.csv", ["year", "allies_gdp_bn_1990_intl_usd", "axis_gdp_bn_1990_intl_usd", "allies_to_axis"], gdpTotals);

// Table 1-5: armed forces, thousands.
const forces = coalitionBlock("Table 1-5.", "Allies/Axis");
writeCsv("armed-forces-harrison-1998.csv", ["coalition", "country", "year", "armed_forces_thousands"],
  forces.rows.map((r) => ({ ...r, armed_forces_thousands: r.value })));

// Table 1-6: war production by country, item and year. Country header rows are
// followed by "No. of months", unit sub-headers ("Thousands", "Units") and items.
const production = [];
{
  const start = startOf("Table 1-6.");
  const end = startOf("Table 1-7.");
  const COUNTRIES = ["USA", "UK", "USSR", "Germany", "Italy", "Japan"];
  let country = null, unit = null, years = null;
  for (let i = start; i < end; i++) {
    const l = label(H[i]);
    if (/^19\d\d$/.test((H[i][1] ?? "").trim())) { years = H[i].slice(1, 8).map((s) => Number(s.trim())); continue; }
    if (COUNTRIES.includes(l)) { country = l; continue; }
    if (l === "Thousands") { unit = "thousands"; continue; }
    if (l === "Units") { unit = "units"; continue; }
    if (!country || !unit || l === "" || l === "-" || l === "No. of months") continue;
    if (/^(Notes|Sources|Continued|a |b )/.test(l)) { country = null; continue; }
    const item = l.replace(/vesselsa$/, "vessels");
    years.forEach((y, k) => {
      const v = num(H[i][k + 1]);
      if (v !== null) production.push({ country, item, year: y, value: v, unit });
    });
  }
}
writeCsv("production-harrison-1998.csv", ["country", "item", "year", "value", "unit"], production);
const prod = (country, item, year) => {
  const r = production.find((p) => p.country === country && p.item === item && p.year === year);
  must(r, `no production row ${country} ${item} ${year}`);
  return r.value;
};
const gdpOf = (coalition, country, year) => {
  const r = gdp.rows.find((p) => p.coalition === coalition && p.country === country && p.year === year);
  must(r, `no GDP row ${country} ${year}`);
  return r.value;
};
const forcesOf = (country, year) => {
  const r = forces.rows.find((p) => p.country === country && p.year === year);
  must(r, `no forces row ${country} ${year}`);
  return r.value;
};

// --- Goldsmith (1946) munitions, via Harrison (1988) table 1 -----------------
const gold = readCsvObjects(join(TRANSCRIBED, "goldsmith-1946-munitions-via-harrison-1988-table1.csv"));
const GOLD_ALLIES = ["USA", "Canada", "UK", "USSR"], GOLD_AXIS = ["Germany", "Japan"];
const periods = [...new Set(gold.map((r) => r.period))];
const munitions = periods.map((period) => {
  const sum = (cs) => gold.filter((r) => r.period === period && cs.includes(r.country)).reduce((s, r) => s + Number(r.munitions_usd_bn_1944_prices), 0);
  const allies = sum(GOLD_ALLIES), axis = sum(GOLD_AXIS);
  return { period, allies_usd_bn_1944_prices: round(allies, 1), axis_usd_bn_1944_prices: round(axis, 1), allies_to_axis: round(allies / axis, 2) };
});
writeCsv("munitions-by-coalition-goldsmith-1946.csv", ["period", "allies_usd_bn_1944_prices", "axis_usd_bn_1944_prices", "allies_to_axis"], munitions);
const goldOf = (country, period) => Number(gold.find((r) => r.country === country && r.period === period).munitions_usd_bn_1944_prices);

// --- USSR versus Germany, 1942 and 1944 -------------------------------------
const vs = [1942, 1944].flatMap((Y) => [
  { measure: "GDP", ussr: gdpOf("Allies", "USSR", Y), germany: gdpOf("Axis", "Germany", Y), unit: "$ bn, 1990 international dollars", source: "Harrison (1998) table 1-3" },
  { measure: "Armed forces", ussr: forcesOf("USSR", Y), germany: forcesOf("Germany", Y), unit: "thousands", source: "Harrison (1998) table 1-5" },
  { measure: "Munitions output (value)", ussr: goldOf("USSR", String(Y)), germany: goldOf("Germany", String(Y)), unit: "$ bn, US 1944 munitions prices", source: "Goldsmith (1946) via Harrison (1988) table 1" },
  { measure: "Combat aircraft (number)", ussr: prod("USSR", "Combat aircraft", Y), germany: prod("Germany", "Combat aircraft", Y), unit: "thousands", source: "Harrison (1998) table 1-6" },
  { measure: "Tanks and SP guns (number)", ussr: prod("USSR", "Tanks and SPG", Y), germany: prod("Germany", "Tanks and SPG", Y), unit: "thousands", source: "Harrison (1998) table 1-6" },
].map((r) => ({ ...r, year: Y, ussr: round(r.ussr, 3), germany: round(r.germany, 3), ussr_to_germany: round(r.ussr / r.germany, 2) })));
writeCsv("ussr-vs-germany.csv", ["measure", "year", "ussr", "germany", "ussr_to_germany", "unit", "source"], vs);

// --- Cross-check: same country set in Harrison (1998) and Maddison (2023) ----
// US + UK against Germany + Italy + Japan, 1938-43 (Italy surrendered in
// September 1943; Harrison has no Axis Italy after that). Harrison counts
// Austria separately; it is added to Germany here. Maddison's "Germany" is
// OWID's series for the country (borders as defined by the MPD).
const mpd = readCsvObjects(join(RAW, "owid-gdp-maddison-project-database-2023.csv"));
const mpdOf = (entity, year) => {
  const r = mpd.find((p) => p.Entity === entity && Number(p.Year) === year);
  must(r, `no Maddison row ${entity} ${year}`);
  return Number(r.GDP) / 1e9;
};
const check = [];
for (let year = 1938; year <= 1943; year++) {
  const hWest = gdpOf("Allies", "USA", year) + gdpOf("Allies", "UK", year);
  const hAxis = gdpOf("Axis", "Germany", year) + gdpOf("Axis", "Austria", year) + gdpOf("Axis", "Italy", year) + gdpOf("Axis", "Japan", year);
  check.push({ source: "Harrison 1998 (1990 int. $)", year, us_uk_gdp_bn: round(hWest, 1), germany_italy_japan_gdp_bn: round(hAxis, 1), ratio: round(hWest / hAxis, 2) });
  const mWest = mpdOf("United States", year) + mpdOf("United Kingdom", year);
  const mAxis = mpdOf("Germany", year) + mpdOf("Italy", year) + mpdOf("Japan", year);
  check.push({ source: "Maddison Project 2023 (2011 int. $)", year, us_uk_gdp_bn: round(mWest, 1), germany_italy_japan_gdp_bn: round(mAxis, 1), ratio: round(mWest / mAxis, 2) });
}
writeCsv("gdp-us-uk-vs-axis-two-sources.csv", ["source", "year", "us_uk_gdp_bn", "germany_italy_japan_gdp_bn", "ratio"], check);

// --- Deaths: copy the transcription with numbers checked --------------------
const deaths = readCsvObjects(join(TRANSCRIBED, "wikipedia-ww2-deaths-selected.csv"));
for (const d of deaths) must(Number(d.low) <= Number(d.high), `low > high for ${d.country} ${d.measure}`);
writeCsv("deaths-wikipedia-2026-09.csv", ["country", "side", "measure", "low", "high", "low_source", "high_source", "note"], deaths);
