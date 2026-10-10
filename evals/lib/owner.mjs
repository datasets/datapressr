// The `owner` subcommand (design section 5.4, datapressr-hcn.9): record the owner's judgement
// verbatim, blind.
//
//   owner <pair_id> --preferred A|B|neither --remarks-file f.md [--scores A.prose=1,B.prose=2]
//   owner <pair_id> --reveal                      (only if a previous reveal was interrupted)
//   owner <run_id> --remarks-file f.md [--scores argument=1,prose=2]
//   owner --rounds <case_id> <n> [--remarks-file f.md]
//
// Blindness: for a pair the owner row (labels A/B as the owner saw them, remarks exactly as written)
// is appended to the ledger first; only then is evals/pairs/<pair_id>/mapping.json read, a
// `reveal` row appended with which run was A and B, and agreement with the critic's pair result
// computed. Nothing before the owner row is written reads or prints the mapping.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { appendRow, readLedger } from "./ledger.mjs";
import { agreement } from "./report.mjs";
import { OPEN_MODE_DIMENSIONS, SCORE_DIMENSIONS } from "./schema.mjs";

const DIMS = [...SCORE_DIMENSIONS, ...OPEN_MODE_DIMENSIONS];

// "argument=1,prose=2" (a run) or "A.argument=1,B.argument=2" (a pair) -> { key: n }.
export function parseScores(spec, { pair = false } = {}) {
  if (spec === undefined || spec === null || spec === "") return undefined;
  const out = {};
  for (const part of spec.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(?:(A|B)\.)?([a-z_]+)=([0-2])$/);
    if (!m) throw new Error(`--scores: cannot read "${part}" (want ${pair ? "A.<dimension>=0|1|2" : "<dimension>=0|1|2"})`);
    const [, label, dim, v] = m;
    if (!DIMS.includes(dim)) throw new Error(`--scores: unknown dimension "${dim}" (one of ${DIMS.join(", ")})`);
    if (pair && !label) throw new Error(`--scores: for a pair, prefix each dimension with A. or B. (got "${part}")`);
    if (!pair && label) throw new Error(`--scores: a single run takes plain dimensions (got "${part}")`);
    out[label ? `${label}.${dim}` : dim] = Number(v);
  }
  return out;
}

export function mappingPath(evalsDir, pairId) {
  return join(evalsDir, "pairs", pairId, "mapping.json");
}

// mapping.json, written by `pair` (datapressr-hcn.5): { "pair_id": "...", "A": "<run_id>", "B": "<run_id>" }.
export function readMappingFile(evalsDir, pairId) {
  const file = mappingPath(evalsDir, pairId);
  if (!existsSync(file)) throw new Error(`no mapping at evals/pairs/${pairId}/mapping.json (it is gitignored: it exists only on the machine that ran \`pair\`)`);
  return JSON.parse(readFileSync(file, "utf8"));
}

const ledgerPath = (evalsDir) => join(evalsDir, "ledger.jsonl");

function reveal({ evalsDir, ownerRow, pairRows, readMapping, now }) {
  const pairId = ownerRow.pair_id;
  const mapping = readMapping(evalsDir, pairId);
  const runIds = new Set(pairRows[0].run_ids);
  if (!mapping || typeof mapping.A !== "string" || typeof mapping.B !== "string" || mapping.A === mapping.B || !runIds.has(mapping.A) || !runIds.has(mapping.B)) {
    throw new Error(`mapping for ${pairId} does not name the pair's two runs (${[...runIds].join(", ")})`);
  }
  const preferredRunId = ownerRow.preferred === "neither" ? null : mapping[ownerRow.preferred];
  const row = appendRow(ledgerPath(evalsDir), {
    kind: "reveal",
    at: now().toISOString(),
    pair_id: pairId,
    case_id: ownerRow.case_id,
    owner_at: ownerRow.at,
    mapping: { A: mapping.A, B: mapping.B },
    preferred_run_id: preferredRunId,
  });
  // Agreement with the critic, per rubric (the latest pair row for each).
  const byRubric = new Map();
  for (const p of pairRows) byRubric.set(p.rubric, p);
  const agreements = [...byRubric.values()].map((p) => {
    const [a, b] = p.judgements.map((j) => j.preferred_run_id ?? null);
    const winner = a !== null && a === b ? a : null;
    return { rubric: p.rubric, critic_winner_run_id: winner, agrees: agreement(preferredRunId, winner) };
  });
  return { reveal: row, agreements };
}

// Record a blind pair judgement, then reveal. readMapping is injectable so a test can prove the
// owner row is on disk before the mapping is touched.
export function recordPair({ evalsDir, pairId, preferred, remarks, scores, now = () => new Date(), readMapping = readMappingFile }) {
  const rows = readLedger(ledgerPath(evalsDir));
  const pairRows = rows.filter((r) => r.kind === "pair" && r.pair_id === pairId);
  if (pairRows.length === 0) throw new Error(`no pair ${pairId} in the ledger`);
  if (rows.some((r) => r.kind === "owner" && r.pair_id === pairId)) {
    throw new Error(`the owner already judged ${pairId}; a second judgement would not be blind. Use --reveal if the reveal was interrupted.`);
  }
  if (!["A", "B", "neither"].includes(preferred)) throw new Error("--preferred must be A, B or neither");
  const ownerRow = appendRow(ledgerPath(evalsDir), {
    kind: "owner",
    at: now().toISOString(),
    case_id: pairRows[0].case_id,
    pair_id: pairId,
    preferred,
    remarks,
    ...(scores ? { scores } : {}),
  });
  return { owner: ownerRow, ...reveal({ evalsDir, ownerRow, pairRows, readMapping, now }) };
}

