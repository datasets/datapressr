# Structure eval quality implementation plan

> **For agentic workers:** Use the subagent-driven-development or executing-plans skill to implement this plan task by task. The coordinator owns Beads, integration, paid runs and the ledger; implementation workers own the files assigned below.

**Goal:** Turn the first structure evaluation's demonstrated failures into clearer skill guidance and a checker that accepts the repository's own licence conventions, then remeasure historical outputs under the corrected checker.

**Architecture:** Keep the existing dependency-free Node harness, fixed case and thirteen checks. Change the structure skill and the two inaccurate checker rules; preserve historical run artifacts and append fresh check evidence. Skill instructions and checker correctness are separate deliverables, integrated before a new writer comparison.

**Tech stack:** Plain Node ESM, `node:test`, Markdown skills, the existing Claude/Codex adapters and append-only JSONL ledger.

## Global Constraints

- Read `AGENTS.md`, `NEXT.md` and `docs/next-session-brief.md`; Beads owns current state. Do not linewrap Markdown.
- Initial repository state was clean at `a11d067`. `bd dolt pull` succeeded on 2026-10-15 and changed `.beads/issues.jsonl`; preserve that synchronization separately from implementation ownership.
- User authorization delegates reversible choices. Apply the conservative source-preservation rule from `datapressr-n98` after independent review; record `review-after`, without another owner approval pause.
- No new dependencies, no source downloads for the fixed case, no production dataset changes, no publication, and no rewriting old run manifests or ledger rows. The historical oracle's PDDL metadata is not evidence that the source granted PDDL; leave the fixture unchanged in this bounded slice.
- Do not infer a legal licence or dedication from a publisher's federal affiliation. Record the terms actually provided. This is metadata fidelity, not a legal assessment of rights.
- A licence with no SPDX identifier uses the source's own terms title and a link to where the terms appear. Do not invent an SPDX-looking slug or substitute `PDDL-1.0`/`CC0-1.0` merely to pass a test. Preserve the current ship-and-cite policy, including `No licence stated` when applicable.
- D5 remains a lightweight metadata check, not an SPDX registry or legal validator. Retain existing identifier-shaped acceptance for compatibility, explicitly without treating this as verified SPDX membership, and add the documented nonempty name plus valid HTTP(S) terms URL form. Reject whitespace-only names, whitespace-only paths and malformed/non-HTTP(S) terms URLs. Broader identifier validation is separate work.
- D11 accepts populated `License`, `Licence`, and `Terms` declarations in the opening comment, including an explicit `No licence stated`. The licence line needs no URL of its own. Require a genuine NOAA source URL by parsed hostname and a date on a retrieval-labelled line, rather than unrelated keyword/date substrings; text after executable code does not count.
- Never attribute a higher total score after changing a checker to a better skill. Recheck old outputs with the same checker before comparing writer arms.

## Evidence and current state

`docs/benchmarks/eval-structure-co2-round-1.md` records nine complete outputs: Claude plus skill scored 11/8/7, Claude without skill 8/8/8, Codex plus skill 11/11/11, out of thirteen. Five of six Claude outputs blanked `unc = 0.00` beside the `sdev = -9.99` sentinel; all three Codex outputs kept it. This accounts for every D8/D9/D10 failure in that round. The raw snapshot at `e24166f:datasets/climate-and-environment/co2-ppm/archive/co2_mm_mlo.csv` describes missing/interpolated values as negative; its 1984-04 line has `sdev=-9.99,unc=0.00`, independently pinned in `evals/cases/structure/co2-monthly/case.json`. Preserve a real zero and describe the ambiguity; do not silently discard it because an adjacent field is missing.

The same report records provenance URL plus retrieval date in all six skilled outputs and none of the three unskilled outputs, but no recognised licence header in any of the nine. `skills/structure/SKILL.md` step 1 currently demonstrates Source/Retrieved/archive path without License, so the example is an actionable omission.

`evals/lib/checkers/structure.mjs` D5 currently requires `SPDX_SHAPED`, contradicting `AGENTS.md`'s explicit allowance for a licence's own name and link; D11 recognises `terms of use` but misses the actual `Terms: USE OF NOAA GML DATA` output. `datapressr-gap` is therefore a genuine prerequisite to an interpretable licence-rule comparison, even though it is P3 and the three skill lessons are P2.

Baseline verification on 2026-10-15: `npm test` passed 431/431, with zero skips or failures, in 81.5 seconds (log `/tmp/datapressr-assessment-tests.log`).

The ready P1 items are umbrella epics or owner reviews. Relevant ready P2 tasks are `datapressr-n98`, `datapressr-368`, and `datapressr-nda`; couple them to `datapressr-gap`. `datapressr-8no.4` is ready but its acceptance includes actual owner calibration of three outputs, so creating a structure rubric cannot complete that task autonomously. Do not make rubric work a prerequisite for this deterministic improvement.

