// Fixtures for the staging and Claude-adapter tests: a throwaway repo with what staging needs
// (and what it must leave behind), and a fake `claude` binary that prints canned stream-json.
// (Named so `node --test` does not pick it up as a test file.)

import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commitAll, makeRepo, write } from "./fixture-repo.mjs";
import { AGENTS_MARKER } from "./stage.mjs";

// The fixture repo plus what staging needs and what it must leave behind.
export function stagingRepo() {
  const { root, dataCommit } = makeRepo();
  write(root, "AGENTS.md", `# Conventions\n\nDataset rules.\n\n${AGENTS_MARKER}\n\nRepo-only: beads, site, changelog.\n`);
  write(root, "site/stories/package.json", '{ "name": "stories", "private": true }\n');
  write(root, "site/stories/package-lock.json", '{ "lockfileVersion": 3 }\n');
  write(root, "site/stories/published-story.md", "# A published story the writer must not see\n");
  write(root, "docs/reviews/feedback.md", "owner feedback\n");
  write(root, ".beads/issues.jsonl", "{}\n");
  write(root, "skills/other/SKILL.md", "# a skill the case does not name\n");
  commitAll(root, "repo extras");
  return { root, dataCommit };
}

// A fake CLI: --version, or a run that writes a story into its cwd and prints stream-json.
export function fakeClaudeBin({ leak = false, isError = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "evals-fakebin-"));
  const bin = join(dir, "claude");
  writeFileSync(
    bin,
    `#!${process.execPath}
const fs = require("node:fs"), path = require("node:path");
const args = process.argv.slice(2);
if (args[0] === "--version") { console.log("9.9.9 (Claude Code)"); process.exit(0); }
fs.writeFileSync(${JSON.stringify(join(dir, "argv.json"))}, JSON.stringify(args));
const settings = JSON.parse(fs.readFileSync(args[args.indexOf("--settings") + 1], "utf8"));
fs.writeFileSync(${JSON.stringify(join(dir, "settings.json"))}, JSON.stringify(settings));
const cwd = process.cwd();
const tools = args.includes("--tools") ? args[args.indexOf("--tools") + 1] : "";
const out = (e) => console.log(JSON.stringify(e));
out({ type: "system", subtype: "init", cwd, tools: tools ? tools.split(",") : [], mcp_servers: [], slash_commands: [], skills: [], plugins: [] });
if (tools) {
  fs.mkdirSync(path.join(cwd, "site/stories"), { recursive: true });
  fs.writeFileSync(path.join(cwd, "site/stories/fake.md"), "# Fake story\\n");
  out({ type: "assistant", message: { content: [{ type: "tool_use", id: "t1", name: "Write", input: { file_path: path.join(cwd, "site/stories/fake.md"), content: "# Fake story" } }] } });
  ${leak ? 'out({ type: "assistant", message: { content: [{ type: "tool_use", id: "t2", name: "Read", input: { file_path: "/Users/someone/src/datapressr/AGENTS.md" } }] } });' : ""}
}
out({ type: "result", subtype: ${JSON.stringify(isError ? "error_max_budget_usd" : "success")}, is_error: ${isError}, num_turns: 3, duration_ms: 1234, total_cost_usd: 0.0123,
  usage: { input_tokens: 10, output_tokens: 20 }, modelUsage: { "claude-haiku-5-5": { costUSD: 0.0123, outputTokens: 20 } },
  result: ${JSON.stringify(JSON.stringify({ verdict: "ok" }))}, structured_output: tools ? undefined : { verdict: "ok" } });
`,
  );
  chmodSync(bin, 0o755);
  return { dir, bin, argv: () => JSON.parse(readFileSync(join(dir, "argv.json"), "utf8")), settings: () => JSON.parse(readFileSync(join(dir, "settings.json"), "utf8")) };
}

// A fake `codex`: --version, `login status` (logged in when CODEX_HOME/auth.json exists), or an
// exec that records its argv and environment, writes a story into -C <dir>, leaves a canned
// skills dir in CODEX_HOME (plus a fetched plugin with `plugins: true`) and prints `exec --json` events.
export function fakeCodexBin({ fail = false, plugins = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "evals-fakecodex-"));
  const bin = join(dir, "codex");
  writeFileSync(
    bin,
    `#!${process.execPath}
const fs = require("node:fs"), path = require("node:path");
const args = process.argv.slice(2);
if (args[0] === "--version") { console.log("codex-cli 7.7.7"); process.exit(0); }
const home = process.env.CODEX_HOME;
if (args[0] === "login") {
  if (fs.existsSync(path.join(home, "auth.json"))) { console.log("Logged in using ChatGPT"); process.exit(0); }
  console.log("Not logged in"); process.exit(1);
}
fs.writeFileSync(${JSON.stringify(join(dir, "argv.json"))}, JSON.stringify(args));
fs.writeFileSync(${JSON.stringify(join(dir, "env.json"))}, JSON.stringify({ HOME: process.env.HOME, CODEX_HOME: home, homeFiles: fs.readdirSync(home) }));
const cwd = args[args.indexOf("-C") + 1];
const last = args[args.indexOf("-o") + 1];
fs.mkdirSync(path.join(home, "skills/.system/imagegen"), { recursive: true });
${plugins ? 'fs.mkdirSync(path.join(home, "plugins/cache/google-drive"), { recursive: true });' : ""}
const out = (e) => console.log(JSON.stringify(e));
out({ type: "thread.started", thread_id: "t" });
out({ type: "turn.started" });
const sandbox = args[args.indexOf("--sandbox") + 1];
let answer = "DONE";
if (sandbox === "workspace-write") {
  fs.mkdirSync(path.join(cwd, "site/stories"), { recursive: true });
  fs.writeFileSync(path.join(cwd, "site/stories/fake.md"), "# Fake story\\n");
  out({ type: "item.completed", item: { id: "i1", type: "file_change", changes: [{ path: path.join(cwd, "site/stories/fake.md"), kind: "add" }], status: "completed" } });
  out({ type: "item.completed", item: { id: "i2", type: "command_execution", command: "/bin/zsh -lc 'ls'", aggregated_output: "site", exit_code: 0, status: "completed" } });
} else {
  answer = JSON.stringify({ verdict: "ok" });
}
out({ type: "item.completed", item: { id: "i3", type: "agent_message", text: answer } });
${fail ? 'out({ type: "turn.failed", error: { message: "boom" } }); process.exit(1);' : 'out({ type: "turn.completed", usage: { input_tokens: 100, cached_input_tokens: 40, output_tokens: 7 } });'}
fs.writeFileSync(last, answer);
`,
  );
  chmodSync(bin, 0o755);
  return { dir, bin, argv: () => JSON.parse(readFileSync(join(dir, "argv.json"), "utf8")), env: () => JSON.parse(readFileSync(join(dir, "env.json"), "utf8")) };
}
