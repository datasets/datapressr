// Reference implementations for the cleanup idioms described in
// .claude/skills/structure/SKILL.md. Zero dependencies — copy whichever of
// these a given dataset's build.ts actually needs; datasets are independent
// repos (catalog-as-repo) so this file isn't meant to be a runtime import
// across repos, it's a tested source to copy from.

// Missing-value tokens Excel and financial sources actually use, verified
// against datasets/economic-history/millennium-macroeconomic-data-uk.
// Normalize all of them to the same thing: undefined (-> empty cell on write).
const MISSING_TOKENS = new Set(["#N/A", "N/A", "NA", "-", "", "#VALUE!", "#REF!", "#DIV/0!"]);

/** @param {unknown} raw @returns {number | undefined} */
export function cleanNumber(raw) {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
  const s = String(raw).trim();
  if (MISSING_TOKENS.has(s.toUpperCase())) return undefined;
  const cleaned = s.replace(/[$£€,]/g, "").replace(/%$/, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/** @param {unknown} raw @returns {string | undefined} */
export function toIsoDate(raw) {
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  if (typeof raw === "string") {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return undefined;
}

/**
 * Fill-forward sparse section headers — for wide spreadsheets where a
 * section name is only written in the first column it applies to.
 * @param {unknown[]} row @returns {string[]}
 */
export function fillForwardSections(row) {
  let current = "General";
  return row.map((v) => {
    const s = v ? String(v).trim() : "";
    if (s && !["Section", "Back to front page"].includes(s)) current = s;
    return current;
  });
}

/**
 * Slugify column descriptions into machine-readable variable ids, deduping
 * collisions rather than silently overwriting them.
 * @returns {(text: string) => string}
 */
export function makeSlugger() {
  const seen = new Map();
  return (text) => {
    const slug = text
      .trim()
      .toLowerCase()
      .replace(/£/g, "gbp")
      .replace(/\$/g, "usd")
      .replace(/%/g, "pct")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const n = (seen.get(slug) ?? 0) + 1;
    seen.set(slug, n);
    return n > 1 ? `${slug}-${n}` : slug;
  };
}

/**
 * Unwrap an ExcelJS cell value. Formula cells come back as
 * {formula, result, ...} (master) or {result, sharedFormula} (rest) instead
 * of a plain value — verified against a real 27MB source with
 * formula-computed year columns; without this every such column silently
 * comes back as "[object Object]". Python's openpyxl avoids this with
 * data_only=True; ExcelJS has no equivalent, so unwrap by hand.
 * @param {unknown} v @returns {unknown}
 */
export function cellValue(v) {
  if (v && typeof v === "object") {
    const o = v;
    if ("result" in o) return o.result;
    if ("richText" in o) return o.richText.map((t) => t.text).join("");
    if ("text" in o) return o.text;
  }
  return v;
}

/**
 * @param {Record<string, unknown>[]} rows
 * @param {string[]} columns
 * @returns {string}
 */
export function toCsv(rows, columns) {
  const esc = (v) => (v === undefined || v === null ? "" : String(v));
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n") + "\n";
}
