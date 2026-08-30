// Project Drawdown — Table of Solutions (2020 review)
//
// Source:    https://drawdown.org/solutions/table-of-solutions
// Mirrored:  datasets/commons/issues/329  (community mirror, in this repo at
//            datasets/commons-issues/329-project-drawdown.md)
// Retrieved: 2026-08-30
// Archived:  archive/commons-329-project-drawdown-snapshot.md  (the markdown table this
//            script parses — a faithful copy of the 2020 "Table of Solutions")
//            archive/table-of-solutions-live-2026-08-30.html   (the live page as of the
//            retrieval date — NOTE: Project Drawdown redesigned this page in 2025 and no
//            longer publishes the two-scenario table in this form; see README.md)
//
// LICENSE:   Project Drawdown Terms of Use — "all rights reserved"; redistribution of
//            content requires prior written consent (https://drawdown.org/terms-of-use).
//            There is NO open license. This build produces the structured dataset so a
//            human can decide whether publication is possible; it is NOT cleared to ship.
//            See README.md.
//
// Run:  node build.ts   (Node 22+, native TS, no build step, no dependencies)
//
// Output (deterministic, sorted):
//   data/solutions.csv         one row per (solution, scenario)
//   data/solution_sectors.csv  one row per (solution, sector) — solutions belong to 1..n sectors

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive", "commons-329-project-drawdown-snapshot.md");
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

/** Parse a numeric cell; blank / whitespace-only -> undefined (an empty cell on write). */
function cleanNumber(raw: string): number | undefined {
  const s = raw.trim();
  if (s === "") return undefined;
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error(`unexpected non-numeric value: ${JSON.stringify(raw)}`);
  return n;
}

type TableRow = { solution: string; sectorsRaw: string; s1: string; s2: string };

/** Pull the one pipe-delimited markdown table out of the archived snapshot. */
function parseArchivedTable(md: string): TableRow[] {
  const lines = md.split("\n");
  // Header is "SOLUTION | SECTOR(S) | SCENARIO 1 * | SCENARIO 2 *" (with non-breaking spaces).
  const headerIdx = lines.findIndex((l) => /^SOLUTION\s*\|\s*SECTOR/i.test(l.replace(/ /g, " ")));
  if (headerIdx === -1) throw new Error("could not find the table header in the archived snapshot");

  const out: TableRow[] = [];
  // Skip the header and the "-- | -- | -- | --" separator row.
  for (const line of lines.slice(headerIdx + 2)) {
    if (!line.includes("|")) break; // table ends at the first non-table line
    const parts = line.split("|").map((p) => p.replace(/ /g, " ").trim());
    if (parts.length !== 4) throw new Error(`unexpected table row shape: ${JSON.stringify(line)}`);
    const [solution, sectorsRaw, s1, s2] = parts;
    out.push({ solution, sectorsRaw, s1, s2 });
  }
  return out;
}

function main(): void {
  const md = readFileSync(ARCHIVE, "utf8");
  const table = parseArchivedTable(md);
  if (table.length < 75) throw new Error(`only parsed ${table.length} solutions — expected ~82`);

  // solutions.csv — long on scenario
  const solutionRows: Record<string, unknown>[] = [];
  for (const r of table) {
    for (const [scenario, raw] of [[1, r.s1], [2, r.s2]] as const) {
      solutionRows.push({
        solution: r.solution,
        scenario,
        co2_eq_reduction_gt_2020_2050: cleanNumber(raw),
      });
    }
  }
  solutionRows.sort(
    (a, b) =>
      String(a.solution).localeCompare(String(b.solution)) ||
      Number(a.scenario) - Number(b.scenario),
  );

  // solution_sectors.csv — one row per (solution, sector); sectors are " / "-separated upstream
  const sectorRows: Record<string, unknown>[] = [];
  for (const r of table) {
    const sectors = r.sectorsRaw
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const sector of sectors) sectorRows.push({ solution: r.solution, sector });
  }
  sectorRows.sort(
    (a, b) =>
      String(a.solution).localeCompare(String(b.solution)) ||
      String(a.sector).localeCompare(String(b.sector)),
  );

  writeFileSync(
    join(DATA, "solutions.csv"),
    toCsv(solutionRows, ["solution", "scenario", "co2_eq_reduction_gt_2020_2050"]),
  );
  writeFileSync(
    join(DATA, "solution_sectors.csv"),
    toCsv(sectorRows, ["solution", "sector"]),
  );

  const modelled = solutionRows.filter((r) => r.co2_eq_reduction_gt_2020_2050 !== undefined).length;
  console.log(
    `wrote data/solutions.csv (${solutionRows.length} rows, ${modelled} with a value), ` +
      `data/solution_sectors.csv (${sectorRows.length} rows), ` +
      `${table.length} solutions, ${new Set(sectorRows.map((r) => r.sector)).size} sectors`,
  );
}

main();
