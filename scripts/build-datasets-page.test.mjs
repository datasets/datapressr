import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { HAND_END, HAND_START, build, collect, firstSentence } from "./build-datasets-page.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("firstSentence stops at a full stop but not after initials or U.S.", () => {
  assert.equal(firstSentence("By C. David Keeling. More."), "By C. David Keeling.");
  assert.equal(firstSentence("From the U.S. Energy agency. More."), "From the U.S. Energy agency.");
  assert.equal(firstSentence("Filed with the SEC. More."), "Filed with the SEC.");
  assert.equal(firstSentence("No full stop"), "No full stop");
});

test("build lists every datapackage, links stories and DataHub, keeps the hand-written section", () => {
  const root = mkdtempSync(join(tmpdir(), "datasets-page-"));
  const pkg = (name, status) => ({ name, title: `T ${name}`, description: `About ${name}. Detail.`, status, licenses: [{ name: "PDDL-1.0", path: "https://x" }], sources: [{ title: "Src", path: "https://s" }] });
  for (const [dir, p] of [["topic/oil-prices", pkg("oil-prices", "enriched")], ["other", pkg("other", "stub")], ["other/archive/old", pkg("ignored", "stub")]]) {
    mkdirSync(join(root, "datasets", dir), { recursive: true });
    writeFileSync(join(root, "datasets", dir, "datapackage.json"), JSON.stringify(p));
  }
  mkdirSync(join(root, "site", "stories"), { recursive: true });
  writeFileSync(join(root, "site", "stories", "oil.md"), "---\ntitle: \"Oil story\"\n---\nSee datasets/topic/oil-prices/build.ts\n");
  writeFileSync(join(root, "site", "stories", "oil-outline.md"), "---\ntitle: Outline\n---\ndatasets/topic/oil-prices/\n");
  writeFileSync(join(root, "site", "datasets.md"), `old\n${HAND_START}\nmy notes\n${HAND_END}\n`);

  const names = collect(root).map((d) => d.name);
  assert.ok(names.includes("oil-prices") && names.includes("other") && !names.includes("ignored"));
  assert.ok(names.indexOf("oil-prices") < names.indexOf("other"), "later lifecycle stages first");

  assert.equal(build(root, { check: true }).stale, true);
  assert.match(readFileSync(join(root, "site", "datasets.md"), "utf8"), /^old/, "--check must not write");
  build(root);
  const page = readFileSync(join(root, "site", "datasets.md"), "utf8");
  assert.match(page, /\[DataHub\]\(https:\/\/datahub\.io\/datapressr\/oil-prices\)/);
  assert.match(page, /story: \[Oil story\]\(stories\/oil\.md\)/);
  assert.doesNotMatch(page, /Outline/);
  assert.match(page, /About other\.\n/);
  assert.match(page, new RegExp(`${HAND_START.replace(/[()]/g, "\\$&")}\nmy notes\n${HAND_END}\n$`));
  assert.equal(build(root, { check: true }).stale, false);
});

test("site/datasets.md is up to date with every datapackage.json (run npm run build:datasets-page)", () => {
  assert.equal(build(repoRoot, { check: true }).stale, false);
});
