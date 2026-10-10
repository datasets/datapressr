// Per-run temp dir: short, under /tmp, every spelling listed, removed afterwards; the harness
// refuses to deny the shared Claude temp dir when its own temp dir is inside it.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { assertTmpOutsideShared, makeRunTmp, removeRunTmp, sharedTmpDirs } from "./runtmp.mjs";

test("the shared Claude temp dir, both spellings", () => {
  assert.deepEqual(sharedTmpDirs(501), ["/tmp/claude-501", "/private/tmp/claude-501"]);
});

test("a per-run temp dir is short, has a Codex subdir and is removed", () => {
  const t = makeRunTmp();
  try {
    assert.match(t.base, /^\/tmp\/evt-[A-Za-z0-9]{6}$/);
    assert.ok(`${t.base}/claude-${process.getuid()}`.length <= 30, "short enough for the Claude CLI's per-uid socket dir");
    assert.ok(statSync(t.codexTmp).isDirectory());
    assert.ok(t.dirs.includes(t.base));
  } finally {
    removeRunTmp(t);
  }
  assert.equal(existsSync(t.base), false);
});

test("the harness refuses to run from inside the shared temp dir", () => {
  assert.throws(() => assertTmpOutsideShared("/tmp/claude-501/x", ["/tmp/claude-501"]), /inside the shared Claude temp dir/);
  assert.doesNotThrow(() => assertTmpOutsideShared("/var/folders/xx/T", ["/tmp/claude-501"]));
  assert.doesNotThrow(() => assertTmpOutsideShared("/tmp/claude-5010", ["/tmp/claude-501"]));
});
