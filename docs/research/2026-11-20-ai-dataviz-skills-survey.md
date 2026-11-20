---
date: 2026-11-20
title: "No one has built a strong data-viz skill for AI agents yet"
status: research note (may become a blog post)
source: Factory projects/story-formats/viz-skills-survey.md (survey run 2026-11-20)
beads: datapressr-rbr (parent), datapressr-fje, datapressr-qni, datapressr-htr, datapressr-e4w, datapressr-4cb
---

# No one has built a strong data-viz skill for AI agents yet

AI coding agents now draw a lot of charts. Ask Claude Code, Codex or Cursor for a chart and it will write matplotlib, D3 or Observable Plot code in seconds. Whether the result is any good depends on what the agent knows about chart craft, and since late 2025 that knowledge has increasingly come from **skills**: small packages of instructions, references and scripts (a `SKILL.md` and its folder) that an agent loads when a task matches.

For slides and web pages there are skills that clearly raise the quality of what agents make. We wanted to know whether the same is true for data visualization, both to pick up good ideas for DataPressr's own chart method and to see where it stands.

**Short answer: no.** Out of thirteen serious data-viz and design skills, none is a complete, opinionated chart skill that takes an agent from data to a finished, checked editorial chart. The good material is scattered: a deep craft reference in an OpenAI plugin, a fine chart critique and an inspiration search from Yan Holtz, a real-font label check from an unknown author, and a workflow pattern from a slides skill. DataPressr's own charting guide is already stronger than most of what is published. That is a gap, and DataPressr can fill it.

## The question and the method

The question: which published agent skills (Claude Code / Agent Skills `SKILL.md`, or Codex and Cursor packs that convert easily) are good enough to learn from for two jobs: editorial story charts (Observable Plot and hand-written SVG, rendered to static SVG in Node, at desktop and phone width) and short comparison graphics with matching social cards (1080×1350).

What we searched, on 20 November 2026:

- GitHub repository and code search for `SKILL.md` files mentioning dataviz, D3, Observable Plot, infographic and Tufte;
- the awesome-claude-skills lists, the skills.sh and claudemarketplaces listings;
- general web search for data-visualization agent skills and plugins.

**Every skill in the table below was cloned and read in full**: its `SKILL.md` and its main references, templates and scripts, not just its description or README. Descriptions often promise much more than the files deliver; several popular "chart" skills turned out to be thin wrappers. Stars and last-push dates come from the GitHub API on the survey date.

## The landscape

### Ranked table

