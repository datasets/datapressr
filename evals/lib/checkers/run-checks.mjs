// The `check` subcommand (design sections 3.3 and 4.1): run a domain's deterministic checks on
// a committed run, write checks.json next to run.json and append a `check` ledger row.
// Re-runnable: checks.json is overwritten with the latest result; the ledger keeps every row.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { appendRow } from "../ledger.mjs";
import { assertValid, validateChecks } from "../schema.mjs";
import { harnessVersion } from "../versions.mjs";
import { checkStory, materializeRunWorkspace, removeWorkspace } from "./story.mjs";

const CHECKERS = {
  story: ({ root, runDir, kase, run }) => {
    const ws = materializeRunWorkspace({ root, runDir, inputs: kase.inputs, deleted: run.deleted ?? [] });
    try {
      return checkStory({ workspace: ws, root, inputs: kase.inputs, asOf: kase.as_of, dataMode: kase.data_mode, words: kase.budget?.words });
    } finally {
      removeWorkspace(ws);
    }
  },
};

// Every run directory under evals/runs/<domain>/<case>/<run_id>/ that has a run.json. `sub`
// "calibration" lists the critic's calibration runs instead (historical drafts and negative
// controls, datapressr-hcn.8), which `--all` never includes.
export function findRunDirs(evalsDir, sub = "runs") {
  const runs = join(evalsDir, sub);
  if (!existsSync(runs)) return [];
  const out = [];
  const dirs = (p) => readdirSync(p).filter((n) => statSync(join(p, n)).isDirectory()).sort();
  for (const domain of dirs(runs)) for (const kase of dirs(join(runs, domain))) for (const id of dirs(join(runs, domain, kase))) {
    const dir = join(runs, domain, kase, id);
    if (existsSync(join(dir, "run.json"))) out.push(dir);
  }
  return out;
}

export function findRunDir(evalsDir, runId) {
  const named = (d) => d.split(sep).pop() === runId;
  const dir = findRunDirs(evalsDir).find(named) ?? findRunDirs(evalsDir, "calibration").find(named);
  if (!dir) throw new Error(`no run ${runId} under ${join(evalsDir, "runs")} or ${join(evalsDir, "calibration")}`);
  return dir;
}

export function checkRun({ root, evalsDir, runDir, harnessTree, now = () => new Date() }) {
  const run = JSON.parse(readFileSync(join(runDir, "run.json"), "utf8"));
  const caseFile = join(evalsDir, "cases", run.domain, run.case_id, "case.json");
  if (!existsSync(caseFile)) throw new Error(`run ${run.run_id}: no case at ${relative(root, caseFile)}`);
  const kase = JSON.parse(readFileSync(caseFile, "utf8"));
  const checker = CHECKERS[run.domain];
  if (!checker) throw new Error(`no deterministic checker for domain "${run.domain}"`);
  const checks = { checker: run.domain, results: checker({ root, runDir, kase, run }) };
  assertValid(validateChecks(checks), `checks.json for ${run.run_id}`);
  writeFileSync(join(runDir, "checks.json"), `${JSON.stringify(checks, null, 2)}\n`);
  const row = appendRow(join(evalsDir, "ledger.jsonl"), {
    kind: "check",
    at: now().toISOString(),
    run_id: run.run_id,
    checker: checks.checker,
    harness_tree: harnessTree ?? harnessVersion(root).tree,
    failed: checks.results.filter((r) => !r.pass && r.severity === "fail").map((r) => r.id),
    warned: checks.results.filter((r) => !r.pass && r.severity === "warn").map((r) => r.id),
    passed: checks.results.filter((r) => r.pass).length,
  });
  return { runId: run.run_id, runDir, checks, row };
}

// target: a run id, or "--all" for every committed run.
export function checkCommand({ root, evalsDir, target, log = () => {} }) {
  const dirs = target === "--all" ? findRunDirs(evalsDir) : [findRunDir(evalsDir, target)];
  const harnessTree = harnessVersion(root).tree;
  const out = [];
  for (const runDir of dirs) {
    const r = checkRun({ root, evalsDir, runDir, harnessTree });
    log(`${r.runId}: ${r.row.failed.length ? `failed ${r.row.failed.join(", ")}` : "all checks pass"}`);
    out.push(r);
  }
  if (!dirs.length) log("no runs to check");
  return out;
}
