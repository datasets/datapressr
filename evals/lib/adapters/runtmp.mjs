// Per-run temp dir (datapressr-hcn.23). Without it a blind writer's $TMPDIR is shared: inside
// Claude's sandbox it is /tmp/claude-<uid>, which also holds the user's other Claude sessions'
// scratchpads; Codex inherits ours, where every eval workspace and temp home lives. Both recipes
// now give the child a fresh dir under /tmp that is removed after the run, and the leak scan
// allows only that dir (not /tmp as a whole).
//
// Claude: CLAUDE_CODE_TMPDIR=<base>; the CLI then gives sandboxed commands TMPDIR=<base>/claude-<uid>
// and lets them write there. The path is kept short (/tmp/evt-XXXXXX/claude-<uid> is under 30
// bytes) because the CLI falls back to a shared dir when the per-uid dir is too long for a Unix
// socket path. Codex: TMPDIR=<base>/tmp, so the parent of $TMPDIR is still this run's own dir.

import { mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { join } from "node:path";

export const RUN_TMP_PARENT = "/tmp";
export const RUN_TMP_PREFIX = "evt-";

// The shared Claude temp dir for this user, both spellings (/tmp is a link to /private/tmp on
// macOS). Empty when the platform has no uid.
export function sharedTmpDirs(uid = process.getuid?.()) {
  if (uid === undefined) return [];
  return [`/tmp/claude-${uid}`, `/private/tmp/claude-${uid}`];
}

// Create the per-run dir. `dirs` is every spelling of it, for the leak scan's allow list.
export function makeRunTmp(parent = RUN_TMP_PARENT) {
  const base = mkdtempSync(join(parent, RUN_TMP_PREFIX));
  const real = realpathSync(base);
  const codexTmp = join(base, "tmp");
  mkdirSync(codexTmp);
  return { base, codexTmp, dirs: [...new Set([base, real])] };
}

export function removeRunTmp(t) {
  if (t) rmSync(t.base, { recursive: true, force: true });
}

const inside = (p, dir) => p === dir || p.startsWith(`${dir}/`);

// Refuse to deny the shared Claude temp dir when our own temp dir (where workspaces, settings and
// shims live) is inside it: that happens only when the harness itself runs in a Claude sandbox.
export function assertTmpOutsideShared(ours, shared = sharedTmpDirs()) {
  let real = ours;
  try {
    real = realpathSync(ours);
  } catch {}
  const hit = shared.find((d) => inside(ours, d) || inside(real, d));
  if (hit) throw new Error(`the harness's temp dir ${ours} is inside the shared Claude temp dir ${hit}, which the blind recipe denies; run from a normal shell or set TMPDIR elsewhere`);
}
