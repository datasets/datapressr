---
title: "Editorial review: France Never Closed the Gap"
description: "Final editorial review record for the french-debt story (step 4 gate)."
publish: false
---

# Editorial review: France Never Closed the Gap

Saved in `site/stories/` rather than `docs/reviews/` because this run puts every file there.

## Review identity and revision

- **Story and intended audience:** `site/stories/french-debt.md`, for a general reader who has heard of a "French debt crisis" and wants to know why it exists.
- **Reviewer:** review: self (blind run, no reviewer available). The story's author ran the template on 2026-10-18. **This is not independent:** the reviewer wrote the artifacts.
- **Reviewed Git commit:** `c569296` (round 1).
- **Input manifest (SHA-256):**
  - `site/stories/french-debt.md` `e2d49b999af65be1b5d111c2a7522fa35e1603df1b9bd9ae7b464d0b1682d98e`
  - `site/stories/french-debt-outline.md` `37c245b914bbdda2885296491dc756972e8919e7e1b2d829a033cb88fc874224` (approved in round 2 of `french-debt-outline-review.md`, revision `5903277`)
  - `site/stories/french-debt-make-charts.mjs` `69ca4d6ec2ae6e0f445e6c4ae332a76ab9f6ca44e0913f2fb17ea0d71434a466`
  - `french-debt-ratio.svg` `2de44492dbad1166874749f9e1af3141dfbc4fb9dfeaeb04e261bb189ab702ee`
  - `french-debt-borrowing.svg` `9ef8612fe59fb566228ae3e35ce1e5dd2e215760f549e4437db953d860d336a3`
  - `french-debt-revenue-spending.svg` `73ebbf9f9ee33cac5402f5054f61b883db60c95af9c280c54caf2c06daf52849`
  - `french-debt-spending-change.svg` `8c5c07b2ba6a511a21d080a1ac4ac424d4caed6dc677390def7262884627d0be`
  - `site/stories/package-lock.json` `2a5ca38400cf98b2e9a0dec48269f5b249e6dd96d19a1c462b2c123382817bcb`
  - `fiscal-accounts.csv` `5d03664891a916ada144ef29895f6e8940ad254ad3e56c00d7c014454a9b0733`, `quarterly-debt.csv` `bde7e6e1f2663b9156bf72b1d7f71a089929f679c7d888c91cf436dd5e0d2307`, `spending-functions.csv` `2387b6d41aa566a863b0e761889a99cb9acda23ed020e06e228972b390f9a494`
  - External: Eurostat `gov_10a_main` (update 2026-07-21) and `gov_10a_exp` (2026-09-16); INSEE quarterly debt release of 2026-09-29; INSEE Insee Première n° 2106 (May 2026) and INSEE blog explainer, all archived in `datasets/france-public-finances/archive/` per `manifest.json`.

## Reader questions — written before rereading the draft

1. How much does France owe, and is that unusual? → **answered** (lead: 59.7% → 119.0%, €3.6 trillion). "Unusual" is only partly answered: other countries' debt levels are not in the dataset, so the comparison is on deficits.
2. Why does the debt keep rising: low taxes, high spending or crises? → **answered** (three sections: crisis steps, deficit every year, revenue above neighbours).
3. What does the money go on? → **answered** (old age 13.4% of GDP, social protection 23.7%; change chart).
4. Is the interest bill the problem? → **answered** (2.2 of 5.1 borrowed; interest rising again).
5. How does France compare with its neighbours? → **answered** for revenue, spending and deficit.
6. Is it getting better? → **answered** (deficit narrowed from 5.8% to 5.1%, attributed to INSEE; ratio still rising).
7. What is the "crisis" part: markets, politics? → **missed, stated openly** in paragraph 2. The reader knows the scope.

## Evidence and editorial findings

