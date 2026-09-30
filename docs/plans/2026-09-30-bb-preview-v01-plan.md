# DataPressr BB preview v0.1 implementation plan

**Goal:** use the DataPressr skills through Claude Code or Codex in BB while viewing real datasets, documentation, charts, and stories beside the conversation, with updates visible automatically.

**Architecture:** a local BB plugin resolves each conversation's actual workspace, discovers previewable artifacts, and renders a selected file in its thread panel. A small BB adapter supplies workspace identity and transport; file handling and renderer logic remain separate. DataPressr's existing skills direct the agent's work; the viewer never edits project files.

**Tech stack:** TypeScript/React, BB plugin SDK pinned to a verified installed version (PoC: BB 0.44.0 / SDK 0.5.29), Node filesystem or BB's supported local file service, csv-parse, BB Markdown rendering if it satisfies relative-asset behavior, Node tests, and computer-controlled native/browser checks.

Date: 2026-09-30. Planning scope authorized by the user; implementation starts in a subsequent session or on explicit continuation. Beads owns task status and completion evidence. This document defines scope, contracts, dependencies, and acceptance, not a second task queue.

## Context and direction

The user wants the OpenDesign interaction pattern for a dataset **or a data story**, including dataset documentation such as README files. Conversation and rendered outputs stay visible together. Changes are requested through the agent. Direct editing is excluded from v0.1, as are cell selection-to-prompt, annotations, profiling dashboards, a new chart editor, publishing controls, and a new agent harness.

The [initial assessment](2026-09-29-visual-data-workspace-assessment.md) favored BB. The [development gate](2026-09-30-bb-preview-development-gate.md) proved that the assistant can launch BB, build/install/reload a plugin, inspect the native and browser interfaces, observe file changes, and test error recovery without asking the user to perform manual QA. Source code is in `desktop-app/experiments/bb-preview/bb-plugin-datapressr-preview/`.

Situation: the working PoC has the desired shape. Complication: every panel reads the same fixed fixture directory, and its HTML demo does not exercise DataPressr's real Markdown stories with local SVG charts. The implementation question is how to turn that proof into a reliable, installable viewer for actual work while preserving the proven autonomous development loop.

## v0.1 scope and defaults

- **Primary environment:** this computer, a local BB server, and a local project or Git worktree. Resolve the thread's actual environment, never assume its project default directory. Remote hosts get an explicit unsupported message in v0.1 rather than reading an identically named local path.
- **Primary acceptance project:** an isolated copy/worktree of DataPressr, with its existing datasets and stories. The viewer may work in other local projects, but standalone skill portability is not a release claim; that broader work remains `datapressr-4ly.2`.
- **Outputs:** local CSV, Markdown, self-contained/static HTML with local assets, SVG, PNG, JPEG, and WebP. Render README and story Markdown with frontmatter hidden and sibling chart images visible. No XLSX, Parquet, PDF, remote-resource download, notebook kernel, or arbitrary application dev-server management in v0.1.
- **Charts:** preview agent-generated chart files and charts embedded in documentation/stories. Do not implement a new renderer for `datapackage.json.views`; list resources from metadata and let the skills generate charts using their existing workflow.
- **Primary entry:** a conversation's right-panel “DataPressr Preview” action. The panel includes a compact artifact picker and a rendered preview. A matching file-opener integration is useful but optional after core acceptance; do not block the release on a second entry point.
- **No project writes from the viewer:** selection and UI preferences may be persisted through BB; file content changes are exclusively agent/CLI work. Opening the viewer never starts a model call, builds charts, installs dependencies, or publishes a dataset.
- **Distribution:** local source install with documented build steps and a versioned package, not an npm or marketplace launch. Preserve the PoC until the new install works; keep the same plugin ID so an explicit reinstall replaces the source rather than leaving duplicate plugins.

These are bounded implementation defaults, available for user steering before work starts. They do not require a new approval round for routine choices within this scope.

## User walkthroughs

### Dataset and documentation

