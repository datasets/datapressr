# Assessed public data-story exemplars

Revision `exemplars-2026-10-17-v1`; task `datapressr-8no.9.3`, Stage 1A of the reviewed `.9.5` design. This is an assessed development collection, not a ranked survey or evidence that a candidate writing skill improves stories. The nine source IDs match [the frozen partition registry](../../evals/calibration/story/reference-partitions.json). All are `known-development`; no clean source holdout or fresh evaluation-case holdout currently exists. Subsequent calibration on these examples is exposed and diagnostic. Author: `/root/exemplar_catalogue`; independent acceptance remains with the coordinator/reviewer.

Inputs: owner brief [data-story-research.md](data-story-research.md) at `2e411017853a15746b45012d4e8ac0b6f8b345d8` (consolidated 11 October 2026), registry frozen under `.9.7`, and working base `7eec7db`. The [CSV](data-story-exemplars.csv) has exactly nine entries: six short-journalism entries, one longer tracker, one interactive teaching chapter and one illustrated explanation/talk. The 31-post gender thread is longer than the core four despite sharing the short-journalism category. OWID summaries, Pudding narratives and practitioner/book reviews are not silently added to the journalism set.

## What the access labels mean

Retrieval date for all checks: **17 October 2026, Europe/Paris**. Public web retrieval was followed by a fresh headless Google Chrome session where JavaScript/chart inspection was needed. Direct HTTP and browser access sometimes differed: Thread Reader/Datawrapper returned 403 to direct requests while Chrome rendered the public pages. No account cookies or paywall bypass were used. Temporary inspection captures were kept outside the repository; public outputs contain source links and original analysis, not article bodies or copied graphics.

- `argument_status=verified` means the accessible body/thread or teaching instructions were read; it does **not** certify that every assertion is correct.
- `charts_status=verified` requires actual visual inspection. The row specifies which assets or states; it does not imply every interaction was tested. `unresolved` covers mixed static success and failed interactive rendering. `unavailable` means the relevant visual could not be inspected.
- `data_status=verified` means the stated, bounded table/payload was actually retrieved and read. It does **not** mean every article calculation was reproduced, the complete dataset was recovered, or a redistribution licence was verified. `unresolved` preserves accessible source metadata with missing exact input/coding; `unavailable` means no input source could be checked for that exact entry.

| Source ID | Argument | Charts | Data | Verified scope / remaining access gap |
|---|---|---|---|---|
| `jbm-london` | verified | verified | unresolved | Thread plus three actual images; OECD source family identified, exact historical inputs unrecovered. |
| `jbm-rent-control` | verified | verified | unresolved | Four author posts plus root-post image; final review coding/download not recovered. |
| `chalabi-spending` | verified | verified | verified | Three rendered Datawrapper charts/payloads and linked ONS A5 mirror; original ONS release/list 404. |
| `chalabi-pay` | verified | unavailable | verified | Body, official bulletin and linked occupation table; obsolete ONS map unavailable. |
| `jbm-gender-politics` | verified | verified | unresolved | Thread plus five central images; survey routes checked, exact harmonization unrecovered. |
| `guardian-inflation` | verified | verified | unresolved | Actual ten-item illustration and linked live BLS page; historical endpoint extract unpinned. |
| `ft-coronavirus` | unavailable | unavailable | unavailable | Subscription barrier despite “Free to read” title; no substantive body inference. |
| `seeing-theory` | verified | verified | verified | OLS quartet I/IV states and two hosted CSVs; dragging/other modules untested. |
| `bostock-example` | verified | unresolved | unresolved | Transcript and static illustrations accessible; historical projection iframe failed. |

## Core four: evidence and craft limits

### `jbm-london`: the comparison changes when its unit changes

The thread's useful editorial move is to challenge a national comparison with the distribution beneath it, then show how an exclusion changes the weighted mean. The two regional dotplots are visibly labelled PPP-adjusted GDP per head on a log scale and credit OECD regional accounts; the separate recovery line chart credits **ONS and the Scottish government**. GDP per head is not household income, a living-standard ranking or an estimate of what secession would cause. Those are boundaries on the lesson, not optional footnotes. See [L1], [L2], [L3], [L4].

An adaptation should calculate `(national GDP - region GDP) / (national population - region population)`, and compare it with the original national ratio. Averaging regional per-capita values without population weights would answer another question. Different territorial boundaries and commuting patterns also change the result. The [OECD source route][L5] confirms a public regional GDP/population framework, but this pass did not recover the FT's exact vintage, PPP base, regional crosswalk or calculation files; the reported 14% is not independently reproduced. The main dots have varying sizes without a visible size legend: do not infer their encoding or copy that ambiguity.

