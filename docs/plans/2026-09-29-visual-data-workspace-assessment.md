# Visual data workspace: plugin, fork, or standalone?

Date: 2026-09-29. Status: initial research assessment, not an approved implementation plan. Tracking: `datapressr-rh1`.

**2026-09-30 clarification and experiment:** the agreed scope is read-only previews of datasets, README/documentation, charts, and data stories beside an agent using the DataPressr skills. Direct editing is excluded; selection/annotation and rich inspection tools are not initial requirements. The decisive gate is autonomous AI development and visual testing. A small local BB plugin has now passed that gate: see the [development experiment and evidence](2026-09-30-bb-preview-development-gate.md). The analysis below records the broader initial hypotheses; the follow-up supersedes its suggested selection-to-conversation acceptance criterion and its “no plugin built” evidence status.

## Intent

Explore an experience for DataPressr that combines Claude Code or Codex with a substantial visual output area beside the conversation. The reference is OpenDesign: chat on the left, rendered artifact on the right, with iteration happening while the output is visible. “Canvas” here means this output workspace; an infinite spatial canvas is not a requirement.

“Local models” in the original discussion meant running coding agents directly with the user's existing setup and local files. It did not mean running model inference on the user's computer. A desktop application is one possible delivery mechanism; a browser UI backed by a local process could also satisfy that intent.

Possible data outputs include a cleaned table, schema and validation results, charts, and a rendered data story. These are candidate surfaces, not agreed feature requirements. The central question is whether an existing host can connect the agent conversation to those outputs well enough, or whether DataPressr needs its own application.

The user's BB reference is [getbb.app](https://getbb.app/), with prior notes in `~/src/life-itself/wayintoai/ref/bb.md`. Research and capture are authorized; implementation is outside this assessment.

## Initial recommendation

**Investigate a BB plugin first. Keep the data viewer portable enough to reuse in a standalone web UI if the host proves limiting.** BB exposes the particular UI extension points this idea needs. Its existing agent sessions, file access, and conversation UI could make the DataPressr work mostly about inspecting data and communicating selections back to the agent.

OpenDesign customization is a credible alternative when the desired result is predominantly a generated chart, dashboard, or story. Consider a fork if owning a dedicated data product experience becomes a firm requirement. Starting from scratch buys control but also makes DataPressr responsible for the agent application infrastructure.

Zed is presently a poor fit for this as an ordinary extension: the agent integration exists, but the public visual extension surface is missing. This conclusion concerns the documented API and inspected source, not a claim that Zed could never support it.

## Comparison

| Route | Feasibility for this experience | What it supplies | Main cost or limitation | Assessment |
| --- | --- | --- | --- | --- |
| BB plugin | Strong source evidence for the necessary extension points | Agent threads, React side panels, file openers, RPC, composer integration | Host conventions and evolving APIs; live refresh and selection context still need a trial | Best first feasibility experiment |
| Zed extension | Agent side supported; custom visual workspace not supported by the inspected public API | ACP agents, terminal threads, editor and project environment | A custom data canvas would require upstream work, a fork, or an external viewer | Do not choose for an integrated canvas today |
| OpenDesign workflow/plugin | Plausible for generating and previewing data artifacts | Existing chat/preview experience, coding-agent integration, packaged application | Plugin model is primarily workflow/context packaging; general persistent data-inspector UI is unproven | Worth considering before a fork |
| OpenDesign fork | Existing application provides a concrete starting point | UI, local daemon, agent adapters, artifact management and preview | Design-specific assumptions, product breadth, ongoing upstream maintenance | Stronger candidate if a distinct DataPressr application is the objective |
| Standalone web UI plus local service | Technically feasible; no prototype performed | Complete control over the data experience | Must own session lifecycle, streaming, approvals, cancellation, persistence, file access, and distribution | Defer until host limitations are demonstrated |
| VS Code extension, as a comparison | Explicit custom-editor and webview support | Established visual extension APIs and editor infrastructure | Editor-oriented experience; coordination with the chosen agent needs separate validation | Useful fallback if BB proves too unstable |

These are relative engineering judgments, not delivery estimates or measured usability results.

## BB: a plugin is genuinely possible

