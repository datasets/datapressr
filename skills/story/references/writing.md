# Writing the prose: sentence and structure rules

Packaged with the `story` skill. Use it in step 4, after the outline and charts are fixed. They come from a blind comparison (Factory `projects/story-remakes`, round 0, 2026-11-12) in which top published stories (Our World in Data, Carbon Brief, Reuters, FT) beat ours on writing in 12 of 12 judgements and on structure in 8 of 12, while ours won on accuracy and sourcing. The judges' words: the originals "read in one go"; ours "pack many figures into each sentence" and end "in methods". Diagnosis with quoted contrasts: Factory `projects/story-remakes/rounds/r1-diagnosis.md`.

**Wording and order only.** These rules never add a claim or drop a caveat. A new comparison, ratio, yardstick or "what to watch next" that is not in the approved outline is an outline change (step 2), not a wording change. Moving a beat to a different place from the outline is also an outline change: note it for the reviewer. Every caveat and attribution in the outline must still be traceable to a sentence. The voice guide and the claim checks in `editorial-review.md` still apply; if a rule here conflicts with a claim check, the claim check wins and you shorten something else.

The examples are invented (a fictional city's bicycle counters), not real figures. In each, the After states nothing the Before doesn't support.

## 1. Open on what changed, in plain words

The opening summary (SKILL.md contract: first paragraph after chart 1, at most 80 words, with the key number) starts with a sentence that says what changed and where, with no bracket, code or definition in it. The number can share that sentence or follow in the next one, but stays inside the summary. Don't repeat the description (dek) word for word.

**Check:** Does the first sentence contain a bracket, a code or a definition? Is it the dek verbatim? Is the key number inside the first 80 words?

> **Before.** In 2025, 41,280 trips (sensor-logged weekday crossings before 9 am, network v3.2) were recorded by the city's 64 counters, up from 18,950 in 2015.

> **After.** Weekday morning bike trips in the city have more than doubled in ten years. The 64 roadside counters logged 41,280 trips before 9 am in 2025, against 18,950 in 2015.

## 2. One or two numbers per sentence

Give each sentence one number, two if it states a comparison. Keep the values the chart labels show (don't re-round them so prose and chart disagree), but drop values the point doesn't need: they stay on the chart and in the alt text. If a sentence lists three or more values, split it, or state the pattern and give the one value that makes it. Ranges, slope sweeps and tie thresholds that a claim check requires are exempt from the count; split them across sentences rather than cut them.

**Check:** Count numbers per reader-facing sentence, ignoring years and the exempt kinds above. Do fewer than one in six sentences have three or more?

> **Before.** Weekday morning trips rose 118.4%, weekend trips 12.7%, evening trips 31.2% and night trips 4.9%.

> **After.** Weekday morning trips rose 118.4%, far faster than any other time of day. The next fastest, evening trips, rose 31.2%.

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

> **After.** Weekends are the exception to the morning surge. Weekend trips rose 12.7%, about a tenth of the weekday-morning increase in percentage terms.

(Only if that ratio is in the outline; otherwise stop after "rose 12.7%".)

## 6. Introduce each chart in one sentence, then say what follows

Before every chart after the first, one sentence tells the reader what the chart compares and what to look for. After it, say what follows from it. Place each chart directly after the sentence that uses it. This is not narrating the chart (the voice guide still bans "then it rises, then it dips"): it is where to look, plus the conclusion. Chart 1 is exempt: it comes first and the opening summary interprets it.

**Check:** Is every chart after the first preceded by a sentence naming what it compares? Is each chart next to the paragraph that cites it?

> **Before.** [chart] Hourly trips peaked at 8 am at 6,420.

> **After.** The change is concentrated in two hours: the chart below compares each hour of the day in 2015 and 2025. [chart] At 8 am trips reached 6,420; outside 7 to 9 am, the two years' lines almost overlap.

## 7. Give each caveat once, in plain words, where the doubt arises

Keep every caveat the outline requires. Say each one once, in the reader's terms, beside the claim it limits, and merge stacked qualifiers into one sentence. Measurement mechanics (rounding, weighting, version comparisons, sensor uptime) move to "How this was made", with a short pointer in the body when a claim depends on them. Don't say a figure "may be revised" unless the source says so.

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

## 9. Close by answering the opening question, then the method

The last section before "How this was made" returns to the question the title raises and answers it from the findings already given, with its main caveat in a clause, not as a separate closing hedge. If the outline puts others' explanations last, flag to the outline reviewer that they read better beside the finding they explain; don't move them without that approval.

**Check:** Does the last reader-facing paragraph answer the title's question in its first sentence? Does it add any claim not made earlier? (It must not.)

> **Before.** ## Why, according to others
> Planners credit the new lanes. Not every count is complete.
> ## How this was made

> **After.** ## The boom is a weekday-morning boom
> Weekday morning trips more than doubled while weekend trips rose 12.7%: on these counts, the growth in cycling is a weekday-morning story, though the counters log trips rather than riders.
> ## How this was made

## Before handing off

Run these on the finished prose, together with the claim checks in `editorial-review.md`:

1. Fewer than one in six reader-facing sentences has three or more numbers (years and claim-check-required ranges excluded). Round 0 originals: median 11%; ours: 33%.
2. No definitions or method section before the first finding.
3. Every heading except "How this was made" is a claim.
4. Every chart after the first has a one-sentence lead-in.
5. Every paragraph after the first opens with a link word or a back-reference.
6. The last reader-facing paragraph answers the title's question and adds no new claim.
7. Every outline caveat and attribution is traceable to a sentence; every prose number is on a chart or on the exempt list, exactly as the chart labels it.