### `jbm-rent-control`: translate the evidence unit before the conclusion

The supplied Bluesky URL is the final research-link post, not the root chart post. The unauthenticated public API recovers the author chain and embedded image; [R1] and [R2] make this independently repeatable. The actual image has seven outcome rows and identifies each circle as a **study result**. The thread's 112-study label does not establish 112 independent observations in every row. Exact counts cannot safely be read through overlapping dots. [R3]

My analytical limit: a sign display can expose competing benefits and harms, but it omits magnitudes, uncertainty, research quality and policy variants. Mixed results in the homelessness row resist an across-the-board adverse verdict. “Beneficial” also contains a perspective choice: a lower rent, a landlord revenue change and an overall welfare estimate are not interchangeable units. The source is Kholodilin's 2024 review, DOI [10.1016/j.jhe.2024.101983][R4]. Direct publisher retrieval failed with 403; publisher search metadata reports open access/Creative Commons and data on request. Neither that metadata nor an accessible chart establishes a downloadable open dataset or validates the journalist's outcome coding. A new synthesis needs the final tables and a reproducible result-to-category map before numerical claims are reused.

### `chalabi-spending`: preserve the whole-budget denominator

The linked [ONS Table A5 mirror][S2] permits a precise negative control for any scoring or writing rule. Row 10 labels £170 as the **second income decile's lower boundary** and £1,397 as the highest decile's lower boundary. They are not spending estimates; A5 therefore does not support the article's spending-level comparison using those numbers. This finding does not claim that every unrecovered original table has been checked. Income rank is also distinct from wealth rank.

The [income chart][S4] supplies six input percentages through its public “Get the data” link. For the bottom decile they are `25,8,9,15,4,1`, which sum to 62. Its rendered 100%-stacked bar displays housing at approximately `25/62 = 40.3%`, whereas A5 says 25% of **total** expenditure. At the top decile the six values total 52 and housing becomes `9/52 = 17.3%`, versus 9% of total. Thus the graphic changes the denominator to selected spending without making that sufficiently clear. A new graphic should retain the original percentages and include the omitted remainder, or label the subset denominator explicitly. This is an author-inspected render; independent direct requests may encounter 403. [S2], [S4]

The other two charts were separately rendered: [amount bars][S3] and [regional per-person bars][S5]. Public data payloads remain distinct from render rights. Housing's table footnote excludes mortgage interest, council tax and Northern Ireland rates; household composition also varies by income group. Reuse the question “what does the average hide?” while independently rebuilding its arithmetic, definitions and visual denominators. The historical [ONS release/list links][S6] returned 404, so full 2012 reconstruction remains a gap.

### `chalabi-pay`: concise explanation needs exact percentage language

The primary [ONS 2013 bulletin][P2] and the [linked occupation table][P3] are readable even though the historical [map wrapper][P4] does not expose a usable chart here. The sheet title says “National minimum wage”, but its visible Table 13 concerns occupation earnings; this is a discoverability issue, not a reason to infer missing tabs.

Two numerical checks matter for adaptation. ONS uses April CPI **2.4%**, where the article gives 2.3%. ONS defines the full-time hourly gap excluding overtime relative to men's earnings: `(13.60 - 12.24)/13.60 = 10%`. Reversing the comparison gives about 11.1%, so “10% above” is not equivalent. These subgroup medians do not isolate unequal pay for otherwise comparable jobs. Source accessibility therefore supports a short data story, but it does not excuse copying the headline's denominator or the article's percentage wording. [P1], [P2], [P3]

## Other journalism and teaching

`jbm-gender-politics` offers a disaggregation pattern with significant comparability limits. The actual opening graphic uses different measures across countries: US stated ideology versus party support elsewhere, adjusted for overall-population time trend. Five core assets were inspected, not all media in the 31 posts. The thread also corrects the Korean agree/disagree label; keeping the original picture without that correction would perpetuate the error. A one-survey, one-item adaptation is more defensible than assuming these country panels form a standardized dataset. Public [GSS][G7] and [BES][G8] routes were checked; exact waves, weights and smoothing remain unresolved. [G1]–[G6]

