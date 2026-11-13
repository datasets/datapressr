#!/usr/bin/env node
// Is a blog-format story package ready for `dh publish <dir> -p blog`?
//
//   node scripts/story-check.mjs <post-dir> [--build] [--notes <NOTES.md>]     (npm run story-check -- <dir>)
//
// The checker ships inside the story skill (skills/story/scripts/), with copies of the helpers it
// needs in lib/ (kept identical to their DataPressr originals by scripts/sync-skill-bundles.mjs),
// so a copy of the skill runs it with no DataPressr checkout (datapressr-7e4). In DataPressr,
// scripts/story-check.mjs is a thin wrapper around this file.
//
// The package layout (factory releases/*/package): README.md with front matter
// (title, description, date) and no H1, the SVGs beside it, optional <slug>-src/.
// Images and downloads point at https://datahub.io/blog/<slug>/_r/-/<path>, which
// this maps back to <dir>/<path> to check the file is in the package.
//
// Checks (fail unless marked warn):
//   frontmatter  title, description and date present
//   no-h1        no H1 (DataHub renders the title from the publish flags)
//   mdx          README compiles as DataHub MDX (the scan in validate-datapackage.mjs: the real
//                compiler when site/stories/node_modules is installed, otherwise
//                a dependency-free scan; the mode is shown)
//   autolinks    no <https://...> autolinks (datapressr-fyy)
//   images       every image (Markdown, <img src>, <source srcSet>) is in the package
//   downloads    data-file links (.csv .json .zip ...) are absolute https://datahub.io/
//                URLs, and those into this post exist in the package
//   S2, S3, S6   story-skill checks from evals/lib/checkers/story.mjs, as warnings:
//                opening summary, prose numbers on a chart, no date after `date`
//   S7           SVGs free of NaN, Infinity, undefined and leaked function source
//   fidelity     warn: NOTES.md (package folder or the one above, or --notes <path>) has the independent reviewer's
//                "Measure fidelity" table ("Reviewer:" line, complete rows); unflagged phrases are in
//                the README or an embedded chart, and each flagged one's quoted fix is published and the
//                phrase gone elsewhere unless marked ok-elsewhere (SKILL.md step 4, references/cold-edit.md)
//   density      warn: figures per sentence in the reader prose above DENSITY_MAX_MEAN, or the share
//                of sentences with 3+ figures above DENSITY_MAX_SHARE3; lists the five densest
//                (definition at proseSentences/countFigures below; h2: originals 0.8, ours 1.7)
//   S8           warn: "first time", "ever", "all-time" or "record high/low" with no scope in
//                the sentence ("since 1985", "1985–2025", "in this series/data/record")
//   chart-*      design checks on every chart SVG (scripts/svg-design.mjs; rules in
//                skills/story/references/charting.md): chart-frame (title, source,
//                accessible name), chart-text-size (>= 11 px rendered), chart-contrast
//                (4.5:1), chart-colour-blind, chart-accents, chart-mobile-height,
//                chart-mobile-key, chart-clipping. FAIL for charts built with the template's frame()
//                (data-dp-frame); warnings for older charts. The last four always warn.
//   S4           with --build: the *-make-charts.mjs build, run twice offline in a
//                temp copy, reproduces the SVGs byte for byte
// Exits 1 when any fail-severity check fails. Runs from any directory, no install.
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkAsOf, checkNumbers, checkOpening, checkReproducible, checkSvgSanity, parseProse, splitFrontmatter, svgTexts, tokenizeNumbers } from "./lib/story.mjs";
import { blankFrontmatter, checkMdx, mdxHazards, stripCode } from "./lib/validate-datapackage.mjs";
import { checkChartDesign } from "./lib/svg-design.mjs";

const here = dirname(fileURLToPath(import.meta.url));

