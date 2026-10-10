// Codex CLI adapter (design section 4.3): `codex exec` with a throwaway home for a blind run.
//
// Isolation: HOME and CODEX_HOME point at a per-run temp dir that holds only a copy of the
// user's auth.json (removed with the dir afterwards), so the user's config.toml, AGENTS.md,
// memories, sessions, ~/.codex/skills and ~/.agents/skills never load and nothing is written to
// the real ~/.codex. The flags turn off the surfaces that would reach past the sandbox: ChatGPT
// apps/connectors, plugins, browser and computer use, image generation, memories, hooks, and web
// search (fixed mode). What it does NOT prevent: under `workspace-write` the agent's shell can
// still read any file the user can (the parent repo, ~/.claude, the real ~/.codex) by absolute
// path. Those reads are detected by the leak scan, not blocked; the canary records that they are
// possible. A per-run shim directory first on PATH makes `claude` and `codex` refuse to run inside
// the session (./nested.mjs); an absolute path to the real binary is caught by the leak scan.
// TMPDIR is a per-run dir under /tmp (./runtmp.mjs), not our own temp dir, where every eval
// workspace and temp home lives.
//
// Writer role: `--sandbox workspace-write` in the staged workspace; network off unless open mode.
// Critic role: `--sandbox read-only` from an empty temp dir, `--output-schema` for structured
// output, `-i` for chart images. Codex reports tokens, not money: cost_usd and cost_basis are null.