Open a BB conversation in a DataPressr worktree. Open DataPressr Preview, choose `datasets/climate-and-environment/co2-ppm/README.md`, then select one of that dataset's CSV resources. The README renders as a document; CSV has readable column headings and a bounded table preview. Ask the agent to improve a description or change the dataset through its normal skills. The selected preview updates without reopening it, and the visible path makes clear which file is being shown.

### Story and charts

In the same project, select `site/stories/keeling-curve.md`. Read the prose with its sibling SVG charts in place. Open a chart on its own when useful, return to the story, and keep the document visible while discussing a revision with the agent. No `datapackage.json` is required for a story. Rebuilding a chart updates its appearance even when the Markdown file itself is unchanged.

### Two worktrees and interrupted writes

Open two threads using different worktrees, with the same relative README path but different contents. Each preview shows its own environment's content and remembers its own selection. During a partial rewrite or temporary missing file, the viewer shows an honest unavailable/updating state and recovers; it never silently switches to another file or presents old output as current.

## Component boundaries

Product directory and final package location: `desktop-app/`. This names the mini app; BB is its initial implementation host. Keep root dataset tooling and package dependencies unchanged. The PoC now lives under `desktop-app/experiments/bb-preview/bb-plugin-datapressr-preview/`; preserve the separately installed PoC worktree path until explicitly reinstalling. Keep BB-specific code behind `src/bb-workspace.ts` and related adapters so the product directory remains appropriate if the host changes.

```text
BB thread ID → BB adapter → actual local workspace identity
                                  ↓
                     artifact catalog + bounded file reader
                                  ↓
                    authenticated document/asset transport
                                  ↓
                   artifact picker → read-only renderer
                                  ↑
                   refresh revision + selected-path state

Claude Code / Codex + DataPressr skills → project files
```

Suggested files: `app.tsx`, `server.ts`, `src/bb-workspace.ts`, `src/artifacts.ts`, `src/files.ts`, `src/asset-routes.ts`, `src/refresh.ts`, `src/renderers/{csv,markdown,html,image}.tsx`, and `tests/`. Keep these separations only where they clarify ownership; do not build a generic plugin framework.

Contract to establish in the first task:

```ts
type Workspace = { threadId: string; environmentId: string; hostId: string; rootPath: string };
type ArtifactKind = 'csv' | 'markdown' | 'html' | 'image';
type ArtifactRef = { path: string; kind: ArtifactKind; label: string; datasetPath?: string };
type PreviewRequest = { threadId: string; path: string };
// The server resolves workspace identity from threadId; clients never supply an absolute root.
// Responses carry canonical workspace identity, relative path, content revision, and explicit limits.
```

Exact BB calls must come from the installed SDK/CLI guide and real runtime inspection. Do not freeze guessed SDK methods into the implementation. If an experimental API is necessary, isolate it in the adapter, pin the supported version, and record the reason.

## Preview behavior and limits

Discovery starts at the thread workspace. Group datasets by `datapackage.json`, presenting their README and existing local resources; also expose supported loose documents and images so stories do not depend on metadata. Provide path search and a direct relative-path entry for artifacts outside the automatic discovery budget. Skip `.git`, `node_modules`, hidden directories, `archive`, and known build/cache directories during automatic traversal. Bound discovery to 10,000 entries and show when results are incomplete. Remote resource URLs may be shown as external links but must not be fetched automatically.

Start with a 10 MiB input limit per preview/asset, a 200-row CSV display cap, and a 100-column display cap. Label sampled rows/columns explicitly; never imply a full-dataset count from a partial scan. CSV parsing must respect quoting, multiline cells, Unicode, blank values, literal `NA`, CRLF inputs, and duplicate/blank headers without mutating the data. Exceeding a limit gives a useful explanation, not a freeze or silent truncation. Limits are configurable in one module if measured behavior requires adjustment; keep them documented.

