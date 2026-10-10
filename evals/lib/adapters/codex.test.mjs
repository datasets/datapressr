// Codex recipe without agent calls: flags, temp home, child environment, recipe hash, event
// parsing, and the writer and critic roles driven through a fake `codex` binary.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as codex from "./codex.mjs";
import { fakeCodexBin } from "../fixture-staging.mjs";

function authFixture() {
  const dir = mkdtempSync(join(tmpdir(), "evals-codexauth-"));
  const authFile = join(dir, "auth.json");
  writeFileSync(authFile, '{"token":"not-a-real-token"}\n');
  return { dir, authFile };
}

test("writer flags are the section 4.3 recipe, with the reach-out features off", () => {
  const args = codex.writerArgs({ prompt: "P", model: "gpt-6-luna", cwd: "/ws", mode: "fixed", lastPath: "/h/last.md" });
  const flag = (f) => args[args.indexOf(f) + 1];
  assert.equal(args[0], "exec");
  assert.equal(flag("-C"), "/ws");
  assert.equal(flag("-m"), "gpt-6-luna");
  assert.equal(flag("--sandbox"), "workspace-write");
  assert.equal(flag("-o"), "/h/last.md");
  for (const f of ["--skip-git-repo-check", "--ephemeral", "--ignore-user-config", "--json"]) assert.ok(args.includes(f), f);
  const disabled = args.flatMap((a, i) => (a === "--disable" ? [args[i + 1]] : []));
  assert.deepEqual(disabled, codex.DISABLED_FEATURES);
  for (const f of ["apps", "plugins", "memories", "browser_use", "computer_use"]) assert.ok(disabled.includes(f), f);
  assert.ok(args.includes('web_search="disabled"'), "no web search in fixed mode");
  assert.ok(!args.some((a) => a.includes("network_access")), "no network in fixed mode");
  assert.deepEqual(args.slice(-2), ["--", "P"]);

  const open = codex.writerArgs({ prompt: "P", model: "m", cwd: "/ws", mode: "open", lastPath: "/l" });
  assert.ok(open.includes("sandbox_workspace_write.network_access=true"));

  const c = codex.criticArgs({ prompt: "J", model: "gpt-6-astra", cwd: "/c", lastPath: "/l", schemaPath: "/s.json", images: ["/a.png", "/b.png"] });
  assert.equal(c[c.indexOf("--sandbox") + 1], "read-only");
  assert.equal(c[c.indexOf("--output-schema") + 1], "/s.json");
  assert.deepEqual(c.flatMap((a, i) => (a === "-i" ? [c[i + 1]] : [])), ["/a.png", "/b.png"]);
});

test("the child environment points HOME and CODEX_HOME at the temp home and drops session markers", () => {
  const env = codex.childEnv({ home: "/tmp/h", env: { PATH: "/usr/bin", HOME: "/Users/x", CODEX_HOME: "/Users/x/.codex", CODEX_SANDBOX: "seatbelt", CLAUDECODE: "1", OPENAI_API_KEY: "k" } });
  assert.deepEqual(env, { PATH: "/usr/bin", HOME: "/tmp/h", CODEX_HOME: "/tmp/h", OPENAI_API_KEY: "k" });
  const weak = codex.childEnv({ home: "/tmp/h", env: { HOME: "/Users/x" }, weaken: true });
  assert.deepEqual(weak, { HOME: "/Users/x", CODEX_HOME: "/tmp/h" }, "weakened keeps the real HOME, never the real CODEX_HOME");
});

test("the recipe hash is stable, path-free and changes with mode and weaken", () => {
  assert.match(codex.recipeHash("fixed"), /^[0-9a-f]{64}$/);
  assert.equal(codex.recipeHash("fixed"), codex.recipeHash("fixed"));
  assert.notEqual(codex.recipeHash("fixed"), codex.recipeHash("open"));
  assert.notEqual(codex.recipeHash("fixed"), codex.recipeHash("fixed", { weaken: true }));
  const text = JSON.stringify(codex.recipeTemplate("fixed"));
  assert.ok(!text.includes(process.env.HOME || "/nonexistent-home"));
  assert.ok(text.includes("<model>") && text.includes("<workspace>"));
});

test("makeHome copies only auth.json, mode 600", () => {
  const a = authFixture();
  const home = codex.makeHome({ authFile: a.authFile });
  try {
    assert.deepEqual(codex.inspectHome(home).entries, ["auth.json"]);
    const { statSync } = process.getBuiltinModule("node:fs");
    assert.equal(statSync(join(home, "auth.json")).mode & 0o777, 0o600);
  } finally {
    rmSync(home, { recursive: true, force: true });
    rmSync(a.dir, { recursive: true, force: true });
  }
});

test("parseEvents: turns, summed usage, last message, failures", () => {
  const ev = (o) => JSON.stringify(o);
  const t = [
    ev({ type: "thread.started", thread_id: "x" }),
    ev({ type: "item.started", item: { id: "a", type: "command_execution", command: "ls", status: "in_progress" } }),
    ev({ type: "item.completed", item: { id: "a", type: "command_execution", command: "ls", status: "completed" } }),
    ev({ type: "item.completed", item: { id: "b", type: "file_change", changes: [] } }),
    ev({ type: "item.completed", item: { id: "c", type: "reasoning", text: "…" } }),
    ev({ type: "item.completed", item: { id: "d", type: "agent_message", text: "done" } }),
    "not json",
    ev({ type: "turn.completed", usage: { input_tokens: 10, output_tokens: 2 } }),
    ev({ type: "turn.completed", usage: { input_tokens: 5, output_tokens: 1 } }),
  ].join("\n");
  const p = codex.parseEvents(t);
  assert.equal(p.turns, 3, "two tool calls plus the answer");
  assert.deepEqual(p.usage, { input_tokens: 15, output_tokens: 3 });
  assert.equal(p.last_message, "done");
  assert.equal(p.model_actual, null);
  assert.equal(p.completed, true);
  assert.equal(codex.parseEvents(ev({ type: "turn.failed", error: { message: "quota" } })).failed, "quota");
  assert.equal(codex.parseEvents(ev({ type: "turn.started", model: "gpt-x" })).model_actual, "gpt-x");
});

