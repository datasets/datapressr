# Lessons

Maintained by hand (design section 8): each lesson is a one-line rule with a status (`seen once`, `seen twice`, `owner-flagged`, `in skill @ <commit>`) and the evidence that supports it. The critic never sees this file.

## story

- **The exempt list must be a list.** Status: seen once (oracle, `datapressr-hcn.7`). S3 accepts a prose number that is not on a chart only when it appears in a friction-notes line that says "exempt" (or a list item nested under one), e.g. `- **Exempt numbers** (not on a chart):` followed by `- 25,415: dataset-wide count`. The oil-prices story names its exempt kinds in a sentence instead of listing the numbers, so it fails S3 on 25,415, -$37.63, $9.10 and 76%; with a four-line list it passes (the saboteur base in `lib/checkers/story.test.mjs`). The story skill's contract says "which the prose's friction notes or the task record list explicitly" but gives no format; it should give this one, or writers in blind runs will fail S3 on legitimate exempt numbers.
- **Attributed external figures need the list too.** Status: seen once (oracle). France cites DREES's 5.3% pension uprating in the prose, has no friction notes and so no exempt list: S3 fails on that one number. Every other France number (20 of 21) is on a chart.
- **Stories #1 and #2 predate the every-number-on-a-chart rule.** Status: seen once (oracle). Keeling Curve (11 of 13 prose numbers off-chart: start/end values, rates, the source file's sentinel codes) and Planetary Boundaries (6 of 11: raw readings and boundaries behind a scoreboard drawn in boundary units) fail S3. Keeling also predates the `<slug>-make-charts.mjs` name (its build is `make-charts.mjs`), so it fails S1 and therefore S4. These are recorded as oracle exceptions in the test, not fixed by weakening the checks.
- **Rounding direction matters.** S3 lets the prose round a chart value to its own precision (chart `€1,710bn`, prose `€1.7 trillion`), never the reverse: a prose figure more precise than anything on a chart is a miss.

## Critic calibration

