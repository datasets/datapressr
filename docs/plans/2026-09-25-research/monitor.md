# Living datasets / `monitor`: scoping report

Date: 2026-09-25. Scope: research plus scratch experiments only. Nothing in the repo was modified, no cloud resources were created, nothing was pushed. All experiments ran on copies in the session scratchpad.

Inputs read: `AGENTS.md`, `site/docs/lifecyle.md`, `skills/archive/SKILL.md`, `docs/plans/skills-vision.md`, `docs/handoffs/cloud-queue.md` (item 3), the `fetch.ts`/`build.ts` of the four fetch-based datasets, the `build.ts` + `archive/` of oil-prices and co2-ppm, beads `datapressr-02p` and `datapressr-46c`, GitHub issue #6 (no comments; body only).

## TL;DR

- All six builds are fully deterministic: rebuilt from `archive/` in scratch they reproduce the committed `data/` byte for byte, under `TZ=UTC`, `Pacific/Kiritimati` and `America/Los_Angeles`.
- Four datasets have a networked `fetch.ts` with a SHA-256 `archive/manifest.json`; the two most obviously "living" ones (oil-prices, co2-ppm) have **neither** — their archives were downloaded by hand.
- Raw-hash diffing by itself gives false alarms: NOAA rewrites a `# File Creation:` line every month, so a byte hash changes even when the numbers have not. What should gate a PR is **whether `data/` changes after a rebuild**. The hash diff is the early signal and the audit trail.
- Both living candidates are already out of date. co2-ppm is missing 2026-08 and NOAA has quietly revised about 100 monthly rows back to 1982. The live EIA oil workbooks currently **drop ~890 historical Brent daily rows and ~743 WTI daily rows** that are in the 2026-09-05 snapshot. This happened twice, byte for byte, and I can't explain it. Merging automatically would have deleted those rows without anyone noticing, which is the strongest argument for "open a PR, never auto-publish".
- Recommendation: **GitHub Actions scheduled workflow → PR** (free on this public repo, and it already has the write/PR permissions it needs). Pilot on **co2-ppm** rather than oil-prices.

## 1. Inventory

