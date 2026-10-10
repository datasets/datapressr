#!/usr/bin/env node
// Thin dispatcher for the eval harness. See evals/README.md.
//   node evals/run.mjs run <domain>/<case> --writer fake [--skill-ref <commit>] [--allow-dirty] [--repeat N]
//   node evals/run.mjs check <run_id|--all>
//   node evals/run.mjs report
//   node evals/run.mjs owner <pair_id> --preferred A|B|neither --remarks-file f.md [--scores A.prose=1,B.prose=2]
//   node evals/run.mjs owner <run_id> --remarks-file f.md [--scores prose=1] | owner --rounds <case_id> <n>
//   node evals/run.mjs canary --writer claude [--mode fixed] [--weaken]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { checkCommand } from "./lib/checkers/run-checks.mjs";
import { runCanary } from "./lib/canary.mjs";
import { ownerCommand } from "./lib/owner.mjs";
import { writeReport } from "./lib/report.mjs";
import { ADAPTERS, loadConfig, runCase } from "./lib/runner.mjs";
import { repoRoot } from "./lib/versions.mjs";

const evalsDir = dirname(fileURLToPath(import.meta.url));
const root = repoRoot(evalsDir);

const PLANNED = {
  score: "datapressr-hcn.5 (H4)",
  pair: "datapressr-hcn.5 (H4)",
};

const USAGE = `usage:
  node evals/run.mjs run <domain>/<case> --writer fake [--skill-ref <commit>] [--allow-dirty] [--repeat N]
  node evals/run.mjs check <run_id|--all>
  node evals/run.mjs report
  node evals/run.mjs owner <pair_id> --preferred A|B|neither --remarks-file f.md [--scores A.prose=1,B.prose=2]
  node evals/run.mjs owner <pair_id> --reveal
  node evals/run.mjs owner <run_id> --remarks-file f.md [--scores argument=1,prose=2]
  node evals/run.mjs owner --rounds <case_id> <n> [--remarks-file f.md]
  node evals/run.mjs canary --writer claude [--mode fixed] [--weaken]
planned: ${Object.entries(PLANNED).map(([k, v]) => `${k} (${v})`).join(", ")}`;

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === "run") {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: {
        writer: { type: "string" },
        "skill-ref": { type: "string", default: "HEAD" },
        "allow-dirty": { type: "boolean", default: false },
        repeat: { type: "string", default: "1" },
      },
    });
    if (positionals.length !== 1 || !values.writer) throw new Error(USAGE);
    const results = await runCase({
      root,
      evalsDir,
      caseRef: positionals[0],
      writer: values.writer,
      skillRef: values["skill-ref"],
      allowDirty: values["allow-dirty"],
      repeat: Number(values.repeat),
      log: (m) => console.log(m),
    });
    for (const r of results) console.log(`wrote evals/runs/${r.run.domain}/${r.run.case_id}/${r.runId}/run.json`);
    console.log("updated evals/ledger.jsonl and evals/REPORT.md");
    return;
  }
  if (command === "check") {
    if (rest.length !== 1) throw new Error(USAGE);
    checkCommand({ root, evalsDir, target: rest[0], log: (m) => console.log(m) });
    writeReport(join(evalsDir, "ledger.jsonl"), join(evalsDir, "REPORT.md"));
    console.log("wrote checks.json, updated evals/ledger.jsonl and evals/REPORT.md");
    return;
  }
  if (command === "canary") {
    const { values } = parseArgs({
      args: rest,
      options: { writer: { type: "string" }, mode: { type: "string", default: "fixed" }, weaken: { type: "boolean", default: false } },
    });
    const adapter = ADAPTERS[values.writer];
    if (!adapter?.needsCanary) throw new Error(`canary needs a real writer (claude); got ${JSON.stringify(values.writer)}`);
    const { detail } = await runCanary({ root, evalsDir, adapter, config: loadConfig(evalsDir), mode: values.mode, weaken: values.weaken, log: (m) => console.log(m) });
    for (const [name, p] of Object.entries(detail.probes)) console.log(`  ${p.status.padEnd(8)} ${name}`);
    console.log(`canary ${detail.run_id}: ${detail.pass ? "PASS" : "FAIL"} (${detail.vendor} ${detail.cli_version}, recipe ${detail.recipe_sha256.slice(0, 12)}, ${detail.mode}${detail.weakened ? ", weakened" : ""}; ${detail.model_actual}, ${detail.turns} turns, ${detail.cost_usd} USD)`);
    console.log(`wrote evals/canaries/${detail.run_id}/canary.json and a canary row in evals/ledger.jsonl`);
    if (!detail.pass) process.exitCode = 1;
    return;
  }
  if (command === "report") {
    writeReport(join(evalsDir, "ledger.jsonl"), join(evalsDir, "REPORT.md"));
    console.log("wrote evals/REPORT.md");
    return;
  }
  if (command === "owner") {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: {
        preferred: { type: "string" },
        "remarks-file": { type: "string" },
        scores: { type: "string" },
        rounds: { type: "string" },
        reveal: { type: "boolean", default: false },
      },
    });
    const target = values.rounds === undefined ? positionals[0] : undefined;
    if (values.rounds === undefined && positionals.length !== 1) throw new Error(USAGE);
    ownerCommand({ evalsDir, target, values, positionals, log: (m) => console.log(m) });
    writeReport(join(evalsDir, "ledger.jsonl"), join(evalsDir, "REPORT.md"));
    console.log("updated evals/ledger.jsonl and evals/REPORT.md");
    return;
  }
  if (PLANNED[command]) throw new Error(`"${command}" is not implemented yet; it arrives in ${PLANNED[command]}`);
  throw new Error(USAGE);
}

main(process.argv.slice(2)).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
