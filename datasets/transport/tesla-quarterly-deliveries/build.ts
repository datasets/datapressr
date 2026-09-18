// Tesla quarterly vehicle production and deliveries — archive/ → data/*.csv.
//
// Offline. Reads only the snapshot in archive/ (see fetch.ts for the network step) and
// verifies every file against archive/manifest.json's SHA-256 before parsing.
//
// Run:  node build.ts
//
// Source: Exhibit 99.1 of Tesla's quarterly Production & Deliveries Form 8-K (Item 2.02),
// filed with the SEC a few days after each quarter ends. From the Q2 2019 release onwards
// the numbers are in an HTML table; before that they are narrative prose only, with the
// wording changing release to release. This build parses the table era and records every
// earlier release in data/source-filings.csv as discovered-but-not-extracted rather than
// guessing at prose. See README.md.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");

/** Vehicle-group labels the source has used, in the order the groupings appeared. */
export const GROUPS = ["Model S", "Model X", "Model S/X", "Model 3", "Model 3/Y", "Model Y", "Other Models", "Total"];
const TOTAL_LABEL = "Total";
const METRICS = ["production", "deliveries"] as const;
type Metric = (typeof METRICS)[number];

interface ManifestFile {
  source_id: string;
  url: string;
  path: string;
  sha256: string;
  accession?: string;
  filing_date?: string;
  report_date?: string;
}

interface Row {
  period_start: string;
  period_end: string;
  vehicle_group: string;
  is_total: boolean;
  metric: Metric;
  vehicles: number | "";
  source_id: string;
}

// ---------------------------------------------------------------- html helpers

/** Decode the entities these filings actually use; leave anything else alone. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)));
}

export function cellText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/[\s\u00a0\u200b]+/g, " ")
    .trim();
}

export function plainText(html: string): string {
  const stripped = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(td|th|p|div|h[1-6]|li|tr)>|<br[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(stripped)
    .split("\n")
    .map((l) => l.replace(/[\s\u00a0\u200b]+/g, " ").trim())
    .filter((l) => l.length > 0)
    .join("\n");
}

export function tablesIn(html: string): string[][][] {
  return (html.match(/<table[\s\S]*?<\/table>/gi) ?? []).map((table) =>
    [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((tr) =>
      [...tr[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((td) => cellText(td[1])).filter((c) => c !== ""),
    ),
  );
}

// ---------------------------------------------------------------- value parsing

/**
 * A reported vehicle count.
 *
 * Two real quirks in this series:
 *  - Numbers can arrive with stray whitespace inside them. Q2 2022's total production is
 *    marked up as "258,5 8 0" across three table cells' worth of spans. Strip whitespace
 *    and separators, then let the component-sums-to-total assertion prove the repair.
 *  - A dash means the line was not produced at all, not that the figure is unknown:
 *    Tesla produced no Model S/X in Q1 2021 during the line changeover. It is resolved to
 *    a real 0 only when the row arithmetic confirms it, and left missing otherwise, so a
 *    genuine zero and a genuine unknown never get mixed up.
 */
export const DASHES = new Set(["-", "\u2010", "\u2011", "\u2012", "\u2013", "\u2014", "\u2015", "N/A", "n/a", ""]);

export function parseCount(raw: string): number | "dash" {
  const t = raw.trim();
  if (DASHES.has(t)) return "dash";
  const digits = t.replace(/[\s\u00a0\u200b,]/g, "");
  if (!/^\d+$/.test(digits)) throw new Error(`not a vehicle count: ${JSON.stringify(raw)}`);
  return Number(digits);
}

// ---------------------------------------------------------------- periods

const QUARTER_BY_FILING_MONTH: Record<number, { quarter: number; yearOffset: number }> = {
  1: { quarter: 4, yearOffset: -1 },
  4: { quarter: 1, yearOffset: 0 },
  7: { quarter: 2, yearOffset: 0 },
  10: { quarter: 3, yearOffset: 0 },
};

const QUARTER_DATES: Record<number, [string, string]> = {
  1: ["01-01", "03-31"],
  2: ["04-01", "06-30"],
  3: ["07-01", "09-30"],
  4: ["10-01", "12-31"],
};

export function quarterOf(filingDate: string): { year: number; quarter: number } {
  const [y, m] = filingDate.split("-").map(Number);
  const map = QUARTER_BY_FILING_MONTH[m];
  if (!map) throw new Error(`${filingDate}: not in a production-and-deliveries filing month`);
  return { year: y + map.yearOffset, quarter: map.quarter };
}

const WORD_QUARTER: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4 };