Resolve file and asset paths against the canonical workspace and document directory; valid `../` links within the workspace are allowed. Reject escapes, absolute filesystem paths supplied by the client, encoded traversal, and symlinks escaping the workspace. Avoid exposing arbitrary local files through a new HTTP endpoint. Prefer supported BB file routes if they provide the required confinement and host identity; otherwise use a narrow authenticated plugin route. Never weaken BB authentication to make the iframe work.

Render Markdown with its actual document base, local images, relative document links, and ordinary external hyperlinks. Display raw HTML/SVG in an isolated preview with scripts disabled for v0.1; SVG used as an image must not execute scripts. Self-contained HTML and local CSS/images are in scope. Interactive JavaScript charts, external script/CDN execution, and server-backed web applications are deferred. If the host Markdown component cannot supply the required routing without private imports, use one maintained Markdown renderer and sanitization strategy inside the isolated preview; keep content untrusted and document the choice.

Poll only while the panel is mounted and active, with at most one request in flight per view. Target visible updates within two seconds for the small acceptance fixtures. Retain the current selection, scroll position where practical, and renderer state during a content update. Include referenced assets in revision checking so a rebuilt SVG refreshes a story. Catalog rescans run more slowly (for example, five seconds) or on request; avoid recursively scanning the whole tree every second. Preserve selection across tab closure/reopening and application reload using supported BB tab state or a documented preference keyed by thread and environment. A missing selection stays visibly missing until the user chooses another file or it returns.

## DataPressr skill integration

Use the existing eight skills from `skills/` as the canonical source. Confirm discovery for Claude Code and Codex separately with BB's project/environment-aware skill and command listings. Inspect existing native skill paths before installing anything; avoid duplicated copies with competing instructions. Prefer BB's supported static skill packaging or documented provider-native discovery. Any generated bundle must include referenced resources and have a deterministic sync check against canonical files; never maintain another hand-edited fork of the skills.

The plugin must not bypass structure review, story outline review, or publishing gates. Skill installation/availability is infrastructure, not permission to publish or run a new story workflow automatically. First acceptance runs should use `validate` on a disposable dataset copy and make a bounded documentation/chart change in that copy. This proves skill access and file-to-preview integration without creating a new editorial deliverable. Document which providers actually ran successfully; configuration or catalog discovery alone does not prove an end-to-end run.

Keep `datapressr-4ly.2` separate: the BB v0.1 demonstration must work in this repository's valid environment; repairing every skill for arbitrary empty projects is not silently included. If the first integration check shows that even the repository-scoped run cannot work without that task, add an explicit dependency with reproduced evidence rather than duplicating its scope.

## Work packages and acceptance

The table below maps implementation work to its canonical Beads. Each child Bead repeats its relevant context, file ownership, dependencies, and acceptance so it can be executed without this conversation. Suggested sizes are planning allowances, not measured delivery promises. Run sequentially by default.

Epic: `datapressr-49p`. Related completed gate: `datapressr-01n`.

| Task | Bead | Hard prerequisites | Planning allowance |
| --- | --- | --- | --- |
| 1. Establish production package and workspace adapter | `datapressr-49p.1` | None | 1–2 h |
| 2. Discover and select artifacts | `datapressr-49p.2` | `datapressr-49p.1` | 1–2 h |
| 3. Implement bounded reads and local asset routing | `datapressr-49p.3` | `datapressr-49p.1` | 1–3 h |
| 4. Render usable CSV previews | `datapressr-49p.4` | `datapressr-49p.2`, `datapressr-49p.3` | 1–2 h |
| 5. Render documents, stories, and chart assets | `datapressr-49p.5` | `datapressr-49p.2`, `datapressr-49p.3` | 2–3 h |
| 6. Refresh, persistence, and recovery | `datapressr-49p.6` | `datapressr-49p.4`, `datapressr-49p.5` | 1–2 h |
| 7. Make canonical DataPressr skills available in BB | `datapressr-49p.7` | `datapressr-49p.1` | 1–2 h |
| 8. Prove autonomous end-to-end operation | `datapressr-49p.8` | `datapressr-49p.6`, `datapressr-49p.7` | 1–3 h |
| 9. Package and document v0.1 | `datapressr-49p.9` | `datapressr-49p.8` | 0.5–1 h |

