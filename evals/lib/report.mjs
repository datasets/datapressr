// Generates evals/REPORT.md from the ledger. First version (datapressr-hcn.2): a per-case table of
// runs, newest first. Pairwise results, ranges, flags and agreement arrive in datapressr-hcn.9.
// Output is a pure function of the ledger (no generation timestamp) so regenerating is stable.

import { writeFileSync } from "node:fs";
import { readLedger } from "./ledger.mjs";

const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const short = (sha) => (sha ? sha.slice(0, 7) : "");
const money = (v) => (v === null || v === undefined ? "" : v.toFixed(2));

export function renderReport(rows) {
  const out = [
    "# Eval report",
    "",
    "Generated from `evals/ledger.jsonl` by `node evals/run.mjs report`; do not edit by hand. Single runs are anecdotes; comparisons arrive with pairwise critiques.",
    "",
  ];
  const runs = rows.filter((r) => r.kind === "run");
  if (runs.length === 0) {
    out.push("No runs recorded yet.", "");
    return out.join("\n");
  }
  const byCase = new Map();
  for (const r of runs) {
    const key = `${r.domain}/${r.case_id}`;
    if (!byCase.has(key)) byCase.set(key, []);
    byCase.get(key).push(r);
  }
  for (const key of [...byCase.keys()].sort()) {
    const list = byCase.get(key).slice().sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : a.run_id < b.run_id ? 1 : -1));
    out.push(`## ${key}`, "", `${list.length} run${list.length === 1 ? "" : "s"}.`, "");
    out.push("| Date | Run | Skill tree | Writer | Model | Turns | Cost USD | Flags |");
    out.push("|---|---|---|---|---|---|---|---|");
    for (const r of list) {
      out.push(
        `| ${cell(r.at.slice(0, 16).replace("T", " "))} | [${cell(r.run_id)}](${cell(r.path)}/run.json) | \`${short(r.skill_tree)}\` | ${cell(r.writer.vendor)} | ${cell(r.writer.model_actual ?? r.writer.model)} | ${cell(r.turns)} | ${money(r.cost_usd)} | ${cell(r.flags.join(", "))} |`,
      );
    }
    out.push("");
  }
  return out.join("\n");
}

export function writeReport(ledgerFile, reportFile) {
  const md = renderReport(readLedger(ledgerFile));
  writeFileSync(reportFile, md);
  return md;
}
