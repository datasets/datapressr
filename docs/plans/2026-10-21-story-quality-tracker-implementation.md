# Story Quality Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The driver owns Beads and integration; this plan does not execute evaluations.

**Goal:** Freeze a small versioned instrument, provide local append-only recording/reporting, and prepare four existing stories for independent AI and owner ratings without inventing observations.

**Architecture:** Keep an immutable JSON instrument and artifact manifest beside a JSONL journal; use a dependency-free Node module and CLI to validate, append, and report. Editorial judgments and scoped evidence checks are separate record types. A deterministic preparation script creates clean reading copies linking existing committed PNGs, with a separate administrative manifest and an owner form containing no AI scores.

**Tech Stack:** Existing Node ESM, `node:test`, `node:assert/strict`, `node:fs`, `node:crypto`; no packages, web UI, platform or new evaluation runner.

## Global constraints

- Implements the approved [design](2026-10-18-story-quality-tracking.md), task `datapressr-8no.9.12`; Beads is the only actionable queue.
- Freeze namespace `story-quality-tracking-v0.1`, schema `1`, human anchor `story-quality-human-v0.1`, procedure `story-quality-procedure-v0.1`, checks `story-quality-checks-v0.1`. Retain diagnostic identity `reference-led-manual-v1` and its exact seven 0–2 anchors.
- Three human summary dimensions, whole-number 1–10 or null: `human.reader_value`, `human.explanation_argument`, `human.presentation`. Optional independent `human.overall`; never compute it from the other scores.
- Preserve the seven diagnostic IDs: `interest`, `findings_depth`, `argument_counterevidence`, `explanation`, `chart_design`, `writing`, `reader_coverage`. No sums, composite scores, historical score conversions or invented owner labels.
- Gates G1–G4 and scoped atomic checks remain separate from taste. Missing evidence is unresolved/unassessed; an editorial score cannot clear a failure or authorize publication.
- Exact source and viewed story/render hashes, separate judge identities, versions, missing reasons, prior exposure and append-only corrections are required. Do not pool raters, models or instrument versions silently.
- No runtime rubric, harness schema, runner, defaults, `evals/ledger.jsonl`, story skill or production story changes. In particular, do not create `evals/rubrics/story/v3.md`.
- No Claude calls, model CLI calls, new writers or network evaluation in these implementation tasks. After the instrument and packet freeze the driver may separately obtain four bounded fresh built-in OpenAI reviewer assessments, as authorized by the owner; owner ratings remain human work.
- Existing eight outputs are known-development. Select first replicate of both topics and arms deterministically, with no winner selection or holdout claim. Historical ratings are provenance, not new tracker observations.
- Read committed `review-materials` first. Ignored raw archives exist only in `/Users/rgrp/src/datasets/datapressr` and need not be copied into the worktree. Do not rewrite historical artifacts.
- Markdown paragraphs are not manually linewrapped. All new material stays under internal `evals/` or `docs/`, not `site/`.

## File map and shared contract

Task 1 creates `evals/calibration/story/tracking-v0.1/instrument.json` (frozen anchor/check definitions), `README.md` (field contract and procedure), `evals/lib/story-quality-tracker.mjs` (validation/storage/report), `evals/lib/story-quality-tracker.test.mjs` (temporary-directory tests), and `evals/story-quality.mjs` (thin CLI). Task 2 creates `evals/calibration/story/tracking-v0.1/prepare-pilot.mjs`, `prepare-pilot.test.mjs`, `pilot/manifest.json`, `pilot/judgments.jsonl`, `pilot/report.md`, and `pilot/owner/README.md`, `form.md`, and `A.md` through `D.md`. The empty journal is a real zero-byte file. No `package.json` change is needed.

The shared interfaces are:

```js
// All filesystem calls synchronous; root is the repository root.
export function validateManifest(manifest, { root, instrument }) {} // returns manifest or throws
export function validateRecords(records, { manifest, instrument, root }) {} // returns records or throws
export function readJournal(file) {} // returns parsed array; missing file means []
export function appendRecord(file, record, { root, manifest, instrument }) {} // validates and appends one JSON line
export function renderReport(records, { manifest, instrument, linkBase }) {} // deterministic Markdown string
// root and linkBase are optional backward-compatible integration parameters.
// Task 2 preparation module; import must not perform I/O.
export function preparePilot({ root, out }) {} // writes deterministic pilot files, returns manifest
```

