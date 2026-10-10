// Claude recipe without agent calls: the settings file, the flags, the recipe hash, the child
// environment, stream-json parsing, and the writer and critic roles driven through a fake
// `claude` binary that prints a canned stream-json transcript.

import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as claude from "./claude.mjs";
import { sharedTmpDirs } from "./runtmp.mjs";
import { OWN_SITES } from "../opennet.mjs";
import { fakeClaudeBin } from "../fixture-staging.mjs";

const ROOT = "/Users/someone/src/datapressr";
const HOME = "/Users/someone";

test("fixed-mode settings deny the repo and the user's agent and credential dirs, the web and the network", () => {
  const s = claude.settingsFor({ mode: "fixed", root: ROOT, home: HOME, sharedTmp: sharedTmpDirs(501) });
  // The shared Claude temp dir (other sessions' scratchpads) is denied like the repo (datapressr-hcn.23).
  const dirs = [ROOT, `${HOME}/.claude`, `${HOME}/.codex`, `${HOME}/.agents`, `${HOME}/.config/gh`, `${HOME}/.ssh`, "/tmp/claude-501", "/private/tmp/claude-501"];
  assert.deepEqual(s.permissions.deny, [...dirs.flatMap((d) => [`Read(/${d}/**)`, `Edit(/${d}/**)`]), "Bash(claude:*)", "Bash(codex:*)", "WebFetch", "WebSearch"]);
  assert.ok(s.permissions.deny.includes("Read(//Users/someone/src/datapressr/**)"), "absolute paths use the // prefix");
  assert.equal(s.permissions.allow, undefined, "allowed tools come from --allowedTools, not the settings file");
  assert.deepEqual(s.sandbox, {
    enabled: true,
    autoAllowBashIfSandboxed: true,
    allowUnsandboxedCommands: false,
    filesystem: { denyRead: dirs },
    network: { allowedDomains: [] },
  });
});

test("the weakened recipe drops only the read/edit denies, denyRead and the nested-agent denies, and hashes differently", () => {
  const w = claude.settingsFor({ mode: "fixed", root: ROOT, home: HOME, weaken: true });
  assert.deepEqual(w.permissions.deny, ["WebFetch", "WebSearch"]);
  assert.deepEqual(w.sandbox.filesystem, {});
  assert.deepEqual(w.sandbox.network, { allowedDomains: [] });
  assert.notEqual(claude.recipeHash("fixed"), claude.recipeHash("fixed", { weaken: true }));
  assert.equal(claude.recipeHash("fixed"), claude.recipeHash("fixed"), "stable");
  assert.match(claude.recipeHash("fixed"), /^[0-9a-f]{64}$/);
  assert.throws(() => claude.settingsFor({ mode: "other", root: ROOT, home: HOME }), /unknown mode/);
});

test("open-mode settings: same filesystem and nested-agent rules, web tools except the own sites, shell on the data-host allowlist", () => {
  const fixed = claude.settingsFor({ mode: "fixed", root: ROOT, home: HOME, sharedTmp: sharedTmpDirs(501) });
  const open = claude.settingsFor({ mode: "open", root: ROOT, home: HOME, sharedTmp: sharedTmpDirs(501) });
  const reads = fixed.permissions.deny.filter((r) => r !== "WebFetch" && r !== "WebSearch");
  assert.deepEqual(open.permissions.deny, [...reads, ...OWN_SITES.map((d) => `WebFetch(domain:${d})`)]);
  assert.ok(!open.permissions.deny.includes("WebSearch") && !open.permissions.deny.includes("WebFetch"));
  assert.deepEqual(open.sandbox.filesystem, fixed.sandbox.filesystem);
  assert.equal(open.sandbox.allowUnsandboxedCommands, false);
  assert.deepEqual(open.sandbox.network.deniedDomains, OWN_SITES);
  assert.ok(open.sandbox.network.allowedDomains.includes("ourworldindata.org"));
  // Claude Code's sandbox rejects a bare "*" and TLD wildcards in allowedDomains.
  for (const d of open.sandbox.network.allowedDomains) assert.match(d, /^(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)+$/, d);
  for (const d of OWN_SITES) assert.ok(!open.sandbox.network.allowedDomains.includes(d), d);
  const args = claude.writerArgs({ prompt: "P", model: "m", maxTurns: 1, maxBudgetUsd: 1, settingsPath: "/s", mode: "open" });
  assert.equal(args[args.indexOf("--tools") + 1], "Read,Write,Edit,Glob,Grep,Bash,WebFetch,WebSearch");
  assert.equal(args[args.indexOf("--allowedTools") + 1], "Read,Write,Edit,Glob,Grep,Bash,WebFetch,WebSearch");
  assert.notEqual(claude.recipeHash("open"), claude.recipeHash("fixed"));
  assert.equal(claude.recipeTemplate("fixed").args.join(" ").includes("WebFetch"), false, "fixed-mode args unchanged");
});

