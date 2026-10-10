import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, relative } from "node:path";
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

// --- Data layer: CSV values against the declared schema ------------------------
// Fixtures and expected results: docs/plans/2026-09-25-research/quality.md §1.5.

const dataErrors = (name, opts) => validateDatapackage(fixture(name), opts);

// A throwaway structured dataset with one resource `obs` holding `csv` (written
// byte for byte, so BOM/CRLF cases need no committed fixture git could normalise).
const tmpData = (fields, csv, schemaExtra = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "validate-data-"));
  mkdirSync(join(dir, "data"));
  writeFileSync(join(dir, "data", "obs.csv"), csv);
  writeFileSync(join(dir, "datapackage.json"), JSON.stringify({
    name: "x", title: "X", description: "X", status: "structured",
    licenses: [{ name: "CC0-1.0" }], sources: [{ title: "S", path: "https://example.com" }],
    resources: [{ path: "data/obs.csv", name: "obs", schema: { fields, ...schemaExtra } }],
  }));
  return dir;
};

test("quoted CSV (embedded comma, \"\" escape, embedded newline) and missing optional values are clean", () => {
  assert.deepEqual(dataErrors("data-valid-quoted"), { errors: [], warnings: [], notes: [] });
});

test("invalid dates: impossible day, wrong separator, 29 Feb in a non-leap year", () => {
  const { errors, warnings } = dataErrors("data-invalid-date");
  assert.deepEqual(errors, [
    'obs:3: date = "2020-02-30" is not an ISO 8601 date (YYYY-MM-DD)',
    'obs:4: date = "2020/04/01" is not an ISO 8601 date (YYYY-MM-DD)',
    'obs:5: date = "2021-02-29" is not an ISO 8601 date (YYYY-MM-DD)',
  ]);
  assert.deepEqual(warnings, []);
});

test("bad number, integer, grouped number and boolean are one error each", () => {
  const { errors } = dataErrors("data-bad-number");
  assert.deepEqual(errors, [
    'obs:2: value = "abc" is not a number',
    'obs:3: count = "2.5" is not an integer',
    'obs:4: value = "1,000" is not a number',
    'obs:5: flag = "yes" is not a boolean',
  ]);
});

test("duplicate composite and single-field primary keys cite the first-seen line", () => {
  const { errors } = dataErrors("data-duplicate-key");
  assert.deepEqual(errors, [
    "obs:5: duplicate primary key (country_code, date) = (GBR, 2020-01-01), first seen line 2",
    "countries:4: duplicate primary key (country_code) = (GBR), first seen line 2",
  ]);
});

test("a blank cell in a primary key field is an error", () => {
  assert.deepEqual(dataErrors("data-empty-key").errors, ["obs:3: country_code is empty but part of the primary key"]);
});

test("short and long rows are errors and the other rows are still checked", () => {
  assert.deepEqual(dataErrors("data-row-width").errors, [
    "obs:3: row has 2 cell(s), header has 3",
    "obs:4: row has 4 cell(s), header has 3",
    'obs:5: value = "oops" is not a number',
  ]);
});

test("a header that doesn't match the schema is one error, with no per-row cascade", () => {
  const { errors } = dataErrors("data-header-mismatch");
  assert.equal(errors.length, 1, errors.join("\n"));
  assert.match(errors[0], /header \[value, id\] does not match schema fields \[id, value\]/);
});

test("a same-package foreign key orphan is one error with a count and the first line", () => {
  assert.deepEqual(dataErrors("data-fk-orphan").errors, [
    "obs: 2 row(s) whose foreign key (country_code) is not in countries; first at line 3 (XKX)",
  ]);
});

test("an unsupported type is a 'not checked' warning, not an error", () => {
  const { errors, warnings } = dataErrors("data-unsupported-type");
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, ['obs: location has type "geopoint", which this validator does not check']);
});

test("{ data: false } (--metadata-only) skips every value check", () => {
  for (const name of ["data-invalid-date", "data-bad-number", "data-duplicate-key", "data-fk-orphan", "data-header-mismatch", "data-unsupported-type"]) {
    assert.deepEqual(dataErrors(name, { data: false }), { errors: [], warnings: [], notes: [] }, name);
  }
});

test("BOM is an error; CRLF and a missing trailing newline are warnings", () => {
  const dir = tmpData([{ name: "n", type: "integer" }], "\ufeffn\r\n1\r\n2");
  const { errors, warnings } = validateDatapackage(dir);
  assert.deepEqual(errors, ["obs: file starts with a UTF-8 BOM (house format is UTF-8 without BOM)"]);
  assert.deepEqual(warnings, ["obs:1: CR line endings (house format is LF)", "obs:3: no trailing newline (house format ends with LF)"]);
});

test("invalid UTF-8 is an error", () => {
  const dir = tmpData([{ name: "name", type: "string" }], "name\n");
  writeFileSync(join(dir, "data", "obs.csv"), Buffer.from([0x6e, 0x61, 0x6d, 0x65, 0x0a, 0xff, 0xfe, 0x0a]));
  assert.deepEqual(validateDatapackage(dir).errors, ["obs: not valid UTF-8"]);
});

