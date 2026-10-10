#!/usr/bin/env node
// Deterministic checks behind the /validate skill. See skills/validate/SKILL.md
// and AGENTS.md "Data conventions" for the rules this encodes. Zero dependencies,
// on purpose — this should stay something anyone can run without an install step.
//
// Two layers, both on by default: metadata (datapackage.json itself) and data
// (every CSV resource's values checked against its declared schema: encoding,
// house CSV format, header, row width, types, required, enum, primary key
// uniqueness, same-package foreign keys). Design and fixtures:
// docs/plans/2026-09-25-research/quality.md section 1.
//
//   node scripts/validate-datapackage.mjs [dir]                  metadata + values
//   node scripts/validate-datapackage.mjs [dir] --metadata-only  skip the value checks
//   node scripts/validate-datapackage.mjs [dir] --json           {errors, warnings, notes, stats}
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
 * @param {{data?: boolean, stats?: {resources: number, rows: number, cells: number}}} [options]
 *   `data: false` skips the value checks (the --metadata-only flag); pass a
 *   `stats` object to have the value checks add their row and cell counts to it.
 * @returns {{errors: string[], warnings: string[], notes: string[]}}
 */
export function validateDatapackage(dir, { data = true, stats } = {}) {
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
  const checkable = []; // resources whose values the data layer reads
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
      if (isCsv(resource)) checkable.push(resource);
    }
  }

  if (data) {
    const tables = new Map();
    for (const resource of checkable) {
      const table = validateResourceData(dir, resource, { errors, warnings }, stats);
      if (table && resource.name) tables.set(resource.name, table);
    }
    checkForeignKeys(checkable, tables, errors);
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

// ---------------------------------------------------------------------------
// Data layer: CSV values against the declared Frictionless table schema.
// ---------------------------------------------------------------------------

// At most this many findings per (resource, check, field), then one "N more"
// line, so one systematic bug doesn't print 17,000 lines.
const MAX_PER_KIND = 5;

const isCsv = (resource) =>
  /\.csv$/i.test(resource.path) || resource.format === "csv" || resource.mediatype === "text/csv";

/**
 * RFC 4180 parser. `lines[i]` is the physical (1-based) line where record i
 * starts, so locations stay right across quoted newlines. `issues` holds syntax
 * problems and house-format deviations (CR, no trailing newline).
 *
 * @param {string} text
 * @returns {{rows: string[][], lines: number[], issues: {line: number, kind: string, msg: string}[]}}
 */
export function parseCsv(text) {
  const rows = [];
  const lines = [];
  const issues = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let quoted = false; // current field was quoted (so "" at EOF is still a field)
  let line = 1;
  let rowLine = 1;
  let sawCr = false;
  let sawStrayQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else {
        if (c === "\n") line++;
        field += c;
      }
      continue;
    }
    if (c === '"') {
      if ((field !== "" || quoted) && !sawStrayQuote) {
        sawStrayQuote = true;
        issues.push({ line, kind: "error", msg: "quote character inside an unquoted field (not RFC 4180)" });
      }
      inQuotes = true;
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
      quoted = false;
    } else if (c === "\r") {
      if (!sawCr) issues.push({ line, kind: "warning", msg: "CR line endings (house format is LF)" });
      sawCr = true;
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      lines.push(rowLine);
      row = [];
      field = "";
      quoted = false;
      line++;
      rowLine = line;
    } else {
      if (quoted && !sawStrayQuote) {
        sawStrayQuote = true;
        issues.push({ line, kind: "error", msg: "text after a closing quote (not RFC 4180)" });
      }
      field += c;
    }
  }
  if (inQuotes) issues.push({ line: rowLine, kind: "error", msg: "unterminated quoted field at end of file" });
  if (field !== "" || row.length > 0 || quoted) {
    row.push(field);
    rows.push(row);
    lines.push(rowLine);
    issues.push({ line: rowLine, kind: "warning", msg: "no trailing newline (house format ends with LF)" });
  }
  return { rows, lines, issues };
}

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** A real calendar date in YYYY-MM-DD form (2021-02-29 and 2020-02-30 are not). */
export function isIsoDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  if (mo < 1 || mo > 12 || d < 1) return false;
  return d <= (mo === 2 && isLeap(y) ? 29 : DAYS_IN_MONTH[mo - 1]);
}

const NUMBER_RE = /^-?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;
const DATETIME_RE = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

