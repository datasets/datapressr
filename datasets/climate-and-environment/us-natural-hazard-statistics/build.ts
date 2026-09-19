// U.S. natural hazard statistics — archive/ → data/*.csv.
//
// Offline. Reads only the snapshot in archive/ (see fetch.ts for the network step) and
// verifies every file against archive/manifest.json's SHA-256 before parsing.
//
// Run:  npm install && node build.ts
//
// Source: the National Weather Service's annual "Summary of U.S. Natural Hazard Statistics",
// one PDF per year, compiled from Storm Data. Each PDF opens with a table of weather events
// against fatalities, injuries and property/crop damage, grouped under category headings and
// closed by the source's own total row.
//
// Two layouts, and neither is negotiable about column positions:
//   * 1997–2006 ("legacy")  — damage headed "Amount of Property Damage (M)", "Amount of Crop
//     Damage (M)" and "Total Prop/Crop Damage (M)" stacked over three lines, one decimal
//     place, currency symbols as separate text runs, and a hand-drawn brace on the River Flood
//     line carrying a Flood-category subtotal that is NOT a component row.
//   * 2007–2025 ("modern")  — damage headed "(million $)", two decimal places, no brace.
// Column bands are therefore derived per document from the rows' own right edges rather than
// hard-coded: the two eras' bands overlap (a legacy injuries figure sits where a modern
// fatalities figure sits), so a single hard-coded template would mis-assign a whole era
// silently. See README.md.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");
const DATA = join(HERE, "data");

/** Category headings the source groups its events under, in the order they appear. */
export const CATEGORIES = [
  "Convection",
  "Extreme Temperatures",
  "Flood",
  "Marine",
  "Tropical Cyclones",
  "Winter",
  "Other",
];

/** The label the source uses for its own total row. Spelled three ways across the range. */
const TOTAL_LABEL = /^totals?$/i;

/**
 * Page furniture that appears between a category heading and the total, and is not a heading.
 *
 * Derived by listing every figure-less row between the header and the total across all 29
 * extractable years, not from the recent end. Three shapes occur; the two that are the modern
 * layout's wrapped column headers ("Damage", "(million $)") always sit *before* the first
 * category and so are consumed by the header-spill skip in selectTableRows, which leaves this
 * list with one live entry. Anything not matched here throws rather than being skipped,
 * because an unrecognised heading would silently file its rows under the previous category —
 * an error that neither the row counts nor the total-row arithmetic can see.
 */
const PAGE_FURNITURE = [
  /^Report generated:\s*\d{1,2}\/\d{1,2}\/\d{4}\s*\d{1,2}:\d{2}:\d{2}\s*[AP]M\d+\s*\/\s*\d+$/,
];

/**
 * The event labels the source reports, and the years it reports each in.
 *
 * This is the expectation the extraction is checked against, and it is the only thing that
 * can catch a dropped row: a row with no deaths, no injuries and little damage can vanish
 * from a year and leave every sum still reconciling. `event_rows` in the coverage resource
 * is a report of what was found, not a claim about what should have been there.
 *
 * A source that adds or drops an event will stop the build. That is the intended behaviour —
 * a change in what the source reports is a finding to record, not a change to absorb.
 */
const EVENTS_EVERY_YEAR = [
  "Avalanche", "Coastal Storm", "Cold", "Drought", "Dust Devil", "Dust Storm", "Fire Weather",
  "Flash Flood", "Fog", "Hail", "Heat", "High Wind", "Ice", "Lightning", "Miscellaneous",
  "Mud Slide", "Rain", "River Flood", "Tornado", "Tsunami", "Volcanic Ash", "Waterspout",
  "Winter Storm",
];