/**
 * The quarter the release's own headline claims, or null if it doesn't say.
 *
 * Used only to cross-check the quarter derived from the filing date. Headlines run
 * "Tesla Q2 2019 Vehicle Production & Deliveries" and, from Q3 2024, "Tesla Third Quarter
 * 2024 Production, Deliveries & Deployments".
 */
export function statedQuarter(text: string): { year: number; quarter: number } | null {
  const head = text.slice(0, 2000);
  const short = head.match(/\bQ([1-4])\s+(20\d\d)\b/i);
  if (short) return { year: Number(short[2]), quarter: Number(short[1]) };
  const long = head.match(/\b(first|second|third|fourth)\s+quarter\s+(?:of\s+)?(20\d\d)\b/i);
  if (long) return { year: Number(long[2]), quarter: WORD_QUARTER[long[1].toLowerCase()] };
  return null;
}

// ---------------------------------------------------------------- table extraction

interface ParsedTable {
  groups: { label: string; values: Partial<Record<Metric, number | "dash">> }[];
}

/** Column index of each metric among a header row's cells, or null if this isn't a header. */
export function metricColumns(cells: string[]): Partial<Record<Metric, number>> | null {
  const cols: Partial<Record<Metric, number>> = {};
  cells.forEach((c, i) => {
    if (/^production$/i.test(c)) cols.production = i;
    if (/^deliveries$/i.test(c)) cols.deliveries = i;
  });
  return cols.production !== undefined && cols.deliveries !== undefined ? cols : null;
}

/**
 * Parse one production/deliveries table.
 *
 * Column alignment is by the header's own Production/Deliveries positions rather than a
 * fixed offset, because the trailing "Subject to (operating) lease accounting" column
 * appears in Q3 2019, is absent from the annual recap tables, and is missing from
 * individual rows (Q3 2019's Total row has no percentage).
 */
export function parseTable(rows: string[][]): ParsedTable | null {
  let cols: Partial<Record<Metric, number>> | null = null;
  const groups: ParsedTable["groups"] = [];
  for (const cells of rows) {
    if (cells.length === 0) continue;
    if (!cols) {
      cols = metricColumns(cells);
      continue;
    }
    const label = cells[0];
    if (!GROUPS.includes(label)) continue;
    const values: Partial<Record<Metric, number | "dash">> = {};
    for (const metric of METRICS) {
      const idx = cols[metric]! + 1; // +1: the row's first cell is the label
      if (idx >= cells.length) continue;
      try {
        values[metric] = parseCount(cells[idx]);
      } catch (err) {
        throw new Error(`${label} / ${metric}: ${(err as Error).message}`);
      }
    }
    if (Object.keys(values).length > 0) groups.push({ label, values });
  }
  if (!cols || groups.length === 0) return null;
  if (!groups.some((g) => g.label === TOTAL_LABEL)) return null;
  return { groups };
}

/**
 * Resolve dashes and check the table against itself: the component rows must sum to the
 * reported Total for each metric. This is what proves the column alignment is right and
 * that a whitespace-damaged number was repaired correctly — both are silent failures
 * otherwise.
 */
export function resolveAndCheck(table: ParsedTable, where: string): { label: string; metric: Metric; value: number | "" }[] {
  const out: { label: string; metric: Metric; value: number | "" }[] = [];
  const total = table.groups.find((g) => g.label === TOTAL_LABEL)!;
  const components = table.groups.filter((g) => g.label !== TOTAL_LABEL);
  if (components.length === 0) throw new Error(`${where}: a Total row with no component rows`);

  for (const metric of METRICS) {
    const reportedTotal = total.values[metric];
    if (reportedTotal === undefined) continue;
    if (reportedTotal === "dash") throw new Error(`${where}: ${metric} Total is a dash`);

    const known = components.filter((c) => typeof c.values[metric] === "number");
    const dashes = components.filter((c) => c.values[metric] === "dash");
    const knownSum = known.reduce((a, c) => a + (c.values[metric] as number), 0);

    const resolved = new Map<string, number | "">();
    if (dashes.length === 0) {
      if (knownSum !== reportedTotal) {
        throw new Error(`${where}: ${metric} components sum to ${knownSum}, table says Total ${reportedTotal}`);
      }
    } else if (dashes.length === 1 && reportedTotal - knownSum === 0) {
      // The one dashed line accounts for exactly nothing: a real zero, not an unknown.
      resolved.set(dashes[0].label, 0);
    } else {
      // Can't attribute the remainder — leave every dash genuinely missing.
      for (const d of dashes) resolved.set(d.label, "");
    }

    for (const c of components) {
      const v = c.values[metric];
      out.push({ label: c.label, metric, value: v === "dash" ? resolved.get(c.label)! : (v as number) });
    }
    out.push({ label: TOTAL_LABEL, metric, value: reportedTotal });
  }
  return out;
}

// ---------------------------------------------------------------- build

