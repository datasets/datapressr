import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCount, parseTable, metricColumns, resolveAndCheck, quarterOf, statedQuarter, tablesIn, plainText } from "./build.ts";

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(here, "archive", "manifest.json"), "utf8"));

/** The archived exhibit filed on a given date, as raw HTML. */
function exhibit(filingDate, index = 0) {
  const matches = manifest.files.filter((f) => f.source_id.startsWith("exhibit:") && f.filing_date === filingDate);
  assert.ok(matches.length > index, `no archived exhibit ${index} for ${filingDate}`);
  return readFileSync(join(here, matches[index].path), "utf8");
}

/** Every production/deliveries table in an archived exhibit. */
function tablesOf(filingDate, index = 0) {
  return tablesIn(exhibit(filingDate, index))
    .map(parseTable)
    .filter((t) => t !== null);
}

/** {group: {metric: value}} for one archived quarter, through the full resolve path. */
function figures(filingDate, tableIndex = 0) {
  const table = tablesOf(filingDate)[tableIndex];
  assert.ok(table, `no parseable table in the ${filingDate} exhibit`);
  const out = {};
  for (const r of resolveAndCheck(table, filingDate)) {
    (out[r.label] ??= {})[r.metric] = r.value;
  }
  return out;
}

function readCsv(name) {
  const [header, ...lines] = readFileSync(join(here, "data", name), "utf8").trim().split("\n");
  const cols = header.split(",");
  return lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v])));
}

// --- parseCount -------------------------------------------------------------

test("parseCount reads comma-separated integers", () => {
  assert.equal(parseCount("87,048"), 87048);
  assert.equal(parseCount("1,845,985"), 1845985);
  assert.equal(parseCount("2,020"), 2020);
});

test("parseCount repairs a number broken up by stray whitespace", () => {
  // Q2 2022's total production is marked up as "258,5 8 0".
  assert.equal(parseCount("258,5 8 0"), 258580);
  assert.equal(parseCount("1 2 3"), 123);
  assert.equal(parseCount(" 104,891​"), 104891);
});

test("parseCount reports a dash rather than guessing zero or missing", () => {
  for (const d of ["-", "–", "—", "N/A", ""]) assert.equal(parseCount(d), "dash");
});

test("parseCount throws on anything that is not a count", () => {
  for (const bad of ["7%", "about 95,200", "1.5", "87,048 vehicles"]) {
    assert.throws(() => parseCount(bad), /not a vehicle count/, bad);
  }
});

// --- column alignment -------------------------------------------------------

test("metricColumns finds the metric columns and ignores other headers", () => {
  assert.deepEqual(metricColumns(["Production", "Deliveries"]), { production: 0, deliveries: 1 });
  assert.deepEqual(metricColumns(["Production", "Deliveries", "Subject to operating lease accounting"]), {
    production: 0,
    deliveries: 1,
  });
  assert.equal(metricColumns(["Q4 2020"]), null);
  assert.equal(metricColumns(["Production"]), null);
});

test("parseTable aligns on the header, not a fixed offset, when a row is short a cell", () => {
  // Q3 2019: the Total row carries no lease percentage while the others do.
  const table = parseTable([
    ["Production", "Deliveries", "Subject to lease accounting"],
    ["Model S/X", "16,318", "17,400", "15%"],
    ["Model 3", "79,837", "79,600", "8%"],
    ["Total", "96,155", "97,000"],
  ]);
  const got = Object.fromEntries(resolveAndCheck(table, "test").map((r) => [`${r.label}|${r.metric}`, r.value]));
  assert.equal(got["Model S/X|production"], 16318);
  assert.equal(got["Model 3|deliveries"], 79600);
  assert.equal(got["Total|production"], 96155);
});

test("parseTable ignores a table with no Total row", () => {
  assert.equal(parseTable([["Production", "Deliveries"], ["Model 3", "1", "2"]]), null);
});

// --- resolve and check ------------------------------------------------------

