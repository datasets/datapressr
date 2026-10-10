---
name: push
description: "Use this skill to publish the current dataset directory to DataHub with the `dh publish` CLI command, or (story mode, inside the DataPressr repo) to publish an approved data story as its own DataHub page. Checks datapackage.json, the root README.md, views and credentials (from `dh login` or DATAHUB_API_TOKEN) first, always passes an explicit --publication, and skips cleanly if `dh` or credentials aren't set up (committing to git is enough on its own). Invoked as `/push` in Claude Code, or by name; operates on the dataset in the current directory, or on the story named as the argument."
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

## Story mode: publish a data story

Use this path when the argument names a story (`/push story oil-prices`, or "publish the oil story") rather than a dataset. It needs the DataPressr repo: stories live in its `site/stories/`, and the bundler is [scripts/bundle-story.mjs](https://github.com/datasets/datapressr/blob/main/scripts/bundle-story.mjs). On DataHub a story is a page with a `README.md` and no `datapackage.json`: DataHub shows the title, description, "Published <date>" and author, then the Markdown. Step 0 (skip cleanly if `dh` or credentials are missing) applies unchanged.

Never publish `site/stories/` itself, or a story file in place: it holds every story, the outlines, build scripts and `node_modules`, and the story has an h1 and internal "Friction notes" that DataHub would show. Always publish the bundle.

1. **Pick the publication.** As in section 2: `$DATAHUB_PUBLICATION` if set, otherwise `datapressr`. Stories go to `datapressr` (beside their datasets) until a story has had its voice pass and a grant to another publication (the DataHub `blog`) is recorded in the bundler's `PUBLICATIONS` list. Never `core`.
2. **Check approval.** Read the story's frontmatter `datahub` block. `status: approved` with a dated `approved:` line may go to any publication with a recorded grant. `status: draft` (every story until its voice pass) may only go to `datapressr`, and only when the owner has explicitly said this draft may be published; record that OK (verbatim, dated) in the Bead before passing `--allow-draft`. Never mark a story approved yourself.
3. **Build the bundle.** This checks approval, refuses `core` and publications without a grant, refuses a slug that is a local dataset name, rewrites links, keeps only `README.md` plus the SVGs it references, and checks the result compiles as DataHub MDX. It exits non-zero, naming the problem, if any of that fails; stop and report it.

   ```sh
   pub="${DATAHUB_PUBLICATION:-datapressr}"
   json=$(node scripts/bundle-story.mjs <story> --publication "$pub") || exit 1   # add --allow-draft only with a recorded owner OK
   echo "$json"   # dir, slug, publication, status, title, description, files, command
   ```

   Look at `files`: it should be `README.md` and the charts, nothing else.
4. **Check the slug on DataHub.** The bundler only knows local dataset names. `curl -s -o /dev/null -w '%{http_code}' https://datahub.io/$pub/<slug>` should be `404` (a new page) or this same story's earlier publish. Anything else at that URL (a dataset, another story) means stop: pick another slug in the story's frontmatter.
5. **Publish.** Run the `command` the bundler printed, which is `dh publish <bundle dir> --publication <pub> --name <slug> --title <title> --description <description>`. `dh` reads title and description only from `datapackage.json`, which a story doesn't have, so they must be passed as flags:

   ```sh
   node -e 'const [cmd, ...args] = JSON.parse(process.argv[1]).command; require("node:child_process").execFileSync(cmd, args, { stdio: "inherit" })' "$json"
   ```
6. **Check the page in a real browser** (`https://datahub.io/<pub>/<slug>`), not just the "N file(s) published" line: the title appears once (header only, no repeated h1); the description shows under it; every chart loads; there is no "Error parsing MDX" (an MDX failure blanks the whole body inside an HTTP 200 page); every link works, especially dataset links and the outline link.
7. **Report the URL and these caveats:**
   - **Title and description are fixed at first publish.** Re-publishing does not update them; change them in the DataHub dashboard.
   - **The date shown is the first publish**, not the frontmatter `date`, and re-publishing does not move it.
   - **Deleted or renamed files linger.** Publishing is an upsert: a renamed chart leaves the old SVG online. `dh delete <slug> -p <pub>` removes the whole page, losing its URL history, so prefer not to.

## Installing `dh`

`dh` is a Go binary from [datopian/datahub-next](https://github.com/datopian/datahub-next/tree/staging/cli), not an npm package. The repo is private, so you need GitHub access to it. Download the release for your platform (`dh_darwin_arm64`, `dh_darwin_amd64`, `dh_linux_amd64`, `dh_linux_arm64` or `dh_windows_amd64.zip`), check it and put it on your `PATH`:

```sh
gh release download v0.1.0 -R datopian/datahub-next -p 'dh_darwin_arm64.tar.gz' -p checksums.txt
shasum -a 256 -c checksums.txt --ignore-missing   # Linux: sha256sum -c --ignore-missing checksums.txt
tar -xzf dh_darwin_arm64.tar.gz && mv dh ~/bin/   # any directory on your PATH
```

Then the person (not the agent) runs `dh login` once in a terminal; it signs in through the browser.

## `dh` command reference (v0.1.0)

Checked against `dh --help` on the v0.1.0 release binary. Commands: `publish`, `login`, `logout`, `delete`, `publication create`, `completion`.

- `dh publish [dir]`: `-p/--publication`, `-n/--name` (default: `datapackage.json` `name`, then the directory name), `-t/--title`, `-d/--description`, `-a/--author` (repeatable). GitHub-link mode (`-g/--github owner/repo`, `--branch`, `--subdir`) is not used here: it ignores `.datahubignore` and would publish `archive/`, build scripts and `AGENTS.md`.
- `dh delete <name>`: `-p/--publication`.
- `dh login`: `--api-url` (default `https://datahub.io`). It saves `{apiUrl, token, publication}` to the credentials file with `publication` empty, which is one more reason to always pass `--publication`.
- `dh publication create <slug>`: `-n/--name` (display name). The `datapressr` publication already exists at https://datahub.io/datapressr, so you don't need this.
- `--publication` overrides `DATAHUB_PUBLICATION`, which overrides the credentials file.

For CI, run `dh login` once as the publishing user, copy the `token` value from the credentials file into a `DATAHUB_API_TOKEN` secret, and set `DATAHUB_API_URL=https://datahub.io`. Treat that token as highly privileged and keep the secret tightly scoped.
