# Publishing DataPressr datasets to DataHub: research

Date: 2026-09-25. Research plus local experiments only. Nothing was published, no account or publication was created, no token was used against datahub.io, and the datapressr repo was not modified.

## TL;DR

- **The command is `dh publish`, not `dh push`.** `push` was renamed in datahub-next commit `a257e40` ("refactor(cli): rename push command to publish"). `dh push .` on the current binary fails with `Error: unknown command "push" for "dh"`. DataPressr's `AGENTS.md`, `skills/push/SKILL.md` and `site/docs/cli.md` are all stale on this point.
- `dh` is a **Go** binary, not an npm package. The source repo `datopian/datahub-next` is **private**, so release downloads, `go install` and `brew` only work for people with access to that repo. Rufus has access. I built it from `origin/staging` and also downloaded the `v0.1.0` release. Both work.
- Rufus already has a DataHub account and a personal publication (`rufuspollock`). The `datapressr` slug is free. `datasets` is effectively unusable (`https://datahub.io/datasets` 308-redirects to `/publications`). New sign-ups are disabled, so any other publisher must already have an account.
- A publish uploads every non-hidden file in the dataset directory that `.datahubignore` doesn't exclude, then prints `https://datahub.io/<publication>/<name>`. It is an upsert, not a sync: stale remote files are not deleted, and title and description on an existing dataset are not updated.
- **Token handling.** Datopian tracks a server-side permissions issue privately (`datahub-next-cyz.1`). Until it is closed, treat the CLI token as highly privileged, always pass an explicit `--publication datapressr`, and keep any CI secret tightly scoped.
- Views render, but with sharp edges. `simple` bar and `lines-and-points` charts only accept `year`, `yearmonth`, `date` and `number` fields, and they plot only `series[0]`. **The co2-ppm decadal bar view (`decade:string`) will render an error.** A dataset without a root `README.md` will 404.
- Three DataPressr datasets overlap with live `core` datasets that git-sync from `github.com/datasets/*` (co2-ppm, oil-prices, and airport-codes against our airports). Publish ours to a separate publication (`datapressr`), not to `core`.
- A prior assessment by the same team (datahub-next branch `docs/publishing-assessment-2026-09-21`, files `docs/plans/2026-09-21-datahub-assessment.md` and `docs/plans/2026-09-21-direct-publishing-roadmap.md`) reached the same conclusions. It tracks the fixes as Beads `datahub-next-cyz.1` to `.6`. `cyz.4` is specifically the "DataPressr adapter and teammate runbook".

## 1. Installing or building `dh`

Checkout: `~/src/datopian/datahub-next`, branch `staging`, 3 commits behind `origin/staging` (`1f4ff2a`, 2026-09-24) after `git fetch`. It has a local uncommitted change to `.beads/issues.jsonl`, which I left untouched. The CLI is in `cli/` (Go module `github.com/datopian/datahub-next/cli`, cobra, `sabhiram/go-gitignore`).

Availability checks:

- npm: there is no package. The `dh` name on npm is an unrelated Redis hash wrapper, and `@datopian/dh` returns 404.
- Homebrew: `brew info datopian/tap/dh` fails with "No available formula". `datopian/homebrew-tap` returns 404, and the brews section of `.goreleaser.yml` is commented out.
- Repo visibility: `gh api repos/datopian/datahub-next --jq .private` returns `true`. An anonymous `curl https://github.com/datopian/datahub-next` returns 404, so outsiders cannot install it.
- Releases: there is a single release, `v0.1.0`, from 2026-06-03, with assets `dh_{darwin,linux}_{amd64,arm64}.tar.gz`, `dh_windows_amd64.zip` and `checksums.txt`. The only later changes under `cli/` are to the README and goreleaser config, so v0.1.0 is functionally current.

Build from source (Go 1.27.1 is installed at `/opt/homebrew/bin/go`) without touching the checkout:

