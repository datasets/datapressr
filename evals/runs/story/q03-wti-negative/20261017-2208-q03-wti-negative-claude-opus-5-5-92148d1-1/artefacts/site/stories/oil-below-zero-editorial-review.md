---
title: "Editorial review: Oil Went Below Zero in One Place, for One Day"
description: "Final editorial review record (step 4 gate) for the oil-below-zero story."
publish: false
---

# Editorial review: oil-below-zero

Saved in `site/stories/` rather than `docs/reviews/` because the task asked for every file in `site/stories/`.

## Review identity and revision

- Story and intended audience: "Oil Went Below Zero in One Place, for One Day"; general readers who remember the April 2020 headline and want to know what actually happened.
- Reviewer: self (blind run, no reviewer available). The author of the story ran the template. **Not independent**; an independent agent should repeat this review before the story is handed off for shipping. Date: 2026-10-18.
- Reviewed Git commit: `36d2b47`.
- Input manifest (SHA-256):
  - `site/stories/oil-below-zero.md` `dd6761a898b1437baf360813a714ff52d6ed372e436ae0420c14a1de6bbf7e3b`
  - `site/stories/oil-below-zero-outline.md` `0f4f4821ca3f5a5c22b225eb5758455c2bf1e1324bc6a5d89bef2d04c0174501` (approved round 3, `ddf9de6`, see `oil-below-zero-outline-review.md`)
  - `site/stories/oil-below-zero-make-charts.mjs` `46b34c8c1108b7a933aceb82e168c0b6fda57c53fe56f6b7e7fbfc8e9d80e0fd`
  - `site/stories/oil-below-zero-day.svg` `aec0d11717917c7e752c49f95a3409af90e91f3c9e48837ae3a6665843add2f6`
  - `site/stories/oil-below-zero-months.svg` `dcbc64456fd125847cfa3500ee888ae0ef4912fe9e21ebf35a4f14d3aba08e6e`
  - `datasets/energy-and-commodities/oil-prices/data/wti-daily.csv` `fe4e07893cfdba6905e8a955cb630308668ce760af21b351de005df2c5228dd1`
  - `.../brent-daily.csv` `a4d463ad97ce678cfa5ae2e92f5eabcae7b589a6b4c790631e20b2f50969a19b`
  - `.../wti-weekly.csv` `19a2ae03f5d6dd4879c9462e039a1eb25044a44d8994404c6b93b86747a401fb`
  - `.../wti-monthly.csv` `3f2ea990044bc1df25dff8ad91bf224a6cda5bb5fc3ca8486061a40c23a2a696`
  - `.../brent-monthly.csv` `10ebf2a9869f95c75ab9415ae19f3b8a744a7558eca146c1ad499264fc96df28`
  - `site/stories/package-lock.json` `2a5ca38400cf98b2e9a0dec48269f5b249e6dd96d19a1c462b2c123382817bcb` (`@observablehq/plot` 0.6.17, `jsdom` 30.0.1)
  - External: EIA snapshot retrieved 2026-09-05 (`archive/PROVENANCE.md`). CFTC interim staff report and ICE Brent contract page: **not retrieved** (no network).

## Reader questions — written before reading the draft

1. Did someone really get paid to take oil away? → **partly answered**: "Why WTI" section, attributed to the CFTC; the spot/futures distinction is in "What these prices are". The reader learns who was paid (holders of expiring contracts paid buyers), not how much changed hands.
2. Was it all oil, or one kind in one place? → **answered**: lead, "It was one benchmark", chart 1.
3. How long did it last? → **answered**: "It lasted one day", chart 1 and the weekly $3.32.
4. Why did it happen? → **partly answered**: attributed mechanism, explicitly not tested by the data. Correct for a spot-price dataset.
5. How far had prices fallen already? → **answered**: chart 2, 71% for both.
6. Is this the −$37.63 I remember? → **answered**: "What these prices are".
7. Did petrol go negative? → **missed**; not in the data. Minor consequence: the reader may still wonder; acceptable for this length.
8. Could it happen again? → **missed**; out of scope (outline "Not about").

## Evidence and editorial findings

