import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanNumber,
  num,
  toIsoDate,
  excelSerialToIsoDate,
  fillForwardSections,
  makeSlugger,
  cellValue,
  toCsv,
} from "./wrangling-idioms.mjs";

test("cleanNumber strips currency symbols and thousands separators", () => {
  assert.equal(cleanNumber("$1,234.50"), 1234.5);
  assert.equal(cleanNumber("£99"), 99);
});

test("cleanNumber recognizes missing-value tokens", () => {
  for (const token of ["#N/A", "N/A", "NA", "-", "", "#VALUE!", "#REF!", "#DIV/0!"]) {
    assert.equal(cleanNumber(token), undefined, `expected ${JSON.stringify(token)} to be missing`);
  }
});

test("cleanNumber strips a trailing percent sign", () => {
  assert.equal(cleanNumber("12.3%"), 12.3);
});

test("cleanNumber passes plain finite numbers through, rejects NaN/Infinity", () => {
  assert.equal(cleanNumber(42), 42);
  assert.equal(cleanNumber(NaN), undefined);
  assert.equal(cleanNumber(Infinity), undefined);
});

test("num treats listed sentinel values as missing", () => {
  assert.equal(num("-99.99", [-99.99]), undefined);
  assert.equal(num("-1", [-1]), undefined);
  assert.equal(num("415.2", [-99.99]), 415.2);
  assert.equal(num("", [-1]), undefined);
});

test("num throws on a genuinely non-numeric cell", () => {
  assert.throws(() => num("n/a"), /non-numeric/);
});

test("excelSerialToIsoDate converts serials with no timezone shift", () => {
  assert.equal(excelSerialToIsoDate(36526), "2000-01-01"); // canonical Excel serial
  assert.equal(excelSerialToIsoDate(31917), "1987-05-20"); // EIA Brent start; naive Date gives -05-19 in UTC+ zones
  assert.equal(excelSerialToIsoDate(25569), "1970-01-01");
  assert.equal(excelSerialToIsoDate(1), "1900-01-01");
  assert.equal(excelSerialToIsoDate("x"), undefined);
});

test("toIsoDate handles Date objects and ISO strings", () => {
  assert.equal(toIsoDate(new Date(Date.UTC(2020, 0, 15))), "2020-01-15");
  assert.equal(toIsoDate("2020-01-15"), "2020-01-15");
});

test("toIsoDate rejects unparseable input", () => {
  assert.equal(toIsoDate("not a date"), undefined);
  assert.equal(toIsoDate(null), undefined);
});

test("fillForwardSections carries a section name across empty cells", () => {
  const sections = fillForwardSections(["", "Section", "National Accounts", "", "", "Trade", ""]);
  assert.deepEqual(sections, [
    "General",
    "General",
    "National Accounts",
    "National Accounts",
    "National Accounts",
    "Trade",
    "Trade",
  ]);
});

test("makeSlugger converts symbols and dedupes collisions", () => {
  const slug = makeSlugger();
  assert.equal(slug("Real UK GDP (£mn)"), "real-uk-gdp-gbpmn");
});

test("makeSlugger appends a counter on a repeated slug", () => {
  const slug = makeSlugger();
  assert.equal(slug("GDP"), "gdp");
  assert.equal(slug("GDP"), "gdp-2");
  assert.equal(slug("GDP"), "gdp-3");
});

test("cellValue unwraps a formula cell's result", () => {
  assert.equal(cellValue({ formula: "A9-1", result: 1086, ref: "A8:A72" }), 1086);
  assert.equal(cellValue({ result: 1087, sharedFormula: "A8" }), 1087);
});

test("cellValue unwraps rich text and hyperlink cells", () => {
  assert.equal(cellValue({ richText: [{ text: "foo" }, { text: "bar" }] }), "foobar");
  assert.equal(cellValue({ text: "example.com", hyperlink: "https://example.com" }), "example.com");
});

test("cellValue passes plain values through unchanged", () => {
  assert.equal(cellValue(42), 42);
  assert.equal(cellValue("plain"), "plain");
  assert.equal(cellValue(null), null);
});

test("toCsv writes undefined/null as empty cells", () => {
  const csv = toCsv(
    [
      { a: 1, b: undefined },
      { a: 2, b: "x" },
    ],
    ["a", "b"],
  );
  assert.equal(csv, "a,b\n1,\n2,x\n");
});

test("toCsv quotes fields containing commas, quotes or newlines (RFC 4180)", () => {
  const csv = toCsv(
    [
      { name: "Smith, John", note: 'say "hi"' },
      { name: "line\nbreak", note: "plain" },
    ],
    ["name", "note"],
  );
  assert.equal(csv, 'name,note\n"Smith, John","say ""hi"""\n"line\nbreak",plain\n');
});