// Types this checks. Anything else gets one "not checked" warning per field, so
// a gap is visible rather than silently passed; add a type here when a dataset
// first needs it.
const TYPE_CHECKS = {
  string: () => null,
  any: () => null,
  integer: (v) => (/^-?\d+$/.test(v) ? null : "not an integer"),
  // House format: plain decimal or exponent. No NaN/INF and no group separators
  // (a "1,000" means the build forgot to clean the number).
  number: (v) => (NUMBER_RE.test(v) ? null : "not a number"),
  boolean: (v, f) =>
    (f.trueValues ?? ["true", "True", "TRUE", "1"]).includes(v) ||
    (f.falseValues ?? ["false", "False", "FALSE", "0"]).includes(v)
      ? null
      : "not a boolean",
  date: (v) => (isIsoDate(v) ? null : "not an ISO 8601 date (YYYY-MM-DD)"),
  year: (v) => (/^-?\d{4}$/.test(v) ? null : "not a 4-digit year"),
  yearmonth: (v) => (/^\d{4}-(0[1-9]|1[0-2])$/.test(v) ? null : "not a year-month (YYYY-MM)"),
  datetime: (v) => {
    const m = DATETIME_RE.exec(v);
    return m && isIsoDate(m[1]) ? null : "not an ISO 8601 datetime (YYYY-MM-DDThh:mm:ss)";
  },
};

/**
 * Checks one CSV resource's values against its schema, pushing findings into
 * `out.errors` / `out.warnings`. Returns the parsed table (for foreign keys),
 * or null when the file couldn't be checked row by row.
 */
export function validateResourceData(dir, resource, out = { errors: [], warnings: [] }, stats) {
  const { errors, warnings } = out;
  const name = resource.name ?? resource.path;
  const fields = resource.schema.fields;
  const names = fields.map((f) => f.name);
  const buf = readFileSync(join(dir, resource.path));

  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    errors.push(`${name}: file starts with a UTF-8 BOM (house format is UTF-8 without BOM)`);
  }
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(buf);
  } catch {
    errors.push(`${name}: not valid UTF-8`);
    return null;
  }
  const { rows, lines, issues } = parseCsv(text);
  for (const issue of issues) (issue.kind === "error" ? errors : warnings).push(`${name}:${issue.line}: ${issue.msg}`);
  if (rows.length === 0) {
    errors.push(`${name}: file is empty (no header row)`);
    return null;
  }
  const header = rows[0];
  if (header.length !== names.length || header.some((h, i) => h !== names[i])) {
    errors.push(`${name}: header [${header.join(", ")}] does not match schema fields [${names.join(", ")}] (values not checked)`);
    return null;
  }

  const schema = resource.schema;
  const missingValues = Array.isArray(schema.missingValues) ? schema.missingValues : [""];
  const pk = [].concat(schema.primaryKey ?? []);
  const pkSet = new Set(pk);
  const pkIdx = pk.map((k) => names.indexOf(k));
  const unknownPk = pk.filter((k) => !names.includes(k));
  if (unknownPk.length) errors.push(`${name}: primaryKey field(s) not in schema: ${unknownPk.join(", ")}`);

  // One checker per column, decided once.
  const columns = fields.map((f) => {
    let check = TYPE_CHECKS[f.type ?? "string"];
    if (!check) {
      warnings.push(`${name}: ${f.name} has type "${f.type}", which this validator does not check`);
      check = TYPE_CHECKS.any;
    } else if (f.format && f.format !== "default" && ["date", "datetime", "yearmonth", "number", "integer"].includes(f.type)) {
      warnings.push(`${name}: ${f.name} has format "${f.format}", which this validator does not check`);
      check = TYPE_CHECKS.any;
    }
    return {
      f,
      check,
      required: f.constraints?.required === true || pkSet.has(f.name),
      enumValues: Array.isArray(f.constraints?.enum) ? new Set(f.constraints.enum.map(String)) : null,
      // Whitespace padding is a defect in a typed column too, but there the type
      // check already fails; only strings need their own warning.
      trimCheck: (f.type ?? "string") === "string",
    };
  });

  const counts = new Map();
  const report = (key, msg, list = errors) => {
    const c = (counts.get(key) ?? 0) + 1;
    counts.set(key, c);
    if (c <= MAX_PER_KIND) list.push(msg);
  };
  const seen = new Map();
  let cells = 0;
  for (let ri = 1; ri < rows.length; ri++) {
    const row = rows[ri];
    const ln = lines[ri];
    if (row.length !== names.length) {
      report("row width", `${name}:${ln}: row has ${row.length} cell(s), header has ${names.length}`);
      continue;
    }
    for (let ci = 0; ci < columns.length; ci++) {
      const { f, check, required, enumValues, trimCheck } = columns[ci];
      const v = row[ci];
      cells++;
      if (missingValues.includes(v)) {
        if (required) report(`required ${f.name}`, `${name}:${ln}: ${f.name} is empty but ${pkSet.has(f.name) ? "part of the primary key" : "required"}`);
        continue;
      }
      if (trimCheck && v !== v.trim()) report(`whitespace ${f.name}`, `${name}:${ln}: ${f.name} has leading/trailing whitespace: ${JSON.stringify(v)}`, warnings);
      const why = check(v, f);
      if (why) report(`type ${f.name}`, `${name}:${ln}: ${f.name} = ${JSON.stringify(v)} is ${why}`);
      if (enumValues && !enumValues.has(v)) report(`enum ${f.name}`, `${name}:${ln}: ${f.name} = ${JSON.stringify(v)} is not one of the allowed values (constraints.enum)`);
    }
    if (pk.length && !unknownPk.length) {
      const values = pkIdx.map((i) => row[i]);
      const key = values.join("\u0000");
      if (seen.has(key)) report("primary key", `${name}:${ln}: duplicate primary key (${pk.join(", ")}) = (${values.join(", ")}), first seen line ${seen.get(key)}`);
      else seen.set(key, ln);
    }
  }
  for (const [key, c] of counts) {
    if (c <= MAX_PER_KIND) continue;
    (key.startsWith("whitespace") ? warnings : errors).push(`${name}: ... ${c - MAX_PER_KIND} more of the same (${key})`);
  }
  if (stats) {
    stats.resources += 1;
    stats.rows += rows.length - 1;
    stats.cells += cells;
  }
  return { names, rows, lines };
}

