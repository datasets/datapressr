---
title: "Editorial review: Oil Went Below Zero for One Day"
description: "Final editorial review of the oil-below-zero story draft (skill step 4), using the story skill's editorial-review template."
publish: false
---

# Editorial review: oil-below-zero

Saved in `site/stories/` rather than `docs/reviews/` because this run puts every file it produces in `site/stories/`. Not for publication.

## Review identity and revision

- **Story and intended audience:** "Oil Went Below Zero for One Day, in One Place" (`oil-below-zero.md`), for a general reader who remembers the April 2020 headline and wants to know what actually happened and why.
- **Reviewer:** review: self (blind run, no reviewer available). The author of the outline, charts and prose, Claude Opus 5.5 in the same session, reviewing on 2026-10-18. **Not independent.** The blind-run harness provides no subagent or second model, so the author ran the full template against the committed revision.
- **Reviewed Git commit (round 1):** `08a70dfe5735b3fe8f5e44aadee9870ad5ed9ee6`
- **Input manifest (round 1), SHA-256:**
  - `site/stories/oil-below-zero.md` `7f51a039ab61d8e5dae1ec0155ac3337de67d3ee55b62ec0256eb51b3f9d1b0d`
  - `site/stories/oil-below-zero-outline.md` `ab98cb05a7a6f3a0e2e8e29c862e32f35b147697250aa84848a7215014d4db8d` (approved in outline review round 2, commit `294e240`; a later commit fixed only the review record's tally)
  - `site/stories/oil-below-zero-make-charts.mjs` `30e8ee761c5411dad7d5151463ba83271affb9ad442922c1e4bea7f98b962ac6`
  - `site/stories/oil-below-zero-only-wti.svg` `c6f3292947d7837281701bc04e14f6dd6235d0cfebd778455a85f79bfa7cd3f2`
  - `site/stories/oil-below-zero-averages.svg` `5068c84cdb3a54fd82e44acd7b91c5508b84e0639cfc4fba1e75b181bfb50df6`
  - `site/stories/package-lock.json` `2a5ca38400cf98b2e9a0dec48269f5b249e6dd96d19a1c462b2c123382817bcb`
  - `datasets/energy-and-commodities/oil-prices/data/wti-daily.csv` `fe4e07893cfdba6905e8a955cb630308668ce760af21b351de005df2c5228dd1`
  - `.../wti-weekly.csv` `19a2ae03f5d6dd4879c9462e039a1eb25044a44d8994404c6b93b86747a401fb`
  - `.../wti-monthly.csv` `3f2ea990044bc1df25dff8ad91bf224a6cda5bb5fc3ca8486061a40c23a2a696`
  - `.../brent-daily.csv` `a4d463ad97ce678cfa5ae2e92f5eabcae7b589a6b4c790631e20b2f50969a19b`
  - External source: CFTC interim staff report (November 2020). **Not opened** (no network in this run).

## Reader questions — written before reading the draft

1. What exactly went below zero: all oil, or one price? → **answered** (lead, "What these prices are"). But see correction 1: "in one place" claims more than a two-benchmark dataset can show.
2. Why would anyone pay to get rid of oil? → **partly answered**: "Why it happened" gives the CFTC's account, which the data doesn't test and this run could not check.
3. How long did it last? → **answered** (one trading day; $8.91 the next).
4. Did other oil go negative too? → **partly answered**: Brent did not. Other crudes are not in the dataset, and the draft doesn't say so (correction 1).
5. Who paid whom? → **partly answered**: "sold at any price, even below zero" implies sellers paid buyers but doesn't say it outright. This is acceptable at this length.
6. Had it happened before, or since? → **answered** (only negative day in 10,236; pre-2020 low $10.25).
7. Why do I remember −$37.63? → **answered** (futures settlement vs EIA spot).
8. Did petrol become free? → **missed**, and out of scope. The dataset has no retail prices. Acceptable, though a reader may still wonder.

## Evidence and editorial findings

| Dimension | Findings |
|---|---|
| Reader interest and coverage honesty | The finding is that "the price of oil" going negative was one benchmark, for one day. This answers a question many readers still carry. Coverage: EIA daily spot data, 1986-01-02 → 2026-09-01, retrieved 2026-09-05 (`archive/PROVENANCE.md`). The draft is explicitly historical, not presented as current. **Overreach:** title and lead say "in one place" and "One price did". The dataset contains two benchmarks only, so it cannot show that no other crude price went negative (correction 1). |
| Evidence and calculations | Reproduced with `awk`, independently of the chart builder: WTI 10,236 rows, one negative (2020-04-20 −36.98), no missing values; Brent 9,967 rows, none negative, minimum 9.10 on 1998-12-10. 2020-01-02: WTI 61.17, Brent 67.05. 2020-04-17: WTI 18.31, Brent 19.75. 2020-04-20: Brent 17.36. 2020-04-21: WTI 8.91, Brent 9.12. 18.31 + 36.98 = 55.29. Falls of 70.07% and 70.54%, rounded to 70% and 71%, so "about 70%". `wti-weekly` 2020-04-24 is 3.32 (mean of five daily rows: 3.324). `wti-monthly` 2020-04-15 is 16.55 (mean of 21 rows: 16.5476). WTI pre-2020 minimum is 10.25 on 1986-03-31. WTI weekly minimum across the whole series is 3.32 and monthly minimum 11.35, which supports "a weekly or monthly chart shows no negative value". Units: US$ per barrel, nominal, FOB. External figure −$37.63 and the CFTC details are **not verified** (no network). |
| Argument and counterevidence | The prose matches the approved argument. Counter-numbers are present: Brent at $9.12, two cents above its low; averages. The 31 March Brent-below-WTI note is omitted, as the outline allowed. **Unsupported causal clause:** "with COVID-19 lockdowns cutting demand for fuel" is a causal claim with no named source (correction 2). The mechanism is attributed to the CFTC, and the draft says the data doesn't test it. The Brent explanation is correctly held back as untested. |
| Charts as visible evidence | Chart 1 is built from the `wti-daily` and `brent-daily` rows separately, with no join, a zero rule, and the domain [−45, 80] containing every marked value. Chart 2 uses daily line and dots; weekly segments from the previous Friday to the week-ending Friday; the April average as a 1–30 April segment; zero rule. Every prose data number appears in SVG text or on the exempt list (scripted check). Alt texts state the key values. **Visual check not done:** there is no rasteriser. From the SVG source: `viewBox 0 0 720 420`. Label coordinates were checked against data positions; the tightest gap is chart 2's "21 Apr: $8.91" label, about 8px from the daily line. The ~360px phone check is not done, and 12px text will render at about 6px there. This is recorded as a limitation. |
| Writing and house voice | Leads with the chart and one line. Short declarative sentences, no editorialising adjectives, no rhetorical questions, British spelling. 546 words by the skill's exclusions. The prose does not narrate the charts. Minor precision issues: "A weekly or monthly chart of oil prices" generalises beyond WTI and Brent (correction 3), and "lowest daily price on record" should name the record (correction 4). |
| Reproducibility and draft readiness | `node oil-below-zero-make-charts.mjs` was run twice and both SVGs matched the committed hashes. The SVGs contain no `NaN`, `undefined` or `=>`. Local links resolve; outside links are absolute GitHub URLs, as required for a site that publishes only `site/`. The MDX compile check passes. The EIA acknowledgement with date is present. Frontmatter: `publish: false`, `datahub.status: draft`, slug `oil-below-zero-one-day` (not a dataset name). Outstanding: human voice pass, owner approval, verification of the CFTC link and details. No index links, as this run skips them. |

## Outcome

- **Strongest objection:** the headline. "Oil Went Below Zero for One Day, in One Place" and "One price did, in one place" read as a claim that no other crude went negative, and a two-series dataset cannot support that. Blocking until scoped.
- **Most valuable revision (required):** scope the claim to the two benchmarks the data contains, in the title, lead and outline argument sentence. Disposition: see re-review.
- **Verdict (round 1):** `CHANGES_REQUIRED`
- **Required corrections:**
  1. `oil-below-zero.md` title and line 16 ("One price did, in one place, for one day"), plus the outline's argument sentence: limit the claim to the dataset's two benchmarks, and add the limit to the outline's "not about" list. Changing the argument sentence sends the outline back through step 2. **Verify:** no sentence implies that no other crude went negative.
  2. `oil-below-zero.md` line 26 ("with COVID-19 lockdowns cutting demand for fuel"): either attribute it or make it a statement of timing. **Verify:** no unattributed causal clause remains.
  3. Line 32 ("A weekly or monthly chart of oil prices"): name WTI. **Verify:** the claim matches `wti-weekly`/`wti-monthly` minimums of 3.32 and 11.35.
  4. Line 44 ("lowest daily price on record"): say "since the series began in 1987". **Verify:** `brent-daily` first row is 1987-05-20.
- **Outstanding human stage:** the author's voice pass and owner approval for publication. This agent review permits draft handoff only.

## Re-review

### Round 2

- **Reviewer:** as above (self, blind run, no reviewer available; not independent). Date 2026-10-18.
- **Reviewed Git commit:** `ce3b357c58d731c42cb52a7cfac4a0219c574f50`
- **Changed files, SHA-256:** `oil-below-zero.md` `75950408fb2fa2e029007c44afdf7d0473d3512cd3cf410e5f7f66afefa1c925`; `oil-below-zero-outline.md` `49e201ed738418e36c24291f9ff71bfc5ef343ac1bac1aa8ecc18fac8d1df3d4` (argument re-approved in outline review round 3, commit `daba6c2`). Chart script, SVGs, lockfile and data unchanged from round 1.
- **Correction by correction:**
  1. Resolved. The title is now "One Oil Benchmark Went Below Zero, for One Day". Line 16 reads "One of its two main benchmarks did, at one inland hub, for one day". Line 20 adds "The dataset holds these two benchmarks only, so it cannot say whether other crude prices went negative too". `grep "in one place"` finds nothing in the prose. The outline's argument sentence was scoped and re-approved (outline round 3).
  2. Resolved. Line 26 reads "weeks into COVID-19 lockdowns", which states timing, not a cause. `grep "cutting demand"` finds nothing.
  3. Resolved. Line 32 reads "A weekly or monthly chart of WTI shows no negative value at all", consistent with `wti-weekly` minimum 3.32 and `wti-monthly` minimum 11.35.
  4. Resolved. Line 44 reads "since the series began in 1987"; the first `brent-daily` row is 1987-05-20.
- **Re-checked:** 568 words under the skill's exclusions. The MDX compile passes. The scripted audit finds every prose data number on a chart SVG or in the exempt list, with no others. Local links resolve. The charts are unchanged, so the round-1 hashes and the two-build check still stand.
- **Strongest objection, re-assessed:** addressed. The claim is now bounded to what the dataset contains. The remaining limits are acceptable for a draft and recorded in the prose's friction notes: the CFTC source was not opened in this run, the charts were not inspected visually, and the phone-width check was not done. All three must be cleared by a human before shipping.
- **Verdict (round 2):** `APPROVED` for draft handoff only.
- **Outstanding human stage:** the author's voice pass; verification of the CFTC link and the details taken from it; a visual check at desktop and phone width; owner approval for publication.