Manifest shape is `{schema:1, instrument_id, instrument_sha256, study_id, population:'known-development', selection_rule, procedure_version, artifacts:[...]}`. Each artifact contains `artifact_id`, `source_code`, `story_id`, `case_id`, `pair_id`, `topic`, `arm`, `replicate`, `commission:{path,sha256,audience}`, `source_story:{path,sha256}`, `viewed_story:{path,sha256}`, `transformation`, and `renders:[{render_id,path,sha256,width_px,height_px,intended_display_width_px}]`. SHA-256 always hashes exact file bytes; the hash distinguishes this reading copy from its source. All paths are repository-relative, existing regular files within the root; reject path traversal and symlink escapes. `audience` may be null with `audience_unknown_reason`; never infer a factual audience attribution. `transformation` records precisely which duplicate heading and link rewrites were applied. Each artifact also carries `process:{writer_rounds,review_rounds,resources,unknown_reason}`; resources are recorded only when their `value`, `unit`, `boundary` and source evidence are known, and are not totalled across overlapping counters.

Each journal record has `schema:1`, unique `id`, ISO UTC `at`, `kind:'judgment'|'check'`, `artifact_id`, `artifact_sha256` (the viewed story), `render_sha256` (map of render ID to exact hash), `instrument_id`, `instrument_sha256`, `human_anchor_version`, `diagnostic_version`, `procedure_version`, `check_version`, `judge:{role:'human'|'ai',id,requested_model,requested_effort,served_model,unknown_reason}`, `exposure:{materials,stage,order,prior_exposure,treatment_visible,model_visible,prior_ratings_visible,retrospective,viewed_sizes,unknown_reasons}`, `supersedes:null|string` and `correction_reason:null|string`. Nullable identity values and unknown exposure fields require reasons; human model fields are explicitly not applicable. `materials` are path/hash pairs; `viewed_sizes` preserves actual reported viewport/image sizes or null plus a reason, separately from intended/intrinsic size. Do not equate availability with having seen the render.

Judgment records additionally contain `scores` with all four human dimension keys, `diagnostics` (all seven keys for AI; null for humans), `verbatim_comment` (string or null) and `most_useful_improvement` (string or null). Every score has `{value,reason,evidence,uncertainty,missing_reason}`; evidence is a list of `{path,sha256,locator}`. Value is integer 1–10 for human summary keys or integer 0–2 for diagnostics. A non-null value requires a nonempty reason and evidence; a null value requires `missing_reason` such as `not-requested`, `no-response`, `insufficient-evidence`. `uncertainty` is a string or null, never silently converted to numeric confidence. Empty forms are not judgments: do not append a row until an actual response/assessment exists. A real overall-only response uses null summary dimensions with reasons. Preserve owner wording exactly; later interpretation is a separate superseding observation with its provenance, not an overwrite.

Check records additionally contain `check_id`, `gate`, `target`, `scope`, `method`, `evidence`, `outcome:'pass'|'fail'|'unresolved'|'not-applicable'`, `reason`, `follow_up`, `material` (boolean), `central` (boolean). Judge identity is the checker identity, and `check_version` identifies its definitions. `not-applicable` requires a reason; pass/fail require concrete checked scope, method and evidence. Not running a check is represented by absence/coverage gap or an explicit unresolved record, never a pass. The initial instrument contains the six checks named in the design: `source.central_claim_scope`/G1, `analysis.central_arithmetic`/G2, `analysis.inference_scope`/G2, `reproduction.pipeline`/G3, `visual.label_collision`/G4 and `visual.encoding_integrity`/G4.

Corrections must target an earlier active record of the same kind, artifact hashes, judge role/ID and complete version/model/effort partition; checks must also match check ID, target and scope. Require a nonempty correction reason, and reject nonexistent targets, cycles, branches, duplicates or cross-identity/version supersession. Changed instruments, raters or artifacts require independent records, not corrections. Journal history remains visible; reports label superseded rows and use only active rows for current views. Multiple active independent judgments remain individual rows; never take the latest silently.

### Task 1: Freeze the instrument and implement the local tracker

