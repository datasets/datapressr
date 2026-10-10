// The canary verdict from fixture transcripts, the gate in `run`, and a staged run end to end
// through a fake `claude` binary (no agent calls, no network).

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as claude from "./adapters/claude.mjs";
import * as codex from "./adapters/codex.mjs";
import { CHART_OUT, NESTED_CLAUDE, NESTED_CODEX, OPEN_FETCH_URL, OPEN_OWN_URL, OPEN_SEARCH, PROBE_SCRIPT, canaryPrompt, codexCanaryPrompt, evaluateCanary, evaluateCodexCanary, probeScript, requireCanary } from "./canary.mjs";
import { appendRow, readLedger } from "./ledger.mjs";
import { runCase } from "./runner.mjs";
import { ensureModulesCache } from "./stage.mjs";
import { fakeClaudeBin, fakeCodexBin, stagingRepo } from "./fixture-staging.mjs";

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
  const shared = join(base, "claude-501");
  mkdirSync(join(shared, "other-session"), { recursive: true });
  return { base, root, home, ws, shared, homes: [{ name: "claude", dir: join(home, ".claude") }] };
}

const NESTED_SHIMMED = ["claude", "claude", "codex"].map((a, i) => `== ${["nested_claude_version", "nested_claude_p", "nested_codex_exec"][i]}\nNESTED_AGENT_BLOCKED: ${a} is disabled inside an eval run\n exit=126\n`).join("");
// The run's own temp dir (both spellings) and the probe-script sections for it.
const RUN_TMP = ["/tmp/evt-abc123", "/private/tmp/evt-abc123"];
const tmpSections = ({ shared, leak }) =>
  leak
    ? `== tmpdir\nTMPDIR=/tmp/claude-501\n== tmp_write\ncanary-tmp-ok\n== ls_tmp_parent\n.\n..\nclaude-501\ncom.apple.launchd.x\n== ls_tmp_shared\n.\n..\nother-session\n`
    : `== tmpdir\nTMPDIR=/tmp/evt-abc123/claude-501\n== tmp_write\ncanary-tmp-ok\n== ls_tmp_parent\n.\n..\nclaude-501\ncc-socks\n== ls_tmp_shared\nls: ${shared}: Operation not permitted\n`;
const NESTED_RAN = "== nested_claude_version\n2.1.296 (Claude Code)\n exit=0\n== nested_claude_p\nNot logged in · Please run /login\n exit=1\n== nested_codex_exec\nError: Not logged in\n exit=1\n";

function canaryTranscript({ root, home, shared, leak }) {
  const tu = (id, name, input) => JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", id, name, input }] } });
  const tr = (id, content) => JSON.stringify({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: id, content, is_error: !leak }] } });
  const denied = "<tool_use_error>File is in a directory that is denied by your permission settings.</tool_use_error>";
  const bashOut = leak
    ? `== head_repo\n# DataPressr — AI Agent Instructions\n== ls_repo\nAGENTS.md\nNEXT.md\nskills\n== ls_claude\n.\n..\nCLAUDE.md\nsettings.json\n== curl\nhttp_code=200 exit=0\n== fetch\nfetch_status=200\n${NESTED_RAN}${tmpSections({ shared, leak })}== chart\nCHART_OK\n== end\n`
    : `== head_repo\nhead: ${root}/AGENTS.md: Operation not permitted\n== ls_repo\nls: ${root}: Operation not permitted\n== ls_claude\nls: ${home}/.claude: Operation not permitted\n== curl\nhttp_code=000 exit=56\n== fetch\nfetch_error=ENOTFOUND\n${NESTED_SHIMMED}${tmpSections({ shared, leak })}== chart\nCHART_OK\n== end\n`;
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
    tu("b2", "Bash", { command: NESTED_CLAUDE }),
    tr("b2", leak ? "2.1.296 (Claude Code)" : `Permission to use Bash with command ${NESTED_CLAUDE} has been denied.`),
    tu("b3", "Bash", { command: NESTED_CODEX }),
    tr("b3", leak ? "WARNING: proceeding, even though we could not create PATH aliases: Operation not permitted (os error 1)\ncodex-cli 0.161.0" : `Permission to use Bash with command ${NESTED_CODEX} has been denied.`),
    tu("b4", "Bash", { command: `ls -1a ${shared}` }),
    tr("b4", leak ? ".\n..\nother-session" : `ls: ${shared}: Operation not permitted`),
    JSON.stringify({ type: "result", subtype: "success", result: "DONE\nSKILLS: NONE\nINSTRUCTIONS: NONE" }),
  ].join("\n");
}

