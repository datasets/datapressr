# DataPressr adoption audit (2026-09-25)

Scope: can an outside person arrive at https://datapressr.datahub.io or github.com/datasets/datapressr, install the skills, wrangle a dataset and write a data story? Research and scratch experiments only; nothing in the repo was modified and nothing was posted. Scratch work is in `scratchpad/adopt/`.

## TL;DR

1. **Blocker: the documented install silently drops the two core skills.** `npx skills add datasets/datapressr` (skills CLI 1.7.0) reports "Found 6 skills" and skips `archive` and `structure` with a YAML parse error. The homepage's second command, `npx skills add datasets/datapressr --skill structure`, fails outright with "No matching skills found for: structure" (exit 1). Cause: their unquoted `description:` values contain `status: archived` / `status: structured`, and a `: ` inside a plain YAML scalar is invalid. `enrich` and `story` quote their descriptions and parse fine. Verified fix: quoting the two descriptions makes the installer find all 8 skills. Claude Code's own loader is lenient (it loads them inside the repo), which is why this went unnoticed; stricter agents and the installer are not.
2. **Installed skills are not self-contained.** In a fresh directory, a headless Claude Code run of `init` then `validate` could not complete init steps 3 and 4 (copy `AGENTS.md`, copy `scripts/validate-datapackage.mjs`) because neither ships with the installed skill, so `validate` fell back to hand checks. `structure` and `archive` point to repo-only files and paths too; `capture` would file ideas in *DataPressr's own* Inbox issue.
3. **The site's catalogue is stale.** `/datasets` lists 3 datasets (one of them external) out of the 6 in `datasets/`, and marks co2-ppm as `structured` when it is `enriched`. Internal pages (`/review`, `/charting-spike.html`) appear in the public sidebar, and the stories index mixes the outlines in with the finished stories.
4. With those fixed, the homepage copy, example prompts and the oil-prices story are a strong base. The main gaps are a tiny end-to-end tutorial that runs from an empty folder, a visual catalogue, and a "what it is not" section. Only after that is outreach worth doing.

## 1. Repo docs vs live site

All nav pages return 200 (`/`, `/docs`, `/docs/cli`, `/datasets`, `/stories`, `/stories/oil-prices`, `/changelog`). The live content matches the repo at `origin/main` (13152f0); the homepage chart SVG renders. Findings:

### site/datasets.md (live `/datasets`): stale and incomplete

Actual status in each `datapackage.json` (all six pass `validate-datapackage.mjs` with 0 errors, 0 warnings):

| Dataset (in `datasets/`) | Actual status | Listed on /datasets? | Listed status | Views | README |
|---|---|---|---|---|---|
| co2-ppm (climate-and-environment) | enriched | yes | **structured (wrong)** | 3 | yes |
| oil-prices (energy-and-commodities) | enriched | yes | enriched | 2 | yes |
| tesla-quarterly-deliveries (transport) | structured | **no** | n/a | 0 | yes |
| airports (transport) | structured | **no** | n/a | 0 | **no** |
| population-growth (demographics) | structured | **no** | n/a | 0 | **no** |
| us-natural-hazard-statistics (climate-and-environment) | structured | **no** | n/a | 0 | yes |
| project-drawdown (own repo) | structured (per page) | yes | structured · own repo | n/a | n/a |

Other issues on that page:
- Project Drawdown gets a long "notes" section although it lives in another repo. This takes up more of the page than the 4 datasets that are missing.
- The page has no charts or cards. There is no indication of what each dataset looks like, how big it is or what period it covers.
- The Tesla and NWS datasets are cited as worked examples on the homepage and docs, but they aren't on the datasets page. The changelog announces the NWS dataset, but it isn't there either.
- The "Data stories" section repeats `/stories` and contains internal commentary aimed at the maintainer ("first hand-written story; its friction notes feed the charting decision…", "Author's voice pass outstanding").

### Other site issues