`guardian-inflation` makes a familiar purchase the entry point to a broader question. The real illustration has paired dollar labels and item-specific unit exceptions. Its drawing sizes are expressive but lack a stated area/length scaling rule; use the numbers for exact comparison. The [BLS page][I3] is a live source, so an adaptation must pin endpoint months and series rather than infer the historical extract from a 2005/2025 label. Selected goods are not a weighted inflation basket, and price change is not a complete household-burden estimate. [I1], [I2]

`ft-coronavirus` is retained as an **unassessed access gap** in the longer-journalism category. The returned [page][F1] retains “Free to read” in its title but serves a subscription barrier. No byline, publication chronology, chart sequence, excess-mortality method or underlying data is certified by this pass. Other open FT repositories/pages were not substituted for this exact entry. The owner summary remains a starting lead rather than a verified finding.

`seeing-theory` is teaching rather than reporting. Browser selection of quartet I and IV rendered distinct point configurations, residual squares and fitted lines. IV's table displayed `n=11`, intercept `3.00`, slope `0.50`, SSE `13.74`; the hosted Anscombe CSV has 11 rows. This supports an original guide on why similar fitted summaries still require seeing the points. It does not verify dragging, correlation/ANOVA, accessibility or a causal interpretation. The archive notice, initial empty chart and implementation effort all matter to a Factory guide proposal. [T1]–[T5]

`bostock-example` is a visual-explanation transcript with practitioner examples, **not** a systematic NYT graphics survey. The original brief's correction is preserved. Static montage and later screenshot assets load, but the projection demonstration's historical iframe shows a failure icon; its interactive effect remains unresolved. An original line-chart guide can borrow the argumentative sequence “problem, plausible alternative, consequence, useful fix” without recreating obsolete code or claiming to have tested the old interaction. The text discusses both audience context and purpose; later NYT examples do not change the primary category. [B1]–[B3]

## Factory and scoring handoff

Handoff identity: task `.9.3`, catalogue revision `exemplars-2026-10-17-v1`, source IDs above, owner brief commit and partition path recorded at the start of this note. The coordinator must attach the final accepted commit/blob identities to `factory-but.1.1`; cross-repository gating is manual. This note is research evidence, not publication permission, a new selection queue or a claim that the research task has passed independent acceptance. `factory-31x` retains publishing-slate selection. No Factory files/tasks were mutated.

| Consumer / proposal strand | Concrete usable input | Access/effort limit to carry forward |
|---|---|---|
| `factory-but.1.1`: data-story proposal brief | `chalabi-spending` and `chalabi-pay`: a question about what an average hides, official subgroup tables, explicit denominator tests. `jbm-london` adds weighted exclusion/disaggregation; `guardian-inflation` adds concrete item comparisons. | Existing structured data availability must be checked for the chosen topic; these external data routes are not claims that a matching local dataset already exists. Spending and pay provide negative controls as well as craft lessons. London historical calculation and inflation endpoints remain unreproduced. |
| `factory-but.1.1`: visual-guide proposal brief | `seeing-theory`: a bounded regression demonstration using 11-point quartet states. `bostock-example`: explain the problem and practical consequence before the mechanism; a line-chart before/after example is feasible. | Static original guide low/medium effort; accessible dragging and numerical checks medium effort. Seeing Theory code Apache-2.0 requires notices/version check; dataset provenance separately unresolved. Bostock historical interaction is unverified. |
| `factory-but.1.1`: practitioner/Tufte review brief | `bostock-example` supports scope discipline for practitioner explanation; owner brief identifies Tufte as a separate proposed strand. | No Tufte book was read in this public pass. Exact edition/access and private-library prerequisites stay with `.9.2`/its bounded successor. A Bostock essay cannot substantiate a review of a different author's book. |
| `.9.1` scoring and `.9.4` candidate rules | Test whether a critique catches spending's subset denominator/income boundary, pay's reversed percentage, rent-control's evidence unit and London's GDP/living-standard distinction. | Manual analyst coding on exposed material is diagnostic. Four core source checks and all access fields require independent review; no new owner judgments, quality ranking, model evals or skill changes are implied. |

