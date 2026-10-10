# Story harness, round 1: pilot, critic calibration, reference cases and the first A/B

Date: 2026-10-10. Epic: `datapressr-hcn`. Harness: `evals/` (design [`docs/plans/2026-10-09-story-harness.md`](../plans/2026-10-09-story-harness.md), how to run it in [`evals/README.md`](../../evals/README.md)). Raw results: `evals/ledger.jsonl`, `evals/runs/story/`, `evals/calibration/story/` and `evals/pairs/`; the generated tables are in [`evals/REPORT.md`](../../evals/REPORT.md); lessons and calibration detail in [`evals/LESSONS.md`](../../evals/LESSONS.md). This note puts everything the story harness has measured so far in one place: what each measurement says about the story skill, what it says about the critic, and what to do next.

**Owner: read the WWII story before section 5.** It is [`evals/runs/story/q02-allies-wwii/20261010-1111-q02-allies-wwii-claude-opus-5-5-17c1821-1/artefacts/site/stories/allies-won.md`](../../evals/runs/story/q02-allies-wwii/20261010-1111-q02-allies-wwii-claude-opus-5-5-17c1821-1/artefacts/site/stories/allies-won.md) (charts beside it; sources in `allies-won-src/`, including `DATA.md`). Do not open `critique-v2-1.*` in the run folder first.

**Owner: judge the blind pair before reading the A/B section.** The pair is `evals/pairs/20261010-1047-q01-french-debt-pair-1/`; read only `A/` and `B/` (prose and charts), not `critique*.json` or `critique.md`. The A/B section below gives aggregate results but not which label is which.

## TL;DR

