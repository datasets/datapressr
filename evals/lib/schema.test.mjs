import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateCase,
  validateChecks,
  validateCritiqueAbsolute,
  validateCritiquePairwise,
  validateLedgerRow,
  validateOwner,
  validateRun,
} from "./schema.mjs";
import { demoCase } from "./fixture-repo.mjs";

const SHA = "a".repeat(64);
const OID = "b".repeat(40);
const has = (res, fragment) => res.errors.some((e) => e.includes(fragment));

// --- case ---

test("a well-formed case validates", () => {
  const res = validateCase(demoCase("abc1234"));
  assert.deepEqual(res.errors, []);
  assert.equal(res.ok, true);
});

test("a case without data_mode is rejected", () => {
  const c = demoCase("abc1234");
  delete c.data_mode;
  const res = validateCase(c);
  assert.equal(res.ok, false);
  assert.ok(has(res, "data_mode"), res.errors.join("\n"));
});

test("an input commit that is not an ancestor of main is rejected", () => {
  const res = validateCase(demoCase("abc1234"), { isAncestor: () => false });
  assert.equal(res.ok, false);
  assert.ok(has(res, "not an ancestor of main"), res.errors.join("\n"));
  assert.equal(validateCase(demoCase("abc1234"), { isAncestor: () => true }).ok, true);
});

test("case rejects a bad type, inverted word budget, feedback outside docs/reviews and escaping paths", () => {
  const c = demoCase("abc1234");
  c.type = "opinion";
  c.budget.words = [700, 300];
  c.owner_feedback = ["notes/feedback.md"];
  c.inputs[0].path = "../outside";
  const res = validateCase(c);
  for (const frag of ["type", "budget.words", "docs/reviews", "inputs[0].path"]) assert.ok(has(res, frag), `${frag}: ${res.errors.join("\n")}`);
});

// --- run ---

function goodRun() {
  return {
    run_id: "20261010-1200-q01-french-debt-fake-fake-abcdef0-1",
    case_id: "q01-french-debt",
    domain: "story",
    case_hash: SHA,
    skill: { name: "story", ref: OID, tree: OID, dirty: false },
    harness: { tree: OID, dirty: false, recipe_sha256: null },
    writer: { vendor: "fake", model: "fake", model_actual: "fake", cli_version: "fake", prompt_sha256: SHA },
    isolation: { canary_run_id: null, network: false, leaks: [] },
    started_at: "2026-10-10T12:00:00.000Z",
    duration_ms: 3,
    turns: 0,
    cost_usd: 0,
    cost_basis: null,
    usage: null,
    artefacts: [{ path: "site/stories/x.md", sha256: SHA, bytes: 10 }],
    transcript_sha256: null,
    workspace_sha256: null,
    flags: [],
  };
}

test("a well-formed run validates", () => {
  assert.deepEqual(validateRun(goodRun()).errors, []);
});

test("a run without skill.tree is rejected", () => {
  const r = goodRun();
  delete r.skill.tree;
  const res = validateRun(r);
  assert.equal(res.ok, false);
  assert.ok(has(res, "skill.tree"), res.errors.join("\n"));
});

test("a run with an unknown flag or an absolute artefact path is rejected", () => {
  const r = goodRun();
  r.flags = ["shiny"];
  r.artefacts[0].path = "/etc/passwd";
  const res = validateRun(r);
  assert.ok(has(res, "flags[0]") && has(res, "artefacts[0].path"), res.errors.join("\n"));
});

// --- checks ---

test("checks validate and reject a bad severity", () => {
  const ok = { checker: "story", results: [{ id: "S1", pass: true, severity: "fail", message: "", evidence: null }] };
  assert.deepEqual(validateChecks(ok).errors, []);
  ok.results[0].severity = "error";
  assert.ok(has(validateChecks(ok), "severity"));
});

// --- critique ---

function goodCritique() {
  const s = (score) => ({ score, why: "because" });
  return {
    rubric: "story/v1",
    critic: { vendor: "codex", model: "gpt-6-astra", model_actual: "gpt-6-astra", fallback: false, fallback_reason: null },
    reader_questions: [{ q: "How big is the debt?", answered: "yes", where: "para 1" }],
    missed_findings: [],
    charts: [{ file: "a.svg", shows: "debt", form_fits: true, fix: "" }],
    top_change: "Explain social protection.",
    publishable: "with-edits",
    lessons: [{ rule: "Unpack the biggest category.", evidence: "para 3" }],
    scores: { argument: s(2), depth: s(1), charts: s(1), honesty: s(2), reader_questions: s(1), prose: s(1) },
  };
}

