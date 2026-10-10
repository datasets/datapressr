// Post-run leak scan (design section 4.2 step 6): flag any absolute path outside the workspace
// that appears in a tool call. Works on a stream-json transcript (one JSON event per line) or on
// already-extracted tool calls. A leak is { tool, path }; a run with any leak is flagged `leaked`
// and stays in the ledger but is excluded from comparisons.

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, normalize, relative, resolve, sep } from "node:path";

// Paths a tool call may name without it counting as a peek: executables, null devices and the
// shared temp dir (the sandbox's own scratch space). Not $TMPDIR: other workspaces live there.
export const DEFAULT_ALLOWED_PREFIXES = ["/usr/", "/bin/", "/sbin/", "/opt/homebrew/", "/dev/null", "/dev/stdin", "/dev/stdout", "/dev/stderr", "/dev/fd/", "/tmp/", "/private/tmp/"];

// Tool calls from a stream-json transcript: assistant message content blocks of type tool_use.
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
    for (const s of accessStrings(call)) {
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

export function scanTranscript(text, opts) {
  return scanToolCalls(toolCallsFromTranscript(text), opts);
}