| Dimension | Findings |
|---|---|
| Reader interest and coverage honesty | Finding: "oil" did not go negative; one benchmark did, for one day, on top of a shared 71% fall. The title and lead follow from chart 1. Coverage: EIA daily WTI 1986-01-02 → 2026-09-01, snapshot retrieved 2026-09-05; the story is historical and says so by date. No claim of currency beyond that. |
| Evidence and calculations | Reproduced with a separate Node scan keyed by `Date` (not the chart builder): WTI 2020-04-20 −36.98 (only row ≤ 0 of 10,236); Brent same day 17.36; gap 54.34; WTI 2020-04-17 18.31 (Friday), 2020-04-21 8.91, 2020-04-30 19.23; WTI weekly 2020-04-24 3.32; monthly Jan → Apr 2020 WTI 57.52 → 16.55 (−71.23%), Brent 63.65 → 18.38 (−71.12%), both round to 71%; last lower monthly value WTI 1999-03 (14.68), Brent 1999-06 (15.86), so "since 1999" holds; Brent 2020-04-21 9.12 vs record 9.10 on 1998-12-10 (two cents); 2020-03-31 Brent 14.85, WTI 20.51. Units: nominal US$/bbl, spot, FOB. No missing values in the windows; calendar differences (Brent no 10 or 13 April, WTI no 10 April) are not filled. External figures (−$37.63, 21 April expiry, delivery at Cushing, Brent cash settlement) **could not be verified** against their sources in this run. |
| Argument and counterevidence | Prose matches the approved outline beat for beat; the $55.29 one-day fall and "eight trading days" from the outline are omitted, not contradicted. Counter-numbers present: Brent $9.12 next day, Brent below WTI on 31 March. Causal language is confined to the attributed section and followed by "They do not test it." Alternative reading worth noting: Brent's 21 April low could be the same shock arriving a day later; the prose's "Brent came close" already allows this without asserting a cause. One unattributed claim: "WTI and Brent are the two main reference prices for crude oil" (see correction 1). |
| Charts as visible evidence | Chart 1 traces to `wti-daily`, `brent-daily` (2020-03-02 → 05-29, 63 and 61 rows) and one `wti-weekly` row; chart 2 to `wti-monthly`, `brent-monthly` (24 rows each). Every annotated value is looked up by date and throws if missing. Zero rule on both; chart 2 on a zero baseline; y-domain −45 → 55 covers the window's range (−36.98 to 52.52). Every prose data number is in the SVG text or on the exempt list (checked by script). Alt text states the key values. **Not inspected visually** (no supported rasteriser; blind-run rule): from the SVG source, viewBoxes are 720×440 and 720×420, end labels start at x = 662 and are short ("WTI", "Brent"), the chart 1 note block ends left of x ≈ 310 while the plunge segment is at x ≥ 368, and the −$36.98 label sits at y ≈ 380 clear of the lines. At ~360px the 12px text scales to ~6px. |
| Writing and house voice | 589 words (excluding frontmatter, alt text and friction notes), inside 300–700. Leads with the chart and a one-line finding. Short declarative sentences; no exclamation marks, rhetorical questions or second person; British spelling ("dearer"). No chart narration beyond the values that carry the argument. "Brent did not escape" is mild figurative phrasing, acceptable. Method last and short. |
| Reproducibility and draft readiness | `npm ci`-installed deps present; `node oil-below-zero-make-charts.mjs` run twice from commit `36d2b47`: both SVG hashes identical to the manifest. No `NaN`, `Infinity`, `undefined` or `=>` in either SVG. Local links resolve (this file is the only one created after the prose commit). Links outside `site/` are absolute GitHub URLs, assuming `github.com/datasets/datapressr` on `main` (no remote to confirm). EIA acknowledgement with date is present. Frontmatter: `publish: false`, `datahub.slug: oil-below-zero`, `status: draft`. Index links and DataHub publishing skipped per task. |

## Outcome

- **Strongest objection:** the "why" rests on two external sources cited from memory and not retrieved in this run. If a link is wrong or the CFTC report words the mechanism differently, the story's explanation section is misattributed. Not blocking for a draft, because the data-backed part of the argument (one benchmark, one day, shared collapse) stands without it and the friction notes flag the check, but it **blocks publishing** until the owner verifies both sources.
- **Most valuable revision (optional):** once the network is available, retrieve the CFTC report and quote its own one-line account of the cause, so the attributed sentence is verbatim rather than paraphrased from memory.
- **Verdict:** `CHANGES_REQUIRED`.
- **Required corrections:**
  1. `oil-below-zero.md`, "What these prices are", first sentence: "the two main reference prices for crude oil" is an unattributed superlative. Change to "two of the main reference prices for crude oil". Verify: `grep -n "two of the main" site/stories/oil-below-zero.md`.

## Re-review

- Reviewer: self (blind run, no reviewer available). Commit `88fe2f8`; `site/stories/oil-below-zero.md` SHA-256 `7c9a080eee111d62591394043a7424725d5c58dbe7b50c3ff5db2362466076e9`. No other story artefact changed (`git diff --stat 36d2b47 88fe2f8` touches only the prose, one line, and this file).
- Correction 1: resolved. Line 18 now reads "two of the main reference prices for crude oil". Word count 590.
- No numbers, claims, charts or method changed, so the round 1 evidence and chart checks stand. The CFTC/ICE verification remains an owner check before publishing, recorded in the story's friction notes.
- **Verdict:** `APPROVED` (self-review; draft handoff only).

## Outstanding human stage

The author's voice pass and the owner's publication approval. This (self-)review permits draft handoff only; it does not approve the voice or publish the story.
