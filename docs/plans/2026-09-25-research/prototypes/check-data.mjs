#!/usr/bin/env node
// SCRATCH prototype for datapressr-ck8: check CSV values against the declared
// Frictionless table schema. Zero dependencies. Not for the repo as-is.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const MAX_PER_KIND = 5; // cap repeated messages per (resource, check, field)

// RFC 4180 parser: returns { rows, issues } where rows are arrays of strings.
// Tracks line numbers (1-based physical line where each record starts).
export function parseCsv(text) {
  const rows = [];
  const lines = [];
  const issues = [];
  let row = [], field = "", i = 0, inQuotes = false, line = 1, rowLine = 1, quoted = false;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      if (c === "\n") line++;
      field += c; i++; continue;
    }
    if (c === '"') {
      if (field !== "" ) issues.push({ line, msg: "quote character inside an unquoted field" });
      inQuotes = true; quoted = true; i++; continue;
    }
    if (c === ",") { row.push(field); field = ""; quoted = false; i++; continue; }
    if (c === "\r") { issues.push({ line, msg: "CR found (expected LF line endings)" }); i++; continue; }
    if (c === "\n") {
      row.push(field); rows.push(row); lines.push(rowLine);
      row = []; field = ""; quoted = false; i++; line++; rowLine = line; continue;
    }
    field += c; i++;
  }
  if (inQuotes) issues.push({ line: rowLine, msg: "unterminated quoted field at end of file" });
  if (field !== "" || row.length > 0 || quoted) { row.push(field); rows.push(row); lines.push(rowLine); issues.push({ line: rowLine, msg: "no trailing newline" }); }
  return { rows, lines, issues };
}

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
function validDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1) return false;
  const dim = [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
  return d <= dim;
}

// Returns null if ok, or a short reason string.
function checkType(field, v) {
  switch (field.type) {
    case "string": case "any": case undefined: return null;
    case "integer": return /^-?\d+$/.test(v) ? null : "not an integer";
    case "number": return /^-?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(v) ? null : "not a number";
    case "boolean": {
      const t = field.trueValues ?? ["true", "True", "TRUE", "1"];
      const f = field.falseValues ?? ["false", "False", "FALSE", "0"];
      return t.includes(v) || f.includes(v) ? null : "not a boolean";
    }
    case "date": return validDate(v) ? null : "not an ISO 8601 date (YYYY-MM-DD)";
    case "year": return /^-?\d{4}$/.test(v) ? null : "not a 4-digit year";
    case "yearmonth": return /^\d{4}-(0[1-9]|1[0-2])$/.test(v) ? null : "not YYYY-MM";
    case "datetime": return !Number.isNaN(Date.parse(v)) && /^\d{4}-\d{2}-\d{2}T/.test(v) ? null : "not an ISO 8601 datetime";
    default: return `unsupported type "${field.type}" (not checked)`;
  }
}

