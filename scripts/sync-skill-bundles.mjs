#!/usr/bin/env node
// Keeps the files bundled inside skills/ in step with their originals in this
// repo. Zero dependencies, like the other scripts here; same shape as
// sync-dataset-agents.mjs.
//
// Why this exists: `npx skills add datasets/datapressr` copies each skill's
// directory into the user's project and nothing else. An installed `init` had
// no conventions file or validator to copy, so an outsider's first dataset
// started without either (docs/plans/2026-09-25-research/adoption.md). So the
// skills carry their own copies, and this script plus its test stop those
// copies drifting from the originals the repo actually tests.
//
//   node scripts/sync-skill-bundles.mjs          rewrite every bundled copy
//   node scripts/sync-skill-bundles.mjs --check  exit 1 and list stale copies
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { datasetSection } from "./sync-dataset-agents.mjs";

/** Bundled copy (relative to the repo root) → function giving its expected content from the repo root. */
export const BUNDLES = {
  "skills/validate/scripts/validate-datapackage.mjs": (root) => readFileSync(join(root, "scripts/validate-datapackage.mjs"), "utf8"),
  "skills/init/references/AGENTS.md": (root) => datasetSection(readFileSync(join(root, "AGENTS.md"), "utf8")),
  "skills/structure/references/wrangling-idioms.mjs": (root) => readFileSync(join(root, "scripts/wrangling-idioms.mjs"), "utf8"),
};

/** Returns the bundled copies that are missing or differ from their original; rewrites them unless `check`. */
export function sync(repoRoot, { check = false } = {}) {
  const stale = [];
  for (const [rel, expected] of Object.entries(BUNDLES)) {
    const path = join(repoRoot, rel);
    const want = expected(repoRoot);
    if (existsSync(path) && readFileSync(path, "utf8") === want) continue;
    stale.push(rel);
    if (check) continue;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, want);
  }
  return stale;
}

// Entry-point guard compares against the realpath of argv[1]; see
// check-invisible-characters.mjs for why a plain comparison is not enough.
const isEntryPoint = (() => {
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
})();

if (isEntryPoint) {
  const check = process.argv.includes("--check");
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const stale = sync(repoRoot, { check });
  if (check && stale.length) {
    console.error(`Stale bundled skill files (run node scripts/sync-skill-bundles.mjs):\n${stale.map((f) => `  ${f}`).join("\n")}`);
    process.exit(1);
  }
  console.log(check ? "All bundled skill files are current." : `Rewrote ${stale.length} bundled skill file${stale.length === 1 ? "" : "s"}.`);
}
