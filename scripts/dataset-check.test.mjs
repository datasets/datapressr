import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { checkDataset, cronCadence, normaliseLicense } from "./dataset-check.mjs";

const TEMPLATE = join(dirname(fileURLToPath(import.meta.url)), "..", "templates", "commons-dataset");

const README = `Annual widgets made in Ruritania, 2000–2002. This is a frozen snapshot taken on 2026-11-22.

## What stands out

Output doubled from 10 in 2000 to 20 in 2002.

## Source and licence

Ruritanian Statistics Office, public domain.
`;

const PKG = {
  name: "widgets",
  title: "Widgets",
  description: "Annual widgets made in Ruritania",
  status: "structured",
  licenses: [{ name: "CC0-1.0", path: "https://creativecommons.org/publicdomain/zero/1.0/" }],
  sources: [{ title: "Ruritanian Statistics Office", path: "https://stats.example.org/widgets" }],
  upkeep: { mode: "frozen", snapshot: "2026-11-22" },
  resources: [{
    name: "widgets-annual", path: "data/widgets.csv", format: "csv", mediatype: "text/csv",
    schema: { fields: [{ name: "year", type: "year" }, { name: "widgets", type: "integer" }], primaryKey: ["year"] },
  }],
};

/** A dataset that passes --new; `mutate` edits it before writing. */
function fixture(mutate = () => {}) {
  const root = mkdtempSync(join(tmpdir(), "dataset-check-test-"));
  const dir = join(root, "widgets");
  cpSync(TEMPLATE, dir, { recursive: true });
  rmSync(join(dir, "README.md"));
  mkdirSync(join(dir, "data"));
  const files = {
    "datapackage.json": structuredClone(PKG),
    "README.md": README,
    "data/widgets.csv": "year,widgets\n2000,10\n2001,15\n2002,20\n",
  };
  mutate(files, dir);
  for (const [p, v] of Object.entries(files)) {
    if (v === null) continue;
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), typeof v === "string" ? v : JSON.stringify(v, null, 2) + "\n");
  }
  return dir;
}

test("a dataset built to the standard passes --new", () => {
  const r = checkDataset(fixture(), { level: "new" });
  assert.deepEqual(r.errors, []);
  assert.equal(r.upkeep, "frozen");
});

test("--new: a licence off the allowlist is an error; stock accepts a lenient spelling", () => {
  const dir = fixture((f) => { f["datapackage.json"].licenses = [{ name: "odc-pddl" }]; });
  assert.match(checkDataset(dir, { level: "new" }).errors.join("\n"), /not on the open allowlist/);
  assert.doesNotMatch(checkDataset(dir).warnings.join("\n"), /allowlist/);
  const nc = fixture((f) => { f["datapackage.json"].licenses = [{ name: "CC-BY-NC-4.0" }]; });
  assert.match(checkDataset(nc).warnings.join("\n"), /not on the open allowlist/);
});

test("missing upkeep is an error for new, a warning for stock", () => {
  const dir = fixture((f) => { delete f["datapackage.json"].upkeep; });
  assert.match(checkDataset(dir, { level: "new" }).errors.join("\n"), /no `upkeep`/);
  const stock = checkDataset(dir);
  assert.deepEqual(stock.errors, []);
  assert.match(stock.warnings.join("\n"), /no `upkeep`/);
  assert.equal(stock.upkeep, "frozen (inferred)");
});

test("a living dataset needs a scheduled workflow and monitored status", () => {
  const dir = fixture((f) => { f["datapackage.json"].upkeep = { mode: "living", refresh: "weekly", workflow: ".github/workflows/update.yml" }; });
  const errs = checkDataset(dir, { level: "new" }).errors.join("\n");
  assert.match(errs, /does not exist/);
  assert.match(errs, /monitored/);
  const ok = fixture((f) => {
    f["datapackage.json"].upkeep = { mode: "living", refresh: "weekly", workflow: ".github/workflows/update.yml" };
    f["datapackage.json"].status = "monitored";
    f["README.md"] = README.replace("This is a frozen snapshot taken on 2026-11-22.", "Updated weekly by a scheduled job.");
    f[".github/workflows/update.yml"] = "on:\n  schedule:\n    - cron: '0 6 * * 3'\n";
  });
  assert.deepEqual(checkDataset(ok, { level: "new" }).errors, []);
});

