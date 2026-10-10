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
import { EMPTY_TREE, noSkillPrompt, writerPrompt } from "./stage.mjs";

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
    // The writer prompt is the case prompt plus the blind-run notes (datapressr-hcn.18).
    assert.equal(run.writer.prompt_sha256, createHash("sha256").update(writerPrompt(readFileSync(join(root, "evals/cases/story/t01-demo/prompt.md"), "utf8"))).digest("hex"));
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
    assert.deepEqual(rows.map((r) => r.kind), ["run", "check", "score"]);
    assert.equal(rows[1].run_id, runId);
    assert.ok(existsSync(join(caseRuns, runId, "checks.json")), "run writes checks.json");
    // Step 7: auto picks the free fake critic for the fake writer and the latest rubric.
    assert.equal(rows[2].run_id, runId);
    assert.equal(rows[2].status, "ok");
    assert.equal(rows[2].critic.vendor, "fake");
    assert.equal(rows[2].rubric, "story/v2");
    assert.ok(existsSync(join(caseRuns, runId, "critique-v2-1.json")), "run writes the critique");
    assert.match(res.stdout, /scored, publishable with-edits/);
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

    await assert.rejects(runCase({ root, caseRef: "story/t01-demo", writer: "gemini" }), /unknown writer "gemini"/);
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

test("--no-critic skips scoring; an explicit fake critic scores", () => {
  const { root } = makeRepo();
  try {
    const skipped = cli(root, ["run", "story/t01-demo", "--writer", "fake", "--no-critic"]);
    assert.equal(skipped.status, 0, skipped.stderr);
    assert.match(skipped.stdout, /not scored \(--no-critic\)/);
    assert.deepEqual(readLedger(join(root, "evals/ledger.jsonl")).map((r) => r.kind), ["run", "check"]);
    const scored = cli(root, ["run", "story/t01-demo", "--writer", "fake", "--critic", "fake"]);
    assert.equal(scored.status, 0, scored.stderr);
    assert.deepEqual(readLedger(join(root, "evals/ledger.jsonl")).map((r) => r.kind), ["run", "check", "run", "check", "score"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a critic failure is recorded as critic_failed and the run, its checks and later repeats are kept", async () => {
  const { root } = makeRepo();
  try {
    const broken = { fake: { critic: async () => { throw new Error("critic exploded"); } } };
    const logs = [];
    const results = await runCase({ root, caseRef: "story/t01-demo", writer: "fake", repeat: 2, critic: { spec: "auto", adapters: broken }, log: (m) => logs.push(m) });
    assert.equal(results.length, 2, "the second repeat still runs");
    const rows = readLedger(join(root, "evals/ledger.jsonl"));
    assert.deepEqual(rows.map((r) => r.kind), ["run", "check", "score", "run", "check", "score"]);
    for (const [i, r] of results.entries()) {
      assert.ok(existsSync(join(r.runDir, "run.json")));
      assert.ok(existsSync(join(r.runDir, "checks.json")));
      assert.equal(r.score.status, "critic_failed");
      assert.equal(r.score.run_id, r.runId);
      assert.match(r.score.errors.join(" "), /critic exploded/);
      assert.equal(rows[3 * i + 2].status, "critic_failed");
    }
    assert.ok(logs.some((m) => /critic_failed for /.test(m)));
    assert.match(readFileSync(join(root, "evals/REPORT.md"), "utf8"), /critic failed/);

    // A critic that cannot even be resolved (vendor unavailable) is recorded the same way.
    const [r] = await runCase({ root, caseRef: "story/t01-demo", writer: "fake", critic: { spec: "codex", available: () => ({ ok: false, reason: "no auth" }) } });
    assert.equal(r.score.status, "critic_failed");
    assert.equal(r.score.critic.vendor, "codex");
    assert.match(r.score.errors[0], /--critic codex: no auth/);
    assert.ok(existsSync(join(r.runDir, "run.json")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("run exits non-zero when the critic fails, but keeps the run", () => {
  const { root } = makeRepo();
  try {
    const res = cli(root, ["run", "story/t01-demo", "--writer", "fake", "--critic", "nope"]);
    assert.equal(res.status, 1);
    assert.match(res.stdout, /critic_failed \(run kept/);
    assert.deepEqual(readLedger(join(root, "evals/ledger.jsonl")).map((r) => [r.kind, r.status]), [["run", undefined], ["check", undefined], ["score", "critic_failed"]]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("--no-skill: the baseline arm records no skill, drops the skill line from the prompt, and is refused for a case that names none", async () => {
  const { root } = makeRepo();
  try {
    // The demo prompt names no skill path: a no-skill arm would get the same text as the skill arm.
    await assert.rejects(runCase({ root, caseRef: "story/t01-demo", writer: "fake", noSkill: true }), /no-skill: the case prompt names none of skills\/story/);

    const casePrompt = "# Task\n\nWhy did the value double?\n\nFollow the conventions in `AGENTS.md`.\n\nUse the `story` skill in `skills/story/`.\n\n## More\n";
    write(root, "evals/cases/story/t01-demo/prompt.md", casePrompt);
    sh(root, ["add", "--all"]);
    sh(root, ["commit", "-q", "-m", "prompt names the skill"]);
    write(root, "skills/story/SKILL.md", "# edited, uncommitted\n"); // irrelevant to a no-skill run
    const res = cli(root, ["run", "story/t01-demo", "--writer", "fake", "--no-skill", "--no-critic"]);
    assert.equal(res.status, 0, res.stderr);
    const caseRuns = join(root, "evals/runs/story/t01-demo");
    const [runId] = readdirSync(caseRuns);
    assert.match(runId, /^\d{8}-\d{4}-t01-demo-fake-fake-noskill-1$/);
    const run = JSON.parse(readFileSync(join(caseRuns, runId, "run.json"), "utf8"));
    assert.deepEqual(validateRun(run).errors, []);
    assert.deepEqual(run.skill, { name: "none", ref: sh(root, ["rev-parse", "HEAD"]), tree: EMPTY_TREE, dirty: false });
    assert.deepEqual(run.flags, ["no_skill"]);
    const stripped = noSkillPrompt(casePrompt, ["story"]);
    assert.equal(stripped, "# Task\n\nWhy did the value double?\n\nFollow the conventions in `AGENTS.md`.\n\n## More\n");
    assert.equal(run.writer.prompt_sha256, createHash("sha256").update(writerPrompt(stripped)).digest("hex"));
    const [row] = readLedger(join(root, "evals/ledger.jsonl"));
    assert.equal(row.skill_name, "none");
    assert.equal(row.skill_tree, EMPTY_TREE);
    assert.deepEqual(row.flags, ["no_skill"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