/** Labels that appear only in part of the range, with the years they span, ends inclusive. */
const EVENTS_PARTIAL: { label: string; from: number; to: number }[] = [
  { label: "Rip Current", from: 2002, to: 2025 },
  { label: "Small Stream/Urban Flood", from: 1997, to: 2006 },
  { label: "Tstm Wind", from: 1997, to: 2006 },
  { label: "Thunderstorm Wind", from: 2007, to: 2025 },
  { label: "Tropical Storm/Hurricane", from: 1997, to: 2006 },
  { label: "Tropical Storm / Hurricane", from: 2007, to: 2025 },
];

/** The exact set of event labels a given year must produce. */
export function expectedEvents(year: number): Set<string> {
  const out = new Set(EVENTS_EVERY_YEAR);
  for (const e of EVENTS_PARTIAL) if (year >= e.from && year <= e.to) out.add(e.label);
  return out;
}

/** Rows are grouped by baseline; PDF baselines within a line wobble by a point or two. */
const Y_TOLERANCE = 2;
/** How far a figure's right edge may sit from its column's median before it is "extra". */
const COLUMN_TOLERANCE = 9;

const COLUMNS = ["fatalities", "injuries", "property", "crop", "total"] as const;

/** An event label, as the source prints it. Anything else means the label was read wrong. */
const LABEL_SHAPE = /^[A-Za-z][A-Za-z ./'-]*$/;

/**
 * Spelling changes in the source's own event labels, and nothing more.
 *
 * `hazard` publishes the label verbatim; `hazard_id` is this dataset's slug for it, so a
 * series does not break where the source merely re-typed a name. Only two pairs qualify and
 * both are presentation: "Tstm Wind" is an abbreviation of "Thunderstorm Wind", and the 2007
 * layout put spaces around the slash in "Tropical Storm/Hurricane".
 *
 * Deliberately NOT mapped: "Small Stream/Urban Flood", which the source stops reporting after
 * 2006, and "Rip Current", which it starts reporting in 2002. Where those events were counted
 * outside their own years is not stated anywhere, and guessing would invent a series.
 */
const LABEL_ALIASES: Record<string, string> = {
  "Tstm Wind": "Thunderstorm Wind",
  "Tropical Storm/Hurricane": "Tropical Storm / Hurricane",
};

export function hazardId(label: string): string {
  return (LABEL_ALIASES[label] ?? label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ManifestFile {
  source_id: string;
  url: string;
  path: string | null;
  http_status: number;
  bytes: number | null;
  sha256: string | null;
}

interface Manifest {
  source: string;
  hub: string;
  selection: string;
  candidate_years: number;
  retrieved_years: number;
  files: ManifestFile[];
}

interface Item {
  x: number;
  right: number;
  y: number;
  text: string;
}

export interface HazardRow {
  year: number;
  hazard_category: string;
  hazard: string;
  hazard_id: string;
  is_total: boolean;
  fatalities: number;
  injuries: number;
  property_damage_musd: number;
  crop_damage_musd: number;
  total_damage_musd: number;
  source_document: string;
}

export interface CoverageRow {
  year: number;
  url: string;
  archived_path: string;
  http_status: number;
  layout: string;
  extracted: boolean;
  event_rows: number | "";
  note: string;
}

/**
 * The numeric value of a table cell, or undefined if the run is not a figure.
 *
 * The legacy total row writes its figures as `$9,557.5` followed by a separate `M` run, and
 * sometimes as a single `10,785.6M`. Currency and the millions suffix are presentation; the
 * column header already states the unit. Anything else — a brace, a footnote marker, a stray
 * letter — must come back undefined so the caller can refuse to guess at it.
 */
export function cellNumber(raw: string): number | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const bare = s.replace(/^\$\s*/, "").replace(/\s*M$/, "");
  // Thousands separators must actually be thousands separators: "12,34" and "1,2,3" are a
  // garbled text run, not the numbers 1234 and 123, and must come back undefined rather than
  // become a plausible figure.
  if (!/^(\d{1,3}(,\d{3})*|\d+)(\.\d+)?$/.test(bare)) return undefined;
  return Number(bare.replace(/,/g, ""));
}

/** Median, taking the lower of the two middle values on an even count (deterministic). */
function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor((s.length - 1) / 2)];
}

