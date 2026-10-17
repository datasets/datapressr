---
title: "Editorial review: Oil Went Below Zero for One Day, in One Place"
description: "Final editorial review record for the oil-below-zero story draft."
publish: false
---

# Editorial review: oil-below-zero

Saved in `site/stories/` rather than `docs/reviews/` because this run puts every file it produces in `site/stories/`.

## Review identity and revision

- Story and intended audience: "Oil Went Below Zero for One Day, in One Place". For general readers who remember the April 2020 headline and want to know what actually happened and why.
- Reviewer: review: self (blind run, no reviewer available). Date 2026-10-18. **Not independent:** the reviewer wrote the outline, charts and prose. No subagent or nested agent was available in this run. The template was applied in full regardless.
- Reviewed Git commit: `5f83ddc` (prose). Charts from `ba5c6b6`, outline approved at `0033396` and reformatted at `d408a32`.
- Input manifest (SHA-256):
  - `site/stories/oil-below-zero.md` `ce75bc29a87d00a70de747a32686739a1151e7b2c7818d056df4bbb27b9a7e1c`
  - `site/stories/oil-below-zero-outline.md` `875b1540a5baf2bcb0aa371ab2fe6361cb7e0d0039b2956bf2b7ee512dd12261` (approved revision was `869a6533…adc37`; `d408a32` changes only the EIA link from `<url>` autolink to `[text](url)` so that it compiles under MDX; `git diff 0033396 d408a32` is that one line)
  - `site/stories/oil-below-zero-make-charts.mjs` `16e7b4db43e0d77c3ba4b77fe726cc93e27137d09a5c33b7a32ffe2b1daa4d64`
  - `site/stories/oil-below-zero-benchmarks.svg` `b3fd4442f4d7dca7431610aea512f655d222a98f8fcc2dc4cf2223baff606b25`
  - `site/stories/oil-below-zero-averages.svg` `05fd33a08f67846db880c045a4a07894ca73a0fee23ce4719bb991a1372222c9`
  - `site/stories/package-lock.json` `2a5ca38400cf98b2e9a0dec48269f5b249e6dd96d19a1c462b2c123382817bcb`
  - Data, `datasets/energy-and-commodities/oil-prices/data/`: `wti-daily.csv` `fe4e07893cfdba6905e8a955cb630308668ce760af21b351de005df2c5228dd1`; `brent-daily.csv` `a4d463ad97ce678cfa5ae2e92f5eabcae7b589a6b4c790631e20b2f50969a19b`; `wti-weekly.csv` `19a2ae03f5d6dd4879c9462e039a1eb25044a44d8994404c6b93b86747a401fb`; `wti-monthly.csv` `3f2ea990044bc1df25dff8ad91bf224a6cda5bb5fc3ca8486061a40c23a2a696`
  - External source: EIA *Today in Energy* article, id 43495 (April 2020). Not re-opened in this run (fixed data mode, no network).
  - Outline approval: `oil-below-zero-outline-review.md`, round 2, APPROVED.

## Reader questions (written before rereading the draft)

1. What does a negative oil price mean? → answered ("What the numbers are": the seller paid the buyer).
2. Was all oil below zero? → answered (lead, chart 1: only WTI; Brent $17.36).
3. How long did it last? → answered ("What they show", chart 2: one day; weekly and monthly averages positive).
4. Why did it happen? → answered by attribution ("Why, according to EIA"), clearly marked as not tested by the data. Correct treatment for a prices-only dataset.
5. Is −$37.63 the same thing? → answered ("The wrinkle": futures settlement vs spot).
6. Had prices already been falling? → answered (−71% / −72% from 6 January to 17 April).
7. Did it recover? → answered ($35.57 by 29 May).
8. Could it happen again? → missed. Out of scope in the outline; the data cannot answer it. Acceptable.

## Evidence and editorial findings

