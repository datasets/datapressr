#!/usr/bin/env node
// Deterministic checks behind the /validate skill. See .claude/commands/validate.md
// and AGENTS.md "Data conventions" for the rules this encodes. Zero dependencies,
// on purpose — this should stay something anyone can run without an install step.
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";

const LARGE_FILE_BYTES = 50 * 1024 * 1024;
const NAME_RE = /^[a-z0-9-]+$/;

/**
 * @param {string} dir directory containing datapackage.json
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateDatapackage(dir) {
  const errors = [];
  const warnings = [];
  const pkgPath = join(dir, "datapackage.json");

  if (!existsSync(pkgPath)) {
    errors.push(`datapackage.json not found in ${dir}`);
    return { errors, warnings };
  }

  const raw = readFileSync(pkgPath, "utf8");
  let pkg;
  try {
    pkg = JSON.parse(raw);
  } catch (e) {
    errors.push(`datapackage.json is not valid JSON: ${e.message}`);
    return { errors, warnings };
  }

  if (!pkg.name) {
    errors.push("`name` is missing");
  } else if (!NAME_RE.test(pkg.name)) {
    errors.push(
      `\`name\` "${pkg.name}" is not URL-safe — use lowercase letters, digits, and hyphens only`,
    );
  }

  const resources = Array.isArray(pkg.resources) ? pkg.resources : [];
  if (resources.length === 0) {
    errors.push("`resources` is missing or empty");
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

  if (!pkg.title) warnings.push("`title` is missing");
  if (!pkg.description) warnings.push("`description` is missing");
  if (!pkg.status) warnings.push("`status` is missing");

  if (pkg.status && pkg.status !== "stub") {
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
      if (!entry.isFile()) continue;
      const relPath = relative(dir, join(dataDir, entry.name));
      if (!listedPaths.has(relPath)) {
        warnings.push(`data/${entry.name} exists but is not listed in \`resources\``);
      }
    }
  }

  return { errors, warnings };
}

function formatReport(dir, { errors, warnings }) {
  const lines = [];
  if (errors.length === 0) lines.push("✓ no errors");
  for (const e of errors) lines.push(`✗ ${e}`);
  for (const w of warnings) lines.push(`⚠ ${w}`);
  lines.push("");
  lines.push(`${errors.length} error(s), ${warnings.length} warning(s)`);
  return lines.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2] || ".";
  const result = validateDatapackage(dir);
  console.log(formatReport(dir, result));
  process.exit(result.errors.length > 0 ? 1 : 0);
}
