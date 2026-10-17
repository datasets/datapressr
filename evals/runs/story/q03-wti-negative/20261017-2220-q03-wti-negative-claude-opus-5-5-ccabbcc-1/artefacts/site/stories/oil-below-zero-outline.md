---
title: "Outline: One Oil Benchmark Went Below Zero, for One Day"
description: "Argument, beats, numbers and chart plan for a short story on why the WTI price fell to −$36.98 on 20 April 2020."
publish: false
---

# Outline: One Oil Benchmark Went Below Zero, for One Day

The prose (`oil-below-zero.md`) is a rendering of this outline. If the prose drifts from the argument, the prose is wrong.

Location: `site/stories/` (DataPressr default). Slug: `oil-below-zero`.

## The argument, in one sentence

Oil did not go below zero in April 2020; of the two benchmarks in this dataset, one did — WTI at Cushing, Oklahoma, for one trading day (20 April, −$36.98) — after a three-month collapse that hit both, while Brent stayed at $17.36 that day — so the negative number describes one benchmark price, at one delivery point, on one day (which the CFTC attributes to scarce storage at Cushing on the eve of the May contract's expiry), not what a barrel of oil was worth.

## What this story is about — and what it is not

- **About:** what actually went negative (which benchmark, which kind of price, for how long), what the market looked like before and after, and the explanation for it, attributed to the regulator's report.
- **Not about:** the wrangling of the EIA workbooks; the COVID-19 demand collapse in general; pump prices; the 2008 peak or the Brent–WTI spread over decades.
- **Limit of the data:** the dataset holds two benchmarks only, WTI and Brent. Other crude prices (for example inland grades priced off WTI) are not in it, so the story makes no claim about whether they went negative, and must not imply that WTI was the only crude price that did. (Added after editorial review round 1, correction 1.)
- **What the data shows vs why.** The dataset shows *that* WTI spot went to −$36.98 on one day and that Brent did not. It does not show *why*: it has no storage, inventory, futures-expiry or positions data. The mechanism comes from outside context (below) and is not tested here. Nor does the data say why Brent stayed positive; the story names the difference between the two (where each is priced) without claiming it as a proven cause.

## Argument, in order

All prices are EIA daily **spot** prices, US dollars per barrel, FOB, nominal: "Cushing, OK WTI Spot Price FOB" and "Europe Brent Spot Price FOB" (`wti-daily`, `brent-daily`).

1. **The finding.** On Monday 20 April 2020 the WTI spot price was **−$36.98** a barrel. On the same day Brent was **$17.36**. It is the only negative value in the dataset: 1 of 10,236 WTI daily rows (1986-01-02 → 2026-09-01); Brent has none in 9,967 rows.
2. **What you're looking at.** Two benchmark spot prices published by the U.S. Energy Information Administration. WTI is priced at Cushing, Oklahoma, an inland pipeline and storage hub; Brent is North Sea crude priced FOB (loaded on a ship). A spot price is the price for oil delivered now, not an average. **Not the widely quoted −$37.63:** that is the settlement price of the NYMEX May 2020 WTI *futures* contract on the same day (outside figure, attributed to the CFTC report). This story uses the figure the dataset contains.
3. **What it says.**
   - **The collapse came first, and both benchmarks shared it.** 2 January 2020: WTI $61.17, Brent $67.05. By Friday 17 April: WTI $18.31, Brent $19.75. Both had lost about 70% (70% and 71%) before the negative day.
   - **The plunge took one trading day.** WTI fell from $18.31 (Fri 17 April) to −$36.98 (Mon 20 April), a fall of $55.29, and was back to **$8.91** on Tuesday 21 April.
   - **Averages never go negative.** The weekly average for the week ending 24 April was **$3.32**; WTI's April 2020 monthly average was **$16.55**. A reader who sees a monthly or weekly chart will not find a negative value at all.
   - **Before and after.** Before 2020, WTI's lowest daily price was $10.25 (31 March 1986): exempt, outside the charts' window. WTI's only two daily prices below $10 in the whole series are 20 April (−$36.98) and 21 April 2020 ($8.91), both on chart 2; it has not been negative since (dataset-wide count, exempt).
4. **The wrinkle (weakening numbers).**
   - **Brent was under heavy stress too.** On 21 April Brent fell to **$9.12**, two cents above its all-time daily low of $9.10 (10 December 1998). The contrast is "negative vs barely above its record low", not "crisis vs calm".
   - **Brent briefly priced *below* WTI** at the end of March (31 March: Brent $14.85, WTI $20.51). The WTI-only story is about one day, not the whole spring. (Outline note only; the prose may omit this. If used, it must be on a chart.)
   - **The explanation is not in the data.** See outside context.
5. **How this was made.** Charts read `wti-daily`, `wti-weekly`, `wti-monthly` and `brent-daily` directly; `build.ts` reproduces the CSVs from EIA `.xls` workbooks; re-running the chart script reproduces the SVGs byte for byte.

## Outside context (not tested by this data)

- **Mechanism, from the regulator.** U.S. Commodity Futures Trading Commission, *Interim Staff Report: Trading in NYMEX WTI Crude Oil Futures Contract Leading up to, on, and around April 20, 2020* (November 2020): <https://www.cftc.gov/media/5296/InterimStaffReportNYMEX_WTICrude/download>. What the story takes from it, at this level of detail only: the May 2020 WTI futures contract expired on 21 April; it is settled by physical delivery at Cushing; on 20 April, the day before expiry, traders still holding contracts that would oblige them to take delivery faced concerns about limited available storage at Cushing, and sold at any price; the contract settled at −$37.63.
- **Background demand collapse** (COVID-19 lockdowns) is mentioned in one clause only, as timing ("weeks into lockdowns"), not as a cause; it is not argued from the data.
- **Link not checked in this run.** There is no network access in this blind run, so the URL and the report's wording were not opened; both must be verified before shipping.

## Chart plan

| # | chart | data (resource + fields) | transform, gaps, dates | purpose |
|---|---|---|---|---|
| 1 | "Only WTI went below zero, for one day" — daily WTI and Brent, 2 Jan – 30 Jun 2020 | `wti-daily` (`Date`, `Price`); `brent-daily` (`Date`, `Price`) | Filter each resource to 2020-01-02..2020-06-30 separately; one `Plot.line` per resource; **no date join** (holidays differ: e.g. 2020-01-20 and 2020-02-17 are Brent-only, 2020-04-13 and 2020-05-08 WTI-only). No missing prices in the window, so no gap handling needed beyond that. Zero rule. Marked from rows: WTI 2020-04-20 (−36.98), Brent 2020-04-20 (17.36), Brent 2020-04-21 (9.12); start labels from 2020-01-02 rows (61.17, 67.05); both 2020-04-17 rows (WTI 18.31, Brent 19.75) with one label giving each benchmark's fall since 2 January, computed from the rows and rounded to whole per cent (70%, 71%). y-domain must include −36.98 and 67.05: fixed [−45, 75]. | Beats 1, 3 (shared collapse), 4 (Brent $9.12) |
| 2 | "A one-day price: the weekly and monthly averages stayed above zero" — WTI April 2020 | `wti-daily`, `wti-weekly`, `wti-monthly` (`Date`, `Price`) | Daily 2020-03-30..2020-05-08 as line + dots. Weekly rows 2020-04-03..2020-05-08, each drawn as a horizontal segment from the previous Friday (date − 7 days) to its own Friday (EIA dates weeks by the Friday ending them, so each value spans the week before it); label "week ending 24 Apr". Monthly: the 2020-04-15 row (EIA dates the month's average to the 15th) drawn as a horizontal segment from 2020-04-01 to 2020-04-30, not as a point on the 15th. Marked from rows: daily 17 Apr 18.31, 20 Apr −36.98 (with fall of 55.29 computed from the two rows), 21 Apr 8.91; weekly 24 Apr 3.32; monthly April 16.55. Zero rule. y-domain fixed [−45, 35]. | Beats 3 (one day, averages) |

Formula checks run against the columns before submitting: 18.31 − (−36.98) = 55.29; mean of WTI 20–24 April daily (−36.98, 8.91, 13.64, 15.06, 15.99) = 3.324 → $3.32 matches `wti-weekly` 2020-04-24; mean of the 21 WTI daily rows in April 2020 = 16.5476 → $16.55 matches `wti-monthly` 2020-04-15; 1 − 18.31/61.17 = 70.1% → 70%, 1 − 19.75/67.05 = 70.5% → 71% (the prose says "about 70%").

## Voice

House voice per `skills/story/references/voice-guide.md`. The human voice pass is a separate stage, outstanding.

## Friction notes

- **Review: self (blind run, no reviewer available).** The outline review below was run by the author against the skill's checklist; it is not independent.
- The "why" question pulls hard towards a causal answer the dataset can't give. The spot-price data alone narrows the question (one benchmark, one day, one place), which is most of the answer; the mechanism has to be borrowed, and here it could not be verified offline.
- The story-craft reference names a previous story "WTI Went Negative. Brent Didn't." that is not in this workspace. This outline was written fresh from the data; overlap in finding is expected.

## Outline review

Reviewer: **review: self (blind run, no reviewer available)** — the outline's author, running the skill's step 2 checklist in full. Not independent.

### Round 1 — CHANGES_REQUIRED

Revision reviewed: commit `f9b3fe4` (`f9b3fe43a2adbfc4874c4f909718fea11c95c9d5`), `oil-below-zero-outline.md` SHA-256 `af970b84011d9815f462c81af4219c0a535028147a6fa5a305aff46e81e71a68`.

**Reader questions, written before rereading the outline:**

1. What exactly went below zero — all oil, or one price? → **answered** (beats 1–2).
2. Why would a seller pay a buyer to take oil? → **partly answered**: answered by attributed outside context (CFTC), which could not be opened in this run; the data cannot answer it.
3. How long did it last? → **answered** (one trading day; $8.91 next day).
4. Did Brent, or oil elsewhere, go negative too? → **answered** (Brent $17.36, then $9.12).
5. How far had prices already fallen, and why? → **answered** for how far (about 70% since 2 January); **partly** for why (COVID demand, one clause, not argued from data).
6. Had it happened before, or since? → **answered** (only negative row; pre-2020 low $10.25).
7. Is the famous −$37.63 the same number? → **answered** (futures settlement vs EIA spot).
8. Did petrol at the pump become free? → **missed**, deliberately: out of scope ("not about: pump prices"). Acceptable; the dataset has no retail prices.

**Numbers reproduced** with an independent `awk` scan of the CSVs (not the author's Node scan): WTI daily 10,236 rows, 1 negative, 0 missing, min −36.98 on 2020-04-20; Brent daily 9,967 rows, 0 negative, min 9.10 on 1998-12-10; WTI 2020-01-02 61.17, 03-31 20.51, 04-17 18.31, 04-20 −36.98, 04-21 8.91; Brent 2020-01-02 67.05, 03-31 14.85, 04-17 19.75, 04-20 17.36, 04-21 9.12; `wti-weekly` 2020-04-24 3.32 (recomputed mean of 5 daily rows 3.324); `wti-monthly` 2020-04-15 16.55 (recomputed mean of 21 daily rows 16.5476); WTI pre-2020 min 10.25 on 1986-03-31; WTI below $10 only on 2020-04-20 and 2020-04-21; 18.31 + 36.98 = 55.29; falls since 2 Jan 70.07% and 70.54%. Holiday rows checked: 2020-01-20 and 2020-02-17 Brent-only; 2020-04-13 and 2020-05-08 WTI-only. All fields named in the chart plan exist (`Date`, `Price`).

**Corrections:**

1. Line 15 (argument sentence): "a fact about one delivery point running out of room on the eve of a contract expiry" states the CFTC's mechanism as the story's own finding. Separate what the data shows (one price, one place, one day) from the attributed explanation.
2. Line 30 / chart plan row 1: "roughly 70%" is a prose number on no chart, and WTI's 17 April value was planned for chart 2 only. Mark both 17 April rows on chart 1 with the computed falls.
3. Line 33: "never fell below $19.72 (1 May 2020)" is marked exempt as "outside the chart window", but 1 May 2020 is inside chart 1's window and unmarked. Replace with a statement whose numbers are on a chart or genuinely exempt.
4. Chart plan row 2: `step-before` starting from the 2020-03-27 row draws a stub at that week's value (19.44) that spans no days. Draw each week as a segment from the previous Friday to its own Friday instead.

Otherwise: no causal claim beyond the evidence outside the attributed section; weakening numbers present (Brent $9.12 two cents above its record low; Brent below WTI on 31 March; averages never negative); spot vs futures distinguished; no date join; zero rule and y-domains include every annotated value.

### Round 2

Revision reviewed: commit `294e240` (`294e2403d6c116f5701b758efdc9b4b95d6169bb`), `oil-below-zero-outline.md` SHA-256 `17123b090d3be206df7327ef0f8d7af9f56b25f31fbbf56f3993e3056b94241f`. Reviewer as above.

1. Correction 1 — resolved: the argument sentence now states the finding (one price, one delivery point, one day) and puts the mechanism in parentheses, attributed to the CFTC.
2. Correction 2 — resolved: chart plan row 1 marks both 2020-04-17 rows with falls computed from the rows; recomputed 70.07% → 70% and 70.54% → 71%.
3. Correction 3 — resolved: the $19.72 claim is gone. "Only two daily prices below $10" re-checked by `awk` (2020-04-20, 2020-04-21), both marked on chart 2; "not negative since" is a dataset-wide count (1 negative row), exempt; $10.25 (1986) is outside both chart windows, exempt.
4. Correction 4 — resolved: weekly rows 2020-04-03..2020-05-08 drawn as previous-Friday-to-Friday segments; no stub.

Numbers unchanged from round 1 and reproduced as listed there. Reader-question coverage unchanged (five answered, two partly — questions 2 and 5 — and one deliberately out of scope). No new causal language. Verdict: **APPROVED**.

### Round 3

Revision reviewed: commit `daba6c2` (`daba6c2a9fea546199a689e82141018807c22b28`), `oil-below-zero-outline.md` SHA-256 `d3551a8bd154a3cdcb8a83fe9d1fa6c47e19a75cabde35902881faa091e342d2`. Reviewer as above (self, blind run).

Changes since round 2: the title now reads "One Oil Benchmark Went Below Zero, for One Day"; the argument sentence says "of the two benchmarks in this dataset, one did" and "one benchmark price"; a new "Limit of the data" bullet says the story makes no claim about other crude prices; and the COVID-19 clause is restricted to timing. Beats, numbers and chart plan are unchanged, so the charts stay valid with no rebuild. The reproduced numbers are as in round 1. Reader question 4 ("did other oil go negative too?") moves from silently over-answered to honestly bounded. No new causal language. Verdict: **APPROVED**.
