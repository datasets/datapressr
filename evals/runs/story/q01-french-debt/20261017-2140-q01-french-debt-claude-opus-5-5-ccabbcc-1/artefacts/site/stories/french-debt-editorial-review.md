---
title: "Editorial review: Why French Debt Keeps Climbing"
description: "Final editorial review record for the french-debt story draft (self-review, blind run)."
publish: false
---

# Editorial review: Why French Debt Keeps Climbing

Template: `skills/story/references/editorial-review.md`. Saved in `site/stories/` rather than `docs/reviews/` because this run puts every file it produces in `site/stories/`.

## Review identity and revision

- **Story and intended audience:** "Why French Debt Keeps Climbing", answering "Why is there a French debt crisis?" for a general reader who follows the news but not national accounts.
- **Reviewer identity, date and independence:** review: self (blind run, no reviewer available). 2026-10-17. The reviewer wrote the outline, charts and prose, so this is **not** the independent review the skill requires. The skill's final gate therefore stays open for an independent agent before any handoff for shipping.
- **Reviewed Git commit:** `8e9134e` (prose commit).
- **Input manifest (SHA-256):**
  - `site/stories/french-debt.md` `f604cd8a7bf1dba1966bba4192050496039500ee9a7b9413043056f98ab85be9`
  - `site/stories/french-debt-outline.md` `9ea2f004296254988105c127cb1f51ea564b9c6e9f31ddf8b3e3211e359c14a3` (approved round 2 at `02d840b0…`; link-syntax-only change recorded in the outline review addendum)
  - `site/stories/french-debt-make-charts.mjs` `cbfef82fb6851bdcf798ac48d411e68f4d0e55c1afff95073fcb2da5d408010c`
  - `site/stories/french-debt-ratio.svg` `6143c8e48c9bad446fe31a4b02118178072bc1cab9603742c53c194c372846ec`
  - `site/stories/french-debt-deficit.svg` `b546dba0a0ccd54679c3ca4abc894edb7b911ab1b308cf324bd50dca2809826e`
  - `site/stories/french-debt-peers.svg` `7074aacbe36d15cccef6cac917ac029926a6cf7767bdd38b970bdf7e4e507f4d`
  - `site/stories/french-debt-functions.svg` `a2c3bb93edc598c45025b431fd6bcd63349a0915ad8259ff074954133a603697`
  - `site/stories/package-lock.json` `2a5ca38400cf98b2e9a0dec48269f5b249e6dd96d19a1c462b2c123382817bcb`
  - `datasets/france-public-finances/data/fiscal-accounts.csv` `5d03664891a916ada144ef29895f6e8940ad254ad3e56c00d7c014454a9b0733`
  - `datasets/france-public-finances/data/quarterly-debt.csv` `bde7e6e1f2663b9156bf72b1d7f71a089929f679c7d888c91cf436dd5e0d2307`
  - `datasets/france-public-finances/data/spending-functions.csv` `2387b6d41aa566a863b0e761889a99cb9acda23ed020e06e228972b390f9a494`
  - External sources: the archived snapshot in `datasets/france-public-finances/archive/` (`manifest.json`, retrieved 2026-10-08), including the INSEE articles n° 2106, n° 2093 and Informations Rapides n° 239.

## Reader questions — written before rereading the draft

1. How big is French debt and how fast has it grown? → **Answered**, lead and chart 1 (60.5% → 119.0%, €3.6 trillion).
2. Is it overspending or undertaxing? → **Answered**, chart 3 section: highest revenue and higher spending still.
3. How does France compare with Germany, Italy and Spain? → **Answered for flows**, with the limit stated: "The dataset has no debt figures for the other countries."
4. Is it pensions? → **Answered with caveat**, chart 4: old age 11.0 → 13.4, health 6.9 → 8.9, INSEE's "portée par les retraites et la santé", and "not which part caused the deficit".
5. Is interest the problem? → **Answered**: rising (1.3% → 2.2%, €30bn → €67bn), but most of the 2025 deficit (2.9 of 5.1 points) is not interest, and interest was a larger share in 1995–2001.
6. Why is it called a crisis now (markets, ratings, politics)? → **Missed by design, stated**: final paragraph says the data has no bond yields, credit ratings or votes in parliament. Reader consequence: anyone who wants the market story has to look elsewhere; the title says what the story answers instead.
7. When did France last balance its books? → **Partly answered**: not since at least 1995 (series start); the last surplus before interest was 2001.
8. Is it getting better? → **Answered**: deficit 5.8% → 5.1% in 2025, but the ratio has risen from 109.5% to 119.0%.

## Evidence and editorial findings