- **Internal pages are public and shown in the sidebar.** The homepage's sidebar tree links "What to review now" (`/review`, the owner's review queue) and `/charting-spike.html` (a spike). Neither is useful to a newcomer, and both make the project look unfinished. `site/config.json` `contentHide` hides only `/changelog`.
- **Stories index** (`<List dir="/stories" />`) shows six entries: three "Outline: …" pages mixed in with the three stories. A newcomer can't tell which ones are the finished pieces. The outlines are a real selling point (they show the reviewed argument), but they belong under their story, not side by side with it.
- **`/docs/cli`** ("Working with datasets using AI assistants"):
  - The quick start (`npx skills add …` then `mkdir world-gdp && cd world-gdp && claude`, then `/init world-gdp`) creates `world-gdp/world-gdp/`.
  - It says "Install the skills into your agent once", but the installer's default is *project* scope (`./.claude/skills/`), not once per machine.
  - The session is started in a subdirectory of the one where the skills were installed. Whether Claude Code picks up skills from the parent directory there is untested and should be verified.
  - The tool table says Codex/Gemini read skills "via npx skills add". The installer supports them, but no run in those agents has been tested or recorded.
  - It lists `capture`, `archive` and `structure` as slash commands but omits `enrich` and `story`.
- **Homepage "Wrangle a dataset"**: it admits that `init` needs a clone of the repo ("clone the repository so the agent has the accompanying AGENTS.md and validator script"). So the headline install does not deliver a working first step. Its example prompt names `archive` and `structure`, the two skills the installer currently drops. The agent will improvise instead of following the playbook.
- **Homepage "Make a data story"**: the example reruns a story that already exists (oil prices, April 2020) and requires a clone. That is fine as a demo, but there is no example that starts from the reader's own data.
- **Root README.md** is written for maintainers ("Start a new agent session with 'Read NEXT.md and follow it'", Beads). A GitHub visitor gets no install command, no link to the site and no picture. For many people it is the real front door.
- **Minor**:
  - The doc slug `/docs/lifecyle` is a typo, and it is referenced from the skills too.
  - `config.json` sets `logo: "🍇"`, but the rendered header logo is Flowershow's default `logo.png`. The favicon is correct.
  - `skills/README.md` still says `capture` files "as a GitHub issue", while the skill now files to the Inbox issue or Beads.

## 2. Newcomer install walk-through (scratch)

Environment: Node 26.4, `npx skills` 1.7.0, Claude Code 2.1.282. I ran with `HOME` pointed at a scratch `fakehome/` so nothing could land in the real `~/.claude`. Nothing was installed globally: the installer defaults to project scope.

1. `npx skills --help` shows no interactive prompts when `-a <agent> -y` and `--skill` are given. The docs' plain `npx skills add datasets/datapressr` form is interactive (choose skills and agents). That's fine, but `skills/README.md` is the only place that shows the non-interactive flags.
2. `npx skills add datasets/datapressr --list` printed:
   ```
   ⚠ Skipped …/skills/archive/SKILL.md — YAML parse error: Nested mappings are not allowed in compact mappings at line 2, column 14
   ⚠ Skipped …/skills/structure/SKILL.md — YAML parse error: …
   ◇ Found 6 skills   (capture, enrich, init, push, story, validate)
   ```
3. `npx skills add datasets/datapressr --skill '*' -a claude-code -y` in an empty git repo:
   - It installed 6 skills as **copies** into `./.claude/skills/<name>/` and wrote `./skills-lock.json`.
   - `enrich` and `story` carry their `references/` folders. `init` and `validate` are a bare `SKILL.md`.
   - It ends with a "Review skills before use; they run with full agent permissions" notice and some npm upgrade noise.
4. `npx skills add datasets/datapressr --skill structure -a claude-code -y` → "No matching skills found for: structure", exit 1, nothing installed. **This is the second install command on the homepage.**
5. Fix check: I copied `skills/` to scratch, JSON-quoted the two `description` values and ran `npx skills add ./fixtest --list` → "Found 8 skills". A one-line fix per file.
6. Headless test (`claude -p`, in the scratch project with the 6 installed skills): "Use the init skill to scaffold tiny-test, then run validate; report steps you could not complete."
   - Init steps 1, 2 and 5: done.
   - **Init step 3 (copy AGENTS.md): not done.** The file isn't present.
   - **Init step 4 (copy the validator): not done.** The file isn't present.
   - Validate step 1 (run the script): not done. It fell back to the manual checklist.
   - The agent correctly declined to invent stand-ins, so an outsider's first dataset starts without the conventions file or the deterministic validator.
