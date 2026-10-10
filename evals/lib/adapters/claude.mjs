// Claude Code adapter (design section 4.3): `claude -p` locked down for a blind run.
//
// Isolation comes only from per-run flags, a harness-generated settings file passed with
// --settings, the staged workspace and the child's environment; the user's own settings,
// CLAUDE.md and memory are never touched (--setting-sources project keeps them out).
//
// Writer role: runs in the staged workspace with Read/Write/Edit/Glob/Grep/Bash, deny rules on
// the repo and the user's agent and credential directories, and (fixed mode) a sandbox with no
// network; the nested agent CLIs `claude` and `codex` are denied as Bash commands and shadowed
// on the child's PATH by shims that refuse to run (./nested.mjs). Critic role: no tools, structured JSON output, run from an empty temp dir.
//
// Output: stream-json (not json) so the transcript holds every tool call for the leak scan; its
// final `result` event carries the same fields as --output-format json (total_cost_usd,
// num_turns, duration_ms, usage, modelUsage).

import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { deniedPaths } from "../stage.mjs";
import { sha256 } from "../versions.mjs";
import { NESTED_AGENTS, makeShimDir, resolveBin, shimTemplate, withShimPath } from "./nested.mjs";

export const vendor = "claude";
export const staged = true;
export const needsCanary = true;

export const WRITER_TOOLS = ["Read", "Write", "Edit", "Glob", "Grep", "Bash"];

// Recipe version: bump when the recipe changes in a way the template below cannot see.
// 2: nested agent CLIs denied and shimmed (datapressr-hcn.19).
const RECIPE_VERSION = 2;

// The harness settings file (passed with --settings). `weaken` drops the read-deny rules, the
// sandbox denyRead list and the nested-agent denies (and the writer drops the PATH shim); it
// exists only to prove the canary fails without them.
export function settingsFor({ mode, root, home = homedir(), weaken = false }) {
  if (mode !== "fixed") throw new Error(`the Claude ${mode}-mode recipe is not defined yet; it arrives with the open-mode case (datapressr-hcn.12)`);
  const denied = deniedPaths(root, home);
  const deny = [];
  if (!weaken) {
    for (const p of denied) deny.push(`Read(/${p}/**)`, `Edit(/${p}/**)`);
    for (const a of NESTED_AGENTS) deny.push(`Bash(${a}:*)`);
  }
  deny.push("WebFetch", "WebSearch");
  const filesystem = weaken ? {} : { denyRead: denied };
  return {
    permissions: { deny },
    sandbox: {
      enabled: true,
      autoAllowBashIfSandboxed: true,
      allowUnsandboxedCommands: false,
      filesystem,
      network: { allowedDomains: [] },
    },
  };
}

// CLI flags common to every role, minus the prompt, model and caps.
function baseFlags(settingsPath) {
  return [
    "--output-format", "stream-json",
    "--verbose",
    "--setting-sources", "project",
    "--disable-slash-commands",
    "--strict-mcp-config",
    "--no-session-persistence",
    "--permission-mode", "dontAsk",
    "--settings", settingsPath,
  ];
}

export function writerArgs({ prompt, model, maxTurns, maxBudgetUsd, settingsPath }) {
  return [
    "-p", prompt,
    "--model", model,
    "--max-turns", String(maxTurns),
    "--max-budget-usd", String(maxBudgetUsd),
    ...baseFlags(settingsPath),
    "--tools", WRITER_TOOLS.join(","),
    "--allowedTools", WRITER_TOOLS.join(","),
  ];
}

export function criticArgs({ prompt, model, maxTurns = 3, maxBudgetUsd, settingsPath, jsonSchema }) {
  const args = ["-p", prompt, "--model", model, "--max-turns", String(maxTurns), ...baseFlags(settingsPath), "--tools", ""];
  if (maxBudgetUsd !== undefined) args.push("--max-budget-usd", String(maxBudgetUsd));
  if (jsonSchema) args.push("--json-schema", typeof jsonSchema === "string" ? jsonSchema : JSON.stringify(jsonSchema));
  return args;
}

