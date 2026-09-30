# DataPressr desktop app v0.1.0

A read-only BB panel for real CSV datasets, README files, Markdown stories, static HTML and local chart images. Previews follow the conversation's actual local worktree, refresh automatically, and remember the selection. The eight canonical DataPressr skills are available to Codex and Claude Code.

Start with the [installation and user guide](../site/docs/bb-preview.md). v0.1 has been installed and visually tested in native BB, including real provider validation/edit runs; see the [acceptance evidence](../docs/benchmarks/bb-preview-v01.md).

## Develop locally

Tested with BB 0.44.0 and Node 25.8.1 (requires Node 22.18+ for native TypeScript execution). The plugin SDK is pinned to 0.5.29. From this directory:

```sh
npm ci --ignore-scripts
npm test
npm run typecheck
npm run build
npm run skills:check
bb plugin install . --yes
```

Open a conversation, show its right panel, open a new tab and choose **DataPressr Preview**. The viewer makes no project writes and starts no agent calls. `bb plugin dev .` rebuilds and reloads during development; stop it before checking file refresh. Inspect logs with `bb plugin logs datapressr-preview`.

## Workspace adapter

`src/bb-workspace.ts` uses public SDK methods `threads.get`, `environments.get` and `system.config`. BB's `primaryHostId` identifies the server machine ([BB system overview](https://github.com/get-bb/bb/blob/main/docs/system-overview.md)). The adapter rejects other hosts before touching the filesystem, rejects unavailable environments, canonicalizes the directory and verifies that it exists. Clients supply only a thread ID; there is no fixture setting or client-supplied absolute root. No experimental SDK surface is used for workspace resolution.

Installation keeps the `datapressr-preview` plugin ID and explicitly replaces the installed source path. The earlier fixture experiment remains under `experiments/bb-preview/`; its previously installed worktree is preserved and can be reinstalled using its README. Do not delete a source directory while BB uses that installation.

## References

- [v0.1 plan and Beads handoff](../docs/plans/2026-09-30-bb-preview-v01-plan.md)
- [Working PoC](experiments/bb-preview/bb-plugin-datapressr-preview/README.md)
- [Autonomous development gate](../docs/plans/2026-09-30-bb-preview-development-gate.md)
- [v0.1 acceptance evidence](../docs/benchmarks/bb-preview-v01.md)

## Document rendering

The BB 0.44 Markdown component was tried with its public experimental document context and rendered the Keeling chart. Its public props provide no image loader override for our per-asset bound and no-remote-fetch policy. Documents therefore use `marked` plus `sanitize-html` on the server, CSS URL processing with PostCSS, and a script-disabled iframe. The frame permits same-origin parent access solely for local-link navigation and scroll preservation; it never permits document scripts. CSP denies network resources and forms. Images arrive as data URLs through bounded reads. Local CSS imports and URLs are bundled; unsupported or missing assets are visibly reported. Limits: 10 MiB per input/asset, 100 assets and 30 MiB combined per document. JavaScript, remote resources, fonts and application servers are excluded.

## Canonical skills

`npm run build` regenerates `generated-skills/` from the eight canonical directories in the repository's `skills/`. The generated folder is ignored by Git; never edit it. Every reference file is copied. `npm run skills:check` detects altered, missing or extra bundle files. BB imports this directory through the supported `bb.skills` manifest field; no global installation or absolute machine path is needed. Keep the checkout's `skills/` alongside `desktop-app/` when building.

Open a new conversation after installing/updating the plugin. Both Codex and Claude Code expose `archive`, `capture`, `enrich`, `init`, `push`, `story`, `structure`, and `validate` through BB's skill commands. These retain the canonical review and publishing gates. v0.1 supports repository-scoped workflows; it does not repair skills for arbitrary empty projects. Existing `.claude/skills/` symlinks can remain: on tested BB 0.44.0 they were absent from the command listings, and the plugin supplies one entry per skill. Inspect your environment if another installation already supplies these names.

## Operational limits

CSV displays at most 200 rows and 100 columns, with explicit sample labels. Discovery visits at most 10,000 entries, skips hidden/archive/dependency/build folders, and lists at most 100 matches at once. Use direct relative-path entry for omitted files. Only mounted, visible previews poll; catalog rescans are manual. Temporary errors clear stale content and retry. Selection persistence uses BB KV keyed by thread and environment; saves are ordered across panel reopening and rescans. The viewer never writes project files.

To update, repeat the build/install steps from this directory. `bb plugin disable datapressr-preview` unloads the viewer and its skills while retaining preferences; `bb plugin enable datapressr-preview` restores it. `bb plugin source datapressr-preview` identifies the installed path. Do not remove it before installing another source. Remote hosts, arbitrary JavaScript/remote resources, application servers, XLSX/Parquet/PDF and `datapackage.json.views` rendering are unsupported.