| Dimension | Findings |
|---|---|
| Reader interest and coverage honesty | Finding: the debt doubled because the deficit never closed, and the cause is not low revenue. That answers the question's "why" at the level the accounts allow. Coverage: annual 1995–2025, quarterly to 2026-Q2 (latest), COFOG to 2024 (provisional); all stated in the method section. The title is a claim the evidence supports. |
| Evidence and calculations | A fresh CSV scan (`d3-dsv`, keyed lookups) reproduced 74 values plus booleans: deficit in all 31 years; 23 years > 3%; 26 years worse than EU27; borrowing > interest every year since 2002; Q4 ratio rising 2008–2017; Q4 debt in euros rising every year (2020–23: 2,663.9 / 2,828.8 / 2,955.6 / 3,103.2); old age (13.4) and health (8.9) are the two largest of the 18 categories; "more than half" = 2.9/5.1 = 0.57; "more than a third" = 1.6/4.4 = 0.36. INSEE text checked in the archive: "169,1 Md€ en 2024 … après 5,8 %"; interest rise from "hausse de l'encours de dette et de la remontée des taux d'intérêt depuis 2022"; 3% Maastricht criterion in the blog. **Error found:** see correction 1. |
| Argument and counterevidence | The prose matches the approved argument. Counter-numbers present: spending 56.1 → 57.3 (no surge), deficit narrowing, interest below its 1996 level, the 2020–23 ratio dip. Causal language: "Debt grows when the state borrows" is accounting. Mechanisms (rates, indexation, revenue measures) are attributed to INSEE with links. "Why old-age and health spending grew" is explicitly not answered. Strongest alternative reading: Italy pays more interest yet runs a smaller deficit. It is not in the prose, but that reading supports the argument rather than weakening it. Acceptable. |
| Charts as visible evidence | Every chart is traced to its rows by keyed lookups that throw if a row is missing. Labels, units ("% of GDP", "points of GDP") and dates are on the charts; zero baselines on charts 1, 2 and 4; chart 3 is a dot plot on [40, 60]. Every prose number except the listed exemption (5.8%, attributed) appears in the SVG text, checked by script. **Not inspected visually:** the harness forbids rasterising. The SVG source check covered `viewBox` 720 × 420/430/310/460, an estimated bounding-box pass (no clipping; no label–label overlaps; no label crossing the chart-1 line after fixes) and tick text. At ~360px phone width the 12px text scales to ~6px and 11px footnotes to ~5.5px: small, legible only on high-DPI screens. This is a recorded limitation, not a pass. |
| Writing and house voice | Leads with the chart and finding. Short declarative sentences, no editorialising adjectives, no rhetorical questions, British spelling. 666 words in round 1 (excluding frontmatter, alt text and friction notes), within 300–700. "Two steps account for most of the rise" is supported by +18.6 and +16.7 of +59.3. |
| Reproducibility and draft readiness | Two rebuilds byte-identical to the committed SVGs (`cmp` against the commit-time hashes). Links: absolute GitHub URLs for the dataset and `build.ts`; relative links only for the story's own files, all resolving. Frontmatter has `publish: false`, `datahub.slug: france-never-closed-the-gap`, `status: draft`. Licence attribution: Eurostat and INSEE are named with links. |

## Outcome — round 1

- **Strongest objection:** the question presumes a "crisis", and the story answers only the fiscal-arithmetic part. A reader looking for why markets or politics turned now gets no answer. It is adequately addressed: paragraph 2 says so plainly, and the data holds nothing on it. Not blocking.
- **Most valuable revision (required):** fix the misstatement in "What grew, and what made room" (correction 1). It is the only claim not matching the data.
- **Verdict: CHANGES_REQUIRED**
  1. `french-debt.md`, section "What grew, and what made room": "The largest fall, 1.6 points, was in interest on the debt" is wrong. The largest fall among the 18 mutually exclusive categories is general public services (−2.1); debt interest (−1.6) is a group inside it, as chart 4 shows ("of which debt interest −1.6"). Fix: "The largest fall, 2.1 points, was in general public services, and 1.6 of that was interest on the debt, even as the debt grew." Verify: both numbers appear in `french-debt-spending-change.svg` text.
- **Outstanding human stage:** author's voice pass and owner publication approval. Agent approval only permits draft handoff.

## Re-review — round 2

- **Revision reviewed:** commit `b53a981`; changed file `site/stories/french-debt.md` SHA-256 `5c409ad3d06e5fc46481b04092148dc182996bacd0f584e055d54e0ae55ea7af`. Outline, chart builder, SVGs and data are unchanged from round 1 (hashes above).
- **Correction 1:** resolved. The sentence now reads "The largest fall, 2.1 points, was in general public services, and 1.6 of that was interest on the debt". Both numbers are in `french-debt-spending-change.svg` ("−2.1", "of which debt interest −1.6"). The next sentence now names its subject ("The interest fall alone…"), and 1.6/4.4 = 0.36 still supports "more than a third".
- **Diff check:** `git diff c569296 b53a981 -- site/stories/french-debt.md` touches only that paragraph. No claim, chart or method change, so the outline gate does not reopen.
- **Re-run:** 666 words; prose numbers missing from chart text: only "16" (part of the date "16 September 2026" in the method) and "5.8" (exempt, attributed to INSEE); all local links resolve.
- **Verdict: APPROVED** for draft handoff, with the recorded limitations: self-review (not independent) and charts checked from SVG source only, not rendered.
- **Outstanding human stage:** author's voice pass and owner publication approval.
