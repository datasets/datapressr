import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendRow, readLedger } from "./ledger.mjs";
import { ownerCommand, parseScores, readMappingFile, recordPair, recordRounds, recordRun, revealPair } from "./owner.mjs";
import { renderReport } from "./report.mjs";

const SHA = "d".repeat(64);
const CASE = "q01-french-debt";
const critic = { vendor: "codex", model: "gpt-6-astra", model_actual: "gpt-6-astra", fallback: false };
const clock = () => {
  let t = Date.parse("2026-10-10T14:00:00Z");
  return () => new Date((t += 1000));
};

// A temp evals dir with two runs on different trees, a pair the critic gave to r-new in both
// orders, and a mapping showing r-old as A.
function setup({ mapping = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "owner-test-"));
  const ledger = join(dir, "ledger.jsonl");
  const run = (run_id, tree, at) => ({ kind: "run", at, run_id, case_id: CASE, domain: "story", path: `runs/story/${CASE}/${run_id}`, case_hash: SHA, skill_name: "story", skill_tree: tree, harness_tree: "0".repeat(40), writer: { vendor: "claude", model: "m", model_actual: "m" }, turns: 1, cost_usd: 1, flags: [] });
  appendRow(ledger, run("r-old", "1".repeat(40), "2026-10-10T09:00:00Z"));
  appendRow(ledger, run("r-new", "2".repeat(40), "2026-10-10T10:00:00Z"));
  appendRow(ledger, { kind: "pair", at: "2026-10-10T12:00:00Z", pair_id: "p1", case_id: CASE, run_ids: ["r-old", "r-new"], rubric: "story/v1", critic, judgements: [{ order: "AB", preferred_run_id: "r-new" }, { order: "BA", preferred_run_id: "r-new" }], winner_run_id: "r-new" });
  if (mapping) {
    mkdirSync(join(dir, "pairs", "p1"), { recursive: true });
    writeFileSync(join(dir, "pairs", "p1", "mapping.json"), JSON.stringify({ pair_id: "p1", A: "r-old", B: "r-new" }));
  }
  return { dir, ledger };
}

const REMARKS = "  B is better: it answers \"what is old age\".\n\nBut the blue/green — colours clash.\n\n";