// Finish a reveal for an owner row already on record (e.g. mapping.json was missing at the time).
export function revealPair({ evalsDir, pairId, now = () => new Date(), readMapping = readMappingFile }) {
  const rows = readLedger(ledgerPath(evalsDir));
  const ownerRow = rows.filter((r) => r.kind === "owner" && r.pair_id === pairId).pop();
  if (!ownerRow) throw new Error(`no owner row for ${pairId}; record the owner's judgement first (the mapping is only read after it)`);
  if (rows.some((r) => r.kind === "reveal" && r.pair_id === pairId)) throw new Error(`${pairId} is already revealed`);
  const pairRows = rows.filter((r) => r.kind === "pair" && r.pair_id === pairId);
  return { owner: ownerRow, ...reveal({ evalsDir, ownerRow, pairRows, readMapping, now }) };
}

export function recordRun({ evalsDir, runId, remarks, scores, now = () => new Date() }) {
  const rows = readLedger(ledgerPath(evalsDir));
  const run = rows.find((r) => r.kind === "run" && r.run_id === runId);
  if (!run) throw new Error(`no run ${runId} in the ledger`);
  return {
    owner: appendRow(ledgerPath(evalsDir), { kind: "owner", at: now().toISOString(), case_id: run.case_id, run_id: runId, remarks, ...(scores ? { scores } : {}) }),
  };
}

export function recordRounds({ evalsDir, caseId, rounds, remarks, now = () => new Date() }) {
  if (!Number.isInteger(rounds) || rounds < 0) throw new Error("--rounds needs a whole number of rounds");
  return {
    owner: appendRow(ledgerPath(evalsDir), { kind: "owner", at: now().toISOString(), case_id: caseId, rounds_to_publishable: rounds, ...(remarks !== undefined ? { remarks } : {}) }),
  };
}

// Remarks are stored exactly as written: no trimming, no summarising.
export function readRemarks(file) {
  if (!file) return undefined;
  const text = readFileSync(file, "utf8");
  if (text.trim() === "") throw new Error(`${file} is empty`);
  return text;
}

// Dispatch from the CLI. target is a pair id or a run id (looked up in the ledger).
export function ownerCommand({ evalsDir, target, values, positionals = [], log = () => {}, now, readMapping }) {
  if (values.rounds !== undefined) {
    const [caseId, n] = [values.rounds, positionals[0]];
    if (!caseId || n === undefined || !/^\d+$/.test(n)) throw new Error("usage: owner --rounds <case_id> <n> [--remarks-file f.md]");
    const { owner } = recordRounds({ evalsDir, caseId, rounds: Number(n), remarks: readRemarks(values["remarks-file"]), now });
    log(`recorded: ${caseId} took ${owner.rounds_to_publishable} round(s) to publishable`);
    return { owner };
  }
  if (!target) throw new Error("usage: owner <pair_id|run_id> ...");
  const rows = readLedger(ledgerPath(evalsDir));
  const isPair = rows.some((r) => r.kind === "pair" && r.pair_id === target);
  if (isPair && values.reveal) {
    const res = revealPair({ evalsDir, pairId: target, now, readMapping });
    logReveal(res, log);
    return res;
  }
  if (isPair) {
    if (!values.preferred) throw new Error("a pair needs --preferred A|B|neither");
    const remarks = readRemarks(values["remarks-file"]);
    if (!remarks) throw new Error("a pair needs --remarks-file with the owner's remarks, verbatim");
    const res = recordPair({ evalsDir, pairId: target, preferred: values.preferred, remarks, scores: parseScores(values.scores, { pair: true }), now, readMapping });
    log(`recorded the owner's judgement of ${target} (preferred ${res.owner.preferred}), then read the mapping`);
    logReveal(res, log);
    return res;
  }
  if (rows.some((r) => r.kind === "run" && r.run_id === target)) {
    if (values.preferred) throw new Error("--preferred applies to a pair, not a single run");
    const remarks = readRemarks(values["remarks-file"]);
    if (!remarks) throw new Error("a run needs --remarks-file with the owner's remarks, verbatim");
    const res = recordRun({ evalsDir, runId: target, remarks, scores: parseScores(values.scores), now });
    log(`recorded the owner's remarks on ${target}`);
    return res;
  }
  throw new Error(`${target} is neither a pair nor a run in the ledger`);
}

function logReveal({ reveal: rv, agreements }, log) {
  log(`mapping: A = ${rv.mapping.A}, B = ${rv.mapping.B}; owner preferred ${rv.preferred_run_id ?? "neither"}`);
  for (const ag of agreements) log(`critic (${ag.rubric}): ${ag.critic_winner_run_id ?? "tie"}; agreement: ${ag.agrees ? "yes" : "no"}`);
}
