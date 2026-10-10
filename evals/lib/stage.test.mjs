// Blind staging: the workspace holds exactly the allowlist (and nothing from evals/, docs/,
// published stories or .beads), the node_modules link points at a read-only cache outside the
// denied paths, and collection picks up only what the writer changed. npm ci is stubbed.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commitAll, write } from "./fixture-repo.mjs";
import { stagingRepo } from "./fixture-staging.mjs";
import { BLIND_RUN_NOTES, collectArtefacts, ensureModulesCache, removeWorkspace, stageWorkspace, writerPrompt } from "./stage.mjs";

const fakeInstall = (dir) => {
  mkdirSync(join(dir, "node_modules/fake-plot"), { recursive: true });
  writeFileSync(join(dir, "node_modules/fake-plot/index.js"), "export const ok = 1;\n");
};

test("the writer prompt is the case prompt, then the same blind-run notes for every case", () => {
  const p = writerPrompt("# Task\n\nDo it.\n\n");
  assert.equal(p, `# Task\n\nDo it.\n\n${BLIND_RUN_NOTES}`);
  assert.ok(writerPrompt("# Other\n").endsWith(BLIND_RUN_NOTES));
  // The review gate is met by a recorded self-review (datapressr-hcn.18), with the reader-questions pass.
  assert.match(BLIND_RUN_NOTES, /review: self \(blind run, no reviewer available\)/);
  assert.match(BLIND_RUN_NOTES, /reader-questions pass/);
  assert.match(BLIND_RUN_NOTES, /not inspected visually/);
  // The notes must not point the writer at anything outside the workspace.
  assert.doesNotMatch(BLIND_RUN_NOTES, /docs\/reviews|feedback|evals\//i);
});

const listFiles = (dir) => execFileSync("git", ["ls-files"], { cwd: dir, encoding: "utf8" }).trim().split("\n").sort();

test("staging copies only the allowlist, at the pinned commits, and commits a baseline", () => {
  const { root, dataCommit } = stagingRepo();
  const cacheRoot = mkdtempSync(join(tmpdir(), "evals-cache-"));
  // Change the dataset after the pinned commit: the workspace must get the pinned version.
  write(root, "datasets/demo/data.csv", "year,value\n2000,99\n");
  commitAll(root, "later data");
  let ws;
  try {
    const cache = ensureModulesCache({ root, cacheRoot, install: fakeInstall });
    const kase = { inputs: [{ path: "datasets/demo", commit: dataCommit }], skills: ["story"] };
    ws = stageWorkspace({ root, kase, prompt: "# Task\n\nDo it.\n", modules: cache.modules });

    assert.deepEqual(listFiles(ws.dir), [".gitignore", "AGENTS.md", "TASK.md", "datasets/demo/data.csv", "site/stories/package-lock.json", "site/stories/package.json", "skills/story/SKILL.md"]);
    for (const absent of ["evals", "docs", ".beads", "site/stories/published-story.md", "skills/other"]) assert.equal(existsSync(join(ws.dir, absent)), false, `${absent} must be absent`);

    assert.equal(readFileSync(join(ws.dir, "TASK.md"), "utf8"), "# Task\n\nDo it.\n");
    assert.equal(readFileSync(join(ws.dir, "datasets/demo/data.csv"), "utf8"), "year,value\n2000,10\n2020,20\n", "input at its pinned commit");
    const agents = readFileSync(join(ws.dir, "AGENTS.md"), "utf8");
    assert.equal(agents, "# Conventions\n\nDataset rules.\n");

    const link = join(ws.dir, "site/stories/node_modules");
    assert.ok(lstatSync(link).isSymbolicLink());
    assert.equal(readlinkSync(link), cache.modules);
    assert.ok(cache.modules.startsWith(cacheRoot));
    assert.equal(statSync(join(cache.modules, "fake-plot/index.js")).mode & 0o222, 0, "cache is read-only");

    assert.equal(execFileSync("git", ["status", "--porcelain"], { cwd: ws.dir, encoding: "utf8" }), "", "baseline is clean");
    assert.match(ws.baseline, /^[0-9a-f]{40}$/);
  } finally {
    if (ws) removeWorkspace(ws.dir);
    execFileSync("chmod", ["-R", "u+w", cacheRoot]);
    rmSync(cacheRoot, { recursive: true, force: true });
    rmSync(root, { recursive: true, force: true });
  }
});

test("the cache is built once per lockfile hash and refused inside a denied path", () => {
  const { root } = stagingRepo();
  const cacheRoot = mkdtempSync(join(tmpdir(), "evals-cache-"));
  let installs = 0;
  const install = (d) => (installs++, fakeInstall(d));
  try {
    const a = ensureModulesCache({ root, cacheRoot, install });
    const b = ensureModulesCache({ root, cacheRoot, install });
    assert.equal(a.dir, b.dir);
    assert.equal(installs, 1);
    write(root, "site/stories/package-lock.json", '{ "lockfileVersion": 3, "changed": true }\n');
    commitAll(root, "new lock");
    const c = ensureModulesCache({ root, cacheRoot, install });
    assert.notEqual(c.key, a.key);
    assert.equal(installs, 2);

    assert.throws(() => ensureModulesCache({ root, cacheRoot: join(root, ".cache"), install }), /inside a denied path/);
    const home = mkdtempSync(join(tmpdir(), "evals-home-"));
    assert.throws(() => ensureModulesCache({ root, home, cacheRoot: join(home, ".claude/cache"), install }), /inside a denied path/);
    rmSync(home, { recursive: true, force: true });
  } finally {
    execFileSync("chmod", ["-R", "u+w", cacheRoot]);
    rmSync(cacheRoot, { recursive: true, force: true });
    rmSync(root, { recursive: true, force: true });
  }
});

test("collection copies new and changed files, lists deletions and skips the node_modules link", () => {
  const { root, dataCommit } = stagingRepo();
  const cacheRoot = mkdtempSync(join(tmpdir(), "evals-cache-"));
  const dest = mkdtempSync(join(tmpdir(), "evals-dest-"));
  let ws;
  try {
    const cache = ensureModulesCache({ root, cacheRoot, install: fakeInstall });
    ws = stageWorkspace({ root, kase: { inputs: [{ path: "datasets/demo", commit: dataCommit }], skills: ["story"] }, prompt: "x\n", modules: cache.modules });
    write(ws.dir, "site/stories/demo.md", "# Demo story\n");
    write(ws.dir, "site/stories/demo-chart.svg", "<svg/>\n");
    write(ws.dir, "datasets/demo/data.csv", "tampered\n");
    rmSync(join(ws.dir, "skills/story/SKILL.md"));
    // A writer that commits part of its work (the story skill says to commit each artefact) must not hide it.
    execFileSync("git", ["add", "site/stories/demo.md"], { cwd: ws.dir });
    execFileSync("git", ["commit", "-q", "-m", "outline"], { cwd: ws.dir });
    const got = collectArtefacts(ws.dir, dest, { baseline: ws.baseline });
    assert.deepEqual(got.copied, ["datasets/demo/data.csv", "site/stories/demo-chart.svg", "site/stories/demo.md"]);
    assert.deepEqual(got.deleted, ["skills/story/SKILL.md"]);
    assert.equal(readFileSync(join(dest, "site/stories/demo.md"), "utf8"), "# Demo story\n");

    const capped = collectArtefacts(ws.dir, mkdtempSync(join(tmpdir(), "evals-dest-")), { baseline: ws.baseline, maxBytes: 10 });
    assert.ok(capped.skipped.length > 0, "the 2 MB cap skips files beyond it");
  } finally {
    if (ws) removeWorkspace(ws.dir);
    execFileSync("chmod", ["-R", "u+w", cacheRoot]);
    for (const d of [cacheRoot, dest, root]) rmSync(d, { recursive: true, force: true });
  }
});