test("a component sum that disagrees with the reported Total fails the build", () => {
  const table = parseTable([
    ["Production", "Deliveries"],
    ["Model S/X", "10", "10"],
    ["Model 3", "20", "20"],
    ["Total", "31", "30"],
  ]);
  assert.throws(() => resolveAndCheck(table, "test"), /components sum to 30, table says Total 31/);
});

test("a single dash becomes a real zero only when the arithmetic confirms it", () => {
  const table = parseTable([
    ["Production", "Deliveries"],
    ["Model S/X", "-", "2,020"],
    ["Model 3/Y", "180,338", "182,780"],
    ["Total", "180,338", "184,800"],
  ]);
  const got = Object.fromEntries(resolveAndCheck(table, "test").map((r) => [`${r.label}|${r.metric}`, r.value]));
  assert.equal(got["Model S/X|production"], 0, "no Model S/X was produced, and the total proves it");
  assert.equal(got["Model S/X|deliveries"], 2020);
});

test("a dash stays missing when the remainder is not zero — missing is not zero", () => {
  const table = parseTable([
    ["Production", "Deliveries"],
    ["Model S/X", "-", "10"],
    ["Model 3/Y", "100", "20"],
    ["Total", "150", "30"],
  ]);
  const got = Object.fromEntries(resolveAndCheck(table, "test").map((r) => [`${r.label}|${r.metric}`, r.value]));
  assert.equal(got["Model S/X|production"], "", "50 vehicles are unaccounted for, so the figure is unknown");
});

test("two dashes in one metric both stay missing rather than being split", () => {
  const table = parseTable([
    ["Production", "Deliveries"],
    ["Model S/X", "-", "10"],
    ["Model 3/Y", "-", "20"],
    ["Total", "100", "30"],
  ]);
  const got = Object.fromEntries(resolveAndCheck(table, "test").map((r) => [`${r.label}|${r.metric}`, r.value]));
  assert.equal(got["Model S/X|production"], "");
  assert.equal(got["Model 3/Y|production"], "");
});

// --- period attribution -----------------------------------------------------

test("quarterOf maps a filing month to the quarter it reports", () => {
  assert.deepEqual(quarterOf("2026-07-02"), { year: 2026, quarter: 2 });
  assert.deepEqual(quarterOf("2026-01-02"), { year: 2025, quarter: 4 });
  assert.deepEqual(quarterOf("2020-04-02"), { year: 2020, quarter: 1 });
  assert.throws(() => quarterOf("2026-05-02"), /not in a production-and-deliveries filing month/);
});

test("statedQuarter reads both headline styles the series has used", () => {
  assert.deepEqual(statedQuarter("Tesla Q2 2019 Vehicle Production & Deliveries"), { year: 2019, quarter: 2 });
  assert.deepEqual(statedQuarter("Tesla Third Quarter 2024 Production, Deliveries & Deployments"), {
    year: 2024,
    quarter: 3,
  });
  assert.equal(statedQuarter("Tesla Announces Date for 2023 Investor Day"), null);
});

// --- against the archived filings, across grouping regimes -------------------

test("Q2 2019, the first quarter reported as a table: Model S/X and Model 3", () => {
  const f = figures("2019-07-02");
  assert.deepEqual(f["Model S/X"], { production: 14517, deliveries: 17650 });
  assert.deepEqual(f["Model 3"], { production: 72531, deliveries: 77550 });
  assert.deepEqual(f["Total"], { production: 87048, deliveries: 95200 });
});

test("Q4 2023, the first quarter of the Model 3/Y + Other Models grouping", () => {
  const f = figures("2024-01-02");
  assert.deepEqual(f["Model 3/Y"], { production: 476777, deliveries: 461538 });
  assert.deepEqual(f["Other Models"], { production: 18212, deliveries: 22969 });
  assert.deepEqual(f["Total"], { production: 494989, deliveries: 484507 });
  assert.equal(f["Model S/X"], undefined, "the S/X line is not reported in this grouping");
});

test("Q2 2026, the latest quarter in the snapshot", () => {
  const f = figures("2026-07-02");
  assert.deepEqual(f["Model 3/Y"], { production: 442936, deliveries: 467762 });
  assert.deepEqual(f["Other Models"], { production: 8822, deliveries: 12364 });
  assert.deepEqual(f["Total"], { production: 451758, deliveries: 480126 });
});

