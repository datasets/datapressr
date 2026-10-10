// Leak scan on fixture transcripts: absolute paths outside the workspace in tool calls are
// flagged; workspace paths, the node_modules cache, executables, /tmp and URLs are not.

import { test } from "node:test";
import assert from "node:assert/strict";
import { nestedAgentInvocations, pathsIn, scanTranscript, toolCallsFromTranscript } from "./leakscan.mjs";

const WS = "/private/var/folders/xx/T/evals-ws-abc";
const HOME = "/Users/someone";
const CACHE = `${HOME}/.cache/datapressr-evals/node_modules/1234`;

const ev = (blocks) => JSON.stringify({ type: "assistant", message: { role: "assistant", content: blocks } });
const tool = (name, input, id = name) => ({ type: "tool_use", id, name, input });

function transcript(...calls) {
  return [
    JSON.stringify({ type: "system", subtype: "init", cwd: WS, tools: ["Read", "Bash"] }),
    ev([{ type: "text", text: `I will read ${HOME}/.ssh/id_rsa` }]), // prose is not a tool call
    ...calls.map((c) => ev([c])),
    JSON.stringify({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: "Read", content: "/Users/someone/secret" }] } }),
    JSON.stringify({ type: "result", subtype: "success", total_cost_usd: 0.01 }),
  ].join("\n");
}

const ROOTS = new Set(["Users", "private", "var", "etc", "usr", "tmp", "bin", "opt", "dev"]);
const opts = { workspaces: [WS], allowedDirs: [CACHE], home: HOME, rootExists: (seg) => ROOTS.has(seg) };

test("a clean transcript has no leaks", () => {
  const t = transcript(
    tool("Read", { file_path: `${WS}/skills/story/SKILL.md` }),
    tool("Bash", { command: `cd ${WS} && node site/stories/x-make-charts.mjs > /dev/null 2>&1; ls ${CACHE}/node_modules` }),
    tool("Bash", { command: "curl -s https://example.com/a/b && /usr/bin/env node -e 1 && cat /tmp/scratch.txt" }),
    tool("Write", { file_path: `${WS}/site/stories/x.md`, content: "Debt rose to 113% of GDP / 2024 (source: INSEE / Eurostat)." }),
    tool("Grep", { pattern: "debt", path: "datasets/france-public-finances" }),
    tool("Bash", { command: "node -e 'console.log(\"a/b\".replace(/b/g, \"c\"), 4 / 2)'" }),
    tool("Bash", { command: "cat > site/stories/notes.md <<EOF\nRatio 113 / 100 /noise\nEOF" }),
  );
  assert.deepEqual(scanTranscript(t, opts), []);
});

test("absolute, home-relative and upward paths outside the workspace are flagged", () => {
  const t = transcript(
    tool("Read", { file_path: "/Users/someone/src/datasets/datapressr/site/stories/france.md" }, "r1"),
    tool("Bash", { command: "head ~/.claude/CLAUDE.md; ls $HOME/.codex" }, "b1"),
    tool("Glob", { pattern: "**/*.md", path: "/Users/someone/src" }, "g1"),
    tool("Bash", { command: "cat ../../other-run/site/stories/a.md" }, "b2"),
    tool("Grep", { pattern: "x", path: "/" }, "g2"),
    tool("Bash", { command: "ls /var/folders/xx/T/evals-ws-other" }, "b3"),
  );
  const leaks = scanTranscript(t, opts);
  assert.deepEqual(leaks, [
    { tool: "Read", path: "/Users/someone/src/datasets/datapressr/site/stories/france.md" },
    { tool: "Bash", path: `${HOME}/.claude/CLAUDE.md` },
    { tool: "Bash", path: `${HOME}/.codex` },
    { tool: "Glob", path: "/Users/someone/src" },
    { tool: "Bash", path: "../../other-run/site/stories/a.md" },
    { tool: "Grep", path: "/" },
    { tool: "Bash", path: "/var/folders/xx/T/evals-ws-other" },
  ]);
});

test("a sibling directory that shares the workspace prefix is not inside it", () => {
  const t = transcript(tool("Read", { file_path: `${WS}-evil/TASK.md` }));
  assert.deepEqual(scanTranscript(t, opts), [{ tool: "Read", path: `${WS}-evil/TASK.md` }]);
});

