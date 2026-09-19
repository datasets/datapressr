// Tests for the us-natural-hazard-statistics build.
//
// Every invisible character in this file is written as a backslash-u escape on purpose —
// see scripts/check-invisible-characters.mjs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cellNumber, hazardId, selectTableRows, calibrateColumns, assignColumns, toCsv, CATEGORIES, expectedEvents } from "./build.ts";
import { parseCandidates } from "./fetch.ts";

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(here, "archive", "manifest.json"), "utf8"));

/**
 * A small RFC 4180 reader, so the tests read what the file actually says.
 *
 * Deliberately not a plain `split(",")`: the coverage table's note for 1996 contains a comma
 * and is therefore quoted, and a naive split silently shifts every field after it — which is
 * how this helper first failed.
 */
function parseCsv(text) {
  const rows = [[""]];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const row = rows.at(-1);
    if (quoted) {
      if (c !== '"') row[row.length - 1] += c;
      else if (text[i + 1] === '"') (row[row.length - 1] += '"'), i++;
      else quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === ",") row.push("");
    else if (c === "\n") rows.push([""]);
    else row[row.length - 1] += c;
  }
  if (rows.at(-1).length === 1 && rows.at(-1)[0] === "") rows.pop();
  return rows;
}

function readCsv(name) {
  const [cols, ...lines] = parseCsv(readFileSync(join(here, "data", name), "utf8"));
  return lines.map((v) => {
    assert.equal(v.length, cols.length, `row does not have ${cols.length} fields: ${v.join("|")}`);
    return Object.fromEntries(v.map((x, i) => [cols[i], x]));
  });
}

const hazards = readCsv("hazard-statistics.csv");
const coverage = readCsv("source-documents.csv");

/** Build an Item[] row the way pageRows does, from [rightEdge, text] pairs. */
function row(y, cells) {
  return cells.map(([right, text]) => ({ x: right - 10, right, y, text }));
}

// --- cellNumber -------------------------------------------------------------

test("cellNumber reads plain and comma-grouped figures", () => {
  assert.equal(cellNumber("0"), 0);
  assert.equal(cellNumber("1,945.16"), 1945.16);
  assert.equal(cellNumber(" 67 "), 67);
});

test("cellNumber strips the legacy total row's currency and millions furniture", () => {
  assert.equal(cellNumber("$9,557.5"), 9557.5);
  assert.equal(cellNumber("10,785.6M"), 10785.6);
});

test("cellNumber refuses anything that is not a figure", () => {
  for (const s of ["", "}", "$", "M", "Tornado", "5/13/2016", "1 / 6", "12a", "-4"]) {
    assert.equal(cellNumber(s), undefined, `${JSON.stringify(s)} should not parse as a figure`);
  }
});

// --- hazardId ---------------------------------------------------------------

test("hazardId slugs a label", () => {
  assert.equal(hazardId("Flash Flood"), "flash-flood");
  assert.equal(hazardId("Small Stream/Urban Flood"), "small-stream-urban-flood");
});

test("hazardId folds only the two spelling changes, and nothing else", () => {
  assert.equal(hazardId("Tstm Wind"), hazardId("Thunderstorm Wind"));
  assert.equal(hazardId("Tropical Storm/Hurricane"), hazardId("Tropical Storm / Hurricane"));
  // Events the source starts or stops reporting are NOT folded into a neighbour.
  assert.notEqual(hazardId("Small Stream/Urban Flood"), hazardId("Flash Flood"));
  assert.notEqual(hazardId("Rip Current"), hazardId("Coastal Storm"));
});

// --- selectTableRows --------------------------------------------------------

const HEADER_MODERN = row(538, [
  [116, "Weather Event"],
  [276, "Fatalities"],
  [349, "Injuries"],
  [420, "Property"],
  [492, "Crop"],
  [565, "Total"],
]);

const MODERN_ANCHORS = [276, 348, 420, 492, 564];

function dataRow(y, label, values) {
  const cells = [[100, label]];
  values.forEach((v, i) => cells.push([MODERN_ANCHORS[i], String(v)]));
  return row(y, cells);
}