// Same-package foreign keys only: every child key tuple must exist in the
// referenced resource (an empty `reference.resource` means this resource).
function checkForeignKeys(resources, tables, errors) {
  for (const resource of resources) {
    for (const fk of resource.schema.foreignKeys ?? []) {
      const childName = resource.name;
      const parentName = fk.reference?.resource || childName;
      const child = tables.get(childName);
      const parent = tables.get(parentName);
      if (!child || !parent) continue; // unparsed, or a reference outside this package
      const fields = [].concat(fk.fields ?? []);
      const refFields = [].concat(fk.reference?.fields ?? []);
      const childIdx = fields.map((f) => child.names.indexOf(f));
      const parentIdx = refFields.map((f) => parent.names.indexOf(f));
      if (childIdx.includes(-1) || parentIdx.includes(-1) || fields.length !== refFields.length) {
        errors.push(`${childName}: foreignKey (${fields.join(", ")}) → ${parentName} (${refFields.join(", ")}) names a field that isn't in the schema`);
        continue;
      }
      const have = new Set(parent.rows.slice(1).map((row) => parentIdx.map((i) => row[i]).join("\u0000")));
      let orphans = 0;
      let first;
      for (let ri = 1; ri < child.rows.length; ri++) {
        const values = childIdx.map((i) => child.rows[ri][i]);
        if (values.every((v) => v === "")) continue; // a missing reference is not an orphan
        if (have.has(values.join("\u0000"))) continue;
        orphans++;
        first ??= `line ${child.lines[ri]} (${values.join(", ")})`;
      }
      if (orphans) errors.push(`${childName}: ${orphans} row(s) whose foreign key (${fields.join(", ")}) is not in ${parentName}; first at ${first}`);
    }
  }
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
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith("--")) || ".";
  const data = !args.includes("--metadata-only");
  const stats = { resources: 0, rows: 0, cells: 0, ms: 0 };
  const t0 = performance.now();
  const result = validateDatapackage(dir, { data, stats });
  stats.ms = Math.round(performance.now() - t0);
  if (args.includes("--json")) console.log(JSON.stringify({ ...result, stats }, null, 2));
  else {
    console.log(formatReport(dir, result));
    if (data) console.log(`values checked: ${stats.rows} row(s), ${stats.cells} cell(s) in ${stats.resources} CSV resource(s)`);
    else console.log("values not checked (--metadata-only)");
  }
  process.exit(result.errors.length > 0 ? 1 : 0);
}
