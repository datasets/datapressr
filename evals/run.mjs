#!/usr/bin/env node
// Thin dispatcher for the eval harness. See evals/README.md.
//   node evals/run.mjs run <domain>/<case> --writer fake [--skill-ref <commit>] [--allow-dirty] [--repeat N]
//   node evals/run.mjs check <run_id|--all>
//   node evals/run.mjs report

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { checkCommand } from "./lib/checkers/run-checks.mjs";
import { writeReport } from "./lib/report.mjs";
import { runCase } from "./lib/runner.mjs";
import { repoRoot } from "./lib/versions.mjs";

const evalsDir = dirname(fileURLToPath(import.meta.url));
const root = repoRoot(evalsDir);

const PLANNED = {
  canary: "datapressr-hcn.3 (H2)",
  score: "datapressr-hcn.5 (H4)",
  pair: "datapressr-hcn.5 (H4)",
  owner: "datapressr-hcn.9 (H8)",
};

const USAGE = `usage:
  node evals/run.mjs run <domain>/<case> --writer fake [--skill-ref <commit>] [--allow-dirty] [--repeat N]
  node evals/run.mjs check <run_id|--all>
  node evals/run.mjs report
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
  if (command === "report") {
    writeReport(join(evalsDir, "ledger.jsonl"), join(evalsDir, "REPORT.md"));
    console.log("wrote evals/REPORT.md");
    return;
  }
  if (PLANNED[command]) throw new Error(`"${command}" is not implemented yet; it arrives in ${PLANNED[command]}`);
  throw new Error(USAGE);
}

main(process.argv.slice(2)).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
