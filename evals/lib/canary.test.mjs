// The canary verdict from fixture transcripts, the gate in `run`, and a staged run end to end
// through a fake `claude` binary (no agent calls, no network).

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as claude from "./adapters/claude.mjs";
import { CHART_OUT, PROBE_SCRIPT, evaluateCanary, requireCanary } from "./canary.mjs";
import { appendRow, readLedger } from "./ledger.mjs";
import { runCase } from "./runner.mjs";
import { ensureModulesCache } from "./stage.mjs";
import { fakeClaudeBin, stagingRepo } from "./fixture-staging.mjs";

const SHA = "a".repeat(64);
const row = (over = {}) => ({ schema: 1, kind: "canary", at: "2026-10-10T00:00:00Z", run_id: "c1", vendor: "claude", cli_version: "2.1.296", recipe_sha256: SHA, mode: "fixed", pass: true, ...over });
const key = { vendor: "claude", cli_version: "2.1.296", recipe_sha256: SHA, mode: "fixed" };

test("the gate needs a passing canary for this vendor, CLI version, recipe hash and mode", () => {
  assert.throws(() => requireCanary([], key), /no canary on record.*canary --writer claude/);
  assert.equal(requireCanary([row()], key).run_id, "c1");
  assert.throws(() => requireCanary([row({ cli_version: "2.1.295" })], key), /no canary on record/);
  assert.throws(() => requireCanary([row({ recipe_sha256: "b".repeat(64) })], key), /no canary on record/);
  assert.throws(() => requireCanary([row({ mode: "open" })], key), /no canary on record/);
  assert.throws(() => requireCanary([row({ vendor: "codex" })], key), /no canary on record/);
  assert.throws(() => requireCanary([row(), row({ run_id: "c2", pass: false })], key), /latest canary .*c2.* failed/);
  assert.equal(requireCanary([row({ pass: false }), row({ run_id: "c3" })], key).run_id, "c3");
});

// --- verdict from a fixture transcript --------------------------------------

function fixtureDirs() {
  const base = mkdtempSync(join(tmpdir(), "evals-canary-"));
  const root = join(base, "repo");
  const home = join(base, "home");
  const ws = join(base, "ws");
  mkdirSync(join(root, "skills"), { recursive: true });
  writeFileSync(join(root, "AGENTS.md"), "# DataPressr — AI Agent Instructions\n");
  writeFileSync(join(root, "NEXT.md"), "next\n");
  mkdirSync(join(home, ".claude"), { recursive: true });
  writeFileSync(join(home, ".claude/CLAUDE.md"), "Markdown: never hard-wrap. One line per paragraph.\n");
  writeFileSync(join(home, ".claude/settings.json"), "{}\n");
  mkdirSync(join(ws, "site/stories"), { recursive: true });
  return { base, root, home, ws, homes: [{ name: "claude", dir: join(home, ".claude") }] };
}

function canaryTranscript({ root, home, leak }) {
  const tu = (id, name, input) => JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", id, name, input }] } });
  const tr = (id, content) => JSON.stringify({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: id, content, is_error: !leak }] } });
  const denied = "<tool_use_error>File is in a directory that is denied by your permission settings.</tool_use_error>";
  const bashOut = leak
    ? `== head_repo\n# DataPressr — AI Agent Instructions\n== ls_repo\nAGENTS.md\nNEXT.md\nskills\n== ls_claude\n.\n..\nCLAUDE.md\nsettings.json\n== curl\nhttp_code=200 exit=0\n== fetch\nfetch_status=200\n== chart\nCHART_OK\n== end\n`
    : `== head_repo\nhead: ${root}/AGENTS.md: Operation not permitted\n== ls_repo\nls: ${root}: Operation not permitted\n== ls_claude\nls: ${home}/.claude: Operation not permitted\n== curl\nhttp_code=000 exit=56\n== fetch\nfetch_error=ENOTFOUND\n== chart\nCHART_OK\n== end\n`;
  return [
    JSON.stringify({ type: "system", subtype: "init", tools: ["Bash", "Edit", "Glob", "Grep", "Read", "Write"], mcp_servers: [], slash_commands: [], skills: [], plugins: [{ name: "cc-plugin-telemetry", source: "cc-plugin-telemetry@builtin" }] }),
    tu("r1", "Read", { file_path: join(root, "AGENTS.md") }),
    tr("r1", leak ? "1\t# DataPressr — AI Agent Instructions" : denied),
    tu("r2", "Read", { file_path: join(home, ".claude/CLAUDE.md") }),
    tr("r2", leak ? "1\tMarkdown: never hard-wrap. One line per paragraph." : denied),
    tu("g1", "Grep", { pattern: "DataPressr", path: root }),
    tr("g1", leak ? `Found 1 file\n${root}/AGENTS.md` : `Permission to read ${root} has been denied.`),
    tu("g2", "Glob", { pattern: "*", path: join(home, ".claude") }),
    tr("g2", leak ? `${home}/.claude/projects/p/memory/MEMORY.md` /* a deep path alone is a leak */ : `Permission to read ${home}/.claude has been denied.`),
    tu("b1", "Bash", { command: `sh ${PROBE_SCRIPT}` }),
    tr("b1", bashOut),
    JSON.stringify({ type: "result", subtype: "success", result: "DONE\nSKILLS: NONE\nINSTRUCTIONS: NONE" }),
  ].join("\n");
}

