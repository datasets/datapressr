---
name: push
description: "Use this skill to publish the current dataset directory to DataHub with the `dh publish` CLI command. Checks datapackage.json, the root README.md, views and credentials (from `dh login` or DATAHUB_API_TOKEN) first, always passes an explicit --publication, and skips cleanly if `dh` or credentials aren't set up (committing to git is enough on its own). Invoked as `/push` in Claude Code, or by name; operates on the dataset in the current directory."
---

# Push: publish the current dataset to DataHub

The skill is called `push` for continuity (`/push` is what people already type), but the CLI command it runs is `dh publish`. The DataHub CLI renamed its `push` command to `publish`; the old name now fails with `unknown command "push"`.

## 0. Skip cleanly if publishing isn't set up

Publishing is optional. Committing and pushing to git is enough on its own. If any of these is missing, tell the user which, and stop. It is not an error.

- **`dh` is installed**: `command -v dh`. If it isn't, point to the install steps below and stop.
- **Credentials exist**, from either source:
  - `dh login` has been run: a credentials file exists at `~/.config/datahub/credentials` (Linux) or `~/Library/Application Support/datahub/credentials` (macOS). This is the normal path on a person's machine.
  - `DATAHUB_API_TOKEN` is set (with `DATAHUB_API_URL=https://datahub.io`). This is the CI path.

Never run `dh login` yourself: it opens a browser and needs the person to sign in.

## 1. Pre-flight checks

1. `datapackage.json` exists in the current directory. If not, stop and tell the user.
2. `resources` is defined and non-empty. If not, warn that the dataset page won't render correctly and ask whether to continue.
3. **A root `README.md` exists.** DataHub renders the dataset page from the root `README.md` (or `index.md`). Without one the page is a 404, even though the upload succeeds. If it's missing, stop and offer to write one: a short description, the source and licence, and what's in each file. Don't start it with a `# Title` heading, because DataHub already shows the title above it.
4. Run `/validate` (`node scripts/validate-datapackage.mjs .`). Fix errors before publishing. Past `stub`, warnings should be fixed too.
5. **Check any `views` against what DataHub renders:**
   - `specType: "simple"` with `type: "line"` works with several series.
   - `specType: "simple"` with `type: "bar"` or `"lines-and-points"` needs the `group` (x) field and `series[0]` to be typed `year`, `yearmonth`, `date` or `number` in the resource schema. `integer` and `string` fields render an "Unsupported field type" error. Only `series[0]` is plotted; any further series are silently dropped.
   - For a categorical x-axis or several bar series, use `specType: "vega-lite"` (a raw Vega-Lite spec; DataHub injects the resource's CSV as data) or `specType: "plot"` instead.
   - Each view's resource must match a resource `name`, or the page shows "Resource not found for view".
6. **Check `.datahubignore`.** Every non-hidden file in the directory is uploaded unless `.datahubignore` excludes it (`.gitignore` is not read). Make sure it covers `archive/`, build and enrich scripts, `node_modules/`, `package*.json` and `AGENTS.md`. Any other `.md` file (such as `SUMMARY.md`) becomes its own sub-page, so exclude it if you don't want that.

## 2. Pick the publication

Always pass `--publication` explicitly. Never rely on a default saved by `dh login`.

- Use `$DATAHUB_PUBLICATION` if it is set, otherwise `datapressr`.
- **Never publish to `core`.** `core` datasets (e.g. co2-ppm, oil-prices, airport-codes) git-sync from `github.com/datasets/*`, and the next sync can overwrite a direct upload. Improvements to a core dataset go upstream as a pull request to its GitHub repo.

## 3. Publish

```sh
pub="${DATAHUB_PUBLICATION:-datapressr}"
case "$(printf %s "$pub" | tr A-Z a-z)" in core) echo "Refusing to publish to core; use datapressr" >&2; exit 1;; esac
dh publish . --publication "$pub"
```

If `$DATAHUB_PUBLICATION` is `core`, stop and tell the user; do not fall back to another publication silently.

`dh publish` reads `name`, `title` and `description` from `datapackage.json` and prints the page URL, `https://datahub.io/<publication>/<name>`.

## 4. Report, with the caveats

Report the URL, then tell the user:

- **Check the page in a browser.** "N file(s) published" only means the uploads finished; the page is processed in the background. Look at the README, the views, the resource previews and the licence.
- **Publishing is an upsert, not a sync.** Files are added or overwritten, but a file deleted or renamed locally stays on DataHub. On a dataset that already exists, the `title` and `description` are not updated either: change them in the DataHub dashboard. `dh delete <name> -p <pub>` removes the whole dataset, losing its identity and dates, so prefer not to.

## Installing `dh`

`dh` is a Go binary from [datopian/datahub-next](https://github.com/datopian/datahub-next/tree/staging/cli), not an npm package. The repo is private, so you need GitHub access to it. Download the release for your platform (`dh_darwin_arm64`, `dh_darwin_amd64`, `dh_linux_amd64`, `dh_linux_arm64` or `dh_windows_amd64.zip`), check it and put it on your `PATH`:

```sh
gh release download v0.1.0 -R datopian/datahub-next -p 'dh_darwin_arm64.tar.gz' -p checksums.txt
shasum -a 256 -c checksums.txt --ignore-missing   # Linux: sha256sum -c --ignore-missing checksums.txt
tar -xzf dh_darwin_arm64.tar.gz && mv dh ~/bin/   # any directory on your PATH
```

Then the person (not the agent) runs `dh login` once in a terminal; it signs in through the browser.

For CI, run `dh login` once as the publishing user, copy the `token` value from the credentials file into a `DATAHUB_API_TOKEN` secret, and set `DATAHUB_API_URL=https://datahub.io`. Treat that token as highly privileged and keep the secret tightly scoped.