Unverified owner leads remain leads: the unidentified Guardian airport comparison; second open FT Covid article; log-scale/population-adjustment thread; Pudding film-dialogue and wine-label stories; possible personal Burn-Murdoch blog. No extra row, fresh-source reservation, body assessment or proposal selection is inferred for them. See the unchanged [owner brief](data-story-research.md#leads-not-yet-verified-or-fully-identified).

## Source and asset locators

Bracket IDs in the CSV resolve here. All were checked on the retrieval date above; a locator can be a documented failed access attempt. Mirrors are explicitly labelled, not passed off as original publisher endpoints. Access does not establish reuse rights: article/graphic rights and source-data licences are separate. No copyrighted bodies or chart files are committed.

[L1]: https://threadreaderapp.com/thread/1689950429403037697.html
[L2]: https://pbs.twimg.com/media/F3Pky9uX0AEwOvn.png
[L3]: https://pbs.twimg.com/media/F3PllzeXcAABWvd.png
[L4]: https://pbs.twimg.com/media/F3PmAxFXMAAS9ER.jpg
[L5]: https://data-explorer.oecd.org/vis?df[ag]=OECD.CFE.EDS&df[id]=DSD_REG_ECO%40DF_GDP&df[vs]=1.0
[R1]: https://bsky.app/profile/jburnmurdoch.ft.com/post/3mx2kxoezbk2x
[R2]: https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://did:plc:ho34pe25d3ywc6g6vxugre2i/app.bsky.feed.post/3mx2kxpixo22x
[R3]: https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:ho34pe25d3ywc6g6vxugre2i/bafkreibwjrtlox77m5uow2jkcqw5frdjkhzfwajay3f2r4lx4ieals3cwu
[R4]: https://www.sciencedirect.com/science/article/pii/S1051137724000020
[S1]: https://www.theguardian.com/news/datablog/2013/dec/11/families-spend-489-each-week-on-what
[S2]: https://docs.google.com/spreadsheets/d/1NDjuZYCNxPJDxxzQOSYNP06KLLSmZ0HMFo4-BdWjB2U/edit?usp=sharing
[S3]: https://charts.datawrapper.de/LJAtF/
[S4]: https://charts.datawrapper.de/oLGXj/
[S5]: https://charts.datawrapper.de/Zah29/
[S6]: https://www.ons.gov.uk/ons/rel/family-spending/family-spending/2013-edition/index.html
[P1]: https://www.theguardian.com/news/datablog/2013/dec/12/uk-median-weekly-pay-is-517-but-who-earns-that
[P2]: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2013-12-12
[P3]: https://docs.google.com/spreadsheets/d/1EKVhUrh3owFBNQAf6WWe84sbUU-z50SVDimP5vwjm7E/edit?usp=sharing
[P4]: https://www.theguardian.com/news/datablog/interactive/2013/dec/12/compare-average-earnings-across-the-uk-interactive
[G1]: https://threadreaderapp.com/thread/1750849189834022932.html
[G2]: https://pbs.twimg.com/media/GEw1o3PXEAA4FDZ.jpg
[G3]: https://pbs.twimg.com/media/GEw5Pe8XUAAUJjL.png
[G4]: https://pbs.twimg.com/media/GEw64XLWAAA5t-p.png
[G5]: https://pbs.twimg.com/media/GEw8EHsXcAARJn9.jpg
[G6]: https://pbs.twimg.com/media/GEw88woX0AA9fhZ.png
[G7]: https://gss.norc.org/get-the-data/stata.html
[G8]: https://www.britishelectionstudy.com/data-object/british-election-study-combined-wave-1-30-internet-panel/
[I1]: https://www.theguardian.com/business/datablog/2025/mar/22/egg-prices-us-inflation-cost
[I2]: https://i.guim.co.uk/img/media/daa266a3230acbf87a542d013dd3fd1337d030a2/0_0_3325_8348/master/3325.jpg?width=1600&dpr=1&s=none&crop=none
[I3]: https://www.bls.gov/charts/consumer-price-index/consumer-price-index-average-price-data.htm
[I4]: https://www.bls.gov/bls/linksite.htm
[F1]: https://www.ft.com/content/a2901ce8-5eb7-4633-b89c-cbdf5b386938
[T1]: https://seeing-theory.brown.edu/regression-analysis/
[T2]: https://seeing-theory.brown.edu/regression-analysis/data/anscombe.csv
[T3]: https://seeing-theory.brown.edu/regression-analysis/data/iris.csv
[T4]: https://seeing-theory.brown.edu/regression-analysis/regression.js
[T5]: https://github.com/seeingtheory/Seeing-Theory/blob/master/LICENSE
[B1]: https://bost.ocks.org/mike/example/
[B2]: https://bost.ocks.org/mike/example/montage.png
[B3]: https://bl.ocks.org/mbostock/raw/3795544/be9b41dab7ed59b4a150e6364cd5d9f0252c9738