/** Text runs on a page, grouped into rows by baseline and sorted left to right. */
async function pageRows(doc: Awaited<ReturnType<typeof getDocument>["promise"]>, p: number): Promise<Item[][]> {
  const content = await (await doc.getPage(p)).getTextContent();
  const rows: Map<number, Item[]> = new Map();
  for (const it of content.items as { str: string; width: number; transform: number[] }[]) {
    if (!it.str.trim()) continue;
    const y = Math.round(it.transform[5]);
    const key = [...rows.keys()].find((v) => Math.abs(v - y) <= Y_TOLERANCE) ?? y;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key)!.push({ x: it.transform[4], right: it.transform[4] + it.width, y, text: it.str });
  }
  return [...rows.keys()]
    .sort((a, b) => b - a) // PDF y grows upwards; reading order is top to bottom
    .map((y) => rows.get(y)!.sort((a, b) => a.x - b.x));
}

interface RawRow {
  label: string;
  figures: { value: number; right: number }[];
}

/**
 * The hazard table's rows, from the header down to and including the source's own total row.
 *
 * The table does not end at a page break — in the modern layout the "Other" category and the
 * total sit on page 2 — and later pages carry further tables (a narrative, and fatalities by
 * sex and age) whose rows look just like these. So the extraction starts at the "Weather
 * Event" header and stops at the first total row after it. Stopping anywhere else silently
 * folds the age table's numbers into the hazard table.
 */
export function selectTableRows(allRows: Item[][]): { header: string; layout: "legacy" | "modern"; rows: RawRow[] } {
  // All three column names on one line. Two is not enough: the legacy layout's own title
  // wraps as "Summary of 1997 Weather Events, Fatalities," / "Injuries, and Damage Costs",
  // so a Weather-Event-plus-Fatalities test matches the title and reads the table from the
  // wrong place — which is how this parser first failed.
  const headerAt = allRows.findIndex((r) => {
    const line = r.map((i) => i.text).join(" ");
    if (/summary\s+of/i.test(line)) return false;
    return /weather\s*event/i.test(line) && /fatalities/i.test(line) && /injuries/i.test(line);
  });
  if (headerAt < 0) throw new Error("no 'Weather Event / Fatalities / Injuries' header row found");

  // The layout is read off the header the source printed, never inferred from the year. The
  // two eras' column bands overlap, so which template applies is the one thing this parser
  // must not guess — and an earlier draft that decided it with `year <= 2006` labelled every
  // legacy document "modern" in the coverage table while every figure in it was right.
  const header = allRows[headerAt].map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();
  const legacy = /Damage \(M\)/.test(header);
  const modern = /Property/.test(header) && /Crop/.test(header) && /Total/.test(header);
  if (legacy === modern) throw new Error(`header ${JSON.stringify(header)} matches neither layout, or both`);
  const layout = legacy ? "legacy" : "modern";

  // The modern layout wraps its column headers over three lines ("Property / Damage /
  // (million $)"), so the two continuation lines sit between the header and the first
  // category. Skip them, but only while they carry no figures — a skipped row that had
  // numbers in it would be a data row silently dropped, which is the failure this whole
  // build is arranged to make impossible.
  const body = allRows.slice(headerAt + 1);
  let start = 0;
  while (start < body.length) {
    const label = body[start].map((i) => i.text).join("").replace(/\s+/g, " ").trim();
    if (CATEGORIES.some((c) => c.toLowerCase() === label.toLowerCase())) break;
    if (body[start].some((i) => cellNumber(i.text) !== undefined)) {
      throw new Error(`row ${JSON.stringify(label)} carries figures but precedes the first category heading`);
    }
    start++;
  }
  if (start === body.length) throw new Error("no category heading follows the header row");

  const out: RawRow[] = [];
  for (const row of body.slice(start)) {
    // The label is what is left once the figures, the currency furniture and the legacy
    // layout's brace are removed. The brace matters: in six of the ten legacy years it is a
    // real `}` text run sitting beside the River Flood label, and folding it into the label
    // published "River Flood}}" as an event name — with every count and every sum check
    // still passing, because only the label was wrong.
    const label = row
      .filter((i) => cellNumber(i.text) === undefined && !/^[$M{}]$/.test(i.text.trim()))
      .map((i) => i.text)
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    const figures = row
      .map((i) => ({ value: cellNumber(i.text), right: i.right }))
      .filter((f): f is { value: number; right: number } => f.value !== undefined);
    if (!label && figures.length === 0) continue;
    out.push({ label, figures });
    if (TOTAL_LABEL.test(label)) return { header, layout, rows: out };
  }
  throw new Error("the hazard table has no total row — the table was not read to its end");
}

