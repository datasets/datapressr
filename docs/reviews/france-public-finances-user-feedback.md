# French public finances: reader feedback, 8 October 2026

Source: the commissioning user's response to the first hosted draft. Preserve this as evidence for future DataPressr story-skill evaluation; do not replace the original feedback with a claim that the revision solved it.

## Verbatim feedback

> this is good - is it committed along with underlying datasets in csv or whatever?
>
> and what datasets are we getting (we may want that in subdirectory data with main story in README.md or whatever).
>
> anyway main thing missing is a deeper dive into the spending on social protection etc and how that is evolving. maybe a treemap??
>
> overall use a subagent ciritqiue to develop this. what questions would a user be coming from? are they well answer.
>
> also numbers like €1,714.1 billion are hard to parse. isn't this just 1.7 trillion? isn't that more readable.
>
> also even simple graphics are more effective htere than text e.g. two micro bar charts perhaps with svg or ascii/unicode hacks you can make a little grpah that shows income vs expenditure.
>
> overall this is ok but not very deep or compelling article ... and a bit wordy in places.
>
> commit, note my ciritque somewhere (this is feedback is super useful later in training the ai skill) and iterate ...

## Lessons to test in this revision

- Passing correctness and outline reviews does not establish that the story answers the reader's questions. Add an independent reader-question critique before revising the outline.
- Unpack the largest category. A label such as social protection is an unanswered question, especially when subcategory data already exists.
- Separate the spending mix from its evolution. A treemap can explain composition; aligned time series or comparisons are needed for change. Show the GDP denominator alongside nominal euro growth.
- Format for comprehension: trillions for economy-wide totals, rounded billions for components, source precision retained in CSVs. Show revenue and expenditure on the same zero-based bar scale.
- Use prose to explain implications and mechanisms, not repeat every chart label. Keep source and accounting detail accessible outside the main narrative.
- Make the deliverable tangible: clearly list resources and dates; offer a portable story README with its data subdirectory and reproduction scripts.

## Revision direction

Keep the existing canonical dataset in datasets/france-public-finances and the DataPressr publication source in site/stories. Provide a reproducible portable bundle with the story as README.md, data/*.csv, metadata, charts and the source/build files; this avoids a second hand-edited copy. Deepen the spending section using the already archived COFOG groups, pairing a social-protection composition graphic with GDP-share evolution. Retain the annual gap and debt context but shorten repetitive prose. Review and commit the revised outline, then charts, then prose; redeploy the existing private Site.

## Completion evidence

The revision's final review and task record will record which recommendations were implemented and which reader questions remain outside the evidence.

## Round 2: colour, meaning and growth

Verbatim user feedback:

> colors are poor here (blue and greeN). let's have black-ish for revenue and red for expenditure or something ...
>
> also round 2 feedback:
>
> what is old ager ... i want to dig down ...
>
> what does that mean ... and is that because of ageing population.
>
> Overall show me what is growing
>
> also graph showing in side social progtection: the empty large circles are unclear what is 2024 and what is 2014? color both circles and make clear the more recent is solid blue i think (same size ...)

The user then supplied a screenshot of the subgroup GDP-share chart and asked:

> and how could social protection hade grown if in almost every area it shrnak

Interpretation for skill improvement: explicitly separate euro amounts, inflation-adjusted volumes and shares of GDP. A technically labelled GDP chart is not enough if the surrounding story calls spending “growing”. Show euro changes alongside GDP-share changes, identify the denominator before the reader has to infer it, and use identical marker sizes with actual coloured year keys rather than unmatched hollow/filled glyphs. Explain source category labels such as old age in everyday terms; where a reader asks why, seek demographic and pension-policy evidence instead of repeating a data limitation. Record uncertainty without using it as a substitute for investigation.

Revision direction: black-ish revenue and red expenditure; blue for 2024 and orange for 2014 in comparison charts, equal-sized solid dots and coloured column labels; direct growth ranking in euros for both the past decade and latest year; plain-language old-age definition and attributed evidence about more recipients, pension indexation and retirement-age rules. Underlying source amounts stay unchanged.