| Dimension | Findings |
|---|---|
| Reader interest and coverage honesty | Finding: France has borrowed every year since at least 1995; shocks set the steps; the gap is mostly before interest. Title answers the question as far as the data can, and the crisis limit is stated. Coverage: annual data 1995–2025 (Eurostat, July and September 2026 vintages), quarterly debt to 2026-Q2 (INSEE, 29 September 2026), function data to 2024 (provisional; 2025 empty). The prose dates every figure; 2024 function values are marked provisional on the chart. |
| Evidence and calculations | Every prose number reproduced in the outline review scan (round 1 table) from the three CSVs by primary key with `d3-dsv`. Added for the prose: "1995–2001 interest larger than now" (D41PAY PC_GDP 3.5, 3.6, 3.6, 3.4, 3.1, 3.0, 3.1 vs 2.2 in 2025); "ratio kept edging up between shocks" (2010-Q4 86.3 → 2019-Q4 98.2; 2000-Q1 60.5 → 2007-Q4 65.5, with small dips in 2001 and 2006–07). External figures checked against the archived INSEE pages: n° 2106 attributes the rise in interest to "la hausse de l'encours de dette et de la remontée des taux d'intérêt depuis 2022"; n° 2093 headline "Une hausse des dépenses publiques portée par les retraites et la santé"; €64.7bn interest is in the dataset README's reconciliation (INSEE before-FISIM convention). An automated scan found every prose number in the SVG text except the two listed exemptions (2022, €64.7bn) and the publication numbers n° 2106 and n° 2093. |
| Argument and counterevidence | Prose matches the approved argument and beat order. Counter-numbers present: the 2021–2023 fall to 109.5%, interest larger in 1995–2001, Italy and the EU also in deficit every year, total spending share almost flat since 1995, 2025 deficit smaller than 2024. Causal language: "The shocks made the steps" is accounting (deficits add to debt), not a claim about why the shocks happened; mechanisms for interest and spending are attributed to INSEE with links. "Between the shocks … kept edging up" is a description of chart 1 not stated word for word in the outline; it is consistent with beat 1 and the data. |
| Charts as visible evidence | Each chart traced to its rows in the script (`one()` throws on a missing or duplicate key; chart 2 asserts the stack equals `B9` each year; chart 4 asserts the 2024 total is still flagged `p`). Zero baselines on charts 1 and 2; chart 3's axis starts at 40, said in the axis label and alt text; chart 4 starts at 0. Direct labels and coloured key words, no legends. Alt text gives key values for all four. **Not inspected visually**: no supported rasteriser in this workspace. Checked from SVG source instead: all four 720 px wide (`viewBox` 0 0 720 × 420/440/340/490); label coordinates compared against line, bar and dot positions, which led to fixes before the chart commit (2020 band label moved off the line, y-domain raised to 140, duplicated France labels removed, long row label shortened). Phone width (~360 px, text ≈ 6 px) is untested and is the main open chart risk. |
| Writing and house voice | 674 words (excluding frontmatter, alt text and friction notes; within 300–700). Leads with the chart and the finding. Short declarative sentences, numbers with units, no editorialising adjectives, no rhetorical questions, British spelling. No chart narration beyond the cited points. Possible edit for the voice pass: "The shocks made the steps" is compact but leans on the chart's metaphor; keep only if the author likes it. |
| Reproducibility and draft readiness | `node french-debt-make-charts.mjs` run twice after the prose commit: SVG hashes identical and equal to the committed ones; `grep -E 'NaN|Infinity|undefined|=>'` finds nothing. Links: dataset and `build.ts` are absolute GitHub URLs; chart script, outline and SVGs are relative and resolve; INSEE links match the archive manifest. MDX compile (`@mdx-js/mdx` + `remark-gfm`) passes for prose, outline and outline review. Frontmatter: `publish: false`, `datahub.slug: why-french-debt-keeps-climbing`, `status: draft`. Licences named in "How this was made". The dataset's own `build.ts` was not re-run (missing `jsdom`, no network); its validator passes. Index links and DataHub publishing skipped as instructed. |

## Outcome

- **Strongest objection:** the reader asked about a *crisis*, which in the news means bond markets and politics, and the story cannot see either. A reader may feel the question was swapped. Addressed adequately: the title answers the question the data can answer, and the final paragraph names what is missing. Not blocking.
- **Most valuable revision (optional):** test the charts at ~360 px in a browser; chart 2's right-hand annotation and chart 3's two text columns are the most likely to be cramped. Disposition: cannot be done in this workspace; left for the independent reviewer.
- **Verdict:** `APPROVED` (self-review, blind run).
- **Required corrections:** none.
- **Acceptable limitations recorded:** charts not inspected visually; dataset at `status: archived` with its parser review outstanding; dataset build not re-run here.
- **Re-review:** not needed for this round.
- **Outstanding stages:** (1) the independent final editorial review the skill requires (a self-review does not clear that gate); (2) the author's voice pass; (3) owner publication approval. This record does not authorise publishing.
