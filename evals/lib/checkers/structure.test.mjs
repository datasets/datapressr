// Structure checks D1-D13 (docs/plans/2026-09-25-research/quality.md section 2.4) on the
// co2-monthly case. Negative controls first: the reference build (the co2-ppm build.ts trimmed to
// the monthly resource, the case's oracle/) must pass all thirteen, and each saboteur, a copy
// broken in one way, must fail exactly the checks it targets. Offline: builds run with the
// network blocked. Then the oracle through the runner: a fake run of the case scores 13/13.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readLedger } from "../ledger.mjs";
import { runCase } from "../runner.mjs";
import { validateCase, validateChecks } from "../schema.mjs";
import { git } from "../versions.mjs";
import { archiveInto } from "./story.mjs";
import { CHECK_IDS, checkStructure, normalise, parseCsv, readReference } from "./structure.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const caseDir = join(root, "evals/cases/structure/co2-monthly");
const kase = JSON.parse(readFileSync(join(caseDir, "case.json"), "utf8"));
const { golden } = kase;
const DS = golden.dataset_dir;

const haveCommits = (() => {
  try {
    for (const { commit } of [...kase.inputs, golden.reference]) git(root, ["cat-file", "-e", `${commit}^{commit}`]);
    git(root, ["rev-parse", "--verify", "main"]);
    return true;
  } catch {
    return false;
  }
})();
const skip = haveCommits ? false : "pinned input commits or main not in this clone";

// A workspace like the writer's: inputs at their pinned commits, the oracle's files on top.
function oracleWorkspace() {
  const ws = mkdtempSync(join(tmpdir(), "evals-structure-test-"));
  for (const { path, commit } of kase.inputs) archiveInto(root, commit, path, ws);
  cpSync(join(caseDir, "oracle"), ws, { recursive: true });
  return ws;
}

// Replace exactly one occurrence, so a saboteur can never silently do nothing.
function edit(file, from, to) {
  const text = readFileSync(file, "utf8");
  const at = text.indexOf(from);
  assert.ok(at >= 0, `saboteur: ${JSON.stringify(from.slice(0, 60))} not found in ${file}`);
  assert.equal(text.indexOf(from, at + 1), -1, `saboteur: ${JSON.stringify(from.slice(0, 60))} occurs more than once`);
  writeFileSync(file, text.slice(0, at) + to + text.slice(at + from.length));
}

function editJson(file, fn) {
  const pkg = JSON.parse(readFileSync(file, "utf8"));
  fn(pkg);
  writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
}

// Regenerate the committed data with the (broken) build, as a writer who reran it would.
function rebuild(dir) {
  const res = spawnSync(process.execPath, ["build.ts"], { cwd: dir, encoding: "utf8" });
  assert.equal(res.status, 0, res.stderr);
}

const failed = (results) => results.filter((r) => !r.pass && r.severity === "fail").map((r) => r.id);

// --- Units -------------------------------------------------------------------------

test("parseCsv: quotes, doubled quotes, CRLF, BOM and a missing trailing newline", () => {
  assert.deepEqual(parseCsv('\ufeffa,b\r\n1,"x, ""y"""\r\n2,'), { header: ["a", "b"], rows: [["1", 'x, "y"'], ["2", ""]] });
  assert.deepEqual(parseCsv("a\n\n1\n"), { header: ["a"], rows: [["1"]] });
});

test("normalise: sentinels and empties are missing, dates compare by month, numbers canonically", () => {
  const s = golden.sentinels;
  assert.deepEqual(["", " ", "-1", "-9.99", "-0.990", "0.00", "1958-03-01", "1958-03-15", "1958-03", "21.0", "abc"].map((v) => normalise(v, s)), ["", "", "", "", "", "0", "1958-03", "1958-03", "1958-03", "21", "abc"]);
});

test("the case validates, and its hand-read anchors are verbatim lines of the pinned raw file", { skip }, () => {
  assert.deepEqual(validateCase(kase).errors, []);
  const raw = git(root, ["show", `${kase.inputs[0].commit}:${kase.inputs[0].path}`]);
  for (const a of golden.anchors) {
    assert.ok(raw.split("\n").includes(a.raw), `anchor ${a.month}: "${a.raw}" is not a line of the raw file`);
    const [y, m] = a.raw.split(",");
    assert.equal(`${y}-${m.padStart(2, "0")}`, a.month);
  }
  const ref = readReference(root, golden);
  assert.equal(ref.rows.length, golden.rows);
  assert.equal(raw.split("\n").filter((l) => l && !l.startsWith("#")).length - 1, golden.rows, "rows = non-comment raw lines minus the header");
});

// --- Oracle ------------------------------------------------------------------------

