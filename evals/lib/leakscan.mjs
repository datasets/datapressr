// Post-run leak scan (design section 4.2 step 6): flag any absolute path outside the workspace
// that appears in a tool call. Works on a stream-json transcript (one JSON event per line) or on
// already-extracted tool calls. A leak is { tool, path }; a run with any leak is flagged `leaked`
// and stays in the ledger but is excluded from comparisons. Two more kinds of hit share that shape
// (datapressr-hcn.19): a nested agent CLI invocation (`claude -p`, `codex exec`, however wrapped or
// spelt) as { tool, path: "nested agent: <command>", kind: "nested_agent" }, and a `$TMPDIR`
// reference that lists or climbs out of the temp dir or names another eval run's dir there.
// /tmp is not allowed as a whole (datapressr-hcn.23): it holds /tmp/claude-<uid>, the user's other
// Claude sessions' scratchpads. A run's own temp dir is passed in allowedDirs (the adapters
// return it as `tmp_dirs`).

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, normalize, relative, resolve, sep } from "node:path";

// Paths a tool call may name without it counting as a peek: executables and null devices. Not
// /tmp (other sessions' scratchpads) and not our $TMPDIR (other workspaces live there).
export const DEFAULT_ALLOWED_PREFIXES = ["/usr/", "/bin/", "/sbin/", "/opt/homebrew/", "/dev/null", "/dev/stdin", "/dev/stdout", "/dev/stderr", "/dev/fd/"];

// A Codex `exec --json` item as a tool call in the Claude shape: shell commands as Bash, file
// changes as Write (one per path), MCP calls and web searches by name.
function codexCalls(item) {
  if (item.type === "command_execution") return [{ id: item.id, tool: "Bash", input: { command: item.command }, fresh_cwd: true }];
  if (item.type === "file_change") return (item.changes ?? []).map((c, i) => ({ id: `${item.id}:${i}`, tool: "Write", input: { file_path: c.path } }));
  if (item.type === "mcp_tool_call") return [{ id: item.id, tool: `mcp:${item.server ?? "?"}:${item.tool ?? "?"}`, input: item.arguments ?? {} }];
  if (item.type === "web_search") return [{ id: item.id, tool: "WebSearch", input: { query: item.query ?? "" } }];
  return [];
}

// The CLI's own refusal of a tool call (a permission deny rule), as its tool_result says it.
// Such a call never ran (datapressr-9lc): e.g. a Read of the CLI's persisted large-output file
// under ~/.claude/projects/<slug>/…/tool-results/, which the ~/.claude deny rule refuses.
const DENIED_RE = /denied by your permission settings|Permission to use \S+ (?:with command .* )?has been denied/i;
const resultText = (content) => (typeof content === "string" ? content : Array.isArray(content) ? content.map((c) => (typeof c?.text === "string" ? c.text : "")).join("\n") : "");

// Tool calls from a transcript: Claude stream-json (assistant content blocks of type tool_use)
// or Codex `exec --json` (completed items; the started event of the same item is skipped). A
// Claude call the permission layer refused (listed in the result's permission_denials, or an
// error tool_result saying so) is marked `denied: true`.
export function toolCallsFromTranscript(text) {
  const calls = [];
  const denied = new Set();
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
    if (ev?.type === "result" && Array.isArray(ev.permission_denials)) for (const d of ev.permission_denials) if (d?.tool_use_id) denied.add(d.tool_use_id);
    const content = ev?.message?.content;
    if (ev?.type === "user" && Array.isArray(content)) {
      for (const b of content) if (b?.type === "tool_result" && b.is_error && DENIED_RE.test(resultText(b.content))) denied.add(b.tool_use_id);
      continue;
    }
    if (ev.type !== "assistant" || !Array.isArray(content)) continue;
    for (const block of content) if (block?.type === "tool_use") calls.push({ id: block.id, tool: block.name, input: block.input });
  }
  for (const c of calls) if (c.id !== undefined && denied.has(c.id)) c.denied = true;
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

// Offsets inside a quoted string ('…' or "…"), where a shell never expands `~`.
function quotedMask(s) {
  const mask = new Uint8Array(s.length);
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      if (ch === q) q = null;
      else if (q === '"' && ch === "\\") i++;
      else mask[i] = 1;
    } else if (ch === "'" || ch === '"') q = ch;
    else if (ch === "\\") i++;
  }
  return mask;
}

export function pathsIn(text, home = homedir()) {
  const s = text.replace(URL_RE, (u) => " ".repeat(u.length));
  const mask = quotedMask(s);
  const found = [];
  for (const m of s.matchAll(PATH_RE)) {
    let p = m[1];
    // A lone quoted `~` is not the home directory: awk's match operator (`awk '$4 ~ /Q4/'`),
    // a regex, a literal. Unquoted (`cd ~`, `ls ~`) it still is.
    if (p === "~" && mask[m.index + m[0].length - 1]) continue;
    p = p.replace(/^(?:~|\$HOME|\$\{HOME\})/, home);
    found.push(p);
  }
  return { absolute: found, upward: [...s.matchAll(UP_RE)].map((m) => m[1]) };
}

