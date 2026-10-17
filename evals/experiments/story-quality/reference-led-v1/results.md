# Reference-led story comparison results

The candidate showed **no advantage on the frozen primary hypothesis codes**: all four predetermined pairs tied on H1 reader payoff, H2 primary-chart interpretation and H3 primary-relationship understanding. The runtime critic preferred baseline twice and candidate twice, with the same underlying output preferred in both orders every time. This is a mixed exploratory result on two reused topics, not demonstrated general improvement or a calibrated judge.

All eight writer slots completed; their deterministic checks passed 7/7 and recorded flags/leaks were empty. Eight independent staged reader sessions produced 24 frozen records. Those checks did not establish publishability: **none of the eight outputs cleared every scoped manual gate**. Actual owner responses are **missing for all four pairs**. No owner agreement, concern-hit rate or false-positive rate is computed.

The [machine-readable results](results.json) retain per-output gates, seven dimensions, codes, evidence locators, raw pair reasons and source hashes. Primary selections and coding were frozen at `137192c4f2fc76cc0951811fe3848601f7d9dcc6` before mapping/outcomes were released to synthesis. The source coding document’s earlier “awaiting driver freeze” text remains unchanged; the recorded commit/hash establishes the later freeze.

## Predetermined pair outcomes

| Pair | Baseline / candidate opaque codes | Runtime winner, AB / BA margin | H1 / H2 / H3 primary direction |
| --- | --- | --- | --- |
| q01-french-debt-r1 | M30755c / Mb8941a | baseline-win; clear / clear | tie / tie / tie |
| q01-french-debt-r2 | Mf4bb1f / M1d3194 | candidate-win; clear / clear | tie / tie / tie |
| q03-wti-negative-r1 | Mbe53b2 / M9b1fee | baseline-win; slight / slight | tie / tie / tie |
| q03-wti-negative-r2 | Mee832a / M948761 | candidate-win; slight / clear | tie / tie / tie |

There are four pairs, not eight independent comparisons. Both orders use the stored A/B mapping to recover the preferred underlying run; `preferred` in the saved judgment already refers to canonical A/B, so BA must not be reversed a second time. Strict counts are 2 baseline wins,2 candidate wins,0 both-tie,0 order-disagreement and 0 incomplete. Each topic splits 1–1. Margins differ in the last oil pair but the preferred output is unchanged.

All eight outputs have `supported-payoff`, `comparison-recoverable` on their frozen primary chart, and `supported-link-understood` on their frozen primary relationship. This ceiling does not mean every passage/chart was successful. Primary H3 selection precedes the known nominal/share passage in several France stories. The debt-selection boundary is itself ambiguous where trajectory levels, stepwise increases and nonreversal might count as separate findings rather than one debt trajectory; M30755c explicitly preserves this alternative. Oil’s earliest same-day benchmark contrast likewise has a recorded eligibility ambiguity. These selections/codes are preserved, not replaced after unblinding. H1 credits a bounded evidence-supported payoff, not a complete answer to the causal commission. H3 credits the narrower understood descriptive/accounting relationship; in M1d3194 and Mb8941a it does not validate the lede’s stronger claim that persistent deficits fully explain the rising debt ratio. Those causal claims still require scope qualification, including the denominator and stock-flow adjustments. Equal primary codes must not be read as endorsement of the complete causal ledes or full commission answers.

## What the readers understood, and what still failed

The debt readers could recover the useful tension between persistent fiscal shortfalls, high revenue alongside still-higher spending, and debt growth despite historically low interest shares. All four received interest 2, with explicit limits about the missing acute market/political crisis explanation. For example, [M1d3194’s frozen spontaneous understanding](readings/M1d3194-stage2.json) locates the argument in persistent deficits and offsets between spending categories; its exact JSON pointer is `#/spontaneous_story_understanding`. [M30755c’s assessment](readings/M30755c-stage3.json) at `#/manual_dimensions/0` credits the consequential high-revenue comparison while its G2 record rejects the categorical revenue-sufficiency inference.

The oil readers consistently understood the same-day negative WTI/positive Brent contrast and the fact that weekly/monthly averages can hide a daily negative observation. Interest is 2 for all four. Yet every oil reader left central source verification unresolved: the mechanism cites external material unavailable in the fixed packet, and the connection between expiring futures and the measured spot series remains insufficiently established. See [M948761](readings/M948761-stage3.json) `#/gates/G1`, `#/gates/G3` and `#/dimensions/writing`, and [Mee832a](readings/Mee832a-stage3.json) `#/gates/G1`, `#/gates/G2`. Named attribution was not automatically treated as false, nor accepted as verified.

Writing was rated 1 in seven outputs and 2 in baseline France replicate 2. Reservations concern categorical tax/revenue claims, broad scope language, terminology and the spot-to-futures transition, alongside generally concrete prose. [Mf4bb1f](readings/Mf4bb1f-stage3.json) `#/dimensions/5` rates writing 2 while retaining the tax-heading correction; [M1d3194](readings/M1d3194-stage3.json) `#/manual_dimensions/writing` rates writing 1 with adjacent 2 plausible for most paragraphs. Earlier reader records sometimes mention the repeated title: custody established that packet title promotion caused visible duplication, and their frozen judgments were not retrospectively rewritten.

