// Post-run leak scan (design section 4.2 step 6): flag any absolute path outside the workspace
// that appears in a tool call. Works on a stream-json transcript (one JSON event per line) or on
// already-extracted tool calls. A leak is { tool, path }; a run with any leak is flagged `leaked`
// and stays in the ledger but is excluded from comparisons. Two more kinds of hit share that shape
// (datapressr-hcn.19): a nested agent CLI invocation (`claude -p`, `codex exec`, however wrapped or
// spelt) as { tool, path: "nested agent: <command>", kind: "nested_agent" }, and a `$TMPDIR`
// reference that lists or climbs out of the shared temp dir or names another eval run's dir there.

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, normalize, relative, resolve, sep } from "node:path";

// Paths a tool call may name without it counting as a peek: executables, null devices and the
// shared temp dir (the sandbox's own scratch space). Not $TMPDIR: other workspaces live there.
export const DEFAULT_ALLOWED_PREFIXES = ["/usr/", "/bin/", "/sbin/", "/opt/homebrew/", "/dev/null", "/dev/stdin", "/dev/stdout", "/dev/stderr", "/dev/fd/", "/tmp/", "/private/tmp/"];

// A Codex `exec --json` item as a tool call in the Claude shape: shell commands as Bash, file
// changes as Write (one per path), MCP calls and web searches by name.
function codexCalls(item) {
  if (item.type === "command_execution") return [{ id: item.id, tool: "Bash", input: { command: item.command } }];
  if (item.type === "file_change") return (item.changes ?? []).map((c, i) => ({ id: `${item.id}:${i}`, tool: "Write", input: { file_path: c.path } }));
  if (item.type === "mcp_tool_call") return [{ id: item.id, tool: `mcp:${item.server ?? "?"}:${item.tool ?? "?"}`, input: item.arguments ?? {} }];
  if (item.type === "web_search") return [{ id: item.id, tool: "WebSearch", input: { query: item.query ?? "" } }];
  return [];
}

// Tool calls from a transcript: Claude stream-json (assistant content blocks of type tool_use)
// or Codex `exec --json` (completed items; the started event of the same item is skipped).
export function toolCallsFromTranscript(text) {
  const calls = [];
  for (const line of String(text).split("\n")) {
    if (!line.trim()) continue;
    let ev;
    try {
      ev = JSON.parse(line);
    } catch {
      continue;
    }
    if (ev?.type === "item.completed" && ev.item) {
      calls.push(...codexCalls(ev.item));
      continue;
    }
    const content = ev?.message?.content;
    if (ev.type !== "assistant" || !Array.isArray(content)) continue;
    for (const block of content) if (block?.type === "tool_use") calls.push({ id: block.id, tool: block.name, input: block.input });
  }
  return calls;
}

function strings(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, out));
  return out;
}