test("Q1 2021's dashed Model S/X production really is zero in the filing", () => {
  const f = figures("2021-04-02");
  assert.equal(f["Model S/X"].production, 0);
  assert.equal(f["Model S/X"].deliveries, 2020, "none built, but 2,020 delivered from inventory");
});

test("Q2 2022's whitespace-damaged total parses and agrees with its components", () => {
  const f = figures("2022-07-05");
  assert.equal(f["Total"].production, 258580);
  assert.equal(f["Model S/X"].production + f["Model 3/Y"].production, f["Total"].production);
});

test("a Q4 filing carries the quarter first and the full-year recap second", () => {
  const tables = tablesOf("2022-01-03");
  assert.equal(tables.length, 2);
  const q4 = figures("2022-01-03", 0);
  const year = figures("2022-01-03", 1);
  assert.equal(q4["Total"].deliveries, 308600);
  assert.equal(year["Total"].deliveries, 936172);
  assert.ok(year["Total"].deliveries > q4["Total"].deliveries);
});

test("an 8-K exhibit that is not a production release yields no table", () => {
  // 2023-01-03 filed two exhibits: the Q4 2022 release and an Investor Day announcement.
  assert.equal(tablesOf("2023-01-03", 1).length, 0);
  assert.match(plainText(exhibit("2023-01-03", 1)), /Investor Day/);
});

test("every archived exhibit's headline quarter agrees with its filing date", () => {
  for (const f of manifest.files.filter((x) => x.source_id.startsWith("exhibit:"))) {
    const stated = statedQuarter(plainText(readFileSync(join(here, f.path), "utf8")));
    if (!stated) continue;
    const derived = quarterOf(f.filing_date);
    assert.deepEqual(stated, derived, `${f.filing_date} ${f.path}`);
  }
});

// --- the built CSVs ---------------------------------------------------------

test("the quarterly CSV covers every quarter from Q2 2019 with no gaps", () => {
  const rows = readCsv("tesla-quarterly-deliveries.csv");
  const periods = [...new Set(rows.map((r) => r.period_start))].sort();
  assert.equal(periods[0], "2019-04-01");
  assert.equal(periods.length, 29);
  for (let i = 1; i < periods.length; i++) {
    const [y, m] = periods[i - 1].split("-").map(Number);
    const expected = m === 10 ? `${y + 1}-01-01` : `${y}-${String(m + 3).padStart(2, "0")}-01`;
    assert.equal(periods[i], expected, `gap after ${periods[i - 1]}`);
  }
});

test("the quarterly CSV's primary key is unique", () => {
  const rows = readCsv("tesla-quarterly-deliveries.csv");
  const keys = rows.map((r) => [r.period_start, r.period_end, r.vehicle_group, r.metric].join("|"));
  assert.equal(new Set(keys).size, keys.length);
});

test("every quarter's component rows sum to its Total row, in both metrics", () => {
  const rows = readCsv("tesla-quarterly-deliveries.csv");
  const byPeriodMetric = new Map();
  for (const r of rows) {
    const k = `${r.period_start}|${r.metric}`;
    (byPeriodMetric.get(k) ?? byPeriodMetric.set(k, []).get(k)).push(r);
  }
  for (const [k, group] of byPeriodMetric) {
    const total = group.find((r) => r.is_total === "true");
    assert.ok(total, `${k} has no Total row`);
    const sum = group.filter((r) => r.is_total === "false").reduce((a, r) => a + Number(r.vehicles), 0);
    assert.equal(sum, Number(total.vehicles), k);
  }
});

test("the coverage table accounts for every archived exhibit", () => {
  const coverage = readCsv("source-filings.csv");
  const exhibits = manifest.files.filter((f) => f.source_id.startsWith("exhibit:"));
  assert.equal(coverage.length, exhibits.length);
  assert.equal(coverage.filter((c) => c.extracted === "true").length, 29);
  assert.ok(coverage.filter((c) => c.layout === "prose").length >= 19, "the prose era is recorded, not dropped");
});