7. Also: the real validator exits 1 on a freshly scaffolded stub ("`resources` is missing or empty"). AGENTS.md meanwhile says a stub has "No files yet. Publishable." So a newcomer's first `/validate` is red. That contradiction should be resolved: demote it to a warning while `status` is `stub`.
8. skills.sh directory: `npx skills find datapressr` does not return DataPressr (listing is driven by installs), so the project can't currently be discovered there.

## 3. Do skills work outside this repo? Concrete breakages

For each skill: what it references, and what happens once it is installed elsewhere.

- **archive**:
  - Frontmatter is invalid YAML, so the installer skips the skill (see above).
  - "see the rigor pass in `docs/plans/skills-vision.md`" (twice): a dead path. The file is also internal planning.
  - `/init` step reference: works, subject to init's own breakages.
- **structure**:
  - Frontmatter is invalid YAML, so the installer skips the skill.
  - "Read `AGENTS.md` in the dataset directory first … `AGENTS.md` → Data conventions" (3×): that file doesn't exist unless init copied it, which it can't.
  - `node scripts/validate-datapackage.mjs .` (2×, including the definition of done): no such script.
  - "`scripts/wrangling-idioms.mjs` in this repo (`npm test` covers it)": the key reusable helpers (`cleanNumber`, `num`, CSV writer) aren't shipped.
  - Worked examples as repo-relative paths: `datasets/climate-and-environment/co2-ppm`, `datasets/energy-and-commodities/oil-prices`, `datasets/demographics/population-growth`, `datasets/transport/airports`. They are dead once installed; bead datapressr-zwt item 2 decided to make them absolute GitHub URLs, not yet done.
  - `docs/plans/skills-vision.md`: dead path.
  - Sibling-repo examples (`precious-metals-prices`, `millennium-macroeconomic-data-uk`) are already absolute URLs and fine.
- **init**:
  - Step 3 "Copy … from the repo's `AGENTS.md` … above its `<!-- repo-only -->` marker": there is no source outside the repo.
  - Step 4 "Copy the repo's `scripts/validate-datapackage.mjs`": there is no source.
  - "Inside the DataPressr repo, run `node scripts/sync-dataset-agents.mjs`": only relevant in the repo. Note: at audit time that script was committed locally but not yet on `origin/main`, while the skill text referencing it is.
- **validate**:
  - Its primary path needs `scripts/validate-datapackage.mjs` in the dataset. The fallback tells the user to "copy it from the datapressr repo" without a URL.
  - It works in degraded mode: an LLM re-derives the checklist, which is exactly what the script exists to avoid.
- **capture**:
  - "add one checklist line to the open 'Inbox — quick finds to triage' issue in `datasets/datapressr`": for an outside user this targets the maintainer's tracker. It either fails (no write access) or falls back to commenting or opening issues on DataPressr.
  - Also references `site/docs/lifecyle.md`, `docs/next-session-brief.md`, `bd` and `datasets/BACKLOG.md`. These are all repo-internal.
  - It should default to the *current* project's tracker (or a local `INBOX.md`) and mention DataPressr's Inbox only when running inside the DataPressr repo.
- **enrich**: mostly portable. It has explicit "Other projects" guidance and bundles `references/enrich-template.ts` and `views.md`. The only breakage is "Re-run the validator (DataPressr: `node scripts/validate-datapackage.mjs .`)".
- **story**: portable. `references/` bundles craft, voice, charting and the template, and "Other projects" guidance covers the output location. The DataPressr-specific lines (`site/stories/`, link from `site/datasets.md`) are clearly labelled as DataPressr defaults.
- **push**: portable in text. It depends on the `dh` CLI from a `staging` branch of datopian/datahub-next and on a DataHub publication, which outsiders are unlikely to have. It is OK because it skips cleanly, but docs should say that publishing to DataHub needs an account and is optional.

Fix pattern (small):
- Ship `validate-datapackage.mjs` inside `skills/validate/scripts/` and a dataset-conventions `AGENTS.md` inside `skills/init/references/`. Both can be generated by the existing sync script, and `npm test` can check they're current.
- Have `init` copy from its own skill directory, with a fallback to an absolute raw GitHub URL.
- Replace every repo-relative path in `skills/` with an absolute GitHub URL, or with a `references/` file where the content is needed at runtime (e.g. `wrangling-idioms.mjs`).
- Add a test that fails on any `](../`, `docs/`, `site/` or `datasets/` path in `skills/**/SKILL.md` that isn't a URL. Also a test that strictly YAML-parses every frontmatter; the installer's own `--list` against `./` is a good CI smoke test.