- **The France lessons made q01 stories better, by the critic's judgement.** Two blind runs on the story skill before the France lessons (`031eb45`) against two on the skill after them (`50e166b`), same writer, same prompt: the post-edit story won all four order-swapped pairs, in both orders, every judgement `clear`. The critic's reason is the same each time: the post-edit stories unpack spending by function (social protection, old age, health), which is the first lesson the edit added, and the pre-edit stories do not.
- **The 0-2 checklist cannot see that difference.** Absolute scores overlap on every dimension (both arms 2/1/1/x/1/x), so the report says "no detectable change". This is what the design expected: pairwise judgement discriminates, the checklist is a diagnostic.
- **A deterministic difference too, small n.** Check S3 (every prose number is on a chart or listed as exempt) failed on both pre-edit runs and passed on both post-edit runs. Neither arm has the exempt-list format (`20c6d1e`), so this is not that fix.
- **Two caveats keep this from being settled.** The critic's rubric v2 and the skill edit draw on the same owner remarks (unpack the biggest category), so the critic may be rewarding exactly what the treatment teaches; and q01 is the case the lessons came from. The owner's blind judgement (`datapressr-hcn.13`) and a run on a case the lessons did not come from are the independent checks.
- **The critic is stable but biased.** Re-scoring the same story gives the same scores (one dimension moved by one point in three re-scores). Calibration on France found it misses most of what the owner noticed in round 2 (0 of 5 held out under v1), especially visual and reader-level confusion; v2 fixed the commission-scope problem but its round-2 check is not held out.
- **First open-mode story (WWII).** The writer found, snapshotted and documented its own sources (Harrison, Goldsmith, Maddison via OWID, Wikipedia's casualty ranges) in 15 minutes for 5.11 USD, and passed every deterministic check; the critic said `no`, for real chart and comparison errors and for strategy questions outside the brief. Section 5.
- **Cheap.** 12.2 USD at list price for all six Claude writer runs; every critique ran on the Codex subscription (tokens only). The design's 45-70 USD estimate for the A/B was about seven times too high.

## The setup in brief

Each run happens in a fresh temp git repo holding only the task prompt, the pinned input data, one pinned copy of the skill and the dataset conventions from `AGENTS.md`. Isolation is measured, not assumed: a canary run on the cheapest model proves the parent repo, the user's config and the network are unreachable before any paid run, and every transcript is scanned for paths outside the workspace. Scoring has three layers, never averaged: six deterministic checks (S1-S6, free), a critic from the other vendor (Codex `gpt-6-astra` for a Claude writer), and the owner's blind preference. The critic's main tool is a blind side-by-side of two stories judged twice with the order swapped; a pair counts as a win only when both orders agree.

| Check | Passes when |
|---|---|
| S1 | Outline, chart script, prose and at least one embedded SVG exist |
| S2 | Prose is within the word budget (300-700 for q01) |
| S3 | Every data number in the prose is on a chart the prose embeds, or in the friction notes' exempt list |
| S4 | The chart script rebuilds byte-identical SVGs offline |
| S5 | Inputs untouched |
| S6 | No date after the case's `as_of` |

The rubric scores six dimensions 0-2: argument, depth, charts, honesty, reader questions (rq), prose. Scores below are written in that order, e.g. `2/1/1/0/1/1`.

Cases so far:

| Case | Question | Data | Reference |
|---|---|---|---|
| `q01-french-debt` | Why is there a French debt crisis? | `datasets/france-public-finances` at `f0082af`, fixed (no network) | The owner's two rounds of remarks on the published France story (critic calibration only) |
| `q03-wti-negative` | Why did the price of oil go below zero in April 2020? | `oil-prices` at `5d0799a`, fixed | EIA *Today in Energy*, 27 April 2020 |
| `q04-co2-rising` | Is the carbon dioxide in the atmosphere still rising, and how fast? | `co2-ppm` at `d478eed`, fixed, `as_of` 2026-07-01 | NOAA Climate.gov, 21 May 2025 |

## 1. Pilot: does the harness work end to end? (`datapressr-hcn.6`)

Two blind q01 runs on the story skill as it stood before the France lessons. These runs predate the blind-run notes (`datapressr-hcn.18`: how a blind writer handles the skill's review gate and chart checks), so their prompt differs from the A/B runs and they are not paired with them.

| Run | Skill (tree) | Writer | Critic | Rubric | Checks | Scores | Publishable | Cost USD | Turns | Minutes |
|---|---|---|---|---|---|---|---|---|---|---|
| `20261010-0101-…-c08d6d6-1` | `031eb45` (`c08d6d6`) | claude-opus-5-5 | codex gpt-6-astra | story/v1 | all 6 pass | 0/1/1/0/0/1 | no | 1.46 | 26 | 5.5 |
| same | | | | story/v2 | all 6 pass | 2/1/1/0/1/1 | with-edits | | | |
| `20261010-0113-…-c08d6d6-1` | `031eb45` (`c08d6d6`) | claude-opus-5-5 | codex gpt-6-astra | story/v1 | S3 fails | 0/1/1/0/0/2 | no | 1.72 | 33 | 5.7 |
| same | | | | story/v2 | S3 fails | 2/1/1/0/1/1 | with-edits | | | |

**About the skill.** Both writers produced a complete outline, three or four reproducible charts and 570-600 words of prose, without help, for under 2 USD and six minutes each. Under v2 both make a clear argument inside the data (argument 2). Both critiques name the same gap: spending is treated as one total, never unpacked into its functions, though the dataset has them. One pilot failed S3 (a prose number on no chart). In one run the writer tried to call `claude -p` from Bash to get the outline reviewed; that is why the harness now blocks nested agents (`datapressr-hcn.19`) and the blind-run notes tell writers to self-review.

**About the critic.** Under v1 the critic judged both pilots unpublishable for not discussing bond markets, refinancing and politics, none of which is in the fixed dataset; see calibration below. Honesty 0 on both is for figures from outside the inputs (from the writer's memory).

## 2. Critic calibration: v1 vs v2 (`datapressr-hcn.8`, `datapressr-hcn.21`)

The critic was tested on the published France story, whose owner remarks we have. Draft 1 (round-1 remarks) and draft 2 (round-2 remarks, after draft 1's fixes) were rebuilt as run 0s, plus a deliberately weak story on the same data as a negative control. Hit criteria were written down before any critique was read. These are historical drafts, so there is no writer cost or turn count; the writer was a Codex agent, so the Codex critic here is not cross-vendor.

| Story | Rubric | Scores | Publishable | Notes |
|---|---|---|---|---|
| Draft 1 (`a153036`, `844796a`, `cbddc11`) | story/v1 | 0/1/1/2/0/1 | no | |
| Draft 1 | story/v2 | 1/1/2/0/1/1 | with-edits | |
| Draft 2 (`cb2080d`) | story/v1 | 0/1/1/2/0/1 | no | scored 6 times (3 SVG text, 3 PNG), identical every time |
| Draft 2 | story/v2 | 1/1/1/0/1/1 | no / with-edits | SVG text / PNG renders |
| Weak control | story/v1 | 0/0/0/0/0/0 | no | |
| Weak control | story/v2 | 0/0/0/0/0/0 | no | |

| Test | v1 | v2 |
|---|---|---|
| Round-1 remarks found in the draft-1 critique (anchors may use these) | 4 of 6 | 6 of 6 |
| Round-2 remarks found in the draft-2 critique, SVG text | 0 of 5 (held out) | 1 of 5 (not held out) |
| Same, with PNG renders | 0 of 5 (held out) | 1 of 5 (not held out) |
| Pair draft 1 vs draft 2 (the owner wanted draft 2) | tie (orders split, `slight`) | draft 2 in both orders, `slight` |
| Weak control vs draft 1 | draft 1 in both orders, `clear` | draft 1 in both orders, `clear` |

**Held-out caveat.** v1's 0 of 5 on round 2 is the only honest held-out number we have. The v2 author had read the round-2 remarks, and v2's chart-reading step was partly motivated by them, so v2's 1 of 5 is a contaminated check, not evidence that v2 generalises. A clean test needs remarks nobody writing the rubric has seen: the owner's remarks on the A/B pair below are the next chance, with v2 frozen and hit criteria registered before the remarks are read.

**About the critic.**

- v1 graded the commission it imagined (market stress, refinancing, the euro) rather than the one the owner meant (explain the fiscal accounts). It floored argument and reader questions at 0 for every France story and could not see the improvement from draft 1 to draft 2. v2 fixes this by giving the critic an inventory of the input data and letting it set aside questions the data cannot reach. It now prefers draft 2 in both orders.
- It praises what the owner found confusing. Round 2's sharpest remark ("how could social protection have grown if almost every area shrank") is the passage the critic credits as a careful distinction, under both rubrics. The critic is a more expert reader than the owner, and asking it to describe the chart encodings (v2) did not help: it decodes the blue/green and hollow/filled keys correctly and calls them clear.
- PNG renders were necessary but not sufficient for visual remarks, and two broken rasterisers produced confident wrong critiques (clipped charts, duplicate headlines). PNG is an option (`score --png`), not the default.
- Honesty now floors instead: any figure from outside the inputs scores honesty 0, which is fair for a blind fixed-data writer but harsh on drafts written with the web.
- It is stable: identical scores across six re-scores of draft 2 under v1.

**About the skill.** The calibration found the skill-relevant gaps the owner had already named in round 1: the largest category (social protection) left unexplained, unreadable magnitudes. These became the France lessons tested in section 4.

Cost: Codex subscription only. v1 calibration 603k input and 18.7k output tokens; v2 514k and 19k (kept rows), about 930k and 36k including a first pass lost to a parallel agent's cleanup of a shared scratch dir.

## 3. Reference cases (`datapressr-hcn.16`)

Two published DataPressr stories, each compared with a professional piece that answers the same question. The references are stored as a link, an archive link and our own list of their key findings, never their text. The comparison uses an overlay rubric (`story/v2+reference-pairwise`) that asks which is the better answer and names what each has that the other lacks.

| Case | Story (run 0) | Checks | Scores (v2) | Publishable | Reference pair |
|---|---|---|---|---|---|
| q03 oil below zero | published oil-prices story | all 6 pass | 1/1/2/2/1/1 | with-edits | EIA preferred in both orders, `slight` |
| q04 CO2 rising | published Keeling Curve story | S1, S3, S4 fail (known: it predates those rules) | 1/1/1/0/0/1 | no | Climate.gov preferred in both orders, `clear` |

**About the skill.** In both cases the professional piece wins because it states the computed comparison and ours gives the reader the ingredients: oil gives Brent and WTI on 20 April but not the 54 USD spread; Keeling gives 316 and 427 ppm but not the 111 ppm, 35% rise, and decade rates but not the latest year against them. Two sources, so it qualifies as a skill edit: when the prose gives two numbers whose difference or ratio is the point, state the difference or ratio. Not applied yet. The oil story is the best-scoring story the critic has seen and close to its reference.

**About the critic.** It found a real chart defect from SVG source alone (the Keeling 350 and 400 ppm rules drawn at about 351.7 and 401.0 ppm, verified by hand) and flagged series labelled only in the prose, while passing the oil charts that label their lines directly. It also set aside oil's headline "why" even though the story answers it by attributing EIA, which is what a fixed-data explanatory story should do; candidate rubric fix for v3: an attributed answer to an out-of-reach question counts as `partly`. q04's run 0 was written as "the Keeling Curve", not as an answer to this question, so it is a weak baseline.

Cost: Codex only, about 166k input and 8.2k output tokens.

## 4. The q01 A/B: before and after the France lessons (`datapressr-hcn.11`)

**Treatment.** Commit `50e166b` (`datapressr-hcn.10`) put ten owner-flagged lessons from the France reviews into the story skill: unpack the biggest category and answer the reader's questions; a reader-questions pass on the outline; separate mix from change and name the denominator; readable magnitudes; equal markers with a real colour key; define source labels in plain words; a caveat is not an answer to "why"; a small chart for a sentence that compares numbers; cut wordiness; keep owner remarks verbatim. Full list with the source remarks in [`evals/LESSONS.md`](../../evals/LESSONS.md#france-owner-lessons-datapressr-hcn10).

**Design.** Pre-edit arm at `031eb45` (tree `c08d6d6`), post-edit arm at `50e166b` (tree `d6d4845`). The post-edit arm is pinned to `50e166b`, not `HEAD`, so later skill changes (the exempt-list format `20c6d1e`, install links `5f62900`, DataHub fields `6203aee`) do not confound the test. Two runs per arm, run one at a time, same writer model, same harness tree and byte-identical prompt (SHA-256 `3fe1ed6d…`), network off, per-run cap 8 USD. Each run scored once with rubric v2; every pre x post combination paired (four pairs, each judged in both orders). The pilot runs share the pre-edit tree but predate the blind-run notes, so they are not paired.

| Run | Arm | Skill (tree) | Writer | Critic | Rubric | Checks | Scores | Publishable | Words | Cost USD | Turns | Minutes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `20261010-1004-…-c08d6d6-1` | pre | `031eb45` (`c08d6d6`) | claude-opus-5-5 | codex gpt-6-astra | story/v2 | S3 fails (5 of 29 numbers on no chart) | 2/1/1/2/1/1 | with-edits | 582 | 2.02 | 29 | 6.8 |
| `20261010-1012-…-c08d6d6-1` | pre | `031eb45` (`c08d6d6`) | claude-opus-5-5 | codex gpt-6-astra | story/v2 | S3 fails (1 of 22) | 2/1/0/0/1/1, re-scored 2/1/1/0/1/1 twice | with-edits | 571 | 2.07 | 33 | 10.0 |
| `20261010-1024-…-d6d4845-1` | post | `50e166b` (`d6d4845`) | claude-opus-5-5 | codex gpt-6-astra | story/v2 | all 6 pass (43 numbers) | 2/1/1/0/1/2 | with-edits | 618 | 2.52 | 30 | 9.2 |
| `20261010-1034-…-d6d4845-1` | post | `50e166b` (`d6d4845`) | claude-opus-5-5 | codex gpt-6-astra | story/v2 | all 6 pass (27 numbers) | 2/1/1/1/1/1 | with-edits | 641 | 2.36 | 36 | 8.0 |

| Pair | Pre | Post | Order AB | Order BA | Result |
|---|---|---|---|---|---|
| `20261010-1044-q01-french-debt-pair-1` | 1004 | 1024 | post, clear | post, clear | post wins |
| `20261010-1045-q01-french-debt-pair-1` | 1004 | 1034 | post, clear | post, clear | post wins |
| `20261010-1046-q01-french-debt-pair-1` | 1012 | 1024 | post, clear | post, clear | post wins |
| `20261010-1047-q01-french-debt-pair-1` | 1012 | 1034 | post, clear | post, clear | post wins |

**Win/tie/loss of post vs pre: 4/0/0 (n=4 pairs, 8 judgements, all clear).** Absolute score ranges (the report pools the two pilots into the pre-edit tree, n=4; post n=2): argument 2 vs 2, depth 1 vs 1, charts 1 vs 1, honesty 0-2 vs 0-1, reader questions 1 vs 1, prose 1 vs 1-2. Every range overlaps: no detectable change on the checklist. Critic-only spread from re-scoring run 1012 three times: charts 0-1, every other dimension identical. So the one low charts score in the A/B is critic noise, while honesty's 0-2 range across runs is writer variation (whether the story cites figures from outside the inputs).

**What it says about the skill.** In words the report's rules allow: the critic consistently prefers the post-edit stories (four of four pairs, both orders); the absolute checklist shows no detectable change. The critic's reasons are specific and repeat across pairs: the post-edit stories have a "where the money goes" section that identifies social protection, old age and health and how they changed, and one gives the deficit excluding interest; the pre-edit stories leave spending as a total. That is lesson 1, the owner's main round-1 remark. Pre-edit stories were sometimes credited with clearer debt-ratio dynamics and a sharper "fiscal problem, not market crisis" framing, but never enough to win an order. On the deterministic side, both post-edit runs passed S3 and both pre-edit runs failed it (three of four on the pre-edit tree, with the pilots); a plausible cause is the lesson that a sentence comparing numbers wants a small chart, but two runs per arm cannot establish that. Post-edit runs cost a little more (2.36-2.52 against 2.02-2.07 USD) and wrote a little more (618-641 against 571-582 words), within budget. All four stories are `with-edits`; none is yet publishable as is.

**What it says about the critic.** The pairwise judgement discriminates where the checklist does not: the checklist sits at 1 on depth for every real q01 story the critic has scored (both France drafts, both pilots, both arms; only the weak control scores lower), so it cannot register a story that unpacks the biggest category against one that does not, while the side-by-side names exactly that. Two reasons not to take the 4-0 at face value yet: rubric v2's depth anchor ("unpack the biggest category") came from the same round-1 France remark as the skill's lesson 1, so the critic and the treatment share a source; and q01 is the case the lessons came from, so this does not show they transfer. Both arms' leak flags were reviewed and are false positives (relative `../` paths that stay inside the workspace, and the awk match operator `~` read as a home directory; recorded on `datapressr-9lc`).

**Owner pair.** `20261010-1047-q01-french-debt-pair-1` (runs 1012 and 1034). Run 1012's re-scored profile matches the pre-edit tree's usual profile (2/1/1/0/1/1, shared with both pilots); between the two post-edit runs, 1034 was chosen because its one off-profile score is honesty rather than prose, which the owner judges directly. The A/B mapping is in a gitignored `mapping.json`. To judge: read `evals/pairs/20261010-1047-q01-french-debt-pair-1/A/` and `B/` only, say which you would publish with fewer edits and why, and the agent records the reply verbatim with:

```sh
node evals/run.mjs owner 20261010-1047-q01-french-debt-pair-1 --preferred A|B|neither --remarks-file reply.md
```

Only then does the harness read the mapping, and the report's judge-owner agreement gets its first data point.

Cost: four writer runs 8.98 USD at list price (notional on the subscription), 6.8-10 minutes each; critic 616k input and 22.7k output tokens in 24 Codex calls (four absolute critiques, two re-scores, four pairs of three calls), no USD billed. The bead's estimate was 45-70 USD.

## 5. Transfer case: q02 WWII, open mode (`datapressr-hcn.12`)

**Question.** "Why did the Allies win the Second World War?", historical, open data mode: nothing provided, the writer finds, snapshots and documents its own data. The brief (`evals/cases/story/q02-allies-wwii/prompt.md`) asks for an argument built from measurable series (war production, manpower, coalition GDP with Harrison as the starting point, oil and raw materials, casualties), one series per chart, every number saying what it measures, disagreement between sources shown, and a plain statement of what the data does not test; sources snapshotted in `<slug>-src/` with `PROVENANCE.md`, and `DATA.md` listing what was searched, chosen and rejected, with licence and vintage. This is the transfer test of the France lessons: a case they did not come from, in a different story type and data mode.

**Open-mode recipe** (design section 4.3, `evals/lib/opennet.mjs`). Web tools on, shell network allowlisted: the writer has `WebSearch` and `WebFetch` for any site except the project's own published sites (DataHub, Flowershow), and `curl` inside the sandbox reaches a list of 111 data-host patterns (encyclopaedias and Our World in Data, GitHub, research repositories and archives, economic-history and official statistics, UK universities, military and official history). Claude Code accepts no bare `*` or TLD wildcard in the sandbox allowlist, so the shell cannot be fully open. The project's GitHub repository cannot be blocked by domain, so a scan after the run flags any tool call naming an own site, the repository, a forbidden domain or a reference. The filesystem, temp-dir and nested-agent lock-down is the fixed-mode one, unchanged. Canary on Haiku: pass (`20261010-1108-canary-claude-haiku-5-5-1`, 0.019 USD; Wikipedia reachable from the shell, `example.com` and the own site not, `WebFetch` on the own site denied, `WebFetch` and `WebSearch` working elsewhere, the scan flags the own-site attempt); weakened, fail as it should (`…-1109-…-weakened-1`, 0.027 USD).

**Skill.** HEAD (`8313117`; story tree `17c1821`, with `archive` and `structure` staged too), not the A/B's pinned `50e166b`. This is a single run on a new case, not an arm of a comparison, so there is no confound to hold fixed; HEAD contains every France lesson plus the exempt-list format (`20c6d1e`), which an open-mode story full of attributed figures needs to pass S3; and it is the skill a real story would use today.

| Run | Writer | Critic | Rubric | Checks | Scores (arg/depth/charts/honesty/rq/prose/data_choice) | Publishable | Words | Cost USD | Turns | Minutes |
|---|---|---|---|---|---|---|---|---|---|---|
| `20261010-1111-q02-allies-wwii-claude-opus-5-5-17c1821-1` | claude-opus-5-5 | codex gpt-6-astra | story/v2 | all 6 pass (36 numbers; S1 includes DATA.md and PROVENANCE.md) | 1/1/1/0/0/1/1 | no | 691 | 5.11 | 62 | 15.0 |

**Data the writer found** (from its `DATA.md`). Used: Harrison's corrected Excel of the chapter 1 tables of *The Economics of World War II* (1998; GDP 1938-45 at 1990 international dollars, armed forces, weapons in units); Goldsmith's 1946 combat-munitions estimates at US 1944 prices, transcribed from table 1 of Harrison's 1988 *Economic History Review* paper (author's postprint); the Maddison Project Database 2023 via Our World in Data (CC BY 4.0) as a second GDP estimate for a fixed country set; a pinned revision of Wikipedia's "World War II casualties" (CC BY-SA 4.0) for death ranges with named sources (Krivosheev vs Hartmann, Zemskov vs Andreev). Rejected: Wikipedia's raw-materials and oil table (largely "citation needed") and its copy of Goldsmith (omits Canada). Unreachable, recorded and not worked around: the Maddison Excel file (dataverse.nl redirects to a host not on the allowlist) and the 2020 CEPR e-book (cepr.org not listed). Oil is missing, and the story says so.

**The story.** Four charts: munitions by coalition and country 1935-44 (Allies 3.1-3.6 times the Axis from 1942), coalition GDP 1938-45 with a two-source cross-check, a USSR/Germany ratio dot plot for 1942 and 1944, and death ranges for ten countries. It names Goldsmith and what his prices mean, attributes the eastern-front and Lend-Lease points to Harrison with a link, and ends with what the data cannot test. Leak scan: three flags, all reviewed as false positives (`cd ../..` back to the workspace root, and `cd $TMPDIR`, the run's own temp dir); no own-site, repository or forbidden-domain access.

**What the critic said.** Publishable `no`. Its points split into three kinds:

- Real defects, verified: the munitions legend is drawn at `translate(NaN,-22)`, so it is unusable; the deaths legend swatch does not match its marks; the "larger share of a larger economy" claim divides munitions and GDP for differently defined coalitions; tank counts against munitions value are two measures, not two sources disagreeing; annual production is written as weapons the USSR "had". These drive honesty 0.
- Fair depth points: the US share of 1944 munitions (about 60%) is not stated; Japan and China are thin; two-decimal ratios and `$1,862bn` read heavily.
- Out of the brief: strategy, Axis mistakes, contingency and theatre turning points, which the brief told the writer the data does not test and to say so. The critic sees the question, not the brief, so it scores reader_questions 0 partly for these. This is the v1 France problem (the critic grades the commission it imagines) again, now in open mode, where v2's fixed-data inventory does not apply.

**Did the France lessons transfer?** Held: define source labels in plain words; answer "why" with attributed evidence; a chart for each comparison (S3 passes on 36 numbers); the equal-marker colour key on the dot plot. Partly: unpack the biggest category (by country on the chart, not in the prose); readable magnitudes; wordiness (691 words). Did not hold: name the denominator (the unmatched-coalition share claim); a real colour key on every chart (the NaN legend). Not exercised: keeping owner remarks. Detail per lesson in [`evals/LESSONS.md`](../../evals/LESSONS.md#france-owner-lessons-datapressr-hcn10). One run, so an anecdote.

**What it says about the harness.** Open mode works end to end on the first try: the writer searched, downloaded, transcribed and snapshotted sources inside the sandbox, recorded what it could not reach instead of working around it, and every deterministic check passed. Candidate harness work: a check that fails any embedded SVG with `NaN` in it (S4's byte-identical rebuild cannot see a broken legend); the brief's scope for the critic in open mode (rubric `datapressr-hcn.14`); and the allowlist's first holes (repository redirect hosts, cepr.org).

Cost: 5.11 USD at list price for the writer (62 turns, 15 minutes), against the bead's 20-30 USD estimate; canaries 0.046 USD; one Codex critique, about 49k input and 2.6k output tokens, no USD billed.

## Spend so far

| Measurement | Claude writer USD (list) | Codex critic tokens (input / output) |
|---|---|---|
| Pilot, 2 runs, scored under v1 and v2 | 3.18 | about 159k / 9k |
| Calibration v1 | none | 603k / 18.7k |
| Calibration v2 (kept rows) | none | 514k / 19k |
| Reference cases | none | 166k / 8.2k |
| A/B, 4 runs, 6 critiques, 4 pairs | 8.98 | 616k / 22.7k |
| q02 WWII, open mode, 1 run, 1 critique, 2 canaries | 5.15 | about 49k / 2.6k |
| Total | 17.31 | about 2.11M / 81k |

Canaries add under 0.05 USD. Each Claude writer run is 1.5-2.5 USD and 5-10 minutes; each absolute critique about 40-50k input tokens, each pair about 90k.

## What's next

1. **Owner judges the q01 pair and reads the WWII story** (`datapressr-hcn.13`): the independent check on the 4-0, the first judge-owner agreement figure, and the owner's remarks on the first open-mode story, recorded with `owner <run_id> --remarks-file`. Register the round-2-style hit criteria for v2 before reading the owner's remarks, so they double as the clean held-out test v2 has not had.
2. **Test transfer** (design section 8's overfitting guard): run the post-edit skill on a case the France lessons did not come from. q03 (oil) is the obvious one: it has a published run 0 and a reference. The WWII open-data case (`datapressr-hcn.12`, section 5) is a first, single-run transfer check: some lessons held, two did not.
3. **Next skill edit:** "state the difference or ratio, not just the two numbers" from the reference cases (two sources, qualifies under the edit rule). Pair it on q03 and q04 and one other case.
4. **Rubric v3 candidates** (only against unseen remarks): an attributed answer to an out-of-reach question counts as `partly`; a less expert reader, or a forced "what would a reader get wrong" per chart, to catch what the owner found confusing; watch honesty's floor effect.
5. **Harness fixes:** the leak scan's false positives (`datapressr-9lc`), and the report's noise table pools pre-notes pilot runs with post-notes runs on the same skill tree; it should segment by prompt hash as it does by model.
