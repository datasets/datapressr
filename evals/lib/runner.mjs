// The `run` subcommand (design section 4.2): resolve versions, refuse a dirty skill tree, gate
// on a passing canary (staged writers), stage a blind workspace, run the writer adapter, collect
// artefacts, leak-scan the transcript, write run.json, append a ledger row and regenerate the
// report, then score with the critic (step 7; skipped with `critic: null`). The fake writer skips
// staging and the gate; Claude and Codex writers are staged and gated.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import * as claude from "./adapters/claude.mjs";
import * as codex from "./adapters/codex.mjs";
import * as fake from "./adapters/fake.mjs";
import { availabilityChecker } from "./adapters/index.mjs";
import { gateFromLedger } from "./canary.mjs";
import { CRITIC_ADAPTERS, latestRubricId, resolveCritic, scoreRun } from "./critic.mjs";
import { scanTranscript } from "./leakscan.mjs";
import { collectArtefacts, ensureModulesCache, removeWorkspace, stageWorkspace, tarWorkspace, writerPrompt } from "./stage.mjs";
import { checkRun } from "./checkers/run-checks.mjs";
import { appendRow } from "./ledger.mjs";
import { writeReport } from "./report.mjs";
import { assertValid, validateCase, validateRun } from "./schema.mjs";
import { caseHash, harnessVersion, isAncestorOfMain, sha256, skillVersion, treeHash } from "./versions.mjs";

export const ADAPTERS = { fake, claude, codex };
const NOT_YET = {};

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
  // The writer gets the case prompt plus the harness's blind-run notes (stage.mjs).
  const prompt = writerPrompt(readFileSync(join(dir, "prompt.md"), "utf8"));
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

// A staged writer (design 4.2 steps 3-6): blind workspace, the vendor recipe, then collect the
// changed files into artefactDir, leak-scan the transcript and keep transcript + tarball (both
// gitignored, hashed in run.json). The workspace is removed afterwards.
async function runStaged({ adapter, root, kase, prompt, skillRef, model, caps, config, runDir, artefactDir, cacheRoot, log }) {
  const cache = ensureModulesCache({ root, ref: skillRef, log, ...(cacheRoot ? { cacheRoot } : {}) });
  const ws = stageWorkspace({ root, kase, prompt, skillRef, modules: cache.modules });
  try {
    log(`workspace ${ws.dir}`);
    const out = await adapter.write({ workspace: ws.dir, prompt, model, caps, mode: kase.data_mode, root, timeoutMs: config.timeouts_ms.writer });
    const collected = collectArtefacts(ws.dir, artefactDir, { baseline: ws.baseline });
    if (collected.skipped.length) log(`not collected (over 2 MB in total, or not a file): ${collected.skipped.join(", ")}`);
    const leaks = scanTranscript(out.transcript, { workspaces: [ws.dir], allowedDirs: [cache.dir] });
    writeFileSync(join(runDir, "transcript.jsonl"), out.transcript);
    const tar = tarWorkspace(ws.dir, join(runDir, "workspace.tar"));
    const flags = [...out.flags];
    if (leaks.length) flags.push("leaked");
    return { ...out, leaks, flags, transcript_sha256: sha256(out.transcript), workspace_sha256: sha256(tar), deleted: collected.deleted };
  } finally {
    removeWorkspace(ws.dir);
  }
}

// The critic step of `run`: resolve the critic for this run's writer (auto picks the fake critic
// for the fake writer, so the plumbing test stays free) and score with the latest rubric. Any
// failure, including one to resolve the critic, becomes a `critic_failed` score row: the run,
// its checks and the ledger rows already written are kept.
async function critiqueRun({ root, evalsDir, runDir, run, kase, critic, config, now, log }) {
  const spec = critic.spec === "auto" && run.writer.vendor === "fake" ? "fake" : critic.spec;
  let resolved = null;
  try {
    const available = critic.available ?? availabilityChecker({ ledgerFile: join(evalsDir, "ledger.jsonl") });
    resolved = resolveCritic({ spec, model: critic.model, writers: [{ vendor: run.writer.vendor, model: run.writer.model }], config, available });
    const res = await scoreRun({ root, evalsDir, runDir, critic: resolved, config, now, log, ...(critic.adapters ? { adapters: critic.adapters } : {}), ...(critic.readInput ? { readInput: critic.readInput } : {}) });
    if (res.ok) log(`scored ${run.run_id}: publishable ${res.row.publishable}, scores ${JSON.stringify(res.row.scores)}`);
    return res.row;
  } catch (e) {
    const vendor = resolved?.vendor ?? (CRITIC_ADAPTERS[spec] ? spec : run.writer.vendor);
    const model = resolved?.model ?? critic.model ?? config.models[vendor]?.critic ?? vendor;
    let rubric = "unknown";
    try {
      rubric = latestRubricId(evalsDir, kase.domain);
    } catch {}
    const row = appendRow(join(evalsDir, "ledger.jsonl"), {
      kind: "score",
      at: now().toISOString(),
      run_id: run.run_id,
      rubric,
      critic: { vendor, model, model_actual: null, fallback: resolved?.fallback ?? false, fallback_reason: resolved?.fallback_reason ?? null, ...(resolved ? {} : { requested: critic.spec }) },
      status: "critic_failed",
      errors: [e.message],
      cost_usd: null,
      calls: 0,
    });
    log(`critic_failed for ${run.run_id}: ${e.message} (the run is kept; retry with \`score ${run.run_id}\`)`);
    return row;
  }
}

// critic: { spec: "auto"|"claude"|"codex"|"fake", model?, adapters?, available?, readInput? }, or
// null to skip scoring (--no-critic).
export async function runCase({ root, evalsDir = join(root, "evals"), caseRef, writer, skillRef = "HEAD", allowDirty = false, repeat = 1, now = () => new Date(), log = () => {}, adapters = ADAPTERS, cacheRoot, critic = { spec: "auto" } }) {
  const adapter = adapters[writer];
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
  // 2. Gate: a staged writer needs a passing canary for this CLI version, recipe and mode.
  const canary = adapter.needsCanary ? gateFromLedger(ledgerFile, { vendor: adapter.vendor, cli_version: adapter.cliVersion(), recipe_sha256: adapter.recipeHash(kase.data_mode), mode: kase.data_mode }) : null;
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

    // 3-6. Stage, execute, collect, leak scan (the fake writer just copies canned files).
    const out = adapter.staged
      ? { ...(await runStaged({ adapter, root, kase, prompt, skillRef: skill.ref, model, caps, config, runDir, artefactDir, cacheRoot, log })), canary_run_id: canary.run_id }
      : await adapter.write({ domain: kase.domain, kase, prompt, destDir: artefactDir, caps, config });

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
      harness: { tree: harness.tree, dirty: harness.dirty, recipe_sha256: out.recipe_sha256 ?? null },
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
      skill_name: skill.name,
      skill_ref: skill.ref,
      skill_tree: skill.tree,
      harness_tree: harness.tree,
      writer: { vendor: writer, model: out.model, model_actual: out.model_actual, cli_version: out.cli_version ?? null },
      turns: out.turns,
      cost_usd: out.cost_usd,
      flags: run.flags,
    });
    // 7. Deterministic checks (checks.json + a `check` ledger row), then the critic.
    const { checks } = checkRun({ root, evalsDir, runDir, harnessTree: harness.tree, now });
    const score = critic ? await critiqueRun({ root, evalsDir, runDir, run, kase, critic, config, now, log }) : null;
    results.push({ runId, runDir, run, checks, score });
  }
  writeReport(ledgerFile, join(evalsDir, "REPORT.md"));
  return results;
}
