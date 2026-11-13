// story-check: a blog-format story package (README.md + SVGs + <slug>-src/) is
// ready for `dh publish -p blog`. One good fixture, then one saboteur per check.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkStoryPackage, formatTable, packageImages } from "./story-check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const GOOD = join(here, "fixtures", "story-package");
const SCRIPT = join(here, "story-check.mjs");

// A copy of the good package with `mutate(dir)` applied.
function saboteur(mutate) {
  const dir = mkdtempSync(join(tmpdir(), "story-check-"));
  cpSync(GOOD, dir, { recursive: true });
  mutate(dir);
  return dir;
}
const editReadme = (dir, fn) => writeFileSync(join(dir, "README.md"), fn(readFileSync(join(dir, "README.md"), "utf8")));
const failing = (results) => results.filter((r) => !r.pass && r.severity === "fail").map((r) => r.id);
const byId = (results, id) => results.find((r) => r.id === id);

test("the good package passes every check", async () => {
  const results = await checkStoryPackage(GOOD);
  assert.deepEqual(failing(results), [], formatTable(GOOD, results));
  assert.deepEqual(results.filter((r) => !r.pass).map((r) => r.id), [], "and raises no warnings");
});

test("images are read from Markdown, <img src> and <source srcSet>, mapped from DataHub URLs to files", () => {
  const md = readFileSync(join(GOOD, "README.md"), "utf8");
  const images = packageImages(md).map((i) => i.local);
  assert.deepEqual(images.sort(), ["good-story-growth.svg", "good-story-share-mobile.svg", "good-story-share.svg"]);
});

test("saboteur: a missing mobile SVG fails the image check", async () => {
  const dir = saboteur((d) => rmSync(join(d, "good-story-share-mobile.svg")));
  const results = await checkStoryPackage(dir);
  // The 720px desktop chart is then also what phones get, at ~6px text.
  assert.deepEqual(failing(results), ["images", "chart-text-size"]);
  assert.match(byId(results, "images").message, /good-story-share-mobile\.svg/);
});

test("saboteur: NaN in SVG text fails the SVG check (S7)", async () => {
  const dir = saboteur((d) => {
    const p = join(d, "good-story-growth.svg");
    writeFileSync(p, readFileSync(p, "utf8").replace("Growth by year", "Growth NaN%"));
  });
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["S7"]);
});

test("saboteur: an autolink fails the autolink and MDX checks", async () => {
  const dir = saboteur((d) => editReadme(d, (md) => md.replace("That rise came", "Source: <https://ember-energy.org>. That rise came")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results).sort(), ["autolinks", "mdx"]);
  assert.match(byId(results, "autolinks").message, /line 14/);
});

test("saboteur: a relative CSV link fails the download-link check", async () => {
  const dir = saboteur((d) => editReadme(d, (md) => md.replace("(https://datahub.io/blog/good-story/_r/-/good-story-src/share.csv)", "(good-story-src/share.csv)")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["downloads"]);
  assert.match(byId(results, "downloads").message, /good-story-src\/share\.csv/);
});

test("saboteur: an absolute download link to a file not in the package fails", async () => {
  const dir = saboteur((d) => rmSync(join(d, "good-story-src", "share.csv")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["downloads"]);
});

test("saboteur: a file name with a space fails the filenames check", async () => {
  // china-co2-peak (2026-11-08): "GCP fossilCO2 2026v11.pdf" broke the served URL and a shell manifest.
  const dir = saboteur((d) => writeFileSync(join(d, "method doc.pdf"), "x"));
  const r = byId(await checkStoryPackage(dir), "filenames");
  assert.equal(r.pass, false);
  assert.match(r.message, /method doc\.pdf/);
  rmSync(dir, { recursive: true });
});

test("saboteur: an H1 fails the no-H1 check", async () => {
  const dir = saboteur((d) => editReadme(d, (md) => md.replace("\n<p><picture>", "\n# Solar passes 40 per cent\n\n<p><picture>")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["no-h1"]);
});

test("saboteur: front matter without a date fails", async () => {
  const dir = saboteur((d) => editReadme(d, (md) => md.replace("date: 2026-10-20\n", "")));
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), ["frontmatter"]);
  assert.match(byId(results, "frontmatter").message, /date/);
});

test("saboteur: an unscoped 'first time' warns (S8), and a scoped one does not", async () => {
  const bare = saboteur((d) => editReadme(d, (md) => md.replace("That rise came", "Solar beat wind for the first time ever. That rise came")));
  const results = await checkStoryPackage(bare);
  assert.deepEqual(failing(results), []);
  const s8 = byId(results, "S8");
  assert.equal(s8.pass, false);
  assert.equal(s8.severity, "warn");
  assert.match(s8.message, /first time ever/);
  const scoped = saboteur((d) => editReadme(d, (md) => md.replace("That rise came", "In 2025 solar beat wind for the first time in this 1985–2025 series, a record high since 1985. That rise came")));
  assert.equal(byId(await checkStoryPackage(scoped), "S8").pass, true);
});

test("the CLI prints a PASS/FAIL table and exits non-zero on failure", () => {
  const ok = spawnSync(process.execPath, [SCRIPT, GOOD], { encoding: "utf8", cwd: tmpdir() });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /PASS\s+frontmatter/);
  assert.match(ok.stdout, /RESULT: PASS/);
  const dir = saboteur((d) => rmSync(join(d, "good-story-share-mobile.svg")));
  const bad = spawnSync(process.execPath, [SCRIPT, dir], { encoding: "utf8", cwd: tmpdir() });
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /FAIL\s+images/);
  assert.match(bad.stdout, /RESULT: FAIL/);
});

