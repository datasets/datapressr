#!/usr/bin/env node
// Keeps each dataset's AGENTS.md in step with the root one. Zero dependencies,
// like the other scripts here.
//
// Why this exists: every dataset carries a copy of AGENTS.md so a future AI
// session (or the dataset's own repo, once it moves out) has the conventions to
// hand. The copies were meant to be byte-identical and drifted twice in a
// month: by 2026-09-25 all six missed the Docs section, the one-tracker rule
// and the changelog location. Those sections are also about *this* repo (its
// Beads queue, its site, its changelog), which a dataset that becomes its own
// repo does not have. So the root file is split by a marker line: everything
// above it is the dataset conventions and is copied verbatim; everything below
// it is repo-only and never copied.
//
//   node scripts/sync-dataset-agents.mjs          rewrite every copy
//   node scripts/sync-dataset-agents.mjs --check  exit 1 and list stale copies
import { existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const MARKER = "<!-- repo-only: everything below this line stays in the root AGENTS.md and is not copied into datasets -->";

/** The dataset part of the root AGENTS.md: everything above the marker, with one trailing newline. */
export function datasetSection(rootText) {
  const at = rootText.indexOf(MARKER);
  if (at === -1) throw new Error("root AGENTS.md has no repo-only marker line");
  return rootText.slice(0, at).trimEnd() + "\n";
}

/** Every AGENTS.md sitting next to a datapackage.json under `dir`, skipping archive/, data/ and node_modules/. */
export function datasetAgentsFiles(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    if (name === "archive" || name === "data" || name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...datasetAgentsFiles(path));
  }
  if (existsSync(join(dir, "datapackage.json")) && existsSync(join(dir, "AGENTS.md"))) found.push(join(dir, "AGENTS.md"));
  return found.sort();
}

/** Returns the copies whose content differs from the dataset section; rewrites them unless `check`. */
export function sync(repoRoot, { check = false } = {}) {
  const expected = datasetSection(readFileSync(join(repoRoot, "AGENTS.md"), "utf8"));
  const stale = datasetAgentsFiles(join(repoRoot, "datasets")).filter((f) => readFileSync(f, "utf8") !== expected);
  if (!check) for (const f of stale) writeFileSync(f, expected);
  return stale.map((f) => relative(repoRoot, f));
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
    console.error(`Stale dataset AGENTS.md copies (run node scripts/sync-dataset-agents.mjs):\n${stale.map((f) => `  ${f}`).join("\n")}`);
    process.exit(1);
  }
  console.log(check ? "All dataset AGENTS.md copies are current." : `Rewrote ${stale.length} dataset AGENTS.md cop${stale.length === 1 ? "y" : "ies"}.`);
}
