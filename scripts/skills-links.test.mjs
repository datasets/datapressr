// Guards the two ways an installed skill breaks outside this repo.
// `npx skills add datasets/datapressr` copies each skills/<name>/ directory into
// someone else's project and nothing else, so (1) every bundled copy must match
// its original (scripts/sync-skill-bundles.mjs) and (2) no skill may point at a
// path that only exists in this repo: a link must be an absolute URL or a file
// inside the skill's own directory, and a repo path written in backticks
// (`docs/...`, `datasets/<group>/<name>`, ...) must become an absolute GitHub URL.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { datasetValidatorCopies, sync } from "./sync-skill-bundles.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(repoRoot, "skills");

function markdownFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return name.endsWith(".md") ? [path] : [];
  });
}

// Paths that exist only in this repo. `scripts/validate-datapackage.mjs` is
// allowed: `init` copies it into every dataset, so it names a dataset-relative
// path. `site/stories/` and the like are DataPressr's output defaults, not links,
// and a bare `../../` is prose about relative links, not one.
const REPO_PATH = /^(\.\.\/\S*[A-Za-z]|docs\/|site\/docs\/|datasets\/[^/\s]+\/[^/\s]+|scripts\/(?!validate-datapackage\.mjs)\S)/;

/** `../validate/...`: another skill's directory, installed alongside this one. */
const siblingSkill = (code) => /^\.\.\/[a-z-]+\//.test(code) && existsSync(join(skillsDir, code.split("/")[1], "SKILL.md"));

/** Repo-only references in one markdown file under skills/: [line, target] pairs. */
export function repoOnlyRefs(file, text) {
  const skillRoot = join(skillsDir, relative(skillsDir, file).split(sep)[0]);
  const found = [];
  text.split("\n").forEach((line, i) => {
    for (const [, target] of line.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target) || target.includes("<")) continue;
      const path = resolve(dirname(file), target.split("#")[0]);
      if (!path.startsWith(skillRoot + sep) || !existsSync(path)) found.push(`${i + 1}: ](${target})`);
    }
    // Link text of an absolute link is fine; a `<placeholder>` path is an output template, not a reference.
    for (const [, code] of line.replace(/\[[^\]]*\]\(https?:[^)]+\)/g, "").matchAll(/`([^`\n]+)`/g)) {
      if (REPO_PATH.test(code) && !code.includes("<") && !siblingSkill(code)) found.push(`${i + 1}: \`${code}\``);
    }
  });
  return found;
}

test("every file bundled into skills/ matches its original (run node scripts/sync-skill-bundles.mjs)", () => {
  assert.deepEqual(sync(repoRoot, { check: true }), []);
});

test("dataset validator copies are found next to a datapackage.json, never under archive/", () => {
  const dir = mkdtempSync(join(tmpdir(), "sync-validator-"));
  for (const name of ["a", "group/b", "a/archive/old", "no-package"]) mkdirSync(join(dir, name, "scripts"), { recursive: true });
  for (const name of ["a", "group/b", "a/archive/old"]) writeFileSync(join(dir, name, "datapackage.json"), "{}");
  for (const name of ["a", "group/b", "a/archive/old", "no-package"]) writeFileSync(join(dir, name, "scripts", "validate-datapackage.mjs"), "old\n");
  assert.deepEqual(datasetValidatorCopies(dir).map((p) => relative(dir, p)), [join("a", "scripts", "validate-datapackage.mjs"), join("group", "b", "scripts", "validate-datapackage.mjs")]);
});

test("the link check catches a relative link out of the skill and a backticked repo path", () => {
  const file = join(skillsDir, "init", "SKILL.md");
  const text = "See [lifecycle](../../site/docs/lifecyle.md) and `datasets/transport/airports`.\nFine: [x](https://example.org), [ref](references/AGENTS.md), `scripts/validate-datapackage.mjs`, `site/stories/`.";
  assert.deepEqual(repoOnlyRefs(file, text), ["1: ](../../site/docs/lifecyle.md)", "1: `datasets/transport/airports`"]);
});

// The bundled AGENTS.md is a verbatim copy of the root conventions; its own
// links are checked where it is written, in the root file.
const checked = markdownFiles(skillsDir).filter((f) => !f.endsWith(join("init", "references", "AGENTS.md")));

for (const file of checked) {
  test(`${relative(repoRoot, file)} has no repo-only links or paths`, () => {
    assert.deepEqual(repoOnlyRefs(file, readFileSync(file, "utf8")), []);
  });
}