function modernTable(extra = []) {
  const out = [HEADER_MODERN, row(500, [[101, "Convection"]])];
  let y = 480;
  for (const [label, values] of [
    ["Lightning", [20, 96, 22.6, 0.02, 22.62]],
    ["Tornado", [67, 260, 1945.16, 3.37, 1948.53]],
    ["Hail", [0, 6, 60.58, 2.3, 62.88]],
    ["Cold", [25, 1, 0.01, 0, 0.01]],
    ["Heat", [100, 377, 0, 0, 0]],
    ["Rain", [4, 1, 0.91, 0.01, 0.92]],
    ["Fog", [0, 0, 0.09, 0, 0.09]],
    ["Ice", [0, 0, 3.21, 1.04, 4.25]],
    ["Tsunami", [0, 0, 1.02, 0, 1.02]],
    ["Waterspout", [0, 0, 0, 0, 0]],
    ["Mud Slide", [3, 0, 51.33, 0.01, 51.34]],
  ]) {
    out.push(dataRow((y -= 15), label, values));
  }
  out.push(...extra);
  out.push(dataRow(200, "Total", [219, 741, 2085.91, 6.75, 2092.66]));
  return out;
}

test("selectTableRows starts at the header and stops at the total row", () => {
  const before = row(600, [[200, "Summary of 2025 Weather Events, Fatalities,"]]);
  const after = row(100, [[100, "0 to 9"], [246, "34"], [323, "17"], [401, "1"], [478, "52"], [556, "8.06"]]);
  const { rows, layout } = selectTableRows([before, ...modernTable(), after]);
  assert.equal(layout, "modern");
  assert.equal(rows.at(-1).label, "Total");
  assert.ok(!rows.some((r) => r.label === "0 to 9"), "the age table must not be read into the hazard table");
});

test("selectTableRows ignores the title line that also says 'Weather Events, Fatalities'", () => {
  // The legacy layout wraps its title this way, and matching it reads the table from the
  // wrong place. This is the first way the parser failed.
  const title = row(600, [[200, "Summary of 1997 Weather Events, Fatalities,"]]);
  const { rows } = selectTableRows([title, ...modernTable()]);
  assert.equal(rows[0].label, "Convection");
});

test("selectTableRows reads the legacy layout as legacy", () => {
  const header = row(495, [
    [73, "Weather Event"],
    [184, "Fatalities"],
    [277, "Injuries"],
    [385, "Damage (M)"],
    [474, "Damage (M)"],
    [565, "Damage (M)"],
  ]);
  const { layout } = selectTableRows([header, row(480, [[91, "Convection"]]), ...modernTable().slice(2)]);
  assert.equal(layout, "legacy");
});

test("selectTableRows throws rather than reading a table with no total row", () => {
  assert.throws(() => selectTableRows(modernTable().slice(0, -1)), /no total row/);
});

test("selectTableRows throws if a row with figures precedes the first category", () => {
  const stray = dataRow(499, "Lightning", [1, 2, 3, 4, 7]);
  assert.throws(() => selectTableRows([HEADER_MODERN, stray, ...modernTable().slice(1)]), /precedes the first category/);
});

// --- calibrateColumns / assignColumns ---------------------------------------

test("calibrateColumns finds the five right edges", () => {
  const { rows } = selectTableRows(modernTable());
  assert.deepEqual(calibrateColumns(rows), [276, 348, 420, 492, 564]);
});

test("calibrateColumns refuses a table too small to calibrate from", () => {
  const { rows } = selectTableRows(modernTable());
  assert.throws(() => calibrateColumns(rows.slice(0, 4)), /too few to calibrate/);
});

test("assignColumns places right-aligned figures whatever their width", () => {
  const anchors = [276, 348, 420, 492, 564];
  // A four-digit count starts further left but still ends at the column's right edge. This is
  // the 2005 tropical-cyclone row; its right edges are the real ones from that PDF, which sit
  // up to 6.75pt off the anchors — left-edge matching is what mis-assigns them.
  const rights = [270.4, 345.9, 415.2, 494.6, 560.8];
  const values = [1016, 130, 93064.4, 2075.2, 95139.6];
  const wide = { label: "Tropical Storm / Hurricane", figures: rights.map((r, i) => ({ value: values[i], right: r })) };
  assert.deepEqual(assignColumns(wide, anchors).values, values);
});

