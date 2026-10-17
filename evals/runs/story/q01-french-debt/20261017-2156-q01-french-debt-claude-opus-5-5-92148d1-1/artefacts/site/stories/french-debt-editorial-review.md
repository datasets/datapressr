---
title: "Editorial review: France Has Run a Deficit Every Year Since 1995"
description: "Final editorial review of the French debt story, with the quick prose-against-outline check. Self-review in a blind run."
publish: false
---

# Editorial review: France Has Run a Deficit Every Year Since 1995

Saved in `site/stories/` rather than `docs/reviews/` because this run puts every file it produces in `site/stories/`.

## Review identity and revision

- **Story and intended audience:** `french-debt.md`, answering "Why is there a French debt crisis?" for a general reader who follows the news but not public accounts.
- **Reviewer:** review: self (blind run, no reviewer available). The reviewer is the author of the outline, charts and prose (Claude Opus 5.5, this session), 2026-10-18. **This is not independent.** The skill requires an independent agent for this gate. None was available, so the findings below are the author's best adversarial check, not an independent approval.
- **Round 1 reviewed commit:** `f38973e`. **Round 2 reviewed commit:** `513b406`.
- **Input manifest (round 2):**
  - `site/stories/french-debt.md`: `f15abfddfaf538a59f31e5f0e8e20e2e953a33514a9571fe25abc596aeee425f` (round 1: `a65aed838d9557dcd22a3d1ca5d3838462bab1f2fe23d2a3da3078d22f940250`)
  - `site/stories/french-debt-outline.md`: `1e17e081cbc9903c7b7d897676be530f331cac8cf6995a87ebed9b55b8fec068`. The argument was approved at commit `394bb4f`, file hash `1e698ba26afab215fbe6fb0fb50adc57bf86a974781ac602a859c94931d06622` (round 4 of the outline review). After that, only review records and the title changed.
  - `site/stories/french-debt-make-charts.mjs`: `d228ee80c81811f26f340c1ec1e44be2058f3fc20e1d982e08bd7053cbbb3d1a`
  - `french-debt-gap.svg`: `6fd3b49eb641504d1edc92e38bc0be0a4b1c04abc3ca649c896caa5b9ba8e744`
  - `french-debt-ratio.svg`: `f28b85bd0ed63b6fd0d5ff8ed213b084d143d9d2813a7ddf85b9f36d848112ef`
  - `french-debt-peers.svg`: `e899b79749f9ca816de4ad0dfc3eabef65d089f8b9a10686a999f5c5c7c106a7`
  - `french-debt-extra-spending.svg`: `0c6ac944bb0f5502aac4648d3c75d8f7688cfbe6faf0c3c444ff7ba5027acd06`
  - `site/stories/package-lock.json`: `2a5ca38400cf98b2e9a0dec48269f5b249e6dd96d19a1c462b2c123382817bcb` (`@observablehq/plot` 0.6.17, `jsdom` 30.0.1, `d3-dsv` 3.0.1; Node v26.4.0)
  - `datasets/france-public-finances/data/fiscal-accounts.csv`: `5d03664891a916ada144ef29895f6e8940ad254ad3e56c00d7c014454a9b0733` (Eurostat `gov_10a_main`, update 2026-07-21, retrieved 2026-10-08)
  - `datasets/france-public-finances/data/quarterly-debt.csv`: `bde7e6e1f2663b9156bf72b1d7f71a089929f679c7d888c91cf436dd5e0d2307` (INSEE release 2026-09-29, retrieved 2026-10-08)
  - External context: archived `insee-annual-accounts.html` (SHA-256 `362b2065…ec000b`) and `insee-spending-functions.html` (`12a53218…f245411`), per `archive/manifest.json`.

## Reader questions, written before reading the draft

