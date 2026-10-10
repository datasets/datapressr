// Nested agent CLIs (datapressr-hcn.19). A blind writer must not start another agent: in the q01
// pilot the writer ran `claude -p` from Bash, which failed only because the sandbox has no
// network. Both recipes put a per-run shim directory first on the child's PATH whose `claude` and
// `codex` refuse to run; the Claude recipe also denies them as Bash commands. An absolute path to
// the real binary bypasses the shim; the leak scan flags any nested invocation however spelt.

import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";

export const NESTED_AGENTS = ["claude", "codex"];
export const SHIM_MARKER = "NESTED_AGENT_BLOCKED";

export const shimScript = (name) => `#!/bin/sh\necho "${SHIM_MARKER}: ${name} is disabled inside an eval run" >&2\nexit 126\n`;

// Write the shims into `<dir>/bin` and return that directory.
export function makeShimDir(dir) {
  const bin = join(dir, "bin");
  mkdirSync(bin, { recursive: true });
  for (const name of NESTED_AGENTS) {
    writeFileSync(join(bin, name), shimScript(name));
    chmodSync(join(bin, name), 0o755);
  }
  return bin;
}

export function withShimPath(env, shimBin) {
  return { ...env, PATH: [shimBin, env.PATH].filter(Boolean).join(delimiter) };
}

// The absolute path of `bin` on our own PATH: the child's PATH starts with the shim, and spawn
// resolves a bare name against the child's PATH.
export function resolveBin(bin, env = process.env) {
  if (bin.includes("/")) return bin;
  try {
    return execFileSync("/usr/bin/which", [bin], { encoding: "utf8", env, stdio: ["ignore", "pipe", "ignore"] }).trim() || bin;
  } catch {
    return bin;
  }
}

// What the recipe hash sees of the shim.
export const shimTemplate = () => ({ path_prefix: "<shim bin>", shims: Object.fromEntries(NESTED_AGENTS.map((n) => [n, shimScript(n)])) });