An alternative worth a look: package the repo as a Claude Code plugin marketplace (`.claude-plugin/`). A plugin can carry scripts and reference files alongside skills. This only helps Claude Code users, so treat it as additive to `npx skills`, not a replacement.

## 4. Assessment: what a newcomer lacks

In priority order:

1. **A working install (fix §2/§3).** Nothing else matters until `npx skills add` delivers all 8 skills and `init` → `validate` works in an empty folder.
2. **A 10-minute tutorial from an empty folder**: "Your first dataset in 10 minutes".
   - Use one tiny, public-domain, slightly messy source, so structure has something to do but it finishes fast. Candidates already used here: OurAirports `countries.csv` (~250 rows, public domain), or NOAA's Mauna Loa annual mean text file (~65 rows, `#` comment preamble, sentinels).
   - Steps: install → prompt → what you should see (tree, `datapackage.json` excerpt, validator output) → next prompt for enrich → "now try your own".
   - Commit the expected output as a reference so readers can diff their run against it.
3. **A visual catalogue on `/datasets`**: one card per dataset, generated from each `datapackage.json` so it can't drift. Each card shows the title, status badge, coverage, source, licence, a thumbnail chart (a story SVG, or one rendered from its first `view`), and links to the folder, README and story. This is the "sample output gallery" that shows what the skills produce. It also closes open beads datapressr-86o and datapressr-x5a (a chart for Tesla and NWS).
4. **"What DataPressr is and isn't"**, a short homepage or docs section:
   - Not a CLI or an app; not a hosting platform (DataHub publishing is optional); not for big data (roughly under 1 GB).
   - Not a guarantee of correctness: the validator checks metadata, and a human still reviews the numbers.
   - Not tied to one agent. State honestly which agents have been exercised: Claude Code has; the others haven't yet.
   - Also list what you need: Node ≥ 18, git, an agent with skill support.
5. **A newcomer-facing root README.md**: a one-line pitch, the install command, a link to the site and tutorial, and the oil-price chart. Move the maintainer "Read NEXT.md" line to a "Contributing / maintainers" section.
6. **Site hygiene**:
   - Hide `/review` and `/charting-spike.html` via `contentHide`.
   - Group outlines under their story, or filter them from the stories list.
   - Fix the `/docs/cli` quick start.
   - Trim the internal commentary from `datasets.md`.

Outreach assets (only after 1–3):
- **Launch post**, on the site plus a cross-post to rufuspollock.com, Datopian and LinkedIn: "Give your AI agent a data wrangler's playbook". Use the oil-price chart plus a before/after of a messy source. Be honest about limits (small data, human review).
- **Demo**: a 60–90 s screen recording or asciinema/GIF of the 10-minute tutorial compressed, showing the prompt, the archive/build/data tree, the green validator and the chart. Embed it on the homepage above "Install".
- **Directory listings**:
  - skills.sh: listing follows installs, so it needs working installs first.
  - Community "awesome Claude skills" / "awesome agent skills" lists.
  - Frictionless Data community channels (DataPressr outputs Frictionless data packages, so this is a natural audience).
  - Open data and data journalism newsletters.
  - A Claude Code plugin marketplace entry if the plugin route is taken.
- **"Made with DataPressr" invite**: a short issue template or discussion so early users can share their datasets. This also supplies a feedback loop.

## 5. Sequenced tasks (bead-sized)

Internal = repo and site changes that an agent can do. External = outward-facing, and needs owner go-ahead.

### T1. Fix SKILL.md frontmatter so the installer finds all 8 skills (internal, P1)
The `archive` and `structure` descriptions contain `status: …` inside unquoted YAML, so `npx skills add datasets/datapressr` skips them and `--skill structure` fails. Quote both descriptions and add an `npm test` check that strictly YAML-parses every `skills/*/SKILL.md` frontmatter.
- Acceptance: `npx skills add <repo-or-./> --list` reports "Found 8 skills" with no warnings; `npx skills add datasets/datapressr --skill structure -a claude-code -y` succeeds in an empty dir; the new test fails on an unquoted `: ` in a description.
- Deps: none.