1. How big is the debt now, and how fast has it grown? → **answered** (second section and chart 2: 60.5% in Q1 2000 to 119.0%, €3.6 trillion, in Q2 2026).
2. Is it because France taxes too little or spends too much? → **answered** (chart 3: highest revenue of the five, higher spending still).
3. What is the money spent on? Is it pensions? → **partly answered.** Chart 4 shows cash benefits (+2.9) and public pay (+2.1). The prose says the data cannot isolate pensions and cites INSEE on pension growth. The reader is told about the limit, so it does not mislead.
4. How does France compare with Germany, Italy and Spain? → **answered** (chart 3).
5. Is this new (Covid, recent governments) or long-running? → **answered** (31 deficits in 31 years, chart 1).
6. Why is it called a crisis *now*: markets, interest, politics? → **partly answered.** Interest growth is attributed to INSEE. The penultimate paragraph says the market and political side is outside the data. A reader wanting the 2024–2026 political story will need another source.
7. Is it getting better or worse? → **answered:** the deficit narrowed in 2025, but the debt ratio is at its highest.

## Evidence and editorial findings

| Dimension | Findings |
|---|---|
| Reader interest and coverage honesty | Finding: France's debt rises because it has run a deficit every year since 1995, and the gap is not low revenue but higher spending, mostly cash benefits and public pay. That answers the "why" the reader brings, in the only sense the data supports. Coverage: annual 1995–2025 (Eurostat snapshot of 21 July 2026, 2025 unflagged), quarterly debt to Q2 2026 (INSEE, 29 September 2026). Latest observation dated in the prose ("mid-2026", "in 2025"). Round 1 found the title misleading: "Has Not Balanced Its Books Since 1995" implies 1995 was balanced, but `B9` for 1995 is −5.1. Correction 1. |
| Evidence and calculations | Reproduced with a separate Python `csv` scan (outline review rounds 1–4) and re-checked for this draft: all 31 French `B9` 1995–2025 negative; smallest −1.3 (2000); −7.4 (2009); −8.9 (2020); 2025 TE 57.2, TR 52.1, B9 −5.1; 1995 TE 56.1, TR 50.9; 2025 TR/TE DE 47.9/50.5, IT 48.1/51.2, ES 42.9/45.3, EU27 46.4/49.5; B9 DE −2.7, IT −3.1, ES −2.4, EU27 −3.1; FR−EU item differences 2.9, 2.1, 1.0, 0.5, 0.5, 0.3, −0.7, residual 1.1, total 7.7; D62PAY 19.4 vs 16.5. Quarterly: 2000-Q1 60.5, 2007-Q4 65.5, 2009-Q4 84.1, 2019-Q4 98.2, 2020-Q4 114.9, 2023-Q4 109.5, 2026-Q2 119.0 / €3,595.5 bn (series maximum). Units are % of GDP throughout; differences are of 1-decimal source values. Attributed figures checked against the archived INSEE text: interest +14.3% (2025) after +13.2% (2024), "hausse de l'encours de dette et … remontée des taux d'intérêt depuis 2022"; pensions "principal facteur de hausse en 2024", indexed to past inflation; INSEE 2025 spending/revenue 57.3/52.2 (dataset README). A script compared every number in the prose against the SVG text: all present except the five listed as exempt. |
| Argument and counterevidence | Prose matches the approved argument. Counterevidence present: spending share barely changed since 1995 (56.1 → 57.2); deficit narrowed in 2025; debt ratio fell 2020–2023; interest only +0.3 above the EU. Round 1 found one causal drift: "did not fall back, *because* the deficit narrowed but never closed". The outline says "while", and 2020–2023 shows the ratio can fall despite deficits. Correction 2. "France does not collect too little" reads as a normative judgement. Correction 3 rewords it to the descriptive "Low revenue is not the explanation". Mechanisms (pensions, interest rates) are attributed to linked INSEE pages and the prose says the data cannot say which choice caused which deficit. Strongest alternative reading: the debt ratio's steps are partly a GDP fall (2009, 2020), not only borrowing. The prose does not spell this out; it is in the outline (beat 6). Acceptable at this length: the prose does not claim the steps are all borrowing. |
| Charts as visible evidence | Each chart traced to its rows in the builder (lookups by key, throws on missing; 31-year and 106-quarter completeness asserted; residual sum asserted). Chart 1: y 45–65, all four marked deficits from `B9` and equal to TR − TE. Chart 2: x includes the 2000 tick; y 50–125; shading labelled; source note says "not seasonally adjusted". Chart 3: dots on a common 40–60 scale (non-zero baseline acceptable for position marks), coloured headers as key, EU27 footnote. Chart 4: zero baseline, eight bars, FR vs EU values in brackets. Alt text states each chart's key values. **Visual inspection not done:** the workspace has no supported way to rasterise SVG. Checked from source instead: `viewBox` 720×400/400/316/356; label anchors computed from the SVG `transform`s against the plotted values (e.g. ratio chart: "end-2019: 98.2%" at y≈177 below the 2015–2019 line at y≈147–164; gap chart: the "2000: deficit 1.3%" label moved below the revenue line after a computed collision with the spending line). Phone width (~360px) not checked; at that width 12px text renders at about 6px. Limitation recorded, not resolved. |
| Writing and house voice | Lead is chart + one finding line. Short declarative sentences, units on every number, no exclamation marks, rhetorical questions or second person. British spelling. One mild metaphor ("lands on the stock of debt") labels an accounting fact. It does not argue for anything, so it can stay. "Interest adds only +0.3": "only" is justified by the comparison with +2.9 and +2.1. Word count 572 at round 2 (565 at round 1), excluding frontmatter, alt text and friction notes, within 300–700. Method last and short. |
| Reproducibility and draft readiness | `node french-debt-make-charts.mjs` run twice: SVG SHA-256s identical, and unchanged after round 2's prose-only edits. `grep -E 'NaN\|Infinity\|undefined\|=>'` on the SVGs finds nothing. Story and outline compile under `@mdx-js/mdx` + `remark-gfm`. Local links resolve (this review file is committed after the prose). External links are absolute GitHub URLs (dataset, `build.ts`) and INSEE pages. Frontmatter has `publish: false`, `datahub.status: draft`. Round 1: "re-running both reproduces every number here" was too broad, because the INSEE figures are not reproduced by the build. Correction 4. The dataset is `archived` (its own review outstanding), as the method says. Index links and publishing skipped by instruction. |