test("CSV syntax: an unterminated quote and a stray quote are errors", () => {
  assert.ok(validateDatapackage(tmpData([{ name: "a", type: "string" }], 'a\n"open\n')).errors.some((e) => /unterminated quoted field/.test(e)));
  assert.ok(validateDatapackage(tmpData([{ name: "a", type: "string" }], 'a\nx"y\n')).errors.some((e) => /quote character inside an unquoted field/.test(e)));
  assert.ok(validateDatapackage(tmpData([{ name: "a", type: "string" }], 'a\n"x"y\n')).errors.some((e) => /text after a closing quote/.test(e)));
});

test("string whitespace padding warns; required, enum, year, yearmonth and datetime are checked", () => {
  const fields = [
    { name: "region", type: "string", constraints: { required: true, enum: ["North", "South"] } },
    { name: "year", type: "year" },
    { name: "month", type: "yearmonth" },
    { name: "at", type: "datetime" },
  ];
  const csv = "region,year,month,at\nNorth,2020,2020-01,2020-01-01T00:00:00Z\nNorth ,20,2020-13,2020-02-30T00:00:00\n,2020,2020-12,2020-01-01T10:00:00+01:00\n";
  const { errors, warnings } = validateDatapackage(tmpData(fields, csv));
  assert.deepEqual(errors, [
    'obs:3: region = "North " is not one of the allowed values (constraints.enum)',
    'obs:3: year = "20" is not a 4-digit year',
    'obs:3: month = "2020-13" is not a year-month (YYYY-MM)',
    'obs:3: at = "2020-02-30T00:00:00" is not an ISO 8601 datetime (YYYY-MM-DDThh:mm:ss)',
    "obs:4: region is empty but required",
  ]);
  assert.deepEqual(warnings, ['obs:3: region has leading/trailing whitespace: "North "']);
});

test("schema.missingValues replaces the default empty string, and booleans honour trueValues/falseValues", () => {
  const fields = [{ name: "v", type: "number" }, { name: "ok", type: "boolean", trueValues: ["Y"], falseValues: ["N"] }];
  const { errors } = validateDatapackage(tmpData(fields, "v,ok\nNA,Y\n,N\n1,true\n", { missingValues: ["NA"] }));
  assert.deepEqual(errors, ['obs:3: v = "" is not a number', 'obs:4: ok = "true" is not a boolean']);
});

test("a non-default date format is a 'not checked' warning, and its values are skipped", () => {
  const { errors, warnings } = validateDatapackage(tmpData([{ name: "d", type: "date", format: "%d/%m/%Y" }], "d\n01/02/2020\n"));
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, ['obs: d has format "%d/%m/%Y", which this validator does not check']);
});

test("a systematic error prints five findings and one 'more of the same' line", () => {
  const csv = "n\n" + Array.from({ length: 12 }, () => "x\n").join("");
  const { errors } = validateDatapackage(tmpData([{ name: "n", type: "integer" }], csv));
  assert.equal(errors.length, 6, errors.join("\n"));
  assert.equal(errors[5], "obs: ... 7 more of the same (type n)");
});

test("the CLI's --metadata-only and --json flags", () => {
  const script = join(here, "validate-datapackage.mjs");
  const run = (...args) => {
    try {
      return { status: 0, out: execFileSync(process.execPath, [script, ...args], { encoding: "utf8" }) };
    } catch (e) {
      return { status: e.status, out: e.stdout };
    }
  };
  const full = run(fixture("data-invalid-date"));
  assert.equal(full.status, 1);
  assert.match(full.out, /2020-02-30/);
  const meta = run("--metadata-only", fixture("data-invalid-date"));
  assert.equal(meta.status, 0);
  assert.match(meta.out, /values not checked \(--metadata-only\)/);
  const json = run(fixture("data-invalid-date"), "--json");
  assert.equal(json.status, 1);
  const parsed = JSON.parse(json.out);
  assert.equal(parsed.errors.length, 3);
  assert.equal(parsed.stats.rows, 5);
  assert.equal(parsed.stats.cells, 10);
});

// Every real dataset in this repo validates clean, values included, so a data
// regression in any of them fails `npm test`.
const repoRoot = join(here, "..");
const datasetDirs = (dir) => {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || ["archive", "data", "node_modules"].includes(entry.name) || entry.name.startsWith(".")) continue;
    found.push(...datasetDirs(join(dir, entry.name)));
  }
  if (existsSync(join(dir, "datapackage.json"))) found.push(dir);
  return found;
};

test("every dataset in datasets/ passes the validator with values checked: 0 errors, 0 warnings", () => {
  const dirs = datasetDirs(join(repoRoot, "datasets"));
  assert.ok(dirs.length >= 7, `expected at least 7 datasets, found ${dirs.length}`);
  for (const dir of dirs) {
    const stats = { resources: 0, rows: 0, cells: 0 };
    const { errors, warnings } = validateDatapackage(dir, { stats });
    assert.deepEqual([...errors, ...warnings], [], relative(repoRoot, dir));
    assert.ok(stats.rows > 0, `${relative(repoRoot, dir)}: no rows checked`);
  }
});