Secondary evidence remains important: candidate France replicate 1 applies central-government interest growth rates 14.3%/13.2% to general government, whose checked rates were 11.2%/13.9%; see [Mb8941a](readings/Mb8941a-stage3.json) `#/gates/G1` and `#/gates/G2`, and frozen relationship `Mb8941a-R7` in [hypothesis codes](hypothesis-codes.json). All four France outputs have a failed inferential G2 scope, including shared overclaims that high total revenue rules out a revenue/tax contribution. These defects coexist with understandable primary comparisons.

Across 24 nested charts,20 are coded recoverable and 4 require reconstruction. France baseline has 7/8 recoverable versus candidate 8/8; oil baseline 2/4 versus candidate 3/4. The four reconstruction cases are `Mf4bb1f/chart-2.png`, `Mbe53b2/chart-2.png`, `Mee832a/chart-2.png` and `M948761/chart-2.png`. These are descriptive chart counts within eight outputs, not extra independent samples or a rule-effect estimate.

Across 51 nested relationships,36 are supported/understood,6 unsupported,8 unassessable and 1 left to the reader. France baseline has 10 supported,3 unsupported and 1 left-to-reader; candidate 10 supported and 3 unsupported. Each oil arm has 8 supported and 4 unassessable. Unassessable external mechanisms remain in the complete denominator. No primary pair is excluded; no favorable validity-only subset is selected.

## Seven dimensions and separate gates

The table preserves each reader’s recorded ordinal rating; there is no sum or average quality score. I=interest, D=findings depth, A=argument/counterevidence, E=explanation, C=chart design, W=writing, R=reader coverage. Full scopes, evidence and adjacent-rating qualifications are retained in results.json and linked stage3 records.

| Output (arm/topic/replicate) | I | D | A | E | C | W | R | G1 | G2 | G3 | G4 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [M30755c](readings/M30755c-stage3.json) (baseline/France/1) | 2 | 2 | 1 | 1 | 1 | 1 | 2 | pass | fail | pass | pass |
| [Mb8941a](readings/Mb8941a-stage3.json) (candidate/France/1) | 2 | 2 | 1 | 1 | 1 | 1 | 1 | fail | fail | pass | fail |
| [M9b1fee](readings/M9b1fee-stage3.json) (candidate/oil/1) | 2 | 2 | 1 | 1 | 2 | 1 | 1 | unresolved | unresolved | unresolved | pass |
| [Mbe53b2](readings/Mbe53b2-stage3.json) (baseline/oil/1) | 2 | 2 | 1 | 1 | 1 | 1 | 1 | unresolved | unresolved | unresolved | fail |
| [M1d3194](readings/M1d3194-stage3.json) (candidate/France/2) | 2 | 2 | 1 | 1 | 1 | 1 | 1 | pass | fail | pass | unresolved |
| [Mf4bb1f](readings/Mf4bb1f-stage3.json) (baseline/France/2) | 2 | 2 | 2 | 1 | 1 | 2 | 1 | pass | fail | pass | pass |
| [Mee832a](readings/Mee832a-stage3.json) (baseline/oil/2) | 2 | 2 | 2 | 1 | 2 | 1 | 1 | unresolved | unresolved | pass | pass |
| [M948761](readings/M948761-stage3.json) (candidate/oil/2) | 2 | 2 | 1 | 1 | 1 | 1 | 1 | unresolved | pass | unresolved | pass |

Gate scopes are not interchangeable. Mee832a G3 passes only CSV-to-SVG reconstruction; it does not establish raw-workbook reconstruction. Other oil records report missing offline `xlsx` dependencies and incomplete raw-to-CSV verification. France raw/CSV/chart checks are broader but still do not certify all parsing or rerun PNG rendering. G4 includes actual reader-reported clipping/overlap and uncertainty: Mbe53b2’s chart title appeared truncated in delivered PNG; candidate France charts had footer overlaps. The source SVG/text critic and PNG readers therefore judged different presentation evidence. No synthesis rerender or recoding resolves those observations.

## Runtime critic versus manual evidence

Runtime France replicate 1 prefers baseline clear/clear for the primary deficit and functional-spending analysis. Replicate 2 prefers candidate clear/clear for functional-spending growth and comparator charts, while manual writing favors its baseline 2 versus candidate 1 and the candidate’s G4 is unresolved. Oil replicate 1 prefers baseline slight/slight, whereas manual chart-design ratings favor candidate 2 versus baseline 1 and baseline G4 fails. Oil replicate 2 prefers candidate slight/clear, whereas manual baseline chart design and argument/counterevidence are 2 versus candidate 1. These are differences between bounded criteria/modalities, not a manufactured manual paired preference or owner disagreement. Every raw reason and order-specific file is linked in results.json.

