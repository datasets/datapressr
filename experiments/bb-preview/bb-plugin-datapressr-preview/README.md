# DataPressr BB preview experiment

A read-only feasibility stub proving that an AI developer can build, reload, operate, and visually inspect a BB plugin on this computer. It previews fixed synthetic fixtures: CSV as a table, Markdown through BB's renderer, and a self-contained HTML story/chart in a sandboxed iframe. It is not yet a general project viewer or a DataPressr skill integration.

## Reproduce

Tested with BB 0.44.0, plugin SDK 0.5.29, and Node 25.8.1 on macOS. Start the installed BB application first. From this directory:

```sh
npm ci --ignore-scripts
npm test
npm run typecheck
bb plugin build .
bb plugin install . --yes
bb plugin config datapressr-preview set fixtureDirectory "$PWD/fixtures"
bb plugin dev .
```

The scaffold retains BB's type-only development dependencies because its SDK declarations refer to them. Runtime dependencies are Zod and csv-parse; BB supplies React and the plugin runtime. `node_modules/` and `dist/` are ignored.

Open **DataPressr Preview** in the sidebar, or open a conversation's right panel → New tab → DataPressr Preview. Switch between Data, README, and Story. The browser UI is served by the same BB server as the native application; this installation uses `http://127.0.0.1:38886/plugins/datapressr-preview/preview`. Use the server URL reported by `bb --help` on another installation.

## Development and checks

- Change the subtitle in `app.tsx` while `bb plugin dev .` is running; BB rebuilds and reloads the plugin. Reloading remounts the component and resets its active tab to Data.
- Stop the watcher with Ctrl+C, change a value in `fixtures/table.csv`, and watch the preview update without reloading BB. The viewer polls once per second, with one request in flight per mounted view.
- Temporarily rename `fixtures/README.md`, select README, observe the error, then restore the file and observe automatic recovery.
- Read backend logs with `bb plugin logs datapressr-preview`. Build/typecheck/test failures are visible in the terminal. Native and browser UI can be inspected with the computer-control tools available in this session.
- Restore synthetic fixtures after checks. No new agent conversation or provider run is needed for these viewer tests.

## Boundaries

All panels show the same configured fixture directory, regardless of conversation. Reads are capped at 256 KiB; the table is not virtualized. HTML is self-contained, scripts are disabled, and relative assets are not wired up. README uses BB's Markdown renderer without document-relative asset routing. The HTML chart is a separate static fixture, not automatically regenerated from CSV. The plugin runs on the local BB server; remote hosts and arbitrary worktrees are untested.

This is code isolation in a Git worktree, not a security sandbox: BB plugins are trusted code running in the host application. The installed BB application and existing provider configuration are reused. Full Claude Code/Codex → DataPressr skill → file update integration remains a subsequent experiment.

## Stop or resume

The development watcher is stopped at handoff; the plugin remains installed and enabled for inspection. Disable it with `bb plugin disable datapressr-preview`; enable it with `bb plugin enable datapressr-preview`. Keep its installed worktree path until reinstalling from a new path. No source build of BB was necessary.