/**
 * The five column positions, as the median right edge of the rows that have exactly five
 * figures. Right edges, because the figures are right-aligned and the left edge moves with
 * the number of digits — in 2005 the tropical-cyclone fatality count is 1016 and its left
 * edge sits 6 points left of every other row's.
 */
export function calibrateColumns(rows: RawRow[]): number[] {
  const wellFormed = rows.filter((r) => r.figures.length === COLUMNS.length);
  if (wellFormed.length < 10) {
    throw new Error(`only ${wellFormed.length} rows have ${COLUMNS.length} figures — too few to calibrate columns`);
  }
  const anchors = COLUMNS.map((_, i) => median(wellFormed.map((r) => r.figures[i].right)));
  for (let i = 1; i < anchors.length; i++) {
    if (anchors[i] - anchors[i - 1] < 4 * COLUMN_TOLERANCE) {
      throw new Error(`columns ${i - 1} and ${i} calibrated too close together (${anchors.join(", ")})`);
    }
  }
  return anchors;
}

export interface AssignedRow {
  label: string;
  values: number[];
  /** Figures that belong to no column: the legacy brace's Flood-category subtotals. */
  extra: { value: number; right: number }[];
}

/**
 * Put each figure in the column whose median right edge it matches, and keep the leftovers.
 *
 * A figure that lands in no column is never dropped. In the legacy layout the River Flood
 * line carries a brace holding the Flood category's own subtotal for fatalities and injuries;
 * those two numbers sit between columns and are a claim about the three flood rows, checked
 * against them below. A leftover anywhere else is an unread column, so it throws.
 */
