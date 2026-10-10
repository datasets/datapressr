import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { commitAll, makeRepo, sh, write } from "./fixture-repo.mjs";
import { caseHash, harnessVersion, isAncestorOfMain, isDirty, skillVersion, treeHash, workingTreeHash } from "./versions.mjs";

test("treeHash matches git rev-parse <ref>:<path> and throws for a missing path", () => {
  const { root } = makeRepo();
  try {
    assert.equal(treeHash(root, "HEAD", "skills/story"), sh(root, ["rev-parse", "HEAD:skills/story"]));
    assert.throws(() => treeHash(root, "HEAD", "skills/nope"), /no tree/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("skillVersion records ref, tree and dirtiness (including untracked files) at HEAD only", () => {
  const { root, dataCommit } = makeRepo();
  try {
    const clean = skillVersion(root, "story");
    assert.equal(clean.dirty, false);
    assert.equal(clean.ref, sh(root, ["rev-parse", "HEAD"]));
    write(root, "skills/story/new.md", "draft\n");
    assert.equal(isDirty(root, "skills/story"), true);
    const dirty = skillVersion(root, "story");
    assert.equal(dirty.dirty, true);
    assert.equal(dirty.tree, clean.tree, "tree is the committed tree at the ref");
    // An explicit older ref is read from git, so working-tree edits do not make it dirty.
    assert.equal(skillVersion(root, "story", dataCommit).dirty, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("harnessVersion hashes evals/lib as on disk without touching the repo index", () => {
  const { root } = makeRepo();
  try {
    const committed = sh(root, ["rev-parse", "HEAD:evals/lib"]);
    assert.deepEqual(harnessVersion(root), { tree: committed, dirty: false });
    const indexBefore = sh(root, ["ls-files", "--stage"]);
    write(root, "evals/lib/extra.mjs", "export {};\n");
    const h = harnessVersion(root);
    assert.equal(h.dirty, true);
    assert.notEqual(h.tree, committed);
    assert.equal(sh(root, ["ls-files", "--stage"]), indexBefore, "repo index unchanged");
    assert.equal(workingTreeHash(root, "evals/lib"), h.tree, "stable");
    commitAll(root, "extra");
    assert.equal(harnessVersion(root).tree, h.tree, "matches the tree once committed");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("isAncestorOfMain accepts commits on main and rejects side branches and unknown commits", () => {
  const { root, dataCommit } = makeRepo();
  try {
    assert.equal(isAncestorOfMain(root, dataCommit), true);
    sh(root, ["checkout", "-q", "-b", "side"]);
    write(root, "side.txt", "x\n");
    const side = commitAll(root, "side");
    sh(root, ["checkout", "-q", "main"]);
    assert.equal(isAncestorOfMain(root, side), false);
    assert.equal(isAncestorOfMain(root, "0".repeat(40)), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("caseHash changes when the prompt or an input tree changes", () => {
  const { root } = makeRepo();
  try {
    const dir = join(root, "evals/cases/story/t01-demo");
    const inputs = [{ path: "datasets/demo", commit: "c1", tree: "t1" }];
    const a = caseHash(dir, inputs);
    assert.match(a, /^[0-9a-f]{64}$/);
    assert.equal(caseHash(dir, inputs), a);
    assert.notEqual(caseHash(dir, [{ ...inputs[0], tree: "t2" }]), a);
    writeFileSync(join(dir, "prompt.md"), "changed\n");
    assert.notEqual(caseHash(dir, inputs), a);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