**Files:** The five Task 1 files listed above. Read existing `evals/lib/ledger.test.mjs` for append-only testing conventions and `evals/calibration/story/reference-led-candidate.md` plus `reference-led-protocol.md` for inherited anchors and evidence boundaries. Do not reuse or extend the runtime ledger's schema.

**Consumes:** Approved design and existing manual v1 definitions.

**Produces:** Frozen instrument/README, the five exported functions above, and `node evals/story-quality.mjs validate|append|report` with the exact interface below.

- [ ] **1. Freeze complete anchors and the record contract before scoring.** Write JSON definitions and README using the contract above. Use these exact human anchors; intermediate integers remain editorial judgments, and 10 is a demanding reference point rather than a claim of perfection:

| Dimension | 2 | 4 | 6 | 8 | 10 |
| --- | --- | --- | --- | --- | --- |
| `human.reader_value` | Dataset tour or familiar facts with little payoff. | A relevant question, but the finding or why it matters remains weak. | A useful finding, but its significance or freshness needs work. | A revealing, consequential comparison or answer worth sharing. | An exceptional, memorable answer that substantially improves the intended reader's understanding. |
| `human.explanation_argument` | The conclusion or relationship between findings is unclear. | An answer is visible, but major reasoning steps or meanings are missing. | Main answer is understandable, but an important explanation, boundary or alternative needs work. | Clear reasoning and explanations; important limits and alternatives sit where they affect interpretation. | Exceptionally clear and convincing reasoning; the relevant mechanisms, alternatives and limits are explained with precision and economy. |
| `human.presentation` | Hard to follow or decode. | Readable in parts, but recurring prose or chart problems obstruct the story. | Understandable, with substantial editing or chart clarification needed. | Fluent prose and charts that make the intended comparison easy to grasp, with only minor edits. | Exceptionally effortless, economical prose and charts that make the story's comparisons immediately clear. |
| `human.overall` | Confusing or largely a dataset dump. | Understandable, but shallow or weakly explained. | Useful story with substantial editing needed. | Strong, compelling and clear; minor editorial work. | Exceptional reference-quality work. |

Copy the complete seven diagnostic 0/1/2 anchor cells verbatim from manual v1 into the instrument, with source path/hash. Freeze six atomic check definitions with outcome rules. README repeats that these anchors are a starting instrument, not owner-calibrated; 8 is not publication approval. Include a future procedure: new AI scores frozen before owner response/reveal; same exact story/PNGs/brief for both; record exposure honestly; use independent new versions and overlap studies for later instrument changes.

