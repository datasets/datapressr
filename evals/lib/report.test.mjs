import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { agreement, compareRanges, promptKey, readPrompts, renderReport } from "./report.mjs";
import { validateLedgerRow } from "./schema.mjs";

const SHA = "d".repeat(64);
const T0 = "0".repeat(40);
const T1 = "1".repeat(40);
const T2 = "2".repeat(40);
const T3 = "3".repeat(40);
const C = (n) => String(n).repeat(40).slice(0, 40).replace(/\d/g, (d) => "abcdef0123"[d]);
const CASE = "q01-french-debt";
const critic = { vendor: "codex", model: "gpt-6-astra", model_actual: "gpt-6-astra", fallback: false };

const run = (run_id, at, tree, extra = {}) => ({
  schema: 1, kind: "run", at, run_id, case_id: CASE, domain: "story", path: `runs/story/${CASE}/${run_id}`, case_hash: SHA,
  skill_name: "story", skill_tree: tree, harness_tree: T0, writer: { vendor: "claude", model: "claude-opus-5-5", model_actual: "claude-opus-5-5" }, turns: 40, cost_usd: 3.5, flags: [], ...extra,
});
const check = (run_id, at, failed = []) => ({ schema: 1, kind: "check", at, run_id, checker: "story", harness_tree: T0, failed, warned: [], passed: 6 - failed.length });
const score = (run_id, at, scores, rubric = "story/v1", extra = {}) => ({ schema: 1, kind: "score", at, run_id, rubric, critic, status: "ok", publishable: "with-edits", scores, ...extra });
const pair = (pair_id, at, run_ids, ab, ba) => ({
  schema: 1, kind: "pair", at, pair_id, case_id: CASE, run_ids, rubric: "story/v1", critic,
  judgements: [{ order: "AB", preferred_run_id: ab }, { order: "BA", preferred_run_id: ba }], winner_run_id: ab !== null && ab === ba ? ab : null,
});

// Two skill trees (T1 older, T2 newer) with repeats, a leaked run, a second writer model, a newly
// failing check, two pairs (one a loss for the new tree, one split), an owner row with its reveal,
// a re-scored run, a second rubric version and a rounds row.
function fixture() {
  return [
    { schema: 1, kind: "canary", at: "2026-10-10T08:00:00Z", run_id: "c1", vendor: "claude", cli_version: "2.1.296", recipe_sha256: SHA, mode: "fixed", pass: true },
    run("r1a", "2026-10-10T09:00:00.000Z", T1),
    run("r1b", "2026-10-10T09:10:00.000Z", T1),
    run("r2a", "2026-10-10T10:00:00.000Z", T2),
    run("r2b", "2026-10-10T10:10:00.000Z", T2),
    run("r2c", "2026-10-10T10:20:00.000Z", T2, { flags: ["leaked"] }),
    run("r2d", "2026-10-10T10:30:00.000Z", T2, { writer: { vendor: "claude", model: "claude-sonnet-5-5", model_actual: "claude-sonnet-5-5" } }),
    check("r1a", "2026-10-10T11:00:00Z"),
    check("r1b", "2026-10-10T11:00:00Z", ["S2"]),
    check("r2a", "2026-10-10T11:00:00Z", ["S3"]),
    check("r2b", "2026-10-10T11:00:00Z", ["S2"]),
    score("r1a", "2026-10-10T12:00:00Z", { argument: 1, prose: 1 }),
    score("r1b", "2026-10-10T12:00:00Z", { argument: 2, prose: 1 }),
    score("r2a", "2026-10-10T12:00:00Z", { argument: 1, prose: 2 }),
    score("r2b", "2026-10-10T12:00:00Z", { argument: 2, prose: 2 }),
    score("r1a", "2026-10-10T12:30:00Z", { argument: 2, prose: 1 }), // re-score: critic-only spread
    score("r2b", "2026-10-10T12:40:00Z", { argument: 0, prose: 0 }, "story/v2"),
    pair("p1", "2026-10-10T13:00:00Z", ["r1a", "r2a"], "r1a", "r1a"),
    pair("p2", "2026-10-10T13:10:00Z", ["r1b", "r2b"], "r2b", "r1b"),
    { schema: 1, kind: "owner", at: "2026-10-10T14:00:00Z", case_id: CASE, pair_id: "p1", preferred: "A", remarks: "A answers the old-age question.\n\nB's colours | confuse me.\n", scores: { "A.prose": 1, "B.prose": 1 } },
    { schema: 1, kind: "reveal", at: "2026-10-10T14:00:01Z", pair_id: "p1", case_id: CASE, owner_at: "2026-10-10T14:00:00Z", mapping: { A: "r1a", B: "r2a" }, preferred_run_id: "r1a" },
    { schema: 1, kind: "owner", at: "2026-10-10T15:00:00Z", case_id: CASE, rounds_to_publishable: 3 },
  ];
}

