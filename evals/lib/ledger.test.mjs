import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendRow, readLedger } from "./ledger.mjs";

const owner = (remarks) => ({ kind: "owner", at: "2026-10-10T12:00:00Z", case_id: "q01-french-debt", run_id: "r1", remarks });

test("appendRow adds schema: 1, appends without rewriting, and readLedger returns rows in order", () => {
  const dir = mkdtempSync(join(tmpdir(), "evals-ledger-"));
  try {
    const file = join(dir, "ledger.jsonl");
    assert.deepEqual(readLedger(file), []);
    appendRow(file, owner("first"));
    const before = readFileSync(file, "utf8");
    appendRow(file, owner("second"));
    const after = readFileSync(file, "utf8");
    assert.ok(after.startsWith(before), "earlier bytes untouched");
    const rows = readLedger(file);
    assert.deepEqual(rows.map((r) => r.remarks), ["first", "second"]);
    assert.ok(rows.every((r) => r.schema === 1));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("appendRow refuses an invalid row and leaves the file unchanged", () => {
  const dir = mkdtempSync(join(tmpdir(), "evals-ledger-"));
  try {
    const file = join(dir, "ledger.jsonl");
    appendRow(file, owner("ok"));
    const before = readFileSync(file, "utf8");
    assert.throws(() => appendRow(file, owner("")), /invalid ledger row/);
    assert.throws(() => appendRow(file, { ...owner("x"), schema: 2 }), /schema/);
    assert.equal(readFileSync(file, "utf8"), before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("readLedger fails loudly on a malformed line, naming the line", () => {
  const dir = mkdtempSync(join(tmpdir(), "evals-ledger-"));
  try {
    const file = join(dir, "ledger.jsonl");
    appendRow(file, owner("ok"));
    appendFileSync(file, "{not json\n");
    assert.throws(() => readLedger(file), /ledger\.jsonl:2/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
