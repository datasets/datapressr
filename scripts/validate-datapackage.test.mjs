import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, symlinkSync } from "node:fs";
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

test("bad-name fixture also flags empty resources", () => {
  const { errors } = validateDatapackage(fixture("bad-name"));
  assert.ok(errors.some((e) => e.includes("`resources`")), errors.join("\n"));
});

test("empty resources array is an error", () => {
  const { errors } = validateDatapackage(fixture("no-resources"));
  assert.ok(errors.some((e) => e.includes("`resources`")), errors.join("\n"));
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
