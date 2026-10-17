---
title: "Editorial review: Oil Went Below Zero for One Day, in One Place"
description: "Final editorial review record (step 4 gate) for the oil-below-zero draft, using skills/story/references/editorial-review.md."
publish: false
---

# Editorial review: oil-below-zero

Saved in `site/stories/` rather than `docs/reviews/` because this run puts every file it produces in `site/stories/`.

## Review identity and revision

- **Story and intended audience:** "Oil Went Below Zero for One Day, in One Place". For a general reader who remembers the April 2020 headline and wants to know why it happened.
- **Reviewer identity, date and independence:** review: self (blind run, no reviewer available). The agent that wrote the story ran this review on 2026-10-18. It is **not independent**, and the gate is only as strong as a self-review.
- **Reviewed commits:** round 1 `818b7a5`; round 2 `7c4270f`.
- **Input manifest (round 2):**

| file | SHA-256 |
|---|---|
| `site/stories/oil-below-zero.md` (round 1, `818b7a5`) | `589377f645081623768a30a0311d993d9a3c213fe007b42de48459e5937ba5ad` |
| `site/stories/oil-below-zero.md` (round 2, `7c4270f`) | `dc66d02f9d16b144ac06b54a4c38952dddc7473dc22a79b1933ae7cf21af3734` |
| `site/stories/oil-below-zero-outline.md` (approved, `ac79a0c`) | `2333094f4a92fbcf9923dcc46785878a214de7b9d53b5b981a3e186b4eecdacd` |
| `site/stories/oil-below-zero-make-charts.mjs` | `8b2c6a1bb44eb4c4c8e7429e4358f1572582d8239544512226a3fee84788a623` |
| `site/stories/oil-below-zero-daily.svg` | `da26688faa54b457bb05c983aab6e250615b37471d603301840c71240262cc32` |
| `site/stories/oil-below-zero-averages.svg` | `d756b7edf77391cb89357a3852540ed9dc7f40261afeac9f48f9ccdf08f1d902` |
| `site/stories/package-lock.json` | `2a5ca38400cf98b2e9a0dec48269f5b249e6dd96d19a1c462b2c123382817bcb` |
| `datasets/.../oil-prices/data/wti-daily.csv` | `fe4e07893cfdba6905e8a955cb630308668ce760af21b351de005df2c5228dd1` |
| `datasets/.../oil-prices/data/brent-daily.csv` | `a4d463ad97ce678cfa5ae2e92f5eabcae7b589a6b4c790631e20b2f50969a19b` |
| `datasets/.../oil-prices/data/wti-weekly.csv` | `19a2ae03f5d6dd4879c9462e039a1eb25044a44d8994404c6b93b86747a401fb` |
| `datasets/.../oil-prices/data/wti-monthly.csv` | `3f2ea990044bc1df25dff8ad91bf224a6cda5bb5fc3ca8486061a40c23a2a696` |

The EIA snapshot was retrieved on 2026-09-05 (`archive/PROVENANCE.md`). The outline was approved in [`oil-below-zero-outline-review.md`](oil-below-zero-outline-review.md), round 3. The external sources (EIA *Today in Energy*, IEA April 2020 report, ICE contract page) were not available offline. No version of them was inspected.

## Reader questions — written before reading the draft

1. What does a negative oil price mean? → **Answered**, in the lead ("sellers paid buyers to take it") and in "Why WTI".
2. Was it all oil? → **Answered.** WTI at Cushing only; Brent $17.36.
3. How long did it last? → **Answered.** One day; $8.91 on 21 April.
4. Why did it happen? → **Answered, attributed.** EIA, IEA and ICE; the draft says the data cannot test it.
5. Is it the −$37 I remember? → **Answered.** −$37.63 futures settlement vs −$36.98 EIA spot.
6. Had it happened before? → **Answered.** The only value at or below zero in 10,236 daily prices since 1986.
7. Did it change what oil cost that month? → **Answered**, with the right limit: averages of spot quotes stay positive, and the draft says this is not what buyers paid.
8. Did it make petrol cheaper? → **Missed.** It is out of scope and not in the data. The consequence is minor, because the story never implies a retail effect.

## Evidence and editorial findings

