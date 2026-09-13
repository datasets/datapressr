import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  round,
  numericStats,
  readCsv,
  coverage,
  isMeasurement,
  buildStatsBlock,
  spliceIntoSummary,
  BEGIN,
  END,
} from "./enrich.ts";

const here = dirname(fileURLToPath(import.meta.url));

// --- numericStats -----------------------------------------------------------

test("numericStats: empty population produces blank stats, not NaN or 0", () => {
  const s = numericStats([]);
  assert.equal(s.n, 0);
  assert.equal(s.missing, 0);
  assert.equal(s.min, null);
  assert.equal(s.max, null);
  assert.equal(s.mean, null);
  assert.equal(s.median, null);
  assert.equal(s.stddev, null);
});

test("numericStats: all-missing column is empty, not zero", () => {
  const s = numericStats(["", "", ""]);
  assert.equal(s.n, 0);
  assert.equal(s.missing, 3);
  assert.equal(s.min, null);
});

test("numericStats: counts blanks as missing, not as values", () => {
  const s = numericStats(["1", "", "3", ""]);
  assert.equal(s.n, 2);
  assert.equal(s.missing, 2);
  assert.equal(s.min, 1);
  assert.equal(s.max, 3);
});

test("numericStats: preserves zero values (not treated as missing)", () => {
  const s = numericStats(["0", "5", "10"]);
  assert.equal(s.n, 3);
  assert.equal(s.missing, 0);
  assert.equal(s.min, 0);
  assert.equal(s.mean, 5);
});

test("numericStats: preserves negative values, e.g. the 2020-04-20 WTI price", () => {
  const s = numericStats(["25.56", "-36.98", "18.63"]);
  assert.equal(s.n, 3);
  assert.equal(s.min, -36.98);
  assert.equal(s.max, 25.56);
});

test("numericStats: constant column has std dev 0", () => {
  const s = numericStats(["4", "4", "4", "4"]);
  assert.equal(s.stddev, 0);
  assert.equal(s.min, 4);
  assert.equal(s.max, 4);
});

test("numericStats: std dev is the population statistic (denominator n, not n-1)", () => {
  // xs = [1, 2, 3, 4]; mean 2.5; population variance = mean((x-2.5)^2) = 1.25; sqrt = 1.118
  const s = numericStats(["1", "2", "3", "4"]);
  assert.equal(s.mean, 2.5);
  assert.equal(s.stddev, round(Math.sqrt(1.25)));
});

test("numericStats: median averages the two middle values for an even n", () => {
  const s = numericStats(["1", "2", "3", "4"]);
  assert.equal(s.median, 2.5);
});

test("numericStats: ignores non-finite values (NaN/Infinity) as missing", () => {
  const s = numericStats(["1", "not-a-number", "3"]);
  assert.equal(s.n, 2);
  assert.equal(s.missing, 1);
});

// --- readCsv / coverage / isMeasurement -------------------------------------

test("readCsv parses header + rows into objects", () => {
  const rows = readCsv("Date,Price\n2020-01-01,50\n2020-01-02,51\n");
  assert.deepEqual(rows, [
    { Date: "2020-01-01", Price: "50" },
    { Date: "2020-01-02", Price: "51" },
  ]);
});

test("coverage reports the range of the date field", () => {
  const rows = readCsv("Date,Price\n2020-01-02,51\n2020-01-01,50\n");
  const fields = [{ name: "Date", type: "date" }, { name: "Price", type: "number" }];
  assert.equal(coverage(rows, fields), "2020-01-01 → 2020-01-02");
});

test("coverage falls back to a dash when there is no date/year/string field", () => {
  const rows = readCsv("a,b\n1,2\n");
  const fields = [{ name: "a", type: "number" }, { name: "b", type: "number" }];
  assert.equal(coverage(rows, fields), "—");
});

test("isMeasurement excludes the Date key column but includes Price", () => {
  const fields = [{ name: "Date", type: "date" }, { name: "Price", type: "number" }];
  assert.equal(isMeasurement(fields[0]), false);
  assert.equal(isMeasurement(fields[1]), true);
});

