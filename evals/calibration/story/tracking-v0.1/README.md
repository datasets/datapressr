# Manual story quality tracker v0.1

This is a starting instrument, not an owner-calibrated standard. An editorial 8 is not publication approval. Ratings, scoped evidence checks and process observations remain separate. No scores are summed, averaged, converted from historical ratings or used to infer pair preference. No actual ratings are included in this deliverable.

`instrument.json` freezes schema `1`, namespace `story-quality-tracking-v0.1`, human anchors `story-quality-human-v0.1`, diagnostics `reference-led-manual-v1`, procedure `story-quality-procedure-v0.1` and checks `story-quality-checks-v0.1`. It contains complete human 2/4/6/8/10 anchors and the seven inherited diagnostic 0/1/2 anchors verbatim, with their source path and exact SHA-256. Intermediate integers are editorial judgments; 10 is a demanding reference point, not perfection. The optional overall is an independent judgment, never an average. This instrument has one registered procedure/version partition; unsupported instruments or versions fail explicitly until a reviewed registry is supplied.

## Local commands

Run these from any working directory, with paths to the JSON inputs:

```sh
node /path/to/datapressr/evals/story-quality.mjs validate manifest.json judgments.jsonl
node /path/to/datapressr/evals/story-quality.mjs append manifest.json judgments.jsonl record.json
node /path/to/datapressr/evals/story-quality.mjs report manifest.json judgments.jsonl --relative-to . > report.md
```

The repository root is resolved relative to the CLI, not the working directory. Report writes deterministic Markdown to stdout and does not modify its inputs. To write a report inside the pilot directory, use `report manifest.json judgments.jsonl --relative-to evals/calibration/story/tracking-v0.1/pilot > evals/calibration/story/tracking-v0.1/pilot/report.md` from the repository root. `--relative-to` is accepted only for `report`, takes an existing directory inside this repository, and makes every evidence link resolve from that directory; the default is repository-root links. Unknown commands/arguments and invalid data exit nonzero. `append` validates the entire old journal plus the proposed record and all declared file bytes before adding one serialized JSON line. Duplicate IDs, corrupt lines and missing final newlines prevent append without changing old bytes. A missing journal reads as an empty array; an empty journal is a real zero-byte file. Malformed lines name their file and line number. This is synchronous, single-writer local storage; coordinating concurrent writers is outside its scope.

The module exports `validateManifest(manifest, {root,instrument})`, `validateRecords(records, {manifest,instrument,root?})`, `readJournal(file)`, `appendRecord(file, record, {root,manifest,instrument})` and `renderReport(records, {manifest,instrument,linkBase?})`. `linkBase` is the repository-relative directory containing the report (for example `evals/calibration/story/tracking-v0.1/pilot`), defaulting to the empty string for repository root; paths outside the repository are rejected. Validation returns its original input or throws. `validateRecords` checks the record contract and evidence identities; optional `root` additionally verifies every declared material's exact bytes and confinement. CLI validation/report and append always supply `root`. Rendering validates record structure; callers reading untrusted files must first validate the manifest and records with `root`, as the CLI does.

## Manifest

The JSON manifest has `schema:1`, `instrument_id`, `instrument_sha256` (hash of exact `instrument.json` bytes), `study_id`, `population:'known-development'`, a nonempty `selection_rule`, the registered `procedure_version`, and `artifacts`.

Each artifact has unique `artifact_id`, `source_code`, `story_id`, `case_id`, `pair_id`, `topic`, `arm`, positive integer `replicate`, `commission`, `source_story`, `viewed_story`, `transformation`, `renders` and `process`. Story identities distinguish observations from rows, charts and repeated ratings; pair membership never supplies a preference.

`commission` has `{path,sha256,audience}`. Audience is a recorded string or null plus `audience_unknown_reason`; do not infer an audience attribution. `source_story` and `viewed_story` each have `{path,sha256}`. Hash exact bytes, including whitespace and line endings. The source and reading copy can differ: `transformation` is an object recording exactly the duplicate heading removal and link rewrites applied (for example `{duplicate_heading_removed:false,link_rewrites:[]}` when none). Every asset path is repository-relative and must identify an existing regular file inside the root; absolute paths, traversal and symlink escapes fail.

`renders` is an array of `{render_id,path,sha256,width_px,height_px,intended_display_width_px}` with unique render IDs and positive integer dimensions. These are intrinsic and intended sizes, not evidence that anyone viewed a render.

`process` contains `writer_rounds`, `review_rounds`, `resources` and `unknown_reason`. Rounds are nonnegative integers or null with a reason. Resources are optional observations in an array, each `{value,unit,boundary,evidence}`; values are finite nonnegative numbers, units and boundaries are explicit strings, and evidence is a nonempty list of `{path,sha256,locator}`. Record only counters with known evidence and boundary; never total overlapping counters. An empty resource array asserts no measured resource use.

## Common journal fields

Each JSONL record contains `schema:1`, unique nonempty `id`, valid ISO UTC `at` (`YYYY-MM-DDTHH:mm:ssZ`, optionally milliseconds), `kind:'judgment'|'check'`, `artifact_id`, `artifact_sha256` for the exact viewed story, `render_sha256` mapping every declared render ID to its exact hash, and all six identity/version fields: `instrument_id`, `instrument_sha256`, `human_anchor_version`, `diagnostic_version`, `procedure_version`, `check_version`.