test("an absolute critique validates; scores outside 0-2 are rejected", () => {
  assert.deepEqual(validateCritiqueAbsolute(goodCritique()).errors, []);
  for (const bad of [3, -1, 1.5]) {
    const c = goodCritique();
    c.scores.depth.score = bad;
    const res = validateCritiqueAbsolute(c);
    assert.equal(res.ok, false, `score ${bad} accepted`);
    assert.ok(has(res, "scores.depth.score"), res.errors.join("\n"));
  }
});

test("open-mode critiques need data_choice; more than five lessons are rejected", () => {
  assert.ok(has(validateCritiqueAbsolute(goodCritique(), { data_mode: "open" }), "scores.data_choice"));
  const c = goodCritique();
  c.lessons = Array.from({ length: 6 }, () => ({ rule: "r", evidence: "e" }));
  assert.ok(has(validateCritiqueAbsolute(c), "lessons"));
});

test("pairwise critique validates; a tie may omit the margin", () => {
  const p = { rubric: "story/v1", critic: goodCritique().critic, order: "AB", preferred: "A", margin: "clear", why: "deeper", reader_questions: [{ q: "q", A: "yes", B: "no" }] };
  assert.deepEqual(validateCritiquePairwise(p).errors, []);
  assert.ok(has(validateCritiquePairwise({ ...p, margin: null }), "margin"));
  assert.deepEqual(validateCritiquePairwise({ ...p, preferred: "tie", margin: null }).errors, []);
  assert.ok(has(validateCritiquePairwise({ ...p, preferred: "C" }), "preferred"));
});

// --- ledger rows ---

test("every ledger row needs schema: 1", () => {
  const row = { schema: 1, kind: "owner", at: "2026-10-10T12:00:00Z", case_id: "q01-french-debt", run_id: "r1", remarks: "Too wordy." };
  assert.deepEqual(validateLedgerRow(row).errors, []);
  assert.ok(has(validateLedgerRow({ ...row, schema: 2 }), "schema"));
  const { schema, ...noSchema } = row;
  assert.ok(has(validateLedgerRow(noSchema), "schema"));
});

test("owner rows need verbatim remarks and exactly one of pair_id or run_id", () => {
  const base = { schema: 1, kind: "owner", at: "2026-10-10T12:00:00Z", case_id: "q01-french-debt" };
  assert.deepEqual(validateOwner({ ...base, pair_id: "p1", preferred: "B", remarks: "B reads better." }).errors, []);
  assert.ok(has(validateOwner({ ...base, pair_id: "p1", preferred: "B" }), "remarks"));
  assert.ok(has(validateOwner({ ...base, pair_id: "p1", run_id: "r1", preferred: "A", remarks: "x" }), "exactly one"));
  assert.ok(has(validateOwner({ ...base, pair_id: "p1", remarks: "x" }), "preferred"));
  assert.ok(has(validateOwner({ ...base, run_id: "r1", remarks: "x", scores: { prose: 4 } }), "scores.prose"));
});

test("run, score, pair, check and canary rows validate", () => {
  const at = "2026-10-10T12:00:00Z";
  const critic = goodCritique().critic;
  const rows = [
    { schema: 1, kind: "run", at, run_id: "r1", case_id: "q01-french-debt", domain: "story", path: "runs/story/q01-french-debt/r1", case_hash: SHA, skill_tree: OID, harness_tree: OID, writer: { vendor: "fake", model: "fake", model_actual: "fake" }, turns: 0, cost_usd: 0, flags: [] },
    { schema: 1, kind: "score", at, run_id: "r1", rubric: "story/v1", critic, status: "ok", publishable: "no", scores: { argument: 1 } },
    { schema: 1, kind: "pair", at, pair_id: "p1", case_id: "q01-french-debt", run_ids: ["r1", "r2"], rubric: "story/v1", critic, judgements: [{ order: "AB", preferred_run_id: "r1" }, { order: "BA", preferred_run_id: "r2" }], winner_run_id: null },
    { schema: 1, kind: "check", at, run_id: "r1", checker: "story", harness_tree: OID, passed: 5, failed: ["S3"], warned: [] },
    { schema: 1, kind: "canary", at, run_id: "c1", vendor: "claude", cli_version: "2.1.296", recipe_sha256: SHA, mode: "fixed", pass: true },
  ];
  for (const row of rows) assert.deepEqual(validateLedgerRow(row).errors, [], row.kind);
  assert.ok(has(validateLedgerRow({ ...rows[1], scores: { argument: 5 } }), "scores.argument"));
  assert.ok(has(validateLedgerRow({ ...rows[0], kind: "nonsense" }), "kind"));
});
