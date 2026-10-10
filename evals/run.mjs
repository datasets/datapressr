#!/usr/bin/env node
// Thin dispatcher for the eval harness. See evals/README.md.
//   node evals/run.mjs run <domain>/<case> --writer fake|claude|codex [--skill-ref <commit>] [--allow-dirty] [--no-skill] [--max-usd N] [--repeat N] [--critic auto|claude|codex|fake] [--critic-model <id>] [--no-critic]
//   node evals/run.mjs check <run_id|--all>
//   node evals/run.mjs report
//   node evals/run.mjs owner <pair_id> --preferred A|B|neither --remarks-file f.md [--scores A.prose=1,B.prose=2]
//   node evals/run.mjs owner <run_id> --remarks-file f.md [--scores prose=1] | owner --rounds <case_id> <n>
//   node evals/run.mjs canary --writer claude|codex [--mode fixed|open] [--weaken]
//   node evals/run.mjs critic-choice --writer claude|codex      (free: which critic score would use)
//   node evals/run.mjs score <run_id|--all> [--rubric story/v1] [--critic auto|claude|codex|fake] [--critic-model <id>] [--calibrate] [--png]
//   node evals/run.mjs pair <run_id> <run_id> [--rubric story/v1] [--overlay reference-pairwise] [--critic auto|claude|codex|fake] [--critic-model <id>] [--calibrate]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { checkCommand } from "./lib/checkers/run-checks.mjs";
import { runCanary } from "./lib/canary.mjs";
import { availabilityChecker, pickCritic } from "./lib/adapters/index.mjs";
import { allRunDirs, findRunDir, pairRuns, resolveCritic, scoreRun, writersOf } from "./lib/critic.mjs";
import { ownerCommand } from "./lib/owner.mjs";
import { writeReport } from "./lib/report.mjs";
import { ADAPTERS, describeScore, loadConfig, runCase } from "./lib/runner.mjs";
import { repoRoot } from "./lib/versions.mjs";

const evalsDir = dirname(fileURLToPath(import.meta.url));
const root = repoRoot(evalsDir);

const USAGE = `usage:
  node evals/run.mjs run <domain>/<case> --writer fake|claude|codex [--skill-ref <commit>] [--allow-dirty] [--no-skill] [--max-usd N] [--repeat N] [--critic auto|claude|codex|fake] [--critic-model <id>] [--no-critic]
  node evals/run.mjs check <run_id|--all>
  node evals/run.mjs report
  node evals/run.mjs owner <pair_id> --preferred A|B|neither --remarks-file f.md [--scores A.prose=1,B.prose=2]
  node evals/run.mjs owner <pair_id> --reveal
  node evals/run.mjs owner <run_id> --remarks-file f.md [--scores argument=1,prose=2]
  node evals/run.mjs owner --rounds <case_id> <n> [--remarks-file f.md]
  node evals/run.mjs canary --writer claude|codex [--mode fixed|open] [--weaken]
  node evals/run.mjs critic-choice --writer claude|codex
  node evals/run.mjs score <run_id|--all> [--rubric story/v1] [--critic auto|claude|codex|fake] [--critic-model <id>] [--calibrate] [--png]
  node evals/run.mjs pair <run_id> <run_id> [--rubric story/v1] [--overlay reference-pairwise] [--critic auto|claude|codex|fake] [--critic-model <id>] [--calibrate]`;

const CRITIC_OPTIONS = {
  rubric: { type: "string" },
  critic: { type: "string", default: "auto" },
  "critic-model": { type: "string" },
  calibrate: { type: "boolean", default: false },
  png: { type: "boolean", default: false },
  overlay: { type: "string" },
};