test("a locked-down transcript passes; a leaky one fails probe by probe", () => {
  const d = fixtureDirs();
  try {
    writeFileSync(join(d.ws, CHART_OUT), "<svg></svg>\n");
    const init = { tools: ["Bash", "Edit", "Glob", "Grep", "Read", "Write"], mcp_servers: [], slash_commands: [], skills: [], plugins: [{ name: "cc-plugin-telemetry", source: "cc-plugin-telemetry@builtin" }] };
    const common = { init, resultText: "DONE\nSKILLS: NONE\nINSTRUCTIONS: NONE", workspace: d.ws, root: d.root, home: d.home, homes: d.homes, allowedTools: claude.WRITER_TOOLS };

    const ok = evaluateCanary({ transcript: canaryTranscript({ ...d, leak: false }), ...common });
    assert.equal(ok.pass, true, JSON.stringify(ok.probes, null, 1));
    for (const name of ["read_repo", "read_claude_md", "grep_repo", "glob_claude", "head_repo", "ls_repo", "ls_claude", "curl", "fetch"]) assert.equal(ok.probes[name].status, "blocked", name);
    for (const name of ["chart_offline", "session", "user_context", "leak_scan"]) assert.equal(ok.probes[name].status, "ok", name);

    const bad = evaluateCanary({ transcript: canaryTranscript({ ...d, leak: true }), ...common, resultText: "DONE\nSKILLS: dataviz\nINSTRUCTIONS: Markdown: never hard-wrap. One line per paragraph." });
    assert.equal(bad.pass, false);
    for (const name of ["read_repo", "read_claude_md", "grep_repo", "glob_claude", "head_repo", "ls_repo", "ls_claude", "curl", "fetch"]) assert.equal(bad.probes[name].status, "leaked", name);
    assert.equal(bad.probes.user_context.status, "failed");

    const noChart = evaluateCanary({ transcript: canaryTranscript({ ...d, leak: false }), ...common, workspace: d.base });
    assert.equal(noChart.probes.chart_offline.status, "failed", "positive control: the chart must really be built");

    const extra = evaluateCanary({ transcript: canaryTranscript({ ...d, leak: false }), ...common, init: { ...init, tools: [...init.tools, "WebFetch"], skills: ["dataviz"], plugins: [{ name: "superpowers", source: "superpowers@marketplace" }] } });
    assert.equal(extra.probes.session.status, "failed");
    assert.match(extra.probes.session.evidence, /WebFetch.*skills: dataviz.*plugins: superpowers/);

    const skipped = evaluateCanary({ transcript: "", ...common, init: null });
    assert.equal(skipped.pass, false);
    assert.equal(skipped.probes.read_repo.status, "not_run", "a probe the model never ran is not a pass");
  } finally {
    rmSync(d.base, { recursive: true, force: true });
  }
});

// --- the gate and a staged run inside runCase -------------------------------

function stagedRepoWithCache() {
  const { root } = stagingRepo();
  const cacheRoot = mkdtempSync(join(tmpdir(), "evals-cache-"));
  ensureModulesCache({ root, cacheRoot, install: (d) => mkdirSync(join(d, "node_modules"), { recursive: true }) });
  return { root, cacheRoot };
}
const cleanup = (...dirs) => {
  for (const d of dirs) {
    execFileSync("chmod", ["-R", "u+w", d]);
    rmSync(d, { recursive: true, force: true });
  }
};