```sh
S=<scratch dir>/dh
mkdir -p $S/src
cd ~/src/datopian/datahub-next && git archive origin/staging cli | tar -x -C $S/src
cd $S/src/cli && go build -ldflags "-X main.version=staging-1f4ff2a" -o $S/dh .
$S/dh --version    # dh version staging-1f4ff2a
```

Download the release binary (needs `gh` auth with access to the private repo):

```sh
cd $S/release
gh release download v0.1.0 -R datopian/datahub-next -p 'dh_darwin_arm64.tar.gz' -p checksums.txt
shasum -a 256 -c checksums.txt --ignore-missing   # dh_darwin_arm64.tar.gz: OK
tar -xzf dh_darwin_arm64.tar.gz && ./dh --version  # dh version 0.1.0
```

`dh --help` lists these commands: `completion`, `delete`, `login`, `logout`, `publication` (`create <slug>`), `publish`. `dh publish` takes these flags: `-n/--name`, `-t/--title`, `-d/--description`, `-a/--author` (repeatable), `-p/--publication`, `-g/--github owner/repo`, `--branch` (default `main`) and `--subdir`.

The recommended local install is the release binary on PATH, for example `~/bin/dh` or `/usr/local/bin/dh`.

## 2. What `dh publish <dir>` does

The source is `cli/cmd/publish.go`, `api.go`, `config.go` and `credentials.go`. The server routes are in `app/api/v1/...`.

Config resolution (`config.go`):

- The CLI reads the env vars `DATAHUB_API_URL`, `DATAHUB_API_TOKEN` and `DATAHUB_PUBLICATION`.
- It falls back to a credentials file saved by `dh login`, at `~/Library/Application Support/datahub/credentials` on macOS or `~/.config/datahub/credentials` on Linux. The file holds JSON with `apiUrl`, `token` and `publication`.
- A `--publication` flag overrides both.
- If no publication is set, the CLI errors with "publication not set".

Flow:

1. The CLI reads `datapackage.json` and takes `name`, `title` and `description` from it. It warns if `resources` is empty. The fallback name is the directory basename.
2. It sends `POST /api/v1/publications/<pub>/datasets` with `{name, title, description, authors}`. This is an **upsert by name**: if the dataset exists, the server returns the existing record *unchanged*, so title and description are not updated on re-publish. On first creation, the token's user is added as author.
3. It walks the directory:
   - It skips any file or directory whose name starts with `.`, so `.datahubignore`, `.gitignore` and similar are never uploaded.
   - It applies `.datahubignore` using gitignore syntax, and only the one at the dataset root.
   - `.gitignore` is **not** consulted.
4. For each file, it calls `POST .../datasets/<name>/files` with `{path, size, contentType}`, plus the full JSON as `content` for `datapackage.json`. The server upserts a Blob row, marks it `SUCCESS` before any bytes arrive, and returns a presigned R2 PUT URL. That URL is valid for 1 hour, and the storage key is `<postId>/main/raw/<path>`.
5. The CLI PUTs the bytes. It reads each whole file into memory first.
6. It prints `View at: <apiUrl>/<publication>/<name>`, for example `https://datahub.io/datapressr/co2-ppm`.

After upload, a Cloudflare Worker processes the Markdown and datapackage asynchronously. "N file(s) published" only means the uploads finished. It does not mean the page is ready.

Size limits:

- Neither the CLI nor the API enforces any explicit limit.
- The practical bounds are memory (the whole file is read), a single PUT (R2's single-request limit is roughly 5 GB), and the 1-hour URL expiry.
- DataPressr's biggest file, `airports.csv` at 11.7 MB, is trivial.
- Browser previews and charts load the CSV client-side, so very large CSVs will be slow to view.

Updates and idempotency:

- Re-running is safe: the same Post is reused and the same keys are overwritten.
- It is **not** a sync. Files deleted locally stay on the server.
- There is no atomic revision and no rollback.
- The Post's modified time is not advanced.
- To change title or description, use the dashboard settings.
- Deleting and recreating the dataset is discouraged because it loses identity and dates.

Delete: `dh delete <name> [-p pub]` calls `DELETE /api/v1/publications/<pub>/datasets/<name>`, which removes the stored project files and the Post. It returns 204, or treats 404 as success.

GitHub mode:

- `dh publish --github owner/repo --subdir path --publication pub --name n` links a repo folder instead of uploading.
- The server syncs through Inngest and tries to install a webhook. Webhook failure is non-fatal.
- Git sync does **not** read `.datahubignore`. It uses `contentInclude` and `contentExclude` from a `config.json` at the **repo root** (`inngest/functions.ts`, `inngest/sync-helpers.ts filterTreeItems`), so it would publish `archive/`, `build.ts`, `AGENTS.md` and so on. It also needs a connected GitHub account with repo access.

### Local experiment: publish against a mock API

I wrote `scratchpad/dh/mock-server.mjs`, a Node HTTP server on `localhost:8765` that logs requests and returns fake upload URLs. I ran the real binary against it:

```sh
DATAHUB_API_URL=http://localhost:8765 DATAHUB_API_TOKEN=fake DATAHUB_PUBLICATION=test-pub \
  ./dh publish ~/src/datasets/datapressr/datasets/climate-and-environment/co2-ppm
```

Results:

- **co2-ppm** uploaded 8 files: `README.md`, `SUMMARY.md`, 5 CSVs and `datapackage.json`. `.datahubignore` correctly excluded `archive/`, `scripts/`, `build.ts`, `enrich.ts` and `AGENTS.md`. The datapackage was sent with `hasContent: true`.
- **airports** uploaded 2 files: `data/airports.csv` (11.7 MB) and `datapackage.json`. There was **no README**, so the live page would 404 (see section 4).
- `dh delete co2-ppm` sent `DELETE /api/v1/publications/test-pub/datasets/co2-ppm`.

Publish readiness of the six datasets:

| Dataset | Files that would upload | README | Views | Notes |
| --- | --- | --- | --- | --- |
| co2-ppm | README, SUMMARY, 5 CSVs, datapackage | yes | 3 simple | Decadal bar view will error (string x-axis) |
| oil-prices | README, SUMMARY, 8 CSVs, datapackage | yes | 2 simple line | Views look valid (`Date:date`, `Price:number`) |
| us-natural-hazard-statistics | README, 2 CSVs, datapackage | yes | none | ok |
| tesla-quarterly-deliveries | README, 3 CSVs, datapackage | yes | none | ok |
| airports | 1 CSV, datapackage | **no** | none | Needs README.md |
| population-growth | 2 CSVs, datapackage | **no** | none | Needs README.md |

`SUMMARY.md` gets published as a sub-page at `/<pub>/<name>/SUMMARY`. That is probably fine, but decide deliberately.

## 3. Getting a token and a publication

- **Token:**
  - Run `dh login`. It uses a browser device-code flow (`/cli/auth/authorize`): you sign in to datahub.io with GitHub, click Authorize, and the CLI saves a long-lived token. Only its hash is stored server-side (`UserCliToken`, with no expiry).
  - There is no token-management UI. `dh logout` revokes the current token.
  - For env or CI use, copy `token` out of the credentials file into `DATAHUB_API_TOKEN`.
- **Account:** new sign-ups are rejected (per `server/auth.ts` and the assessment), so publishers need an existing account. Rufus has one: publication `rufuspollock` is owned by user `rufuspollock` (checked via the public tRPC `publication.getByIdentifier`).
- **Publication:**
  - `dh publication create datapressr --name "DataPressr"` creates a publication owned by the token's user (`POST /api/v1/publications`). The `datapressr` slug is currently free: the lookup returned "Publication not found" and `https://datahub.io/datapressr` returns 404.
  - `datasets` is not viable because `/datasets` redirects (308) to `/publications`.
  - The "datasets" GitHub org and a DataHub publication are unrelated namespaces.
  - Per the assessment, the apex sitemap only includes publications owned by the `datahub` user, so a Rufus-owned `datapressr` publication won't get the same SEO promotion as `core`. If that matters, ask Datopian to create `datapressr` under the `datahub` user and grant access.
- **Token handling.** Datopian tracks a server-side permissions issue privately (`datahub-next-cyz.1`). Until it is closed, treat the CLI token as highly privileged, always pass an explicit `--publication datapressr`, and keep any CI secret tightly scoped.

What the owner must do by hand:

1. Get `dh`, using the release binary or a source build.
2. Run `dh login` once.
3. Decide the publication, and create it with `dh publication create datapressr` or ask Datopian.
4. Confirm the public username for bylines.
5. Do the first publish and eyeball the page.
6. For CI, add the token as a GitHub secret and arrange CI access to the binary.

## 4. Does DataHub render `views` and `README.md`?

Page resolution:

- The dataset root page is a Markdown Blob with `appPath "/"`, which in practice is `README.md` or `index.md`. Only `.md`/`.mdx` files get an appPath (`inngest/sync-helpers.ts resolveAppPath`).
- `post.getBlob` throws NOT_FOUND if none exists (`server/api/routers/post.ts:841`). **No README means a 404 dataset page.**
- If the README blob's metadata carries a datapackage, `app/[publication]/[post]/[[...slug]]/page.tsx` uses `DataPackageLayout` (`components/layouts/datapackage.tsx`). That layout renders:
  - the README body
  - download buttons
  - programmatic access
  - a "Data Views" section, if `views` is present
  - per-resource previews with a schema tab (DuckDB in the browser)
  - source and license cards
- DataHub shows the title in its own header, so a README `# H1` will duplicate it.

The views renderer (`components/layouts/data-views-section.tsx`, `components/frictionless-view.tsx`, types in `types.ts`):

- **Supported `specType` values:**
  - `simple`, with types `line`, `bar` and `lines-and-points`
  - `vega-lite`, which takes a raw Vega-Lite spec with data injected from the resource CSV
  - `plot`, Observable Plot, which takes a structured `PlotSpec`
  - Anything else shows an error box.
- **Resource matching:** the resource is found by `resources[0]` or by `resourceName`, matched against resource `name`. A missing match shows "Resource not found for view".
- **Format:**
  - The csv/geojson check only applies to the `resourceName` form.
  - Data is always loaded as CSV from the resource URL in the browser.
  - There is no row cap in the view code, but the whole file is fetched client-side.
- **`simple` + `line`** uses the PortalJS `LineChart` and supports multiple series. The x time unit is inferred from the schema field type: `date` or `yyyy-mm`.
- **`simple` + `bar` and `lines-and-points`:**
  - These go through `convertSimpleViewToVegaLite`.
  - They need `resource.schema`, and the `group` and `series[0]` fields must exist in it.
  - **Field types must be `year`, `yearmonth`, `date` or `number`. `integer` and `string` throw "Unsupported field type"** (the `inferVegaType` whitelist omits them even though the switch handles `integer`).
  - **Only `series[0]` is plotted.**
  - Effect on co2-ppm: the `co2-growth-decadal` bar view (`group: decade`, a string field, with two series) will render an error. Switch it to `vega-lite` or `plot`, or to a `year`-typed x-axis.
- The file header comments say datapackage views may be dropped "in favour of in-markdown components", so `plot` or `vega-lite` (or charts in the README) are the more future-proof choices.

## 5. Existing DataHub datasets and how ours relate

Checked with curl against `https://datahub.io/...` and the public tRPC `post.get`:

| DataPressr dataset | DataHub equivalent | Status | Source of the core version |
| --- | --- | --- | --- |
| co2-ppm | `core/co2-ppm` | 200 | git-synced from `datasets/co2-ppm@main`, autoSync on, webhook on, updated 2026-09-01 |
| oil-prices | `core/oil-prices` | 200 | git-synced from `datasets/oil-prices@main`, autoSync on, webhook on, updated 2026-09-25 |
| airports | `core/airport-codes` | 200 | git-synced from `datasets/airport-codes@main`, autoSync on |
| population-growth | `core/population-growth` 404; `core/population` exists (a different indicator) | – | – |
| tesla-quarterly-deliveries | none found | – | – |
| us-natural-hazard-statistics | none found | – | – |
| `datapressr` publication | none | 404 | – |

How they relate:

- **co2-ppm:**
  - Ours is a re-wrangle with a different resource layout. Ours has `co2-monthly-mlo`, `co2-annual-mlo` and so on; core has `co2-mm-mlo`, `co2-annmean-mlo`, `co2-mm-gl` and others.
  - Ours has different column names.
  - Our README documents that the core monthly file currently has mislabelled columns.
- **oil-prices:**
  - Ours is content-identical to core (only LF versus CRLF line endings differ).
  - Core names its resources `brent-week`/`brent-month`, while ours uses `brent-weekly`/`brent-monthly`.
- **airports** covers the same OurAirports source as `core/airport-codes`.
- **Conflict risk:**
  - Publishing to a new publication means different URLs, so there is no technical conflict, but there is a duplicate-content and canonical question.
  - Publishing to `core/co2-ppm` via `dh publish` would be **harmful**. It would mix direct uploads into a git-synced Post: direct uploads write the `main` prefix, and the next git sync can overwrite them. 
  - The better way to upstream improvements such as the co2 column-mislabel fix is a PR to `github.com/datasets/co2-ppm`.

## 6. Monorepo subfolders and CI

- **One publish per directory works fine.** `dh publish datasets/climate-and-environment/co2-ppm` only walks that directory. Paths in the upload are relative to it, and the name comes from `datapackage.json`. The mock run above demonstrates this from the monorepo.
- The name is the global key within a publication, so dataset names must be unique across topic folders. They currently are.
- **GitHub Actions is feasible**, with two catches:
  1. **Getting the binary.** The repo is private, so CI needs one of the following:
     - a secret PAT with read access to `datopian/datahub-next`, to `gh release download` or check out and `go build`
     - a vendored binary
     - no binary at all: the API is only three HTTP calls, create dataset, register file, then PUT to the presigned URL, so a roughly 60-line Node `publish.mjs` in datapressr could replace `dh` in CI
  2. **The token.** Run `dh login` once as the publishing user, then store the `token` from the credentials file as `DATAHUB_API_TOKEN`. Set `DATAHUB_API_URL=https://datahub.io`, and pass `--publication datapressr` explicitly. Treat the token as highly privileged (see Token handling).
- Sketch of the workflow:
  - on push to `main`
  - for each dataset dir whose files changed (`git diff --name-only`) and whose `status` is at least `structured`
  - run the validator, then `dh publish <dir> -p datapressr`
- Remember that removed files are not cleaned up remotely.
- The alternative is git-link mode (`dh publish --github datasets/datapressr --subdir datasets/<topic>/<name>`). It needs Rufus's GitHub account connected and the webhook to succeed. It also ignores `.datahubignore` and would publish scripts, archives and AGENTS.md, which is not recommended as-is.

## 7. Risks and unknowns

- The `dh push` vs `publish` naming mismatch in DataPressr docs and skills means any agent following them fails today.
- Private CLI distribution blocks outside contributors and complicates CI.
- A server-side permissions issue, tracked privately as `datahub-next-cyz.1`.
- A success message does not mean the page is rendered. The Worker is asynchronous and there is no readiness signal, and MDX errors can render inside a 200 page. Verify in a browser.
- There are no update semantics for title and description, no removal of stale files, and no revisions or rollback (`cyz.2`, `cyz.3`).
- View renderer limits: string and integer axes fail for bar charts, and only one series is plotted for bar and lines-and-points.
- A README is required for a page to exist (airports and population-growth lack one).
- Duplicate or canonical relationships with `core/*` datasets and with the Flowershow site `datapressr.datahub.io` are undecided.
- SEO: a Rufus-owned publication is not in the apex sitemap (per the assessment, not verified).
- Unverified:
  - live Worker behaviour on a fresh direct-upload dataset
  - whether README frontmatter title overrides the Post title
  - exact page-cache TTL
  - whether a second `dh login` creates a separate token, which is likely given `a2407a6` "generate access token at poll time"; if so, a CI token survives a local `dh logout`

## Recommended publish workflow for DataPressr

Manual first:

1. Install: `gh release download v0.1.0 -R datopian/datahub-next -p dh_darwin_arm64.tar.gz`, extract it, and move `dh` onto your PATH. Or build from source as in section 1.
2. Run `dh login` in a browser session as `rufuspollock`.
3. Decide the destination:
   - Recommended: a dedicated `datapressr` publication (catalog-as-publication, matching the "catalog-as-repo" rule). Ideally Datopian creates it under the `datahub` user for sitemap inclusion; otherwise run `dh publication create datapressr --name "DataPressr"`.
   - Do not publish into `core`.
4. Pre-flight each dataset:
   - root `README.md` present (add one for airports and population-growth)
   - fix the co2-ppm decadal bar view
   - `/validate` passes
   - `.datahubignore` covers `archive/`, scripts, `node_modules/`, `package*.json` and `AGENTS.md`
   - decide whether `SUMMARY.md` should publish
5. Pilot one dataset: `dh publish datasets/energy-and-commodities/oil-prices -p datapressr`. Then check `https://datahub.io/datapressr/oil-prices` in a browser: README, both line views, previews, downloads and license. Record time taken and any friction.
6. Publish the rest, one directory at a time.
7. Update DataPressr, as a separate authorized change:
   - `AGENTS.md` and `skills/push/SKILL.md`: `dh push .` becomes `dh publish . -p "$DATAHUB_PUBLICATION"`, `dh login` is accepted as a credential source (not just env vars), and a README.md is required.
   - The "Adding charts" section: document the bar and lines-and-points field-type and series limits, and suggest `vega-lite` or `plot`.
   - `site/docs/cli.md` and the `.datahubignore` comment in the init skill.

CI later, once the manual path is proven and ideally after `cyz.1` (permissions) lands:

1. Store the token as a secret and set `DATAHUB_PUBLICATION=datapressr`.
2. Obtain `dh` through a PAT-backed release download, or use a small in-repo Node publisher that calls the same three endpoints.
3. On push to `main`, publish only changed datasets with status at least `structured`. Run the validator first, and after publishing curl the page URL and fail if it isn't a 200.
4. Keep a manual `workflow_dispatch` for a full republish.

## Evidence index

- CLI source: `~/src/datopian/datahub-next` at `origin/staging:cli/cmd/{root,publish,api,config,credentials,delete,publication,files}.go`, and `cli/README.md`
- API: `origin/staging:app/api/v1/_auth.ts` and `app/api/v1/publications/route.ts`, plus these under `app/api/v1/publications/[slug]/datasets/`: `route.ts`, `[name]/route.ts`, `[name]/files/route.ts`
- Storage: `lib/content-store.ts` (`generatePresignedUploadUrl`, 3600 s)
- Rendering:
  - `app/[publication]/[post]/[[...slug]]/page.tsx`
  - `components/layouts/datapackage.tsx`
  - `components/layouts/data-views-section.tsx`
  - `components/frictionless-view.tsx`
  - `types.ts:180-240`
  - `server/api/routers/post.ts:841`
- Git sync: `inngest/functions.ts`, `inngest/sync-helpers.ts`
- Prior assessment: `origin/docs/publishing-assessment-2026-09-21:docs/plans/2026-09-21-datahub-assessment.md` and `docs/plans/2026-09-21-direct-publishing-roadmap.md`
- Built binaries: `scratchpad/dh/dh` (staging build) and `scratchpad/dh/release/dh` (v0.1.0)
- Mock server: `scratchpad/dh/mock-server.mjs`
