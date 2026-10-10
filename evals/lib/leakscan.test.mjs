// Leak scan on fixture transcripts: absolute paths outside the workspace in tool calls are
// flagged; workspace paths, the node_modules cache, executables, /tmp and URLs are not.

import { test } from "node:test";
import assert from "node:assert/strict";
import { pathsIn, scanTranscript, toolCallsFromTranscript } from "./leakscan.mjs";

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
