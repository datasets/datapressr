// The `run` subcommand (design section 4.2). This skeleton covers: resolve versions, refuse a
// dirty skill tree, run the writer adapter, collect artefacts, write run.json, append a ledger
// row and regenerate the report. Blind staging, the canary gate and real writers arrive in
// datapressr-hcn.3 (H2) and datapressr-hcn.4 (H3); only the fake writer exists so far.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import * as fake from "./adapters/fake.mjs";
import { appendRow } from "./ledger.mjs";
import { writeReport } from "./report.mjs";
import { assertValid, validateCase, validateRun } from "./schema.mjs";
import { caseHash, harnessVersion, isAncestorOfMain, sha256, skillVersion, treeHash } from "./versions.mjs";

const ADAPTERS = { fake };
const NOT_YET = { claude: "datapressr-hcn.3 (H2)", codex: "datapressr-hcn.4 (H3)" };

export function loadConfig(evalsDir) {
  return JSON.parse(readFileSync(join(evalsDir, "config.json"), "utf8"));
}

// caseRef is "<domain>/<id>". Validates the case, including input commits being on main.
export function loadCase(root, evalsDir, caseRef) {
  const [domain, id, ...rest] = caseRef.split("/");
  if (!domain || !id || rest.length) throw new Error(`case must be <domain>/<id>, got "${caseRef}"`);
  const dir = join(evalsDir, "cases", domain, id);
  if (!existsSync(join(dir, "case.json"))) throw new Error(`no case at ${relative(root, dir)}`);
  const kase = JSON.parse(readFileSync(join(dir, "case.json"), "utf8"));
  assertValid(validateCase(kase, { isAncestor: (c) => isAncestorOfMain(root, c) }), `case ${caseRef}`);
  if (kase.id !== id || kase.domain !== domain) throw new Error(`case.json id/domain (${kase.domain}/${kase.id}) do not match its directory (${caseRef})`);
  const prompt = readFileSync(join(dir, "prompt.md"), "utf8");
  return { kase, prompt, dir };
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const pad = (n) => String(n).padStart(2, "0");
function stamp(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
}
const modelShort = (model) => model.replace(/^claude-/, "").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();

export async function runCase({ root, evalsDir = join(root, "evals"), caseRef, writer, skillRef = "HEAD", allowDirty = false, repeat = 1, now = () => new Date(), log = () => {} }) {
  const adapter = ADAPTERS[writer];
  if (!adapter) {
    if (NOT_YET[writer]) throw new Error(`writer "${writer}" is not implemented yet; it arrives in ${NOT_YET[writer]}. Use --writer fake.`);
    throw new Error(`unknown writer "${writer}"`);
  }
  if (!Number.isInteger(repeat) || repeat < 1) throw new Error("--repeat must be a positive integer");

  const config = loadConfig(evalsDir);
  const { kase, prompt, dir: caseDir } = loadCase(root, evalsDir, caseRef);

  // 1. Resolve versions.
  const skill = skillVersion(root, kase.skills[0], skillRef);
  if (skill.dirty && !allowDirty) {
    throw new Error(`skills/${skill.name} has uncommitted changes; commit them or pass --allow-dirty (the run is then flagged dirty_skill)`);
  }
  const harness = harnessVersion(root);
  const inputs = kase.inputs.map((i) => ({ ...i, tree: treeHash(root, i.commit, i.path) }));
  const hash = caseHash(caseDir, inputs);
  const caps = config.caps[kase.data_mode];

  const ledgerFile = join(evalsDir, "ledger.jsonl");
  const results = [];
  for (let r = 0; r < repeat; r++) {
    const started = now();
    const model = writer === "fake" ? "fake" : config.models[writer].writer;
    const base = `${stamp(started)}-${kase.id}-${writer}-${modelShort(model)}-${skill.tree.slice(0, 7)}`;
    const caseRuns = join(evalsDir, "runs", kase.domain, kase.id);
    let n = 1;
    while (existsSync(join(caseRuns, `${base}-${n}`))) n++;
    const runId = `${base}-${n}`;
    const runDir = join(caseRuns, runId);
    const artefactDir = join(runDir, "artefacts");
    mkdirSync(artefactDir, { recursive: true });
    log(`run ${runId}`);

    // 4. Execute (the fake writer just copies canned files).
    const out = await adapter.write({ domain: kase.domain, kase, prompt, destDir: artefactDir, caps, config });

    // 5. Collect.
    const artefacts = walk(artefactDir).map((p) => {
      const bytes = readFileSync(p);
      return { path: relative(artefactDir, p).split(sep).join("/"), sha256: sha256(bytes), bytes: bytes.length };
    });
    const flags = [...out.flags];
    if (skill.dirty) flags.push("dirty_skill");
    if (out.cost_usd !== null && out.cost_usd > caps.max_usd) flags.push("over_budget");
    if (out.turns !== null && out.turns > caps.max_turns) flags.push("over_budget");

    const run = {
      run_id: runId,
      case_id: kase.id,
      domain: kase.domain,
      case_hash: hash,
      skill,
      harness: { tree: harness.tree, dirty: harness.dirty, recipe_sha256: null },
      writer: { vendor: writer, model: out.model, model_actual: out.model_actual, cli_version: out.cli_version, prompt_sha256: sha256(prompt) },
      isolation: { canary_run_id: out.canary_run_id, network: out.network, leaks: out.leaks },
      started_at: started.toISOString(),
      duration_ms: out.duration_ms,
      turns: out.turns,
      cost_usd: out.cost_usd,
      cost_basis: out.cost_basis,
      usage: out.usage,
      artefacts,
      transcript_sha256: out.transcript_sha256,
      workspace_sha256: out.workspace_sha256,
      flags: [...new Set(flags)],
    };
    assertValid(validateRun(run), "run.json");
    writeFileSync(join(runDir, "run.json"), `${JSON.stringify(run, null, 2)}\n`);

    // 7. Ledger and report (checks and critique arrive with H6 and H4).
    appendRow(ledgerFile, {
      kind: "run",
      at: run.started_at,
      run_id: runId,
      case_id: kase.id,
      domain: kase.domain,
      path: relative(evalsDir, runDir).split(sep).join("/"),
      case_hash: hash,
      skill_tree: skill.tree,
      harness_tree: harness.tree,
      writer: { vendor: writer, model: out.model, model_actual: out.model_actual },
      turns: out.turns,
      cost_usd: out.cost_usd,
      flags: run.flags,
    });
    results.push({ runId, runDir, run });
  }
  writeReport(ledgerFile, join(evalsDir, "REPORT.md"));
  return results;
}