Historical claims to avoid: monthly dates are already settled (`datapressr-2m5` closed; AGENTS specifies `YYYY-MM-01`), leak scanning and usage-limit handling already shipped (`datapressr-9lc` closed at `e0dab75`), and the exemplar stay/move decision is closed (`datapressr-6nv.2`). Old report leak flags remain historical ledger facts even where the later rescan found false positives. `docs/handoffs/cloud-queue.md` is September history, not the active task queue. The story critic's original held-out calibration was 0/5; its v2 rerun is explicitly contaminated, so do not claim a calibrated general judge.

## Task 1: Make D5 and D11 match the conventions (`datapressr-gap`)

**Files:** Modify `evals/lib/checkers/structure.mjs`, `evals/lib/checkers/structure.test.mjs`, and the D5/D11 descriptions in `evals/README.md`. Do not edit skill files in this task.

**Interfaces:** Preserve exported `checkContract(dir, sourceDomain)` and `checkProvenance(dir)`, and their result schema/IDs. The existing `oracleWorkspace()` fixture, `editJson()`, and saboteur suite provide real metadata, source data and reproducibility evidence.

- [ ] Claim the Bead with the coordinator's unique identity; append this plan path and the coupled P2 rationale.
- [ ] Import `checkContract` and `checkProvenance` into `structure.test.mjs`. Add focused tests using `oracleWorkspace()` and `try/finally` cleanup: a terms-title licence with its valid HTTP(S) source URL passes; the same spaced title without a path fails; blank name, blank path, malformed URL, or non-HTTP(S) terms path fails; existing `PDDL-1.0` still passes; missing licenses still fails. Add populated header cases for `Terms`, `Licence`, `License`, and `No licence stated`; missing/blank terms must fail, and terms after the first executable statement must not satisfy D11. Also reject `gml.noaa.gov.evil.example`, a NOAA string in an unrelated URL path, and an unrelated date separated from a blank retrieval label. The real Codex 0258 header with a populated Terms line and a separate source URL must pass.
- [ ] Run `node --test evals/lib/checkers/structure.test.mjs` before implementation. Expect new positive terms-title and `Terms:` cases to fail, while existing oracle and saboteurs pass. Save that result in the Bead.
- [ ] Implement the smallest D5 predicate change: a trimmed nonempty string name qualifies if it is identifier-shaped, or if `path` is a valid HTTP(S) URL parsed with `new URL()`. Keep the identifier-shaped compatibility branch explicitly documented as syntactic, not SPDX validation. Use an accurate error such as `no licence with an identifier-shaped name or a name and path`. For D11, extract populated licence/terms declarations from the opening comment, parse HTTP(S) source URLs and require hostname `gml.noaa.gov` (or its actual subdomain), and require the date on a retrieval/download/fetched/accessed/snapshot-labelled line. Preserve the multiline oracle header and reject keyword-only prose.
- [ ] Update the checker comments and README table to describe the accepted metadata forms. Explicitly avoid calling an identifier-shaped string a verified SPDX identifier.
- [ ] Re-run the targeted test file; verify oracle 13/13 and existing saboteur failure sets remain intact. Inspect `git diff --check` and the diff. Obtain independent review, then commit only these assigned files.

**Acceptance:** The two observed false negatives now pass with regression coverage; genuine missing metadata/provenance still fails; source URL/date checks and the thirteen-check contract remain unchanged. The later integration step rechecks historical runs as the Bead requests.

## Task 2: Apply the three observed skill lessons (`datapressr-n98`, `datapressr-368`, `datapressr-nda`)

**Files:** Modify only `skills/structure/SKILL.md`. Read `docs/benchmarks/eval-structure-co2-round-1.md`, the pinned raw file, and `AGENTS.md`. The coordinator owns later changes to `evals/LESSONS.md` and benchmark reports.

**Interfaces:** The skill remains standalone after installation. Retain the eight-skill catalog, bundled reference paths, lifecycle gates and existing source citation policy.