test("a locked-down transcript passes; a leaky one fails probe by probe", () => {
  const d = fixtureDirs();
  try {
    writeFileSync(join(d.ws, CHART_OUT), "<svg></svg>\n");
    const init = { tools: ["Bash", "Edit", "Glob", "Grep", "Read", "Write"], mcp_servers: [], slash_commands: [], skills: [], plugins: [{ name: "cc-plugin-telemetry", source: "cc-plugin-telemetry@builtin" }] };
    const common = { init, resultText: "DONE\nSKILLS: NONE\nINSTRUCTIONS: NONE", workspace: d.ws, root: d.root, home: d.home, homes: d.homes, allowedTools: claude.WRITER_TOOLS, tmpDirs: RUN_TMP, sharedTmp: [d.shared] };

    const ok = evaluateCanary({ transcript: canaryTranscript({ ...d, leak: false }), ...common });
    assert.equal(ok.pass, true, JSON.stringify(ok.probes, null, 1));
    const NESTED = ["nested_claude_version", "nested_claude_p", "nested_codex_exec", "bash_claude", "bash_codex"];
    const TMP = ["ls_tmp_parent", "ls_tmp_shared", "bash_ls_tmp_shared"];
    for (const name of ["read_repo", "read_claude_md", "grep_repo", "glob_claude", "head_repo", "ls_repo", "ls_claude", "curl", "fetch", ...NESTED, ...TMP]) assert.equal(ok.probes[name].status, "blocked", name);
    for (const name of ["chart_offline", "session", "user_context", "leak_scan", "nested_scan", "tmpdir", "tmp_write", "tmp_scan"]) assert.equal(ok.probes[name].status, "ok", name);
    assert.match(ok.probes.nested_scan.evidence, /nested agent: claude --version; nested agent: codex --version/);
    assert.equal(ok.probes.tmpdir.evidence, "TMPDIR=/tmp/evt-abc123/claude-501");
    assert.equal(ok.probes.tmp_scan.evidence, `Bash ${d.shared}`);

    // The weakened recipe: a shared TMPDIR and no run temp dir.
    const bad = evaluateCanary({ transcript: canaryTranscript({ ...d, leak: true }), ...common, tmpDirs: [], resultText: "DONE\nSKILLS: dataviz\nINSTRUCTIONS: Markdown: never hard-wrap. One line per paragraph." });
    assert.equal(bad.pass, false);
    for (const name of ["read_repo", "read_claude_md", "grep_repo", "glob_claude", "head_repo", "ls_repo", "ls_claude", "curl", "fetch", ...NESTED, ...TMP]) assert.equal(bad.probes[name].status, "leaked", name);
    assert.equal(bad.probes.user_context.status, "failed");
    assert.equal(bad.probes.tmpdir.status, "failed", "a shared TMPDIR fails the canary");

    // The run's own temp dir alone fails the canary when it is not $TMPDIR.
    const notOurs = evaluateCanary({ transcript: canaryTranscript({ ...d, leak: false }), ...common, tmpDirs: ["/tmp/evt-zzz"] });
    assert.equal(notOurs.probes.tmpdir.status, "failed");
    assert.equal(notOurs.pass, false);

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

// Open mode (datapressr-hcn.12): the fixed transcript plus the open probes. `leak` lets the own
// site through to the shell and to WebFetch; `noNet` breaks the positive controls.
function openTranscript(d, { leak = false, noNet = false } = {}) {
  const base = canaryTranscript({ ...d, leak: false }).split("\n");
  const result = base.pop();
  const open = `== curl_allowed\nhttp_code=${noNet ? "000 exit=56" : "200 exit=0"}\n== curl_own\nhttp_code=${leak ? "200 exit=0" : "000 exit=56"}\n`;
  const withOpen = base.map((l) => l.replace("== chart\\n", `${open}== chart\\n`.replace(/\n/g, "\\n")));
  const tu = (id, name, input) => JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", id, name, input }] } });
  const tr = (id, content, is_error = false) => JSON.stringify({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: id, content, is_error }] } });
  return [
    ...withOpen,
    tu("w1", "WebFetch", { url: OPEN_OWN_URL, prompt: "Return the page title." }),
    leak ? tr("w1", "The page title is Stories - DataPressr") : tr("w1", "Permission to use WebFetch has been denied.", true),
    tu("w2", "WebFetch", { url: OPEN_FETCH_URL, prompt: "Return the page title." }),
    noNet ? tr("w2", "Unable to fetch", true) : tr("w2", "The page title is Example.com - Wikipedia"),
    tu("s1", "WebSearch", { query: OPEN_SEARCH }),
    noNet ? tr("s1", "Search failed", true) : tr("s1", "Links: [{\"title\":\"Maddison Project\",\"url\":\"https://www.rug.nl/ggdc/historicaldevelopment/maddison/\"}]"),
    result,
  ].join("\n");
}