// --- buildStatsBlock: consolidated table -------------------------------------

test("buildStatsBlock emits one row per resource, keyed by resource + measurement", () => {
  const pkg = {
    resources: [
      {
        name: "brent-daily",
        title: "Brent daily",
        path: "data/brent-daily.csv",
        schema: { fields: [{ name: "Date", type: "date" }, { name: "Price", type: "number" }] },
      },
      {
        name: "wti-daily",
        title: "WTI daily",
        path: "data/wti-daily.csv",
        schema: { fields: [{ name: "Date", type: "date" }, { name: "Price", type: "number" }] },
      },
    ],
  };
  const files = {
    "data/brent-daily.csv": "Date,Price\n2020-01-01,50\n2020-01-02,52\n",
    "data/wti-daily.csv": "Date,Price\n2020-04-19,20\n2020-04-20,-36.98\n",
  };
  const block = buildStatsBlock(pkg, (path) => files[path]);
  assert.ok(block.startsWith(BEGIN));
  assert.ok(block.endsWith(END));
  assert.ok(block.includes("| `brent-daily` | Price |"));
  assert.ok(block.includes("| `wti-daily` | Price |"));
  assert.ok(block.includes("-36.98"), "negative WTI price must survive into the table");
});

// --- spliceIntoSummary: preservation -----------------------------------------

test("spliceIntoSummary lays down a template on first run", () => {
  const doc = spliceIntoSummary(null, `${BEGIN}\nstub\n${END}`);
  assert.ok(doc.includes("## What stands out"));
  assert.ok(doc.includes("## See also"));
  assert.ok(doc.includes("stub"));
});

test("spliceIntoSummary rewrites only the fenced block, byte-for-byte preserving the rest", () => {
  const before = [
    "# Summary — x",
    "",
    "## Statistics",
    "",
    `${BEGIN}\nold stats\n${END}`,
    "",
    "## What stands out",
    "",
    "- hand-written commentary that must survive",
    "",
    "## See also",
    "",
    "- a link",
    "",
  ].join("\n");
  const after = spliceIntoSummary(before, `${BEGIN}\nnew stats\n${END}`);
  assert.ok(after.includes("new stats"));
  assert.ok(!after.includes("old stats"));
  assert.ok(after.includes("- hand-written commentary that must survive"));
  assert.ok(after.includes("- a link"));
});

test("spliceIntoSummary throws rather than silently corrupting a file missing the markers", () => {
  assert.throws(() => spliceIntoSummary("# no markers here", "whatever"));
});

// --- integration: running the real script twice is byte-identical ------------

test("running enrich.ts twice on the real dataset produces a byte-identical SUMMARY.md", () => {
  const summaryPath = join(here, "SUMMARY.md");
  const before = readFileSync(summaryPath, "utf8");
  execFileSync(process.execPath, [join(here, "enrich.ts")], { cwd: here });
  const afterFirstRun = readFileSync(summaryPath, "utf8");
  execFileSync(process.execPath, [join(here, "enrich.ts")], { cwd: here });
  const afterSecondRun = readFileSync(summaryPath, "utf8");
  assert.equal(afterFirstRun, afterSecondRun, "two runs on unchanged data must be byte-identical");
  // Restore whatever was committed before this test ran, so the test suite has no side effects.
  writeFileSync(summaryPath, before);
});

test("running enrich.ts preserves the hand-written 'What stands out' section", () => {
  const summaryPath = join(here, "SUMMARY.md");
  const before = readFileSync(summaryPath, "utf8");
  assert.ok(before.includes("## What stands out"));
  execFileSync(process.execPath, [join(here, "enrich.ts")], { cwd: here });
  const after = readFileSync(summaryPath, "utf8");
  assert.equal(
    after.slice(after.indexOf("## What stands out")),
    before.slice(before.indexOf("## What stands out")),
    "hand-written sections after the fenced block must be untouched",
  );
  writeFileSync(summaryPath, before);
});
