---
title: "Publishing DataPressr stories on DataHub"
date: 2026-10-10
status: research and proposal. Nothing published, no beads created. Tracking: datapressr-kac (destinations), datapressr-sff (datasets epic), datahub-next-cyz / cyz.2 / cyz.4, datahub-next-b1o.
---

# Publishing DataPressr stories on DataHub — 2026-10-10

Owner, 2026-10-10: "I'm more interested in stories than datasets on DataHub." This note works out what it takes to put a DataPressr story (Markdown, static SVG charts, links to datasets) on datahub.io, using the DataHub source (`~/src/datopian/datahub-next`, `origin/staging` at `39bef7f`), the content Worker (`datopian/datahub-cloudflare-workers`, `src/parser.js`), the live site, and a dry run of `dh` v0.1.0 against a local mock API. Nothing was published.

## TL;DR

- **It works today, with no DataHub changes.** DataHub already renders "a Post whose root Markdown page has no datapackage" as a story: title, description, "Published <date>", author avatars, then the Markdown body (`app/[publication]/[post]/[[...slug]]/page.tsx`: `isStory = !isObservable && !isDatapackage`). `dh publish` works on a directory with no `datapackage.json`: a dry run of a three-file bundle (`README.md` + the two oil SVGs) against a mock API uploaded exactly those files with no warning, and SVGs go up as `image/svg+xml`, a content type R2 keeps when serving. Relative `![](chart.svg)` images resolve to the Post's raw files. All eight story and outline `.md` files in `site/stories/` compile under DataHub's MDX pipeline (checked with `@mdx-js/mdx` + `remark-gfm` + `remark-math`).
- **We could publish the oil story to `datahub.io/datapressr` right now**, as a bundle, not as the file in place:
  ```sh
  dh publish <bundle>/wti-went-negative -p datapressr -n wti-went-negative -t "WTI Went Negative. Brent Didn't." -d "On 20 April 2020 the WTI spot price was -\$36.98 a barrel ..."
  ```
  where the bundle is `README.md` (the story) plus `oil-prices-brent-wti.svg` and `oil-prices-daily-weekly.svg`. It would look like the existing [Keeling Curve post on the DataHub blog](https://datahub.io/blog/the-keeling-curve-60-years-of-co2-rising-without-a-break): DataHub header with the title, the `-d` description, "Published 10 Oct 2026" and Rufus's avatar, then the prose, the two charts at their native 720px inside a roughly 1000px column, h2 anchors, the italic captions. Four things must change in the bundle first: drop the `# H1` (DataHub prints the title, so it would appear twice), drop "Friction notes" (internal), point the outline link somewhere that exists, and point the dataset links at [datahub.io/datapressr/oil-prices](https://datahub.io/datapressr/oil-prices) rather than GitHub. The slug cannot be `oil-prices`, which the dataset already holds: stories and datasets share one namespace per publication.
- **The real blocker is ours, not DataHub's: no story is approved.** All four stories have the author's voice pass outstanding (`datapressr-77e`, deferred), and `datahub-next-cyz.4` explicitly says a DataPressr story is not to be assumed approved while that is open. The owner has said `datapressr` is fine for testing, so one pilot story there needs only an explicit owner OK; anything on `blog` needs the voice pass.
- **Missing on our side:** a story bundler (one directory per story, only approved prose plus referenced assets, internal sections stripped, links checked), a story mode in the `push` skill, a story slug convention, story-to-dataset links in both directions, and an MDX-compile check in `npm test`.
- **Missing on DataHub's side** (all already tracked by Datopian, none blocking a pilot): `dh` does not read README frontmatter, so title and description must be passed as flags and are not updated on re-publish; the story date is the Post's creation time, not frontmatter `date`; no story type, so publication listings mix stories and datasets with no distinction (`b1o`, GitHub #921); no RSS/Atom feed for any publication; no canonical, `og:image` or Article metadata (#916–#920); no atomic revisions or readiness signal (`cyz.3`); publication write permissions are not enforced (`cyz.1`), which is also what gates a sanctioned `blog` grant.
- **Recommended path:** publish stories to `datapressr` now, the same publication as their datasets, so each story sits beside its data. Pilot with the oil story (its dataset is already there). Once a story has had its voice pass and Datopian has granted Rufus `blog` under `cyz.1`, publish finished stories to `blog`, the main DataHub blog, and keep `datapressr` for datasets and drafts. Record that rule in `kac`, which already owns the destination question. DataHub becomes the canonical home of a published story; the Flowershow page on `datapressr.datahub.io` stays as the working copy and links to it.

## 1. How DataHub models and renders a story

**Model.** A publication (`/blog`, `/core`, `/datapressr`) holds Posts; a Post holds files (Blobs, bytes in R2). `Post.type` is `DATAPACKAGE` (the default) or `OBSERVABLE`; there is no `STORY` (`prisma/schema.prisma`). Which layout a Post gets is decided at render time:

| Post | Root Markdown has a datapackage? | Layout |
| --- | --- | --- |
| `OBSERVABLE` | n/a | iframe |
| `DATAPACKAGE` | yes | `DataPackageLayout`: README, views, resource previews, downloads, sources, licence |
| `DATAPACKAGE` | no | story: header + Markdown, date "Published" (human format), optional hero `image` |

So a story is "a Post with a README and no datapackage". `datahub-next-b1o` (Ola, February) proposes splitting the type into `OBSERVABLE` / `DATAPACKAGE` / `STORY`; nothing has been built. `datahub-next-cyz.2` folds the taxonomy question in rather than blocking on it.

**Root page.** The root page is `README.md` or `index.md` (only `.md`/`.mdx` get an app path, `inngest/sync-helpers.ts resolveAppPath`). With no root Markdown the Post 404s. Other `.md` files become sub-pages at `/<pub>/<post>/<name>`.

**Metadata, and where each header field comes from** (renderer plus Worker `parseMarkdownFile`):

| Field | Source today | Consequence for us |
| --- | --- | --- |
| Page title (h1 in header) | README frontmatter `title`, via the Worker into Blob metadata; falls back to Post title | Our frontmatter titles work |
| Listing title, `<title>`, search | Post `title`, set by `dh publish -t` on first publish only | Pass `-t`; changing it later means the dashboard |
| Description (header, listing, meta) | Post `description`, from `-d` only | Pass `-d` (our frontmatter `description`); frontmatter alone leaves it blank |
| Date | `Post.createdAt` | Frontmatter `date` is ignored; re-publishing does not change it |
| Authors | `PostAuthor`: the token's user on first create, plus `-a <username>` | Rufus by default |
| Hero image | frontmatter `image`, relative path resolved | Don't set it to the lead chart, which would show twice; SVG is no use for social cards anyway |

The CLI reads `name`/`title`/`description` from `datapackage.json` only; for a story everything comes from flags (`cli/cmd/publish.go`). The dataset-create endpoint is an upsert that returns an existing Post unchanged.

**Body rendering.** The Markdown is compiled as MDX (`components/MDX.tsx`, `next-mdx-remote-client`), with `remark-gfm`, `remark-math` (`$$` only, so `-$36.98` is safe), smartypants (quotes off, `--` → en dash), wiki links, callouts, `remark-toc`, mermaid, slugged headings with anchor icons, KaTeX, Prism. An MDX compile error replaces the whole body with "Error parsing MDX" inside an HTTP 200 page (`datapressr-fyy`).

**Images and links** (`components/mdx-components-factory.tsx`, `lib/resolve-link.ts`):

- `![alt](oil-prices-brent-wti.svg)` becomes `<img src="/datapressr/<post>/_r/-/oil-prices-brent-wti.svg?preview=true" class="rounded-md">`, which 302s to `r2.datahub.io` and is served with the uploaded content type (checked live: README is served as `text/markdown`, CSVs as `text/csv`, so SVG will be `image/svg+xml`). As `<img>`, an SVG cannot run script, so there is no new trust issue.
- A relative link `oil-prices-outline.md` becomes `/datapressr/<post>/oil-prices-outline`: fine if that file is in the bundle as a sub-page, a 404 if not.
- A link that climbs out of the bundle (`../datasets.md`) becomes `/datapressr/<post>/../datasets`, which is a 404.
- External links open in a new tab.

**Embedding live dataset views.** The DataHub blog's own Keeling post embeds `<iframe src="https://datahub.io/core/co2-ppm/v/0">` for each chart; `datahub.io/datapressr/oil-prices/v/0` already returns 200. That is a second way to put charts in a story, using the dataset's `views`. Our static Observable Plot SVGs are the better default (annotated, reviewed, byte-reproducible, no client JS), but the iframe is available for an "explore the data" link or embed.

**Listings and feeds.** A publication page is one undifferentiated list of Post cards sorted by date (`app/[publication]/page.tsx`); stories and datasets are not distinguished (#921). There is no RSS/Atom route anywhere in the app. Subscriptions exist in the schema but the subscribe page is disabled, and the newsletter is a separate Brevo list.

## 2. What would break in our current stories

Checked against the four stories in `site/stories/`:

| Issue | Where | Effect on DataHub | Fix |
| --- | --- | --- | --- |
| `# Title` after the frontmatter | all four | Title printed twice (header plus body h1) | Bundler strips the first h1 |
| "Friction notes" section | all four | Internal notes for the skill, published to readers | Bundler drops it (or keep it in the outline only) |
| `[an outline](oil-prices-outline.md)` | oil, keeling, planetary | 404 unless the outline ships as a sub-page | Link to the site or GitHub copy (absolute), or ship it deliberately as `outline.md` |
| Relative links escaping the folder: `../datasets.md`, `../docs/charting.md`, `../charting-spike.html` | keeling, planetary | 404 | Bundler rewrites to absolute site URLs, or fails |
| Directory link `planetary-boundaries-src/` | planetary | 404 (no index page) | Absolute GitHub link |
| Dataset links go to GitHub folders | oil, keeling, france | Work, but miss the dataset page sitting next to the story | Rewrite to `datahub.io/datapressr/<dataset>` when the dataset is published |
| "Data story #3", "written from an outline" byline-ish lines | oil, keeling, planetary | Internal numbering on a public page | Decide per story in the voice pass |
| MDX-hostile syntax: `<https://...>` autolinks, bare `<`, `{` | none today | Whole body replaced by "Error parsing MDX" | MDX compile check in `npm test` and in the bundler |
| Charts are 720px wide, 12px text | all | Fine on desktop; about 6px text on a phone (known limit in the story skill) | None needed for a pilot |
| `fill="currentColor"` in SVGs | all | Renders black inside `<img>`; DataHub has no active dark mode (`darkMode: "class"`, no theme switcher), so fine | None |
| `planetary-boundaries` story is built on `datahub.io/climate-and-environment/planetary-boundaries` | planetary | Fine: absolute link to another publication | None |

The France story already has a bundler of its own (`site/stories/france-public-finances-package.mjs`), but it builds a portable zip plus a static HTML site, not a DataHub post. Its link-rewrite and file-selection logic is the starting point for a general bundler.

## 3. What is missing

### Our side

1. **A story bundle.** `cyz.4` and the DataHub publishing guide (`cli/README.md`) both say the same: never publish `site/stories/` as one Post (it holds four stories, outlines, build scripts, `node_modules`); publish one directory per story containing only the approved article as `README.md` and the assets it references. Nothing in DataPressr produces that yet.
2. **An approval marker.** There is no machine-readable "this story is approved for publication". The voice pass is the human gate. A frontmatter field (for example `status: draft | approved`) that the bundler checks would stop drafts slipping onto `blog`.
3. **A slug convention.** Stories and datasets share the publication's namespace, and the dataset already has `oil-prices`. Proposal: a story's DataHub slug is its title, kebab-cased and shortened (`wti-went-negative`, `keeling-curve`, `planetary-boundaries-scoreboard`, `where-frances-public-money-goes`), recorded in the story's frontmatter so re-publishing hits the same URL. It must never equal a dataset name.
4. **The push skill only knows datasets.** It requires `datapackage.json` with resources. It needs a story mode: build the bundle, refuse without approval, pass `-n/-t/-d` explicitly, check the slug isn't a dataset, then check the page in a browser.
5. **Story to dataset links, both ways.** Stories should link to the DataHub dataset page; each dataset README should list "Stories using this data" (DataHub shows that README on the dataset page).
6. **An MDX check.** The `fyy` workaround is manual. `npm test` should compile every `site/stories/*.md` and every dataset `README.md` with DataHub's plugin set.
7. **Canonical home.** Publishing the same story on `datapressr.datahub.io` and `datahub.io` makes duplicates. Neither site emits a canonical link today. Proposal: once a story is on DataHub, the DataHub page is the reader-facing home; the site page gets a "Read on DataHub" link at the top and stays as the working copy with the outline beside it.

### DataHub side

All are tracked in `datahub-next`; none blocks a pilot on `datapressr`.

| Gap | Effect on a story | Tracked |
| --- | --- | --- |
| Publication write permission not checked on v1 routes | Any valid token can write to any publication. We must still publish only where we are sanctioned; a `blog` grant for Rufus is part of the fix | `cyz.1` |
| CLI ignores README frontmatter; title/description not updated on re-publish; `modifiedAt` not advanced; date is `createdAt` | Pass flags; fix typos in the dashboard; a story's date can't be set from frontmatter (except via `scripts/update-post-dates-from-frontmatter.ts`, an admin script) | `cyz.2` |
| Upload is not atomic, no readiness signal, deleted files linger | Check the page by eye; a renamed SVG leaves the old one behind | `cyz.3` |
| No story type; listings don't distinguish stories from datasets | In `datapressr`, a story card looks like a dataset card | `b1o`, GitHub #921 |
| No RSS/Atom feed | Nobody can subscribe to `datapressr` or `blog` stories | not tracked; new |
| `.md` compiled as MDX, all-or-nothing | One stray `<` blanks the story | `datapressr-fyy` (upstream pointer) |
| No canonical, `og:image`, Article JSON-LD, machine-readable dates | Weak sharing cards and SEO; SVG cannot be an `og:image`, so a PNG render of the lead chart will be needed | GitHub #916–#920, `datahub-next-r0k` |
| Sitemap only includes publications owned by the `datahub` user | `datapressr` (owned by Rufus) gets less discovery than `blog` | assessment note; `kac` |
| Story-to-dataset relationship not modelled | Manual links only | `cyz.5` (pilot) |

Aside: the private security bug from the oil-prices pilot (`datapressr-o66`) appears fixed upstream; `datahub-next` records a production deploy of the header-leak fix (`ac232fc`, `datahub-next-i2i`). Re-check the live page and close `o66` if confirmed.

## 4. Recommended path

1. **Destination now: `datapressr`.** Stories go in the same publication as their datasets. That fits the owner's "datapressr for now", keeps each story next to its data, and needs no grant. The mixed listing is acceptable at five-ish items.
2. **Destination later: `blog` for finished stories.** The DataHub blog is where readers are, it is in the sitemap, and its posts look like ours already (frontmatter title/description, no H1, h2 sections, charts inline). A story moves there only when (a) its voice pass is done and (b) Rufus has a sanctioned `blog` grant under `cyz.1`. Then `datapressr` holds datasets plus draft or experimental stories. Themed publications (`climate-and-environment` exists, owned by Anu) are a later `kac` question; there is no `commons` publication (404).
3. **Feeds:** a DataHub feature request, not a DataPressr task. Until it exists, the DataPressr changelog and the site's stories index are the subscription surface.
4. **Pilot with the oil story**, after an owner OK to publish the pre-voice-pass draft to `datapressr` (or after a quick voice pass, which is better). It is the right first story: its dataset is already at `datapressr/oil-prices`, it has two SVGs, and the DataHub publishing guide already uses it as its example.
5. **Build the bundler and the push story mode from that pilot**, not before it, so they encode what actually needed doing.
6. **Fold the destination rule into `kac`**: datasets → `datapressr`; stories → `datapressr` while drafts, `blog` once voice-passed and granted; evals and practice runs → nowhere.

## 5. Beads

Filed 2026-10-10 as epic `datapressr-kh5`; S1–S9 are `datapressr-kh5.1`–`datapressr-kh5.9` (S5 is human-only).

| # | Title | Description | Acceptance |
| --- | --- | --- | --- |
| S1 | `scripts/bundle-story.mjs`: build a DataHub-ready story bundle | Given a story slug, write `.runtime/publish/<datahub-slug>/` with `README.md` (frontmatter `title`, `description`, `date` kept; first h1 removed; "Friction notes" removed; outline and other site-relative links rewritten to absolute site URLs; GitHub dataset links rewritten to `datahub.io/datapressr/<name>` where the dataset is published) plus only the SVGs the README references. Generalise from `france-public-finances-package.mjs`. No prose edits beyond those. | Oil, Keeling, Planetary and France bundles each contain only `README.md` and their referenced SVGs; no h1 or "Friction notes" in output; every relative link resolves inside the bundle, otherwise the script exits non-zero naming the link; output compiles as MDX; two runs are byte-identical; covered by `npm test`. |
| S2 | MDX compatibility check in `npm test` | Compile every `site/stories/*.md` and `datasets/**/README.md` with `@mdx-js/mdx` + `remark-gfm` + `remark-math` (`singleDollarTextMath: false`), matching DataHub, so `fyy`-type breakage fails CI before publish. | Test passes on main; a saboteur with `<https://x>` fails with file and line. |
| S3 | Story slug and approval fields in story frontmatter | Add `datahub: { slug, status: draft \| approved }` (or flat `slug`/`status`) to the story skill's prose step and the four stories. Slug is title-derived and must not equal any dataset name. `approved` only after the voice pass or an explicit owner OK, recorded with date. | Four stories carry a slug; bundler refuses `status: draft` for any publication other than `datapressr` (and for `datapressr` without `--allow-draft`); story skill documents the fields. |
| S4 | `push` skill: story mode | Extend `skills/push/SKILL.md` (and `site/docs/cli.md`) with a story path: run S1, check approval and slug collision, `dh publish <bundle> -p <pub> -n <slug> -t <title> -d <description>`, then a browser check (title once, description present, every chart loads, no "Error parsing MDX", links work). Document the caveats: title/description fixed after first publish, date is first publish, deleted files linger. | Skill text covers stories; a dry run against a mock API uploads only bundle files; refuses `core`; refuses `blog` unless a grant is recorded. |
| S5 | HUMAN: OK to publish the oil story to `datapressr` (draft or after voice pass) | Owner decides whether the pre-voice-pass draft can go to the test publication, or does a voice pass first. | Decision recorded verbatim in the bead. |
| S6 | Pilot: publish "WTI Went Negative. Brent Didn't." to `datahub.io/datapressr/wti-went-negative` | Depends on S1, S4, S5. Publish, verify in a real browser, screenshot. Add "Stories using this data" to the oil-prices dataset README and re-publish it; add a "Read on DataHub" link to the site story page and the stories index. Record time from bundle to verified page. | Live URL; screenshot in `site/changelog/images/`; title shown once, both SVGs render, no MDX error, every link 200; dataset page links to the story and back; friction found filed as beads (DataHub ones with a Datopian pointer). |
| S7 | Publish the remaining stories to `datapressr` | After S6. Keeling, Planetary Boundaries, France, each with its own slug. Keeling needs its `../` links fixed (S1 handles it); co2-ppm and France datasets should be on `datapressr` first so the links point at DataHub (`sff.5`). | Four story pages live; `site/stories/README.md` links each; bundles built by S1 only. |
| S8 | `kac` addendum: where stories go | Record the rule: stories → `datapressr` while draft; voice-passed stories → `blog` once Rufus has a `blog` grant under `cyz.1`; DataHub page is canonical, site page links to it. Ask Datopian for the `blog` grant and whether `datapressr` should move to the `datahub` user for the sitemap. | Rule written in the `kac` decision doc; request sent to Datopian and noted in the bead. |
| S9 | Upstream request to Datopian: stories in listings, feeds, frontmatter metadata | One message to Datopian with pointers: story vs dataset distinction in publication listings (`b1o`/#921); RSS/Atom per publication (new); `dh publish` reading README frontmatter `title`/`description`/`date` and updating them on re-publish (`cyz.2`); MDX fallback to plain Markdown for `.md` (`fyy`). Not DataPressr work; log only. | Message sent; links recorded; DataPressr beads that wait on these note the dependency. |

Suggested order: S2 and S1 (no external dependency) → S3 → S4 → S5 (human) → S6 → S7. S8 and S9 can go in parallel at any time.

## Evidence

- Renderer: `app/[publication]/[post]/[[...slug]]/page.tsx` (story vs datapackage branch, header fields), `components/MDX.tsx`, `lib/markdown.ts` (plugins), `components/mdx-components-factory.tsx` and `lib/resolve-link.ts` (image and link resolution), `app/[publication]/page.tsx` (listing), `middleware.ts` (`_r/-` raw route).
- Model and API: `prisma/schema.prisma` (`PostType`), `app/api/v1/publications/[slug]/datasets/route.ts` (upsert, authors), `.../[name]/files/route.ts`, `app/api/v1/_auth.ts` (no publication check).
- CLI: `cli/cmd/publish.go`, `cli/cmd/files.go`, `cli/README.md` ("Publish an approved story to /blog"); `dh publish --help` on v0.1.0.
- Worker: `datopian/datahub-cloudflare-workers` `src/parser.js` (frontmatter spread into Blob metadata; title falls back to first h1).
- Plans: `docs/plans/2026-09-21-datahub-assessment.md` and `docs/plans/2026-09-21-direct-publishing-roadmap.md` in `datahub-next`; Beads `datahub-next-cyz`, `cyz.1`–`cyz.5`, `b1o`.
- Live: `datahub.io/blog/the-keeling-curve-60-years-of-co2-rising-without-a-break` (source `datahubio/blog`, frontmatter `title`/`description`/`date`/`authors`, no h1, three `core/co2-ppm/v/N` iframes); `datahub.io/datapressr` lists only `oil-prices`; `datahub.io/datapressr/oil-prices/v/0` returns 200; `datahub.io/commons` returns 404; R2 serves uploaded content types.
- Local checks (scratchpad, not committed): MDX compile of all `site/stories/*.md` (all pass); `dh publish` of a `README.md` + two SVG bundle against a mock API (3 files, `text/markdown` and `image/svg+xml`, no datapackage warning).
