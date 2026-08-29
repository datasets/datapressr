import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
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