`datapressr-hcn.8`, 2026-10-10. Rubric `story/v1` (SHA-256 `86d8957b…a0da22f`), critic Codex `gpt-6-astra` chosen with `--critic codex` (no fallback; the historical drafts' writer was a Codex agent, so this is the critic a Claude writer gets in `run`, not a cross-vendor check of these drafts). Runs are in `calibration/story/q01-french-debt/` (`build-runs.mjs` rebuilds the two drafts from main: draft 1 = outline `a153036`, charts `844796a`, prose `cbddc11`; draft 2 = all story files at `cb2080d`; all four pins verified as ancestors of main). Every critique was blind (no `--calibrate`). Hit criteria were written down before any critique was read: a remark is a hit when any part of the critique raises the same problem, partial (counted as a miss) when it touches the area but not the problem. Machine-readable table: `calibration/story/q01-french-debt.json`.

**Round 1, draft 1 (anchors may use these): 4 of 6.**

| Remark | Hit | Evidence |
|---|---|---|
| Social protection unexplained | miss (partial) | separates its size from its contribution; never asks what it contains |
| Unreadable magnitudes (€1,714.1 billion) | miss | not raised, though the prose anchor names magnitudes |
| Simple graphics beat text | hit | asks for a small comparison graphic in place of footer text |
| Wordy | hit | prose 1: accounting cautions take substantial space |
| Not deep or compelling | hit | argument 0, depth 1, publish: no |
| Reader questions unanswered | hit | 4 of 7 unanswered (near-automatic by design) |

**Round 2, draft 2 (held out): 0 of 5, with SVG text and again with PNG renders. This is the honest number.**

| Remark | SVG text | PNG renders |
|---|---|---|
| Blue and green colours are poor | miss | miss |
| Hollow vs filled markers: which year is which | miss (partial in re-scores: drop the subgroup panel) | miss (partial: subgroup changes visually compressed) |
| What is old age; is it ageing | miss | miss |
| Show me what is growing | miss | miss |
| Growth vs share contradiction | miss: praised as clearly explained | miss: praised again |

- **The critic grades the commission it imagines, not the one the owner meant.** Seen once. From "Why is there a French debt crisis?" alone it writes questions about market stress, refinancing, politics and the euro, then scores both drafts `argument 0`, `reader_questions 0`, `publish: no`, almost entirely for evidence that is not in the fixed dataset. The owner read the same question as "explain the fiscal accounts" and asked for depth inside them. Both drafts get identical checklist scores, and the pairwise judgement draft 1 vs draft 2 is a tie (orders split, both `slight`, each order preferring the story shown second), so v1 cannot see the improvement the owner asked for and got. Candidate fix (for `datapressr-hcn.14`, not applied here): in fixed mode give the critic a short description of the data the writer was given, and tell it to judge missed findings and reader questions within that reach, with out-of-reach questions marked as set aside rather than unanswered.
- **The critic praises what the owner found confusing.** Seen once. Round 2's sharpest remark (how can social protection grow if nearly every subgroup shrank) is the very passage the critic credits as a careful nominal-vs-share distinction, in every critique. A numerate critic reads labels the owner had to infer; the rubric's reader is "a curious, numerate generalist", and that reader is more expert than the owner as a reader. Candidate fix for v2: a step that asks, chart by chart, "what would a reader who looks for five seconds conclude, and is it what the prose says?".
- **PNG renders did not recover the visual remarks.** Seen once. With clean renders the critic sees the charts (it reads values and layouts correctly) but still raises neither the blue/green pairing nor the hollow/filled year markers. So images are necessary for visual judgement but not sufficient; the rubric does not ask about colour meaning or legend encoding, and this critic does not volunteer it. Decision: keep `score --png` (headless Chrome, `lib/render.mjs`; Codex critic only) as an option, not the default, until a rubric asks the visual questions; then re-test on these same remarks.
- **A broken rasteriser produces confident wrong critiques.** Seen twice. macOS Quick Look (`qlmanage -t`) clipped every wide chart at the right edge, and the critic duly reported six clipped charts (`critique-v1-3`). Headless Chrome at 1.5x then painted a stray copy of each chart's title along the bottom, and the critic asked for "duplicate headlines" to be removed (`critique-v1-5`). Both critiques stay in the ledger; neither counts. Any render the critic sees must be eyeballed once per renderer change.
- **Negative control: passes the pairwise test, ties at the floor on two dimensions.** A hand-written dataset tour with six default-style charts and no argument (`…-historical-weak-0`) loses to draft 1 in both orders, `clear` both times. Absolute scores: weak 0/0/0/0/0/0, draft 1 0/1/1/2/0/1, so the weak story is lower on depth, charts, honesty and prose and ties at 0 on argument and reader_questions, where draft 1 is itself at the floor. The checklist's floor effect, not the critic, is why "lower on every dimension" fails.
- **Critic-only spread is nil on the checklist.** Draft 2 scored three times with SVG text (`critique-v1-1`, `-2`, `-4`): identical scores on all six dimensions and `publish: no` each time; the reader questions and missed findings vary in wording but not in substance. The two PNG critiques with clean renders (`-6`) and broken ones (`-3`, `-5`) give the same scores too. On this case the critic is stable; its problem is bias, not noise.
- **Rubric edits: none.** The round-1 misses (social protection unexplained, magnitudes) are candidates for v2 (`datapressr-hcn.14`): a depth anchor that asks the largest category to be unpacked, and a prose check that cites any figure given to more significant digits than a reader can hold. They are recorded here rather than applied, because v1 is frozen at this bead's close (pilot `datapressr-hcn.6` is being scored under v1 in parallel, and the rubric hash covers the whole file) and because the held-out test should measure the rubric as written.

Cost: 10 critic invocations (8 absolute critiques of 2 calls each, 2 pairs of 3 calls; 22 calls), all on Codex `gpt-6-astra` under the subscription: 603k input tokens (8.7k cached), 18.7k output tokens, no USD billed.
