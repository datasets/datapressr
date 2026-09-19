// Every invisible character in this file is written as an escape, on purpose:
// check-invisible-characters.mjs scans its own test file too, so these tests
// cannot be the thing that reintroduces the bug they exist to catch.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findInvisible,
  formatReport,
  isSourcePath,
  scanRepo,
  sourceFiles,
  walkTree,
} from "./check-invisible-characters.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

test("finds a zero-width space and reports its escape", () => {
  const [hit, ...rest] = findInvisible(`const re = /[\u200b]/g;`);
  assert.equal(rest.length, 0);
  assert.equal(hit.codePoint, 0x200b);
  assert.equal(hit.name, "ZERO WIDTH SPACE");
  assert.equal(hit.escape, "\\u200b");
  assert.equal(hit.line, 1);
  assert.equal(hit.column, 14);
});

test("finds a no-break space", () => {
  const [hit] = findInvisible(`"a\u00a0b"`);
  assert.equal(hit.codePoint, 0x00a0);
  assert.equal(hit.escape, "\\u00a0");
});

test("an escape written out in ASCII is not a finding — that is the fix", () => {
  assert.deepEqual(findInvisible(String.raw`const re = /[\u00a0\u200b]+/g;`), []);
});

test("ordinary whitespace is not a finding", () => {
  assert.deepEqual(findInvisible("a b\tc\r\nd\n"), []);
});

test("counts lines and columns the way an editor shows them", () => {
  const [hit] = findInvisible(`first\nsecond\nthi\ufeffrd\n`);
  assert.equal(hit.line, 3);
  assert.equal(hit.column, 4);
});

test("U+2028 is a finding, and does not itself start a new line", () => {
  const hits = findInvisible(`a\u2028b\nc\u00a0d`);
  assert.deepEqual(
    hits.map((h) => [h.codePoint, h.line]),
    [
      [0x2028, 1],
      [0x00a0, 2],
    ],
  );
});

test("columns count UTF-16 units, so an astral character ahead of the finding counts twice", () => {
  const [hit] = findInvisible(`a\u{1f600}b\u00a0`);
  assert.equal(hit.column, 5);
});

test("a leading BOM is reported", () => {
  const [hit] = findInvisible(`\ufeffimport fs from "node:fs";\n`);
  assert.equal(hit.codePoint, 0xfeff);
  assert.equal(hit.line, 1);
  assert.equal(hit.column, 1);
});

test("reports every occurrence, not just the first", () => {
  assert.equal(findInvisible(`\u200b\u200b\u00a0`).length, 3);
});

test("source extensions are in scope", () => {
  for (const p of ["build.ts", "scripts/x.mjs", "a/b/c.js", "tool.py", "x.cjs"]) {
    assert.ok(isSourcePath(p), p);
  }
});

test("data, prose and archived sources are out of scope", () => {
  for (const p of [
    "data/gdp.csv",
    "README.md",
    "datapackage.json",
    "datasets/commons-issues/101-historical-gdp.md",
    "datasets/transport/tesla-quarterly-deliveries/archive/2024-01-02.htm",
  ]) {
    assert.ok(!isSourcePath(p), p);
  }
});

test("a source file archived verbatim is still out of scope", () => {
  assert.ok(!isSourcePath("datasets/x/archive/scraper-we-found.py"));
  assert.ok(!isSourcePath("node_modules/pkg/index.mjs"));
});

test("the file list is non-empty and includes this test's own module", () => {
  const files = sourceFiles(repoRoot);
  assert.ok(files.length >= 10, `only found ${files.length} source files`);
  assert.ok(files.includes("scripts/check-invisible-characters.mjs"), files.join("\n"));
  assert.ok(files.includes("scripts/check-invisible-characters.test.mjs"), files.join("\n"));
  assert.ok(!files.some((f) => f.split("/").includes("archive")), "archive/ leaked in");
});

// The no-git fallback is tested through walkTree directly: calling sourceFiles
// on a temp directory would not prove the fallback ran, because git happily
// lists an untracked directory that happens to sit inside someone's checkout.
test("the no-git fallback walks the tree and skips what git would have skipped", () => {
  const dir = mkdtempSync(join(tmpdir(), "invisible-test-"));
  mkdirSync(join(dir, "archive"), { recursive: true });
  mkdirSync(join(dir, "node_modules", "pkg"), { recursive: true });
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(join(dir, "src", "build.ts"), "export const a = 1;\n");
  writeFileSync(join(dir, "notes.md"), "prose\n");
  writeFileSync(join(dir, "archive", "scraped.py"), "x = 1\n");
  writeFileSync(join(dir, "node_modules", "pkg", "index.mjs"), "export default 1;\n");
  assert.deepEqual(walkTree(dir, dir).sort(), ["notes.md", "src/build.ts"]);
  assert.deepEqual(walkTree(dir, dir).filter(isSourcePath), ["src/build.ts"]);
});

test("no tracked source file contains a literal invisible character", () => {
  const findings = scanRepo(repoRoot);
  assert.deepEqual(findings, [], formatReport(findings));
});

test("the clean report says so", () => {
  assert.match(formatReport([]), /no literal invisible characters/);
});

test("the failure report names the file, position and fix", () => {
  const report = formatReport([
    { file: "build.ts", line: 4, column: 22, codePoint: 0x200b, name: "ZERO WIDTH SPACE", escape: "\\u200b" },
  ]);
  assert.match(report, /build\.ts:4:22/);
  assert.match(report, /U\+200B ZERO WIDTH SPACE/);
  assert.match(report, /write it as \\u200b/);
});