// The recipe with machine paths replaced by placeholders: what the recipe hash covers. Two
// machines with the same CLI and recipe get the same hash; model and caps are not part of it.
export function recipeTemplate(mode, { weaken = false } = {}) {
  return {
    vendor,
    version: RECIPE_VERSION,
    mode,
    weaken,
    args: writerArgs({ prompt: "<prompt>", model: "<model>", maxTurns: "<turns>", maxBudgetUsd: "<usd>", settingsPath: "<settings>" }),
    settings: settingsFor({ mode, root: "/<repo>", home: "/<home>", weaken }),
    env: weaken ? {} : shimTemplate(),
  };
}

export function recipeHash(mode, opts = {}) {
  return sha256(JSON.stringify(recipeTemplate(mode, opts)));
}

export function cliVersion(bin = "claude") {
  const out = execFileSync(bin, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const m = out.match(/\d+\.\d+\.\d+\S*/);
  if (!m) throw new Error(`cannot parse ${bin} --version output: ${out.trim()}`);
  return m[0];
}

// The child's environment: ours minus the variables that mark this process as running inside a
// Claude Code session (a nested session would inherit its parent's identity). Auth variables
// (ANTHROPIC_*, CLAUDE_CODE_OAUTH_TOKEN) pass through.
export function childEnv(env = process.env) {
  const out = {};
  for (const [k, v] of Object.entries(env)) {
    if (k === "CLAUDE_CODE_OAUTH_TOKEN") out[k] = v;
    else if (k === "CLAUDECODE" || k.startsWith("CLAUDE_CODE_") || k === "CLAUDE_PID" || k === "CLAUDE_EFFORT") continue;
    else out[k] = v;
  }
  return out;
}

// Parse a stream-json transcript into { init, result, events }.
export function parseStream(text) {
  const events = [];
  for (const line of String(text).split("\n")) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      /* non-JSON noise is ignored */
    }
  }
  const init = events.find((e) => e.type === "system" && e.subtype === "init") || null;
  const result = [...events].reverse().find((e) => e.type === "result") || null;
  return { init, result, events };
}

// The model that did most of the work, from the result's modelUsage (keyed by model id).
export function modelActual(result) {
  const mu = result?.modelUsage;
  if (!mu || typeof mu !== "object") return null;
  let best = null;
  let bestScore = -1;
  for (const [model, u] of Object.entries(mu)) {
    const score = (u?.costUSD ?? 0) * 1e6 + (u?.outputTokens ?? 0);
    if (score > bestScore) [best, bestScore] = [model, score];
  }
  return best;
}

export function summarise(result) {
  return {
    model_actual: modelActual(result),
    turns: Number.isInteger(result?.num_turns) ? result.num_turns : null,
    cost_usd: typeof result?.total_cost_usd === "number" ? result.total_cost_usd : null,
    duration_ms: typeof result?.duration_ms === "number" ? result.duration_ms : null,
    usage: result?.usage && typeof result.usage === "object" ? result.usage : null,
    is_error: result ? Boolean(result.is_error) || (result.subtype && result.subtype !== "success") : true,
    subtype: result?.subtype ?? null,
    text: typeof result?.result === "string" ? result.result : null,
    structured_output: result?.structured_output ?? null,
  };
}

// Spawn the CLI; a wall-clock timeout kills it (SIGTERM, then SIGKILL after 10 s).
export function execute({ bin = "claude", args, cwd, timeoutMs, env = childEnv() }) {
  return new Promise((resolvePromise, reject) => {
    const started = Date.now();
    const child = spawn(bin, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    const out = [];
    const err = [];
    let timedOut = false;
    let killer;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      killer = setTimeout(() => child.kill("SIGKILL"), 10_000);
    }, timeoutMs);
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => err.push(d));
    child.on("error", (e) => {
      clearTimeout(timer);
      clearTimeout(killer);
      reject(e);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      clearTimeout(killer);
      resolvePromise({ code, signal, timedOut, stdout: Buffer.concat(out).toString("utf8"), stderr: Buffer.concat(err).toString("utf8"), wall_ms: Date.now() - started });
    });
  });
}

