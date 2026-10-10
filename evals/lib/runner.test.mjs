// End-to-end fake run in a throwaway repo: the CLI resolves versions, refuses a dirty skill,
// writes a valid run.json with artefact hashes, appends a ledger row and regenerates REPORT.md.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { makeRepo, sh, write } from "./fixture-repo.mjs";
import { readLedger } from "./ledger.mjs";
import { runCase } from "./runner.mjs";
import { validateRun } from "./schema.mjs";

const cli = (root, args) => spawnSync(process.execPath, [join(root, "evals/run.mjs"), ...args], { cwd: root, encoding: "utf8" });

test("run --writer fake works end to end through the CLI", () => {
  const { root } = makeRepo();
  try {
    const res = cli(root, ["run", "story/t01-demo", "--writer", "fake"]);
    assert.equal(res.status, 0, res.stderr);

    const caseRuns = join(root, "evals/runs/story/t01-demo");
    const [runId] = readdirSync(caseRuns);
    assert.match(runId, /^\d{8}-\d{4}-t01-demo-fake-fake-[0-9a-f]{7}-1$/);
    const run = JSON.parse(readFileSync(join(caseRuns, runId, "run.json"), "utf8"));
    assert.deepEqual(validateRun(run).errors, []);

    assert.equal(run.skill.tree, sh(root, ["rev-parse", "HEAD:skills/story"]));
    assert.equal(run.skill.dirty, false);
    assert.equal(run.harness.tree, sh(root, ["rev-parse", "HEAD:evals/lib"]));
    assert.match(run.case_hash, /^[0-9a-f]{64}$/);
    assert.equal(run.writer.prompt_sha256, createHash("sha256").update(readFileSync(join(root, "evals/cases/story/t01-demo/prompt.md"))).digest("hex"));
    assert.equal(run.cost_usd, 0);
    assert.deepEqual(run.flags, []);

    const paths = run.artefacts.map((a) => a.path).sort();
    assert.deepEqual(paths, ["site/stories/fake-story-make-charts.mjs", "site/stories/fake-story-outline.md", "site/stories/fake-story-trend.svg", "site/stories/fake-story.md"]);
    for (const a of run.artefacts) {
      const bytes = readFileSync(join(caseRuns, runId, "artefacts", a.path));
      assert.equal(a.bytes, bytes.length);
      assert.equal(a.sha256, createHash("sha256").update(bytes).digest("hex"));
    }

    const rows = readLedger(join(root, "evals/ledger.jsonl"));
    assert.deepEqual(rows.map((r) => r.kind), ["run", "check"]);
    assert.equal(rows[1].run_id, runId);
    assert.ok(existsSync(join(caseRuns, runId, "checks.json")), "run writes checks.json");
    assert.equal(rows[0].run_id, runId);
    assert.equal(rows[0].schema, 1);
    assert.equal(rows[0].path, `runs/story/t01-demo/${runId}`);

    const report = readFileSync(join(root, "evals/REPORT.md"), "utf8");
    assert.match(report, /## story\/t01-demo/);
    assert.ok(report.includes(runId));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a dirty skills/story tree is refused unless --allow-dirty, which flags the run", () => {
  const { root } = makeRepo();
  try {
    write(root, "skills/story/SKILL.md", "# edited\n");
    const refused = cli(root, ["run", "story/t01-demo", "--writer", "fake"]);
    assert.notEqual(refused.status, 0);
    assert.match(refused.stderr, /uncommitted changes.*--allow-dirty/);
    assert.equal(existsSync(join(root, "evals/ledger.jsonl")), false, "nothing recorded");

    const allowed = cli(root, ["run", "story/t01-demo", "--writer", "fake", "--allow-dirty"]);
    assert.equal(allowed.status, 0, allowed.stderr);
    const [row] = readLedger(join(root, "evals/ledger.jsonl"));
    assert.deepEqual(row.flags, ["dirty_skill"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("repeats get distinct run ids; real writers and unknown cases are refused clearly", async () => {
  const { root } = makeRepo();
  try {
    const fixed = new Date("2026-10-10T09:05:00Z");
    const results = await runCase({ root, caseRef: "story/t01-demo", writer: "fake", repeat: 2, now: () => fixed });
    assert.deepEqual(results.map((r) => r.runId.slice(-2)), ["-1", "-2"]);
    assert.ok(results[0].runId.startsWith("20261010-0905-t01-demo-fake-fake-"));
    assert.equal(readLedger(join(root, "evals/ledger.jsonl")).filter((r) => r.kind === "run").length, 2);

    await assert.rejects(runCase({ root, caseRef: "story/t01-demo", writer: "codex" }), /datapressr-hcn\.4/);
    await assert.rejects(runCase({ root, caseRef: "story/nope", writer: "fake" }), /no case/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a case whose input commit is not on main is refused before anything runs", async () => {
  const { root } = makeRepo();
  try {
    sh(root, ["checkout", "-q", "-b", "side"]);
    write(root, "datasets/demo/data.csv", "year,value\n2000,11\n");
    sh(root, ["add", "--all"]);
    sh(root, ["commit", "-q", "-m", "side"]);
    const side = sh(root, ["rev-parse", "HEAD"]);
    sh(root, ["checkout", "-q", "main"]);
    const casePath = join(root, "evals/cases/story/t01-demo/case.json");
    const kase = JSON.parse(readFileSync(casePath, "utf8"));
    kase.inputs[0].commit = side;
    write(root, "evals/cases/story/t01-demo/case.json", JSON.stringify(kase));
    await assert.rejects(runCase({ root, caseRef: "story/t01-demo", writer: "fake", allowDirty: true }), /not an ancestor of main/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