### 1. Establish production package and workspace adapter

Files: create `desktop-app/{package.json,package-lock.json,tsconfig.json,app.tsx,server.ts,src/bb-workspace.ts,tests/bb-workspace.test.ts}` from the proven minimal scaffold; retain the experiment. Remove the hard-coded fixture setting from the new package. The first visual state may simply show the resolved workspace and an empty artifact list.

Test first: two thread IDs resolving to different worktrees; missing/deleted environment; remote host; unavailable BB service. Implement the adapter with public SDK contracts, then exercise it in running BB. Acceptance: each test thread reports its actual local directory; unsupported contexts are explicit; existing PoC remains runnable. Record BB/SDK versions and any experimental surface used. Commit package and adapter together.

### 2. Discover and select artifacts

Files: `src/artifacts.ts`, `src/artifact-picker.tsx`, `tests/artifacts.test.ts`; wire through `app.tsx` and `server.ts`. Use synthetic directory fixtures plus the actual CO₂ dataset and Keeling story paths.

Test first: several datasets, no metadata, malformed metadata, missing resources, a story outside dataset folders, ignored directories, scan budget, duplicate filenames, and external resource URLs. Implement bounded discovery and relative-path selection. Acceptance: the user can find the real README, select a resource CSV, and open a story without a Data Package; the exact relative path is visible; malformed metadata does not hide otherwise valid files. No sorting/filtering spreadsheet features beyond artifact search. Commit independently.

### 3. Implement bounded reads and local asset routing

Files: `src/files.ts`, `src/asset-routes.ts`, `tests/files.test.ts`, `tests/asset-routes.test.ts`, backend wiring. Define a shared result/error contract used by all renderers.

Test first: quoted/unicode filenames, in-workspace relative parent links, absolute/encoded traversal, symlink escape, missing/non-file paths, oversized files, unsupported types, and cross-thread workspace confusion. Implement bounded reads and document-relative asset URLs through authenticated BB facilities. Acceptance: a local SVG/CSS/image can be read only through its correct workspace, errors are structured, and the path checks pass using a real temporary filesystem. Confirm the route works from a sandboxed preview without weakening host authentication. Commit independently.

### 4. Render usable CSV previews

Files: `src/renderers/csv.tsx`, parser/limit helper if needed, `tests/csv.test.ts`. Reuse the checked csv-parse dependency.

Test first: multiline quoted records, empty cells, literal `NA`, CRLF, Unicode, inconsistent rows, blank/duplicate headers, row/column limits, oversized input. Build a read-only table with sticky headings, horizontal scrolling, and clear sample limits. Acceptance: real CO₂ and oil-price resources render; selection/file changes cannot show rows from the previous file; an invalid CSV produces an error without breaking other artifacts. Check both narrow and wide BB panels. Commit independently.

### 5. Render documents, stories, and chart assets

Files: `src/renderers/{markdown,html,image}.tsx`, `tests/documents.test.ts`, relative-asset integration fixtures. Use BB's Markdown capability where possible; implement the documented fallback only if its asset/link behavior fails acceptance.

Test first: frontmatter, Markdown tables, two sibling SVG charts, nested and parent-relative images, internal document navigation, external links, missing assets, hostile script/HTML, and standalone image aspect ratios. Acceptance: the existing Keeling story renders prose with both actual charts; dataset README renders correctly; HTML with local CSS/image assets works; arbitrary document scripts do not run. Do not require a generated HTML conversion to view existing Markdown stories. Inspect actual rendered output and save screenshots. Commit independently.

### 6. Refresh, persistence, and recovery

Files: `src/refresh.ts`, `tests/refresh.test.ts`, renderer/selection wiring. Keep timer management and stale-response suppression testable.