test("a living dataset gone stale is an error; inferred living only warns", () => {
  const living = fixture((f) => {
    f["datapackage.json"].upkeep = { mode: "living", refresh: "weekly", workflow: ".github/workflows/update.yml" };
    f["datapackage.json"].status = "monitored";
    f[".github/workflows/update.yml"] = "on:\n  schedule:\n    - cron: '0 6 * * 3'\n";
  });
  const facts = { lastDataCommit: "2026-10-01T00:00:00Z", now: new Date("2026-11-22T00:00:00Z") };
  assert.match(checkDataset(living, { facts }).errors.join("\n"), /stale/);
  assert.deepEqual(checkDataset(living, { facts: { ...facts, lastDataCommit: "2026-11-15T00:00:00Z" } }).errors, []);
  const inferred = fixture((f) => {
    delete f["datapackage.json"].upkeep;
    f[".github/workflows/update.yml"] = "on:\n  schedule:\n    - cron: '0 6 1 * *'\n";
  });
  const r = checkDataset(inferred, { facts: { lastDataCommit: "2025-01-01T00:00:00Z", now: facts.now } });
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join("\n"), /stale: living \(inferred\)/);
});

test("a failing refresh job is an error", () => {
  const r = checkDataset(fixture(), { facts: { lastRun: { conclusion: "failure", at: "2026-11-01T06:00:00Z" } } });
  assert.match(r.errors.join("\n"), /refresh job failing/);
});

test("README rules: H1, sections, how it is kept", () => {
  const dir = fixture((f) => { f["README.md"] = "# Widgets\n\nSome widgets.\n"; });
  const errs = checkDataset(dir, { level: "new" }).errors.join("\n");
  assert.match(errs, /H1/);
  assert.match(errs, /What stands out/);
  assert.match(errs, /Source and licence/);
  assert.match(errs, /how the data is kept/);
  const none = fixture((f) => { f["README.md"] = null; });
  assert.match(checkDataset(none).errors.join("\n"), /no root README.md/);
});

test("git-sync junk must be in config.json contentExclude", () => {
  const dir = fixture((f) => {
    f["archive/raw.csv"] = "x\n";
    f["config.json"] = { contentExclude: ["scripts"] };
  });
  assert.match(checkDataset(dir, { level: "new" }).errors.join("\n"), /contentExclude` must list archive/);
});

test("stock level: CSV values that don't match a legacy schema warn, not fail", () => {
  const dir = fixture((f) => { f["data/widgets.csv"] = "year,widgets\n2000,1,000\n"; });
  assert.ok(checkDataset(dir, { level: "new" }).errors.length > 0);
  const stock = checkDataset(dir);
  assert.deepEqual(stock.errors, []);
  assert.match(stock.warnings.join("\n"), /don't match the schema/);
});

test("name must match the repo", () => {
  const r = checkDataset(fixture(), { level: "new", repoName: "gadgets" });
  assert.match(r.errors.join("\n"), /differs from the repo name/);
});

test("views must name an existing resource", () => {
  const dir = fixture((f) => { f["datapackage.json"].views = [{ name: "chart", resources: ["nope"], specType: "simple" }]; });
  assert.match(checkDataset(dir, { level: "new" }).errors.join("\n"), /Resource not found for view/);
});

test("cronCadence and normaliseLicense", () => {
  assert.equal(cronCadence("0 6 * * *"), "daily");
  assert.equal(cronCadence("0 6 * * 3"), "weekly");
  assert.equal(cronCadence("0 6 1 * *"), "monthly");
  assert.equal(cronCadence("0 6 1 1,4,7,10 *"), "quarterly");
  assert.equal(cronCadence("0 6 1 1 *"), "annual");
  assert.equal(normaliseLicense({ name: "odc-pddl" }), "PDDL-1.0");
  assert.equal(normaliseLicense({ id: "CC-BY-4.0" }), "CC-BY-4.0");
  assert.equal(normaliseLicense({ name: "CC-BY-NC-4.0" }), null);
});