// Track the shell's working directory through a command (datapressr-9lc): `cd <dir>` moves it for
// the rest of the command, `( … )` and `$( … )` restore it on close. Returns the segments, each
// with the cwd it runs in, and the cwd after the command. Relative ../ paths are then resolved
// against the directory they are used from, not the workspace root, so `cd datasets/x && cat
// ../../../AGENTS.md` (still inside the workspace) is not a leak.
const CD_RE = /^\s*(?:\S*\/)?(?:ba|z)?sh\s+-l?c\s+['"]?|^\s*['"]/;
export function cwdSegments(command, start, home = homedir()) {
  const parts = String(command).split(/(\$\(|&&|\|\||[;|\n()])/);
  const stack = [];
  let cwd = start;
  const segments = [];
  for (let k = 0; k < parts.length; k++) {
    const part = parts[k];
    if (k % 2 === 1) {
      if (part === "(" || part === "$(") stack.push(cwd);
      else if (part === ")" && stack.length) cwd = stack.pop();
      continue;
    }
    segments.push({ text: part, cwd });
    const m = /^\s*(?:builtin\s+)?(?:cd|pushd)(?:\s+(\S+))?\s*$/.exec(part.replace(CD_RE, ""));
    if (!m) continue;
    const target = (m[1] ?? "~").replace(/^['"]|['"]$/g, "");
    if (target === "-") continue;
    if (/^(?:~|\$HOME|\$\{HOME\})(?:\/|$)/.test(target)) cwd = resolve(home, target.replace(/^(?:~|\$HOME|\$\{HOME\})\/?/, ""));
    else cwd = resolve(cwd, target);
  }
  return { segments, cwd };
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
// not leaks (the node_modules cache, the run's own temp dir). Returns [{ tool, path }] with duplicates removed. The scan
// is conservative: a flagged run lists its paths in run.json for a person to review.
export function scanToolCalls(calls, { workspaces, allowedDirs = [], allowedPrefixes = DEFAULT_ALLOWED_PREFIXES, home = homedir(), rootExists = defaultRootExists }) {
  const roots = [...workspaces, ...allowedDirs].map((d) => normalize(d));
  const leaks = [];
  const seen = new Set();
  // A call the CLI's permission layer refused never ran: its hits are kept, marked `blocked`, and
  // the runner records them without flagging the run (the canary still sees them as detections).
  let blocked = false;
  const push = (key, hit) => {
    if (blocked) key = `${key}\0blocked`;
    if (seen.has(key)) return;
    seen.add(key);
    leaks.push(blocked ? { ...hit, blocked: true } : hit);
  };
  const add = (tool, path) => push(`${tool}\0${path}`, { tool, path });
  // The Bash tool's working directory persists between Claude's calls (as the CLI does, reset to
  // the workspace when it leaves it); a Codex command starts in the workspace every time.
  let cwd = workspaces[0];
  for (const call of calls) {
    blocked = call.denied === true;
    if (call.fresh_cwd) cwd = workspaces[0];
    let segments = null;
    if (call.tool === "Bash" && typeof call.input?.command === "string") {
      for (const inv of nestedAgentInvocations(call.input.command)) push(`${call.tool}\0nested\0${inv}`, { tool: call.tool, path: `nested agent: ${inv}`, kind: "nested_agent" });
      const tracked = cwdSegments(call.input.command, cwd, home);
      segments = tracked.segments;
      if (!blocked) cwd = roots.some((r) => within(tracked.cwd, r)) ? tracked.cwd : workspaces[0];
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
      // ../ relative to the directory it is used from: the tracked cwd of its Bash segment, or the
      // current cwd for other tools. An absolute cd target is itself checked above.
      const upwardAt = segments && s === call.input.command ? segments.flatMap((seg) => pathsIn(seg.text, home).upward.map((u) => [u, seg.cwd])) : upward.map((u) => [u, cwd]);
      for (const [u, from] of upwardAt) {
        const abs = resolve(from, u);
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

// `$TMPDIR` is the run's own temp dir under both recipes since datapressr-hcn.23 (before, and in
// the weakened recipes, it was shared: Codex inherited ours, where every eval workspace, home and
// settings dir lives; Claude's sandbox pointed it at a per-user dir shared with the user's other
// sessions). Scratch files in it are allowed; listing it, climbing out of it or naming another
// eval run's dir (`evals-*`) is still flagged, so a transcript reads the same under either.
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