test("open mode: the fixed probes plus allowlisted shell, own site blocked for shell and WebFetch, web tools working", () => {
  const d = fixtureDirs();
  try {
    writeFileSync(join(d.ws, CHART_OUT), "<svg></svg>\n");
    const tools = claude.toolsFor("open");
    const init = { tools, mcp_servers: [], slash_commands: [], skills: [], plugins: [] };
    const common = { init, resultText: "DONE\nSKILLS: NONE\nINSTRUCTIONS: NONE", workspace: d.ws, root: d.root, home: d.home, homes: d.homes, allowedTools: tools, tmpDirs: RUN_TMP, sharedTmp: [d.shared], mode: "open" };
    const ok = evaluateCanary({ transcript: openTranscript(d), ...common });
    assert.equal(ok.pass, true, JSON.stringify(ok.probes, null, 1));
    for (const name of ["curl", "fetch", "curl_own", "webfetch_own", "read_repo", "head_repo"]) assert.equal(ok.probes[name].status, "blocked", name);
    for (const name of ["curl_allowed", "webfetch_allowed", "websearch", "forbidden_scan", "session"]) assert.equal(ok.probes[name].status, "ok", name);

    const leaky = evaluateCanary({ transcript: openTranscript(d, { leak: true }), ...common });
    assert.equal(leaky.pass, false);
    assert.equal(leaky.probes.curl_own.status, "leaked");
    assert.equal(leaky.probes.webfetch_own.status, "leaked");

    const dead = evaluateCanary({ transcript: openTranscript(d, { noNet: true }), ...common });
    assert.equal(dead.pass, false, "positive controls: open mode must really reach the web");
    for (const name of ["curl_allowed", "webfetch_allowed", "websearch"]) assert.equal(dead.probes[name].status, "failed", name);

    // The open probes only exist in open mode; the fixed prompt and script are unchanged.
    assert.ok(!canaryPrompt({ root: d.root, home: d.home, homes: d.homes }).includes("WebFetch"));
    assert.ok(canaryPrompt({ root: d.root, home: d.home, homes: d.homes, mode: "open" }).includes(OPEN_OWN_URL));
    assert.ok(!probeScript({ root: d.root, homes: d.homes }).includes("curl_allowed"));
    assert.ok(probeScript({ root: d.root, homes: d.homes, mode: "open" }).includes("curl_allowed"));
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

// --- the Codex canary verdict ------------------------------------------------

// Codex reads the shared Claude temp dir (open); its own TMPDIR is the run's, unless weakened.
const codexTmp = ({ sharedTmpdir }) =>
  sharedTmpdir
    ? `== tmpdir\nTMPDIR=/var/folders/xx/T/\n== tmp_write\ncanary-tmp-ok\n== ls_tmp_parent\n.\n..\nC\nT\nX\n== ls_tmp_shared\n.\n..\nother-session\n`
    : `== tmpdir\nTMPDIR=/tmp/evt-abc123/tmp\n== tmp_write\ncanary-tmp-ok\n== ls_tmp_parent\n.\n..\ntmp\n== ls_tmp_shared\n.\n..\nother-session\n`;

function codexTranscript({ root, home, shared, network = false, nested = false, sharedTmpdir = false }) {
  const item = (it) => JSON.stringify({ type: "item.completed", item: it });
  const out = `== head_repo\n# DataPressr — AI Agent Instructions\n== ls_repo\nAGENTS.md\nNEXT.md\nskills\n== ls_claude\nCLAUDE.md\nsettings.json\n== curl\nhttp_code=${network ? "200 exit=0" : "000 exit=6"}\n== fetch\n${network ? "fetch_status=200" : "fetch_error=ENOTFOUND"}\n${nested ? NESTED_RAN : NESTED_SHIMMED}${codexTmp({ shared, sharedTmpdir })}== chart\nCHART_OK\n== end\n`;
  return [
    JSON.stringify({ type: "thread.started", thread_id: "t" }),
    item({ id: "i1", type: "command_execution", command: `/bin/zsh -lc 'sh ${PROBE_SCRIPT}'`, aggregated_output: out, exit_code: 0 }),
    item({ id: "i2", type: "command_execution", command: `/bin/zsh -lc 'head -1 ${join(root, "AGENTS.md")}'`, aggregated_output: "# DataPressr — AI Agent Instructions\n", exit_code: 0 }),
    item({ id: "i4", type: "command_execution", command: `/bin/zsh -lc '${NESTED_CLAUDE}'`, aggregated_output: nested ? "2.1.296 (Claude Code)\n" : "NESTED_AGENT_BLOCKED: claude is disabled inside an eval run\n", exit_code: nested ? 0 : 126 }),
    item({ id: "i5", type: "command_execution", command: `/bin/zsh -lc 'ls -1a ${shared}'`, aggregated_output: ".\n..\nother-session\n", exit_code: 0 }),
    item({ id: "i3", type: "agent_message", text: "DONE" }),
    JSON.stringify({ type: "turn.completed", usage: { input_tokens: 1, output_tokens: 1 } }),
  ].join("\n");
}

test("Codex canary: disk reads are recorded as open; user skills, memories, plugins and network fail it", () => {
  const d = fixtureDirs();
  try {
    writeFileSync(join(d.ws, CHART_OUT), "<svg></svg>\n");
    assert.match(codexCanaryPrompt({ root: d.root }), new RegExp(`head -1 '${join(d.root, "AGENTS.md")}'`));
    assert.match(codexCanaryPrompt({ root: d.root, sharedTmp: [d.shared] }), new RegExp(`these four shell commands[\\s\\S]*- ls -1a ${d.shared}`));
    const homeReport = { entries: ["auth.json", "skills"], skills: [], system_skills: ["imagegen", "skill-creator"], plugins_cache: [], apps_cache: [], memory_rows: 0, memories_dir: [] };
    const common = { transcript: codexTranscript(d), homeReport, workspace: d.ws, root: d.root, home: d.home, homes: d.homes, userSkills: ["humanizer", "brainstorming", "skill-creator"], resultText: "DONE\nSKILLS: imagegen, skill-creator, story\nINSTRUCTIONS: NONE", tmpDirs: RUN_TMP, sharedTmp: [d.shared] };

    const ok = evaluateCodexCanary(common);
    assert.equal(ok.pass, true, JSON.stringify(ok.probes, null, 1));
    for (const name of ["shell_read_repo", "head_repo", "ls_repo", "ls_claude", "ls_tmp_shared", "shell_ls_tmp_shared"]) assert.equal(ok.probes[name].status, "open", name);
    assert.equal(ok.probes.ls_tmp_parent.status, "blocked");
    for (const name of ["tmpdir", "tmp_write", "tmp_scan"]) assert.equal(ok.probes[name].status, "ok", name);
    for (const name of ["curl", "fetch"]) assert.equal(ok.probes[name].status, "blocked", name);
    for (const name of ["nested_claude_version", "nested_claude_p", "nested_codex_exec", "shell_claude"]) assert.equal(ok.probes[name].status, "blocked", name);
    for (const name of ["chart_offline", "skills", "memories", "session", "leak_scan", "nested_scan"]) assert.equal(ok.probes[name].status, "ok", name);

    const fail = (over, probe, pattern) => {
      const v = evaluateCodexCanary({ ...common, ...over });
      assert.equal(v.pass, false, probe);
      assert.notEqual(v.probes[probe].status, "ok", probe);
      if (pattern) assert.match(v.probes[probe].evidence, pattern);
    };
    fail({ resultText: "DONE\nSKILLS: imagegen, humanizer:humanizer, brainstorming\nINSTRUCTIONS: NONE" }, "skills", /USER SKILLS: humanizer:humanizer, brainstorming/);
    fail({ resultText: "DONE" }, "skills", /no SKILLS line/);
    fail({ homeReport: { ...homeReport, skills: ["humanizer"] } }, "skills");
    fail({ homeReport: { ...homeReport, memory_rows: 2 } }, "memories", /memory rows in temp home: 2/);
    fail({ resultText: "DONE\nSKILLS: NONE\nINSTRUCTIONS: Markdown: never hard-wrap. One line per paragraph." }, "memories", /quoted/);
    fail({ homeReport: { ...homeReport, plugins_cache: ["google-drive"], apps_cache: ["codex_apps_tools"] } }, "session", /plugin google-drive; apps cache codex_apps_tools/);
    fail({ transcript: codexTranscript({ ...d, network: true }) }, "curl");
    fail({ transcript: `${codexTranscript(d)}\n${JSON.stringify({ type: "item.completed", item: { id: "w", type: "web_search", query: "france debt" } })}` }, "session", /WebSearch/);
    fail({ transcript: codexTranscript(d).split("\n").filter((l) => !l.includes("head -1")).join("\n") }, "leak_scan");
    // A nested agent that runs (the shim missing) fails it, whatever it then fails on.
    for (const probe of ["nested_claude_version", "nested_claude_p", "nested_codex_exec", "shell_claude"]) fail({ transcript: codexTranscript({ ...d, nested: true }) }, probe);
    fail({ transcript: codexTranscript(d).split("\n").filter((l) => !l.includes(NESTED_CLAUDE)).join("\n") }, "nested_scan");
    // The weakened recipe: TMPDIR is our own shared temp dir, whose parent lists other entries.
    fail({ transcript: codexTranscript({ ...d, sharedTmpdir: true }), tmpDirs: [] }, "tmpdir");
    assert.equal(evaluateCodexCanary({ ...common, transcript: codexTranscript({ ...d, sharedTmpdir: true }), tmpDirs: [] }).probes.ls_tmp_parent.status, "leaked");
    fail({ transcript: codexTranscript(d).split("\n").filter((l) => !l.includes("i5")).join("\n") }, "tmp_scan");

    // A skill the CLI ships (a system skill) is not a user skill even if the user has one of that name.
    assert.equal(evaluateCodexCanary({ ...common, resultText: "DONE\nSKILLS: skill-creator\nINSTRUCTIONS: NONE" }).probes.skills.status, "ok");
    // Open mode does not probe the network.
    assert.equal(evaluateCodexCanary({ ...common, transcript: codexTranscript({ ...d, network: true }), mode: "open" }).probes.curl, undefined);
  } finally {
    rmSync(d.base, { recursive: true, force: true });
  }
});

test("a Codex writer runs staged and gated like Claude: tokens, no cost, the leak scan over its items", async () => {
  const { root, cacheRoot } = stagedRepoWithCache();
  const fake = fakeCodexBin();
  const authDir = mkdtempSync(join(tmpdir(), "evals-codexauth-"));
  writeFileSync(join(authDir, "auth.json"), "{}\n");
  const adapter = { ...codex, cliVersion: () => "7.7.7", write: (o) => codex.write({ ...o, bin: fake.bin, authFile: join(authDir, "auth.json") }) };
  try {
    await assert.rejects(runCase({ root, caseRef: "story/t01-demo", writer: "codex", adapters: { codex: adapter }, cacheRoot }), /no canary on record for codex 7\.7\.7/);
    appendRow(join(root, "evals/ledger.jsonl"), { kind: "canary", at: "2026-10-10T00:00:00Z", run_id: "cx", vendor: "codex", cli_version: "7.7.7", recipe_sha256: codex.recipeHash("fixed"), mode: "fixed", pass: true });
    const [r] = await runCase({ root, caseRef: "story/t01-demo", writer: "codex", adapters: { codex: adapter }, cacheRoot });
    assert.deepEqual(r.run.artefacts.map((x) => x.path), ["site/stories/fake.md"]);
    assert.equal(r.run.isolation.canary_run_id, "cx");
    assert.equal(r.run.writer.vendor, "codex");
    assert.equal(r.run.cost_usd, null);
    assert.equal(r.run.cost_basis, null);
    assert.deepEqual(r.run.usage, { input_tokens: 100, cached_input_tokens: 40, output_tokens: 7 });
    assert.deepEqual(r.run.flags, []);
  } finally {
    cleanup(root, cacheRoot, fake.dir, authDir);
  }
});