test("run refuses a staged writer without a passing canary, before anything is staged or recorded", async () => {
  const { root, cacheRoot } = stagedRepoWithCache();
  const fake = fakeClaudeBin();
  const adapter = { ...claude, cliVersion: () => "9.9.9", write: (o) => claude.write({ ...o, bin: fake.bin }) };
  try {
    await assert.rejects(runCase({ root, caseRef: "story/t01-demo", writer: "claude", adapters: { claude: adapter }, cacheRoot }), /no canary on record for claude 9\.9\.9/);
    const ledger = join(root, "evals/ledger.jsonl");
    appendRow(ledger, { kind: "canary", at: "2026-10-10T00:00:00Z", run_id: "c-old", vendor: "claude", cli_version: "9.9.8", recipe_sha256: claude.recipeHash("fixed"), mode: "fixed", pass: true });
    await assert.rejects(runCase({ root, caseRef: "story/t01-demo", writer: "claude", adapters: { claude: adapter }, cacheRoot }), /no canary on record for claude 9\.9\.9/, "a canary for another CLI version does not count");
    appendRow(ledger, { kind: "canary", at: "2026-10-10T00:00:00Z", run_id: "c-fail", vendor: "claude", cli_version: "9.9.9", recipe_sha256: claude.recipeHash("fixed"), mode: "fixed", pass: false });
    await assert.rejects(runCase({ root, caseRef: "story/t01-demo", writer: "claude", adapters: { claude: adapter }, cacheRoot }), /failed; isolation is not proven/);
    assert.deepEqual(readLedger(ledger).map((r) => r.kind), ["canary", "canary"], "no run recorded");
  } finally {
    cleanup(root, cacheRoot, fake.dir);
  }
});

test("with a passing canary a staged run collects the writer's files, hashes the transcript and flags leaks", async () => {
  const { root, cacheRoot } = stagedRepoWithCache();
  const ledger = join(root, "evals/ledger.jsonl");
  appendRow(ledger, { kind: "canary", at: "2026-10-10T00:00:00Z", run_id: "c-pass", vendor: "claude", cli_version: "9.9.9", recipe_sha256: claude.recipeHash("fixed"), mode: "fixed", pass: true });
  const clean = fakeClaudeBin();
  const leaky = fakeClaudeBin({ leak: true });
  const adapterFor = (bin) => ({ ...claude, cliVersion: () => "9.9.9", write: (o) => claude.write({ ...o, bin }) });
  try {
    const [a] = await runCase({ root, caseRef: "story/t01-demo", writer: "claude", adapters: { claude: adapterFor(clean.bin) }, cacheRoot });
    assert.deepEqual(a.run.artefacts.map((x) => x.path), ["site/stories/fake.md"]);
    assert.equal(a.run.isolation.canary_run_id, "c-pass");
    assert.deepEqual(a.run.isolation.leaks, []);
    assert.equal(a.run.harness.recipe_sha256, claude.recipeHash("fixed"));
    assert.equal(a.run.writer.cli_version, "9.9.9");
    assert.equal(a.run.writer.model_actual, "claude-haiku-5-5");
    assert.equal(a.run.cost_basis, "list");
    assert.match(a.run.transcript_sha256, /^[0-9a-f]{64}$/);
    assert.match(a.run.workspace_sha256, /^[0-9a-f]{64}$/);
    assert.ok(readdirSync(a.runDir).includes("transcript.jsonl") && readdirSync(a.runDir).includes("workspace.tar"));
    // The writer ran in a blind workspace, not in the repo.
    const cwd = JSON.parse(readFileSync(join(a.runDir, "transcript.jsonl"), "utf8").split("\n")[0]).cwd;
    assert.ok(!cwd.startsWith(root));
    assert.deepEqual(a.run.flags, []);

    const [b] = await runCase({ root, caseRef: "story/t01-demo", writer: "claude", adapters: { claude: adapterFor(leaky.bin) }, cacheRoot });
    assert.deepEqual(b.run.flags, ["leaked"]);
    assert.deepEqual(b.run.isolation.leaks, [{ tool: "Read", path: "/Users/someone/src/datapressr/AGENTS.md" }]);
  } finally {
    cleanup(root, cacheRoot, clean.dir, leaky.dir);
  }
});
