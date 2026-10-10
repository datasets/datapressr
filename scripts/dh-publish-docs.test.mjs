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

test("the push skill and CLI docs cover story mode: bundle, approval, explicit flags, browser check, caveats", () => {
  const skill = readFileSync(join(repoRoot, "skills/push/SKILL.md"), "utf8");
  const docs = readFileSync(join(repoRoot, "site/docs/cli.md"), "utf8");
  for (const text of [skill, docs]) {
    assert.match(text, /bundle-story\.mjs/);
    assert.match(text, /--allow-draft/);
    assert.match(text, /dh publish <bundle[^>]*> --publication <pub> --name <slug> --title <title> --description <description>/);
    assert.match(text, /Error parsing MDX/);
    assert.match(text, /first publish/);
  }
  assert.match(skill, /## Story mode/);
  assert.match(skill, /Never publish `site\/stories\/` itself/);
  assert.match(skill, /Never mark a story approved yourself/);
});