test("the recipe hash does not depend on machine paths, model or caps", () => {
  const t = claude.recipeTemplate("fixed");
  const text = JSON.stringify(t);
  assert.ok(!text.includes(HOME) && !text.includes(process.env.HOME || "/nonexistent-home"), "no machine paths");
  assert.ok(text.includes("<model>") && text.includes("<settings>"));
  assert.equal(t.version, 3, "recipe 3: per-run temp dir, shared temp dir denied");
  assert.ok(text.includes("<shim bin>") && text.includes("NESTED_AGENT_BLOCKED"), "the shim is part of the hash");
  assert.equal(t.env.CLAUDE_CODE_TMPDIR, "<run tmp>", "the per-run temp dir is part of the hash");
  assert.ok(t.settings.sandbox.filesystem.denyRead.includes("/tmp/claude-<uid>"), "no machine uid in the hash");
  assert.deepEqual(claude.recipeTemplate("fixed", { weaken: true }).env, {}, "the weakened recipe has no shim");
});

test("writer flags are the section 4.3 recipe", () => {
  const args = claude.writerArgs({ prompt: "P", model: "claude-haiku-5-5", maxTurns: 6, maxBudgetUsd: 0.05, settingsPath: "/x/settings.json" });
  const flag = (f) => args[args.indexOf(f) + 1];
  assert.equal(args[0], "-p");
  assert.equal(args[1], "P");
  assert.equal(flag("--model"), "claude-haiku-5-5");
  assert.equal(flag("--max-turns"), "6");
  assert.equal(flag("--max-budget-usd"), "0.05");
  assert.equal(flag("--setting-sources"), "project");
  assert.equal(flag("--permission-mode"), "dontAsk");
  assert.equal(flag("--allowedTools"), "Read,Write,Edit,Glob,Grep,Bash");
  assert.equal(flag("--tools"), "Read,Write,Edit,Glob,Grep,Bash");
  assert.equal(flag("--settings"), "/x/settings.json");
  assert.equal(flag("--output-format"), "stream-json");
  for (const f of ["--disable-slash-commands", "--no-session-persistence", "--strict-mcp-config", "--verbose"]) assert.ok(args.includes(f), f);
  assert.ok(!args.includes("bypassPermissions"), "bypassPermissions lets curl through the sandbox");

  const c = claude.criticArgs({ prompt: "P", model: "m", settingsPath: "/s", jsonSchema: { type: "object" } });
  assert.equal(c[c.indexOf("--tools") + 1], "", "critic has no tools");
  assert.equal(c[c.indexOf("--json-schema") + 1], '{"type":"object"}');
});

test("the writer environment: shim and per-run temp dir, or neither when weakened", () => {
  const env = claude.writerEnv({ shimBin: "/s/bin", runTmp: "/tmp/evt-x", env: { PATH: "/usr/bin", TMPDIR: "/var/T/", CLAUDE_CODE_TMPDIR: "/elsewhere" } });
  assert.deepEqual(env, { PATH: "/s/bin:/usr/bin", TMPDIR: "/tmp/evt-x", CLAUDE_CODE_TMPDIR: "/tmp/evt-x" });
  assert.deepEqual(claude.writerEnv({ weaken: true, env: { PATH: "/usr/bin", TMPDIR: "/var/T/" } }), { PATH: "/usr/bin", TMPDIR: "/var/T/" });
});

test("the child environment drops the parent Claude Code session but keeps auth", () => {
  const env = claude.childEnv({ PATH: "/usr/bin", HOME, CLAUDECODE: "1", CLAUDE_CODE_ENTRYPOINT: "cli", CLAUDE_CODE_SESSION_ID: "s", CLAUDE_PID: "1", CLAUDE_CODE_OAUTH_TOKEN: "t", ANTHROPIC_API_KEY: "k" });
  assert.deepEqual(env, { PATH: "/usr/bin", HOME, CLAUDE_CODE_OAUTH_TOKEN: "t", ANTHROPIC_API_KEY: "k" });
});