export function assignColumns(row: RawRow, anchors: number[]): AssignedRow {
  const values: (number | undefined)[] = anchors.map(() => undefined);
  const extra: { value: number; right: number }[] = [];
  for (const f of row.figures) {
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < anchors.length; i++) {
      const d = Math.abs(f.right - anchors[i]);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (bestDist > COLUMN_TOLERANCE) {
      extra.push(f);
    } else if (values[best] !== undefined) {
      throw new Error(`row ${JSON.stringify(row.label)}: two figures claim column ${COLUMNS[best]}`);
    } else {
      values[best] = f.value;
    }
  }
  const missing = COLUMNS.filter((_, i) => values[i] === undefined);
  if (missing.length > 0) {
    throw new Error(`row ${JSON.stringify(row.label)}: no figure for ${missing.join(", ")}`);
  }
  return { label: row.label, values: values as number[], extra };
}

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/** Parse one year's PDF into hazard rows, asserting the source's own arithmetic as it goes. */
export async function parseYear(
  year: number,
  pdf: Buffer,
  document: string,
): Promise<{ layout: "legacy" | "modern"; rows: HazardRow[] }> {
  const doc = await getDocument({ data: new Uint8Array(pdf), useSystemFonts: false, verbosity: 0 }).promise;
  const rows: Item[][] = [];
  for (let p = 1; p <= doc.numPages; p++) rows.push(...(await pageRows(doc, p)));
  if (rows.length === 0) throw new Error(`${document}: no extractable text — the PDF is page images, not text`);

  const { layout, rows: table } = selectTableRows(rows);
  const anchors = calibrateColumns(table);

  const out: HazardRow[] = [];
  let category = "";
  const seenCategories: string[] = [];
  let totalRow: HazardRow | undefined;
  const floodSubtotals: { value: number; right: number }[] = [];

  for (const raw of table) {
    if (raw.figures.length === 0) {
      // A label with no figures is a category heading. Both eras indent hazard rows under
      // them, but only the legacy one does so in the x coordinate, so having-no-numbers is
      // the test that works across the range.
      const heading = CATEGORIES.find((c) => c.toLowerCase() === raw.label.toLowerCase());
      if (heading) {
        if (seenCategories.includes(heading)) throw new Error(`${document}: category ${heading} appears twice`);
        if (CATEGORIES.indexOf(heading) < CATEGORIES.indexOf(seenCategories.at(-1) ?? CATEGORIES[0])) {
          throw new Error(`${document}: category ${heading} appears out of order`);
        }
        seenCategories.push(heading);
        category = heading;
        continue;
      }
      if (PAGE_FURNITURE.some((p) => p.test(raw.label))) continue;
      throw new Error(`${document}: unrecognised heading ${JSON.stringify(raw.label)}`);
    }
    const { label, values, extra } = assignColumns(raw, anchors);
    const isTotal = TOTAL_LABEL.test(label);
    if (extra.length > 0) {
      if (isTotal || !/flood/i.test(label)) {
        throw new Error(`${document}: row ${JSON.stringify(label)} has ${extra.length} figures outside every column`);
      }
      floodSubtotals.push(...extra);
    }
    if (!isTotal && !LABEL_SHAPE.test(label)) {
      throw new Error(`${document}: ${JSON.stringify(label)} is not a plausible event label`);
    }
    const row: HazardRow = {
      year,
      hazard_category: isTotal ? "" : category,
      hazard: label,
      hazard_id: isTotal ? "" : hazardId(label),
      is_total: isTotal,
      fatalities: values[0],
      injuries: values[1],
      property_damage_musd: values[2],
      crop_damage_musd: values[3],
      total_damage_musd: values[4],
      source_document: document,
    };
    // The source prints property, crop and their sum. Where they disagree the row was read
    // wrong, or the source's own arithmetic is off; either way it is not publishable in
    // silence. A tenth of a million is the rounding the legacy layout's one decimal allows.
    const sum = row.property_damage_musd + row.crop_damage_musd;
    if (Math.abs(sum - row.total_damage_musd) > 0.105) {
      throw new Error(
        `${document}: ${label} property ${row.property_damage_musd} + crop ${row.crop_damage_musd} ` +
          `= ${sum.toFixed(2)}, but the row's total says ${row.total_damage_musd}`,
      );
    }
    if (isTotal) totalRow = row;
    else out.push(row);
  }

  if (!totalRow) throw new Error(`${document}: no total row`);
  if (out.length === 0) throw new Error(`${document}: the table has a total but no component rows`);

  // The source's own total, against the components — the check that catches a row dropped
  // by a layout the column calibration did not expect. A missing row looks exactly like a
  // row that does not exist, so the only thing that can see it is arithmetic.
  for (const [key, label] of [
    ["fatalities", "fatalities"],
    ["injuries", "injuries"],
  ] as const) {
    const summed = out.reduce((a, r) => a + r[key], 0);
    if (summed !== totalRow[key]) {
      throw new Error(`${document}: ${label} sum to ${summed} across ${out.length} rows, total row says ${totalRow[key]}`);
    }
  }
  for (const key of ["property_damage_musd", "crop_damage_musd", "total_damage_musd"] as const) {
    const summed = out.reduce((a, r) => a + r[key], 0);
    // Component rows are rounded independently, so the sum drifts from the printed total by a
    // little. The worst real drift across all 29 years is 0.03 M$ (2024), so 0.05 M$ per row
    // leaves a 40x margin and still refuses a dropped row or a mis-read leading digit; the
    // 0.5 an earlier draft used was 430x looser than the source ever needs.
    if (Math.abs(summed - totalRow[key]) > 0.05 * out.length) {
      throw new Error(`${document}: ${key} sums to ${summed.toFixed(2)}, total row says ${totalRow[key]}`);
    }
  }

  // The event vocabulary, against what the source is known to report in this year. This is
  // the check that catches a dropped row: the arithmetic above cannot, because a row with no
  // deaths, no injuries and little damage subtracts nothing from any total.
  const expected = expectedEvents(year);
  const got = new Set(out.map((r) => r.hazard));
  const missing = [...expected].filter((e) => !got.has(e));
  const unexpected = [...got].filter((g) => !expected.has(g));
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `${document}: event vocabulary changed — missing [${missing.join(", ")}], ` +
        `unexpected [${unexpected.join(", ")}]. If the source really has changed what it ` +
        "reports, record the change in EVENTS_EVERY_YEAR / EVENTS_PARTIAL and in README.md.",
    );
  }

  // Every category, once, in the source's own order. The order check alone leaves the first
  // category unconstrained and permits a skipped one, and a skipped category would file its
  // rows under its predecessor without changing any count.
  if (seenCategories.length !== CATEGORIES.length) {
    throw new Error(`${document}: expected ${CATEGORIES.length} categories, saw [${seenCategories.join(", ")}]`);
  }

  // The legacy brace's Flood subtotal, against the flood rows it brackets. It appears in
  // pairs (fatalities, then injuries), and in the legacy layout it is the only cross-check
  // that can catch a whole-era column swap — so a legacy document without it is an error,
  // not a document that skips one optional check.
  if (layout === "legacy" && floodSubtotals.length === 0) {
    throw new Error(`${document}: legacy layout with no braced flood subtotal — the era's cross-check is gone`);
  }
  if (floodSubtotals.length > 0) {
    if (floodSubtotals.length !== 2) {
      throw new Error(`${document}: expected 2 braced flood subtotals, found ${floodSubtotals.length}`);
    }
    const flood = out.filter((r) => r.hazard_category === "Flood");
    const [fat, inj] = floodSubtotals.sort((a, b) => a.right - b.right).map((f) => f.value);
    const gotFat = flood.reduce((a, r) => a + r.fatalities, 0);
    const gotInj = flood.reduce((a, r) => a + r.injuries, 0);
    if (gotFat !== fat || gotInj !== inj) {
      throw new Error(
        `${document}: braced flood subtotal says ${fat} fatalities / ${inj} injuries, ` +
          `the ${flood.length} flood rows sum to ${gotFat} / ${gotInj}`,
      );
    }
  }

  out.push(totalRow);
  return { layout, rows: out };
}

