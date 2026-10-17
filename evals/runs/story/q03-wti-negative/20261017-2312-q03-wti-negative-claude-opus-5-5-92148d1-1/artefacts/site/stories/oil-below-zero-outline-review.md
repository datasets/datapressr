---
title: "Outline review: Oil Went Below Zero for One Day, in One Place"
description: "Step-2 outline review record for the oil-below-zero story."
publish: false
---

# Outline review: oil-below-zero

Reviewer: review: self (blind run, no reviewer available). The author ran the skill's step-2 checklist in full against the committed revision; no independent reviewer was available in this run.

## Round 1

- Revision reviewed: commit `71916e0`, `site/stories/oil-below-zero-outline.md` SHA-256 `1c601bc393d8447b47847b60f47f781d66f0f1d939bbdaaa9119254b356365c4`.

### Reader questions (written before rereading the outline)

1. What does a negative oil price mean: who paid whom?
2. Was all oil below zero, or one kind in one place?
3. How long did it last?
4. Why did it happen?
5. Is the figure people remember (−$37.63) the same as this one?
6. How far had prices already fallen before that day?
7. Did prices recover, and how quickly?
8. Was oil worthless, and could it happen again?

Against the outline: 1 answered (beat 2). 2 answered (beat 3, chart 1), with Brent's $9.12 the next day as the counterweight (beat 4). 3 answered (beat 3, chart 2). 4 partly answered: by attribution to EIA, correctly marked as not tested; this is the right treatment for a prices-only dataset. 5 answered (beat 4). 6 answered (beat 3, −71% / −72%). 7 partly answered: the 29 May value is in beat 4 but chart 2 is not required to label it, so the prose could not use it (correction 3). 8 partly answered: "not worthless" is the argument; "again" is out of scope and the outline says so.

### Numbers reproduced (own Node scan over the CSVs, not the outline's awk)

| claim | reproduced |
|---|---|
| WTI 2020-04-20 | −36.98 |
| Brent 2020-04-20 | 17.36; gap 54.34 |
| 2020 daily max | WTI 63.27 and Brent 70.25, both 2020-01-06 |
| 6 Jan → 17 Apr | WTI 63.27 → 18.31 (−71.1%); Brent 70.25 → 19.75 (−71.9%) |
| 2020-04-21 | WTI 8.91; Brent 9.12 |
| Brent all-time daily low | 9.10 on 1998-12-10; second lowest 9.12 on 2020-04-21 |
| negative days | WTI 1 of 10,236; Brent 0 of 9,967 |
| WTI week ending 2020-04-24 | 3.32 (mean of the five daily values 3.324) |
| WTI April 2020 monthly | 16.55 (mean of 21 daily values 16.548) |
| negative weekly / monthly WTI rows | 0 / 0 |
| WTI monthly all-time low | 11.35, 1998-12-15 |
| shared trading days 1 Mar–17 Apr | 33; WTI above Brent on 12; WTI − Brent from −6.95 to +5.66 |
| holidays | Brent has no rows for 2020-04-10 or 2020-04-13; WTI none for 2020-04-10 |
| WTI 2020-05-29 | 35.57 |
| first Friday in chart 2 window | 2020-03-06 (weekly 45.57) |
| chart 2 window max | daily 47.27 (2020-03-03); weekly 45.57 (2020-03-06) |

### Chart plan checks

Chart 1: fields `Date`, `Price` exist in both resources; all looked-up dates exist; each resource filtered separately, no join; y-domain [−45, 80] contains −36.98 and 70.25. OK.

Chart 2: fields exist; 2020-04-15 monthly row exists; weekly step-before matches "Friday ending the week". The y-domain [−45, 40] clips the window's own data (daily 47.27, weekly 45.57). Correction 1.

### Causal claims and counter-numbers

Counter-numbers present: Brent $9.12 next day, futures −$37.63 vs spot −$36.98, December 1998 monthly low, WTI above Brent on 12 of 33 days. Two sentences overreach the data (corrections 2a, 2b).

### Verdict: CHANGES_REQUIRED

1. Chart plan row 2, "transform" column: y-domain [−45, 40] clips daily 47.27 (2020-03-03) and weekly 45.57 (2020-03-06). Change to [−45, 50]. Verify: domain max ≥ 47.27.
2. (a) Beat 3, "What the pattern fits": "A world with too much oil would push every benchmark down for weeks" is a counterfactual mechanism the data does not test. (b) "What this story is about", last sentence: "and not what a global glut alone would produce" is the same overreach. Replace with "consistent with" wording and say the data cannot rule out other contributors.
3. Beat 4, recovery bullet: if the prose may cite $35.57, chart 2 must label it. Make the 29 May label required.
4. Beat 3, "It lasted one day": "the 21 April-dated values average 16.548" is garbled; it means the 21 daily values in April. Also beat 3 first bullet says "highest close"; a spot price is not a close. Say "highest daily price".

## Round 2

- Revision reviewed: commit `0033396`, `site/stories/oil-below-zero-outline.md` SHA-256 `869a6533974ccf02823fbbc7b277ed90045ba7521adb62682623c25bd20adc37`.
- Reviewer: review: self (blind run, no reviewer available).

Correction by correction:

1. Chart 2 y-domain is now [−45, 50] and names the window maxima (47.27, 45.57). Verified against the scan above. Resolved.
2. (a) Beat 3 "What the pattern fits" now says "consistent with the EIA explanation… does not test that explanation and cannot rule out other contributors". (b) "What this story is about" now ends "is consistent with that explanation. The data cannot rule out other contributors." `grep -E 'predicts|glut alone'` finds nothing. Resolved.
3. Beat 4 recovery bullet and chart 2 row now require the 29 May 35.57 label. Resolved.
4. "21 daily values in April average 16.548" and "highest daily price of 2020" in place. Resolved.

Reader questions re-checked: 7 (recovery) now answered; the rest unchanged from round 1.

Numbers: the round-1 table still matches; no numbers changed between revisions.

Note for the prose (not a blocking correction): beat 4 says "The 'Brent didn't' contrast holds for one day only". Brent's price stayed positive throughout; what lasted one day is the $54.34 gap (on 21 April the two were 21 cents apart). The prose should say it that way.

### Verdict: APPROVED

Revision `0033396` / `869a6533…adc37` is approved for charts and prose.