// --- Portability (datapressr-7e4): a copy of the skill runs the checker, and --build takes a relative path ---

// A package whose chart build needs a module from the package's own node_modules.
function buildPackage() {
  const parent = mkdtempSync(join(tmpdir(), "story-check-build-rel-"));
  const dir = join(parent, "pkg");
  cpSync(GOOD, dir, { recursive: true });
  mkdirSync(join(dir, "node_modules", "fake-dep"), { recursive: true });
  writeFileSync(join(dir, "node_modules", "fake-dep", "package.json"), JSON.stringify({ name: "fake-dep", type: "module", main: "index.mjs" }));
  writeFileSync(join(dir, "node_modules", "fake-dep", "index.mjs"), "export const svg = (t) => `<svg xmlns=\"http://www.w3.org/2000/svg\"><text>${t}</text></svg>`;\n");
  writeFileSync(join(dir, "good-story-make-charts.mjs"), 'import { writeFileSync } from "node:fs";\nimport { svg } from "fake-dep";\nwriteFileSync("extra.svg", svg("built"));\n');
  writeFileSync(join(dir, "extra.svg"), '<svg xmlns="http://www.w3.org/2000/svg"><text>built</text></svg>');
  return { parent, dir };
}

test("--build works with a relative package path (the package's node_modules is linked by absolute path)", () => {
  const { parent } = buildPackage();
  const r = spawnSync(process.execPath, [SCRIPT, "pkg", "--build"], { encoding: "utf8", cwd: parent });
  assert.match(r.stdout, /PASS\s+S4/, r.stdout + r.stderr);
});

