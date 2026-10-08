#!/usr/bin/env node
// Deterministic checks behind the /validate skill. See .claude/commands/validate.md
// and AGENTS.md "Data conventions" for the rules this encodes. Zero dependencies,
// on purpose — this should stay something anyone can run without an install step.
import { readFileSync, existsSync, statSync, readdirSync, realpathSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { pathToFileURL } from "node:url";

const LARGE_FILE_BYTES = 50 * 1024 * 1024;
const NAME_RE = /^[a-z0-9-]+$/;

// The dataset lifecycle from AGENTS.md, in order. The first two are the early
// stages: a `capture` or `stub` is publishable with no data files yet, so the
// rules about resources, licenses and sources only apply from `archived` onward.
export const STAGES = ["capture", "stub", "archived", "structured", "enriched", "monitored"];
const EARLY_STAGES = new Set(["capture", "stub"]);

/**
 * Three tiers: errors fail the run (exit 1); warnings are what "passes with no
 * warnings" in the definition of done counts; notes are nudges that count
 * against neither (e.g. the blank title a fresh /init scaffold starts with).
 *
 * @param {string} dir directory containing datapackage.json
 * @returns {{errors: string[], warnings: string[], notes: string[]}}
 */
export function validateDatapackage(dir) {
  const errors = [];
  const warnings = [];
  const notes = [];
  const pkgPath = join(dir, "datapackage.json");

  if (!existsSync(pkgPath)) {
    errors.push(`datapackage.json not found in ${dir}`);
    return { errors, warnings, notes };
  }

  const raw = readFileSync(pkgPath, "utf8");
  let pkg;
  try {
    pkg = JSON.parse(raw);
  } catch (e) {
    errors.push(`datapackage.json is not valid JSON: ${e.message}`);
    return { errors, warnings, notes };
  }

  if (!pkg.name) {
    errors.push("`name` is missing");
  } else if (!NAME_RE.test(pkg.name)) {
    errors.push(
      `\`name\` "${pkg.name}" is not URL-safe — use lowercase letters, digits, and hyphens only`,
    );
  }

  // An absent or unknown status counts as past stub: without it we can't tell a
  // stub from a dataset that has lost its files, so the stricter rules apply
  // (and a warning below asks for a valid `status`).
  const early = EARLY_STAGES.has(pkg.status);

  if (pkg.resources !== undefined && !Array.isArray(pkg.resources)) {
    errors.push("`resources` must be an array");
  }
  const resources = Array.isArray(pkg.resources) ? pkg.resources : [];
  if (resources.length === 0 && !early && (pkg.resources === undefined || Array.isArray(pkg.resources))) {
    errors.push(
      "`resources` is missing or empty (only allowed while `status` is `capture` or `stub`)",
    );
  }

  const listedPaths = new Set();
  for (const [i, resource] of resources.entries()) {
    const label = resource.name ? `resource "${resource.name}"` : `resources[${i}]`;

    if (!resource.path) {
      errors.push(`${label} has no \`path\``);
      continue;
    }
    listedPaths.add(resource.path);

    const filePath = join(dir, resource.path);
    if (!existsSync(filePath)) {
      errors.push(`${label} path "${resource.path}" does not exist on disk`);
      continue;
    }

    const size = statSync(filePath).size;
    if (size > LARGE_FILE_BYTES) {
      warnings.push(
        `${label} is ${(size / 1024 / 1024).toFixed(1)}MB — over the ~1GB small-data ceiling? Consider whether this workflow still fits`,
      );
    }

    const schema = resource.schema;
    if (!schema || !Array.isArray(schema.fields) || schema.fields.length === 0) {
      warnings.push(`${label} has no \`schema.fields\` — column types aren't declared`);
    } else {
      const untyped = schema.fields.filter((f) => !f.type).map((f) => f.name);
      if (untyped.length > 0) {
        warnings.push(`${label} has fields with no \`type\`: ${untyped.join(", ")}`);
      }
      const looksLikeKey = (name) => /(^id$|_id$|_code$|^code$)/.test(name || "");
      const hasKeyLikeField = schema.fields.some((f) => looksLikeKey(f.name));
      if (!schema.primaryKey && hasKeyLikeField) {
        warnings.push(
          `${label} has a field that looks like an identifying column but no \`schema.primaryKey\` is set`,
        );
      }
    }
  }

  // A fresh /init scaffold has `"title": ""` and `"description": ""`. At an early
  // stage that exact placeholder is a to-do, not a defect, so it's a note rather
  // than a warning. An absent key is still a warning: a stub has a title.
  for (const field of ["title", "description"]) {
    if (pkg[field]) continue;
    if (early && pkg[field] === "") notes.push(`\`${field}\` is blank (the /init placeholder) — fill it in`);
    else warnings.push(`\`${field}\` is missing`);
  }

  if (!pkg.status) {
    warnings.push("`status` is missing");
  } else if (!STAGES.includes(pkg.status)) {
    warnings.push(`\`status\` "${pkg.status}" is not a lifecycle stage (${STAGES.join(", ")})`);
  }

  if (!early) {
    if (!Array.isArray(pkg.licenses) || pkg.licenses.length === 0) {
      warnings.push("`licenses` is missing or empty (required once status is past `stub`)");
    }
    if (!Array.isArray(pkg.sources) || pkg.sources.length === 0) {
      warnings.push("`sources` is missing or empty (required once status is past `stub`)");
    }
  }

  const dataDir = join(dir, "data");
  if (existsSync(dataDir)) {
    for (const entry of readdirSync(dataDir, { withFileTypes: true })) {
      // Dotfiles (a .gitkeep holding an empty data/ in git, .DS_Store) aren't data.
      if (!entry.isFile() || entry.name.startsWith(".")) continue;
      const relPath = relative(dir, join(dataDir, entry.name));
      if (!listedPaths.has(relPath)) {
        warnings.push(`data/${entry.name} exists but is not listed in \`resources\``);
      }
    }
  }

  return { errors, warnings, notes };
}

function formatReport(dir, { errors, warnings, notes }) {
  const lines = [];
  if (errors.length === 0) lines.push("✓ no errors");
  for (const e of errors) lines.push(`✗ ${e}`);
  for (const w of warnings) lines.push(`⚠ ${w}`);
  for (const n of notes) lines.push(`· note: ${n}`);
  lines.push("");
  const counts = `${errors.length} error(s), ${warnings.length} warning(s)`;
  lines.push(notes.length > 0 ? `${counts}, ${notes.length} note(s)` : counts);
  return lines.join("\n");
}

// Is this file the entry point? Compare import.meta.url with the *realpath* of
// argv[1]: Node resolves symlinks for import.meta.url but leaves process.argv[1]
// as typed, so a symlinked directory (macOS's /tmp and tmpdir, or a checkout
// reached through a linked parent) makes the two differ and the CLI silently
// does nothing and exits 0 — which reads as "passed". pathToFileURL, not a
// `file://` template, for the same reason with spaces and non-ASCII characters.
// realpathSync throws for the undefined argv[1] of `node -e` and for a path that
// does not exist; both mean "imported, not run".
const isEntryPoint = (() => {
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
})();
if (isEntryPoint) {
  const dir = process.argv[2] || ".";
  const result = validateDatapackage(dir);
  console.log(formatReport(dir, result));
  process.exit(result.errors.length > 0 ? 1 : 0);
}