test("the owner row is on disk before the mapping is read, with remarks verbatim", () => {
  const { dir, ledger } = setup();
  try {
    let readAt = null;
    const spy = (evalsDir, pairId) => {
      const rows = readLedger(ledger);
      readAt = rows.map((r) => r.kind);
      assert.ok(rows.some((r) => r.kind === "owner" && r.pair_id === pairId), "owner row written before the mapping is read");
      assert.ok(!rows.some((r) => r.kind === "reveal"), "nothing revealed yet");
      return readMappingFile(evalsDir, pairId);
    };
    const res = recordPair({ evalsDir: dir, pairId: "p1", preferred: "B", remarks: REMARKS, now: clock(), readMapping: spy });
    assert.deepEqual(readAt, ["run", "run", "pair", "owner"]);
    const rows = readLedger(ledger);
    const owner = rows.find((r) => r.kind === "owner");
    assert.equal(owner.remarks, REMARKS, "byte-for-byte");
    assert.equal(owner.preferred, "B");
    assert.equal(owner.case_id, CASE);
    assert.equal(owner.run_id, undefined, "the owner row carries labels only, never run ids");
    const reveal = rows.find((r) => r.kind === "reveal");
    assert.deepEqual(reveal.mapping, { A: "r-old", B: "r-new" });
    assert.equal(reveal.preferred_run_id, "r-new");
    assert.equal(reveal.owner_at, owner.at);
    assert.ok(reveal.at > owner.at);
    assert.deepEqual(res.agreements, [{ rubric: "story/v1", critic_winner_run_id: "r-new", agrees: true }]);

    const md = renderReport(rows);
    assert.match(md, /critic agrees with the owner on 1 of 1 pair/);
    assert.match(md, /p1: owner preferred new/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a second judgement of the same pair is refused (it would not be blind)", () => {
  const { dir } = setup();
  try {
    recordPair({ evalsDir: dir, pairId: "p1", preferred: "A", remarks: "A.", now: clock() });
    assert.throws(() => recordPair({ evalsDir: dir, pairId: "p1", preferred: "B", remarks: "B.", now: clock() }), /would not be blind/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("neither vs a critic win disagrees; a missing mapping keeps the owner row and --reveal finishes later", () => {
  const { dir, ledger } = setup({ mapping: false });
  try {
    assert.throws(() => recordPair({ evalsDir: dir, pairId: "p1", preferred: "neither", remarks: "Both are dull.", now: clock() }), /no mapping/);
    let rows = readLedger(ledger);
    assert.equal(rows.filter((r) => r.kind === "owner").length, 1, "the owner's words are kept");
    assert.equal(rows.filter((r) => r.kind === "reveal").length, 0);
    assert.match(renderReport(rows), /Owner rows awaiting reveal: p1/);

    mkdirSync(join(dir, "pairs", "p1"), { recursive: true });
    writeFileSync(join(dir, "pairs", "p1", "mapping.json"), JSON.stringify({ pair_id: "p1", A: "r-new", B: "r-old" }));
    const res = revealPair({ evalsDir: dir, pairId: "p1", now: clock() });
    assert.equal(res.reveal.preferred_run_id, null);
    assert.deepEqual(res.agreements.map((a) => a.agrees), [false]);
    assert.throws(() => revealPair({ evalsDir: dir, pairId: "p1", now: clock() }), /already revealed/);
    rows = readLedger(ledger);
    assert.match(renderReport(rows), /critic agrees with the owner on 0 of 1 pair/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a mapping that does not name the pair's runs is rejected", () => {
  const { dir } = setup();
  try {
    assert.throws(() => recordPair({ evalsDir: dir, pairId: "p1", preferred: "A", remarks: "x", now: clock(), readMapping: () => ({ A: "r-old", B: "r-other" }) }), /does not name the pair's two runs/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("single-run remarks, rounds to publishable and scores", () => {
  const { dir, ledger } = setup();
  try {
    const remarksFile = join(dir, "remarks.md");
    writeFileSync(remarksFile, REMARKS);
    ownerCommand({ evalsDir: dir, target: "r-new", values: { "remarks-file": remarksFile, scores: "argument=2,prose=1" }, now: clock() });
    ownerCommand({ evalsDir: dir, values: { rounds: CASE }, positionals: ["3"], now: clock() });
    const rows = readLedger(ledger).filter((r) => r.kind === "owner");
    assert.equal(rows[0].run_id, "r-new");
    assert.equal(rows[0].remarks, REMARKS);
    assert.deepEqual(rows[0].scores, { argument: 2, prose: 1 });
    assert.equal(rows[1].rounds_to_publishable, 3);
    assert.equal(rows[1].remarks, undefined);
    assert.throws(() => ownerCommand({ evalsDir: dir, target: "r-new", values: { "remarks-file": remarksFile, preferred: "A" }, now: clock() }), /applies to a pair/);
    assert.throws(() => ownerCommand({ evalsDir: dir, target: "nope", values: { "remarks-file": remarksFile } }), /neither a pair nor a run/);
    assert.throws(() => recordRun({ evalsDir: dir, runId: "nope", remarks: "x" }), /no run nope/);
    assert.throws(() => recordRounds({ evalsDir: dir, caseId: CASE, rounds: -1 }), /whole number/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("pair judgements through the CLI dispatcher need --preferred and remarks", () => {
  const { dir, ledger } = setup();
  try {
    const remarksFile = join(dir, "r.md");
    writeFileSync(remarksFile, "A, clearly.\n");
    assert.throws(() => ownerCommand({ evalsDir: dir, target: "p1", values: { "remarks-file": remarksFile } }), /--preferred/);
    assert.throws(() => ownerCommand({ evalsDir: dir, target: "p1", values: { preferred: "A" } }), /--remarks-file/);
    const lines = [];
    ownerCommand({ evalsDir: dir, target: "p1", values: { preferred: "A", "remarks-file": remarksFile, scores: "A.prose=2,B.prose=1" }, now: clock(), log: (m) => lines.push(m) });
    assert.match(lines[0], /recorded .* then read the mapping/);
    assert.match(lines.join("\n"), /agreement: no/);
    const owner = readLedger(ledger).find((r) => r.kind === "owner");
    assert.deepEqual(owner.scores, { "A.prose": 2, "B.prose": 1 });
    assert.equal(readFileSync(remarksFile, "utf8"), owner.remarks);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("parseScores validates dimensions, values and labels", () => {
  assert.equal(parseScores(undefined), undefined);
  assert.deepEqual(parseScores("argument=0, prose=2"), { argument: 0, prose: 2 });
  assert.deepEqual(parseScores("A.charts=1,B.charts=2", { pair: true }), { "A.charts": 1, "B.charts": 2 });
  assert.throws(() => parseScores("prose=3"), /cannot read/);
  assert.throws(() => parseScores("vibes=1"), /unknown dimension/);
  assert.throws(() => parseScores("prose=1", { pair: true }), /prefix/);
  assert.throws(() => parseScores("A.prose=1"), /plain dimensions/);
});
