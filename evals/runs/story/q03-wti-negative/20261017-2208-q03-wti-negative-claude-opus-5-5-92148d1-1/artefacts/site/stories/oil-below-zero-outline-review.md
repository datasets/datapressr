---
title: "Outline review: Oil Went Below Zero in One Place, for One Day"
description: "Step 2 gate record for the oil-below-zero outline."
publish: false
---

# Outline review: oil-below-zero

Reviewer: self (blind run, no reviewer available). The author of the outline ran the skill's review checklist against the committed revision. This is not an independent review; an independent reviewer should repeat it before the story ships.

## Round 1

- Revision reviewed: commit `dadb64b`, `site/stories/oil-below-zero-outline.md` SHA-256 `284d8bfac8b08b9dd121527d88dd72e28220981e393c0c8f66356fe2c2c7b8b2`.
- Method: a fresh Node scan of the CSVs (not the awk used while drafting), looking each value up by `Date`.

### Reader questions (written before rereading the outline)

1. Did sellers really pay buyers to take oil away? → **partly answered** (beat 5, attributed; beat 2 separates spot from futures).
2. Was it all oil, everywhere, or one kind in one place? → **answered** (beats 1, 3, 6).
3. How long did it last? → **answered** (beats 1, 4).
4. What caused it? → **partly answered**: attributed context only, marked untested (beat 5). Honest given spot-only data.
5. How far had prices already fallen, and why? → *how far* **answered** (beat 3); *why* **partly** (COVID-19 demand named in beat 5, attributed).
6. Is the −$37.63 I remember the same number? → **answered** (beat 2).
7. Did petrol prices go negative? → **missed**; out of scope and not in the data, stated under "Not about".
8. Could it happen again? → **missed**; out of scope, stated.

### Numbers reproduced

| Claim | Reproduced |
|---|---|
| WTI 2020-04-20 | −36.98; the only row ≤ 0 of 10,236 (1986-01-02 → 2026-09-01) |
| Brent 2020-04-20; gap | 17.36; 54.34 |
| WTI 2020-04-17; one-day fall | 18.31; 55.29 |
| WTI 2020-04-21; rise | 8.91; 45.89 |
| Monthly Jan → Apr 2020 | WTI 57.52 → 16.55 (−71.23%); Brent 63.65 → 18.38 (−71.12%) |
| Last lower monthly value | WTI 1999-03-15 14.68; Brent 1999-06-15 15.86 |
| WTI week ending 2020-04-24 | 3.32 (2020-04-24 is a Friday) |
| WTI 2020-04-30 | 19.23 |
| Brent 2020-04-21; record low | 9.12; 9.10 on 1998-12-10 |
| 2020-03-31 Brent / WTI | 14.85 / 20.51 (2020-04-01: 14.97 / 20.28) |
| Calendar gaps | WTI no 2020-04-10; Brent no 2020-04-10 or 2020-04-13 |
| 2020-04-20 weekday | Monday |
| Chart windows | daily 2020-03-02 → 05-29: WTI 63 rows (max 47.27), Brent 61 rows (max 52.52); monthly 2019-01 → 2020-12: 24 rows each (max 71.32) |

### Verdict: CHANGES REQUIRED

1. **Chart plan row 1, y-domain.** "set −45 → 35" would clip the window's own data (Brent 52.52 on 2020-03-02, WTI 47.27 on 2020-03-03). Set −45 → 55.
2. **Beat 4, "within ten trading days".** 2020-04-20 → 2020-04-30 is 8 trading days in `wti-daily`. Say eight.
3. **Beat 5, last Brent sentence.** "Brent is waterborne, so there was no equivalent single inland tank farm to fill" is the author's own causal inference, not attributed. Drop it, or attribute it; keep only the cited cash-settlement point.
4. **Beat 3, "lowest monthly averages since March 1999".** True, but the wording should make clear March 1999 was *lower* (14.68), so the reader does not read "since" as "equal to". Reword.
5. **Chart plan row 1, label crowding.** Four labelled values (18.31, 17.36, 9.12, 8.91) fall within two trading days and $10 of each other. Label −$36.98 directly; put the 17 / 20 / 21 April values in a note block in empty space, with dots on the lines, so labels don't collide.

Checks passed: every field exists (`Date`, `Price` in all five resources); no join by date; missing calendar days are not filled; zero rule and zero baseline present; spot vs futures distinguished and the widely quoted −$37.63 named; counter-numbers present (Brent $9.12, Brent below WTI on 31 March, nominal dollars); mechanism attributed and marked untested.

## Round 2

- Revision reviewed: commit `bbf25a3`, outline SHA-256 `5411b0db570fcf5465db5b02ad9b45cea04d36ab54623c5b92c4a29b429ce36b`.
- Round 1 items: 1 fixed (−45 → 55, highs named); 2 fixed ("eight trading days"); 3 fixed (inference dropped, cash settlement kept and attributed); 4 fixed (March 1999 stated as lower, $14.68 / $15.86); 5 fixed (note block and label positions specified).
- Full reread, numbers unchanged from the round 1 table.

### Verdict: CHANGES REQUIRED

6. **Beat 6, last sentence.** "only on the one day its contract was expiring" contradicts beat 5: the May contract expired on 21 April; 20 April was the day before. Say "the day before its May futures contract expired" and keep the expiry date attributed to the CFTC.

## Round 3

- Revision reviewed: commit `ddf9de6`, outline SHA-256 `0f4f4821ca3f5a5c22b225eb5758455c2bf1e1324bc6a5d89bef2d04c0174501`.
- Correction 6 fixed: beat 6 now reads "the day before its May futures contract expired (expiry date per CFTC)", consistent with beat 5.
- Full checklist rerun: numbers as in the round 1 table; fields and windows checked; no join by date; zero rule / zero baseline; counter-numbers present; every mechanism attributed (CFTC, ICE) and marked untested; external links flagged as not retrieved in this run. Reader questions 1–6 answered or partly answered; 7–8 out of scope and said so.

### Verdict: APPROVED

Reviewer: self (blind run, no reviewer available). Charts and prose may proceed against this revision.