| Dataset | Fetch | What is archived | Manifest + hashes | Upstream cadence (evidence) | Build determinism |
|---|---|---|---|---|---|
| transport/tesla-quarterly-deliveries | `fetch.ts` (SEC EDGAR; needs `SEC_USER_AGENT`; 250 ms pacing; 3 tries, exp. backoff; `--refresh`) | 2 EDGAR submissions JSONs + 49 filing index pages + EX-99 exhibits (101 files) | Yes: `archive/manifest.json`, `files[]` keyed `source_id`, `url,path,retrieved_at,bytes,sha256` + filing metadata. `build.ts` **verifies every SHA-256 before parsing** | Quarterly (8-K in the first ~10 days of Jan/Apr/Jul/Oct), plus silent restatements (bead 02p). The submissions JSON changes on *any* Tesla filing (Form 4s etc.), so its hash is noisy. No new filings since the 2026-09-18 snapshot (live hash still `b0790bd2…`) | Deterministic (byte-identical rebuild, TZ-independent); no deps |
| climate-and-environment/us-natural-hazard-statistics | `fetch.ts` (NWS; needs `NWS_USER_AGENT`; 1.5 s pacing; records 404s as findings; checks `%PDF-` magic) | hub HTML, disclaimer, 30 PDFs, robots/sitemap probes (35 entries, some `path: null`) | Yes: keyed `source_id`, adds `http_status`, allows `sha256: null`. `build.ts` verifies hashes | Annual (new year's summary; `sum25.pdf` Last-Modified 2026-07-16), plus silent regeneration of old years (2007–2015 regenerated in 2016, etc.) | Deterministic; dep `pdfjs-dist` 5.4.530 |
| transport/airports | `fetch.ts` (OurAirports GitHub Pages mirror; 500 ms pacing) | 4 CSVs (~17 MB) | Yes: keyed `name`, adds `last_modified` | **Daily** (nightly ~01:54 UTC). Live `airports.csv` Last-Modified 2026-09-25, hash changed vs the 09-18 snapshot (+6,205 bytes) | Deterministic; dep `csv-parse` 7.0.2. Build fails on new FK orphans, so it will sometimes need a human |
| demographics/population-growth | `fetch.ts` (World Bank API v2, 18 pages + metadata; asserts pagination and "unchanged mid-download") | 20 JSON responses | Yes: keyed `name`; top-level `lastupdated` | WDI refresh a few times a year (`lastupdated` 2026-07-13). Live page 1 hash **identical** to manifest (`e1d71969…`) and stable across two fetches, so a hash diff is clean here | Deterministic; no deps |
| energy-and-commodities/oil-prices | **None**: manual download, documented in `archive/PROVENANCE.md` | 8 legacy BIFF8 `.xls` (Brent/WTI × d/w/m/a) | **No manifest, no hashes** (PROVENANCE.md lists URLs + date only) | Daily series, **published weekly**: all live files Last-Modified Wed 2026-09-23 15:49 GMT, running through 2026-09-22 | Deterministic (serial-date handling is offset-free, verified across 3 TZs); dep SheetJS `xlsx` 0.18.5, which `npm audit` flags **high, no fix available** (GHSA-4r6h-8v6p-xvw6 prototype pollution, GHSA-5pgg-2g8v-p4x9 ReDoS) |
| climate-and-environment/co2-ppm | **None**: manual download | 5 NOAA GML CSVs (mixed retrieval dates, 08-30 and 09-05) | **No manifest, no hashes** (URLs + dates in `build.ts` header / README) | **Monthly**: `# File Creation:` Aug 5 → Sep 5; HTTP Last-Modified 2026-09-08. Each release adds a month and revises recent months | Deterministic; **zero deps**; `build.ts` asserts every NOAA header (the schema-drift guard the community `datasets/co2-ppm` lacked) |

Other facts relevant to monitoring:

- All six pass `scripts/validate-datapackage.mjs` with 0 errors / 0 warnings (oil, co2 checked explicitly). The validator checks structure only, not data against schema, and it accepts any `status` string, so `monitored` needs no validator change.
- None of the four `fetch.ts` can write anywhere except `<dataset>/archive/` (hard-coded `const ARCHIVE = join(HERE, "archive")`). "Refresh into scratch" is not possible today without that one change. They also never delete stale files, which a fresh scratch directory fixes for free.
- The repo has **no `.github/workflows/`** yet. It is public, Actions are enabled, `default_workflow_permissions: write` and `can_approve_pull_request_reviews: true` (via `gh api repos/datasets/datapressr/actions/permissions/workflow`). No repo secrets.

### Live-refresh experiments (scratch only)

co2-ppm, fed the live NOAA files (09-05 release): the build passes, validation passes, and the diff looks like this:
- `co2-monthly-mlo.csv`: 821 → 822 rows (2026-08 added), 103 changed lines. `co2_ppm_deseasonalized` revised in the second decimal back to 1982; 2023–2026 rows revised in several columns.
- `co2-growth-annual.csv`: 48 changed lines (global uncertainty revisions 1980–1987 and later).
- `co2_annmean_mlo.csv`, `co2_annmean_gl.csv`: raw bytes changed **only** in the `# File Creation:` comment. Zero data change.
- `SUMMARY.md` stats block: 7 lines changed. README's hard-coded "821 rows, 1958-03 → 2026-07" goes stale.
- Mid-experiment, `gml.noaa.gov:443` refused connections for several minutes: a real "source down" case. `curl -o` did not clobber the existing files, but a naive `writeFileSync` after a failed fetch could, so writes must go to scratch first.

oil-prices, fed the 8 live EIA workbooks: the build passes (`minRows` guards still satisfied). The diff:
- `brent-daily.csv`: 9,967 → 9,092 rows. 15 new days added (to 2026-09-22), **890 historical days removed**, concentrated in 1993–2006.
- `wti-daily.csv`: 743 historical days removed (1986–2015), 14 added. The weekly files show 6 (Brent) and 24 (WTI) changed lines. Monthly and annual files are unchanged.
- A second download returned an identical hash, so the result is stable, not a truncated transfer. I couldn't find out why from the HTML history page (it redirects), and `api.eia.gov/v2` returns 403 without a key. **Whatever the cause, this change needs a human to decide on it.**

## 2. Shared helper for bead 02p

### What the four `fetch.ts` genuinely share

1. `HERE/ARCHIVE/MANIFEST` constants, with `ARCHIVE` hard-coded to `<dataset>/archive`.
2. The `--refresh` guard: "manifest exists and no `--refresh` → reuse and exit 0".
3. A `get()` with `AbortSignal.timeout`, `MAX_TRIES = 3`, exponential backoff. Tesla, airports and population-growth throw on non-2xx. Hazard returns the status because a 404 is data for it.
4. Sequential requests with a fixed pause.
5. `sha256` hex of the raw bytes, saved byte for byte.
6. A manifest `{ …dataset-specific top-level fields, files: [ { <id>, url, path, retrieved_at, bytes, sha256, …extras } ] }`.

The differences that matter for diffing:
- The id key is `source_id` (tesla, hazard) or `name` (airports, population-growth).
- Hazard has `http_status`, and `path`/`bytes`/`sha256` may be `null`.
- Airports has `last_modified`.
- Top-level fields differ (`lastupdated`, `candidate_filings`, …).
- `retrieved_at` always differs and must be ignored.

What's *not* worth extracting: `get()`/pacing/UA handling. Each dataset directory is meant to be self-contained and portable to another repo (`/init` copies the validator in for the same reason). Four 20-line copies are cheaper than a shared runtime dependency. Extract only the **diff**.

### Proposal

**One-line change to each `fetch.ts`** (the only edit to existing fetchers):

```ts
const ARCHIVE = process.env.DATAPRESSR_ARCHIVE_DIR ? resolve(process.env.DATAPRESSR_ARCHIVE_DIR) : join(HERE, "archive");
```

`EXHIBITS`, `SUMMARIES` and `MANIFEST` already derive from `ARCHIVE`, and every write goes through them, so nothing else changes. The manifest `path` strings stay as logical `archive/<rel>` paths, so the new manifest can drop straight into `archive/`. A fresh scratch directory has no manifest, so the reuse guard doesn't fire. Passing `--refresh` anyway is harmless.

**`scripts/source-diff.mjs`**: plain `.mjs`, zero dependencies, same style as `validate-datapackage.mjs`, picked up by the root `npm test` (`node --test`).

CLI:

```
node scripts/source-diff.mjs <dataset-dir> [--keep <dir>] [--json | --markdown]
    runs `node fetch.ts --refresh` in <dataset-dir> with DATAPRESSR_ARCHIVE_DIR=<scratch>,
    then diffs <scratch>/manifest.json against <dataset-dir>/archive/manifest.json.
    Never writes to <dataset-dir>. --keep leaves the fresh snapshot at <dir> (the monitor
    workflow copies it over archive/); otherwise the scratch dir is removed.
node scripts/source-diff.mjs --manifests <old.json> <new.json> [--json | --markdown]
    offline mode: diff two manifests (tests; manual use).

Exit: 0 = no source changed, 1 = at least one source added/removed/changed, 2 = error
(fetch.ts failed, manifest missing/malformed, duplicate key). Same convention as diff(1).
Env vars the fetcher needs (SEC_USER_AGENT, NWS_USER_AGENT…) are passed through untouched.
```

Module:

```js
export function manifestEntries(manifest)      // -> Map<key, {url, path, sha256, bytes, status}>
export function diffManifests(oldM, newM)      // -> {added[], removed[], changed[{key,url,old,new,bytes_delta}], unchanged:number}
export function formatDiff(result, {format})   // "text" | "json" | "markdown" (markdown is the PR-body table)
export async function refreshToScratch(datasetDir, {keep}) // -> {scratchDir, manifestPath}
```

Normalisation rules (no manifest rewrites needed for the existing four):
- key = `source_id ?? name ?? path ?? url`. Throw on missing or duplicate.
- status = `http_status ?? (sha256 ? 200 : null)`.
- A change means `sha256` differs **or** status differs, so a 404 → 200 transition is a change.
- Ignore `retrieved_at`, `last_modified` and all top-level fields.
- Convention for **new** fetchers (oil, co2): use `source_id`, and include `http_status`.

I ran a scratch prototype of `manifestEntries`/`diffManifests` (~40 lines) against all four real manifests. Self-diff returned exit 0 for all (101/35/4/20 entries, keys unique). An airports manifest with the live `airports.csv` hash returned exit 1 with `airports (+6205 bytes)`. A missing file returned exit 2.

Deliberately **not** in the helper: content-aware "ignore the `File Creation` line" rules, per-source ignore lists, retries, scraping logic. Raw hash changes are reported honestly. Deciding whether that change matters is the rebuild's job (does `data/` change?), not the differ's.

Test fixtures (`scripts/fixtures/source-diff/`):
- `unchanged/{old,new}.json` → exit 0
- `changed/` (one sha differs) → exit 1, `bytes_delta` reported
- `added-removed/` → exit 1, both lists populated
- `status-change/` (hazard-style `404,null` → `200,sha`) → exit 1
- `name-keyed/` (airports/population style `name`) → keys resolve
- `malformed/` (no `files[]`; duplicate key) → exit 2
- `dataset/`: a tiny fake dataset whose `fetch.ts` copies `$FIXTURE_SRC` into `DATAPRESSR_ARCHIVE_DIR` and writes a manifest (no network). Covers the end-to-end CLI: same content → 0, edited content → 1, `fetch.ts` that throws → 2, and asserts the dataset's own `archive/` is byte-identical afterwards.

This satisfies 02p's acceptance criteria: one command per dataset, non-zero on change, fixture tests for changed and unchanged.

## 3. Scheduled execution: GitHub Actions vs Cloudflare

Pipeline to schedule: `fetch (network) → build.ts (offline) → enrich.ts → validate → diff → open/update a PR`. Output is a git branch, not a published artefact.

| Criterion | GitHub Actions `schedule` | Cloudflare Workers Cron |
|---|---|---|
| Runtime fit | Ubuntu VM with real Node (`setup-node` 24), `npm ci`, git, `gh`. Runs `node fetch.ts`/`build.ts` unchanged | Workers is a V8 isolate: no `child_process`, no git, no real fs, 128 MB memory. It can't run `node build.ts` as written. A full Linux environment needs Sandbox SDK/Containers: "Available on Workers Paid plan", **preview** |
| Scheduling | Cron, min interval 5 min; "can be delayed during periods of high loads … High load times include the start of every hour"; runs "on the latest commit on the default branch"; optional IANA timezone | Cron in UTC; 5 triggers/account on Free, 250 on Paid |
| Limits | Job time limits are far above what we need (all 6 builds take ≤1 s; the largest fetch is ~17 MB) | Free: 10 ms CPU per invocation (useless here). Paid: 30 s CPU (<1 h interval) / 15 min (≥1 h interval), 15 min wall clock, 10,000 subrequests |
| Cost | "free … for public repositories that use standard GitHub-hosted runners"; `datasets/datapressr` is PUBLIC | $5/month Workers Paid minimum, plus Containers usage for anything Node-shaped |
| Credentials | Repo secrets/variables; `GITHUB_TOKEN` scoped per workflow. `SEC_USER_AGENT` etc. can be plain `vars` | Worker secrets, plus a GitHub App/PAT stored in Cloudflare so it can push branches and open PRs (more moving parts, a long-lived credential outside GitHub) |
| Reviewable diffs | Native: branch + PR in the same repo | Must call the GitHub API to create a branch, commit and PR |
| Snapshots | `archive/` in git, as the reproducibility contract requires | R2 is attractive for large raw archives, but splits the "raw snapshot + script reproduces data/" contract across two systems |
| Gotchas | "In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days." Failure notifications go to "the user who last modified the cron syntax". PRs created with `GITHUB_TOKEN` don't freely trigger `pull_request` workflows ("create workflow runs that require approval") | Needs a separate deploy/tooling story (wrangler), a new vendor account, and a second copy of the pipeline logic |

Sources (fetched 2026-09-25):
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/sandbox/

**Recommendation: GitHub Actions.** It runs the existing `node fetch.ts`/`build.ts` contract unchanged, costs nothing on this public repo, and produces the review artefact (a PR) directly. The repo already grants workflows write access and PR creation (API-verified). The two gotchas don't matter much here:
- **60-day disable.** This repo sees near-daily commits, and each merged monitor PR is activity. If it ever trips, `gh workflow enable monitor-co2-ppm.yml` fixes it.
- **`GITHUB_TOKEN` PRs don't trigger other workflows.** There are no PR workflows, and validation runs inside the monitor job itself.

Revisit Cloudflare only when the raw archive outgrows git (the stated small-data ceiling says it won't) or for the Flowershow-side publishing path.

## 4. Pilot: co2-ppm

### Why co2-ppm over oil-prices (on evidence)

| | co2-ppm | oil-prices |
|---|---|---|
| Change cadence | Monthly, so ~12 PRs/year: human review is sustainable | Weekly PRs with ~15 new rows each, plus the unexplained 700–900-row deletions to adjudicate first |
| Diff reviewability | Raw archive is small text CSV (~50 KB); the PR shows the raw diff *and* the data diff line by line | Raw archive is 8 binary `.xls` (~1.4 MB) that git can't diff; ~70 MB/year of binary churn if refreshed weekly |
| Build dependencies in CI | None | SheetJS `xlsx` 0.18.5, `npm audit`: high severity, no fix on npm. Running it unattended on untrusted downloads is a poor first pilot |
| Schema-drift guard | `assertHeader` on all 5 files already (the exact failure the community co2-ppm repo suffered) | Asserts only cell A3 = "Date" |
| Revisions exercise the design | Yes: new month + real revisions back to 1982 + comment-only raw changes that must *not* cause a PR | Yes, but the first run would be dominated by one unexplained event |
| Story value | Keeling Curve story already exists | Also enriched |

oil-prices is the right **second** dataset, once the deletion question is resolved and the `xlsx` dependency question is settled. Airports (daily, ~17 MB, FK-orphan failures) and Tesla (quarterly, noisy submissions index) come later.

### Pilot specification

**New files in `datasets/climate-and-environment/co2-ppm/`:**
- `fetch.ts`
  - Downloads the 5 NOAA URLs already listed in `build.ts`, sequentially with 1 s pacing, a 30 s timeout, 3 tries and exponential backoff. UA `datapressr hello@datahub.io`.
  - Honours `DATAPRESSR_ARCHIVE_DIR` and `--refresh`.
  - Sanity-checks each body: HTTP 200, UTF-8 text, contains the expected header line (`year,month,decimal date,…` / `year,mean,unc` / `year,ann inc,unc`). That way an HTML error page served with 200 fails the fetch, not the build.
  - Writes `manifest.json` with `source_id` = file stem, plus `url, path, retrieved_at, http_status, bytes, sha256, last_modified`.
- `archive/manifest.json`: generated once from a fresh fetch in the first implementation PR. This also replaces the mixed 08-30/09-05 snapshot with one consistent one.
- `build.ts`: optionally adopt tesla/hazard's "verify every SHA-256 against the manifest before parsing". Cheap, and it makes the archive tamper-evident.

**Workflow `.github/workflows/monitor-co2-ppm.yml`** (sketch):

```yaml
name: monitor co2-ppm
on:
  schedule:
    - cron: "23 7 * * 1"        # Mondays 07:23 UTC: off the top of the hour; NOAA posts ~5th-8th
  workflow_dispatch: {}
permissions:
  contents: write
  pull-requests: write
concurrency:
  group: monitor-co2-ppm
  cancel-in-progress: false
env:
  DS: datasets/climate-and-environment/co2-ppm
  BRANCH: monitor/co2-ppm
jobs:
  refresh:
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@<pinned-sha>
      - uses: actions/setup-node@<pinned-sha>
        with: { node-version: 24 }
      - name: Detect source changes
        id: detect
        run: |
          set +e
          node scripts/source-diff.mjs "$DS" --keep "$RUNNER_TEMP/fresh" --markdown > "$RUNNER_TEMP/sources.md"
          code=$?; echo "code=$code" >> "$GITHUB_OUTPUT"
          cat "$RUNNER_TEMP/sources.md" >> "$GITHUB_STEP_SUMMARY"
          [ $code -le 1 ] || exit $code          # 2 = fetch/manifest error -> fail the run
      - name: Rebuild from fresh snapshot
        if: steps.detect.outputs.code == '1'
        working-directory: ${{ env.DS }}
        run: |
          rm -rf archive && cp -R "$RUNNER_TEMP/fresh" archive
          node build.ts
          node enrich.ts
          node scripts/validate-datapackage.mjs .
      - name: Open or update PR if data changed
        if: steps.detect.outputs.code == '1'
        env: { GH_TOKEN: "${{ github.token }}" }
        run: |
          if git diff --quiet -- "$DS/data"; then
            echo "Raw sources changed but data/ is identical (e.g. NOAA 'File Creation' line) - no PR." >> "$GITHUB_STEP_SUMMARY"
            exit 0
          fi
          git switch -C "$BRANCH"
          git add "$DS/archive" "$DS/data" "$DS/SUMMARY.md"
          git -c user.name="github-actions[bot]" -c user.email="41898+github-actions[bot]@users.noreply.github.com" \
              commit -m "co2-ppm: refresh from NOAA GML ($(date -u +%F))"
          git push --force origin "$BRANCH"
          # body = sources.md + per-resource row counts before/after + git diff --stat
          gh pr view "$BRANCH" >/dev/null 2>&1 && gh pr edit "$BRANCH" --body-file body.md \
            || gh pr create --head "$BRANCH" --base main --title "co2-ppm: upstream update $(date -u +%Y-%m)" --body-file body.md --label monitor
```

Notes on the design:
- A **fixed branch name** means repeated runs update one open PR instead of stacking new ones. If a later NOAA release lands before merge, the PR simply picks it up.
- **Weekly** schedule against a monthly source keeps the time to detect a revision under 7 days at a trivial cost. A raw-only change (comment line) produces no PR, just a job-summary line.
- Plain `git` + `gh` (both preinstalled on ubuntu runners), so no third-party PR action to trust or pin.

**What the PR contains:**
- `archive/*.csv` (the new raw bytes; reviewable text diff)
- `archive/manifest.json` (new hashes/sizes/Last-Modified)
- `data/*.csv`
- `SUMMARY.md` (the regenerated stats block only)
- **Body:** the source-diff markdown table (which files changed, bytes delta), per-resource row counts old → new with the latest period, the count of *revised historical rows* (changed lines not at the tail), and `git diff --stat`, plus a checklist:
  - revisions plausible?
  - any rows removed?
  - does the "What stands out" prose in SUMMARY.md / README coverage lines need a touch?

**Failure behaviour** (in every case: no PR, `main` and `archive/` untouched, the run goes red, and GitHub notifies the last editor of the cron):

| Case | What happens |
|---|---|
| Source down / timeout / 5xx | `fetch.ts` retries 3× with backoff, then throws → `source-diff` exit 2 → run fails. The next weekly run retries naturally. No issue is auto-filed: per AGENTS.md "one tracker", a human files a bead if it persists |
| 200 with wrong body (HTML error page, truncated file) | `fetch.ts` content check fails → exit 2 → same as above |
| Upstream schema drift (renamed/added column) | `fetch.ts` header check or `build.ts` `assertHeader` throws with the expected/got header in the log and step summary → run fails. Fixing it is a deliberate human edit to `build.ts` + schema, never auto-adapted |
| Build sanity failure (row minimums) | `build.ts` throws → run fails |
| Validation failure | `validate-datapackage.mjs` exits non-zero → run fails |
| Suspicious-but-valid change (mass deletions like the EIA case) | Build passes → PR opens, but the body's "rows removed / revised" counts make it obvious. The human does not merge until it's explained |

**Human review and merge:**
- A maintainer reviews the PR (raw diff + data diff + body checklist), spot-checks against https://gml.noaa.gov/ccgg/trends/, optionally re-runs locally (`node build.ts` must reproduce the PR's `data/` exactly), tweaks README/SUMMARY prose on the same branch if needed, then squash-merges.
- Closing without merging is fine: the next run reopens with the then-current upstream.

**Setting `status: monitored`:** set it after, not before, the first *automated* PR has been reviewed and merged. That keeps `monitored` meaning "a proven, running refresh loop exists", not "a workflow file exists". The change is a one-line `datapackage.json` edit plus a README "Updates" note (schedule, workflow link, where to see runs). It lands in that first merged monitor PR or right after it. If the workflow is later disabled or removed, revert to `enriched`.

**Future DataHub push (after merge, never before):** a separate workflow `.github/workflows/publish-co2-ppm.yml`:
- trigger: `on: push: branches: [main]` with `paths: [datasets/climate-and-environment/co2-ppm/**]`, plus `workflow_dispatch`
- install `dh` from the `datopian/datahub-next` release tarball (`dh_linux_amd64.tar.gz`, latest `cli/v0.1.0`, has `checksums.txt`, so verify it)
- run `dh push .` with `DATAHUB_API_TOKEN` from a repo secret and `DATAHUB_API_URL` / `DATAHUB_PUBLICATION` from repo variables
- first step: `if [ -z "$DATAHUB_API_TOKEN" ]; then echo "no credentials - skipping"; exit 0; fi`, matching AGENTS.md "skip if credentials are not configured"
- optionally bind it to a GitHub `environment: datahub` with a required reviewer, if even post-merge publication should be gated

The merge is the human approval. The push is mechanical. Nothing publishes from the monitor job itself.

## 5. Sequenced tasks (bead-sized)

1. **`scripts/source-diff.mjs`: manifest diff + refresh-to-scratch helper** (this is bead `datapressr-02p`; refine rather than duplicate). Implement the CLI/module in §2 plus the fixtures listed there, and add the one-line `DATAPRESSR_ARCHIVE_DIR` override to the four existing `fetch.ts`. *Acceptance:* `npm test` covers unchanged (0), changed (1), added/removed, status change, name-keyed and malformed (2) manifests, plus an offline end-to-end fixture dataset; `node scripts/source-diff.mjs datasets/demographics/population-growth` exits 0 against the committed manifest, and the dataset's `archive/` is byte-identical afterwards. *Deps:* none.

2. **co2-ppm: add `fetch.ts` + hashed `archive/manifest.json`.** Write a fetcher in the house shape for the 5 NOAA files (content/header checks, `source_id` keys, `http_status`, `last_modified`), take one consistent fresh snapshot, rebuild, re-enrich, and update README coverage lines (or stop hard-coding counts there). Optionally add SHA verification to `build.ts`. *Acceptance:* `node fetch.ts --refresh && node build.ts && node enrich.ts` reproduces the committed files; `source-diff` on co2-ppm exits 0 right after commit; `/validate` clean; the PR shows the 2026-08 row and the NOAA revisions. *Deps:* 1 (for the env-var convention; can be developed in parallel).

3. **Monitor workflow for co2-ppm (GitHub Actions → PR).** Add `.github/workflows/monitor-co2-ppm.yml` per §4 (pinned action SHAs, weekly cron + `workflow_dispatch`, fixed branch, PR body with source table/row counts/revised-row count). *Acceptance:* a `workflow_dispatch` run with no upstream change ends green with "no change"; a run against a deliberately stale archive (e.g. on a test branch, or by reverting the snapshot once) opens exactly one PR; a second run updates the same PR; a simulated fetch failure (bad URL on a branch) goes red without touching `main`. *Deps:* 1, 2.

4. **Document the monitor loop.** Record the decision (GitHub Actions over Cloudflare, with the evidence from §3) in `site/docs/` (the `monitor-execution.md` that bead 46c names). Update `site/docs/lifecyle.md` and `skills/archive/SKILL.md` "What this doesn't cover" to point at it, including the review checklist and failure table. Close 46c / issue #6 with a pointer. *Acceptance:* a doc a new session can follow to add a second monitored dataset without reading this report. *Deps:* 3 (write it from what actually shipped).

5. **First reviewed automated update → `status: monitored`.** Let the scheduled run produce a real PR (NOAA's October release, expected ~Oct 5–8), review it against the checklist, merge, and set `"status": "monitored"` + a README "Updates" note. Add a changelog entry in `site/changelog/`. *Acceptance:* one merged PR authored by `github-actions[bot]`, dataset status `monitored`, changelog entry published. *Deps:* 3.

6. *(Optional, post-pilot)* **Post-merge DataHub publish workflow.** Add `publish-co2-ppm.yml` per §4, with the credential-absent skip. *Acceptance:* with no secret it's a green no-op; with the secret configured, a merge to `main` touching co2-ppm results in `dh push` succeeding. *Deps:* 5, plus DataHub credentials decided by a human.

7. *(Optional, next dataset)* **oil-prices: resolve the EIA row deletions before monitoring.** Investigate why the live EIA daily workbooks drop ~890 (Brent) / ~743 (WTI) historical days present in the 2026-09-05 snapshot (upstream methodology change? publication glitch?), decide the policy (follow upstream or keep the removed rows with a flag), and assess replacing SheetJS 0.18.5 (high-severity advisories, no npm fix). Only then add `fetch.ts` + manifest and a monitor workflow cloned from co2-ppm. *Deps:* 3; independent of 5.

## Open questions for the architecture review (bead 46c asks for one before follow-ups)

- Should a schema-drift failure also open a *draft* PR containing only the raw `archive/` change, so the new shape is visible in review rather than only in a red run log? That's more visible, but more machinery. I'd leave it out of the pilot.
- Should `datapackage.json` record monitoring metadata (e.g. a custom `monitor: {schedule, workflow}` key), or is `status: monitored` + a README note enough? Suggest the latter until a second dataset needs more.
- Retention: `archive/` is overwritten per refresh, and git history is the version log. That matches "preserve successive snapshots" in `lifecyle.md` for text sources. For binary sources (oil `.xls`) it's heavier. Revisit at task 7.