test("assignColumns keeps the braced flood subtotal instead of swallowing it", () => {
  const anchors = [179, 273, 390, 480, 565];
  const riverFlood = {
    label: "River Flood",
    figures: [
      { value: 29, right: 179 },
      { value: 118, right: 214 }, // the brace's Flood-category subtotal
      { value: 60, right: 273 },
      { value: 525, right: 306 }, // ditto, for injuries
      { value: 6016.1, right: 390 },
      { value: 91, right: 480 },
      { value: 6107.1, right: 565 },
    ],
  };
  const got = assignColumns(riverFlood, anchors);
  assert.deepEqual(got.values, [29, 60, 6016.1, 91, 6107.1]);
  assert.deepEqual(got.extra.map((e) => e.value), [118, 525]);
});

test("assignColumns throws when a column has no figure", () => {
  const anchors = [276, 348, 420, 492, 564];
  const short = { label: "Hail", figures: [276, 348, 420].map((r, i) => ({ value: i, right: r })) };
  assert.throws(() => assignColumns(short, anchors), /no figure for crop, total/);
});

// --- toCsv ------------------------------------------------------------------

test("toCsv quotes only what needs quoting and ends with a newline", () => {
  const out = toCsv([{ a: "x,y", b: 1 }, { a: "plain", b: "" }], ["a", "b"]);
  assert.equal(out, 'a,b\n"x,y",1\nplain,\n');
});

// --- the published data -----------------------------------------------------

test("every archived file actually hashes to what the manifest says", () => {
  // Hash the bytes, don't just check the hex looks like a hash — the manifest is what makes
  // the published figures traceable to a document, and an entry nothing verifies is decoration.
  const served = manifest.files.filter((f) => f.http_status === 200);
  // 35 entries: hub, terms, 2 index probes (both 404), 31 candidates (one 404).
  assert.equal(manifest.files.length, 35);
  assert.equal(served.length, 32, "three entries should be unserved: 1995, robots.txt, sitemap.xml");
  for (const f of served) {
    assert.ok(f.path, `${f.source_id} has no path`);
    const buf = readFileSync(join(here, f.path));
    assert.equal(buf.length, f.bytes, `${f.path} byte count`);
    assert.equal(createHash("sha256").update(buf).digest("hex"), f.sha256, `${f.path} sha256`);
  }
});

test("the archive records that the source serves no index", () => {
  // The README's central claim is that this source has no machine-readable index. That claim
  // is only checkable if the probe is in the archive, so fetch.ts records it.
  const probes = manifest.files.filter((f) => f.source_id.startsWith("index-probe:"));
  assert.equal(probes.length, 2);
  for (const p of probes) {
    assert.equal(p.http_status, 404, `${p.url} answered ${p.http_status} — the source may now have an index`);
    assert.equal(p.path, null);
  }
  assert.deepEqual(probes.map((p) => p.url).sort(), [
    "https://www.weather.gov/robots.txt",
    "https://www.weather.gov/sitemap.xml",
  ]);
});

test("the coverage table accounts for every candidate the hub page listed", () => {
  assert.equal(coverage.length, manifest.candidate_years);
  assert.equal(coverage.filter((c) => c.extracted === "true").length, 29);
  assert.deepEqual(
    coverage.filter((c) => c.extracted === "false").map((c) => `${c.year}:${c.layout}`),
    ["1995:not served", "1996:scanned image"],
  );
});

test("the coverage table's event_rows matches the rows actually published", () => {
  for (const c of coverage) {
    const published = hazards.filter((h) => h.year === c.year && h.is_total === "false").length;
    assert.equal(published, Number(c.event_rows), `year ${c.year}`);
  }
});