`judge` is `{role:'human'|'ai',id,requested_model,requested_effort,served_model,unknown_reason}`. Human model fields are explicitly null and `unknown_reason` states `not-applicable: human judge`. AI identity values are nonempty strings or null with a nonempty reason; do not guess a served model from the requested model. Optional `served_effort` follows the same null/reason convention and participates in correction/report partitions when supplied. Different judges, requested/served models and effort settings retain separate observations.

`exposure` is `{materials,stage,order,prior_exposure,treatment_visible,model_visible,prior_ratings_visible,retrospective,viewed_sizes,unknown_reasons}`. `materials` lists actual viewed `{path,sha256}` pairs and must include the exact viewed story. Additional pinned source evidence can be declared here; the CLI checks its file bytes too. A declared artifact path cannot be relabeled with a different hash. Score/check evidence must cite one of these materials with its exact hash. Having files available does not establish that a judge saw them; never list unseen PNGs as viewed materials.

`stage` is a nonempty procedure-context string or null. `order` is a positive integer or null. `prior_exposure` is a nonempty description, boolean or null. Visibility and retrospective fields are booleans or null. Each null requires a nonempty explanation at `unknown_reasons.<field>`. `viewed_sizes` is null with a reason, or an array of actual reported `{target,width_px,height_px}` entries, where `target` identifies a render ID or viewport and dimensions are positive integers. This is separate from intended or intrinsic sizes. A visual pass/fail requires evidence from a declared render, actually included in materials, with its render ID present in reported sizes.

Every independent record has `supersedes:null` and `correction_reason:null`. A correction names an earlier active record in `supersedes` and gives a nonempty `correction_reason`. It must retain kind, artifact and render hashes, judge role/ID, every version and requested/served model/effort. Check corrections also retain `check_id`, `target` and `scope`. Missing targets, cycles, branches and cross-identity corrections fail. Changed artifacts, instruments or raters require independent records. The earlier record remains unchanged and visible in report history. Multiple active independent judgments remain separate; the tracker never silently picks the latest.

## Judgment fields

A judgment adds `scores`, `diagnostics`, `verbatim_comment` and `most_useful_improvement`. `scores` always contains exactly `human.reader_value`, `human.explanation_argument`, `human.presentation` and `human.overall`. Each score is `{value,reason,evidence,uncertainty,missing_reason}`. Human summary values are whole numbers 1–10 or null. Non-null scores require a nonempty reason, nonempty evidence and `missing_reason:null`; null scores require an explicit missing reason such as `not-requested`, `no-response` or `insufficient-evidence`. A null score's `reason` remains a string, possibly empty, and its evidence remains an array. Evidence entries are `{path,sha256,locator}` with a nonempty passage/chart/state locator. `uncertainty` is a string or null, never numeric confidence.

For AI judgments, `diagnostics` contains exactly `interest`, `findings_depth`, `argument_counterevidence`, `explanation`, `chart_design`, `writing`, `reader_coverage`, each with the same score shape and integer 0–2 or null. Human diagnostics are null. A plausible adjacent diagnostic anchor can be recorded in uncertainty; diagnosis is never summed or converted to /10. Unseen/inaccessible material stays unassessed.

Both comments are strings or null. Preserve owner wording exactly in `verbatim_comment`; later interpretation is a separate superseding observation with provenance. An overall-only response has the other dimensions null with missing reasons. A genuine comment-only response can also be recorded, with missing scores. An empty form containing only null scores and no response is rejected; do not create placeholder observations for an absent owner response.

## Check fields and reporting

A check adds `check_id`, `gate`, `target`, `scope`, `method`, `evidence`, `outcome`, `reason`, `follow_up`, `material` and `central`. The six instrument checks map source scope to G1, arithmetic and inference scope to G2, pipeline reproduction to G3, and label collision/encoding integrity to G4. Target, concrete scope, method and reason are nonempty strings; follow-up is a string or null; material/central are booleans. Outcomes are `pass`, `fail`, `unresolved`, `not-applicable`. Pass/fail require concrete evidence; not-applicable requires a reason. Absence or an explicit unresolved record represents a check that did not run; never substitute pass.

The report preserves individual scores, missing reasons, verbatim responses, exact source/viewed/render hashes, evidence links, exposure, all versions and judge/model/effort partitions. Superseded observations have a separate history. It counts unique observed stories/topics and owner/AI observations separately from rows/charts/dimensions, and identifies missing coverage. `Owner` in these first reports denotes human-role observations; individual human identities remain explicit and are never pooled into a single rating.

Scoped material failures derive `repair-required`; unresolved central checks derive `verification-required`. Otherwise the report lists checked scopes and unassessed regions. A pass concerns only its recorded scope. There is no whole-story certification, automatic owner/AI matching, agreement statistic or inferred pair winner. Editorial scores cannot clear defects or authorize publication.

## Future collection procedure

Freeze the instrument and packet hashes before scoring. Supply AI and owner with the same exact story, PNGs and brief. Obtain independent new AI judgments and freeze them before receiving/revealing the owner response; keep AI scores and treatment/model identities out of the owner packet. Record actual exposure, prior familiarity, ordering and viewed sizes honestly rather than claiming blinding from masked filenames. Known-development material remains known-development; historical ratings are provenance and never new observations.

Collect the owner's actual response with missing dimensions intact. Do not infer disagreement or agreement from silence. Later explicit pairing requires actual matched observations and an explicit analysis protocol. Any changed instrument or anchor/procedure/check semantics receives an independent new version and overlap study; preserve old records and study boundaries. Nothing here changes runtime rubrics, runner defaults, the runtime ledger, production stories or publication approval.
