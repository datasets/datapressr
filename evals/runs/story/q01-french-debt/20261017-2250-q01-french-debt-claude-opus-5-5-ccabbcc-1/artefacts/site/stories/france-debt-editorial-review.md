---
title: "Editorial review: France Has Borrowed Every Year Since 1995"
publish: false
---

# Editorial review: France Has Borrowed Every Year Since 1995

## Review identity and revision

- Story and intended audience: `site/stories/france-debt.md`, written for a general reader who has seen headlines about French debt and wants to know why it is so high.
- Reviewer: self (blind run, no reviewer available). Reviewed on 2026-10-18 by the agent that wrote the outline, charts and prose. **Not independent.** The skill's gate requires an independent agent, so this record does not clear handoff for shipping. The blind-run instructions say to run the review in full and carry on, and this record does that.
- Round 1 reviewed commit `1ae6749`. Round 2 reviewed commit `d66aa25`.
- Input manifest (round 1, `1ae6749`):
  - `site/stories/france-debt.md` `ab7f12e15f0ddb9264381a41eeed341c7657f68e83d84d1d4447bf6cec3c2452`
  - `site/stories/france-debt-outline.md` `4c8f862afc8c2ecbad3adcf38009666d05ec16e378e182d914ceceddaa829dbf`. This is the approved revision `fea765af…` plus the friction-note approval line and the MDX link-syntax fix.
  - `site/stories/france-debt-outline-review.md` `8e92f86a665392f992e85407fe358a3092b7086cdba57e0b24d8a7a69ce266db`. Outline APPROVED in round 3 at `2a92e65`.
  - `site/stories/france-debt-make-charts.mjs` `8e421e94d1653e37fc4ae8c2729ba913a8404b6e39079ef8bd67dc4f1e37332d`
  - `france-debt-chart-debt.svg` `289219b7…3a47bf`, `-balance.svg` `38b2962d…a60bf8`, `-gap.svg` `607c5de4…a9fc4b`, `-interest.svg` `6eed15ee…92918d`
  - `datasets/france-public-finances/data/fiscal-accounts.csv` `5d03664891a916ada144ef29895f6e8940ad254ad3e56c00d7c014454a9b0733`, `quarterly-debt.csv` `bde7e6e1f2663b9156bf72b1d7f71a089929f679c7d888c91cf436dd5e0d2307`
  - `site/stories/package-lock.json` `2a5ca38400cf98b2e9a0dec48269f5b249e6dd96d19a1c462b2c123382817bcb`
  - External sources: the archived snapshots in `datasets/france-public-finances/archive/`, listed with their hashes in `manifest.json` (Eurostat updated 2026-07-21 and 2026-09-16; INSEE release of 2026-09-29; Insee Première 2106 and 2093).

## Reader questions (written before rereading the draft)