## Writer exposure and output size

The [transcript/workspace audit](writer-exposure-audit.json) found the full assigned R1/R2/R3 files in returned tool context for all eight writers, and every candidate addition in all four candidate runs. Workspace skill bytes matched the assigned refs. Returned context establishes observed exposure, not attention, comprehension or application. All eight outputs remain analysed as assigned; none was excluded or rerun.

| Output | Narrative words | Whole-body words | Charts | Observed explicit network requests | Observed cap termination |
| --- | ---: | ---: | ---: | ---: | --- |
| M30755c | 585 | 910 | 4 | 0 | none |
| Mb8941a | 477 | 785 | 4 | 0 | none |
| M9b1fee | 522 | 870 | 2 | 0 | none |
| Mbe53b2 | 513 | 909 | 2 | 0 | none |
| M1d3194 | 573 | 849 | 4 | 0 | none |
| Mf4bb1f | 520 | 928 | 4 | 0 | none |
| Mee832a | 498 | 916 | 2 | 0 | none |
| M948761 | 512 | 741 | 2 | 0 | none |

Narrative counts remove frontmatter and stop before the exact “How this was made” or “Friction notes” heading. Inline images/alt text are removed, link labels retained, markup stripped and whitespace-separated tokens counted; headings, captions, numerals and punctuation-only tokens count. Whole-body counts also include appendices. These are operational word counts, not model tokens. Distinct referenced SVGs count once regardless of panels; chart counts are not sample sizes. All narrative counts fall within the commissioned 300–700 range.

Visible tool inputs and provider counters showed no explicit network requests; indirect subprocess/library requests and unlogged activity are not fully instrumented. Terminal success/end_turn, flags, duration and dollar usage showed no observed cap termination. Raw CLI turn events and distinct assistant IDs remain separate proxies, not verified API-round-trip counts or independent evidence of service-side enforcement. Exact per-run locators and counters are retained in results.json.

## Resources and accounting boundary

The eight writers used $23.791826 list-equivalent; the Claude canary used $0.00389908, giving **$23.79572508 known Claude comparison usage**. The separately authorized Opus design review used $0.5046058 list-equivalent and is outside that comparison subtotal. These values are not subscription invoices.

The four runtime pairs made 12 Codex calls: one question generation and two order judgments each, without recorded retries. Their usage totals 324,775 input tokens,11,935 output tokens and 6,474 reported reasoning-output tokens; reasoning is reported separately, not added again to total output. The Codex canary separately reports 32,213 input,13,440 cached-input,424 output and 255 reasoning-output tokens. Codex dollar costs and built-in reviewer/coder costs are unknown, not zero. Earlier unguarded inherited tests may have made live critic calls with unknown number/spend, so **no exhaustive session total is claimed**.

Writer invocations requested$5/100-turn/90-minute caps; each completed below$5. Recorded turn/event counters are not identical to the installed CLI’s API-round-trip limit, as resolved before execution. Codex’s configured$3 value is unenforced; the contract bounded calls/time instead. No extra writer slots, replacement outputs or pair retries were introduced.

## Limits and handoff

This is known-development q01/q03 material, with no fresh holdout. The three instructions travel together, so per-rule causal effects cannot be identified; q01-H3 is particularly targeted/in-sample. Reader judgments are agent observations, not owner responses. Served critic/manual model and actual effort metadata are unavailable, and Codex filesystem exclusion/outside-reading detection is not established. Fresh contexts and masked packets support instruction-level blinding, not a proof of perfect isolation.

After frozen chart/prose first readings, some outlines exposed embedded author self-review and process hashes; those verdicts are not independent evidence. All eight packets promoted frontmatter title while retaining the body heading, yielding duplicate display headings. M1d3194’s prompted-question answers followed verification exposure. Mbe53b2’s prompted answers followed simultaneous exposure to reader questions and diagnostic anchors, although they preceded outline/data/code verification; see its `#/custody/order_limit`. Both timing limitations are explicit and the spontaneous readings remain separately frozen. These custody limitations accompany the unchanged readings/codes. The [post-coding input audit](coder-input-audit.json) verifies all 114 indexed files and all 24 reader records. It clarifies stale six-output scan-scope and pending-eighth wording, and the historical no-launch status, while preserving the original delivered index byte-for-byte. Its scan found no known run/treatment identity matches; generic codebook labels and five chart-axis uses of “baseline” do not map outputs to arms. This mechanical screen does not prove perfect blinding. Source-verification, reproduction and primary-selection ambiguities remain visible.

The observed result supplies **no primary-code improvement and a 2–2 runtime preference split**, with substantive defects in both arms. It neither proves equivalence nor supports generalized improvement or calibrated judging. `datapressr-8no.9.6` receives this evidence for its retain/revise/rollback decision. This synthesis changes no skill, frozen record or code and proposes no untested execution. Independent review should verify the derivations and primary-code ceiling/eligibility limitations without recoding after reveal.