The inspected [plugin guide](https://github.com/get-bb/bb/blob/5959fb620904b478c9412ea4103265dd65e0b9b0/packages/templates/src/templates/bb-guide-plugins.md) and [frontend API contract](https://github.com/get-bb/bb/blob/5959fb620904b478c9412ea4103265dd65e0b9b0/packages/plugin-sdk/src/app-contract.ts) establish several relevant capabilities:

- `threadPanelAction` opens a React component in a thread's side panel. It receives the thread ID and persisted JSON parameters. A `flush` layout lets the component use the full panel and manage its own scrolling.
- `fileOpener` registers a component for specified file extensions, giving a plausible entry point for CSV inspection. A dataset-level panel would avoid treating every JSON file as a Data Package.
- `navPanel` provides a dedicated plugin page if the experience later needs a dataset browser.
- `useRpc` and `useRealtime` connect UI components to plugin backend operations and events.
- `useComposer` can insert context and mentions into the conversation draft. This offers a route from selecting data to asking the agent about it; exact row identification remains DataPressr's responsibility.

BB's bundled [inline visualization plugin](https://github.com/get-bb/bb/blob/5959fb620904b478c9412ea4103265dd65e0b9b0/plugins/inline-vis/README.md) already previews HTML and Markdown files from a workspace or thread storage. Its HTML iframe supports sibling assets. This is evidence that artifact rendering and file routing are implemented, although it does not establish that a spreadsheet-like data inspector or automatic refresh is already available.

The [BB homepage](https://getbb.app/) documents Claude Code and Codex support using the user's provider subscriptions. Its [changelog](https://getbb.app/changelog) shows active plugin API development, including explicitly experimental surfaces. The core panel and file-opener types inspected are not named experimental; that is not a guarantee of long-term API stability. Native host execution and file-watching infrastructure include experimental APIs, so a trial should establish the simplest supported refresh mechanism before depending on them.

**Inference:** BB could host a DataPressr viewer that reads `datapackage.json`, shows a resource table and chart, and places a selected row/column reference into the current conversation. The source supports the building blocks; this exact workflow has not been exercised.

## Zed: agent support does not establish canvas support

Zed documents [external agents through ACP](https://zed.dev/docs/ai/external-agents), including Claude and Codex, and distinguishes them from running a CLI in a terminal thread. That satisfies the agent-hosting side of the proposal in principle.

Its [extension development documentation](https://zed.dev/docs/extensions/developing-extensions) and inspected [Extension trait](https://github.com/zed-industries/zed/blob/main/crates/extension_api/src/extension_api.rs) expose language, debugger, slash-command, documentation, and context-server functionality. I found no general custom panel or webview registration API there. The [Webview via Extensions request](https://github.com/zed-industries/zed/issues/21208) remains open in the retrieved evidence.

**Assessment:** a normal Zed extension cannot currently be assumed to implement the screenshot's visual workspace. Zed plus an external browser is possible as a looser workflow, but the connection between the two would be additional work. A Zed fork would turn this into native editor development and maintenance, a substantial commitment for an exploratory data interface.

## OpenDesign: customization and a fork are different options

The official [source page](https://open-design.ai/official/) identifies `nexu-io/open-design` as the canonical project. Its [architecture document](https://github.com/nexu-io/open-design/blob/5b19dfa4351b3eed33826ee72746a7c653c23a54/docs/architecture.md) describes a Next.js/React UI, an Express daemon, SQLite state, coding-agent processes, and browser or Electron presentation. The daemon owns file operations, runs, cancellation, and streamed events. A fork would inherit an existing application with substantial behavior to understand and maintain.

The [plugin specification](https://github.com/nexu-io/open-design/blob/5b19dfa4351b3eed33826ee72746a7c653c23a54/docs/plugins-spec.md) describes plugins primarily as portable skills plus manifests, inputs, assets, and workflow context. It explicitly distinguishes this from plugins owning a canvas panel lifecycle. It also describes controlled generative UI and gated custom components; those should not be interpreted as proof of a general persistent data-viewer extension API without tracing and trying the implementation.

**Inference:** a DataPressr workflow that produces CSV plus a rendered HTML report may fit the existing preview with limited customization. A persistent table inspector that understands schema, stable row identity, validation, and selected data as conversation context is a larger requirement and could motivate host changes or a fork.

The distinction matters: making attractive data dashboards is already close to OpenDesign's artifact model; making data inspection and reproducible wrangling the organizing experience goes further. The project advertises Apache-2.0 licensing; BB advertises MIT. Both offer source-level adaptation routes, but this assessment does not audit bundled assets or third-party dependencies.

## Standalone and the portability choice

A dedicated application would allow dataset navigation, provenance, validation, table inspection, charts, and publishing to shape the whole experience. The cost is ownership of the surrounding agent application: authentication integration, session recovery, streaming messages, tool approvals, cancellation, and application updates. Reusing agent runtimes reduces that burden but does not eliminate it.

A browser UI with a local service could be explored before desktop packaging. The main reusable asset would be a viewer that consumes a dataset directory and emits explicit context such as resource path, field name, primary key, and file revision. BB-specific panel registration and composer calls could stay in a small host adapter. This is an architectural suggestion, not a decision to implement.

As a control comparison, VS Code's official [custom editor API](https://code.visualstudio.com/api/extension-guides/custom-editors) explicitly supports alternative visual renderings of CSV and JSON, and its [webview API](https://code.visualstudio.com/api/extension-guides/webview) supports custom HTML/JavaScript interfaces. This establishes a viable visual host option, while leaving agent integration and product fit to separate assessment.

## What would resolve the remaining uncertainty?

A bounded BB trial, if later authorized, would use one existing structured dataset and ask whether a user can open a table beside an agent, see changes after an agent rewrite, inspect a chart, and insert a precise data selection into the same conversation. It should also check recovery after reopening the thread and distinguish stale output from the latest file revision. Success would justify further plugin work; failure would identify concrete reasons to prefer another host.

The product question that could change the recommendation is audience: is this primarily a better workspace for people already comfortable with coding agents, or a standalone data application for people who should never need to understand an agent workbench? BB is particularly attractive for the former. A dedicated application could become more compelling for the latter.

## Evidence and limits

Research used official documentation, public source files, and the user's screenshot and local BB note. Source heads recorded during retrieval: BB `5959fb620904b478c9412ea4103265dd65e0b9b0`; OpenDesign `5b19dfa4351b3eed33826ee72746a7c653c23a54`. Raw source reads used `main` around the time those heads were recorded; linked revisions provide a reproducible reference. Zed documentation and source were inspected at current `main`; recheck extension support when revisiting the decision.

No application was installed or launched, no plugin was built, and no performance, agent-authentication, or end-to-end synchronization claims were tested. In particular, large-table performance, change notifications, worktree handling, and two-way selection context remain unverified. This note captures an initial feasibility assessment; it does not authorize a build or create a Markdown task queue.