1. How large is French debt, and is it still rising? → **answered** (lead: 119.0%, €3.6 trillion, mid-2026).
2. Is this recent or long-running? → **answered** (lead and "Thirty-one deficits"). Round 1 found that the start date is ambiguous; see correction 1.
3. Does France tax too little or spend too much? → **answered** ("Not low taxes").
4. What is the extra spending on? → **partly answered**. The split is by economic type: cash benefits and public pay. Pensions cannot be separated out in this resource, and the INSEE 41% figure is attributed. A reader who wants pensions specifically does not get a number, and the prose does not imply one.
5. How does France compare with its neighbours? → **answered** (charts 2–4).
6. What does the debt cost each year? → **answered** (interest section).
7. Is it a crisis: markets, ratings, politics? → **missed by the data, and said plainly** in the last paragraph before the method.
8. Is anything improving? → **partly answered** (2025 deficit narrowing; INSEE's attribution).

## Evidence and editorial findings

| Dimension | Findings |
|---|---|
| Reader interest and coverage honesty | The finding is clear in the title and the first paragraph. Coverage: debt from 2000-Q1 to 2026-Q2 (INSEE release of 29 Sep 2026); annual accounts from 1995 to 2025 (Eurostat update of 21 Jul 2026). The latest observation is stated as "mid-2026". **Problem (correction 1):** the title and "in no year since 1995" read as if 1995 ended an earlier run of balanced budgets. In fact 1995 is where the French series in the dataset start, and the draft never says so. |
| Evidence and calculations | Every prose number was reproduced with a separate Python `csv` scan, not the chart builder (tables in `france-debt-outline-review.md`, rounds 1–2). Prose-only checks: €66.6bn / €29.7bn = 2.24, so "more than twice as much" holds. Cash benefits plus public pay = 5.0 of 7.7 points, so "most of that gap" holds. Units: % of GDP and current euros throughout. No missing values in the cited rows. Attributed figures were checked against the archived INSEE pages: "à hauteur de 23,0 Md€" (2106); "protection sociale … (41 %, 693 milliards" (2093); "indexées sur l'inflation passée" (both); 64,7 in the 2106 table, consistent with the dataset README's FISIM note. |
| Argument and counterevidence | The draft matches the approved argument sentence. The strongest counter-number, that a debt ratio can fall while deficits continue (2023-Q4 dip to 109.5%), is present. The draft avoids "deficits caused the debt to rise every year" and says "one constant". Other weakening numbers are present: the EU27 never balanced, the 2025 narrowing, interest below 1996 and Italy, Germany's −2.7. Causal language: the 2009/2020 jumps "coincide" with named events. Mechanisms are attributed to INSEE with links, and the sentence "They do not show which choices produced it" marks them as untested. |
| Charts as visible evidence | Each chart traces to rows by key, and the builder throws on a missing key. Labels carry units and the denominator (% of GDP; "France minus EU27 average, percentage points of GDP, 2025"). Charts 1 and 4 have a zero baseline; chart 2 has a zero rule labelled "balanced budget". Alt text gives the key values. Every prose number is on a chart or on the exempt list (automated check against SVG text). **Not inspected visually**: there is no supported way to rasterise SVG here. Label collisions were checked by computing pixel positions from the scales and confirming them against the SVG `translate` coordinates. Four collisions were found and fixed before the charts commit. Phone width: 720px viewBoxes scale to about 0.5× at 360px, so 12px text renders at about 6px. Legibility on a phone is unverified. |
| Writing and house voice | Short declarative sentences, no editorialising adjectives, no rhetorical questions, no second person, British spelling. The chart is not narrated; each section states its conclusion. Method is last and short. Word count 590 at round 1, 603 at round 2 (frontmatter, alt text and friction notes excluded). One possible tightening (optional): "Behind the jumps and the climb in between is one constant" could be "Under both jumps and the climb between them lies one constant". Left for the voice pass. |
| Reproducibility and draft readiness | The chart build was run three times, with identical SHA-256 each time (hashes above). Local links resolve. Dataset and `build.ts` links are absolute GitHub URLs. Frontmatter has `publish: false`, `datahub.slug: france-borrowed-every-year` and `status: draft`. Story, outline and outline review all pass the MDX compile. Licences: Eurostat reuse with acknowledgement, and INSEE Licence Ouverte; the method section names both sources. Index links and publishing were skipped by instruction. The dataset is `status: archived` pending review of its parser, and the prose says so. |

## Outcome — round 1 (`1ae6749`)

- **Strongest objection:** the headline turns a dataset boundary into a claim. "Borrowed every year since 1995" invites the reader to infer that France balanced its budget before 1995. The data cannot support that inference, and the draft does not warn against it.
- **Most valuable revision (required):** state in "What these numbers are" that the French annual series start in 1995 and say nothing about earlier years.
- **Verdict:** `CHANGES_REQUIRED`
- **Required corrections:**
  1. `france-debt.md`, "What these numbers are", sentence 2. Evidence: `fiscal-accounts.csv` France `B9` is empty before 1995, and the README says "France's main totals start in 1995". Change: add that the series start in 1995 and are silent on earlier years. Verify: the sentence is present, and the word count stays within 300–700.

## Re-review — round 2 (`d66aa25`)

- Changed file: `site/stories/france-debt.md` SHA-256 `05fdcbd58dcdb91032b39260ba57d613cf24fc49793945a457afb964947d31ff`. One line changed (`git show --stat`: 1 insertion, 1 deletion). Charts, outline and data are unchanged.
- Correction 1: **resolved**. The text now reads "…Eurostat's annual government accounts, whose French series start in 1995; they say nothing about the years before." The word count is 603.
- No new numbers or claims were introduced. The exempt list already covers 1995.
- **Verdict:** `APPROVED`. This is a self-review, and is not independent.

## Outstanding

- **Independent editorial review**: required by the skill before the story is handed off for shipping. It was not available in this run.
- **Author's voice pass and owner approval**: outstanding. This review neither approves voice nor permits publishing.