- [ ] **2. Write meaningful failing tests with generated temporary assets.** Use the following scaffold, then expand the factory to the exact required fields above. Keep fixtures local to the test file and label judge IDs `synthetic-test-*`; never put fixture scores into the real journal.

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { appendRecord, readJournal, validateRecords, validateManifest, renderReport } from './story-quality-tracker.mjs';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const score = value => ({ value, reason: value === null ? '' : 'Synthetic fixture only', evidence: value === null ? [] : [{path:'story.md',sha256:digest('# Test\n'),locator:'L1'}], uncertainty:null, missing_reason:value === null ? 'not-requested' : null });
test('append preserves prior bytes and rejects a duplicate without changing the file', () => {
  const root = mkdtempSync(join(tmpdir(), 'story-quality-'));
  try {
    writeFileSync(join(root, 'story.md'), '# Test\n');
    // makeFixture(root, score) builds the complete contract above using this asset.
    const { manifest, instrument, judgment } = makeFixture(root, score);
    const file = join(root, 'journal.jsonl');
    appendRecord(file, judgment, { root, manifest, instrument });
    const before = readFileSync(file, 'utf8');
    assert.throws(() => appendRecord(file, judgment, { root, manifest, instrument }), /duplicate/);
    assert.equal(readFileSync(file, 'utf8'), before);
    appendRecord(file, { ...judgment, id:'second', supersedes:judgment.id, correction_reason:'Transcription correction' }, { root, manifest, instrument });
    assert.ok(readFileSync(file, 'utf8').startsWith(before));
    assert.equal(readJournal(file).length, 2);
  } finally { rmSync(root, {recursive:true,force:true}); }
});
```

`makeFixture(root, score)` is a test-only factory to implement in this step: read the frozen instrument, construct a one-artifact manifest hashing `story.md` as both commission and source/viewed story, use no renders, mark audience unknown, process unknown, and construct a human record `id:'first'`, `judge.id:'synthetic-test-owner'`, all required versions, explicit unknown prior exposure, no model applicability, and the four `score(null)` values. Set a verbatim response `'Please retain this comment exactly.'`; this tests overall-only/missing fields without inventing an actual response. A second factory variant uses `role:'ai'`, a distinct synthetic judge and model identity, three `score(6)` values, `score(null)` overall and seven diagnostic values at 1.

Add test cases with named assertions for: score bounds and noninteger rejection; absent/null reason rejection; all seven diagnostic keys and 0–2 bounds; empty evidence for real scores; distinct overall 3 alongside dimensions 8 accepted unchanged; human/AI records retained separately; unknown identity/exposure reasons retained; tampered story and render hashes rejected; traversal rejected; malformed/truncated journal line named with line number and append leaves bytes unchanged; unsupported versions rejected rather than silently coerced; compatible correction retained and invalid cross-judge/model/version/artifact/check corrections rejected; missing owner ratings never appear as agreement; failed/unresolved checks shown beside high scores without becoming passes; mixed raters/procedures/models partitioned; zero-record report shows 0 owner and 0 AI observations with missing coverage. For version partitions supported by the instrument, vary requested/served model and effort and procedure context without changing anchor semantics. A new unsupported instrument must fail with an explicit error until its registry is supplied.

Run `node --test evals/lib/story-quality-tracker.test.mjs`; expect initial failure because the tracker module does not exist.

- [ ] **3. Implement minimal validation, append and reporting.** Use built-in SHA-256 and explicit field validators; errors name record/field or file/line. Read/validate the entire existing journal before append, reject a nonempty journal lacking a final newline, serialize the new record once and append without rewriting old bytes. Document single-writer local use; no concurrency service is required. The CLI loads the one frozen instrument, validates its manifest hash and every artifact, then performs the requested operation. CLI unknown commands/arguments and validation failures return nonzero.

```js
// Thin CLI dispatch contract; resolve ROOT relative to import.meta.url.
// validate <manifest.json> <journal.jsonl>
// append   <manifest.json> <journal.jsonl> <record.json>
// report   <manifest.json> <journal.jsonl> [--relative-to <report-directory>]
// report writes Markdown to stdout; it never mutates either input.
const records = readJournal(journalPath);
validateManifest(manifest, {root: ROOT, instrument});
validateRecords(records, {manifest, instrument});
if (command === 'append') appendRecord(journalPath, JSON.parse(readFileSync(recordPath, 'utf8')), {root: ROOT, manifest, instrument});
if (command === 'report') process.stdout.write(renderReport(records, {manifest, instrument}));
```

Report individual active judgments with exact artifact, rater, model/effort, all versions, missing reasons and evidence links; list superseded history separately. Partition by every version plus role, judge ID and requested/served model/effort. Report observed unique stories, topics and owner/AI coverage separately from row/chart/dimension counts. Include checks and their exact scopes; derive only `repair-required` for material fails and `verification-required` for unresolved central checks, otherwise show checked scope and unassessed regions, never a whole-story certification. Emit no composites, averages, automated pair preference or automatic matching across multiple raters. This first report needs no aggregate calibration statistics; later explicit owner/AI pairing can be added when actual matched observations exist.

- [ ] **4. Verify and commit the independent tracker deliverable.** Run the focused tests, then `node --test evals/lib/ledger.test.mjs evals/lib/schema.test.mjs evals/lib/report.test.mjs evals/lib/versions.test.mjs` to guard runtime boundaries. Inspect `git diff --check` and `git diff --stat`. Commit only the five Task 1 paths with `git commit -m "feat: add versioned manual story quality tracker"`.

**Acceptance:** A reviewer can create a synthetic valid row, reject malformed or misattributed evidence, append a compatible correction without altering prior bytes, and see separate score/check/history rows. All complete anchors and missing/exposure/version rules are frozen. Runtime remains unchanged and no real ratings have been created.

### Task 2: Prepare a four-artifact retrospective pilot and owner form

**Files:** The Task 2 files listed above; no historical review-material edits.

**Consumes:** Task 1 instrument, manifest contract, CLI and exports. Committed inputs under `evals/experiments/story-quality/reference-led-v1/review-materials/<code>/stage2/`, plus selection provenance in that experiment's `results.md` and `review-materials-index.json`.

**Produces:** A deterministic four-artifact manifest, four normalized reading copies, a three-question owner form, and an empty journal/report ready for subsequent independent assessments.

- [ ] **1. Freeze deterministic selection and preparation tests.** First replicate in both arms and both topics means exactly these four outputs, independent of historical ratings:

| Packet ID | Source code | Topic/case | Arm | Pair |
| --- | --- | --- | --- | --- |
| A | M30755c | France / q01-french-debt | baseline | q01-french-debt-r1 |
| B | Mb8941a | France / q01-french-debt | candidate | q01-french-debt-r1 |
| C | Mbe53b2 | Oil / q03-wti-negative | baseline | q03-wti-negative-r1 |
| D | M9b1fee | Oil / q03-wti-negative | candidate | q03-wti-negative-r1 |

The mapping lives in the administrative manifest, not the owner form. Existing public mappings and prior exposure mean this is identity-minimized, not proven blind. `artifact_id` is `tracking-pilot-20261021-A` through `-D`; `story_id` retains the source code. Record the chosen slot, all eight eligible codes, rule, known-development status, and exclusion reason `second replicate outside four-artifact pilot` for the remaining four. Manifest metadata may explain known defect coverage (France inference/overlap; oil delivered-title clipping) as prior diagnostic observations, explicitly not owner labels or new verification. Keep that metadata outside the reading packet.

Write `prepare-pilot.test.mjs` using the real committed source fixtures and temporary output directories. Assert exactly four selected slots and two topics/two arms; all source hashes match indexed evidence; every PNG reference resolves; a preparation run twice is byte-identical; each reading copy starts with exactly one original H1; the only prose change is removing the redundant duplicate leading title; image paths resolve to unchanged source PNG hashes; PNG intrinsic dimensions are positive; the manifest verifies; no rating exists; the form contains the three dimensions and explicitly optional overall, no historical or AI scores, treatment/model labels, expected findings or inferred owner responses. Assert preparation refuses to overwrite a nonempty journal or differing frozen packet/instrument (new revision needs a new output directory).

```js
// Import-safe preparation module test, using the contract established above.
const first = preparePilot({root: ROOT, out});
assert.deepEqual(first.artifacts.map(a => a.source_code), ['M30755c','Mb8941a','Mbe53b2','M9b1fee']);
assert.equal(new Set(first.artifacts.map(a => a.topic)).size, 2);
assert.equal(new Set(first.artifacts.map(a => a.arm)).size, 2);
validateManifest(first, {root: ROOT, instrument});
assert.equal(readJournal(join(out, 'judgments.jsonl')).length, 0);
```

For temporary output manifest verification, create the temporary directory beneath the repository and remove it in `finally`, so the root containment rule is exercised faithfully. Run `node --test evals/calibration/story/tracking-v0.1/prepare-pilot.test.mjs`; expect failure because preparation does not yet exist.

- [ ] **2. Implement deterministic preparation and write the packet.** The generator reads only the four stage2 stories, commissions and referenced PNGs; verifies hashes against `review-materials-index.json`; strips the second identical initial H1 plus its following blank line; and rewrites local PNG links relative to the new reading-copy directory. Retain every other prose byte, chart byte and historical defect. Hash source and transformed stories separately. Read PNG IHDR width/height with Node Buffer, record intended display width 720px, and explain that actual viewed dimensions must be recorded later; do not claim intended size was observed. Do not render new charts or copy the PNG archive. Link the same commission and final reading copy in both AI instructions and the owner packet. The reading copy itself contains only the original article content; preparation notes live in README.

```js
const removeDuplicateTitle = text => text.replace(/^(# [^\n]+\n)\n\1\n/, '$1\n');
const pngWidth = bytes => bytes.readUInt32BE(16);
const pngHeight = bytes => bytes.readUInt32BE(20);
// Verify PNG signature/IHDR before these reads. For each local image destination,
// resolve the original, verify its indexed hash, and replace only that destination
// with a portable path relative to the new owner reading-copy directory.
```

Preparation does not overwrite frozen/nonempty files; identical regeneration succeeds. The manifest pins instrument hash, source index hash, commission/source/viewed story hashes, every referenced PNG hash and dimensions, transformation description and process unknowns. Use no timestamp that changes on rerun. Record source writer/resource metadata only with surviving evidence and accounting boundaries; null with a reason is the default when the preparation inputs do not establish it.

- [ ] **3. Write the owner form and procedure, without scores.** The form presents A–D links with identical brief and story/render view, each with these prompts and blank answers:

```markdown
Was this worth reading? Did I learn something that matters? __ /10 or not rated
Did I understand the answer and why the evidence supports it? __ /10 or not rated
How easy and enjoyable was it to read the prose and charts? __ /10 or not rated
Optional independent overall: How good is this story for its intended audience and commission? __ /10 or not rated
Your comments, in your own words:
Single most useful improvement:
Optional presentation tag: prose / chart
Have you seen this story, its treatment/model identity, or previous ratings before? If unsure, say unknown.
Reading device/viewport or displayed chart size, if known:
```

Provide the complete human anchor table within the owner packet, stating that 1 and odd numbers are allowed and overall is independent. Allow fewer artifacts or overall-only responses; preserve a smaller denominator and null reasons. Ask the owner whether the proposed 8/minor-edits anchor fits, without implying approval to publish. Do not require them to recompute data or complete seven diagnostics/evidence checks. README says future AI reviewers independently score the same three dimensions plus optional overall and seven diagnostics before owner reveal; checks remain unresolved unless the reviewer actually performs them. Freeze AI records separately before supplying the score-free owner packet. Record any previous exposure; a fresh reviewer does not make old stories holdout material. Coordinate later real owner capture/reconciliation with `hcn.13`/`hcn.14`; this packet does not replace their required artifacts or close owner work.

- [ ] **4. Generate, verify and commit the pilot deliverable.** Run these commands from the repository root:

```sh
node evals/calibration/story/tracking-v0.1/prepare-pilot.mjs
node --test evals/lib/story-quality-tracker.test.mjs evals/calibration/story/tracking-v0.1/prepare-pilot.test.mjs
node evals/story-quality.mjs validate evals/calibration/story/tracking-v0.1/pilot/manifest.json evals/calibration/story/tracking-v0.1/pilot/judgments.jsonl
node evals/story-quality.mjs report evals/calibration/story/tracking-v0.1/pilot/manifest.json evals/calibration/story/tracking-v0.1/pilot/judgments.jsonl --relative-to evals/calibration/story/tracking-v0.1/pilot > evals/calibration/story/tracking-v0.1/pilot/report.md
node scripts/check-invisible-characters.mjs evals/calibration/story/tracking-v0.1
python3 /tmp/datapressr-tracker-tests.py /tmp/datapressr-tracker-final-tests.log
git diff --check
```

Environment baseline: Node 26.4.0; the worktree uses existing ignored `node_modules` links in `site/stories`, `datasets/france-public-finances`, and the desktop preview plugin. The driver's guarded baseline passed all 486 tests (`/tmp/datapressr-tracker-baseline-ready-tests.log`); the guard blocks model CLIs and its 26 intercepted Claude commands were only `claude --version`. Preserve the guard for full-suite testing; if implementing in another session, recreate an equivalent guard before running `npm test`, and do not install dependencies or invoke models merely to satisfy availability tests. If a pre-existing full-suite failure appears, compare with the driver's recorded baseline and report it precisely; do not repair unrelated code. Inspect the four reading copies and linked PNGs locally, confirm single visible title and unchanged chart content, and record this as packet integrity inspection rather than story quality or factual verification. Re-run generation and verify no diff. Commit only Task 2 paths with `git commit -m "feat: prepare retrospective story quality pilot packet"`.

**Acceptance:** Four deterministic artifacts, two topics, both arms, exact source/viewed hashes, immutable shared images, one visible title, complete anchors and a usable score-free owner form. Report shows four eligible stories, zero owner observations, zero AI observations, checks unassessed. No model calls or ratings are required to accept this preparation task. Driver may then collect the separately authorized four independent AI assessments after the freeze; each must name actual identity/exposure/materials and leave unperformed factual checks unresolved. Owner agreement and calibration stay unmeasured until actual owner responses arrive.