test("a git archive of skills/story plus scripts/story-check.mjs runs the checker with no DataPressr checkout", () => {
  const repo = join(here, "..");
  const tmp = mkdtempSync(join(tmpdir(), "story-check-archive-"));
  // Archive the working tree (tracked and new files), via a throwaway index so the real one is untouched.
  const env = { ...process.env, GIT_INDEX_FILE: join(tmp, "index") };
  const git = (args, opts = {}) => spawnSync("git", ["-C", repo, ...args], { encoding: "utf8", env, ...opts });
  assert.equal(git(["add", "--", "skills/story", "scripts/story-check.mjs"]).status, 0);
  const tree = git(["write-tree"]).stdout.trim();
  const out = join(tmp, "skill");
  mkdirSync(out);
  const tar = join(tmp, "skill.tar");
  assert.equal(git(["archive", "-o", tar, tree]).status, 0);
  assert.equal(spawnSync("tar", ["-xf", tar, "-C", out]).status, 0);
  cpSync(GOOD, join(out, "pkg"), { recursive: true });
  for (const script of ["scripts/story-check.mjs", "skills/story/scripts/story-check.mjs"]) {
    const r = spawnSync(process.execPath, [script, "pkg"], { encoding: "utf8", cwd: out });
    assert.equal(r.status, 0, `${script}: ${r.stdout}${r.stderr}`);
    assert.match(r.stdout, /PASS\s+mdx\s+no MDX hazards \(dependency-free scan/);
    assert.match(r.stdout, /RESULT: PASS/);
  }
  const { dir } = buildPackage();
  const built = spawnSync(process.execPath, [join(out, "scripts", "story-check.mjs"), dir, "--build"], { encoding: "utf8", cwd: tmp });
  assert.match(built.stdout, /PASS\s+S4/, built.stdout + built.stderr);
});

// --- Chart design checks (design audit, factory story-remakes, 2026-11-12) ---------
// Synthetic SVGs, one rule each; then the package view; then the template's own output.
import { checkChartDesign, contrastRatio, cvdConfusions, parseSvg } from "./svg-design.mjs";
import { existsSync, symlinkSync } from "node:fs";

const svgDoc = (body, { w = 360, h = 420, framed = true, attrs = "" } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${framed ? "data-dp-frame=\"1\" role=\"img\" " : ""}width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-size="14" fill="#111827" ${attrs}>` +
  (framed ? `<title>Solar overtook wind in 2025</title>` : "") +
  (framed ? `<text class="dp-title" x="8" y="22" font-size="19" font-weight="700">Solar overtook wind in 2025</text>` : "") +
  (framed ? `<text class="dp-subtitle" x="8" y="42" fill="#4b5563">Electricity generation, TWh</text>` : "") +
  body +
  (framed ? `<text class="dp-source" x="8" y="${h - 8}" font-size="13" fill="#4b5563">Source: Ember · Chart: DataHub</text>` : "") +
  `</svg>`;
const design = (svg, role = "mobile") => checkChartDesign([{ path: "c.svg", svg, role }]);
const designById = (svg, id, role) => design(svg, role).find((r) => r.id === id);

test("design: a framed phone chart with greys and one accent passes every design check", () => {
  const svg = svgDoc(`<g aria-label="line" stroke="#2563eb"><path d="M0,0L10,10"/></g><g aria-label="line" stroke="#6b7280"><path d="M0,0L10,10"/></g><text x="250" y="120" fill="#1d4ed8" font-weight="700">Solar 2,779</text>`);
  assert.deepEqual(design(svg).filter((r) => !r.pass).map((r) => `${r.id}: ${r.message}`), []);
});

test("design: font size is inherited, inline style beats the attribute, and em is relative", () => {
  const p = parseSvg(`<svg width="360" viewBox="0 0 360 100" font-size="10" style="font-size: 14px"><g transform="translate(5,7)"><text y="0.5em">a</text><text font-size="0.5em">b</text></g></svg>`);
  assert.deepEqual(p.texts.map((t) => [t.text, t.size, t.y]), [["a", 14, 14], ["b", 7, 7]]);
});

test("design: a framed chart without a source line FAILS chart-frame; an unframed one only warns", () => {
  const noSource = svgDoc("").replace(/<text class="dp-source"[^>]*>[^<]*<\/text>/, "");
  const r = designById(noSource, "chart-frame");
  assert.equal(r.pass, false);
  assert.equal(r.severity, "fail");
  assert.match(r.message, /source line/);
  const legacy = designById(svgDoc(`<text x="8" y="20">Electricity (TWh)</text>`, { framed: false }), "chart-frame");
  assert.equal(legacy.severity, "warn");
  assert.match(legacy.message, /takeaway title.*source line.*accessible name/);
});

test("design: 10px ticks on a 360px phone SVG render at ~9px and fail chart-text-size", () => {
  const r = designById(svgDoc(`<g aria-label="y-axis tick label" font-size="10"><text y="100">150</text></g>`), "chart-text-size");
  assert.equal(r.pass, false);
  assert.equal(r.severity, "fail");
  assert.match(r.message, /9\.1 px on a phone/);
  // A 720px desktop SVG with a mobile sibling is shown at 720: 12px is fine there…
  assert.equal(designById(svgDoc(`<text y="100" font-size="12">150</text>`, { w: 720 }), "chart-text-size", "desktop").pass, true);
  // …but the same SVG shown on a phone (no mobile variant) is ~5px.
  assert.match(designById(svgDoc(`<text y="100" font-size="12">150</text>`, { w: 720 }), "chart-text-size", "only").message, /5\.4 px/);
});

test("design: #9ca3af text fails chart-contrast (2.5:1); #6b7280 and white-on-bar labels pass", () => {
  assert.ok(contrastRatio("#9ca3af", "#ffffff") < 3);
  const r = designById(svgDoc(`<text x="9" y="200" fill="#9ca3af">43</text>`), "chart-contrast");
  assert.equal(r.pass, false);
  assert.match(r.message, /"43" in #9ca3af is 2\.5:1/);
  assert.equal(designById(svgDoc(`<text x="9" y="200" fill="#6b7280">43</text><text x="9" y="220" fill="white">AZ 1,990</text>`), "chart-contrast").pass, true);
  // Opacity lowers contrast: #6b7280 at 50% is ~2:1.
  assert.equal(designById(svgDoc(`<text x="9" y="200" fill="#6b7280" fill-opacity="0.5">43</text>`), "chart-contrast").pass, false);
});

test("design: red/green and orange/green pairs warn chart-colour-blind; blue/orange and blue/red do not", () => {
  assert.equal(cvdConfusions(["#dc2626", "#16a34a"]).length, 1);
  assert.equal(cvdConfusions(["#ea580c", "#16a34a"]).length, 1);
  assert.equal(cvdConfusions(["#2563eb", "#ea580c"]).length, 0);
  assert.equal(cvdConfusions(["#2563eb", "#dc2626"]).length, 0);
  const r = designById(svgDoc(`<rect fill="#dc2626"/><rect fill="#16a34a"/>`), "chart-colour-blind");
  assert.equal(r.pass, false);
  assert.equal(r.severity, "warn");
  assert.match(r.message, /deuteranopia/);
});

test("design: three accent hues warn chart-accents; an accent with its tint and greys does not", () => {
  assert.equal(designById(svgDoc(`<rect fill="#2563eb"/><rect fill="#ea580c"/><rect fill="#7c3aed"/><rect fill="#16a34a"/>`), "chart-accents").pass, false);
  assert.equal(designById(svgDoc(`<rect fill="#dc2626"/><rect fill="#dc2626" fill-opacity="0.45"/><rect fill="#fca5a5"/><rect fill="#b6bcc6"/><rect fill="#6b7280"/>`), "chart-accents").pass, true);
});

test("design: a phone chart taller than 560px at 360 wide warns chart-mobile-height", () => {
  const r = designById(svgDoc("", { h: 847 }), "chart-mobile-height");
  assert.equal(r.pass, false);
  assert.match(r.message, /847 px tall/);
  assert.equal(designById(svgDoc("", { h: 847, w: 720 }), "chart-mobile-height", "desktop").pass, true, "desktop SVGs are not capped");
});

test("design: a three-line key above the plot, or 'black dot', warns chart-mobile-key", () => {
  const grid = `<g aria-label="y-grid"><line x1="40" x2="346" y1="300" y2="300"/><line x1="40" x2="346" y1="120" y2="120"/></g>`;
  const key = `<text x="0" y="60" fill="#2563eb">Below 2.1: 60 → 130</text><text x="0" y="78">Below 1.4: 5 → 43</text><text x="0" y="96">2% → 25% of world pop.</text>`;
  const r = designById(svgDoc(grid + key, { framed: false }), "chart-mobile-key");
  assert.equal(r.pass, false);
  assert.match(r.message, /3-line text key/);
  assert.match(designById(svgDoc(grid + `<text x="200" y="200">Black dot: 2014 peak</text>`), "chart-mobile-key").message, /by their look/);
  // Framed title + subtitle above the plot are not a key; a label inside the plot is fine.
  assert.equal(designById(svgDoc(grid + `<text x="300" y="200">Solar 2,779</text>`), "chart-mobile-key").pass, true);
});

test("design: story-check reports the design checks per package, mapping -mobile siblings", async () => {
  const results = await checkStoryPackage(GOOD);
  for (const id of ["chart-frame", "chart-text-size", "chart-contrast", "chart-colour-blind", "chart-accents", "chart-mobile-height", "chart-mobile-key"]) {
    assert.equal(byId(results, id)?.pass, true, `${id}: ${byId(results, id)?.message}`);
  }
  // A grey #9ca3af label in the mobile chart fails, because the fixture charts are framed.
  const dir = saboteur((d) => {
    const p = join(d, "good-story-share-mobile.svg");
    writeFileSync(p, readFileSync(p, "utf8").replace('fill="#1d4ed8"', 'fill="#9ca3af"'));
  });
  const r = byId(await checkStoryPackage(dir), "chart-contrast");
  assert.equal(r.pass, false);
  assert.equal(r.severity, "fail");
  assert.match(r.message, /good-story-share-mobile\.svg/);
});

test("design: an older, unframed package gets design warnings, never new FAILs", async () => {
  const dir = saboteur((d) => {
    for (const f of ["good-story-share.svg", "good-story-share-mobile.svg", "good-story-growth.svg"]) {
      const p = join(d, f);
      writeFileSync(p, readFileSync(p, "utf8").replace(' data-dp-frame="1"', "").replace(/fill="#4b5563"/g, 'fill="#9ca3af"').replace(/font-size="13"/g, 'font-size="9"'));
    }
  });
  const results = await checkStoryPackage(dir);
  assert.deepEqual(failing(results), []);
  assert.equal(byId(results, "chart-contrast").severity, "warn");
  assert.equal(byId(results, "chart-text-size").pass, false);
});

// The template's frame() + draw() output must pass the checks it is meant to satisfy.
const STORY_MODULES = join(here, "..", "site", "stories", "node_modules");
test("design: the chart template's frame() output passes every design check, desktop and mobile", { skip: !existsSync(join(STORY_MODULES, "@observablehq", "plot")) && "site/stories not installed" }, async () => {
  const ws = mkdtempSync(join(tmpdir(), "chart-template-"));
  cpSync(join(here, "..", "skills", "story", "references", "make-charts-template.mjs"), join(ws, "t.mjs"));
  symlinkSync(STORY_MODULES, join(ws, "node_modules"), "dir");
  const t = await import(join(ws, "t.mjs"));
  const rows = [2015, 2020, 2025].map((year, i) => ({ year, solar: [250, 850, 2779][i], wind: [830, 1590, 2713][i] }));
  const built = t.chart({
    slug: "demo-crossover",
    title: "Solar overtook wind in 2025, after a decade of faster growth",
    subtitle: "World electricity generation from solar and wind, terawatt-hours",
    source: "Source: Ember · Chart: DataHub",
    plot: (mode, s) => ({
      x: { tickFormat: "d", ticks: [2015, 2020, 2025] },
      y: { domain: [0, 3000] },
      marks: [
        t.Plot.line(rows, { x: "year", y: "wind", stroke: t.C.context, strokeWidth: 2.5 }),
        t.Plot.line(rows, { x: "year", y: "solar", stroke: t.C.accent, strokeWidth: 3 }),
        ...t.endLabels(mode, [
          { x: 2025, y: 2779, slotY: 3000, text: `Solar ${t.round(2779).toLocaleString("en-US")}`, mobileText: "Solar\n2,779", accent: true },
          { x: 2025, y: 2713, slotY: 2300, text: "Wind 2,713", mobileText: "Wind\n2,713" },
        ]),
      ],
    }),
  });
  const res = checkChartDesign([
    { path: "demo.svg", svg: built.desktop, role: "desktop" },
    { path: "demo-mobile.svg", svg: built.mobile, role: "mobile" },
  ]);
  assert.deepEqual(res.filter((r) => !r.pass).map((r) => `${r.id}: ${r.message}`), []);
  assert.match(built.mobile, /<title id="demo-crossover-chart-mobile-title">Solar overtook wind/);
  assert.doesNotMatch(built.desktop + built.mobile, /NaN|Infinity|undefined|=>/);
  rmSync(ws, { recursive: true, force: true });
});

test("design: a y tick label wider than the left margin, or an end label past the right edge, warns chart-clipping", () => {
  const ticks = `<g text-anchor="end" transform="translate(-9,0)"><text transform="translate(40,100)" font-size="13">30,000</text></g>`;
  const r = designById(svgDoc(ticks), "chart-clipping");
  assert.equal(r.pass, false);
  assert.equal(r.severity, "warn");
  assert.match(r.message, /"30,000" runs ~10 px off the left edge/);
  assert.equal(designById(svgDoc(ticks.replace("40,100", "52,100")), "chart-clipping").pass, true);
  assert.match(designById(svgDoc(`<text x="300" y="200" font-weight="700">+636.0 (75.5%)</text>`), "chart-clipping").message, /right edge/);
});

// Measure fidelity (writing.md rule 14, SKILL.md step 4): the writer's NOTES.md, in the package
// or the folder above it, lists each plain-words phrase for a measure against the source wording.
// The fidelity table is now the independent reviewer's (round 4): a "Reviewer:" line, then
// Phrase | Where | Source wording | Mismatch ("none" or the fields) | Resolution (a flagged row: the fixed wording, quoted).
const NOTES_TABLE = `| Phrase as published | Where | Source wording | Mismatch | Resolution |\n|---|---|---|---|---|\n`;
const writeNotes = (d, body, reviewer = "Reviewer: fresh-context subagent, 2026-11-13\n\n") => writeFileSync(join(d, "NOTES.md"), `# Notes\n\n## Measure fidelity review\n\n${reviewer}${body}\n## Time spent\n\nAn hour.\n`);

test("fidelity: the reviewer's NOTES.md table whose phrases are in the README or a chart passes", async () => {
  const r = byId(await checkStoryPackage(GOOD), "fidelity");
  assert.equal(r.pass, true, r.message);
});

test("fidelity: no NOTES.md, or one without a table row, warns; NOTES.md one folder up is found", async () => {
  const none = byId(await checkStoryPackage(saboteur((d) => rmSync(join(d, "NOTES.md")))), "fidelity");
  assert.equal(none.pass, false);
  assert.equal(none.severity, "warn");
  assert.match(none.message, /no NOTES\.md/);
  const empty = byId(await checkStoryPackage(saboteur((d) => writeNotes(d, NOTES_TABLE))), "fidelity");
  assert.equal(empty.pass, false);
  assert.match(empty.message, /no "Measure fidelity" table/);
  const parent = mkdtempSync(join(tmpdir(), "story-check-parent-"));
  cpSync(GOOD, join(parent, "package"), { recursive: true });
  cpSync(join(GOOD, "NOTES.md"), join(parent, "NOTES.md"));
  rmSync(join(parent, "package", "NOTES.md"));
  assert.equal(byId(await checkStoryPackage(join(parent, "package")), "fidelity").pass, true);
});

test("fidelity: a row with no quoted phrase or an empty cell warns", async () => {
  for (const row of [`| wind share | opening | Solar share | none | ok |`, `| "Solar supplied" | opening |  | none | ok |`]) {
    const r = byId(await checkStoryPackage(saboteur((d) => writeNotes(d, `${NOTES_TABLE}${row}\n`))), "fidelity");
    assert.equal(r.pass, false, row);
    assert.match(r.message, /incomplete row/);
  }
});

test("fidelity: phrases match rendered text (links unwrapped, comments and unembedded charts ignored)", async () => {
  const row = (p) => `${NOTES_TABLE}| "${p}" | body | Solar share | none | ok |\n`;
  const linked = saboteur((d) => { writeNotes(d, row("frozen data reproduce")); editReadme(d, (md) => md.replace("[frozen data](https://datahub.io/blog/good-story/_r/-/good-story-src/share.csv) and [provenance](good-story-src/PROVENANCE.md)", "[frozen data](https://datahub.io/blog/good-story/_r/-/good-story-src/share.csv) reproduce")); });
  assert.equal(byId(await checkStoryPackage(linked), "fidelity").pass, true);
  const comment = saboteur((d) => { writeNotes(d, row("wind and solar")); editReadme(d, (md) => `${md}\n<!-- wind and solar -->\n`); });
  assert.equal(byId(await checkStoryPackage(comment), "fidelity").pass, false);
  const stray = saboteur((d) => { writeNotes(d, row("wind and solar")); writeFileSync(join(d, "old-chart.svg"), "<svg><text>wind and solar</text></svg>"); });
  assert.equal(byId(await checkStoryPackage(stray), "fidelity").pass, false);
});

test("fidelity: a listed phrase that is not in the README or a chart warns (a stale table)", async () => {
  const dir = saboteur((d) => writeNotes(d, `${NOTES_TABLE}| "wind and solar" | opening | Solar share of electricity | none | ok |\n`));
  const r = byId(await checkStoryPackage(dir), "fidelity");
  assert.equal(r.pass, false);
  assert.match(r.message, /"wind and solar"/);
});

test("fidelity: a table with no Reviewer line is the writer's own and warns", async () => {
  const dir = saboteur((d) => writeNotes(d, `${NOTES_TABLE}| "Solar supplied" | opening | Solar share | none | ok |\n`, ""));
  const r = byId(await checkStoryPackage(dir), "fidelity");
  assert.equal(r.pass, false);
  assert.match(r.message, /Reviewer:/);
});

test("fidelity: a flagged mismatch passes only when its quoted fix is published", async () => {
  const flagged = (resolution) => `${NOTES_TABLE}| "wind and solar" | opening | Solar share of electricity generation | category: solar only | ${resolution} |\n`;
  for (const res of ["pending", "fixed", `fixed: "solar and storage"`, `pending: "Solar supplied"`]) {
    const r = byId(await checkStoryPackage(saboteur((d) => writeNotes(d, flagged(res)))), "fidelity");
    assert.equal(r.pass, false, res);
    assert.match(r.message, /unresolved/);
  }
  const fixed = byId(await checkStoryPackage(saboteur((d) => writeNotes(d, flagged(`fixed: "Solar supplied"`)))), "fidelity");
  assert.equal(fixed.pass, true, fixed.message);
  // The fix is published but the flagged phrase is still there too: unresolved.
  const both = saboteur((d) => { writeNotes(d, flagged(`fixed: "Solar supplied"`)); editReadme(d, (md) => md.replace("That rise came", "Wind and solar grew. That rise came")); });
  assert.equal(byId(await checkStoryPackage(both), "fidelity").pass, false);
  // A fix that widens the phrase ("retail" -> "retail and wholesale") resolves it.
  const wider = saboteur((d) => writeNotes(d, `${NOTES_TABLE}| "grid's" | opening | grid total | population | fixed: "the grid's electricity" |\n`));
  assert.equal(byId(await checkStoryPackage(wider), "fidelity").pass, true);
});

test("fidelity: a short flagged phrase also used correctly elsewhere clears only with ok-elsewhere (r4 smoke: \"customs value\")", async () => {
  // "solar" was wrong in one sentence (fixed to "Solar supplied") but stays correct in another.
  const row = (resolution) => `${NOTES_TABLE}| "solar" | opening | Solar share of electricity generation | measure: share, not capacity | ${resolution} |\n`;
  const keep = (d) => editReadme(d, (md) => md.replace("That rise came", "Solar panels are cheap. That rise came"));
  const plain = byId(await checkStoryPackage(saboteur((d) => { writeNotes(d, row(`fixed: "Solar supplied"`)); keep(d); })), "fidelity");
  assert.equal(plain.pass, false, plain.message);
  assert.match(plain.message, /ok-elsewhere/);
  const marked = byId(await checkStoryPackage(saboteur((d) => { writeNotes(d, row(`fixed: "Solar supplied"; ok-elsewhere: "Solar panels are cheap"`)); keep(d); })), "fidelity");
  assert.equal(marked.pass, true, marked.message);
  // Only an affirmative marker with a quoted location counts (Codex review).
  for (const res of [`fixed: "Solar supplied"; ok-elsewhere`, `fixed: "Solar supplied"; not ok-elsewhere: "x"`, `fixed: "Solar supplied"; ok-elsewhere: pending`]) {
    const r = byId(await checkStoryPackage(saboteur((d) => { writeNotes(d, row(res)); keep(d); })), "fidelity");
    assert.equal(r.pass, false, res);
  }
  // ok-elsewhere never excuses an unpublished fix.
  const nofix = byId(await checkStoryPackage(saboteur((d) => { writeNotes(d, row(`fixed: "solar and storage"; ok-elsewhere`)); keep(d); })), "fidelity");
  assert.equal(nofix.pass, false);
  assert.match(nofix.message, /unresolved/);
});

test("fidelity: --notes points the check at notes kept elsewhere (DataPressr docs/reviews/<slug>-notes.md)", async () => {
  const dir = saboteur((d) => rmSync(join(d, "NOTES.md")));
  const notes = join(mkdtempSync(join(tmpdir(), "story-check-notes-")), "slug-notes.md");
  cpSync(join(GOOD, "NOTES.md"), notes);
  assert.equal(byId(await checkStoryPackage(dir, { notes }), "fidelity").pass, true);
  const r = spawnSync(process.execPath, [SCRIPT, dir, "--notes", notes], { encoding: "utf8", cwd: tmpdir() });
  assert.match(r.stdout, /PASS\s+fidelity/, r.stdout + r.stderr);
});

// --- Figure density (story-remakes h2: originals 0.83 figures per sentence, ours 1.7) ---
import { checkDensity, checkProcessNotes, countFigures, proseSentences, DENSITY_REF_MEAN, DENSITY_REF_SHARE3 } from "./story-check.mjs";

test("density: a figure is a number, percentage, money value, year or date; a date counts once, each end of a range once", () => {
  const cases = [
    ["Solar supplied 42% of the grid's electricity in 2025, up from 12% in 2015.", 4],
    ["On 21 August 2026, the Bureau of Reclamation cut the allotment.", 1],
    ["The 2015–16 El Niño peaked at 2.6C, against 1,040 feet at Lake Mead.", 4],
    ["Trips rose by 10 to 20 a day, or 10–20.", 4],
    ["WTI fell to −$37.63 a barrel; Brent held at $9.10.", 2],
    ["Trips rose 118.4 per cent, about a fifth more than three times the 1990s level.", 2],
  ];
  for (const [s, n] of cases) assert.equal(countFigures(s), n, s);
});

test("density: names, ordinals and rounding statements are not figures", () => {
  for (const s of ["COVID-19 hit the G7 and raised CO2 and PM2.5 levels.", "The 118th Congress met in the 21st century.", "Values are rounded to the nearest 5."]) assert.equal(countFigures(s), 0, s);
});

test("density: sentences come from reader prose only (no front matter, headings, tables, code, images, link text, captions or methods)", () => {
  const md = [
    "---", "title: 9 of 10", "date: 2026-01-01", "---", "",
    '<p><picture><img src="a.svg" alt="Shares rose from 12% to 42%." /></picture></p>', "",
    "Solar supplied 42% of power in 2025. The U.S. Bureau of Reclamation agreed with the [2024 report on 33 states](https://x.org/2024).", "",
    "## 42% is a claim heading with 7 numbers 9", "",
    "*Source: Ember, 2025 data, 3 regions.*", "",
    "| year | share |", "|---|---|", "| 2025 | 42 |", "",
    "```sh", "echo 1 2 3 4 5", "```", "",
    "- A list item still counts as prose in 2025.", "",
    "Lake", "",
    "## How this was made", "", "We used 14 files from 2019 to 2025 and 3 scripts.", "",
  ].join("\n");
  assert.deepEqual(proseSentences(md), [
    "Solar supplied 42% of power in 2025.",
    "The U.S. Bureau of Reclamation agreed with the link.",
    "A list item still counts as prose in 2025.",
  ]);
});

test("density: short sentences, claim headings, linked figures, italic asides and a final 'etc.' are kept (Codex review)", () => {
  const md = [
    "Output rose 20%. Jobs fell 30%.", "",
    "## Data centres are growing", "", "They used 4% of power in 2024.", "",
    "## Data", "", "Files 1 to 9 are raw downloads.", "",
    "## Notes on a bad year", "", "Prices fell in 2009 and 2020.", "",
    "*An aside in italics, not a caption, about 2023.*", "",
    "It covers coal, gas, etc. The rest is small.", "",
    "See [20%, versus 30% in 2024](https://x.org).", "",
  ].join("\n");
  assert.deepEqual(proseSentences(md), [
    "Output rose 20%.", "Jobs fell 30%.",
    "They used 4% of power in 2024.",
    "Prices fell in 2009 and 2020.",
    "An aside in italics, not a caption, about 2023.",
    "It covers coal, gas, etc.", "The rest is small.",
    "See link.",
  ]);
  const caption = ["![Chart](a.svg)", "", "*Shares in 2015 and 2025, per cent.*", "", "Solar rose fast in 2025."].join("\n");
  assert.deepEqual(proseSentences(caption), ["Solar rose fast in 2025."]);
});

test("density: no reader prose at all is reported as info, not scored", () => {
  const r = checkDensity("## How this was made\n\nWe used 3 files.\n");
  assert.equal(r.pass, true);
  assert.equal(r.severity, "info");
  assert.match(r.message, /no reader prose/);
});

test("density is info only (story-remakes h3): it never fails or warns, even far above the reference points", () => {
  assert.equal(DENSITY_REF_MEAN, 1.2);
  assert.equal(DENSITY_REF_SHARE3, 0.15);
  const light = "Solar supplied 42% of the grid's power last year. That share keeps rising every year. Wind came next with a smaller share.";
  const ok = checkDensity(light);
  assert.equal(ok.pass, true, ok.message);
  assert.equal(ok.severity, "info");
  assert.match(ok.message, /0\.33 figures per sentence; 0% of 3 sentences carry 3\+/);
  const dense = Array.from({ length: 6 }, (_, i) => `In 20${10 + i} output rose ${i + 1}% to ${i + 100} units.`).join(" ") + " Nothing else changed much at all.";
  const high = checkDensity(dense);
  assert.equal(high.pass, true);
  assert.equal(high.severity, "info");
  assert.match(high.message, /2\.57 figures per sentence; 86% of 7 sentences carry 3\+ figures/);
  assert.doesNotMatch(high.message, /over|cut/i);
  assert.equal((high.message.match(/\(3\) "/g) ?? []).length, 5, high.message);
});

test("density: story-check reports it as INFO for the package README and it never counts as a warning", async () => {
  const results = await checkStoryPackage(GOOD);
  const r = byId(results, "density");
  assert.ok(r, "density result present");
  assert.equal(r.severity, "info");
  const table = formatTable(GOOD, results);
  assert.match(table, /^INFO {2}density/m);
  const warns = results.filter((x) => !x.pass && x.severity !== "fail").length;
  assert.match(table, new RegExp(`${warns} warning\\(s\\)`));
});

// --- Process notes in the reader text (story-remakes h3: "Draft: the author's voice pass is outstanding" in 10/10) ---

test("process-note: the h3 voice-pass line fails, and so do other draft or voice-pass labels", () => {
  const leaks = [
    "*Draft: the author's voice pass is outstanding.*",
    "Solar rose. Draft: numbers to be checked.",
    "> **Draft:** not yet reviewed.",
    "The author's voice pass is still to come.",
    "This is a draft and may change.",
    "_This story is still a draft._",
  ];
  for (const leak of leaks) {
    const r = checkProcessNotes(`---\ntitle: T\n---\n\nSolar rose in 2025.\n\n${leak}\n`);
    assert.equal(r.pass, false, leak);
    assert.equal(r.severity, "fail", leak);
    assert.match(r.message, /line 7:/, leak);
  }
});

test("process-note: front matter status, code, HTML comments and ordinary uses of 'draft' pass", () => {
  const md = [
    "---", "title: T", "datahub:", "  status: draft", "  # approved: 2026-10-12 owner voice pass", "---", "",
    "The 2024 NFL draft: a record for wide receivers.", "",
    "Ministers published a draft budget in May.", "",
    "<!-- Draft: voice pass outstanding -->", "",
    "```", "Draft: x", "```", "",
  ].join("\n");
  const r = checkProcessNotes(md);
  assert.equal(r.pass, true, r.message);
});

test("saboteur: the voice-pass line in a package README fails story-check", async () => {
  const dir = saboteur((d) => editReadme(d, (md) => `${md}\n*Draft: the author's voice pass is outstanding.*\n`));
  try {
    const results = await checkStoryPackage(dir);
    assert.deepEqual(failing(results), ["process-note"]);
    assert.match(formatTable(dir, results), /RESULT: FAIL/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
