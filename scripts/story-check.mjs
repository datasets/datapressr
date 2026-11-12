#!/usr/bin/env node
// Is a blog-format story package ready for `dh publish <dir> -p blog`?
//
//   node scripts/story-check.mjs <post-dir> [--build]     (npm run story-check -- <dir>)
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
//   S8           warn: "first time", "ever", "all-time" or "record high/low" with no scope in
//                the sentence ("since 1985", "1985–2025", "in this series/data/record")
//   chart-*      design checks on every chart SVG (scripts/svg-design.mjs; rules in
//                skills/story/references/charting.md): chart-frame (title, source,
//                accessible name), chart-text-size (>= 11 px rendered), chart-contrast
//                (4.5:1), chart-colour-blind, chart-accents, chart-mobile-height,
//                chart-mobile-key. FAIL for charts built with the template's frame()
//                (data-dp-frame); warnings for older charts. The last four always warn.
//   S4           with --build: the *-make-charts.mjs build, run twice offline in a
//                temp copy, reproduces the SVGs byte for byte
// Exits 1 when any fail-severity check fails. Runs from any directory, no install.
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkAsOf, checkNumbers, checkOpening, checkReproducible, checkSvgSanity, parseProse, splitFrontmatter, svgTexts } from "../evals/lib/checkers/story.mjs";
import { blankFrontmatter, checkMdx, mdxHazards, stripCode } from "./validate-datapackage.mjs";
import { checkChartDesign } from "./svg-design.mjs";

const here = dirname(fileURLToPath(import.meta.url));
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
  const { error, mode } = await checkMdx(md);
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
    const modules = [join(dir, "node_modules"), join(here, "..", "site", "stories", "node_modules")].find(existsSync);
    if (modules) symlinkSync(modules, join(ws, "node_modules"), "dir");
    return checkReproducible({ workspace: ws, storiesDir: ".", slug: script.slice(0, -"-make-charts.mjs".length) });
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
}

export async function checkStoryPackage(dir, { build = false } = {}) {
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

const isEntryPoint = (() => {
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
})();
if (isEntryPoint) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith("--"));
  if (!dir) {
    console.error("usage: node scripts/story-check.mjs <post-dir> [--build]");
    process.exit(2);
  }
  const results = await checkStoryPackage(dir, { build: args.includes("--build") });
  console.log(formatTable(dir, results));
  process.exit(results.some((r) => !r.pass && r.severity === "fail") ? 1 : 0);
}