// A per-run temp dir holding the settings file (and the nested-agent shims), removed afterwards.
function withSettingsFile(settings, fn) {
  const dir = mkdtempSync(join(tmpdir(), "evals-settings-"));
  const path = join(dir, "settings.json");
  writeFileSync(path, `${JSON.stringify(settings, null, 2)}\n`);
  return Promise.resolve(fn(path, dir)).finally(() => rmSync(dir, { recursive: true, force: true }));
}

// Writer role. Runs in `workspace` (already staged). Returns the runner's writer result plus
// the raw transcript (the runner saves and hashes it).
export async function write({ workspace, prompt, model, caps, mode, root, timeoutMs, bin = "claude", home = homedir(), weaken = false }) {
  const settings = settingsFor({ mode, root, home, weaken });
  const version = cliVersion(bin);
  return withSettingsFile(settings, async (settingsPath, dir) => {
    const args = writerArgs({ prompt, model, maxTurns: caps.max_turns, maxBudgetUsd: caps.max_usd, settingsPath });
    const env = weaken ? childEnv() : withShimPath(childEnv(), makeShimDir(dir));
    const proc = await execute({ bin: resolveBin(bin), args, cwd: workspace, timeoutMs, env });
    const { init, result } = parseStream(proc.stdout);
    const s = summarise(result);
    const flags = [];
    if (proc.timedOut || !result || proc.code !== 0 || s.is_error) flags.push("failed");
    if (s.subtype === "error_max_turns" || s.subtype === "error_max_budget_usd") flags.push("over_budget");
    return {
      model,
      model_actual: s.model_actual,
      cli_version: version,
      recipe_sha256: recipeHash(mode, { weaken }),
      duration_ms: s.duration_ms ?? proc.wall_ms,
      turns: s.turns,
      cost_usd: s.cost_usd,
      cost_basis: "list",
      usage: s.usage,
      network: mode !== "fixed",
      flags,
      transcript: proc.stdout,
      stderr: proc.stderr,
      timed_out: proc.timedOut,
      exit_code: proc.code,
      init,
      result_text: s.text,
    };
  });
}

// Critic role: no tools; the answer is structured JSON when a schema is given. Runs from an
// empty temp dir with the same deny rules, so even a misconfigured tool list could not read the
// repo. Returns { output, model_actual, cost_usd, turns, usage, ok, error }.
export async function critic({ prompt, model, jsonSchema, root, timeoutMs = 15 * 60_000, maxBudgetUsd, bin = "claude", home = homedir() }) {
  const settings = settingsFor({ mode: "fixed", root, home });
  const cwd = mkdtempSync(join(tmpdir(), "evals-critic-"));
  try {
    return await withSettingsFile(settings, async (settingsPath) => {
      const proc = await execute({ bin, args: criticArgs({ prompt, model, maxBudgetUsd, settingsPath, jsonSchema }), cwd, timeoutMs });
      const { result } = parseStream(proc.stdout);
      const s = summarise(result);
      let output = s.structured_output;
      if (output === null && jsonSchema && s.text) {
        try {
          output = JSON.parse(s.text);
        } catch {
          output = null;
        }
      }
      const ok = !proc.timedOut && proc.code === 0 && !s.is_error && (jsonSchema ? output !== null : s.text !== null);
      return {
        ok,
        error: ok ? null : proc.timedOut ? "timeout" : s.subtype || proc.stderr.trim().slice(0, 500) || `exit ${proc.code}`,
        output: jsonSchema ? output : s.text,
        model_actual: s.model_actual,
        cost_usd: s.cost_usd,
        turns: s.turns,
        usage: s.usage,
        cli_version: cliVersion(bin),
      };
    });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}
