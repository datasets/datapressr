// The DataHub CLI renamed `dh push` to `dh publish`; the old command fails.
// Guard the skills, the agent contract and the user docs against drifting back.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function markdownFiles(path) {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : markdownFiles(child);
    return entry.name.endsWith(".md") ? [child] : [];
  });
}

test("no skill, AGENTS.md or user doc tells anyone to run `dh push`", () => {
  const files = ["skills", "site/docs", "AGENTS.md", "README.md", "site/README.md"].flatMap((p) => markdownFiles(join(repoRoot, p)));
  const stale = files.filter((file) => /\bdh push\b/.test(readFileSync(file, "utf8"))).map((file) => relative(repoRoot, file));
  assert.deepEqual(stale, []);
});

test("the push skill runs `dh publish` with an explicit publication and states DataHub's requirements", () => {
  const skill = readFileSync(join(repoRoot, "skills/push/SKILL.md"), "utf8");
  assert.match(skill, /dh publish \. --publication /);
  assert.match(skill, /dh login/);
  assert.match(skill, /DATAHUB_API_TOKEN/);
  assert.match(skill, /README\.md/);
  assert.match(skill, /series\[0\]/);
  assert.match(skill, /Never publish to `core`/);
  assert.match(skill, /Refusing to publish to core/);
  assert.doesNotMatch(skill, /DATAHUB_PUBLICATION:-core/);
  assert.match(skill, /Never run `dh login` yourself/);
  assert.match(skill, /command -v dh/);
  assert.doesNotMatch(skill, /^dh login/m);
});