import { execFileSync, spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { sha256 } from "../versions.mjs";
import { makeShimDir, resolveBin, shimTemplate, withShimPath } from "./nested.mjs";
import { makeRunTmp, removeRunTmp } from "./runtmp.mjs";

export const vendor = "codex";
export const staged = true;
export const needsCanary = true;

// Recipe version: bump when the recipe changes in a way the template below cannot see.
// 2: nested agent CLIs shimmed on PATH (datapressr-hcn.19).
// 3: per-run TMPDIR (datapressr-hcn.23).
const RECIPE_VERSION = 3;

// Features that would give the run reach beyond the workspace sandbox or the user's own state.
export const DISABLED_FEATURES = ["apps", "plugins", "remote_plugin", "browser_use", "computer_use", "image_generation", "memories", "hooks"];

export function authSource(home = homedir()) {
  return join(process.env.CODEX_HOME || join(home, ".codex"), "auth.json");
}

// A fresh home holding only a copy of auth.json (mode 600). The caller removes it.
export function makeHome({ authFile = authSource(), tmpRoot = tmpdir() } = {}) {
  const dir = realpathSync(mkdtempSync(join(tmpRoot, "evals-codex-home-")));
  if (existsSync(authFile)) {
    copyFileSync(authFile, join(dir, "auth.json"));
    execFileSync("chmod", ["600", join(dir, "auth.json")]);
  }
  return dir;
}

function flagsFor({ model, cwd, sandbox, mode, lastPath }) {
  const args = ["exec", "-C", cwd, "--skip-git-repo-check", "--ephemeral", "--ignore-user-config", "--ignore-rules", "--json", "-o", lastPath, "-m", model, "--sandbox", sandbox];
  for (const f of DISABLED_FEATURES) args.push("--disable", f);
  // No login shell: macOS's /etc/zprofile (path_helper) would move /opt/homebrew/bin ahead of the
  // nested-agent shim on PATH.
  args.push("-c", "allow_login_shell=false");
  if (mode === "open") args.push("-c", "sandbox_workspace_write.network_access=true");
  else args.push("-c", 'web_search="disabled"');
  return args;
}

export function writerArgs({ prompt, model, cwd, mode, lastPath }) {
  if (mode !== "fixed" && mode !== "open") throw new Error(`unknown mode ${mode}`);
  return [...flagsFor({ model, cwd, sandbox: "workspace-write", mode, lastPath }), "--", prompt];
}

export function criticArgs({ prompt, model, cwd, lastPath, schemaPath, images = [] }) {
  const args = flagsFor({ model, cwd, sandbox: "read-only", mode: "fixed", lastPath });
  if (schemaPath) args.push("--output-schema", schemaPath);
  for (const img of images) args.push("-i", img);
  return [...args, "--", prompt];
}

// The child's environment: ours minus parent agent-session markers, with HOME and CODEX_HOME at
// the temp home and TMPDIR at the per-run temp dir when given. `weaken` (canary negative control
// only) keeps the real HOME, so ~/.agents/skills load, and drops the nested-agent shim and the
// per-run TMPDIR; CODEX_HOME stays temporary so the real ~/.codex is never written.
export function childEnv({ home, env = process.env, weaken = false, shimBin, tmp }) {
  const out = {};
  for (const [k, v] of Object.entries(env)) {
    if (k === "CLAUDECODE" || k.startsWith("CLAUDE_CODE_") || k === "CLAUDE_PID" || k === "CLAUDE_EFFORT") continue;
    if (k.startsWith("CODEX_")) continue;
    out[k] = v;
  }
  if (!weaken) out.HOME = home;
  out.CODEX_HOME = home;
  if (tmp && !weaken) out.TMPDIR = tmp;
  return shimBin && !weaken ? withShimPath(out, shimBin) : out;
}

// What the recipe hash covers: flags and environment with machine paths as placeholders.
export function recipeTemplate(mode, { weaken = false } = {}) {
  return {
    vendor,
    version: RECIPE_VERSION,
    mode,
    weaken,
    args: writerArgs({ prompt: "<prompt>", model: "<model>", cwd: "<workspace>", mode, lastPath: "<last>" }),
    env: { HOME: weaken ? "<user home>" : "<temp home>", CODEX_HOME: "<temp home>", home_contents: ["auth.json"], ...(weaken ? {} : { nested_agents: shimTemplate(), TMPDIR: "<run tmp>/tmp" }) },
  };
}

export function recipeHash(mode, opts = {}) {
  return sha256(JSON.stringify(recipeTemplate(mode, opts)));
}

export function cliVersion(bin = "codex") {
  const out = execFileSync(bin, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const m = out.match(/\d+\.\d+\.\d+\S*/);
  if (!m) throw new Error(`cannot parse ${bin} --version output: ${out.trim()}`);
  return m[0];
}

// Auth check without a model call: `codex login status` against a temp home with the auth copy.
export function authOk({ bin = "codex", authFile = authSource() } = {}) {
  if (!existsSync(authFile)) return { ok: false, reason: `no Codex auth file at ${authFile} (run codex login)` };
  const home = makeHome({ authFile });
  try {
    const out = execFileSync(bin, ["login", "status"], { encoding: "utf8", env: childEnv({ home }), stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, reason: out.trim() };
  } catch (e) {
    return { ok: false, reason: `codex login status failed: ${String(e.stdout || e.stderr || e.message).trim().slice(0, 200)}` };
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

const TOOL_ITEMS = new Set(["command_execution", "file_change", "mcp_tool_call", "web_search", "collab_tool_call"]);

// Parse `codex exec --json` output: one event per line. Turns are counted as tool-call items
// plus the final answer (codex exec has a single user turn); usage is summed over
// turn.completed events; the model comes from any event that names one. codex-cli 0.161.0 names
// none (and its temp-home log does not record it either), so model_actual is then null and the
// requested model is in `model`.
export function parseEvents(text) {
  const events = [];
  for (const line of String(text).split("\n")) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      /* non-JSON noise is ignored */
    }
  }
  const items = new Map();
  let usage = null;
  let model = null;
  let failed = null;
  for (const e of events) {
    if ((e.type === "item.started" || e.type === "item.completed" || e.type === "item.updated") && e.item?.id) items.set(e.item.id, e.item);
    if (e.type === "turn.completed" && e.usage) {
      usage ??= {};
      for (const [k, v] of Object.entries(e.usage)) if (typeof v === "number") usage[k] = (usage[k] ?? 0) + v;
    }
    if (e.type === "turn.failed" || e.type === "error") failed = e.error?.message ?? e.message ?? e.type;
    const m = e.model ?? e.item?.model ?? e.turn?.model;
    if (typeof m === "string" && m) model = m;
  }
  const list = [...items.values()];
  const toolCalls = list.filter((i) => TOOL_ITEMS.has(i.type)).length;
  const messages = list.filter((i) => i.type === "agent_message");
  const completed = events.some((e) => e.type === "turn.completed");
  return { events, items: list, usage, model_actual: model, turns: completed ? toolCalls + 1 : toolCalls, last_message: messages.length ? messages[messages.length - 1].text : null, completed, failed };
}

// What ended up in the temp home after a run: evidence for the canary (skills the CLI installed,
// whether apps or plugins were fetched, memory rows). Read before the home is removed.
export function inspectHome(home) {
  const ls = (p) => {
    try {
      return readdirSync(p).sort();
    } catch {
      return [];
    }
  };
  // node:sqlite is built into Node 22.5+; best effort (null when unreadable).
  const query = (file, fn) => {
    if (!existsSync(file)) return null;
    try {
      const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
      // Not readOnly: the CLI leaves its logs in WAL mode, which a read-only open cannot see. The
      // file is in the temp home and is deleted with it.
      const db = new DatabaseSync(file);
      try {
        return fn(db);
      } finally {
        db.close();
      }
    } catch {
      return null;
    }
  };
  // Memories live in stage1_outputs (codex-cli 0.161.0); other tables are bookkeeping. Any
  // unknown table is counted too, so a schema change fails safe.
  const BOOKKEEPING = new Set(["_sqlx_migrations", "jobs", "consolidation_progress"]);
  const memoryRows = query(join(home, "memories_1.sqlite"), (db) => {
    let n = 0;
    for (const { name } of db.prepare("select name from sqlite_master where type='table' and name not like 'sqlite_%'").all()) {
      if (!BOOKKEEPING.has(name)) n += db.prepare(`select count(*) as n from "${name.replace(/"/g, '""')}"`).get().n;
    }
    return n;
  });
  return {
    entries: ls(home),
    skills: ls(join(home, "skills")).filter((n) => !n.startsWith(".")),
    system_skills: ls(join(home, "skills", ".system")).filter((n) => !n.startsWith(".")),
    plugins_cache: ls(join(home, "plugins", "cache")),
    apps_cache: ls(join(home, "cache")).filter((n) => /apps/i.test(n)),
    memory_rows: memoryRows,
    memories_dir: ls(join(home, "memories")),
  };
}

// Spawn the CLI with stdin closed; a wall-clock timeout kills it (SIGTERM, then SIGKILL).
export function execute({ bin = "codex", args, cwd, env, timeoutMs }) {
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

// Run one codex exec in a fresh temp home, nested-agent shim dir and (unless weakened) per-run
// temp dir, all removed afterwards. fn gets (home, env, runTmp).
async function withHome({ authFile, weaken = false }, fn) {
  const home = makeHome({ authFile });
  const shim = realpathSync(mkdtempSync(join(tmpdir(), "evals-shim-")));
  const runTmp = weaken ? null : makeRunTmp();
  try {
    return await fn(home, childEnv({ home, weaken, shimBin: makeShimDir(shim), tmp: runTmp?.codexTmp }), runTmp);
  } finally {
    rmSync(home, { recursive: true, force: true });
    rmSync(shim, { recursive: true, force: true });
    removeRunTmp(runTmp);
  }
}

const readText = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

// Writer role. Same interface and result shape as the Claude adapter; `home_report` is the temp
// home inventory (used by the canary), `init` is null (Codex has no init event).
export async function write({ workspace, prompt, model, caps, mode, timeoutMs, bin = "codex", authFile = authSource(), weaken = false }) {
  const version = cliVersion(bin);
  return withHome({ authFile, weaken }, async (home, env, runTmp) => {
    const lastPath = join(home, "last.md");
    const proc = await execute({ bin: resolveBin(bin), args: writerArgs({ prompt, model, cwd: workspace, mode, lastPath }), cwd: workspace, env, timeoutMs });
    const p = parseEvents(proc.stdout);
    const last = readText(lastPath);
    const home_report = inspectHome(home);
    const flags = [];
    if (proc.timedOut || proc.code !== 0 || !p.completed || p.failed) flags.push("failed");
    if (p.turns > caps.max_turns) flags.push("over_budget");
    return {
      model,
      model_actual: p.model_actual,
      cli_version: version,
      recipe_sha256: recipeHash(mode, { weaken }),
      duration_ms: proc.wall_ms,
      turns: p.turns,
      cost_usd: null,
      cost_basis: null,
      usage: p.usage,
      network: mode !== "fixed",
      flags,
      transcript: proc.stdout,
      stderr: proc.stderr,
      timed_out: proc.timedOut,
      exit_code: proc.code,
      init: null,
      result_text: last ?? p.last_message,
      home_report,
      // The per-run temp dir (every spelling): the leak scan allows it. Empty when weakened.
      tmp_dirs: runTmp ? runTmp.dirs : [],
    };
  });
}

// Critic role: read-only sandbox from an empty temp dir, structured output via --output-schema,
// chart images via -i. Returns { ok, error, output, model_actual, cost_usd, turns, usage, cli_version }.
export async function critic({ prompt, model, jsonSchema, images = [], timeoutMs = 15 * 60_000, bin = "codex", authFile = authSource() }) {
  const version = cliVersion(bin);
  const cwd = realpathSync(mkdtempSync(join(tmpdir(), "evals-critic-")));
  try {
    return await withHome({ authFile }, async (home, env) => {
      const lastPath = join(home, "last.md");
      let schemaPath;
      if (jsonSchema) {
        schemaPath = join(home, "schema.json");
        writeFileSync(schemaPath, typeof jsonSchema === "string" ? jsonSchema : JSON.stringify(jsonSchema));
      }
      const proc = await execute({ bin: resolveBin(bin), args: criticArgs({ prompt, model, cwd, lastPath, schemaPath, images }), cwd, env, timeoutMs });
      const p = parseEvents(proc.stdout);
      const text = readText(lastPath) ?? p.last_message;
      let output = text;
      if (jsonSchema) {
        try {
          output = JSON.parse(text);
        } catch {
          output = null;
        }
      }
      const ok = !proc.timedOut && proc.code === 0 && p.completed && !p.failed && output !== null;
      return {
        ok,
        error: ok ? null : proc.timedOut ? "timeout" : p.failed || proc.stderr.trim().slice(0, 500) || `exit ${proc.code}`,
        output,
        model_actual: p.model_actual,
        cost_usd: null,
        turns: p.turns,
        usage: p.usage,
        cli_version: version,
      };
    });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}