/** RFC 4180, LF endings, trailing newline. Copied from scripts/wrangling-idioms.mjs. */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  const manifest: Manifest = JSON.parse(readFileSync(join(ARCHIVE, "manifest.json"), "utf8"));

  const hazards: HazardRow[] = [];
  const coverage: CoverageRow[] = [];

  const years = manifest.files.filter((f) => /^\d{4}$/.test(f.source_id)).sort((a, b) => Number(a.source_id) - Number(b.source_id));
  if (years.length === 0) throw new Error("manifest lists no annual summaries");

  for (const f of years) {
    const year = Number(f.source_id);
    if (f.http_status !== 200 || !f.path) {
      coverage.push({
        year,
        url: f.url,
        archived_path: "",
        http_status: f.http_status,
        layout: "not served",
        extracted: false,
        event_rows: "",
        note: "listed by the hub page's menu but the server does not have it",
      });
      continue;
    }
    const buf = readFileSync(join(HERE, f.path));
    if (sha256(buf) !== f.sha256) throw new Error(`${f.path}: sha256 does not match archive/manifest.json`);
    const document = f.path.split("/").pop()!;

    let parsed: { layout: "legacy" | "modern"; rows: HazardRow[] };
    try {
      parsed = await parseYear(year, buf, document);
    } catch (err) {
      const message = (err as Error).message;
      // A PDF with no extractable text is a real, permanent property of the snapshot, and is
      // recorded as discovered-and-not-extracted. Anything else is this build being wrong
      // about the source and must stop it.
      if (!/no extractable text/.test(message)) throw err;
      coverage.push({
        year,
        url: f.url,
        archived_path: f.path,
        http_status: f.http_status,
        layout: "scanned image",
        extracted: false,
        event_rows: "",
        note: "PDF is page images with no extractable text; the table would need OCR, which this build does not do",
      });
      continue;
    }
    hazards.push(...parsed.rows);
    coverage.push({
      year,
      url: f.url,
      archived_path: f.path,
      http_status: f.http_status,
      layout: parsed.layout,
      extracted: true,
      event_rows: parsed.rows.filter((r) => !r.is_total).length,
      note: "",
    });
  }

  const extracted = coverage.filter((c) => c.extracted).map((c) => c.year);
  if (extracted.length === 0) throw new Error("no year was extracted");

  // No interior gap in the extracted range, and the newest candidate actually produced rows.
  // The gap check alone cannot see a series truncated at its far end, which is the failure
  // that leaves a dataset quietly a year out of date.
  for (let y = extracted[0]; y <= extracted.at(-1)!; y++) {
    if (!extracted.includes(y)) throw new Error(`gap in the extracted series at ${y}`);
  }
  const newest = Math.max(...coverage.filter((c) => c.http_status === 200).map((c) => c.year));
  if (!extracted.includes(newest)) throw new Error(`the newest year served (${newest}) produced no rows`);

  // The primary key must actually be one.
  const keys = new Set<string>();
  for (const r of hazards) {
    const k = `${r.year}|${r.hazard}`;
    if (keys.has(k)) throw new Error(`duplicate primary key ${k}`);
    keys.add(k);
  }

  hazards.sort((a, b) => a.year - b.year || Number(a.is_total) - Number(b.is_total) || a.hazard.localeCompare(b.hazard));
  coverage.sort((a, b) => a.year - b.year);

  writeFileSync(
    join(DATA, "hazard-statistics.csv"),
    toCsv(hazards as unknown as Record<string, unknown>[], [
      "year",
      "hazard_category",
      "hazard",
      "hazard_id",
      "is_total",
      "fatalities",
      "injuries",
      "property_damage_musd",
      "crop_damage_musd",
      "total_damage_musd",
      "source_document",
    ]),
  );
  writeFileSync(
    join(DATA, "source-documents.csv"),
    toCsv(coverage as unknown as Record<string, unknown>[], [
      "year",
      "url",
      "archived_path",
      "http_status",
      "layout",
      "extracted",
      "event_rows",
      "note",
    ]),
  );

  const labels = new Set(hazards.filter((r) => !r.is_total).map((r) => r.hazard));
  console.log(
    `data/hazard-statistics.csv: ${hazards.length} rows, ${extracted.length} years ` +
      `(${extracted[0]}–${extracted.at(-1)}), ${labels.size} distinct event labels`,
  );
  console.log(
    `data/source-documents.csv: ${coverage.length} candidates, ${extracted.length} extracted, ` +
      `${coverage.filter((c) => !c.extracted).map((c) => `${c.year} (${c.layout})`).join(", ") || "none skipped"}`,
  );
}

// Only build when run directly; build.test.mjs imports the functions above.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