test("the coverage table's layout matches properties of the data, not the year", () => {
  // Naming the year boundary would pass just as happily against a `year <= 2006`
  // implementation, which is exactly what build.ts refuses to do. So check the layout label
  // against things only that era's documents have: its damage precision and its vocabulary.
  const legacy = coverage.filter((c) => c.layout === "legacy").map((c) => Number(c.year));
  const modern = coverage.filter((c) => c.layout === "modern").map((c) => Number(c.year));
  assert.equal(legacy.length + modern.length, 29);
  const decimals = (s) => (s.includes(".") ? s.split(".")[1].length : 0);
  for (const year of legacy) {
    const rows = hazards.filter((h) => Number(h.year) === year);
    assert.ok(rows.some((h) => h.hazard === "Tstm Wind"), `legacy ${year} should use the abbreviated label`);
    assert.ok(rows.some((h) => h.hazard === "Small Stream/Urban Flood"), `legacy ${year}`);
    for (const h of rows) assert.ok(decimals(h.property_damage_musd) <= 1, `legacy ${year} ${h.hazard} precision`);
  }
  for (const year of modern) {
    const rows = hazards.filter((h) => Number(h.year) === year);
    assert.ok(rows.some((h) => h.hazard === "Thunderstorm Wind"), `modern ${year} should use the full label`);
    assert.ok(!rows.some((h) => h.hazard === "Small Stream/Urban Flood"), `modern ${year}`);
    for (const h of rows) assert.ok(decimals(h.property_damage_musd) <= 2, `modern ${year} ${h.hazard} precision`);
  }
  // At least one modern year must actually use the second decimal place, or "<= 2" is vacuous.
  assert.ok(hazards.some((h) => modern.includes(Number(h.year)) && decimals(h.property_damage_musd) === 2));
});

test("the extracted years are contiguous and reach the newest served document", () => {
  const years = [...new Set(hazards.map((h) => Number(h.year)))].sort((a, b) => a - b);
  assert.equal(years[0], 1997);
  assert.equal(years.at(-1), 2025);
  assert.equal(years.length, 29);
  for (let i = 1; i < years.length; i++) assert.equal(years[i] - years[i - 1], 1, `gap before ${years[i]}`);
  const servedYears = coverage.filter((c) => c.http_status === "200").map((c) => Number(c.year));
  assert.equal(years.at(-1), Math.max(...servedYears.filter((y) => y !== 1996)));
});

// The negative control on published values. Everything else in this file is derived from the
// same pipeline it is checking: the row counts, the sums and the coverage table all move
// together if a column is mis-assigned, so none of them can see a whole-era column swap.
// These five-tuples were read off the archived PDFs by hand, one per layout era plus the two
// awkward rows, and they are the only assertions here that are anchored outside the build.
const HAND_READ = [
  // year, hazard,                     fatalities, injuries, property, crop, total
  [1997, "Tornado", 67, 1033, 730.7, 5.8, 736.5], // legacy layout
  [1997, "TOTALS", 600, 3799, 9557.5, 1228.1, 10785.6], // legacy total, written "$9,557.5" + "M"
  [2005, "Tropical Storm/Hurricane", 1016, 130, 93064.4, 2075.2, 95139.6], // four-digit count
  [2007, "Lightning", 45, 138, 82.06, 0.06, 82.12], // first modern year
  [2016, "Total", 458, 1276, 18194.7, 243.29, 18438.0], // modern total
  [2025, "Tornado", 67, 260, 1945.16, 3.37, 1948.53], // newest year
];

test("published values match figures read off the PDFs by hand", () => {
  for (const [year, hazard, fatalities, injuries, property, crop, total] of HAND_READ) {
    const row = hazards.find((h) => Number(h.year) === year && h.hazard === hazard);
    assert.ok(row, `no row for ${year} ${hazard}`);
    assert.equal(Number(row.fatalities), fatalities, `${year} ${hazard} fatalities`);
    assert.equal(Number(row.injuries), injuries, `${year} ${hazard} injuries`);
    assert.equal(Number(row.property_damage_musd), property, `${year} ${hazard} property`);
    assert.equal(Number(row.crop_damage_musd), crop, `${year} ${hazard} crop`);
    assert.equal(Number(row.total_damage_musd), total, `${year} ${hazard} total`);
  }
});

test("every year publishes exactly the event labels the source is known to report", () => {
  // Independent of coverage.event_rows, which reports what was found rather than asserting
  // what should have been there — the two move together when a row is dropped.
  for (const year of new Set(hazards.map((h) => Number(h.year)))) {
    const got = new Set(hazards.filter((h) => Number(h.year) === year && h.is_total === "false").map((h) => h.hazard));
    assert.deepEqual([...got].sort(), [...expectedEvents(year)].sort(), `year ${year}`);
  }
});

test("the event count per year is 26, or 27 in the five overlap years", () => {
  for (const year of new Set(hazards.map((h) => Number(h.year)))) {
    const n = hazards.filter((h) => Number(h.year) === year && h.is_total === "false").length;
    assert.equal(n, year >= 2002 && year <= 2006 ? 27 : 26, `year ${year}`);
  }
});