- [ ] Claim the three Beads. Record the source-fidelity choice for n98 and review-after reasoning; the requested review can be an independent agent review under the user's delegation.
- [ ] In step 0, explain the non-SPDX metadata form: original terms title in `name`, original terms location in `path`, and an optional plain-language summary in `title` or the README. Name the distinction between public-domain status and a specific licence/dedication. Do not ascribe an unverified licence to the Bank of England example.
- [ ] In step 1, state that the opening header records source, retrieval date and licence/terms. Add `// License: <source's licence or terms title> (<URL where stated>)` as a visibly generic template line in the existing example, or replace the entire example with an internally consistent source whose archived terms are available. Ensure the example cannot be mistaken for a verified licence claim about its source.
- [ ] In `Values that lie`, add the conservative rule: only blank numeric values established as missing for that column and applicable row/domain by the source; preserve an implausible but undocumented value verbatim and flag its ambiguity in the field description. Retain documented row/domain-aware not-applicable transformations, literal NA codes and aggregate handling. Cite the CO2 example with zero uncertainty beside negative standard deviation, and link the benchmark evidence. Distinguish this from already-established placeholders and genuine source-documented missing tokens.
- [ ] Review the surrounding negative-sentinel, placeholder, and common-mistake paragraphs for contradiction. Do not add text-matching tests for prose; the existing oracle plus zero-dropping saboteur already verifies the intended data boundary.
- [ ] Run `node --test scripts/skills-frontmatter.test.mjs scripts/skills-links.test.mjs evals/lib/checkers/structure.test.mjs`, inspect the diff, and obtain independent review specifically checking that legal claims are not invented and zeros cannot be silently discarded. Commit the skill change separately from checker corrections so its tree can be evaluated.

**Acceptance:** The skill states and illustrates all three rules, preserves standalone links and current policies, and the evidence independently supports the CO2 example. Each Bead records the same skill commit, focused verification and reviewer verdict. A passing wording check is not evidence that agent behaviour improved; that requires Task 3.

## Task 3: Recheck historical structure outputs and finish the deterministic slice

**Files:** Coordinator-owned `evals/ledger.jsonl`, `evals/REPORT.md`, regenerated `evals/runs/**/checks.json`, `evals/LESSONS.md`, and `docs/benchmarks/eval-structure-co2-round-2.md`. Do not edit `round-1.md`'s historical results in place.

- [ ] After Tasks 1 and 2 integrate, enumerate the existing `evals/runs/structure/co2-monthly/*/run.json` IDs, run `node evals/run.mjs check <run_id>` for each, then `node evals/run.mjs report`. Record this explicit structure-only equivalent of the Bead's `check --all` request to avoid unrelated story churn. Record old/new D5 and D11 results for the nine complete CO2 outputs. Appended check rows preserve the old evidence; only the generated latest checks/report change. Confirm D8/D9/D10 results do not change on unchanged outputs.
- [ ] Run `npm test` once against the integrated tree and `git diff --check`. If an existing environment-dependent test fails or hangs, identify it and record it explicitly; do not broaden this slice into unrelated repairs without coordinator triage.
- [ ] Write the dated round-2 report as a checker-correction report: enumerate historical run IDs, old/new D5/D11 outcomes, exact checker revision, and unchanged semantic-check outcomes. State that no new writers ran, so this demonstrates measurement correction and does not establish a skill behaviour gain.
- [ ] Update the structure lesson status in `evals/LESSONS.md` with evidence links; record unresolved behaviours as scoped Beads. Close completed implementation tasks with verification and commit IDs. Keep any unperformed evaluation separately open. Sync with `bd dolt push` and confirm success.

**Acceptance:** Historical structure outputs are scored consistently under the corrected checker, integrated tests have a recorded outcome, and the dated report distinguishes evaluator correction from unmeasured skill behaviour. Every result remains traceable to the original raw input, skill tree, harness and model. No paid CLI calls are part of this slice.

## Independent plan review

The workspace-assessment reviewer examined AGENTS, the four Beads, the skill, checker, tests, raw historical headers and benchmark. Its verdict is APPROVED with the following incorporated conditions: deterministic-only scope, populated D11 declarations and negative controls, explicit structure-only rechecks, source-documented row/domain-aware missing rules, and valid HTTP(S) paths for nonidentifier licences with the legacy identifier-shaped branch accurately disclosed. This satisfies n98's review requirement under the owner's autonomous delegation; implementation still receives its own independent review.

## Follow-on priorities

File a separate eligible evaluation Bead for fresh old-skill/new-skill/no-skill comparison on the fixed CO2 case: three sequential runs per arm, identical harness/case/model, predeclared per-check and zero/licence/header measures, current isolation canary, proposed USD 2 per-run limit (USD 18 writer ceiling plus USD 0.10 canaries), and explicit treatment of failed/usage-limited outputs. Use the immediate pre-edit skill commit as baseline so intervening monthly-date changes do not confound it. This budget is a proposal for that task, not spending in this implementation.

After this slice, add a second fixed structure case from a source not named as the skill's worked example, with independently read anchors and deliberate saboteurs; this tests transfer rather than further tuning CO2. The structure rubric and owner calibration remain `datapressr-8no.4`. Neither is a completion dependency for correcting the demonstrated guidance/checker defects above.
