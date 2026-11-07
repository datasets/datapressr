// The dependency-free MDX hazard scan must agree with the real
// compiler (site/stories/mdx-check.mjs) on the cases that broke DataHub pages.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mdxHazards, checkMdx } from "./validate-datapackage.mjs";

const { mdxError } = await import("../site/stories/mdx-check.mjs");

const BAD = [
  "See (<https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm>) for the source.",
  "Mail <someone@example.org> to ask.",
  "<!-- a comment -->",
  "Prices <5 per cent of the time.",
  "a <= b",
  "Line one<br>line two",
  '<img src="chart.svg" alt="x">',
  "An {invalid expression} here",
  "Unclosed { brace",
];
const GOOD = [
  "a < b and a > b and a & b",
  "Plain [link](https://example.org) text.",
  "<br/> and <img src=\"x.svg\" />",
  '<p><picture>\n  <source media="(max-width: 600px)" srcSet="x.svg" />\n  <img className="rounded-md" src="y.svg" alt="z" />\n</picture></p>',
  "Inline code `<https://x>` and `{a b}` is fine.",
  "```sh\necho <https://x> {a b}\n```",
  "A year {2024} is a valid expression.",
  "---\ntitle: <weird> {x y}\n---\n\nBody.",
  "WTI was -$36.98 and Brent $19.33.",
];

for (const text of BAD) {
  test(`hazard scan flags what the compiler rejects: ${JSON.stringify(text).slice(0, 50)}`, async () => {
    assert.ok(await mdxError(text), "fixture should fail the real compiler");
    assert.ok(mdxHazards(text).length > 0, "heuristic missed it");
  });
}
for (const text of GOOD) {
  test(`hazard scan passes what the compiler accepts: ${JSON.stringify(text).slice(0, 50)}`, async () => {
    assert.equal(await mdxError(text), null, "fixture should compile");
    assert.deepEqual(mdxHazards(text), []);
  });
}

test("hazards carry the line number of the file (front matter counted)", () => {
  const [h] = mdxHazards("---\ntitle: x\n---\n\nIntro.\n\nSee <https://x>.\n");
  assert.equal(h.line, 7);
  assert.match(h.message, /autolink/);
});

test("checkMdx uses the real compiler when it resolves, and reports the mode", async () => {
  const ok = await checkMdx("Fine.\n");
  assert.equal(ok.error, null);
  assert.equal(ok.mode, "compile");
  const bad = await checkMdx("x <https://x> y\n");
  assert.ok(bad.error);
  assert.equal(bad.error.line, 1);
});

test("checkMdx falls back to the hazard scan when the compiler is unavailable", async () => {
  const bad = await checkMdx("x <https://x> y\n", { compiler: null });
  assert.equal(bad.mode, "heuristic");
  assert.ok(bad.error);
});

test("hazard scan has no false positives on the stories and dataset READMEs that compile", async () => {
  const { readdirSync, readFileSync, existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const root = new URL("..", import.meta.url).pathname;
  const readmes = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (!d.isDirectory() || ["node_modules", "archive", "data"].includes(d.name)) return [];
    const sub = join(dir, d.name);
    return [...(existsSync(join(sub, "README.md")) ? [join(sub, "README.md")] : []), ...readmes(sub)];
  });
  const stories = join(root, "site/stories");
  const files = [...readdirSync(stories).filter((f) => f.endsWith(".md")).map((f) => join(stories, f)), ...readmes(join(root, "datasets"))];
  const flagged = files.filter((f) => mdxHazards(readFileSync(f, "utf8")).length).map((f) => f.replace(root, ""));
  assert.deepEqual(flagged, []);
});