function main(): void {
  const manifest = JSON.parse(readFileSync(join(ARCHIVE, "manifest.json"), "utf8")) as { files: ManifestFile[] };
  const exhibits = manifest.files.filter((f) => f.source_id.startsWith("exhibit:"));
  if (exhibits.length === 0) throw new Error("archive/manifest.json lists no exhibits — run fetch.ts first");

  const quarterly: Row[] = [];
  const annual: Row[] = [];
  const coverage: Record<string, string | number | boolean>[] = [];
  // period key -> the filing that supplied it, so a later filing can supersede an earlier one
  const claimedBy = new Map<string, { accession: string; filing_date: string }>();

  for (const ex of exhibits) {
    const buf = readFileSync(join(HERE, ex.path));
    const digest = createHash("sha256").update(buf).digest("hex");
    if (digest !== ex.sha256) throw new Error(`${ex.path}: sha256 ${digest} != manifest ${ex.sha256}`);

    const html = buf.toString("utf8");
    const text = plainText(html);
    const accession = ex.accession!;
    const filingDate = ex.filing_date!;
    const { year, quarter } = quarterOf(filingDate);

    const candidates = tablesIn(html)
      .map((rows) => {
        try {
          return parseTable(rows);
        } catch (err) {
          throw new Error(`${filingDate} ${accession} ${ex.path}: ${(err as Error).message}`);
        }
      })
      .filter((t): t is ParsedTable => t !== null);

    const exhibitFile = ex.path.split("/").pop()!;
    // Headlines run either "Tesla Q3 2017 Vehicle Production and Deliveries" or, in the
    // early years, "TESLA DELIVERS 11,507 VEHICLES IN Q2 OF 2015" — match the stems.
    const isPressRelease = /produc|deliver/i.test(text.slice(0, 1200));

    if (candidates.length === 0) {
      coverage.push({
        source_id: accession,
        filing_date: filingDate,
        period_label: `${year} Q${quarter}`,
        layout: isPressRelease ? "prose" : "not-a-production-and-deliveries-release",
        extracted: false,
        exhibit_file: exhibitFile,
        exhibit_url: ex.url,
      });
      continue;
    }

    // Cross-check the date-derived quarter against the release's own headline.
    const stated = statedQuarter(text);
    if (stated && (stated.year !== year || stated.quarter !== quarter)) {
      throw new Error(
        `${filingDate} ${accession}: filing date implies ${year} Q${quarter} but the release says ${stated.year} Q${stated.quarter}`,
      );
    }

    // A Q4 release carries the quarter's table first and a full-year recap second.
    const [quarterTable, ...rest] = candidates;
    if (rest.length > 1) throw new Error(`${filingDate} ${accession}: ${candidates.length} tables, expected 1 or 2`);

    const key = `${year}-Q${quarter}`;
    const prior = claimedBy.get(key);
    if (prior) {
      // Preferred-version rule: the later filing wins; both snapshots stay in archive/.
      if (filingDate < prior.filing_date) {
        coverage.push({
          source_id: accession,
          filing_date: filingDate,
          period_label: `${year} Q${quarter}`,
          layout: "table",
          extracted: false,
          exhibit_file: exhibitFile,
          exhibit_url: ex.url,
        });
        continue;
      }
      // Drop the superseded filing's rows from BOTH resources: a superseded Q4 release
      // carries an annual recap too, and leaving it behind would silently keep the older
      // figures under the newer filing's quarter.
      for (const arr of [quarterly, annual]) {
        for (let i = arr.length - 1; i >= 0; i--) if (arr[i].source_id === prior.accession) arr.splice(i, 1);
      }
      const superseded = coverage.find((c) => c.source_id === prior.accession);
      if (superseded) superseded.extracted = false;
    }
    claimedBy.set(key, { accession, filing_date: filingDate });

    const [qStart, qEnd] = QUARTER_DATES[quarter];
    for (const r of resolveAndCheck(quarterTable, `${filingDate} ${accession} quarter table`)) {
      quarterly.push({
        period_start: `${year}-${qStart}`,
        period_end: `${year}-${qEnd}`,
        vehicle_group: r.label,
        is_total: r.label === TOTAL_LABEL,
        metric: r.metric,
        vehicles: r.value,
        source_id: accession,
      });
    }

    if (rest.length === 1) {
      if (quarter !== 4) throw new Error(`${filingDate} ${accession}: a second table outside a Q4 release`);
      for (const r of resolveAndCheck(rest[0], `${filingDate} ${accession} annual table`)) {
        annual.push({
          period_start: `${year}-01-01`,
          period_end: `${year}-12-31`,
          vehicle_group: r.label,
          is_total: r.label === TOTAL_LABEL,
          metric: r.metric,
          vehicles: r.value,
          source_id: accession,
        });
      }
    }

    coverage.push({
      source_id: accession,
      filing_date: filingDate,
      period_label: `${year} Q${quarter}`,
      layout: "table",
      extracted: true,
      exhibit_file: exhibitFile,
      exhibit_url: ex.url,
    });
  }

  // ---- checks across the whole output

  const keys = new Set<string>();
  for (const r of [...quarterly, ...annual]) {
    const k = [r.period_start, r.period_end, r.vehicle_group, r.metric].join("|");
    if (keys.has(k)) throw new Error(`duplicate primary key: ${k}`);
    keys.add(k);
  }

  // Every quarter between the first and last extracted must be present — a gap means a
  // filing was missed, not that Tesla skipped a quarter.
  const periods = [...new Set(quarterly.map((r) => r.period_start))].sort();
  for (let i = 1; i < periods.length; i++) {
    const [py, pm] = periods[i - 1].split("-").map(Number);
    const expected = pm === 10 ? `${py + 1}-01-01` : `${py}-${String(pm + 3).padStart(2, "0")}-01`;
    if (periods[i] !== expected) throw new Error(`gap in coverage: ${periods[i - 1]} is followed by ${periods[i]}`);
  }

  if (quarterly.some((r) => typeof r.vehicles === "number" && r.vehicles < 0)) {
    throw new Error("a negative vehicle count");
  }

  // Sums of the quarters vs the annual recap. These deliberately do NOT have to match:
  // Tesla restates quarterly figures, so the annual number can exceed the four quarters
  // as originally reported. Report the differences rather than assert them away.
  const drift: string[] = [];
  for (const year of [...new Set(annual.map((r) => r.period_start.slice(0, 4)))].sort()) {
    for (const metric of METRICS) {
      const annualTotal = annual.find(
        (r) => r.period_start.startsWith(year) && r.metric === metric && r.vehicle_group === TOTAL_LABEL,
      );
      if (!annualTotal || typeof annualTotal.vehicles !== "number") continue;
      const qs = quarterly.filter(
        (r) => r.period_start.startsWith(year) && r.metric === metric && r.vehicle_group === TOTAL_LABEL,
      );
      if (qs.length !== 4) continue;
      const sum = qs.reduce((a, r) => a + (r.vehicles as number), 0);
      if (sum !== annualTotal.vehicles) {
        drift.push(`  ${year} ${metric}: four quarters sum to ${sum}, the annual recap says ${annualTotal.vehicles} (${annualTotal.vehicles - sum >= 0 ? "+" : ""}${annualTotal.vehicles - sum})`);
      }
    }
  }

  // ---- write

  const sortRows = (a: Row, b: Row) =>
    a.period_start.localeCompare(b.period_start) ||
    a.metric.localeCompare(b.metric) ||
    Number(a.is_total) - Number(b.is_total) ||
    a.vehicle_group.localeCompare(b.vehicle_group);
  quarterly.sort(sortRows);
  annual.sort(sortRows);
  coverage.sort((a, b) => String(a.filing_date).localeCompare(String(b.filing_date)) || String(a.source_id).localeCompare(String(b.source_id)));

  const ROW_COLS = ["period_start", "period_end", "vehicle_group", "is_total", "metric", "vehicles", "source_id"];
  const COVER_COLS = ["source_id", "filing_date", "period_label", "layout", "extracted", "exhibit_file", "exhibit_url"];
  writeFileSync(join(HERE, "data", "tesla-quarterly-deliveries.csv"), toCsv(quarterly as unknown as Record<string, unknown>[], ROW_COLS));
  writeFileSync(join(HERE, "data", "tesla-annual-deliveries.csv"), toCsv(annual as unknown as Record<string, unknown>[], ROW_COLS));
  writeFileSync(join(HERE, "data", "source-filings.csv"), toCsv(coverage as unknown as Record<string, unknown>[], COVER_COLS));

  const extracted = coverage.filter((c) => c.extracted).length;
  console.log(`tesla-quarterly-deliveries.csv: ${quarterly.length} rows, ${periods.length} quarters (${periods[0]} to ${periods[periods.length - 1]})`);
  console.log(`tesla-annual-deliveries.csv:    ${annual.length} rows`);
  console.log(`source-filings.csv:             ${coverage.length} filings, ${extracted} extracted, ${coverage.length - extracted} recorded only`);
  if (drift.length > 0) {
    console.log("annual recap vs the four quarters as first reported (restatements, not errors):");
    for (const d of drift) console.log(d);
  }
}

/** RFC 4180, LF endings, trailing newline. Copied from scripts/wrangling-idioms.mjs. */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n") + "\n";
}

// Only build when run directly; build.test.mjs imports the functions above.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