test("modelActual picks the model that did the work", () => {
  assert.equal(claude.modelActual({ modelUsage: { "claude-haiku-5-5": { costUSD: 0.001, outputTokens: 10 }, "claude-opus-5-5": { costUSD: 2.5, outputTokens: 9000 } } }), "claude-opus-5-5");
  assert.equal(claude.modelActual({}), null);
});

test("writer role: runs the recipe in the workspace, parses the result, removes its settings file", async () => {
  const fake = fakeClaudeBin();
  const ws = mkdtempSync(join(tmpdir(), "evals-ws-"));
  try {
    const out = await claude.write({ workspace: ws, prompt: "Write a story", model: "claude-haiku-5-5", caps: { max_usd: 1, max_turns: 5 }, mode: "fixed", root: ROOT, home: HOME, timeoutMs: 30_000, bin: fake.bin });
    assert.equal(out.cli_version, "9.9.9");
    assert.equal(out.model_actual, "claude-haiku-5-5");
    assert.equal(out.turns, 3);
    assert.equal(out.cost_usd, 0.0123);
    assert.equal(out.cost_basis, "list");
    assert.equal(out.recipe_sha256, claude.recipeHash("fixed"));
    assert.deepEqual(out.flags, []);
    assert.equal(out.network, false);
    assert.ok(existsSync(join(ws, "site/stories/fake.md")));
    assert.deepEqual(fake.settings(), claude.settingsFor({ mode: "fixed", root: ROOT, home: HOME }));
    const argv = fake.argv();
    assert.equal(argv[1], "Write a story");
    assert.ok(!existsSync(argv[argv.indexOf("--settings") + 1]), "settings file removed after the run");
    // A nested `claude` from inside the run hits the shim first on PATH, which refuses to run.
    const env = fake.env();
    assert.match(env.PATH.split(":")[0], /evals-settings-.*\/bin$/);
    assert.equal(env.nested.status, 126);
    assert.match(env.nested.stderr, /NESTED_AGENT_BLOCKED/);
    assert.ok(!existsSync(env.PATH.split(":")[0]), "shim dir removed after the run");

    await claude.write({ workspace: ws, prompt: "x", model: "m", caps: { max_usd: 1, max_turns: 5 }, mode: "fixed", root: ROOT, home: HOME, timeoutMs: 30_000, bin: fake.bin, weaken: true });
    assert.ok(!/evals-settings-/.test(fake.env().PATH.split(":")[0]), "the weakened recipe has no shim");
  } finally {
    rmSync(ws, { recursive: true, force: true });
    rmSync(fake.dir, { recursive: true, force: true });
  }
});

test("writer role flags failed and over_budget from the result; the timeout kills the process", async () => {
  const fake = fakeClaudeBin({ isError: true });
  const ws = mkdtempSync(join(tmpdir(), "evals-ws-"));
  try {
    const out = await claude.write({ workspace: ws, prompt: "x", model: "m", caps: { max_usd: 1, max_turns: 5 }, mode: "fixed", root: ROOT, home: HOME, timeoutMs: 30_000, bin: fake.bin });
    assert.deepEqual(out.flags.sort(), ["failed", "over_budget"]);

    const slow = join(fake.dir, "slow");
    writeFileSync(slow, `#!/bin/sh\nexec sleep 30\n`);
    chmodSync(slow, 0o755);
    const proc = await claude.execute({ bin: slow, args: [], cwd: ws, timeoutMs: 200 });
    assert.equal(proc.timedOut, true);
  } finally {
    rmSync(ws, { recursive: true, force: true });
    rmSync(fake.dir, { recursive: true, force: true });
  }
});

test("critic role: no tools, structured output returned", async () => {
  const fake = fakeClaudeBin();
  try {
    const res = await claude.critic({ prompt: "Judge", model: "claude-sonnet-5-5", jsonSchema: { type: "object" }, root: ROOT, home: HOME, bin: fake.bin });
    assert.equal(res.ok, true);
    assert.deepEqual(res.output, { verdict: "ok" });
    const argv = fake.argv();
    assert.equal(argv[argv.indexOf("--tools") + 1], "");
  } finally {
    rmSync(fake.dir, { recursive: true, force: true });
  }
});