| Dimension | Findings |
|---|---|
| Reader interest and coverage honesty | Finding: the negative price was one benchmark, one place, one day. The title says exactly that and the lead backs it in two sentences. Source period: WTI daily 1986-01-02 → 2026-09-01, Brent daily 1987-05-20 → 2026-09-01, retrieved 2026-09-05; the story is about 2020 and never presents itself as current. One coverage issue: "Brent has never been negative" (§"What the numbers are", last sentence) is unscoped; the record starts in 1987 (correction 1). |
| Evidence and calculations | Reproduced with a fresh Node scan over the four CSVs (not the chart builder): WTI 2020-04-20 −36.98; Brent 2020-04-20 17.36; gap 54.34; 2020-01-06 WTI 63.27, Brent 70.25 (2020's highest for both; WTI 2020 max re-checked in the outline review scan); 2020-04-17 WTI 18.31, Brent 19.75; change −71% and −72% (rounded from −71.1% and −71.9%); 2020-04-21 WTI 8.91, Brent 9.12; week ending 2020-04-24 3.32; April 2020 monthly 16.55; 2020-05-29 WTI 35.57; WTI 10,236 rows from 1986-01-02, one negative (2020-04-20); Brent 0 negative; Brent min 9.10 on 1998-12-10 (two cents below 9.12); WTI monthly min 11.35 on 1998-12-15; 0 negative weekly and 0 negative monthly WTI rows. Units: US$/barrel, nominal, FOB spot. No missing values in any file; holidays are absent rows. Attributed figure −$37.63 and the expiry date (21 April) could not be checked against the source in this run. |
| Argument and counterevidence | Prose follows the approved argument beat by beat. Counter-numbers present: Brent $9.12 the next day near its record low; futures −$37.63 vs spot; December 1998 monthly low $11.35. Strongest alternative interpretation: the negative print reflects futures-expiry mechanics in the spot assessment rather than physical storage. The prose attributes both storage and expiry to EIA and says the data "does not test that account, and it cannot rule out other contributors". Causal language ("So sellers paid buyers to take it") sits inside the attributed paragraph. The round-2 outline note (what lasted one day was the gap, not the sign) is honoured in "The wrinkle". |
| Charts as visible evidence | Chart 1 traced to `wti-daily` and `brent-daily`, each filtered separately to 2020-01-02…06-30, no join; zero rule; y-domain −50…80 contains −36.98 and 70.25; labels read from rows. Chart 2 traced to `wti-daily`, `wti-weekly` (step-before, week ending Friday), `wti-monthly` (April row drawn across 1–30 April); y-domain −45…50 contains the window maximum 47.27. Every prose number not on the exempt list appears in SVG text (`grep` per number). `grep -E 'NaN|Infinity|undefined|=>'` finds nothing. Label positions checked from SVG coordinates against the scales: no text overlaps a line in either chart; chart 2's widest end label ends inside 720 px after moving it to two lines. One legibility issue: in chart 1 the "21 Apr" label sits at y = −10, about 52 px below the two dots it describes, with nothing joining them (correction 2). **Not inspected visually** at desktop or phone width: there was no supported way to rasterise SVG in this run. This dimension's visual check is therefore incomplete and recorded as a limitation, not passed. At 360 px the 720 px charts scale to half size (12 px text → about 6 px). |
| Writing and house voice | Lead states the finding. Short declarative sentences; no adjectives of the banned kind, no rhetorical questions, no second person, no exclamation marks. British spelling. Does not narrate the charts. Word count 567 (excluding frontmatter, alt text and friction notes), within 300–700. "Where and for how long are the clues to why" frames the attributed section without claiming more. |
| Reproducibility and draft readiness | `node oil-below-zero-make-charts.mjs` twice → identical SHA-256, equal to the committed SVGs. Local links resolve (charts, script, outline, outline review). Dataset and `build.ts` links are absolute GitHub URLs, as required for a site-published folder; they assume `github.com/datasets/datapressr`. Frontmatter has `publish: false` and `datahub.status: draft` with slug `oil-below-zero-one-day` (not a dataset name). All three story Markdown files compile under `@mdx-js/mdx` with `remark-gfm`. EIA acknowledgement with date present in "How this was made". Index links and publishing skipped by instruction. |

## Outcome

- **Strongest objection:** the *why* rests on one EIA article that could not be re-opened in this run, so its URL, its −$37.63 figure and its 21 April expiry date are unverified here. If any is wrong, the attribution breaks. Not blocking for a draft handoff, since the prose and friction notes say plainly that it was not re-checked; it must be checked before publication.
- **Most valuable revision:** scope "Brent has never been negative" to the record (correction 1). Required: an unscoped "never" is the one claim in the draft that is broader than its data.
- **Verdict:** `CHANGES_REQUIRED`.
- **Required corrections:**
  1. `oil-below-zero.md`, "What the numbers are", last sentence. Evidence: Brent daily starts 1987-05-20. Change to "Brent, recorded daily since May 1987, has never been negative." Verify: `grep -n 'since May 1987' oil-below-zero.md`.
  2. Chart 1 (`oil-below-zero-make-charts.mjs`, the "21 April" text mark). Evidence: label at y = −10 vs dots at 8.91 / 9.12, about 52 px apart. Anchor the label on the Brent 21 April row with `dx: 9, dy: 14`, which places it at about $4 in empty space right of the spike (lines there are ≥ $12.17; the zero rule is 12 px below). Verify: rebuild twice, identical hashes, and the label's SVG `translate` y within 20 px of the dots.
- **Outstanding human stage:** author's voice pass and owner publication approval. Owner should also re-open the EIA source (strongest objection) and view both charts at desktop and phone width.

## Re-review (round 2)

- Reviewer: review: self (blind run, no reviewer available). Not independent (see above).
- New commit: `19a052f`. Changed files:
  - `site/stories/oil-below-zero.md` `fd2fefe7d4132aa7a4379113b712df4bfd5bcddb4474253e26fbb8f32ff79f8c`
  - `site/stories/oil-below-zero-make-charts.mjs` `fb849da5395e913de6aa9c93ce573e28b0f490838cebc9304fd641be8329b5e5`
  - `site/stories/oil-below-zero-benchmarks.svg` `ed47908094a9e217f59de29c68ab4d92aa79bb4ec536af7d633fec009e6df24a`
  - unchanged: `oil-below-zero-averages.svg` `05fd33a0…839a`, outline `875b1540…2261`, data files.

Correction by correction:

1. `grep -n 'since May 1987'` → line 22: "Brent, recorded daily since May 1987, has never been negative." 1987 added to the exempt list as a record start. Resolved.
2. The 21 April label is now anchored on the Brent 2020-04-21 row with `dx: 9, dy: 14`: text `translate` y = 233.0 + 14 px; Brent and WTI dots at cy 233.0 and 233.6. The label spans about $2–$6 on the y scale; lines to its right are ≥ $12.17 and the zero rule is 6 px below the text's lower edge. Two rebuilds → identical SHA-256 (`ed47908…f24a`, `05fd33a…839a`); `grep -E 'NaN|Infinity|undefined|=>'` finds nothing. Resolved.

Other checks re-run on the new revision: word count 572 (300–700); every non-exempt prose number still in SVG text; all local links resolve; MDX compiles. No change to the argument, chart plan, title or numbers, so no outline re-review is needed.

- **Verdict:** `APPROVED` for draft handoff, with these limitations recorded rather than passed: (a) the charts were not inspected visually at desktop or phone width, only from SVG source; (b) the EIA source behind the *why* section and the −$37.63 figure were not re-opened; (c) the review is by the author, not an independent agent.
- **Outstanding human stage:** author's voice pass (skipped in this run), owner check of (a) and (b), and owner publication approval. This approval does not change `status: draft` or authorise publishing.