| Dimension | Findings |
|---|---|
| Reader interest and coverage honesty | The finding is that the negative price was narrow: one inland benchmark, one day, gone once averaged. The title and lead follow from chart 1. The source covers 1986/1987 to 2026-09-01 and was retrieved 2026-09-05; the story is historical (2020) and says so. Nothing is presented as current. |
| Evidence and calculations | Reproduced with [`oil-below-zero-outline-scan.mjs`](oil-below-zero-outline-scan.mjs), which is independent of the chart builder, against the CSVs above. WTI 2020-01-02 61.17, 04-17 18.31, 04-20 −36.98, 04-21 8.91. Brent 67.05, 19.75, 17.36, 9.12 on the same dates. Brent all-time min 9.10 on 1998-12-10. WTI ≤ 0: one row. Brent ≤ 0: none. Row counts 10,236 and 9,967. Weekly price for the week ending 2020-04-24 is 3.32 (mean of 5 daily = 3.324); monthly price for 2020-04-15 is 16.55 (mean of 21 daily = 16.548). WTI weekly, monthly and annual minimums are 3.32, 11.35 and 14.42, all positive. Falls: 70.1% WTI and 70.5% Brent, over the same dates. Units: nominal US$/barrel, FOB. Missing values: none in source; holiday gaps are left as gaps. **External figures not verified** (−$37.63, 21 April expiry, Brent cash settlement, IEA demand), because there is no network; the prose friction notes flag them. |
| Argument and counterevidence | The prose matches the approved outline beat for beat. The strongest counter-number, Brent at $9.12 within 2 cents of its record low, is in the prose. Causal language: the "Why" section is attributed throughout and ends with "This dataset cannot test that explanation". Round 1 found "The negative price did not last past the next trading day" (line 38 of `818b7a5`), which wrongly implies it was negative on 21 April too; corrected below. The wrinkle's closing line was already reworded before commit so that it does not attribute a Brent comparison to the EIA. |
| Charts as visible evidence | Both charts trace to the rows by key, and `on()` throws if a row is missing. Zero lines are present. The y-domains [−50, 80] and [−45, 55] include every labelled value. Weekly prices are drawn as `step-before` steps dated to the week-ending Friday; monthly prices as month-long segments, not points on the 15th. The two resources are never joined. The alt text gives the key values. Every prose data number was found by `grep` in an SVG or is on the exempt list. **Visual rendering not inspected:** this run cannot rasterise SVG. Instead, label `translate` coordinates were checked against the line values. Chart 1's Brent start label was moved off the y-axis title and clear of its line before the charts commit. Phone width is unchecked. This is a known open limitation, not a pass. |
| Writing and house voice | The prose leads with the chart and one line. It has no editorialising adjectives, rhetorical questions or second person. It uses British spelling and keeps the method last and short. 570 words after round 2 (571 at round 1; 300–700, excluding frontmatter, alt text and friction notes). Round 1: "Brent is a waterborne crude, loaded onto tankers at sea" is inaccurate, because Brent loads at terminals, not at sea; replace it. |
| Reproducibility and draft readiness | `node oil-below-zero-make-charts.mjs` ran twice and both builds gave the same hashes as the committed SVGs. Local links resolve: both charts, the build script, the outline and both review files. The dataset and `build.ts` links are absolute GitHub URLs, assuming `datasets/datapressr`, unconfirmed with no remote. The EIA acknowledgement with publication date ("Sep 2026") is present. Frontmatter has `publish: false` and `datahub.status: draft`, with a slug that is not a dataset name. Index links and publishing are skipped by the task. |

## Outcome

- **Strongest objection:** the *why* rests entirely on three external sources cited from memory and not checked in this run. If a URL or the −$37.63 figure is wrong, the attribution misleads. This is not blocking for a draft handoff, because the prose labels the explanation as attributed and untested, and the friction notes say to verify the sources before publishing. It is blocking for publication.
- **Most valuable revision:** optional. Verify the three URLs and the −$37.63 settlement figure against the live sources before any owner approval.
- **Round 1 verdict (`818b7a5`): CHANGES_REQUIRED**
  1. `oil-below-zero.md`, "Why WTI" last paragraph: "The negative price did not last past the next trading day" implies it was still negative on 21 April. Change it to say the price was positive by the next trading day. Verify that the sentence agrees with chart 1's "Tue 21 Apr: WTI $8.91".
  2. `oil-below-zero.md`, "What this is": "loaded onto tankers at sea" is inaccurate. Change it to a plain description: a North Sea crude that moves by tanker.
- **Re-review (round 2, `7c4270f`, prose SHA-256 `dc66d02f…af3734`):** correction 1 now reads "By the next trading day the price was positive again." Correction 2 now reads "Brent is a North Sea crude that moves by tanker." Neither change touches a number, chart or claim beyond the outline. **Verdict: APPROVED** (self-review, with the external-source and visual-rendering limits above recorded as open).
- **Outstanding human stages:** the author's voice pass (skipped in this run, with no human author) and owner publication approval. This approval permits draft handoff only.