Test first: out-of-order reads, switching files during a request, atomic replace, partial CSV/Markdown writes, deletion/restoration, changed child image with unchanged Markdown, closed panels, and independent selections in two threads. Acceptance: small fixture edits appear within two seconds without a manual reload; SVG-only changes refresh the story; inactive/closed previews stop polling; selection survives reopen/reload; stale content is either cleared or visibly marked. Repeat live checks with `bb plugin dev` stopped so its rebuilds cannot mask refresh defects. Commit independently.

### 7. Make canonical DataPressr skills available in BB

Files: plugin packaging/README and `scripts/prepare-skills.mjs` plus sync tests only if bundling is necessary; retain canonical `skills/` ownership. Record actual discovery evidence for both providers.

Inspect `bb skill list --project ... --environment ... --json` and `bb project commands ... --provider ... --environment ... --json`, then implement the smallest supported setup path. Acceptance: canonical instructions and their reference files are available to each supported provider; project conventions are found; no silent duplicate skill catalog; no dependency on an untracked absolute path on this machine. A disposable project run reads and follows `validate`; missing provider credentials produce an explicit support limitation rather than initiating a login or claiming success. Commit setup and evidence independently.

### 8. Prove autonomous end-to-end operation

Files: `tests/` integration fixtures/checks, `docs/benchmarks/bb-preview-v01.md`, screenshots under `docs/benchmarks/images/`. Use dedicated test threads and a scratch worktree; do not reuse unrelated user conversations for new prompts.

Run the full unit/type/build checks, install the package, and use computer control to select a real dataset/README/story beside an agent. For both Claude Code and Codex where already configured, run `validate` and a bounded documentation update in the disposable copy, inspect the transcript/skill evidence, and observe its rendered result. For charts, change a fixture/chart build input and verify the emitted SVG update in the story. Include two-worktree isolation, missing-file recovery, reload persistence, and fresh install/reinstall with temporary plugin state. Record provider failures honestly and fix plugin defects before closing. No human QA dependency is allowed; ordinary already-configured provider approval interactions should be handled by the assistant within the test scope. Acceptance: evidence identifies the tested commit, versions, commands, runtime outcomes, screenshots, and remaining unsupported cases.

### 9. Package and document v0.1

Files: plugin `README.md` and package metadata, `site/docs/bb-preview.md`, `site/docs/README.md`, `docs/plans/2026-09-30-bb-preview-v01-plan.md` (link to final evidence only), and a v0.1 changelog when actually delivered.

Document source installation, launching BB, opening the preview, skill setup, supported artifact types/limits, updating and disabling, troubleshooting, and autonomous developer checks. Test those steps from a fresh plugin directory without relying on stale `dist/` or `node_modules/`. Keep a supported local installation path and avoid deleting the PoC worktree while BB still uses it. Acceptance: version 0.1.0, documented supported BB/provider versions, complete evidence, and usable local installation; docs clearly separate the completed v0.1 from the earlier fixture PoC. No marketplace publication or new provider account setup is part of this task.

## Verification commands and release gate

From the production plugin directory, establish these scripts in Task 1 and maintain them as the package grows:

```sh
npm ci --ignore-scripts
npm test
npm run typecheck
npm run build
bb plugin install . --yes
bb plugin dev .
bb plugin logs datapressr-preview
```

`npm test` must exercise real parser/path/refresh logic; do not substitute mocked UI screenshots for rendered checks. Use the existing computer-control API to operate native BB and/or its browser UI. Save screenshots without unrelated conversations or credentials. Stop the watcher before file-refresh acceptance; stop any test-only agents and servers at handoff. Keep useful preview tabs available and record the installed source path.

v0.1 closes only when a real dataset README/CSV and an existing Markdown story with chart assets are previewable beside a conversation, changes refresh without manual intervention, workspace identity is correct, errors recover, skills are usable through actual supported provider runs, and installation is reproducible. A provider lacking credentials does not invalidate viewer development, but it blocks claiming that provider as tested; the release must explicitly narrow its provider claim or leave the corresponding acceptance open for steering.