const URL_RE = /[a-z][a-z0-9+.-]*:\/\/[^\s"'`<>]*/gi;
// An absolute or home-relative path token: starts at a boundary with / or ~/ (or is exactly ~).
const PATH_RE = /(?:^|[\s"'`=:(,;|&<>{}[\]])((?:~|\$HOME|\$\{HOME\})(?:\/[^\s"'`;|&<>(){}[\],]*)?|\/[^\s"'`;|&<>(){}[\],]*)/g;
// A relative path that climbs out: ../ at a boundary.
const UP_RE = /(?:^|[\s"'`=:(,;|&<>{}[\]])(\.\.(?:\/[^\s"'`;|&<>(){}[\],]*)?)(?=$|[\s"'`;|&<>(){}[\],])/g;

export function pathsIn(text, home = homedir()) {
  const s = text.replace(URL_RE, " ");
  const found = [];
  for (const m of s.matchAll(PATH_RE)) {
    let p = m[1];
    p = p.replace(/^(?:~|\$HOME|\$\{HOME\})/, home);
    found.push(p);
  }
  return { absolute: found, upward: [...s.matchAll(UP_RE)].map((m) => m[1]) };
}

const within = (p, dir) => {
  const rel = relative(dir, p);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
};

// The strings of a tool call that name files. Content written by Write/Edit is prose or code,
// not an access, so only their file_path counts; other tools are scanned whole.
const PATH_FIELDS = { Write: ["file_path"], Edit: ["file_path"], MultiEdit: ["file_path"], NotebookEdit: ["notebook_path"] };
function accessStrings(call) {
  const fields = PATH_FIELDS[call.tool];
  if (!fields) return strings(call.input);
  return fields.map((f) => call.input?.[f]).filter((v) => typeof v === "string");
}

// A real top-level directory (/Users, /etc, /private …), so "/g" from a regex or "/ 2" from a
// division in inline code is not mistaken for a path. Injectable for tests.
const defaultRootExists = (seg) => existsSync(`/${seg}`);

// workspaces: the workspace path(s) (given and realpath). allowedDirs: extra directories that are
// not leaks (the node_modules cache). Returns [{ tool, path }] with duplicates removed. The scan
// is conservative: a flagged run lists its paths in run.json for a person to review.
export function scanToolCalls(calls, { workspaces, allowedDirs = [], allowedPrefixes = DEFAULT_ALLOWED_PREFIXES, home = homedir(), rootExists = defaultRootExists }) {
  const roots = [...workspaces, ...allowedDirs].map((d) => normalize(d));
  const leaks = [];
  const seen = new Set();
  const add = (tool, path) => {
    const key = `${tool}\0${path}`;
    if (!seen.has(key)) {
      seen.add(key);
      leaks.push({ tool, path });
    }
  };
  for (const call of calls) {
    if (call.tool === "Bash" && typeof call.input?.command === "string") {
      for (const inv of nestedAgentInvocations(call.input.command)) {
        const key = `${call.tool}\0nested\0${inv}`;
        if (!seen.has(key)) {
          seen.add(key);
          leaks.push({ tool: call.tool, path: `nested agent: ${inv}`, kind: "nested_agent" });
        }
      }
    }
    for (const s of accessStrings(call)) {
      for (const t of tmpdirLeaks(s)) add(call.tool, t);
      const { absolute, upward } = pathsIn(s, home);
      for (const p of absolute) {
        const n = normalize(p);
        if (n === "/") {
          if (call.tool !== "Bash") add(call.tool, "/");
          continue;
        }
        if (!n.startsWith(home) && !rootExists(n.split("/")[1])) continue;
        if (roots.some((r) => within(n, r))) continue;
        if (allowedPrefixes.some((pre) => n === pre.replace(/\/$/, "") || n.startsWith(pre))) continue;
        add(call.tool, p);
      }
      // ../ relative to the workspace root (where the agent starts). A cd elsewhere first can hide
      // this; any absolute path it used would still be caught above.
      for (const u of upward) {
        const abs = resolve(workspaces[0], u);
        if (!roots.some((r) => within(abs, r))) add(call.tool, u);
      }
    }
  }
  return leaks;
}

// Words that run their arguments as a command; their own flags (and the one value some take) are
// skipped to reach the command.
const WRAPPERS = new Set(["timeout", "gtimeout", "env", "nohup", "exec", "command", "builtin", "time", "nice", "stdbuf", "caffeinate", "xargs", "sudo", "npx", "bunx", "pnpx", "doas"]);
const AGENT_RE = /^(?:claude|codex)$|^@anthropic-ai\/claude-code(?:@.*)?$|^@openai\/codex(?:@.*)?$/;

// Nested agent CLI invocations in a shell command: a `claude` or `codex` (bare, by path, or as the
// npm package) in command position, i.e. first in a segment after a separator, quote or command
// substitution, past any variable assignments and wrapper words. `which claude` or `grep codex`
// is not an invocation. A quoted string counts after a shell's -c (`zsh -lc 'claude'`); other
// quoted strings only with an argument after the name, so `grep "claude" file` does not.
export function nestedAgentInvocations(command) {
  const hits = [];
  const parts = String(command).split(/(\$\(|[;&|\n(){}`"']|\bthen\b|\bdo\b|\belse\b)/);
  for (let k = 0; k < parts.length; k += 2) {
    const seg = parts[k];
    // A quoted string is a command when a shell's -c (or -lc) precedes it.
    const quoted = k > 0 && /^["']$/.test(parts[k - 1]) && !(k > 1 && /\s-l?c\s*$/.test(parts[k - 2]));
    const words = seg.trim().split(/\s+/).filter(Boolean);
    let i = 0;
    while (i < words.length) {
      const w = words[i];
      if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(w) || /^-/.test(w) || /^\d+(?:\.\d+)?[smhd]?$/.test(w)) {
        i++;
        continue;
      }
      if (WRAPPERS.has(w.split("/").pop())) {
        i++;
        continue;
      }
      break;
    }
    const w = words[i];
    if (!w) continue;
    const base = w.startsWith("@") ? w : w.split("/").pop();
    if (AGENT_RE.test(base) && (!quoted || words.length > i + 1)) hits.push(words.slice(i, i + 3).join(" "));
  }
  return hits;
}

// `$TMPDIR` is the shared temp dir (Codex inherits ours, where every eval workspace, home and
// settings dir lives; Claude's sandbox points it at a per-user dir shared with the user's other
// sessions). Scratch files in it are allowed like /tmp; listing it, climbing out of it or naming
// another eval run's dir (`evals-*`) is not.
const TMP_RE = /(?:\$TMPDIR|\$\{TMPDIR\})(\/[^\s"'`;|&<>(){}[\],]*)?/g;
function tmpdirLeaks(text) {
  const out = [];
  for (const m of String(text).matchAll(TMP_RE)) {
    const rest = normalize(`/x${m[1] ?? ""}`).replace(/\/+$/, "");
    if (rest === "/x" || !rest.startsWith("/x/") || /^\/x\/evals-/.test(rest)) out.push(m[0]);
  }
  return out;
}

export function scanTranscript(text, opts) {
  return scanToolCalls(toolCallsFromTranscript(text), opts);
}
