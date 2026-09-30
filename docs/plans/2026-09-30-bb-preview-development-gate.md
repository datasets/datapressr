# BB preview development gate

Date: 2026-09-30. Tracking: `datapressr-01n`. Scope: authorized feasibility stub and autonomous testing, before committing to a product implementation.

## Agreed vision

A workspace for creating datasets and data stories with Claude Code or Codex using the DataPressr skills, with rendered artifacts alongside the conversation. Outputs include readable data tables, charts, dataset documentation such as README files, and stories combining prose and visuals. The user asks the agent for changes and sees the resulting files update. Direct editing is out of scope. Selection, annotation, rich schema inspection, and validation dashboards are possible later additions, not initial requirements.

The decisive platform requirement is that the developing AI can run the host, build and reload its plugin, inspect the actual interface, and reproduce checks without asking the user to test changes manually. Reuse of BB is preferred, conditional on demonstrating that loop. A controllable standalone application is the fallback if that gate fails.

## Experiment plan

**Goal:** demonstrate a repeatable build → load → visually inspect → change → visually reinspect loop on this computer.

**Architecture:** a small BB plugin in `experiments/bb-preview/bb-plugin-datapressr-preview/` with a read-only panel, a backend RPC that reads bounded fixture files, and periodic preview refresh. Fixtures represent a table, README, and HTML story/chart. This deliberately fixed fixture root proves local development and rendering; arbitrary workspace selection is not part of the stub.

**Tools:** installed BB 0.44.0, its matching plugin SDK, Node, TypeScript/React, and native/browser computer control. Use the existing packaged application first; a source build is only necessary if it prevents inspection or plugin loading. A Git worktree isolates code changes; this is not an OS security sandbox.

1. Launch BB and verify that computer control can read its actual interface.
2. Scaffold the plugin using `bb plugin new datapressr-preview`; retain only the preview experiment code and matching SDK dependencies.
3. Write failing reader tests for supported artifacts, bounded reads, and file refresh, then implement the read-only fixture reader and RPC.
4. Build and typecheck with the installed BB toolchain. Install the local plugin and inspect table, README, and story previews through the UI.
5. Change a fixture and observe the updated content. Change the plugin interface and use `bb plugin dev` to observe rebuilding and reload. Inspect logs and demonstrate error recovery if practical.
6. Record actual results, commands, host/version limitations, cleanup state, and any remaining integration gaps. Commit the experiment and documentation. No full DataPressr workflow integration is implied by a passing preview gate.

## Results

**PASS for local autonomous plugin development and visual inspection.** The installed packaged BB was sufficient; no source build, new provider login, user testing, or new agent run was needed. This is a development feasibility result, not completion of the DataPressr application.

| Check | Observed result |
| --- | --- |
| Launch and inspect BB | Native BB launched via computer control; its live accessibility tree was readable. |
| Build plugin | `bb plugin build .` compiled backend and frontend against SDK 0.5.29. |
| Install plugin | Local path installation reported `datapressr-preview@0.1.0 running`. |
| View outputs | Browser UI showed the CSV table, rendered Markdown README, and HTML story with chart; screenshots visually inspected. |
| Conversation alongside output | Opened the plugin through an existing conversation's right-panel launcher in native BB and inspected its story/chart screenshot. Conversation content was not edited and no new provider run was started. |
| Development reload | Changed the subtitle from “Read-only preview” to “Live preview”; watcher reported a rebuild in 112 ms and reload, and the live UI showed the new wording. |
| File refresh independent of build | Stopped `bb plugin dev`, changed the France CSV fixture value to 49, then observed the table value and revision change without a page reload. Restored the fixture to 42 afterward. |
| Error and recovery | Renamed README temporarily, observed a missing-file error, restored it, and observed rendered Markdown return automatically. |
| Reader checks | Two Node tests initially failed against the unimplemented reader, then passed for quoted CSV, subsequent file changes, Markdown/HTML content, unsupported artifact IDs, and the file-size cap. |
| Static checks | TypeScript check and BB build passed. Final npm install audit reported zero vulnerabilities. |

![BB showing the DataPressr story preview](images/2026-09-30-bb-preview.jpg)

## Reproduction and handoff

Repository layout update: the committed PoC now lives in `desktop-app/experiments/bb-preview/bb-plugin-datapressr-preview/`. The original installed worktree path below remains valid and was deliberately left in place.

The committed [experiment README](../../desktop-app/experiments/bb-preview/bb-plugin-datapressr-preview/README.md) contains exact setup and repeatable check commands. The installed plugin points to `/Users/rgrp/.config/superpowers/worktrees/datapressr/bb-preview-spike/experiments/bb-preview/bb-plugin-datapressr-preview`; preserve this worktree while using that installation. The native application and browser UI share the server at `http://127.0.0.1:38886` on this computer. The development watcher is stopped; the plugin remains enabled for inspection.

The screenshot saved in the repository shows only the fixture preview page. The native split-view screenshot was inspected in the session but not committed, to avoid including an unrelated existing conversation in the repository.

## Limits and next decision

The stub uses a fixed fixture directory, a one-second polling loop, bounded file reads, a non-virtualized table, BB's Markdown renderer, and a script-disabled HTML iframe. HTML relative assets and README document-relative links are not wired up. It does not yet select artifacts from the current thread's workspace, run the DataPressr skills, or regenerate the static story chart from CSV. Existing agent configuration was left in place and no provider run was exercised. Remote hosts, clean-machine setup, and a fully isolated BB instance remain untested.

The earlier proposed selection-to-conversation workflow is unnecessary for the agreed initial vision. The next useful product experiment is a real dataset or story directory with its artifacts previewed beside a DataPressr skill run. BB remains the preferred host because the crucial local development gate has passed; a standalone application is not currently needed merely to obtain inspectability.