## Outcome

- **Strongest objection:** the question is about a *crisis*, and the story answers a narrower one: why the debt is high and still rising. A reader expecting bond spreads, ratings or the budget fights gets a paragraph saying those are outside the data. The objection is not blocking. The data cannot honestly support more, the narrowing is stated, and the accounting answer (persistent deficits, with spending and not revenue out of line with peers) is the part of "why" the data can show.
- **Most valuable revision (required, round 1):** the title. The old one implied France balanced its books in 1995. **Disposition:** resolved in `513b406`. The new title is "France Has Run a Deficit Every Year Since 1995", and the DataHub slug is now `france-deficit-every-year`.
- **Round 1 verdict (`f38973e`): CHANGES_REQUIRED.**
  1. `french-debt.md` title, H1 and slug: the title implies a balanced 1995 (`B9` 1995 = −5.1). Retitle. Verify: the title states a deficit every year.
  2. `french-debt.md`, "Every deficit adds to the debt", last sentence: "because" makes an unsupported causal claim and departs from the outline ("while"). Use "while". Verify by grepping the sentence.
  3. `french-debt.md`, "Not low taxes" first sentence: "France does not collect too little" is normative. Make it descriptive. Verify the rewording.
  4. `french-debt.md`, "How this was made": "reproduces every number here" includes the attributed INSEE figures. Limit it to the charts and dataset figures. Verify the rewording.
- **Re-review, round 2 (`513b406`; `french-debt.md` `f15abfdd…aee425f`, `french-debt-outline.md` `1e17e081…fec068`):** 1 resolved (title, H1, slug changed; outline title updated, with a note that the argument is unchanged); 2 resolved ("while the deficit narrowed but never closed"); 3 resolved ("Low revenue is not the explanation."); 4 resolved ("reproduces every chart and every figure drawn from the dataset"). No other text changed. Charts rebuilt with identical hashes. Word count 572. Prose numbers re-checked against the SVG text: unchanged. Reviewer: self (blind run, no reviewer available). **Verdict: APPROVED (self-review; the independence requirement of this gate is not met).**
- **Outstanding human stage:** the author's voice pass and owner publication approval. This self-approval does not change `status: draft` or authorise publishing.