test("writer role: runs in the workspace with a temp home holding only auth.json, removed afterwards", async () => {
  const fake = fakeCodexBin();
  const a = authFixture();
  const ws = mkdtempSync(join(tmpdir(), "evals-ws-"));
  try {
    const out = await codex.write({ workspace: ws, prompt: "Write a story", model: "gpt-6-luna", caps: { max_usd: 1, max_turns: 5 }, mode: "fixed", timeoutMs: 30_000, bin: fake.bin, authFile: a.authFile });
    assert.equal(out.cli_version, "7.7.7");
    assert.equal(out.turns, 3);
    assert.equal(out.cost_usd, null);
    assert.equal(out.cost_basis, null);
    assert.deepEqual(out.usage, { input_tokens: 100, cached_input_tokens: 40, output_tokens: 7 });
    assert.equal(out.recipe_sha256, codex.recipeHash("fixed"));
    assert.deepEqual(out.flags, []);
    assert.equal(out.network, false);
    assert.equal(out.result_text, "DONE");
    assert.deepEqual(out.home_report.system_skills, ["imagegen"]);
    assert.deepEqual(out.home_report.plugins_cache, []);
    assert.ok(existsSync(join(ws, "site/stories/fake.md")));
    const env = fake.env();
    assert.equal(env.HOME, env.CODEX_HOME);
    assert.notEqual(env.HOME, process.env.HOME);
    assert.deepEqual(env.homeFiles, ["auth.json"], "the home holds only the auth copy when the CLI starts");
    assert.ok(!existsSync(env.CODEX_HOME), "temp home removed after the run");
    assert.equal(fake.argv()[fake.argv().indexOf("-C") + 1], ws);
    assert.ok(existsSync(a.authFile), "the source auth file is untouched");
  } finally {
    rmSync(ws, { recursive: true, force: true });
    rmSync(fake.dir, { recursive: true, force: true });
    rmSync(a.dir, { recursive: true, force: true });
  }
});

test("writer role flags a failed turn", async () => {
  const fake = fakeCodexBin({ fail: true });
  const a = authFixture();
  const ws = mkdtempSync(join(tmpdir(), "evals-ws-"));
  try {
    const out = await codex.write({ workspace: ws, prompt: "x", model: "m", caps: { max_usd: 1, max_turns: 5 }, mode: "fixed", timeoutMs: 30_000, bin: fake.bin, authFile: a.authFile });
    assert.deepEqual(out.flags, ["failed"]);
    const ok = fakeCodexBin();
    const over = await codex.write({ workspace: ws, prompt: "x", model: "m", caps: { max_usd: 1, max_turns: 1 }, mode: "fixed", timeoutMs: 30_000, bin: ok.bin, authFile: a.authFile });
    rmSync(ok.dir, { recursive: true, force: true });
    assert.deepEqual(over.flags, ["over_budget"]);
  } finally {
    rmSync(ws, { recursive: true, force: true });
    rmSync(fake.dir, { recursive: true, force: true });
    rmSync(a.dir, { recursive: true, force: true });
  }
});

test("critic role: read-only, structured output from the schema", async () => {
  const fake = fakeCodexBin();
  const a = authFixture();
  try {
    const res = await codex.critic({ prompt: "Judge", model: "gpt-6-astra", jsonSchema: { type: "object" }, images: ["/x.png"], bin: fake.bin, authFile: a.authFile });
    assert.equal(res.ok, true);
    assert.deepEqual(res.output, { verdict: "ok" });
    const argv = fake.argv();
    assert.equal(argv[argv.indexOf("--sandbox") + 1], "read-only");
    assert.ok(argv.includes("--output-schema"));
    assert.equal(argv[argv.indexOf("-i") + 1], "/x.png");
  } finally {
    rmSync(fake.dir, { recursive: true, force: true });
    rmSync(a.dir, { recursive: true, force: true });
  }
});

test("authOk: logged in with an auth file, failing without", () => {
  const fake = fakeCodexBin();
  const a = authFixture();
  try {
    assert.equal(codex.authOk({ bin: fake.bin, authFile: a.authFile }).ok, true);
    const missing = codex.authOk({ bin: fake.bin, authFile: join(a.dir, "nope.json") });
    assert.equal(missing.ok, false);
    assert.match(missing.reason, /no Codex auth file/);
    mkdirSync(join(a.dir, "empty"));
    writeFileSync(join(a.dir, "empty", "auth.json"), "{}");
    const failing = fakeCodexBin();
    writeFileSync(failing.bin, `#!/bin/sh\necho "Not logged in"; exit 1\n`);
    const bad = codex.authOk({ bin: failing.bin, authFile: join(a.dir, "empty", "auth.json") });
    assert.equal(bad.ok, false);
    assert.match(bad.reason, /Not logged in/);
    rmSync(failing.dir, { recursive: true, force: true });
  } finally {
    rmSync(fake.dir, { recursive: true, force: true });
    rmSync(a.dir, { recursive: true, force: true });
  }
});
