// story-check: a blog-format story package (README.md + SVGs + <slug>-src/) is
// ready for `dh publish -p blog`. One good fixture, then one saboteur per check.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkStoryPackage, formatTable, packageImages } from "./story-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const GOOD = join(here, "fixtures", "story-package");
const SCRIPT = join(here, "story-check.mjs");

// A copy of the good package with `mutate(dir)` applied.
function saboteur(mutate) {
  const dir = mkdtempSync(join(tmpdir(), "story-check-"));
  cpSync(GOOD, dir, { recursive: true });
  mutate(dir);
  return dir;
}
const editReadme = (dir, fn) => writeFileSync(join(dir, "README.md"), fn(readFileSync(join(dir, "README.md"), "utf8")));
const failing = (results) => results.filter((r) => !r.pass && r.severity === "fail").map((r) => r.id);
const byId = (results, id) => results.find((r) => r.id === id);

test("the good package passes every check", async () => {
  const results = await checkStoryPackage(GOOD);
  assert.deepEqual(failing(results), [], formatTable(GOOD, results));
  assert.deepEqual(results.filter((r) => !r.pass).map((r) => r.id), [], "and raises no warnings");
});

test("images are read from Markdown, <img src> and <source srcSet>, mapped from DataHub URLs to files", () => {
  const md = readFileSync(join(GOOD, "README.md"), "utf8");
  const images = packageImages(md).map((i) => i.local);
  assert.deepEqual(images.sort(), ["good-story-growth.svg", "good-story-share-mobile.svg", "good-story-share.svg"]);
});

test("saboteur: a missing mobile SVG fails the image check", async () => {
  const dir = saboteur((d) => rmSync(join(d, "good-story-share-mobile.svg")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["images"]);
  assert.match(byId(results, "images").message, /good-story-share-mobile\.svg/);
});

test("saboteur: NaN in SVG text fails the SVG check (S7)", async () => {
  const dir = saboteur((d) => {
    const p = join(d, "good-story-growth.svg");
    writeFileSync(p, readFileSync(p, "utf8").replace("Growth by year", "Growth NaN%"));
  });
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["S7"]);
});

test("saboteur: an autolink fails the autolink and MDX checks", async () => {
  const dir = saboteur((d) => editReadme(d, (md) => md.replace("That rise came", "Source: <https://ember-energy.org>. That rise came")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results).sort(), ["autolinks", "mdx"]);
  assert.match(byId(results, "autolinks").message, /line 14/);
});

test("saboteur: a relative CSV link fails the download-link check", async () => {
  const dir = saboteur((d) => editReadme(d, (md) => md.replace("(https://datahub.io/blog/good-story/_r/-/good-story-src/share.csv)", "(good-story-src/share.csv)")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["downloads"]);
  assert.match(byId(results, "downloads").message, /good-story-src\/share\.csv/);
});

test("saboteur: an absolute download link to a file not in the package fails", async () => {
  const dir = saboteur((d) => rmSync(join(d, "good-story-src", "share.csv")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["downloads"]);
});

test("saboteur: an H1 fails the no-H1 check", async () => {
  const dir = saboteur((d) => editReadme(d, (md) => md.replace("\n<p><picture>", "\n# Solar passes 40 per cent\n\n<p><picture>")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["no-h1"]);
});

test("saboteur: front matter without a date fails", async () => {
  const dir = saboteur((d) => editReadme(d, (md) => md.replace("date: 2026-10-20\n", "")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["frontmatter"]);
  assert.match(byId(results, "frontmatter").message, /date/);
});

test("the CLI prints a PASS/FAIL table and exits non-zero on failure", () => {
  const ok = spawnSync(process.execPath, [SCRIPT, GOOD], { encoding: "utf8", cwd: tmpdir() });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /PASS\s+frontmatter/);
  assert.match(ok.stdout, /RESULT: PASS/);
  const dir = saboteur((d) => rmSync(join(d, "good-story-share-mobile.svg")));
  const bad = spawnSync(process.execPath, [SCRIPT, dir], { encoding: "utf8", cwd: tmpdir() });
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /FAIL\s+images/);
  assert.match(bad.stdout, /RESULT: FAIL/);
});
