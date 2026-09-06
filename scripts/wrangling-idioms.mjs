// Reference implementations for the cleanup idioms described in
// skills/structure/SKILL.md. Zero dependencies — copy whichever of
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

/**
 * Strict numeric parser that treats a per-column list of sentinel *values* as
 * missing — for clean scientific/government text where "no measurement" is
 * encoded as an out-of-range number (`-1`, `-9.99`, `-99.99`) rather than a
 * blank, and where a genuinely non-numeric cell means the parse is wrong.
 * Unlike `cleanNumber` it does not strip currency/percent and it throws on
 * garbage rather than swallowing it.
 * @param {unknown} raw @param {number[]} [sentinels]
 * @returns {number | undefined}
 */
export function num(raw, sentinels = []) {
  if (raw === null || raw === undefined) return undefined;
  const s = String(raw).trim();
  if (s === "") return undefined;
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error(`non-numeric value: ${JSON.stringify(raw)}`);
  return sentinels.includes(n) ? undefined : n;
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
 * Excel serial date -> ISO `yyyy-mm-dd`, with no timezone shift.
 *
 * Spreadsheet dates are timezone-naive. Reading them as JS `Date` objects
 * (e.g. SheetJS `cellDates:true`, or `new Date(serial * 86400000)`) shifts
 * every date by the runner's UTC offset — this silently turned `1987-05-20`
 * into `1987-05-19` in the oil-prices build. Do the arithmetic through the
 * UTC epoch instead: Excel's day 0 is 1899-12-30, which is 25569 days before
 * the Unix epoch. Valid for any real-world date (>= 1900-03-01); it does not
 * reproduce Excel's fictional 1900-02-29. If the build already depends on
 * `xlsx`, `XLSX.SSF.parse_date_code(serial)` does the same job.
 *
 * Always spot-check the first converted date against the source's documented
 * start before trusting the column.
 * @param {unknown} serial @returns {string | undefined}
 */
export function excelSerialToIsoDate(serial) {
  if (typeof serial !== "number" || !Number.isFinite(serial)) return undefined;
  // Serials past 60 are inflated by one because Excel counts a 1900-02-29 that
  // never existed; drop it, then measure from the Unix epoch (Excel serial
  // 25569, once corrected, is 1970-01-01).
  const corrected = serial > 60 ? serial - 1 : serial;
  const d = new Date(Math.round((corrected - 25568) * 86400000));
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
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
 * Deterministic RFC 4180 CSV writer. Quotes any field containing a comma,
 * double-quote, CR or LF, doubling embedded quotes; empty for null/undefined.
 * Writes LF line endings and a trailing newline — `structure`'s house format.
 * @param {Record<string, unknown>[]} rows
 * @param {string[]} columns
 * @returns {string}
 */
export function toCsv(rows, columns) {
  const esc = (v) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return lines.join("\n") + "\n";
}