const costLine = (c) => `${c.calls} call(s), ${c.cost_usd === null ? `tokens ${JSON.stringify(c.usage)}` : `${c.cost_usd} USD (list)`}`;

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
        "no-skill": { type: "boolean", default: false },
        "max-usd": { type: "string" },
        repeat: { type: "string", default: "1" },
        critic: { type: "string", default: "auto" },
        "critic-model": { type: "string" },
        "no-critic": { type: "boolean", default: false },
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
      noSkill: values["no-skill"],
      maxUsd: values["max-usd"] === undefined ? null : Number(values["max-usd"]),
      repeat: Number(values.repeat),
      critic: values["no-critic"] ? null : { spec: values.critic, model: values["critic-model"] },
      log: (m) => console.log(m),
    });
    for (const r of results) {
      console.log(`wrote evals/runs/${r.run.domain}/${r.run.case_id}/${r.runId}/run.json; ${describeScore(r)}`);
    }
    console.log("updated evals/ledger.jsonl and evals/REPORT.md");
    if (results.some((r) => r.score?.status === "critic_failed" || r.run.flags.includes("usage_limit"))) process.exitCode = 1;
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
    if (!adapter?.needsCanary) throw new Error(`canary needs a real writer (claude or codex); got ${JSON.stringify(values.writer)}`);
    const { detail } = await runCanary({ root, evalsDir, adapter, config: loadConfig(evalsDir), mode: values.mode, weaken: values.weaken, log: (m) => console.log(m) });
    for (const [name, p] of Object.entries(detail.probes)) console.log(`  ${p.status.padEnd(8)} ${name}`);
    console.log(`canary ${detail.run_id}: ${detail.pass ? "PASS" : "FAIL"} (${detail.vendor} ${detail.cli_version}, recipe ${detail.recipe_sha256.slice(0, 12)}, ${detail.mode}${detail.weakened ? ", weakened" : ""}; ${detail.model_actual ?? detail.model}, ${detail.turns} turns, ${detail.cost_usd === null ? `tokens ${JSON.stringify(detail.usage)}` : `${detail.cost_usd} USD`})`);
    console.log(`wrote evals/canaries/${detail.run_id}/canary.json and a canary row in evals/ledger.jsonl`);
    if (!detail.pass) process.exitCode = 1;
    return;
  }
  if (command === "critic-choice") {
    const { values } = parseArgs({ args: rest, options: { writer: { type: "string" } } });
    if (!values.writer) throw new Error(USAGE);
    const config = loadConfig(evalsDir);
    const available = availabilityChecker({ ledgerFile: join(evalsDir, "ledger.jsonl") });
    for (const v of ["claude", "codex"]) {
      const a = available(v);
      console.log(`  ${v.padEnd(7)} ${a.ok ? `available (CLI ${a.cli_version}, canary ${a.canary_run_id})` : `unavailable: ${a.reason}`}`);
    }
    console.log(JSON.stringify(pickCritic(values.writer, { config, available })));
    return;
  }
  if (command === "score") {
    const { values, positionals } = parseArgs({ args: rest, allowPositionals: true, options: { ...CRITIC_OPTIONS, all: { type: "boolean", default: false } } });
    if (values.all === (positionals.length === 1) || positionals.length > 1) throw new Error(USAGE);
    if (values.overlay) throw new Error("--overlay applies to pair only");
    const config = loadConfig(evalsDir);
    const available = availabilityChecker({ ledgerFile: join(evalsDir, "ledger.jsonl") });
    const dirs = values.all ? allRunDirs(evalsDir) : [findRunDir(evalsDir, positionals[0])];
    let failed = 0;
    for (const runDir of dirs) {
      const critic = resolveCritic({ spec: values.critic, model: values["critic-model"], writers: writersOf([runDir]), config, available });
      const res = await scoreRun({ root, evalsDir, runDir, rubricId: values.rubric, critic, calibrate: values.calibrate, png: values.png, config, log: (m) => console.log(m) });
      if (res.ok) console.log(`${res.row.run_id}: publishable ${res.row.publishable}, scores ${JSON.stringify(res.row.scores)}; wrote ${res.row.file.replace(/\.json$/, ".{json,md}")} (${costLine(res.costs)})`);
      else failed++;
    }
    writeReport(join(evalsDir, "ledger.jsonl"), join(evalsDir, "REPORT.md"));
    console.log("updated evals/ledger.jsonl and evals/REPORT.md");
    if (failed) process.exitCode = 1;
    return;
  }
  if (command === "pair") {
    const { values, positionals } = parseArgs({ args: rest, allowPositionals: true, options: CRITIC_OPTIONS });
    if (positionals.length !== 2) throw new Error(USAGE);
    const config = loadConfig(evalsDir);
    const available = availabilityChecker({ ledgerFile: join(evalsDir, "ledger.jsonl") });
    const runDirs = positionals.map((id) => findRunDir(evalsDir, id));
    const critic = resolveCritic({ spec: values.critic, model: values["critic-model"], writers: writersOf(runDirs), config, available });
    const res = await pairRuns({ root, evalsDir, runDirs, rubricId: values.rubric, overlay: values.overlay, critic, calibrate: values.calibrate, config, log: (m) => console.log(m) });
    console.log(`pair ${res.pairId}: ${res.row.winner_run_id ? "a win (both orders agree)" : "a tie (orders split or tied)"}; ${costLine(res.costs)}`);
    console.log(`wrote evals/pairs/${res.pairId}/A, B, critique-AB.json, critique-BA.json, critique.md and mapping.json (gitignored; do not open it before the owner judges)`);
    writeReport(join(evalsDir, "ledger.jsonl"), join(evalsDir, "REPORT.md"));
    console.log("updated evals/ledger.jsonl and evals/REPORT.md");
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
  throw new Error(USAGE);
}

main(process.argv.slice(2)).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
