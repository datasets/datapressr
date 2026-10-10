// Fake writer: copies a canned artefact directory into the run's artefacts folder. Zero cost,
// no agent call; it exists so the runner, ledger and report can be exercised by npm test.

import { cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const vendor = "fake";

export function cannedDir(domain) {
  return join(here, "fake-artefacts", domain);
}

// destDir mirrors the writer's workspace: files land at their workspace-relative paths.
export async function write({ domain, destDir }) {
  const src = cannedDir(domain);
  if (!existsSync(src)) throw new Error(`fake writer has no canned artefacts for domain "${domain}" (${src})`);
  const started = Date.now();
  cpSync(src, destDir, { recursive: true });
  return {
    model: "fake",
    model_actual: "fake",
    cli_version: "fake",
    duration_ms: Date.now() - started,
    turns: 0,
    cost_usd: 0,
    cost_basis: null,
    usage: null,
    transcript_sha256: null,
    workspace_sha256: null,
    network: false,
    canary_run_id: null,
    leaks: [],
    flags: [],
  };
}
