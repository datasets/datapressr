# Writing the prose: sentence and structure rules

Packaged with the `story` skill. Use it in step 4, after the outline and charts are fixed. They come from blind comparisons with top published stories (Factory `projects/story-remakes`: rounds 0–2 and the h1 held-out test, 2026-11-12/13). In round 0 the originals won writing 12 of 12 while ours won accuracy: they "read in one go"; ours "pack many figures into each sentence" and end "in methods". Diagnosis: Factory `rounds/r1-diagnosis.md`; h1 lessons: `rounds/h1/results.md`.

**Wording and order only.** These rules never add a claim or drop a caveat. Stakes, named examples, a sourced scene and the close's implication (rules 1, 9, 11) are material, not wording: they come from the approved outline (SKILL.md step 1). A new comparison, ratio, yardstick or "what to watch next" that is not in the approved outline is an outline change (step 2), not a wording change. Moving a beat to a different place from the outline is also an outline change: note it for the reviewer. Every caveat and attribution in the outline must still be traceable to a sentence. The voice guide and the claim checks in `editorial-review.md` still apply; if a rule here conflicts with a claim check, the claim check wins and you shorten something else.

Before/After examples are invented (a fictional city's bicycle counters); in each, the After states nothing the Before doesn't support. Bad/Good examples are real, from h1.

## 1. Open on why it matters, then what changed

The opening summary (SKILL.md contract: first paragraph after chart 1, at most 80 words, with the key number) first says, in a sentence or a clause, why the measure matters to a reader (risk, money, health, time), then what changed and where, with a concrete subject and an active verb; the number follows, inside the summary. The stake is a claim from the data or a linked source in the outline. A human scene (a named case or quote) may open instead, only if a cited source has it; never invent or composite one. No bracket, code or definition in the first sentence; don't repeat the dek.

**Check:** Before the first number, does the reader know why it matters? Is any scene or quote in a cited source? Does the first sentence contain a bracket, code or definition, or repeat the dek?

> **Bad.** The average new car registered in the EU, Iceland and Norway weighed 1,608 kg in 2025, which is 157 kg more than in 2020.
> **Good.** A heavier car is more likely to kill the people in the car it hits (a study the original links). New cars in the EU, Iceland and Norway keep getting heavier: in 2025 they weighed 157 kg more on average than in 2020.

## 2. Few numbers, and say the finding once

Pick the few numbers the argument needs, usually one per beat; the rest stay on the chart, in the alt text and in the data. One number per sentence, two only for a comparison, at most one per opening sentence; under one per sentence overall (originals: about 0.8). Keep values exactly as the chart labels them; fractions in words ("a fifth", "three times") count. A list of three or more values becomes the pattern plus the one value that makes it. Ranges, slope sweeps and tie thresholds a claim check requires are exempt; split them rather than cut them. Say the finding once: title, opening and close carry it (rule 9); elsewhere cut any sentence that repeats it or an earlier figure without adding evidence, a qualification or a needed baseline. Each section adds something new: a breakdown, an exception, an attributed cause, a consequence.

**Check:** Numbers per reader-facing sentence, ignoring years and exempt kinds: under one on average, fewer than one in six with three or more? Does any sentence outside the close repeat an earlier point and add nothing?

> **Before.** Weekday morning trips rose 118.4%, weekend trips 12.7%, evening trips 31.2% and night trips 4.9%.

> **After.** Weekday morning trips rose 118.4%, far faster than any other time of day. The next fastest, evening trips, rose 31.2%.

> **Bad.** Whole terms tell the same story. The 100th Congress finished with 713 public laws; the 118th finished with 274.
> **Good.** Waiting for the end of the term doesn't close the gap: the 118th Congress finished with 274 public laws, the fewest of any completed Congress in this series.

## 3. Define a term in one clause, where the reader first needs it

No definitions section between the opening and the first finding. Define each term once, inside the sentence that first uses it, in everyday words. Source codes, version labels and sampling terms (week numbers, release IDs, "balanced panel") go to "How this was made" unless a claim can't be read without them.

**Check:** Is there a definitions or method section before the first finding? Does the body contain a code or label a non-specialist would have to look up?

> **Before.** ## What these numbers are
> The data is counter-level hourly totals (dataset v3.2) from the 64-site automatic network, by ISO week.

> **After.** The counters, 64 roadside sensors that log each passing bicycle, show the morning rise at 58 of the 64 sites.

## 4. Make each heading a claim

A section heading states what the section shows, so a reader skimming the headings gets the argument. Labels such as "What the data says", "What these numbers are", "Context" or "Why it matters" carry nothing. "How this was made" stays as the last heading: it is a signpost. A heading for attributed explanations names that they are others' ("What transport planners say").

**Check:** Read the headings alone, in order. Is each one a sentence-like claim (except "How this was made")?

> **Before.** ## What the data says / ## Context / ## Why, according to others

> **After.** ## The growth is on weekday mornings / ## Weekend trips barely moved / ## Planners credit the new lanes; the counts can't test that

## 5. Open each paragraph with its link to the last

Each paragraph after the first starts by saying how it changes, qualifies or explains the one before: a link word ("But", "So", "That is partly because", "The exception is") or a back-reference to the last paragraph's subject. Don't open on a fresh number with no link. The middle should read as a question carried forward, not as findings in the order the data came.

**Check:** Read only the first sentence of each paragraph. Does each open with a link word or name the previous paragraph's subject?

> **Before.** Weekend trips were 87,300 in 2025. Evening trips were 52,100 in 2025.

> **After.** Weekends are the exception to the morning surge. Weekend trips rose 12.7%.

## 6. Introduce each chart in one sentence, then say what follows

Before every chart after the first, one sentence tells the reader what the chart compares and what to look for. After it, say what follows from it. Place each chart directly after the sentence that uses it. This is not narrating the chart (the voice guide still bans "then it rises, then it dips"): it is where to look, plus the conclusion. Chart 1 is exempt: it comes first and the opening summary interprets it. A lead-in names what the chart compares, never what drives it ("what that gap does to births" read as causal and cost a D2 point).

**Check:** Is every chart after the first preceded by a sentence naming what it compares? Is each chart next to the paragraph that cites it?

> **Before.** [chart] Hourly trips peaked at 8 am at 6,420.

> **After.** The change is concentrated in two hours: the chart below compares each hour of the day in 2015 and 2025. [chart] At 8 am trips reached 6,420; outside 7 to 9 am, the two years' lines almost overlap.

## 7. Give each caveat once, in plain words, where the doubt arises

Keep every caveat the outline requires. Say each one once, in the reader's terms, beside the claim it limits, and merge stacked qualifiers into one sentence. A caveat that limits the headline itself (what a benchmark like "replacement" means and how much it varies) stays in the body, in one clause beside the headline. Measurement mechanics (rounding, weighting, version comparisons, sensor uptime) move to "How this was made", with a short pointer in the body when a claim depends on them. Don't say a figure "may be revised" unless the source says so.

**Check:** Does any paragraph carry two or more hedges in a row? Can each outline caveat be traced to a sentence, in the body or in the method section?

> **Before.** These are counter totals, not unique riders; the figures are not adjusted for sensor downtime, which varies by site; the 2025 series is provisional according to the city; comparisons across years reflect the network as configured.

> **After (body).** The counters log trips, not riders, and the city calls the 2025 figures provisional (more in "How this was made").
> **After (method section).** Totals are not adjusted for sensor downtime, which varies by site, and year-on-year comparisons use the network as configured in each year.

## 8. Give the headline number a yardstick, from numbers already in the story

When a number is the point, set it against something the reader can picture: another number already in the story or outline, a ratio of two such numbers, or an attributed source. A metaphor may label a real mechanism ("works like a savings account") but may not replace the number or imply a cause the data doesn't show. A yardstick the outline doesn't contain is an outline change.

**Check:** Does the headline number have a comparison next to it? Is every comparison computed only from numbers already in the story, or attributed?

> **Before.** Weekday morning trips rose by 22,330 between 2015 and 2025.

> **After.** Weekday morning trips rose by 22,330 between 2015 and 2025, more than in all other times of day combined (14,800).

(Both numbers are already on the chart.)

## 9. Pose the question, answer it, then say what follows

The last section before "How this was made" answers the question the title raises in its first sentence, from findings already given, with its main caveat in a clause. When the commission poses a question, build the story as its answer: the opening sets out the question (as a statement, or a real question the story answers, never a rhetorical one) or its stake, and each section moves the answer on (rule 5). The answer adds no new finding. It may be followed by what follows from it (an implication or recommendation) only if the approved outline has it and the evidence carries it; a recommendation is always attributed to a named, linked source. If the outline puts others' explanations last, flag to the outline reviewer that they read better beside the finding they explain.

**Check:** Does the last reader-facing paragraph answer the question in its first sentence? Does anything in it go beyond the findings and the approved outline? (It must not.)

> **Bad.** [close] The lost jobs were almost entirely in hospitality and retail. (The industry figures cover a different measure and period from the headline fall.)
> **Good.** "We can't confidently blame the minimum wage", so the Low Pay Commission should "tread carefully". (Resolution Foundation, in its author's own voice: the answer, then a recommendation as far as its evidence goes. Ours would attribute it.)

> **Before.** ## Why, according to others
> Planners credit the new lanes. Not every count is complete.
> ## How this was made

> **After.** ## The boom is a weekday-morning boom
> Weekday morning trips more than doubled while weekend trips rose 12.7%: on these counts, the growth in cycling is a weekday-morning story, though the counters log trips rather than riders.
> ## How this was made

## 10. Write fresh from the finding

Draft from the one-sentence finding, the charts and the statistics, not by editing an earlier draft: edits keep the old draft's density and repetition (rule 2).

## 11. Name the real things the sources name

Where the data or a linked source names the laws, places, products or programmes behind a category, add one or two by name beside the aggregate. Only what the sources name; an example illustrates a count, it never stands for it.

**Check:** Is there a paragraph of category nouns ("legislation", "sectors", "measures") where a source names a real one?

> **Bad.** The current Congress has turned fewer bills into law than almost any of its predecessors.
> **Good.** The current Congress has turned fewer bills into law than almost any of its predecessors, though they include the "One Big Beautiful Bill" of tax and spending changes and a new framework for stablecoins (Pew).

## 12. Every sentence of colour must trace to the data or a linked source

Fresh prose invites background "everyone knows" facts. Each one is a claim: compute it from the package data, attribute it to a source you have opened (check the source page, not review notes), or cut it. A yardstick compares like with like (same measure, same period length, same baseline) and must hold across the whole series, not just the cases you remember: "records are usually broken by hundredths" was false for 3 of 16 cases when checked.

**Check:** For each sentence without a number, could a reviewer ask "says who?" Is every yardstick computed from the package data?

## 13. Keep "How this was made" under about 150 words

Sources linked, data vintage, definitions with denominators, the data and code links; everything else is one link to DATA.md. Caveats that limit a claim stay beside the claim in the body, not here.

## 14. Plain words must keep the measure's meaning

Translating a technical measure into everyday words is where fresh prose loses accuracy (round 2: two of six stories fell below the accuracy gate this way). Keep the threshold, the category and the denominator exactly: a fertility rate below 2.1 is not "families with fewer than two children" (a period rate is not a family size, and 2.0–2.1 is not "fewer than two"); "unvaccinated or unknown status" is not "unvaccinated"; "49 reporting jurisdictions (48 states and DC)" is not "49 states plus DC". A trend word in a heading or close ("has not slowed", "the second half of the year") must match the window the number covers.

Keep the measure, population, period, geography and category names too: h1 wrote "retail" for "retail and wholesale" and attached an industry job count to a payroll fall in people over another period (rule 9). Show the check in the NOTES.md fidelity table (SKILL.md step 4).

**Check:** For each plain-words phrase that stands for a measure, does it still mean the same threshold, category, denominator and window as the source? Is it in the NOTES.md fidelity table?

## Before handing off

Run these on the finished prose, together with the claim checks in `editorial-review.md`:

1. Numbers per sentence and restatement as rule 2.
2. No definitions or method section before the first finding.
3. Every heading except "How this was made" is a claim.
4. Every chart after the first has a one-sentence lead-in.
5. Every paragraph after the first opens with a link word or a back-reference.
6. The opening gives the stake (or a sourced scene) before the number; the last reader-facing paragraph answers the question and goes no further than the findings and the approved outline.
7. Every outline caveat and attribution is traceable to a sentence; every prose number is on a chart or on the exempt list, exactly as the chart labels it.
8. Every plain-words phrase for a measure is in the NOTES.md fidelity table and matches its source (rule 14).
9. Every sentence of background or yardstick traces to the package data or an opened, linked source (rule 12); the method section is about 150 words or fewer.