test("tool calls are extracted only from assistant tool_use blocks; URLs are not paths", () => {
  const t = transcript(tool("Bash", { command: "echo hi" }, "x"));
  assert.deepEqual(toolCallsFromTranscript(t).map((c) => c.tool), ["Bash"]);
  assert.deepEqual(pathsIn("see https://example.com/etc/passwd and file:///etc/hosts", HOME).absolute, []);
});

test("Codex exec --json items are scanned: shell commands, file changes, MCP calls; started events are not doubled", () => {
  const item = (type, it) => JSON.stringify({ type, item: it });
  const t = [
    item("item.started", { id: "c1", type: "command_execution", command: `/bin/zsh -lc 'head -1 ${HOME}/src/repo/AGENTS.md'` }),
    item("item.completed", { id: "c1", type: "command_execution", command: `/bin/zsh -lc 'head -1 ${HOME}/src/repo/AGENTS.md'`, aggregated_output: `${HOME}/.ssh/x` }),
    item("item.completed", { id: "f1", type: "file_change", changes: [{ path: `${WS}/site/stories/a.md`, kind: "add" }, { path: `${HOME}/notes.md`, kind: "update" }] }),
    item("item.completed", { id: "m1", type: "mcp_tool_call", server: "drive", tool: "read", arguments: { path: `${HOME}/Drive/x` } }),
    item("item.completed", { id: "a1", type: "agent_message", text: `I read ${HOME}/.codex/config.toml` }),
  ].join("\n");
  assert.equal(toolCallsFromTranscript(t).length, 4);
  const leaks = scanTranscript(t, { workspaces: [WS], home: HOME, rootExists: () => true });
  assert.deepEqual(leaks, [
    { tool: "Bash", path: `${HOME}/src/repo/AGENTS.md` },
    { tool: "Write", path: `${HOME}/notes.md` },
    { tool: "mcp:drive:read", path: `${HOME}/Drive/x` },
  ]);
});

test("nested agent CLI invocations are flagged however wrapped; mentions are not", () => {
  const flagged = {
    "claude -p hi": "claude -p hi",
    'timeout 600 claude -p "Review" --allowedTools x': "claude -p",
    'sh -c "claude -p hi"': "claude -p hi",
    "/bin/zsh -lc 'claude'": "claude",
    "/opt/homebrew/bin/claude --version": "/opt/homebrew/bin/claude --version",
    "env -i FOO=1 codex exec x": "codex exec x",
    "echo ok && codex exec --json": "codex exec --json",
    "npx @anthropic-ai/claude-code -p": "@anthropic-ai/claude-code -p",
    "x=$(claude --version)": "claude --version",
    "for f in a; do claude -p $f; done": "claude -p $f",
  };
  for (const [cmd, hit] of Object.entries(flagged)) assert.deepEqual(nestedAgentInvocations(cmd), [hit], cmd);
  for (const cmd of ["which claude codex", 'grep "claude" notes.md', "cat CLAUDE.md", "ls .claude", "node build.mjs claude", "echo codex"]) assert.deepEqual(nestedAgentInvocations(cmd), [], cmd);

  const t = transcript(tool("Bash", { command: "which claude codex; claude -p 'Review the outline'" }, "n1"), tool("Read", { file_path: `${WS}/claude` }, "n2"));
  assert.deepEqual(scanTranscript(t, opts), [{ tool: "Bash", path: "nested agent: claude -p", kind: "nested_agent" }]);
});

test("$TMPDIR scratch files pass; listing it, climbing out or naming another eval dir there does not", () => {
  const t = transcript(
    tool("Bash", { command: "cat > $TMPDIR/a.mjs <<'EOF'\nx\nEOF\nnode $TMPDIR/a.mjs; mkdir -p ${TMPDIR}/png" }, "t1"),
    tool("Bash", { command: "ls $TMPDIR; cat $TMPDIR/../x; ls ${TMPDIR}/evals-ws-other/site; ls $TMPDIR/png/../.." }, "t2"),
  );
  assert.deepEqual(scanTranscript(t, opts), [
    { tool: "Bash", path: "$TMPDIR" },
    { tool: "Bash", path: "$TMPDIR/../x" },
    { tool: "Bash", path: "${TMPDIR}/evals-ws-other/site" },
    { tool: "Bash", path: "$TMPDIR/png/../.." },
  ]);
});
