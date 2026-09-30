# DataPressr desktop app

Work in progress toward BB preview v0.1. The production package currently resolves and displays a conversation's actual local workspace. Artifact discovery and rendering are subsequent tasks under `datapressr-49p`.

## Develop locally

Requires BB 0.44.0 and Node with native TypeScript execution. The plugin SDK is pinned to 0.5.29. From this directory:

```sh
npm ci --ignore-scripts
npm test
npm run typecheck
npm run build
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
