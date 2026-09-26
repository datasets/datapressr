# Adversarial review: reviewer brief

This is the brief for the review gate in the [`structure` skill](https://github.com/datasets/datapressr/blob/main/skills/structure/SKILL.md). Paste everything from "Brief" down into a fresh agent, or hand it to a human reviewer, together with the dataset directory path. Do not give the reviewer the author's transcript or notes: independence is the point.

Why this exists: in both source-discovery runs (Tesla deliveries and NWS hazard statistics), the most valuable finding came from a fresh reviewer, not from the agent doing the work. Rep 1's reviewer found two wrong rows in the coverage resource; rep 2's reviewer, by mutating the build, found that a whole era's columns could be swapped, or a category dropped, with every check still passing. See the [source discovery playbook](https://github.com/datasets/datapressr/blob/main/site/docs/source-discovery-playbook.md) and the [cloud queue handoff](https://github.com/datasets/datapressr/blob/main/docs/handoffs/cloud-queue.md).

## Brief

You are reviewing a dataset before it is marked `status: structured`. You had no hand in building it. Your job is to find what is wrong, and to find what could go wrong without anything noticing. You have the dataset directory: `archive/` (the raw source), `build.ts` (and any tests), `data/*.csv` and `datapackage.json`. Budget: about 30 to 60 minutes. Work in this order.

1. **Re-derive values independently.** Take at least one row per resource, one per layout era of the source, the extremes (min and max of the main numeric columns) and the newest record. Read each value from the archived source with your own scan (your own script or by eye), **not** by running `build.ts` or importing its functions. List every value with its location in the source (file, page, line or cell) next to the published value.
2. **Read the names.** Print every distinct value of every categorical column in every resource, including any coverage resource's own columns, and read the whole list. Look for stray punctuation, merged or split labels, wrong casing, page furniture, and values that describe the wrong thing. Arithmetic does not check names: `River Flood}}` was published as an event name in six years of data, with every sum correct.
3. **Break the build on purpose.** In a scratch copy of the dataset, apply at least three of these mutations to `build.ts`, the parser or the archived input, one at a time, then run the build and the tests:
   - swap two same-typed columns for one layout era;
   - drop one record whose values are zero or small (it subtracts nothing from any total);
   - truncate the last (newest) source document;
   - corrupt one category label.
   For each, report which check fired (an assertion, a test, the validator), or that none did. **A mutation that nothing catches is a finding.**
4. **Check anchoring.** Confirm that at least one value per layout era is asserted as a literal read off the source by a human (a test or an assertion with the number typed in), not derived from the same extraction it checks. If an era has none, that is a finding: a self-consistent pipeline can be uniformly wrong.
5. **Run the gates.** `node scripts/validate-datapackage.mjs <dir>` (0 errors, 0 warnings); the build twice from the archive with no network, with identical SHA-256 for every `data/*.csv`; and `npm test` (plus the dataset's own tests if it has them).
6. **Verdict.** Return `APPROVED`, or numbered findings, each with a `file:line` reference and what would fix it. Say which of your findings you are unsure of. Do not fix the dataset yourself.

Report in the record format below.

## Record format

The author (not the reviewer) records the outcome in the dataset README under a `## Review` heading, or in the Bead's close notes when there is no README change to make. One block per review round:

```md
## Review

Round 1 — <reviewer: human name, or "independent agent, no hand in the build">, <YYYY-MM-DD>
- Revision: commit <sha>; SHA-256 datapackage.json <hash>; data/<file>.csv <hash>; ...
- Re-derived: <resource, key> = <value> (source: <file, page/line/cell>) — matches / mismatch; ... (N values, N mismatches)
- Names read: <columns>; findings or "no issues"
- Mutations: <mutation> — caught by <check> / NOT CAUGHT; ... (at least three)
- Anchoring: <literals per era, where> / missing for <era>
- Gates: validator <errors/warnings>; double build <identical/different>; npm test <pass/fail counts>
- Verdict: APPROVED / findings 1..n (file:line)

Round 2 — ...
```

Findings go back to the author. Each fixed finding should come with a check that fails without the fix. The new revision is reviewed again (a new round, a new commit and new hashes), and only an `APPROVED` round clears the gate. Elapsed time is not approval, and neither is a reviewer that never returned. If a reviewer finding is itself wrong, check it against the archive and record that it was rejected and why; do not take a reviewer's figure on trust either.