### T2. Make installed skills self-contained (internal, P1)
- Bundle the validator into `skills/validate/scripts/` and the dataset-conventions `AGENTS.md` into `skills/init/references/`, both generated by `sync-dataset-agents.mjs` and kept current by `npm test`.
- Point `init`/`validate`/`structure`/`enrich` at the bundled copies.
- Convert the repo-relative worked-example and doc paths to absolute GitHub URLs (the zwt item 2 decision).
- Bundle or link `wrangling-idioms.mjs`.
- Make `capture` target the current project, not DataPressr's Inbox.
- Acceptance: in an empty dir after install, a headless agent run of `init` + `validate` completes every step (the real script runs, `AGENTS.md` is present); a test finds no non-URL repo paths in `skills/**/SKILL.md`; `capture` outside the repo never references `datasets/datapressr`.
- Deps: T1.

### T3. Let a fresh stub pass validation (internal, P2)
The validator errors on empty `resources` even when `status` is `stub`, but AGENTS.md says stubs are publishable. Downgrade it to a warning for `stub` (and `capture`) and keep it an error from `archived` on.
- Acceptance: a fixture stub validates with 0 errors; the existing fixtures still pass; the AGENTS.md wording matches.
- Deps: none. (Could fold into T2.)

### T4. Generate the datasets catalogue page from datapackage.json (internal, P2)
Replace the hand-kept `site/datasets.md` table with a script-generated page that has one card per dataset: title, real status, coverage, source, licence, a thumbnail chart and links to the folder/README/story. Include Project Drawdown as an external entry without its long notes. Add the two missing charts (datapressr-86o, datapressr-x5a) or render a thumbnail from each dataset's first `view`, and add READMEs for airports and population-growth.
- Acceptance: all 6 in-repo datasets are listed with a status that matches their `datapackage.json`; `npm test` fails if the page is stale; every card has an image.
- Deps: none.

### T5. Site and README hygiene for outsiders (internal, P2)
- Hide `/review` and `/charting-spike.html`, and group outlines under their stories (or filter them from the index).
- Fix the `/docs/cli` quick start: nested dir, project vs global scope, the non-interactive flags, and verifying that skills load from a subdirectory.
- Add a short "What DataPressr is and isn't / what you need" section.
- Rewrite the root README.md for visitors, with the maintainer notes moved below.
- Acceptance: the sidebar shows no internal pages; the `/stories` index lists 3 stories; the cli quick start produces `world-gdp/` (not nested) when followed literally; the README has the install command, site link and a chart above the fold.
- Deps: T1 (so install instructions are true).

### T6. "Your first dataset in 10 minutes" tutorial with a checked-in reference output (internal, P2)
Write a docs page that goes from an empty folder to a validated, structured dataset. Use a tiny public-domain source (e.g. OurAirports countries.csv or NOAA Mauna Loa annual means), exact prompts and the expected outputs, then an optional enrich step. Commit the reference output (e.g. `examples/first-dataset/`) and link the page from the homepage "Get started".
- Acceptance: a fresh headless run following only the page reaches `status: structured` with the validator clean in under ~10 minutes; the outputs are comparable to the reference; the page is linked from the homepage and docs index.
- Deps: T1, T2, T3.

### T7. Demo recording and launch post draft (external, needs owner go-ahead)
Record a 60–90 s demo (asciinema or GIF plus a short video) of the tutorial and a story chart, and embed it on the homepage. Draft a launch post that states the limits honestly. Publishing the post and video is outward-facing.
- Acceptance: the draft post and demo asset are in the repo for review; the owner approves before anything is posted; the homepage embed is live after approval.
- Deps: T4, T5, T6.

### T8. Directory listings and community outreach (external, needs owner go-ahead)
- Submit to relevant awesome-skills lists.
- Consider publishing a Claude Code plugin marketplace entry.
- Share in the Frictionless Data and open-data/data-journalism channels.
- Add a "Made with DataPressr" issue template or discussion for user submissions.
- Check that `npx skills find datapressr` returns the repo once installs accrue.
- Acceptance: a list of target venues is approved by the owner; submissions are made and linked from a tracking bead; the feedback channel exists.
- Deps: T7.