test("the primary key is unique", () => {
  const keys = hazards.map((h) => `${h.year}|${h.hazard}`);
  assert.equal(new Set(keys).size, keys.length);
});

test("each year has exactly one total row, and it is the source's own", () => {
  for (const year of new Set(hazards.map((h) => h.year))) {
    const totals = hazards.filter((h) => h.year === year && h.is_total === "true");
    assert.equal(totals.length, 1, `year ${year}`);
    assert.match(totals[0].hazard, /^TOTALS?$|^Total$/);
    assert.equal(totals[0].hazard_category, "");
    assert.equal(totals[0].hazard_id, "");
  }
});

test("component rows sum to the year's own total row for fatalities and injuries", () => {
  for (const year of new Set(hazards.map((h) => h.year))) {
    const rows = hazards.filter((h) => h.year === year);
    const total = rows.find((h) => h.is_total === "true");
    for (const key of ["fatalities", "injuries"]) {
      const summed = rows.filter((h) => h.is_total === "false").reduce((a, h) => a + Number(h[key]), 0);
      assert.equal(summed, Number(total[key]), `${year} ${key}`);
    }
  }
});

test("property and crop damage add up to the row's own total in every row", () => {
  for (const h of hazards) {
    const sum = Number(h.property_damage_musd) + Number(h.crop_damage_musd);
    assert.ok(
      Math.abs(sum - Number(h.total_damage_musd)) <= 0.105,
      `${h.year} ${h.hazard}: ${h.property_damage_musd} + ${h.crop_damage_musd} != ${h.total_damage_musd}`,
    );
  }
});

test("every category is one the source uses, and only the total row has none", () => {
  for (const h of hazards) {
    if (h.is_total === "true") assert.equal(h.hazard_category, "");
    else assert.ok(CATEGORIES.includes(h.hazard_category), `${h.year} ${h.hazard}: ${h.hazard_category}`);
  }
});

test("no event label carries stray table furniture", () => {
  // "River Flood}}" shipped from the first draft: the brace is a text run beside the label
  // in six of the ten legacy years, and every count and sum check passed with it there.
  for (const h of hazards.filter((x) => x.is_total === "false")) {
    assert.match(h.hazard, /^[A-Za-z][A-Za-z ./'-]*$/, `${h.year}: ${JSON.stringify(h.hazard)}`);
  }
});

test("hazard_id collapses exactly the two documented spelling changes", () => {
  const byId = new Map();
  for (const h of hazards.filter((x) => x.is_total === "false")) {
    if (!byId.has(h.hazard_id)) byId.set(h.hazard_id, new Set());
    byId.get(h.hazard_id).add(h.hazard);
  }
  const merged = [...byId].filter(([, labels]) => labels.size > 1).map(([id]) => id).sort();
  assert.deepEqual(merged, ["thunderstorm-wind", "tropical-storm-hurricane"]);
});

test("counts are whole numbers and nothing is negative", () => {
  for (const h of hazards) {
    for (const key of ["fatalities", "injuries"]) {
      assert.match(h[key], /^\d+$/, `${h.year} ${h.hazard} ${key}`);
    }
    for (const key of ["property_damage_musd", "crop_damage_musd", "total_damage_musd"]) {
      assert.ok(Number(h[key]) >= 0, `${h.year} ${h.hazard} ${key}`);
    }
  }
});

// --- fetch.ts ---------------------------------------------------------------

test("parseCandidates reads the hub page's own menu, including the year it gets wrong", () => {
  const hub = readFileSync(join(here, "archive", "hazstat.html"), "utf8");
  const candidates = parseCandidates(hub);
  assert.equal(candidates.length, 31);
  assert.equal(candidates[0].year, 1995);
  assert.equal(candidates[0].url, "https://www.weather.gov/media/hazstat/sum95.pdf");
  assert.equal(candidates.at(-1).year, 2025);
});

test("parseCandidates refuses a menu whose label and filename disagree", () => {
  const bad =
    '<select><option value="#">U.S. Summaries</option>' +
    '<option value="/media/hazstat/sum25.pdf">2024</option></select>';
  assert.throws(() => parseCandidates(bad), /does not match its file/);
});

test("parseCandidates refuses a page with no U.S. Summaries menu", () => {
  assert.throws(() => parseCandidates("<select><option>Cold</option></select>"), /no 'U\.S\. Summaries'/);
});