test("oracle: the reference build scores 13/13", { skip }, () => {
  const ws = oracleWorkspace();
  try {
    const results = checkStructure({ workspace: ws, root, inputs: kase.inputs, golden });
    assert.deepEqual(validateChecks({ checker: "structure", results }).errors, []);
    assert.deepEqual(results.map((r) => r.id), CHECK_IDS);
    assert.deepEqual(failed(results), [], results.filter((r) => !r.pass).map((r) => `${r.id}: ${r.message}`).join("\n"));
    assert.equal(results.filter((r) => r.pass).length, 13);
    const d12 = results.find((r) => r.id === "D12");
    assert.deepEqual(d12.evidence.days_of_month, ["01"]);
    const d8 = results.find((r) => r.id === "D8");
    assert.equal(d8.evidence.roles.std_dev, "std_dev (by name)");
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("judgement calls are recorded, not failed: other names, mid-month dates, decimal_date dropped", { skip }, () => {
  const ws = oracleWorkspace();
  try {
    const dir = join(ws, DS);
    const b = join(dir, "build.ts");
    edit(b, "      date: `${year}-${mm}-01`,", "      date: `${year}-${mm}-15`,");
    edit(b, "      decimal_date: num(decimal),\n", "");
    edit(b, '      "decimal_date",\n', "");
    for (const [from, to] of [["co2_ppm_deseasonalized", "trend_ppm"], ["num_days", "n_days"], ["std_dev", "sdev_ppm"], ["uncertainty", "unc_ppm"], ["co2_ppm", "average_ppm"]]) {
      edit(b, `      ${from}: num(`, `      ${to}: num(`);
      edit(b, `      "${from}",\n`, `      "${to}",\n`);
    }
    editJson(join(dir, "datapackage.json"), (p) => {
      const names = { co2_ppm: "average_ppm", co2_ppm_deseasonalized: "trend_ppm", num_days: "n_days", std_dev: "sdev_ppm", uncertainty: "unc_ppm" };
      const s = p.resources[0].schema;
      s.fields = s.fields.filter((f) => f.name !== "decimal_date").map((f) => ({ ...f, name: names[f.name] ?? f.name }));
    });
    rebuild(dir);
    const results = checkStructure({ workspace: ws, root, inputs: kase.inputs, golden });
    assert.deepEqual(failed(results), [], results.filter((r) => !r.pass).map((r) => `${r.id}: ${r.message}`).join("\n"));
    const by = Object.fromEntries(results.map((r) => [r.id, r]));
    assert.deepEqual(by.D10.evidence.allowed_missing, ["decimal_date"]);
    assert.deepEqual(by.D12.evidence.days_of_month, ["15"]);
    assert.equal(by.D8.evidence.roles.std_dev, "sdev_ppm (by name)");
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

// --- Saboteurs -----------------------------------------------------------------------

const B = "build.ts";
const SABOTEURS = [
  {
    name: "no DECISIONS.md",
    expect: ["D1"],
    apply: (dir) => rmSync(join(dir, "DECISIONS.md")),
  },
  {
    name: "the build fetches the source",
    expect: ["D2", "D3"],
    apply: (dir) => edit(join(dir, B), "\nmain();\n", '\nawait fetch("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv");\nmain();\n'),
  },
  {
    name: "a build timestamp in every row (Date.now)",
    expect: ["D3"],
    apply: (dir) => {
      edit(join(dir, B), "      uncertainty: num(unc, [-0.99]),\n", "      uncertainty: num(unc, [-0.99]),\n      generated_at: new Date(Date.now()).toISOString(),\n");
      edit(join(dir, B), '      "uncertainty",\n    ]),', '      "uncertainty",\n      "generated_at",\n    ]),');
      editJson(join(dir, "datapackage.json"), (p) => p.resources[0].schema.fields.push({ name: "generated_at", type: "datetime" }));
      rebuild(dir);
    },
  },
  {
    name: "a name that is not URL-safe",
    expect: ["D4"],
    apply: (dir) => editJson(join(dir, "datapackage.json"), (p) => (p.name = "CO2 ppm")),
  },
  {
    name: "status left at archived",
    expect: ["D5"],
    apply: (dir) => editJson(join(dir, "datapackage.json"), (p) => (p.status = "archived")),
  },
  {
    name: "CRLF line endings",
    // D4 too since datapressr-ck8: the validator warns on CR line endings.
    expect: ["D4", "D6"],
    apply: (dir) => {
      edit(join(dir, B), 'return lines.join("\\n") + "\\n";', 'return lines.join("\\r\\n") + "\\r\\n";');
      rebuild(dir);
    },
  },
  {
    name: "the last month dropped",
    expect: ["D7", "D8", "D10"],
    apply: (dir) => {
      edit(join(dir, B), "  out.sort((a, b) => String(a.date).localeCompare(String(b.date)));\n", "  out.sort((a, b) => String(a.date).localeCompare(String(b.date)));\n  out.pop();\n");
      rebuild(dir);
    },
  },
  {
    name: "std_dev and uncertainty swapped (labels kept)",
    expect: ["D8"],
    apply: (dir) => {
      edit(join(dir, B), "      std_dev: num(sdev, [-9.99]),\n      uncertainty: num(unc, [-0.99]),", "      std_dev: num(unc, [-0.99]),\n      uncertainty: num(sdev, [-9.99]),");
      rebuild(dir);
    },
  },
  {
    name: "NOAA sentinels kept as values",
    expect: ["D9"],
    apply: (dir) => {
      edit(join(dir, B), "      num_days: num(ndays, [-1]),\n      std_dev: num(sdev, [-9.99]),\n      uncertainty: num(unc, [-0.99]),", "      num_days: num(ndays),\n      std_dev: num(sdev),\n      uncertainty: num(unc),");
      rebuild(dir);
    },
  },
  {
    name: "one global sentinel list that also drops zero",
    expect: ["D8", "D9", "D10"],
    apply: (dir) => {
      edit(join(dir, B), "      num_days: num(ndays, [-1]),\n      std_dev: num(sdev, [-9.99]),\n      uncertainty: num(unc, [-0.99]),", "      num_days: num(ndays, [-1, -9.99, -0.99, 0]),\n      std_dev: num(sdev, [-1, -9.99, -0.99, 0]),\n      uncertainty: num(unc, [-1, -9.99, -0.99, 0]),");
      rebuild(dir);
    },
  },
  {
    name: "one cell off by 0.01 away from every anchor (1990-01)",
    expect: ["D10"],
    apply: (dir) => {
      edit(join(dir, B), "  out.sort((a, b) => String(a.date).localeCompare(String(b.date)));\n", '  out.sort((a, b) => String(a.date).localeCompare(String(b.date)));\n  for (const r of out) if (r.date === "1990-01-01") r.co2_ppm = 353.87;\n');
      rebuild(dir);
    },
  },
  {
    name: "no provenance header in build.ts",
    expect: ["D11"],
    apply: (dir) => {
      const text = readFileSync(join(dir, B), "utf8");
      writeFileSync(join(dir, B), text.slice(text.indexOf("import ")));
    },
  },
  {
    name: "dates as YYYY-MM (typed yearmonth)",
    expect: ["D12"],
    apply: (dir) => {
      edit(join(dir, B), "      date: `${year}-${mm}-01`,", "      date: `${year}-${mm}`,");
      editJson(join(dir, "datapackage.json"), (p) => (p.resources[0].schema.fields[0].type = "yearmonth"));
      rebuild(dir);
    },
  },
  {
    name: "the raw file edited (comment header stripped)",
    expect: ["D13"],
    apply: (dir) => {
      const p = join(dir, "archive/co2_mm_mlo.csv");
      writeFileSync(p, readFileSync(p, "utf8").split("\n").filter((l) => !l.startsWith("#")).join("\n"));
    },
  },
];

for (const s of SABOTEURS) {
  test(`saboteur: ${s.name} fails exactly ${s.expect.join(", ")}`, { skip }, () => {
    const ws = oracleWorkspace();
    try {
      s.apply(join(ws, DS));
      const results = checkStructure({ workspace: ws, root, inputs: kase.inputs, golden });
      assert.deepEqual(failed(results), s.expect, results.filter((r) => !r.pass).map((r) => `${r.id}: ${r.message}`).join("\n"));
    } finally {
      rmSync(ws, { recursive: true, force: true });
    }
  });
}

test("every check has a saboteur that fails it", () => {
  assert.deepEqual([...new Set(SABOTEURS.flatMap((s) => s.expect))].sort(), [...CHECK_IDS].sort());
});

// --- Through the runner ----------------------------------------------------------------

test("a fake run of structure/co2-monthly is the oracle arm: 13/13, no critic, ledger rows", { skip }, async () => {
  const evalsDir = mkdtempSync(join(tmpdir(), "evals-structure-run-"));
  try {
    cpSync(join(root, "evals/config.json"), join(evalsDir, "config.json"));
    mkdirSync(join(evalsDir, "cases/structure"), { recursive: true });
    cpSync(caseDir, join(evalsDir, "cases/structure/co2-monthly"), { recursive: true });
    const logs = [];
    const [r] = await runCase({ root, evalsDir, caseRef: "structure/co2-monthly", writer: "fake", allowDirty: true, log: (m) => logs.push(m) });
    assert.ok(logs.some((m) => /critic skipped/.test(m)), logs.join("\n"));
    assert.equal(r.score, null);
    assert.deepEqual(failed(r.checks.results), []);
    assert.equal(r.checks.results.filter((x) => x.pass).length, 13);
    const rows = readLedger(join(evalsDir, "ledger.jsonl"));
    assert.deepEqual(rows.map((x) => x.kind), ["run", "check"]);
    assert.equal(rows[1].checker, "structure");
    assert.equal(rows[1].passed, 13);
    assert.ok(existsSync(join(r.runDir, "artefacts", DS, "build.ts")));
    assert.ok(readdirSync(join(evalsDir, "runs/structure/co2-monthly")).length === 1);
  } finally {
    rmSync(evalsDir, { recursive: true, force: true });
  }
});