## Effort, risks, and checkpoints

Plan for roughly **10–20 focused engineering hours**, often spread over several agent sessions, plus provider execution time. This is a low-confidence planning range; the verified PoC reduces setup uncertainty, but asset routing and provider-specific skill discovery could change it substantially. Reassess after Tasks 1 and 3; do not spend repeated sessions fighting private BB APIs.

Three checkpoints make progress reviewable: workspace-bound picker and reads (Tasks 1–3); complete artifact viewing with refresh (Tasks 4–6); actual skill runs and reproducible installation (Tasks 7–9). BB is the preferred route. Consider a simple standalone viewer only if a reproduced BB limitation prevents reliable workspace access, document asset rendering, or autonomous QA, and record that evidence before changing architecture.

## AI assignment and session choice

Start a fresh implementation session in this repository with **GPT-6 Astra, high reasoning**, beginning at `datapressr-49p.1`. A fresh session is recommended because the vision, decisions and evidence are now captured; it is not technically required. Staying on Astra high for the entire implementation is the simplest option.

Each child has advisory `ai-level:`, `model:`, and `reasoning:` labels. They describe the recommended developer model, not the Claude Code/Codex provider being tested inside BB, and do not automatically switch the running model or authorize parallel delegation.

| Tasks | Recommended model | Reasoning | Rationale |
| --- | --- | --- | --- |
| 1, 3, 5, 6, 7, 8 | GPT-6 Astra (`gpt-6-astra`), `ai-level:frontier` | high | Workspace boundaries, asset rendering, asynchronous state, provider integration, and autonomous visual QA require judgment across components. |
| 2, 4 | GPT-6 Sol (`gpt-6-sol`), `ai-level:standard` | high | Bounded artifact discovery and CSV rendering have detailed contracts and focused acceptance tests. Astra is also suitable. |
| 9 | GPT-6 Sol (`gpt-6-sol`), `ai-level:standard` | medium | Packaging and documentation after the integrated behavior is verified. Escalate if clean installation exposes architectural defects. |

These task assignments are engineering recommendations, not benchmark results. Official documentation describes [Astra](https://developers.openai.com/api/docs/models/gpt-6-astra) for demanding coding and computer use and [Sol](https://developers.openai.com/api/docs/models/gpt-6-sol) as a capable alternative; checked 2026-09-30. Use the model names available in the session's picker; account availability is not established by API documentation. Do not choose a cheaper model at the expense of reliable computer control and visual inspection. If staying in one sequential session, keep Astra high rather than switching at every Bead.

## Next-session handoff

Start with `datapressr-49p.1`; use `bd ready --parent datapressr-49p` to select subsequent ready children. Do not claim the umbrella epic as an implementation task or switch to unrelated repository backlog work. Current priorities are scoped to this v0.1 effort.

```text
Implement the DataPressr desktop app v0.1 using BB, epic datapressr-49p. Work in desktop-app/; the PoC is under desktop-app/experiments/. Recommended session model: GPT-6 Astra, high reasoning. Read AGENTS.md, docs/plans/2026-09-30-bb-preview-v01-plan.md, and docs/plans/2026-09-30-bb-preview-development-gate.md. Run bd dolt pull, then bd ready --parent datapressr-49p. Start by reading and claiming datapressr-49p.1. Use an isolated worktree; preserve the installed PoC worktree. Execute ready children sequentially, record tests and real UI evidence, and commit each bounded change. You must run and visually test BB yourself; do not depend on the user for routine QA. Preview-only: datasets, READMEs, charts and stories; no direct editing. Resolve the actual thread workspace. Existing skills are canonical. Follow their review/publishing gates and do not log in or publish on the user's behalf. At handoff, record tested revisions and remaining gates in Beads and run bd dolt push.
```

The plan and task graph are prepared for implementation; no v0.1 code has been written in this planning session. Use the executing-plans and verification workflows when implementation begins. Changes to scope should update this document and affected Beads together.
