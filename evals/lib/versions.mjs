// Version identities for a run: skill tree, harness tree, input trees and the case hash.
// Everything is a git object id so two runs on the same tree are comparable across clones.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function git(root, args, { env } = {}) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: env ? { ...process.env, ...env } : process.env,
  }).trim();
}

export function repoRoot(dir) {
  return git(dir, ["rev-parse", "--show-toplevel"]);
}

export function resolveCommit(root, ref) {
  return git(root, ["rev-parse", "--verify", `${ref}^{commit}`]);
}

// Tree object id of <path> at <ref> (git rev-parse <ref>:<path>). Throws if the path is absent.
export function treeHash(root, ref, path) {
  try {
    return git(root, ["rev-parse", "--verify", `${ref}:${path}`]);
  } catch {
    throw new Error(`no tree for ${path} at ${ref}`);
  }
}

// True when the working tree differs from HEAD under <path>, including untracked files.
export function isDirty(root, path) {
  return git(root, ["status", "--porcelain", "--untracked-files=all", "--", path]) !== "";
}

// Tree id of <path> as it is on disk now (tracked and untracked, .gitignore respected).
// Uses a throwaway index so the repo's own index (and its lock) is never touched.
export function workingTreeHash(root, path) {
  const dir = mkdtempSync(join(tmpdir(), "evals-index-"));
  try {
    const env = { GIT_INDEX_FILE: join(dir, "index") };
    git(root, ["add", "--all", "--", path], { env });
    return git(root, ["write-tree", `--prefix=${path.replace(/\/?$/, "/")}`], { env });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// The skill as the writer will receive it: the tree at <ref>. The dirty flag only applies when
// <ref> is HEAD, where uncommitted edits mean the run would not test what is on disk.
export function skillVersion(root, name, ref = "HEAD") {
  const commit = resolveCommit(root, ref);
  const path = `skills/${name}`;
  const tree = treeHash(root, commit, path);
  const dirty = commit === resolveCommit(root, "HEAD") && isDirty(root, path);
  return { name, ref: commit, tree, dirty };
}

// The harness code that ran: the tree of evals/lib as on disk, and whether it differs from HEAD.
export function harnessVersion(root, path = "evals/lib") {
  const tree = workingTreeHash(root, path);
  let committed = null;
  try {
    committed = treeHash(root, "HEAD", path);
  } catch {
    committed = null;
  }
  return { tree, dirty: tree !== committed };
}

// Exit 0 = ancestor, 1 = not an ancestor; anything else (unknown commit, no main) = false.
export function isAncestorOfMain(root, commit, branch = "main") {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", commit, branch], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

// SHA-256 over case.json, prompt.md and each input's tree id, in a fixed framing.
export function caseHash(caseDir, inputTrees) {
  const h = createHash("sha256");
  for (const name of ["case.json", "prompt.md"]) {
    const bytes = readFileSync(join(caseDir, name));
    h.update(`${name}\0${bytes.length}\0`).update(bytes);
  }
  for (const t of inputTrees) h.update(`input\0${t.path}\0${t.commit}\0${t.tree}\0`);
  return h.digest("hex");
}
