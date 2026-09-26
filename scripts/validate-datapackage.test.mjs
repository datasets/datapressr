import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateDatapackage } from "./validate-datapackage.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => join(here, "fixtures", name);

test("valid fixture has no errors or warnings", () => {
  const { errors, warnings } = validateDatapackage(fixture("valid"));
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test("rejects a name that isn't URL-safe", () => {
  const { errors } = validateDatapackage(fixture("bad-name"));
  assert.ok(errors.some((e) => e.includes("not URL-safe")), errors.join("\n"));
});

test("bad-name fixture (a stub with no resources) flags only the name", () => {
  const { errors } = validateDatapackage(fixture("bad-name"));
  assert.equal(errors.length, 1, errors.join("\n"));
  assert.ok(!errors.some((e) => e.includes("`resources`")), errors.join("\n"));
});

// --- Early lifecycle stages (capture, stub) -----------------------------------

// A throwaway dataset dir holding just this datapackage.json.
const tmpPackage = (pkg) => {
  const dir = mkdtempSync(join(tmpdir(), "validate-stage-"));
  writeFileSync(join(dir, "datapackage.json"), JSON.stringify(pkg, null, 2) + "\n");
  return dir;
};

test("the init-scaffold fixture is exactly what skills/init/SKILL.md scaffolds", () => {
  // Guards the fixture against drift: if init's template changes, this fails
  // and the fixture (and the early-stage rules) get another look.
  const skill = readFileSync(join(here, "..", "skills", "init", "SKILL.md"), "utf8");
  const block = skill.match(/`<name>\/datapackage\.json`:\s*```json\n([\s\S]*?)```/);
  assert.ok(block, "no datapackage.json template found in skills/init/SKILL.md");
  const template = block[1]
    .split("\n")
    .map((line) => line.replace(/^ {3}/, ""))
    .join("\n")
    .replaceAll("<name>", "init-scaffold");
  const onDisk = readFileSync(join(fixture("init-scaffold"), "datapackage.json"), "utf8");
  assert.equal(onDisk, template);
});

test("a fresh /init scaffold validates clean: 0 errors, 0 warnings", () => {
  const { errors, warnings, notes } = validateDatapackage(fixture("init-scaffold"));
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  // The blank title and description are nudged as notes, which don't count.
  assert.equal(notes.length, 2, notes.join("\n"));
  assert.ok(notes.some((n) => n.includes("`title`")), notes.join("\n"));
  assert.ok(notes.some((n) => n.includes("`description`")), notes.join("\n"));
});

test("the CLI exits 0 on a fresh /init scaffold and prints the notes", () => {
  const { status, out } = runCli(join(here, "validate-datapackage.mjs"), fixture("init-scaffold"));
  assert.equal(status, 0);
  assert.match(out, /0 error\(s\), 0 warning\(s\), 2 note\(s\)/);
  assert.match(out, /note: `title` is blank/);
});

test("a filled-in stub with no resources has no errors, warnings or notes", () => {
  const dir = tmpPackage({ name: "a-stub", title: "A stub", description: "Just a link so far", status: "stub", resources: [] });
  assert.deepEqual(validateDatapackage(dir), { errors: [], warnings: [], notes: [] });
});

test("status: capture with no resources key at all is also clean", () => {
  const dir = tmpPackage({ name: "an-idea", title: "An idea", description: "A URL to explore", status: "capture" });
  assert.deepEqual(validateDatapackage(dir), { errors: [], warnings: [], notes: [] });
});

// --- From archived onward -------------------------------------------------------

test("status: archived with no resources is still an error", () => {
  const { errors } = validateDatapackage(fixture("no-resources"));
  assert.ok(errors.some((e) => e.includes("`resources` is missing or empty")), errors.join("\n"));
});

test("every stage past stub errors on empty resources", () => {
  for (const status of ["archived", "structured", "enriched", "monitored"]) {
    const dir = tmpPackage({ name: "x", title: "X", description: "X", status, resources: [] });
    const { errors } = validateDatapackage(dir);
    assert.ok(errors.some((e) => e.includes("`resources`")), `${status}: ${errors.join("\n")}`);
  }
});

test("no status at all is treated as past stub: resources error plus a status warning", () => {
  const dir = tmpPackage({ name: "x", title: "", description: "", resources: [] });
  const { errors, warnings, notes } = validateDatapackage(dir);
  assert.ok(errors.some((e) => e.includes("`resources`")), errors.join("\n"));
  assert.ok(warnings.includes("`status` is missing"), warnings.join("\n"));
  assert.ok(warnings.includes("`title` is missing"), warnings.join("\n"));
  assert.ok(warnings.some((w) => w.includes("`licenses`")), warnings.join("\n"));
  assert.deepEqual(notes, []);
});

test("an unknown status warns and is treated as past stub", () => {
  const dir = tmpPackage({ name: "x", title: "X", description: "X", status: "stubb", resources: [] });
  const { errors, warnings } = validateDatapackage(dir);
  assert.ok(errors.some((e) => e.includes("`resources`")), errors.join("\n"));
  assert.ok(warnings.some((w) => w.includes('"stubb" is not a lifecycle stage')), warnings.join("\n"));
});

test("a resource path that doesn't exist on disk is an error", () => {
  const { errors } = validateDatapackage(fixture("missing-file"));
  assert.ok(errors.some((e) => e.includes("does not exist on disk")), errors.join("\n"));
});

test("missing datapackage.json entirely is an error, not a crash", () => {
  const empty = mkdtempSync(join(tmpdir(), "validate-test-"));
  const { errors } = validateDatapackage(empty);
  assert.ok(errors.some((e) => e.includes("not found")), errors.join("\n"));
});

const runCli = (script, dir) => {
  try {
    return { status: 0, out: execFileSync(process.execPath, [script, dir], { encoding: "utf8" }) };
  } catch (e) {
    return { status: e.status, out: e.stdout };
  }
};

test("the CLI reports and exits 1 even when its own path contains a space", () => {
  // A `file://${process.argv[1]}` guard compares an encoded URL against a raw
  // path, so from a spaced directory the CLI printed nothing and exited 0 —
  // which reads as "passed" on a package that has errors.
  const dir = mkdtempSync(join(tmpdir(), "validate cli "));
  const copy = join(dir, "validate-datapackage.mjs");
  copyFileSync(join(here, "validate-datapackage.mjs"), copy);
  const { status, out } = runCli(copy, fixture("bad-name"));
  assert.equal(status, 1);
  assert.match(out, /not URL-safe/);
});

test("the CLI reports and exits 1 when reached through a symlinked directory", () => {
  // Node resolves symlinks for import.meta.url but leaves process.argv[1] as
  // typed, so comparing the two silently does nothing and exits 0 when the
  // script is invoked through a symlink (macOS's tmpdir and /tmp are both
  // symlinks, as is any checkout reached through a linked parent directory).
  const dir = mkdtempSync(join(tmpdir(), "validate link "));
  const real = join(dir, "real dir");
  mkdirSync(real);
  copyFileSync(join(here, "validate-datapackage.mjs"), join(real, "validate-datapackage.mjs"));
  const link = join(dir, "link");
  symlinkSync(real, link, "dir");
  const { status, out } = runCli(join(link, "validate-datapackage.mjs"), fixture("bad-name"));
  assert.equal(status, 1);
  assert.match(out, /not URL-safe/);
});

test("invalid JSON is reported as an error, not a thrown exception", () => {
  const { errors } = validateDatapackage(fixture("invalid-json"));
  assert.ok(errors.some((e) => e.includes("not valid JSON")), errors.join("\n"));
});

test("status past stub with no licenses/sources warns on both", () => {
  const { warnings } = validateDatapackage(fixture("missing-license"));
  assert.ok(warnings.some((w) => w.includes("`licenses`")), warnings.join("\n"));
  assert.ok(warnings.some((w) => w.includes("`sources`")), warnings.join("\n"));
});

test("status: stub does not require licenses/sources", () => {
  const { warnings } = validateDatapackage(fixture("no-schema"));
  assert.ok(!warnings.some((w) => w.includes("`licenses`")), warnings.join("\n"));
});

test("a resource with no schema.fields warns", () => {
  const { warnings } = validateDatapackage(fixture("no-schema"));
  assert.ok(warnings.some((w) => w.includes("schema.fields")), warnings.join("\n"));
});

test("a file in data/ not listed in resources warns", () => {
  const { warnings } = validateDatapackage(fixture("unlisted-file"));
  assert.ok(
    warnings.some((w) => w.includes("extra-file-not-in-resources.csv")),
    warnings.join("\n"),
  );
});

test("a stub with no title key still warns, and a non-array resources errors at any stage", () => {
  const dir = mkdtempSync(join(tmpdir(), "dp-stub-"));
  writeFileSync(join(dir, "datapackage.json"), JSON.stringify({ name: "x", status: "stub", resources: "foo" }));
  const { errors, warnings, notes } = validateDatapackage(dir);
  assert.ok(errors.some((e) => /must be an array/.test(e)));
  assert.ok(warnings.some((w) => /`title` is missing/.test(w)));
  assert.ok(warnings.some((w) => /`description` is missing/.test(w)));
  assert.deepEqual(notes, []);
});