export function checkData(dir) {
  const errors = [], warnings = [];
  const pkg = JSON.parse(readFileSync(join(dir, "datapackage.json"), "utf8"));
  const keyIndex = new Map(); // resource name -> Set of pk tuples (for FK checks)
  const tables = new Map();
  for (const r of pkg.resources ?? []) {
    const label = r.name ?? r.path;
    const s = r.schema;
    if (!s?.fields?.length || !r.path?.endsWith(".csv")) continue;
    const p = join(dir, r.path);
    if (!existsSync(p)) continue; // metadata validator already reports this
    const buf = readFileSync(p);
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) errors.push(`${label}: file starts with a UTF-8 BOM`);
    let text;
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(buf); }
    catch { errors.push(`${label}: not valid UTF-8`); continue; }
    const { rows, lines, issues } = parseCsv(text.replace(/^\ufeff/, ""));
    const seenIssue = new Set();
    for (const is of issues) { if (seenIssue.has(is.msg)) continue; seenIssue.add(is.msg); (is.msg.startsWith("no trailing") || is.msg.startsWith("CR") ? warnings : errors).push(`${label}:${is.line}: ${is.msg}`); }
    if (rows.length === 0) { errors.push(`${label}: empty file (no header)`); continue; }
    const header = rows[0];
    const names = s.fields.map((f) => f.name);
    if (header.join("\u0000") !== names.join("\u0000")) {
      errors.push(`${label}: header [${header.join(", ")}] does not match schema fields [${names.join(", ")}]`);
      continue;
    }
    const missing = s.missingValues ?? [""];
    const pk = Array.isArray(s.primaryKey) ? s.primaryKey : s.primaryKey ? [s.primaryKey] : [];
    const pkIdx = pk.map((k) => names.indexOf(k));
    const seen = new Map();
    const counts = new Map();
    const bump = (k, msg, arr = errors) => { const c = (counts.get(k) ?? 0) + 1; counts.set(k, c); if (c <= MAX_PER_KIND) arr.push(msg); };
    for (let ri = 1; ri < rows.length; ri++) {
      const row = rows[ri], ln = lines[ri];
      if (row.length !== names.length) { bump(`${label}|width`, `${label}:${ln}: row has ${row.length} cells, header has ${names.length}`); continue; }
      for (let ci = 0; ci < names.length; ci++) {
        const f = s.fields[ci], v = row[ci];
        const isMissing = missing.includes(v);
        const required = f.constraints?.required || pk.includes(f.name);
        if (isMissing) { if (required) bump(`${label}|req|${f.name}`, `${label}:${ln}: ${f.name} is empty but ${pk.includes(f.name) ? "part of the primary key" : "required"}`); continue; }
        if (v !== v.trim()) bump(`${label}|ws|${f.name}`, `${label}:${ln}: ${f.name} has leading/trailing whitespace: ${JSON.stringify(v)}`, warnings);
        const why = checkType(f, v);
        if (why) bump(`${label}|type|${f.name}`, `${label}:${ln}: ${f.name} = ${JSON.stringify(v)} is ${why}`);
        if (f.constraints?.enum && !f.constraints.enum.includes(v)) bump(`${label}|enum|${f.name}`, `${label}:${ln}: ${f.name} = ${JSON.stringify(v)} not in enum`);
      }
      if (pk.length) {
        const key = pkIdx.map((i) => row[i]).join("\u0000");
        if (seen.has(key)) bump(`${label}|dup`, `${label}:${ln}: duplicate primary key (${pk.join(", ")}) = (${pkIdx.map((i) => row[i]).join(", ")}), first seen line ${seen.get(key)}`);
        else seen.set(key, ln);
      }
    }
    for (const [k, c] of counts) if (c > MAX_PER_KIND) (k.includes("|ws|") ? warnings : errors).push(`${label}: ... ${c - MAX_PER_KIND} more of the same (${k.split("|").slice(1).join(" ")})`);
    tables.set(r.name, { names, rows, lines });
    keyIndex.set(r.name, { pk, seen });
  }
  // foreign keys (same-package only)
  for (const r of pkg.resources ?? []) {
    for (const fk of r.schema?.foreignKeys ?? []) {
      const t = tables.get(r.name); const target = tables.get(fk.reference.resource || r.name);
      if (!t || !target) continue;
      const fields = [].concat(fk.fields), rf = [].concat(fk.reference.fields);
      const tIdx = rf.map((f) => target.names.indexOf(f));
      const have = new Set(target.rows.slice(1).map((row) => tIdx.map((i) => row[i]).join("\u0000")));
      const sIdx = fields.map((f) => t.names.indexOf(f));
      let orphans = 0, first;
      for (let ri = 1; ri < t.rows.length; ri++) { const k = sIdx.map((i) => t.rows[ri][i]).join("\u0000"); if (!have.has(k)) { orphans++; first ??= `${t.lines[ri]}: ${k}`; } }
      if (orphans) errors.push(`${r.name}: ${orphans} row(s) with foreign key (${fields}) not found in ${fk.reference.resource}; first at line ${first}`);
    }
  }
  return { errors, warnings };
}

const dir = process.argv[2] || ".";
const t0 = performance.now();
const { errors, warnings } = checkData(dir);
for (const e of errors) console.log(`✗ ${e}`);
for (const w of warnings) console.log(`⚠ ${w}`);
console.log(`${errors.length} error(s), ${warnings.length} warning(s) [${(performance.now() - t0).toFixed(0)} ms]`);
process.exit(errors.length ? 1 : 0);