// DataPressr's chart and MDX toolchain (site/stories/) when this runs inside a checkout, found by
// walking up from this file; null in a standalone copy of the skill.
function findUp(rel, from = here) {
  for (let d = from; ; d = dirname(d)) {
    if (existsSync(join(d, rel))) return join(d, rel);
    if (dirname(d) === d) return null;
  }
}
const STORIES_DIR = ((p) => p && dirname(p))(findUp(join("site", "stories", "mdx-check.mjs")));
let mdxCompiler;
const loadMdxCompiler = () => (mdxCompiler ??= STORIES_DIR ? import(pathToFileURL(join(STORIES_DIR, "mdx-check.mjs")).href).then((m) => m.mdxError, () => null) : Promise.resolve(null));
const DATA_EXT = /\.(csv|tsv|json|geojson|zip|xlsx|parquet)$/i;
const POST_URL = /^https:\/\/datahub\.io\/blog\/([^/]+)\/_r\/-\/([^?#]+)/;

const result = (id, pass, message, severity = "fail") => ({ id, pass, severity, message });

// --- Package adapter: README + local files, in the shape the story checks take ---

// A reference -> { ref, local (path in the package, or null for an external URL), slug }.
export function resolveRef(ref) {
  const m = ref.match(POST_URL);
  if (m) return { ref, local: decodeURIComponent(m[2]), slug: m[1] };
  if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith("//") || ref.startsWith("#")) return { ref, local: null, slug: null };
  return { ref, local: normalize(decodeURIComponent(ref.replace(/[?#].*$/, ""))).replace(/^\.\//, ""), slug: null };
}

// Every image the README shows: Markdown images, <img src>, <source srcset/srcSet>.
export function packageImages(md) {
  const body = stripCode(blankFrontmatter(md));
  const refs = [];
  for (const m of body.matchAll(/!\[(?:[^\]\\]|\\.)*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) refs.push(m[1]);
  for (const m of body.matchAll(/<img\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/gi)) refs.push(m[1]);
  for (const m of body.matchAll(/<source\b[^>]*?\ssrcset\s*=\s*["']([^"']+)["']/gi)) {
    for (const cand of m[1].split(",")) if (cand.trim()) refs.push(cand.trim().split(/\s+/)[0]);
  }
  return [...new Map(refs.map((r) => [r, resolveRef(r)])).values()];
}

// Every link: Markdown [text](url) (not images) and <a href>.
export function packageLinks(md) {
  const body = stripCode(blankFrontmatter(md));
  const refs = [];
  for (const m of body.matchAll(/(?<!!)\[(?:[^\]\\]|\\.)*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) refs.push({ ref: m[1], index: m.index });
  for (const m of body.matchAll(/<a\b[^>]*?\shref\s*=\s*["']([^"']+)["']/gi)) refs.push({ ref: m[1], index: m.index });
  return refs.map(({ ref, index }) => ({ ...resolveRef(ref), line: body.slice(0, index).split("\n").length }));
}

export function frontmatterFields(md) {
  const fields = {};
  for (const m of splitFrontmatter(md).frontmatter.matchAll(/^([A-Za-z_][\w-]*):[ \t]*(.*)$/gm)) {
    fields[m[1]] = m[2].trim().replace(/^(["'])(.*)\1$/, "$2").trim();
  }
  return fields;
}

const inPackage = (dir, local) => !!local && !local.startsWith("..") && existsSync(join(dir, local));

// --- Checks ---

function checkFrontmatter(fields) {
  const missing = ["title", "description", "date"].filter((k) => !fields[k]);
  if (missing.length) return result("frontmatter", false, `front matter missing: ${missing.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date)) return result("frontmatter", false, `date "${fields.date}" is not YYYY-MM-DD`);
  return result("frontmatter", true, "title, description, date");
}

function checkNoH1(md) {
  const lines = stripCode(blankFrontmatter(md)).split("\n");
  const hits = [];
  lines.forEach((l, i) => {
    if (/^ {0,3}#(?:[ \t]|$)/.test(l) || /<h1\b/i.test(l)) hits.push(i + 1);
    else if (/^ {0,3}=+[ \t]*$/.test(l) && i > 0 && lines[i - 1].trim() && !/^ {0,3}[-*_>#]/.test(lines[i - 1])) hits.push(i);
  });
  return hits.length
    ? result("no-h1", false, `H1 at line ${hits.join(", ")}: DataHub shows the title from -t; start the README with the opening`)
    : result("no-h1", true, "no H1");
}

async function checkMdxCompiles(md) {
  const { error, mode } = await checkMdx(md, { compiler: await loadMdxCompiler() });
  return error
    ? result("mdx", false, `README fails DataHub MDX (${mode}) at line ${error.line}:${error.column}: ${error.message}`)
    : result("mdx", true, mode === "compile" ? "compiles (@mdx-js/mdx)" : "no MDX hazards (dependency-free scan; install site/stories for a full compile)");
}

function checkAutolinks(md) {
  const hits = mdxHazards(md).filter((h) => h.message.startsWith("autolink"));
  return hits.length
    ? result("autolinks", false, hits.map((h) => `line ${h.line}: ${h.message}`).join("; "))
    : result("autolinks", true, "no <https://...> autolinks");
}

function checkImages(dir, images) {
  const missing = images.filter((i) => i.local !== null && !inPackage(dir, i.local));
  const external = images.filter((i) => i.local === null);
  if (!images.length) return result("images", false, "README shows no images");
  if (missing.length) return result("images", false, `not in the package: ${missing.map((i) => i.local).join(", ")}`);
  return result("images", true, `${images.length - external.length} image(s) present${external.length ? `; ${external.length} external not checked` : ""}`);
}

// Every file is served at https://datahub.io/blog/<slug>/_r/-/<path>, so names must be URL-safe:
// a space broke the method PDF link and a shell-built manifest (china-co2-peak, 2026-11-08).
function checkFilenames(dir) {
  const bad = [];
  const walk = (rel) => {
    for (const e of readdirSync(join(dir, rel), { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      const path = rel ? `${rel}/${e.name}` : e.name;
      if (!/^[A-Za-z0-9._-]+$/.test(e.name)) bad.push(path);
      if (e.isDirectory()) walk(path);
    }
  };
  walk("");
  return bad.length
    ? result("filenames", false, `not URL-safe (use letters, digits, . _ -): ${bad.join(", ")}`)
    : result("filenames", true, "all file names URL-safe");
}

function checkDownloads(dir, links, images) {
  const data = links.filter((l) => DATA_EXT.test(l.ref.replace(/[?#].*$/, "")));
  const problems = [];
  for (const l of data) {
    if (!/^https:\/\/datahub\.io\//.test(l.ref)) problems.push(`line ${l.line}: ${l.ref} is not an absolute https://datahub.io/ URL (use https://datahub.io/blog/<slug>/_r/-/<path>)`);
    else if (l.slug && !inPackage(dir, l.local)) problems.push(`line ${l.line}: ${l.ref} -> ${l.local} is not in the package`);
  }
  const slugs = [...new Set([...links, ...images].map((r) => r.slug).filter(Boolean))];
  if (slugs.length > 1) problems.push(`links point at more than one post: ${slugs.join(", ")}`);
  return problems.length
    ? result("downloads", false, problems.join("; "))
    : result("downloads", true, `${data.length} data link(s) absolute${slugs.length ? ` (post ${slugs[0]})` : ""}`);
}

// S8: superlatives need their scope in the same sentence ("first time in this 1985–2025
// series", not "first time ever"); production reviews caught unscoped ones twice.
const SUPERLATIVE = /\b(?:first time|ever|all-time|record (?:high|low))\b/i;
const SCOPE = /\bsince \d{4}\b|\b\d{4}\s*[–-]\s*\d{4}\b|\b(?:this|these|the) (?:[\w-]+ )?(?:series|dataset|data|record)\b/i;
export function checkScopedSuperlatives(text) {
  const hits = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => SUPERLATIVE.test(s) && !SCOPE.test(s))
    .map((s) => s.trim().slice(0, 100));
  return hits.length
    ? result("S8", false, `superlative without a scope in the sentence (say "in this 1985–2025 series"): ${hits.map((h) => `"${h}"`).join("; ")}`, "warn")
    : result("S8", true, "superlatives carry their scope");
}

// Figure density. Blind judges said our stories "overload readers with figures": in the h2 held-out
// test the originals averaged 0.83 figures per sentence and 12% of sentences with 3+, ours 1.7 and
// 30% (Factory story-remakes rounds/h2/results.md). The thresholds sit between the two.
export const DENSITY_MAX_MEAN = 1.2;
export const DENSITY_MAX_SHARE3 = 0.15;
// A methods-type heading is one of these labels in full ("Data centres are growing" is a claim, kept).
const METHOD_HEADING = /^(?:how (?:this|we|it) (?:was made|made (?:this|it)|did (?:this|it))\b.*|(?:methods?|methodology|about (?:the|this|our) data|(?:the )?data(?: and (?:code|methods?|sources?))?|sources?(?: and (?:methods?|notes?|data))?|notes?|footnotes|references|acknowledge?ments|downloads?|friction notes)\s*[.:]?)$/i;
const CAPTION = /^(?:[*_]+)?(?:sources?|notes?|chart|data|credits?|photo)\s*:/i;
const ABBREVIATION = /(?:^|[\s(])(?:[A-Z]|U\.S|U\.K|e\.g|i\.e|vs|approx|Mr|Mrs|Ms|Dr|St|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.$/;

// Reader-prose sentences of a README: front matter, headings, methods/sources/notes sections (to
// the next heading of the same or higher level), tables, code, HTML, images, link text, footnote
// definitions and captions ("Source: ..." or "Note: ...", or a paragraph wholly in italics right
// after an image) are dropped; link text becomes the word "link", so a sentence never vanishes by
// being linked. Each paragraph or list item is split at . ! ? before a capital, digit, quote or
// bracket, except after a known abbreviation (U.S., e.g., a single initial). A sentence has at
// least two words and ends in . ! ? or has at least four words; shorter fragments are map labels.
export function proseSentences(md) {
  const lines = splitFrontmatter(md).body.replace(/<!--[\s\S]*?-->/g, " ").split("\n");
  const kept = [];
  let skipLevel = 0;
  let fence = false;
  for (const line of lines) {
    if (/^\s{0,3}(```|~~~)/.test(line)) { fence = !fence; kept.push(""); continue; }
    if (fence) continue;
    const h = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
    if (h) {
      if (skipLevel && h[1].length > skipLevel) continue;
      skipLevel = METHOD_HEADING.test(h[2].replace(/[*_`]/g, "").trim()) ? h[1].length : 0;
      kept.push("");
      continue;
    }
    if (skipLevel || /^\s*\|/.test(line) || /^\s*\[\^?[^\]]+\]:/.test(line)) { kept.push(""); continue; }
    kept.push(/^\s*(?:[-*+]|\d+\.)\s/.test(line) ? `\n${line}` : line);
  }
  const blocks = kept.join("\n").split(/\n\s*\n|\n(?=\s*(?:[-*+]|\d+\.)\s)/);
  const sentences = [];
  let afterImage = false;
  for (const block of blocks) {
    const isImage = /!\[|<(?:picture|img)\b/i.test(block);
    const prevImage = afterImage;
    if (block.trim()) afterImage = isImage;
    let text = block
      .replace(/!\[(?:[^\]\\]|\\.)*\]\([^)]*\)/g, " ")
      .replace(/\[(?:[^\]\\]|\\.)*\]\([^)]*\)/g, "link")
      .replace(/\[\^[^\]]*\]/g, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
      .replace(/^\s*>\s?/gm, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text || CAPTION.test(text) || (prevImage && /^([*_])[^*_][\s\S]*[^*_\s]\1$/.test(text))) continue;
    text = text.replace(/[*_]+/g, "").replace(/ +([.,;:!?])/g, " $1");
    const parts = text.split(/(?<=[.!?]["”’)]?)\s+(?=["“‘(]?[A-Z0-9$€£−-])/);
    const merged = [];
    for (const part of parts) {
      if (merged.length && ABBREVIATION.test(merged[merged.length - 1])) merged[merged.length - 1] += ` ${part}`;
      else merged.push(part);
    }
    const words = (t) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    sentences.push(...merged.map((t) => t.trim()).filter((t) => words(t) >= 4 || (words(t) >= 2 && /[.!?]["”’)]?$/.test(t))));
  }
  return sentences;
}

// Figures in one sentence: data numbers, percentages, money, bare years and date expressions, as
// story-check's S3 tokenizer reads them: "21 August 2026" is one figure, each end of a range is one
// ("2015–16", "10 to 20": two). Not figures: ordinals ("118th Congress"), rounding statements ("to
// the nearest 5"), digits inside names (G7, CO2, PM2.5, COVID-19), and numbers in words ("a fifth",
// "three times"), which writing.md rule 2 still counts. A numeric-token proxy for number load.
const UNIT_GLUED = /(?<![\p{L}\p{N}_.,#-])\d[\d,]*(?:\.\d+)?(?:°?[CF]|km|kg|mm|cm|GW|MW|TWh|GWh|kWh|Mt|Gt|ft|mph|ppm)(?![\p{L}\p{N}])/gu;
export function countFigures(sentence) {
  const glued = [...sentence.matchAll(UNIT_GLUED)].map((m) => ({ raw: m[0], kind: "number", index: m.index })); // "2.6C", "40GW"
  return [...tokenizeNumbers(sentence), ...glued].filter((t) => ["number", "year", "date"].includes(t.kind) && !/\p{L}[-‐]?$/u.test(sentence.slice(0, t.index))).length;
}

export function densityStats(md) {
  const scored = proseSentences(md).map((s) => ({ s, n: countFigures(s) }));
  const total = scored.length;
  const mean = total ? scored.reduce((a, x) => a + x.n, 0) / total : 0;
  const share3 = total ? scored.filter((x) => x.n >= 3).length / total : 0;
  const worst = [...scored].filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 5);
  return { sentences: total, mean, share3, worst };
}

export function checkDensity(md) {
  const { sentences, mean, share3, worst } = densityStats(md);
  const highMean = mean > DENSITY_MAX_MEAN;
  const highShare = share3 > DENSITY_MAX_SHARE3;
  const pct = (x) => `${Math.round(x * 100)}%`;
  if (!sentences) return result("density", false, "no reader prose found to measure", "warn");
  const summary = `${mean.toFixed(2)} figures per sentence${highMean ? ` (over ${DENSITY_MAX_MEAN})` : ""}; ${pct(share3)} of ${sentences} sentences carry 3+ figures${highShare ? ` (over ${pct(DENSITY_MAX_SHARE3)})` : ""}`;
  if (!highMean && !highShare) return result("density", true, `${summary} (warn above ${DENSITY_MAX_MEAN} or ${pct(DENSITY_MAX_SHARE3)})`, "warn");
  const list = worst.map((x) => `(${x.n}) "${x.s.length > 140 ? `${x.s.slice(0, 137)}...` : x.s}"`).join("; ");
  return result("density", false, `${summary}. Cut figures a chart already shows or the finding doesn't need. Densest: ${list}`, "warn");
}

// Measure fidelity: an independent, fresh-context reviewer lists each plain-words phrase for a measure
// or category against the source definition and flags mismatches (round 2, h1 and h2 D2 failures:
// "retail" for "retail and wholesale"; "held elections" for a year-end status, which the writer's own
// table had passed). Cheap and mechanical only: the reviewer's table exists (a "Reviewer:" line in the
// section), each row is complete, an unflagged phrase is in the published text (README with links
// unwrapped and comments dropped, plus the charts it embeds), and each flagged row's Resolution quotes
// the fixed wording ("fixed: ..."), which must be published while the flagged phrase, outside it, no
// longer is, unless the Resolution also says ok-elsewhere (the reviewer checked its other uses).
// The Reviewer line marks whose table it is; it can't prove independence or coverage, and whether each phrase matches its source is the reviewer's call.
const squash = (s) => s.toLowerCase().replace(/[*_`]/g, "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();
export const renderedText = (md) => md.replace(/<!--[\s\S]*?-->/g, " ").replace(/!?\[((?:[^\]\\]|\\.)*)\]\([^)]*\)/g, "$1").replace(/<[^>]+>/g, " ");
export function checkFidelity(dir, publishedText, notes) {
  const path = notes ? (existsSync(notes) ? notes : null) : [join(dir, "NOTES.md"), join(dir, "..", "NOTES.md")].find(existsSync);
  if (!path) return result("fidelity", false, "no NOTES.md in the package or the folder above: add the fidelity reviewer's table (SKILL.md step 4)", "warn");
  const section = readFileSync(path, "utf8").split(/^#{1,6}[ \t]+measure fidelity\b.*$/im)[1]?.split(/^#{1,6}[ \t]/m)[0] ?? "";
  const rows = section.split("\n").filter((l) => /^\s*\|/.test(l)).slice(2).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  if (!rows.length) return result("fidelity", false, `no "Measure fidelity" table with rows in ${path}`, "warn");
  if (!/^\s*\**Reviewer:?\**:?\s*\S/im.test(section)) return result("fidelity", false, `the "Measure fidelity" table in ${path} has no "Reviewer:" line: it must be built by a fresh-context reviewer, not the writer (SKILL.md step 4, references/cold-edit.md)`, "warn");
  const phrase = (cells) => cells[0].match(/^["“](.+)["”]$/)?.[1];
  const incomplete = rows.filter((cells) => !phrase(cells) || cells.length < 5 || cells.some((c) => !c));
  if (incomplete.length) return result("fidelity", false, `incomplete row(s) in ${path} (quote the phrase; fill every cell): ${incomplete.map((c) => c.join(" | ").slice(0, 60)).join("; ")}`, "warn");
  const text = squash(publishedText);
  const flagged = (cells) => !/^(?:none|no|ok|matches)\b/i.test(cells[3]);
  const fix = (cells) => cells[4].match(/^fixed\b[^"“]*["“]([^"”]+)["”]/i)?.[1];
  // A short phrase can be wrong in one sentence and right in another ("customs value", r4 smoke):
  // ok-elsewhere in the Resolution says the reviewer checked the remaining uses. The fix must still be published.
  const okElsewhere = (cells) => /(?:^|[;,.]\s*)ok-elsewhere:\s*["“][^"”]+["”]/i.test(cells[4]);
  const resolved = (c) => {
    const f = fix(c) && squash(fix(c));
    return f && text.includes(f) && (okElsewhere(c) || !text.split(f).join(" ").includes(squash(phrase(c))));
  };
  const unresolved = rows.filter((c) => flagged(c) && !resolved(c)).map(phrase);
  if (unresolved.length) return result("fidelity", false, `unresolved mismatch(es): fix the text, then write fixed: "<wording as published>" in the Resolution cell. The flagged phrase must be gone outside the fix, unless the reviewer confirms its other uses match the source: then append ; ok-elsewhere: "<where>" to the Resolution: ${unresolved.map((p) => `"${p}"`).join("; ")}`, "warn");
  const stale = rows.filter((c) => !flagged(c)).map(phrase).filter((p) => !text.includes(squash(p)));
  return stale.length
    ? result("fidelity", false, `phrases not found in the README or charts (re-run the review on the final text): ${stale.map((p) => `"${p}"`).join("; ")}`, "warn")
    : result("fidelity", true, `${rows.length} phrase(s) reviewed in ${path}, ${rows.filter(flagged).length} mismatch(es) fixed; whether each matches its source is the reviewer's call`);
}

// Which device each chart is shown on: X-mobile.svg is the phone variant, X.svg with
// such a sibling is desktop-only, anything else is shown on every screen.
export function chartRoles(localSvgs) {
  const set = new Set(localSvgs);
  return localSvgs.map((path) => ({
    path,
    role: /-mobile\.svg$/.test(path) ? "mobile" : set.has(path.replace(/\.svg$/, "-mobile.svg")) ? "desktop" : "only",
  }));
}

const asWarning = (r) => (r.pass ? r : { ...r, severity: "warn" });

// S4 in a throwaway copy, so the package itself is never written to.
function checkBuild(dir) {
  const script = readdirSync(dir).find((f) => f.endsWith("-make-charts.mjs"));
  if (!script) return result("S4", false, "no *-make-charts.mjs to rebuild", "warn");
  const ws = mkdtempSync(join(tmpdir(), "story-check-build-"));
  try {
    cpSync(dir, ws, { recursive: true, filter: (p) => !p.includes(`${join(dir, "node_modules")}`) });
    const modules = [join(dir, "node_modules"), STORIES_DIR && join(STORIES_DIR, "node_modules")].filter(Boolean).find(existsSync);
    if (modules) symlinkSync(modules, join(ws, "node_modules"), "dir");
    return checkReproducible({ workspace: ws, storiesDir: ".", slug: script.slice(0, -"-make-charts.mjs".length) });
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
}

export async function checkStoryPackage(packageDir, { build = false, notes = null } = {}) {
  const dir = resolve(packageDir); // a relative path broke --build: the node_modules symlink pointed nowhere
  const readmePath = join(dir, "README.md");
  if (!existsSync(readmePath)) return [result("readme", false, `no README.md in ${dir}`)];
  const md = readFileSync(readmePath, "utf8");
  const fields = frontmatterFields(md);
  const images = packageImages(md);
  const links = packageLinks(md);
  const localSvgs = [...new Set(images.filter((i) => i.local?.endsWith(".svg") && inPackage(dir, i.local)).map((i) => i.local))];
  const allSvgs = [...new Set([...localSvgs, ...readdirSync(dir).filter((f) => f.endsWith(".svg"))])];
  const prose = parseProse(md);
  const svgs = localSvgs.map((p) => ({ path: p, text: svgTexts(readFileSync(join(dir, p), "utf8")) }));
  const results = [
    checkFrontmatter(fields),
    checkNoH1(md),
    await checkMdxCompiles(md),
    checkAutolinks(md),
    checkImages(dir, images),
    checkDownloads(dir, links, images),
    checkFilenames(dir),
    asWarning(checkOpening({ prose })),
    asWarning(checkNumbers({ prose, svgs })),
    asWarning(/^\d{4}-\d{2}-\d{2}$/.test(fields.date ?? "") ? checkAsOf({ workspace: dir, storiesDir: ".", slug: "README", asOf: fields.date }) : result("S6", true, "not applicable: no front matter date")),
    checkSvgSanity({ storiesAbs: dir, images: allSvgs }),
    checkScopedSuperlatives(prose.mainText),
    checkDensity(md),
    checkFidelity(dir, [renderedText(md), ...svgs.map((s) => s.text.join(" "))].join(" "), notes && resolve(notes)),
    ...checkChartDesign(chartRoles(localSvgs).map(({ path, role }) => ({ path, role, svg: readFileSync(join(dir, path), "utf8") }))),
  ];
  if (build) results.push(checkBuild(dir));
  return results;
}

export function formatTable(dir, results) {
  const label = (r) => (r.pass ? "PASS" : r.severity === "fail" ? "FAIL" : "WARN");
  const w = Math.max(...results.map((r) => r.id.length));
  const fails = results.filter((r) => !r.pass && r.severity === "fail").length;
  const warns = results.filter((r) => !r.pass && r.severity !== "fail").length;
  return [
    `story-check ${dir}`,
    ...results.map((r) => `${label(r)}  ${r.id.padEnd(w)}  ${r.message}`),
    `RESULT: ${fails ? "FAIL" : "PASS"} (${fails} failing, ${warns} warning(s), ${results.length} checks)`,
  ].join("\n");
}

export async function main(args) {
  const at = args.indexOf("--notes");
  const notes = at >= 0 ? args[at + 1] : null;
  const dir = args.find((a, i) => !a.startsWith("--") && (at < 0 || i !== at + 1));
  if (!dir || (at >= 0 && !notes)) {
    console.error("usage: node scripts/story-check.mjs <post-dir> [--build] [--notes <NOTES.md>]");
    return 2;
  }
  const results = await checkStoryPackage(dir, { build: args.includes("--build"), notes });
  console.log(formatTable(dir, results));
  return results.some((r) => !r.pass && r.severity === "fail") ? 1 : 0;
}

const isEntryPoint = (() => {
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
})();
if (isEntryPoint) process.exit(await main(process.argv.slice(2)));