| Rank | Skill | Repo, licence | Stars, last push | What it contains | Quality | Verdict |
|---|---|---|---|---|---|---|
| 1 | build-web-data-visualization (OpenAI, Codex plugin) | [openai/plugins](https://github.com/openai/plugins/tree/main/plugins/build-web-data-visualization); MIT declared in `plugin.json`, no LICENSE file in the repo | 8.0k, 2026-11-18 | 18 skills, 17 foundation references, 25 templates, about 10,500 lines: an editorial infographic system (claim-first defaults, named layout patterns, annotation and typography), an SVG polish reference with a token table for text sizes and stroke weights, a 20-question critique checklist, an evaluation rubric, a "concept pass, design approval, design contract" workflow and rules for humanitarian and conflict stories | High. Serious and specific; cites practice (Cairo, Cox, Bostock, Knaflic, Tufte) without imitating any outlet | Best single source of craft. Too large and Codex-specific to adopt whole; learn from its token table and critique checklist |
| 2 | dataviz-skills (Yan Holtz, of data-to-viz and the R and Python Graph Galleries) | [holtzy/dataviz-skills](https://github.com/holtzy/dataviz-skills), MIT | 106, 2026-11-10 | `inspiration`: a stdlib Python search over dataviz-inspiration.com (450+ curated projects) and Dataviz Index by chart family and technique, with thumbnails, two links and a "what to borrow" line per reference. `roast-my-chart`: a review against 61 caveats, each with Look for / Why / Fix / Fine when, severity-ordered, ending "checked 61: n flagged, n n/a, n couldn't check". Also d3+React, ggplot2 and matplotlib skills | High. Written by a domain authority; "Fine when" stops checklist pedantry | The two best ideas in the survey: give the agent visual references before it draws, and a broad severity-ranked critique after |
| 3 | frontend-slides (Zara Zhang) | [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides), MIT | 32.7k, 2026-06-23 | A 320-line skill, 13 named style presets, a 34-template pack with a tagged `selection-index.json`, a base CSS, export scripts | High for slides | Not a chart skill, but the workflow is the model to follow (see below) |
| 4 | dataviz-skills (Cédric Scherer) | [z3tt/dataviz-skills](https://github.com/z3tt/dataviz-skills), MIT | 14, 2026-11-20 | Principles (three questions, a style spectrum from analytical to custom-designed to expressive, a title taxonomy, highlight-and-grey, a font shortlist and tested palette), a workflow with a decision log, a web-dataviz skill with a 10-point ship check | High, compact, opinionated; new, hence few stars | The style spectrum and font shortlist are worth taking as vocabulary |
| 5 | editorial-infographics (aosoficial) | [aosoficial/agent-infographic-skill](https://github.com/aosoficial/agent-infographic-skill), MIT | 10, 2026-07-16 | Five visual jobs, an evidence pack marking claims verified / inference / unknown, a 16-point anti-slop gate, 1080×1350 platform notes | Good; small; directly on social cards | The thumbnail test and batch-diversity rule for cards |
| 6 | tufte-critique / tufte-chart (gnurio) | [gnurio/tufte-vdqi-plugin](https://github.com/gnurio/tufte-vdqi-plugin), **no licence** | 313, 2026-07-23 | A nine-criterion rubric with page-cited anchors, a lie-factor computation, named chartjunk species | Good, source-grounded; doctrinaire alone | Ideas only (no licence, so no text): the computed lie factor |
| 7 | technical-figure (gigio-figures) | [gigio1023/gigio-figures](https://github.com/gigio1023/gigio-figures), MIT | 0, 2026-11-04 | A Node `lint.mjs` that renders SVG with the real fonts and measures real bounding boxes (text overlap, text crossed by a line, overflow, text too small at delivery width, contrast), a palette audit, a contact-sheet script | Good engineering; unknown author, no users yet | The most valuable mechanical idea: measured, not estimated, label layout checks |
| 8 | design-dataviz (Hugging Face research-article template, Thibaud Frere) | [tfrere/research-article-template](https://github.com/tfrere/research-article-template/tree/main/.ai/skills), licence unclear | 47, 2026-11-08 | 175 lines: claim first, question-to-chart table, encode by accuracy, label directly, review checklist | Good, tight, close to DataPressr's house rules | A cross-check; cite, don't copy |
| 9 | impeccable (Paul Bakaus) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable), Apache-2.0 | 114k, 2026-11-18 | A web-UI design system: modes, 24 sub-commands (`critique`, `polish`, `bolder`, `quieter`, `distill`...), a craft-floor refuse list, screenshot CLI | High for web UI; little on charts | Named critique moves (bolder, quieter, distill) and the refuse list |
| 10 | frontend-design (Anthropic) | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design), see LICENSE.txt | 198k, 2026-11-16 | A short skill: ground the design in the subject, a list of the five commonest AI looks to avoid, review the token plan against the brief before coding | High and short | The "five default AI looks" calibration list |
| 11 | tufte-data-viz (Caylent) | [caylent/tufte-data-viz](https://github.com/caylent/tufte-data-viz), MIT | 238, 2026-11-19 | 22 universal rules plus per-library rule files (Recharts, ECharts, Chart.js, matplotlib, Plotly, D3, SVG) | Decent; rigid (no gridlines ever, never a legend) | Range-frame axes as an option; little else |
| 12 | ft-charts | [Jason-W507/ft-charts](https://github.com/Jason-W507/ft-charts), MIT | 0, 2026-07-05 | FT Visual Vocabulary families, FT-inspired matplotlib and Plotly helpers with open fonts | Thin but correct | Vocabulary ("magnitude" for two-number comparisons) |
| 13 | oil-ui | [oil-oil/oil-ui](https://github.com/oil-oil/oil-ui), MIT | 3.6k, 2026-11-20 | A UI workflow: one-sentence north star, three directions side by side on one page, isolated screenshot review scored out of 10 | Good for UI; not charts | Confirms the show-three-then-pick pattern |

Note the inverse relation between popularity and usefulness. The best chart material sits in repos with 14, 106 and 0 stars; the 100k-star repos are UI and landing-page skills.

### Ones to avoid, and why

- **antvis/chart-visualization-skills** (540 stars, MIT): the main skill posts your data to an Alipay/AntV server and returns a hosted image URL. Your data leaves the machine and the output is library-default styling.
- **nextlevelbuilder/ui-ux-pro-max-skill** (152k stars): a CSV "design intelligence" database. Its chart advice says "each bar: distinct color" for category bars, the opposite of editorial practice.
- **Leonxlnx/taste-skill** (119k stars): a landing-page builder. Strong for marketing sites, irrelevant to charts.
- **larashero3-dotcom/lieflat-charts** (6.9k stars): a genuinely attractive, Giorgia Lupi-inspired template gallery, but **PolyForm Noncommercial**, with paid commercial licences and an attribution prompt injected into every reply. Look at the gallery; don't use the skill.
- **maragudk observable-plot** (49 stars): API notes, no design content.
- **anthropics/knowledge-work-plugins create-viz** and **anthropics/skills canvas-design**: generic analyst charts, and an art-poster generator; neither is for editorial data graphics.

## What good looks like

### The frontend-slides pattern

frontend-slides is the most successful design skill in the survey, and it wins for a reason worth copying: **it never asks the user to describe taste in words.** It shows three real, finished-looking first slides of the user's own deck (one safe preset, at least one bold template, one wildcard designed for the brief) and asks them to pick or mix.

Three things make this cheap and reliable:

1. **Progressive disclosure through a compact index.** The agent reads a small `selection-index.json` of 34 templates tagged by mood, tone, formality, density, colour scheme, best-for and avoid-for; then only the shortlisted preview specs; and only the chosen template's full design spec after the pick. Options stay diverse without flooding the context.
2. **Preview authenticity rules.** Previews must look like real content: no "Option A", template names, file paths or requirement notes on the canvas. The user judges the design, not a diagnostic card.
3. **Hard invariants that keep previews honest.** A fixed 1920×1080 stage scaled whole, never reflowed; one mandatory base stylesheet; a rendered-screenshot overflow check at desktop and phone width.

The taste rules themselves ("dominant colours with sharp accents", "avoid Inter and purple gradients") are shared with Anthropic's frontend-design. What is reusable is the structure around them: a tagged library of named directions, plus show-three-then-pick. No chart skill does this.

### The best ideas found

- **Craft specs and a critique checklist (OpenAI build-web-data-visualization).** An SVG token table that turns "make it crisp" into numbers: tick labels 11 px, direct labels 12 px, gridlines 0.75 px, data lines 1.75 px, focus lines 2.5 to 3 px, tick padding 6 to 8, three to five ticks on mobile, `crispEdges` on straight rules. And a 20-question critique checklist whose best questions are: is the key comparison visually dominant? Is mobile designed separately rather than stacked in DOM order? Does it survive greyscale and export? Is it original rather than borrowing a publication's identity? Is the framing humane in conflict and aid stories?
- **Inspiration before drawing (Holtz).** Agents have no visual culture; they reach for library defaults. Holtz's `inspiration` searches a curated gallery by chart family and technique, downloads thumbnails so the agent actually looks at them, and requires two links and a "what we're borrowing" line per reference. It turns "make it look good" into "make it look like these three, for these reasons".
- **Roast my chart (Holtz).** 61 caveats, each with what to look for, why it matters, how to fix it, and, crucially, **when it is fine**. Findings come back severity-ordered with an honest count of what was checked, flagged, not applicable or not checkable. That last line is what separates a real review from a vibe check.
- **The real-font label check (gigio-figures).** Most chart code in Node estimates text width from average glyph sizes. gigio's lint renders the SVG with the real fonts and measures the actual bounding boxes, then flags text on text, text crossed by a line, text overflowing the canvas and text below the minimum size at delivery width. DataPressr's estimated-width `chart-clipping` check missed a label collision in the solar-overtakes-wind story that a measured check would have caught.
- **The lie-factor test (Tufte, as computed by gnurio).** `(size of effect shown) / (size of effect in data)`, acceptable between 0.95 and 1.05. Trivial for bars from zero; it matters for any treatment that encodes value as area or count: circles, square grids, icon arrays. Making it a computed check, not a reviewer's judgement, stops an area chart from quietly exaggerating by encoding radius instead of area.
- **Thumbnail checks (aosoficial).** View a batch of social cards at about 240 px: is each distinguishable without reading the footer, and is the smallest essential label still readable? Plus a batch-diversity rule: in a run of four or more cards, at least three layout families and no more than two sharing a composition.
- **Smaller borrowings.** Scherer's style spectrum (analytical, custom-designed, expressive) settles how much expression a format allows. Anthropic's list of the five commonest AI looks (cream plus terracotta serif, near-black plus acid accent, hairline broadsheet, SaaS card kit, template chrome) works as a calibration check on any proposed direction. impeccable's bolder / quieter / distill gives critics shared verbs.

## Where DataPressr stands

DataPressr's `story` skill and its [charting guide](../../skills/story/references/charting.md) already do much of what the best public skills do, and some things none of them do:

- **A grounded house style with checks.** Fourteen design rules, each with a check question and a source (a design audit against FT, Our World in Data, Datawrapper, Pew, Ember and The Economist, and principle notes from Tufte, Knaflic, Few, Munzner and others). Several are machine-checked by `story-check`: frame (title, subtitle, source inside the SVG), rendered text size, text and mark contrast, colour-vision simulation, accent count, phone height, phone key, alt text with values, a linked data file.
- **One spec, two sizes.** Desktop and phone charts come from one `chart()` call; every chart ships a `-mobile.svg` checked at 326 px.
- **Correctness discipline no public skill has.** Annotation values are read from the data rows at build time, never typed; output is byte-identical across two builds; series on different calendars are never joined by date; missing values are never plotted as zero.
- **Formats and cards.** A comparatron format with a fairness checklist and reverse test, and a `card()` builder for 1080×1350 social cards with its own checks (text size, word count, safe zone, one hero number, contrast).
- **Independent review gates** on the outline and the finished draft, with chart integrity and rendering as part of the editorial review.

Compared with the ranked list, this is closest to OpenAI's plugin in seriousness and ahead of it on reproducibility and machine checks. It is ahead of every Claude Code chart skill we found.

The gaps are real, though, and they are exactly where the survey found good ideas:

1. **No look-and-feel step.** Charts get one house look. There is no "show three directions with the real numbers, then pick" step for a new format or a flagship story.
2. **No inspiration step.** The chart plan names the comparison and marks, but the agent never looks at strong published examples before drawing.
3. **No broad critique checklist.** The house rules are a style contract, not a review instrument. The editorial review checks chart integrity and rendering in general terms; it has nothing like a 61-item, severity-ranked, "fine when"-qualified roast.
4. **Estimated text widths.** The skill says so itself: `chart-clipping` and `frame()` wrapping use average glyph widths, and the guide asks the writer to look at the rendered PNGs. A real collision has already slipped through.
5. **No computed lie factor.** The comparatron rules say proportional area only with area encoding the value, but nothing computes it.
6. **Card checks stop at the single card.** No thumbnail-size check and no diversity rule across a batch of cards.
7. **No numeric cross-check of the token sizes** against an external reference such as OpenAI's SVG table.

## Implication: a positioning opportunity

The survey's main finding is a gap: **there is no strong, opinionated data-viz skill for AI agents.** There are deep references too large to load, short rule lists that stop at style, good critiques without a drawing workflow, and design workflows that know nothing about charts. Nobody combines a chart method, real checks and a taste workflow in one installable skill.

DataPressr is already most of the way there, and a good chart skill is a reason to install it that does not depend on caring about dataset wrangling. What would make it the best one, concretely:

1. **Show three, then pick.** For a new format or a flagship chart: one safe (house) direction, one bold, one wildcard designed for the subject, rendered with the real numbers at desktop, phone and card size on one contact sheet, with no option names or process notes on the canvas. Backed by a small tagged index of named directions, read progressively, as frontend-slides does.
2. **An inspiration step in the chart plan.** Three to five published references by chart family and technique, each with both links and one line on what is borrowed, crediting the gallery's licence.
3. **A DataPressr chart critique.** Our own severity-ranked checklist, built from the house rules plus the best questions in OpenAI's checklist and the ideas in Holtz's roast (look for / why / fix / fine when, and an honest checked / flagged / n/a count), run as a named pass in editorial review.
4. **Measured label layout.** Render with the real fonts, measure text boxes and flag overlap, text crossed by marks, overflow and undersized text at 326 px and on cards, replacing estimated widths.
5. **A computed lie-factor check** for every area, grid or icon treatment, failing outside 0.95 to 1.05.
6. **Social cards that survive the feed.** Thumbnail check at about 240 px and the batch-diversity rule for a run of cards.
7. **Comparatron forms.** A small library of named, tested two-number forms (bars from zero, 1-against-N grid, area-true circles, unit stacks) inside the direction index, each with its checks.

All of this is to be built into DataPressr's own skill, in its own words and code, not by installing other skills. Credit each source where an idea came from, and respect the licences: MIT sources (Holtz, gigio, aosoficial, Scherer, frontend-slides) can be adapted with attribution; OpenAI's plugin declares MIT without a licence file, so paraphrase and credit; gnurio's plugin has no licence and Frere's licence is unclear, so take ideas only, never text.

## Recommended next steps

Each is a DataPressr bead under the parent **Make DataPressr the best data-viz skill** (`datapressr-rbr`). Each lands as a reusable method change with a test where it is mechanical and a LESSONS line, per DataPressr's conventions.

1. **Own inspiration step in the chart plan** (`datapressr-fje`) (from Holtz's `inspiration`): a chart-plan column or short section with 3–5 references, both links, one line on what is borrowed; a small helper to search a curated gallery and fetch thumbnails, written for DataPressr with credit.
2. **Own chart critique checklist** (`datapressr-qni`) (from OpenAI's critique checklist and Holtz's roast): a `references/chart-critique.md` with severity-ranked items, each with look for / why / fix / fine when, and a checked / flagged / n/a / couldn't-check summary; wired into `editorial-review.md`. Also cross-check the template's `T` sizes and stroke weights against OpenAI's SVG token table.
3. **Real-font label check** (`datapressr-htr`) (idea from gigio's `lint.mjs`): measure rendered text boxes with the real fonts; flag overlap, text crossed by marks, overflow and undersized text at 326 px, 720 px and card size; replace estimated widths in `chart-clipping`. Regression fixture: the solar-overtakes-wind collision.
4. **Computed lie-factor check** (`datapressr-e4w`) (idea from Tufte via gnurio, no text copied): compute shown-versus-data effect size for area, grid and icon encodings in charts and cards; fail outside 0.95–1.05.
5. **Direction-pack workflow** (`datapressr-4cb`) (pattern from frontend-slides): a tagged index of named chart and card directions (including the comparatron forms), show-three-then-pick on one contact sheet, preview authenticity rules, card thumbnail and batch-diversity checks.

Source survey, with per-skill detail: Factory `projects/story-formats/viz-skills-survey.md`.
