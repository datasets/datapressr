// evals/ledger.jsonl: one JSON row per event, append-only. Rows are validated on write and on
// read; nothing here rewrites or deletes a row (re-scoring appends a new one).

import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { LEDGER_SCHEMA, assertValid, validateLedgerRow } from "./schema.mjs";

export function appendRow(file, row) {
  const full = { schema: LEDGER_SCHEMA, ...row };
  assertValid(validateLedgerRow(full), `ledger row (${full.kind})`);
  appendFileSync(file, `${JSON.stringify(full)}\n`);
  return full;
}

export function readLedger(file) {
  if (!existsSync(file)) return [];
  const rows = [];
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (line.trim() === "") return;
      let row;
      try {
        row = JSON.parse(line);
      } catch (e) {
        throw new Error(`${file}:${i + 1}: not JSON (${e.message})`);
      }
      assertValid(validateLedgerRow(row), `ledger row at ${file}:${i + 1}`);
      rows.push(row);
    });
  return rows;
}