const ctx = {
  skills: {
    story: [
      { commit: C(1), tree: T0, subject: "Add story skill" },
      { commit: C(2), tree: T1, subject: "Tighten outline rules" },
      { commit: C(3), tree: T2, subject: "Add reader questions" },
      { commit: C(4), tree: T3, subject: "Untested later edit" },
    ],
  },
  canary: [{ vendor: "claude", cli_version: "2.1.300", recipe_sha256: SHA, mode: "fixed" }],
  calibration: [{ rubric: "story/v1", label: "round 2 (held out)", hits: 3, total: 5 }],
  repoUrl: "https://github.com/datasets/datapressr",
};

const section = (md, heading) => {
  const start = md.indexOf(`\n## ${heading}\n`);
  assert.ok(start >= 0, `section ${heading}`);
  const end = md.indexOf("\n## ", start + 4);
  return md.slice(start, end < 0 ? undefined : end);
};

test("the fixture ledger is valid", () => {
  for (const row of fixture()) assert.deepEqual(validateLedgerRow(row).errors, [], `${row.kind} ${row.run_id ?? row.pair_id ?? ""}`);
});

test("empty ledger says so in every section", () => {
  const md = renderReport([]);
  assert.match(md, /## Flags\n\nNone\./);
  assert.match(md, /## Per case\n\nNo runs recorded yet/);
  assert.match(md, /No absolute scores recorded yet/);
});

test("flags: hard regression only from a newly failing check, soft flag on a loss, leaks, missing canary", () => {
  const flags = section(renderReport(fixture(), ctx), "Flags");
  assert.match(flags, /\*\*Hard regression\*\* on story\/q01-french-debt: check S3 passed on every run of tree `1111111` \(n=2\) and fails on 1 of 2 runs of tree `2222222` \(r2a\)/);
  assert.doesNotMatch(flags, /check S2/, "S2 already failed on the old tree: not a regression");
  assert.match(flags, /Soft flag .* pair p1 .* older tree `1111111` beat the newer `2222222`/);
  assert.doesNotMatch(flags, /pair p2/, "a split pair is a tie, not a loss");
  assert.match(flags, /Leaked run r2c/);
  assert.match(flags, /Missing canary for the installed CLI \(claude 2\.1\.300, fixed mode/);
  // A canary for the installed CLI clears that flag.
  const ok = section(renderReport(fixture(), { ...ctx, canary: [{ vendor: "claude", cli_version: "2.1.296", recipe_sha256: SHA, mode: "fixed" }] }), "Flags");
  assert.doesNotMatch(ok, /canary/i);
});

test("per skill change: win/tie/loss with n, what changed, owner preference, untested commits", () => {
  const s = section(renderReport(fixture(), ctx), "Per skill change");
  assert.match(s, /#### Tree `2222222`, commit `[0-9a-f]{7}` Add reader questions/);
  assert.match(s, /Cases run: story\/q01-french-debt \(4 runs\)/);
  assert.match(s, /`git log --oneline [0-9a-f]{7}\.\.[0-9a-f]{7} -- skills\/story` \(\[compare\]\(https:\/\/github\.com\/datasets\/datapressr\/compare\//);
  assert.match(s, /Pairwise vs `1111111` \(rubric story\/v1\): 0 wins, 1 tie, 1 loss \(n=2 pairs\)/);
  assert.match(s, /p2 on q01-french-debt: tie \(orders split\)/);
  assert.match(s, /p1: owner preferred old/);
  assert.match(s, /Tree `1111111`.*\(earliest tree with runs\)/);
  const untested = s.slice(s.indexOf("no pairwise comparison on record"));
  assert.match(untested, /Untested later edit/);
  assert.doesNotMatch(untested, /Add reader questions/, "covered by pairs T1 -> T2");
  assert.doesNotMatch(untested, /Add story skill/, "before the earliest tree with runs");
});

test("per case: newest first, segmented by model, rubric versions never mixed, verbatim remarks", () => {
  const s = section(renderReport(fixture(), ctx), "Per case");
  assert.match(s, /6 runs over 2 skill trees/);
  const opus = s.indexOf("#### Writer claude-opus-5-5");
  const sonnet = s.indexOf("#### Writer claude-sonnet-5-5");
  assert.ok(opus >= 0 && sonnet > opus);
  const opusPart = s.slice(opus, sonnet);
  assert.ok(opusPart.indexOf("r2c") < opusPart.indexOf("r2a") && opusPart.indexOf("r2a") < opusPart.indexOf("r1a"), "newest first");
  assert.doesNotMatch(opusPart, /r2d/);
  assert.match(opusPart, /\| fail S3 \(5 pass\) \|/);
  assert.match(opusPart, /Absolute scores, rubric story\/v1/);
  assert.match(opusPart, /Absolute scores, rubric story\/v2/);
  const v1 = opusPart.slice(opusPart.indexOf("rubric story/v1"), opusPart.indexOf("rubric story/v2"));
  assert.doesNotMatch(v1, /\| 0 \| 0 \|/, "v2 scores stay out of the v1 table");
  assert.match(v1, /\| r1a \| `1111111` \| codex gpt-6-astra \| 2 \| 1 \| with-edits \|/, "latest re-score shown");
  assert.match(s, /\| p1 \| story\/v1 \| .* \| r2a \| r1a \| old \| old \| loss for new \| old \|/);
  assert.match(s, /Rounds to publishable \(owner\): 3/);
  assert.match(s, /> A answers the old-age question\.\n>\n> B's colours \| confuse me\./, "remarks verbatim, not escaped or summarised");
});

test("noise: overlapping ranges are no detectable change, disjoint ranges are a change, n=1 an anecdote", () => {
  const s = section(renderReport(fixture(), ctx), "Noise");
  assert.match(s, /### story\/q01-french-debt, writer claude-opus-5-5, rubric story\/v1/);
  // argument: T2 1-2 vs T1 2-2 (r1a re-scored to 2) overlap; prose: T2 2-2 vs T1 1-1 do not.
  assert.match(s, /\| `2222222` vs `1111111` \| no detectable change \| higher \|/);
  assert.match(s, /rubric story\/v2[\s\S]*\| `2222222` \| 1 \(anecdote\) \|/);
  assert.match(s, /\| r1a \| story\/v1 \| 2 \| 1-2 \| 1 \|/, "critic-only spread from the re-score");
  assert.doesNotMatch(s, /standard deviation \|/i);
  assert.equal(compareRanges([1, 2], [2, 2]), "no detectable change");
  assert.equal(compareRanges([2, 2], [0, 1]), "higher");
  assert.equal(compareRanges([0, 0], [1, 2]), "lower");
  assert.equal(compareRanges([2], [0, 0]), "anecdote (n=1)");
});

test("noise: runs given different writer prompts are never pooled (datapressr-hcn.24)", () => {
  const P1 = "a".repeat(64);
  const P2 = "b".repeat(64);
  const withPrompt = (sha) => ({ writer: { vendor: "claude", model: "claude-opus-5-5", model_actual: "claude-opus-5-5", prompt_sha256: sha } });
  // Synthetic ledger: tree T1 has two pilot runs on prompt P1 (old notes) and two on P2; tree T2
  // has two on P2. Pooled, T1's P1 runs would widen its range and hide the T2 vs T1 change.
  const rows = [
    run("p1a", "2026-10-10T09:00:00.000Z", T1, withPrompt(P1)),
    run("p1b", "2026-10-10T09:05:00.000Z", T1, withPrompt(P1)),
    run("t1a", "2026-10-10T09:10:00.000Z", T1, withPrompt(P2)),
    run("t1b", "2026-10-10T09:15:00.000Z", T1, withPrompt(P2)),
    run("t2a", "2026-10-10T10:00:00.000Z", T2, withPrompt(P2)),
    run("t2b", "2026-10-10T10:05:00.000Z", T2, withPrompt(P2)),
    // An older row with no prompt in the ledger: its run.json hash arrives through ctx.prompts.
    run("old", "2026-10-10T10:10:00.000Z", T2),
    // No prompt anywhere: keyed by harness tree, never pooled with a known prompt.
    run("unk", "2026-10-10T10:15:00.000Z", T2, { harness_tree: T3 }),
    score("p1a", "2026-10-10T12:00:00Z", { argument: 2 }),
    score("p1b", "2026-10-10T12:00:00Z", { argument: 0 }),
    score("t1a", "2026-10-10T12:00:00Z", { argument: 0 }),
    score("t1b", "2026-10-10T12:00:00Z", { argument: 0 }),
    score("t2a", "2026-10-10T12:00:00Z", { argument: 2 }),
    score("t2b", "2026-10-10T12:00:00Z", { argument: 2 }),
    score("old", "2026-10-10T12:00:00Z", { argument: 1 }),
    score("unk", "2026-10-10T12:00:00Z", { argument: 1 }),
  ];
  for (const row of rows) assert.deepEqual(validateLedgerRow(row).errors, [], row.run_id);
  const s = section(renderReport(rows, { ...ctx, prompts: { old: P2 } }), "Noise");
  const tables = s.split("\n### ").slice(1).filter((t) => !t.startsWith("Critic-only"));
  assert.equal(tables.length, 3, "one table per prompt: P1, P2 and the unknown one");
  const p1 = tables.find((t) => t.includes("prompt `aaaaaaa`"));
  const p2 = tables.find((t) => t.includes("prompt `bbbbbbb`"));
  const unk = tables.find((t) => t.includes("harness tree `3333333` (prompt unknown)"));
  assert.ok(p1 && p2 && unk);
  assert.match(p1, /\| `1111111` \| 2 \| 0-2 \|/);
  assert.doesNotMatch(p1, /2222222/, "no P2 run in the P1 table");
  assert.match(p2, /\| `2222222` \| 3 \| 1-2 \|/, "the old row joins P2 through its run.json hash");
  assert.match(p2, /\| `1111111` \| 2 \| 0 \|/, "the P1 pilot runs are not pooled into T1");
  assert.match(p2, /\| `2222222` vs `1111111` \| higher \|/);
  assert.match(unk, /\| `2222222` \| 1 \(anecdote\) \|/);
  // Every table's runs share one prompt key.
  assert.equal(promptKey({ run_id: "x", harness_tree: T0, writer: {} }, { x: P1 }).key, `prompt:${P1}`);
  assert.equal(promptKey({ run_id: "x", harness_tree: T0, writer: {} }).key, `harness:${T0}`);
});

test("a usage-limited run is no hard regression (datapressr-9lc)", () => {
  const rows = [
    run("a1", "2026-10-10T09:00:00.000Z", T1), run("a2", "2026-10-10T09:10:00.000Z", T1),
    run("b1", "2026-10-10T10:00:00.000Z", T2, { flags: ["failed", "usage_limit"] }),
    check("a1", "2026-10-10T11:00:00Z"), check("a2", "2026-10-10T11:00:00Z"), check("b1", "2026-10-10T11:00:00Z", ["S1", "S2"]),
  ];
  for (const row of rows) assert.deepEqual(validateLedgerRow(row).errors, [], row.run_id);
  assert.doesNotMatch(section(renderReport(rows, ctx), "Flags"), /Hard regression/);
  const unlimited = rows.map((r) => (r.run_id === "b1" && r.kind === "run" ? { ...r, flags: ["failed"] } : r));
  assert.match(section(renderReport(unlimited, ctx), "Flags"), /Hard regression/);
});

test("readPrompts reads writer.prompt_sha256 from run.json for rows without it", () => {
  const dir = mkdtempSync(join(tmpdir(), "report-prompts-"));
  try {
    mkdirSync(join(dir, "runs/a"), { recursive: true });
    writeFileSync(join(dir, "runs/a/run.json"), JSON.stringify({ writer: { prompt_sha256: "c".repeat(64) } }));
    const rows = [
      { kind: "run", run_id: "a", path: "runs/a", writer: {} },
      { kind: "run", run_id: "b", path: "runs/missing", writer: {} },
      { kind: "run", run_id: "c", path: "runs/a", writer: { prompt_sha256: "d".repeat(64) } },
    ];
    assert.deepEqual(readPrompts(dir, rows), { a: "c".repeat(64) });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("harness quality: agreement per rubric, owner vs critic scores, calibration, fallback, canaries", () => {
  const s = section(renderReport(fixture(), ctx), "Harness quality");
  assert.match(s, /Rubric story\/v1: critic agrees with the owner on 1 of 1 pair/);
  assert.match(s, /\| p1 \| q01-french-debt \| old \| old \| yes \|/);
  assert.match(s, /Rubric story\/v1: 1 of 2 dimension scores equal across 2 runs/);
  assert.match(s, /\| story\/v1 \| round 2 \(held out\) \| 3 of 5 \|/);
  assert.match(s, /Critic fallback: 0 of 8 critiques/);
  assert.match(s, /Leaks caught: 1 of 6 runs/);
  assert.match(s, /Installed claude CLI: 2\.1\.300 \(fixed mode\): no canary on record/);
  assert.equal(agreement("r1", "r1"), true);
  assert.equal(agreement(null, null), true, "owner neither and critic tie agree");
  assert.equal(agreement("r1", null), false);
});

test("an owner row before its reveal stays blind in the report", () => {
  const rows = fixture().filter((r) => r.kind !== "reveal");
  const md = renderReport(rows, ctx);
  assert.match(md, /p1: owner preferred recorded; mapping not yet revealed/);
  assert.match(md, /Owner rows awaiting reveal: p1/);
  assert.match(md, /No owner-judged pairs yet/);
});

test("markdown is stable across two generations and independent of row order within a kind", () => {
  const md = renderReport(fixture(), ctx);
  assert.equal(renderReport(fixture(), ctx), md);
  assert.ok(md.endsWith("\n") && !md.endsWith("\n\n"));
});

test("rows from before skill_name existed fall back to the domain", () => {
  const { skill_name, ...old } = run("r-old", "2026-10-09T10:00:00.000Z", T1);
  const md = renderReport([old], ctx);
  assert.match(md, /### story\n/);
  assert.match(md, /A single run is an anecdote/);
});
