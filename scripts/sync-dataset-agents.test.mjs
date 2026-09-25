import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MARKER, datasetSection, sync } from "./sync-dataset-agents.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("the dataset section stops at the marker and drops the repo-only part", () => {
  const section = datasetSection(`# Title\n\nconventions\n\n${MARKER}\n\n## Task tracking\n`);
  assert.equal(section, "# Title\n\nconventions\n");
});

test("a root AGENTS.md without the marker is an error, not a silent full copy", () => {
  assert.throws(() => datasetSection("# Title\n\n## Task tracking\n"), /marker/);
});

test("sync rewrites a stale copy, leaves a current one, and ignores archive/", () => {
  const dir = mkdtempSync(join(tmpdir(), "sync-agents-"));
  writeFileSync(join(dir, "AGENTS.md"), `# Rules\n\n${MARKER}\n\n## Repo only\n`);
  for (const name of ["stale", "current", "stale/archive/nested"]) {
    mkdirSync(join(dir, "datasets", name), { recursive: true });
    writeFileSync(join(dir, "datasets", name, "datapackage.json"), "{}");
  }
  writeFileSync(join(dir, "datasets", "stale", "AGENTS.md"), "old\n");
  writeFileSync(join(dir, "datasets", "current", "AGENTS.md"), "# Rules\n");
  writeFileSync(join(dir, "datasets", "stale", "archive", "nested", "AGENTS.md"), "evidence\n");

  assert.deepEqual(sync(dir, { check: true }), [join("datasets", "stale", "AGENTS.md")]);
  assert.equal(readFileSync(join(dir, "datasets", "stale", "AGENTS.md"), "utf8"), "old\n", "--check must not write");

  sync(dir);
  assert.equal(readFileSync(join(dir, "datasets", "stale", "AGENTS.md"), "utf8"), "# Rules\n");
  assert.equal(readFileSync(join(dir, "datasets", "stale", "archive", "nested", "AGENTS.md"), "utf8"), "evidence\n");
  assert.deepEqual(sync(dir, { check: true }), []);
});

test("every dataset AGENTS.md in this repo matches the root dataset section", () => {
  assert.deepEqual(sync(repoRoot, { check: true }), []);
});
