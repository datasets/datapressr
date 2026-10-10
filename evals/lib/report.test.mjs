import { test } from "node:test";
import assert from "node:assert/strict";
import { renderReport } from "./report.mjs";

const OID = "c".repeat(40);
const SHA = "d".repeat(64);
const run = (run_id, at, case_id = "q01-french-debt", extra = {}) => ({
  schema: 1, kind: "run", at, run_id, case_id, domain: "story", path: `runs/story/${case_id}/${run_id}`, case_hash: SHA,
  skill_tree: OID, harness_tree: OID, writer: { vendor: "fake", model: "fake", model_actual: "fake" }, turns: 0, cost_usd: 0, flags: [], ...extra,
});

test("empty ledger says so", () => {
  assert.match(renderReport([]), /No runs recorded yet/);
});

test("report has one table per case with runs newest first, and is stable", () => {
  const rows = [
    run("r-old", "2026-10-09T10:00:00.000Z"),
    run("r-new", "2026-10-10T10:00:00.000Z", "q01-french-debt", { flags: ["dirty_skill"], cost_usd: 1.234 }),
    run("r-other", "2026-10-10T11:00:00.000Z", "q02-allies-wwii"),
    { schema: 1, kind: "owner", at: "2026-10-10T12:00:00Z", case_id: "q01-french-debt", run_id: "r-new", remarks: "ok" },
  ];
  const md = renderReport(rows);
  assert.equal(renderReport(rows), md);
  assert.ok(md.indexOf("## story/q01-french-debt") < md.indexOf("## story/q02-allies-wwii"));
  assert.ok(md.indexOf("r-new") < md.indexOf("r-old"), "newest first");
  assert.match(md, /2 runs\./);
  assert.match(md, /\| dirty_skill \|/);
  assert.match(md, /\| 1\.23 \|/);
  assert.match(md, /\(runs\/story\/q01-french-debt\/r-new\/run\.json\)/);
  assert.match(md, /`ccccccc`/);
});
