// Deterministic story checks (design section 5.1): does a story meet the story skill's own
// contract? Seven checks, each returning { id, pass, severity, message, evidence }:
//   S1 artefacts exist        S2 prose word count        S3 every prose number on a chart
//   S4 charts rebuild offline byte-identical               S5 inputs untouched
//   S6 no date after as_of    S7 embedded SVGs well formed (no NaN, undefined, leaked JS)
// The checks run against a *workspace*: a directory laid out like the writer's repo
// (site/stories/<slug>*, datasets/<name>/...). For a run, `materializeRunWorkspace` rebuilds it
// in a temp dir from the case inputs (git archive at their pinned commits) plus the run's
// artefacts. Plain Node, no dependencies.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const OFFLINE_PRELOAD = join(here, "offline-preload.mjs");
export const CHECK_IDS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7"];
const DEFAULT_WORDS = [300, 700];
const BUILD_TIMEOUT_MS = 60_000;

// --- Markdown helpers ---------------------------------------------------------

export function splitFrontmatter(md) {
  const m = md.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? { frontmatter: m[0], body: md.slice(m[0].length) } : { frontmatter: "", body: md };
}

const FRICTION_HEADING = /^#{1,6}\s+.*friction notes/i;

// Split the prose body into the reader-facing text and the friction-notes section (from a
// heading containing "Friction notes" to the next heading of the same or higher level).
export function splitFriction(body) {
  const lines = body.split("\n");
  const main = [];
  const friction = [];
  let level = 0;
  for (const line of lines) {
    const h = line.match(/^(#{1,6})\s/);
    if (h && FRICTION_HEADING.test(line)) {
      level = h[1].length;
      friction.push(line);
      continue;
    }
    if (level && h && h[1].length <= level) level = 0;
    (level ? friction : main).push(line);
  }
  return { main: main.join("\n"), friction: friction.join("\n") };
}

// Reader-visible text of a Markdown fragment: images (alt text) removed, links reduced to their
// text, HTML comments and tags removed, emphasis/heading/list markers dropped. URLs never count.
export function visibleText(md) {
  return md
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/!\[(?:[^\]\\]|\\.)*\]\([^)]*\)/g, " ")
    .replace(/\[((?:[^\]\\]|\\.)*)\]\([^)]*\)/g, "$1")
    .replace(/\[((?:[^\]\\]|\\.)*)\]\[[^\]]*\]/g, "$1")
    .replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, " ")
    .replace(/<https?:[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/[*_`~]+/g, "");
}

// Parse a story's prose file into the parts the checks need.
export function parseProse(md) {
  const { body } = splitFrontmatter(md);
  const { main, friction } = splitFriction(body);
  const images = [...main.matchAll(/!\[(?:[^\]\\]|\\.)*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map((m) => m[1]);
  // The exempt list (story-craft pattern 4): friction-notes lines that say "exempt", plus any
  // list items nested under such a line. Their numbers do not need to be on a chart.
  const exemptLines = [];
  const flines = friction.split("\n");
  for (let i = 0; i < flines.length; i++) {
    if (!/exempt/i.test(flines[i])) continue;
    exemptLines.push(flines[i]);
    const indent = flines[i].match(/^\s*/)[0].length;
    for (let j = i + 1; j < flines.length; j++) {
      const l = flines[j];
      if (l.trim() === "") break;
      if (l.match(/^\s*/)[0].length <= indent && /^\s*(?:[-*+]|\d+\.)\s/.test(l)) break;
      exemptLines.push(l);
      i = j;
    }
  }
  return { body, main, friction, images, mainText: visibleText(main), exemptText: visibleText(exemptLines.join("\n")) };
}

export function countWords(text) {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

// --- Dates --------------------------------------------------------------------

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTH_ALT = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";
const monthIndex = (name) => {
  const n = name.toLowerCase();
  return MONTHS.findIndex((m) => m.startsWith(n.slice(0, 3))) + 1;
};
const YEAR = "(1[89]\\d\\d|20\\d\\d|21\\d\\d)";
const DATE_PATTERNS = [
  // 2020-04-20, 2020-04
  { re: new RegExp(`(?<![\\w.-])${YEAR}-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\\d|3[01]))?(?![\\w-])`, "g"), parse: (m) => ({ y: +m[1], m: +m[2], d: m[3] ? +m[3] : null }) },
  // 20 April 2020, Monday 20 April (year optional), 20th April
  { re: new RegExp(`(?<![\\w.,])(0?[1-9]|[12]\\d|3[01])(?:st|nd|rd|th)?\\s+(${MONTH_ALT})\\b\\.?(?:,?\\s+${YEAR}(?![\\w]))?`, "gi"), parse: (m) => ({ y: m[3] ? +m[3] : null, m: monthIndex(m[2]), d: +m[1] }) },
  // April 20, 2020 / April 20 / April 2020
  { re: new RegExp(`\\b(${MONTH_ALT})\\.?\\s+(?:(0?[1-9]|[12]\\d|3[01])(?:st|nd|rd|th)?(?![\\d\\w])(?:,?\\s+${YEAR}(?![\\w]))?|${YEAR}(?![\\w]))`, "gi"), parse: (m) => ({ y: m[3] ? +m[3] : m[4] ? +m[4] : null, m: monthIndex(m[1]), d: m[2] ? +m[2] : null }) },
];

// Date expressions with their spans. Bare years are not included here (see tokenizeNumbers).
export function findDates(text) {
  const found = [];
  const taken = new Array(text.length).fill(false);
  for (const { re, parse } of DATE_PATTERNS) {
    for (const m of text.matchAll(re)) {
      const start = m.index;
      const end = start + m[0].length;
      if (taken.slice(start, end).some(Boolean)) continue;
      for (let i = start; i < end; i++) taken[i] = true;
      found.push({ raw: m[0], start, end, ...parse(m) });
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

// --- Numbers ------------------------------------------------------------------

const MAGNITUDES = { trillion: 1e12, tn: 1e12, billion: 1e9, bn: 1e9, million: 1e6, mn: 1e6, m: 1e6, thousand: 1e3, k: 1e3 };
const CURRENCY = { "€": "EUR", EUR: "EUR", "$": "USD", "US$": "USD", USD: "USD", "£": "GBP", GBP: "GBP" };
const NUMBER_RE = new RegExp(
  [
    "(?<![\\p{L}\\p{N}_.,#])", // not inside a word or another number; "#3" is a reference
    "(?<cur1>US\\$|\\$|€|£|(?:EUR|USD|GBP)\\s)?",
    "(?<sign>[-−](?=\\s?(?:US\\$|\\$|€|£)?\\d))?",
    "(?<cur2>US\\$|\\$|€|£)?",
    "(?<num>\\d{1,3}(?:[,\\u00a0\\u2009\\u202f]\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?|\\.\\d+)",
    "(?<pct>\\s?(?:%|per\\s?cent\\b|percent\\b|pp\\b|percentage points?\\b))?",
    "(?<mag>\\s?(?:trillion|billion|million|thousand)\\b|(?:tn|bn|mn|m|k)(?![\\p{L}]))?",
    "(?<cur3>\\s(?:EUR|USD|GBP)\\b)?",
    "(?<suffix>st|nd|rd|th|s)?(?![\\p{L}\\p{N}])",
  ].join(""),
  "gu",
);

// A statement of rounding precision ("rounded to 0.1% of GDP", "to the nearest 5", "to 1 decimal
// place", "2 significant figures") describes how numbers are shown, not a value in the data.
const PRECISION_BEFORE = /\b(?:round(?:ed|s|ing)?(?:\s+(?:up|down|off))?|accurate|precise|precision)\s+(?:to|of)\s+(?:within\s+)?(?:the\s+nearest\s+)?$/i;
const PRECISION_AFTER = /^\s*(?:decimal\s+places?|significant\s+(?:figures?|digits?)|d\.?p\.?|s\.?f\.?)(?![\p{L}])/iu;

// Every number token in `text`, classified. kind: "number" (a data number the prose must back
// with a chart), "year" (a bare 4-digit year 1800–2199), "date" (part of a date expression),
// "ordinal" (1st, 21st), "precision" (a rounding precision, above), or "reference" (#3). Thousands separators (comma, thin and no-break
// spaces), decimals, percentages, currencies (€, $, US$, £, EUR/USD) and magnitudes (trillion,
// billion/bn, million/m, thousand/k) are understood; the unicode minus counts as a sign.
export function tokenizeNumbers(text) {
  const tokens = [];
  const dates = findDates(text);
  let masked = text;
  for (const d of dates) {
    masked = masked.slice(0, d.start) + " ".repeat(d.end - d.start) + masked.slice(d.end);
    tokens.push({ raw: d.raw, kind: "date", index: d.start, date: { y: d.y, m: d.m, d: d.d } });
  }
  for (const m of masked.matchAll(NUMBER_RE)) {
    const g = m.groups;
    const raw = m[0].trim();
    const digits = g.num.replace(/[,\u00a0\u2009\u202f]/g, "");
    const mantissa = Number(digits);
    const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
    const magWord = g.mag ? g.mag.trim().toLowerCase() : null;
    const scale = magWord ? MAGNITUDES[magWord] : 1;
    const curRaw = (g.cur1 || g.cur2 || g.cur3 || "").trim();
    const currency = curRaw ? CURRENCY[curRaw] : null;
    const percent = Boolean(g.pct);
    const negative = Boolean(g.sign);
    let kind = "number";
    if (g.suffix && g.suffix !== "s") kind = "ordinal";
    else if (!currency && !percent && !magWord && !negative && decimals === 0 && !/[,\u00a0\u2009\u202f]/.test(g.num) && /^(1[89]\d\d|2[01]\d\d)$/.test(digits)) kind = "year";
    else if (g.suffix === "s") kind = "number"; // "1990s" is caught above as a year; "10s" is rare
    if (kind === "number" && (PRECISION_BEFORE.test(masked.slice(Math.max(0, m.index - 60), m.index)) || PRECISION_AFTER.test(masked.slice(m.index + m[0].length)))) kind = "precision";
    tokens.push({ raw, kind, index: m.index, mantissa, decimals, scale, value: mantissa * scale * (negative ? -1 : 1), currency, percent, negative });
  }
  return tokens.sort((a, b) => a.index - b.index);
}

// Does prose number p appear (possibly rounded by the prose) among the chart number tokens?
// Matches on absolute value: the prose carries the sign in words ("fell €11.5bn") as often as
// in digits. A prose number may round a chart value to its own precision, never the reverse.
export function numberOnChart(p, chartTokens) {
  const eps = 1e-9;
  return chartTokens.some((s) => {
    if (s.kind === "ordinal" || s.kind === "reference" || s.kind === "date" || s.kind === "precision") return false;
    if (p.percent && s.currency) return false;
    if (p.currency && s.percent) return false;
    if (p.currency && s.currency && p.currency !== s.currency) return false;
    const tolM = 0.5 * 10 ** -p.decimals + eps;
    // Same displayed magnitude, or the chart shows the bare figure under a unit in its title/axis.
    if (Math.abs(Math.abs(s.mantissa) - p.mantissa) <= tolM && (s.scale === p.scale || s.scale === 1 || p.scale === 1)) return true;
    // Different magnitude words for the same amount (€1.7 trillion vs €1,710bn).
    const tolV = tolM * p.scale;
    return s.scale !== 1 && p.scale !== 1 && Math.abs(s.mantissa * s.scale - p.mantissa * p.scale) <= tolV * (1 + eps);
  });
}

// --- SVG ----------------------------------------------------------------------

const decodeEntities = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&minus;/g, "−")
    .replace(/&euro;/g, "€")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

// The visible text of an SVG: the contents of its <text> elements (tspans joined), one entry
// per <text>. Tooltips (<title>) and aria-labels are not visible on a static image and do not count.
export function svgTexts(svg) {
  const out = [];
  for (const m of svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)) {
    const inner = m[1].replace(/<title\b[\s\S]*?<\/title>/g, "").replace(/<tspan\b[^>]*>/g, " ").replace(/<[^>]+>/g, "");
    const t = decodeEntities(inner).replace(/\s+/g, " ").trim();
    if (t) out.push(t);
  }
  return out;
}

// --- Filesystem helpers -------------------------------------------------------

function walk(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const st = lstatSync(p);
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) out.push(...walk(p, base));
    else out.push(relative(base, p).split(sep).join("/"));
  }
  return out;
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const gitBlobHash = (buf) => createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");

function git(root, args, opts = {}) {
  const res = spawnSync("git", args, { cwd: root, encoding: opts.encoding ?? "utf8", maxBuffer: 1 << 30, input: opts.input });
  if (res.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${res.stderr}`);
  return res.stdout;
}

// Find the story slug in a workspace's stories dir: the prose file (not README, not an outline).
export function detectSlug(storiesAbs) {
  if (!existsSync(storiesAbs)) return null;
  const names = readdirSync(storiesAbs);
  const prose = names.filter((n) => n.endsWith(".md") && !n.endsWith("-outline.md") && !["README.md", "DATA.md", "PROVENANCE.md"].includes(n)).map((n) => n.slice(0, -3));
  const outlines = names.filter((n) => n.endsWith("-outline.md")).map((n) => n.slice(0, -"-outline.md".length));
  const both = prose.filter((s) => outlines.includes(s));
  if (both.length === 1) return both[0];
  if (prose.length === 1) return prose[0];
  if (outlines.length === 1) return outlines[0];
  return both[0] ?? prose[0] ?? outlines[0] ?? null;
}

const result = (id, pass, message, evidence = null, severity = "fail") => ({ id, pass, severity, message, evidence });

// --- The seven checks -------------------------------------------------------------

// S1: the skill's artefacts are present.
export function checkArtefacts({ workspace, storiesDir, slug, dataMode }) {
  const sd = join(workspace, storiesDir);
  const missing = [];
  const need = [`${slug}-outline.md`, `${slug}-make-charts.mjs`, `${slug}.md`];
  for (const f of need) if (!existsSync(join(sd, f))) missing.push(`${storiesDir}/${f}`);
  let images = [];
  if (existsSync(join(sd, `${slug}.md`))) {
    images = parseProse(readFileSync(join(sd, `${slug}.md`), "utf8")).images.filter((p) => p.endsWith(".svg"));
  }
  const presentSvgs = images.filter((p) => !/^[a-z]+:/i.test(p) && existsSync(join(sd, p)));
  if (presentSvgs.length === 0) missing.push(`${storiesDir}/<chart>.svg embedded by the prose`);
  const brokenSvgs = images.filter((p) => !presentSvgs.includes(p));
  for (const p of brokenSvgs) missing.push(`${storiesDir}/${p} (embedded, not present)`);
  if (dataMode === "open") {
    const all = walk(workspace);
    if (!all.some((p) => basename(p) === "DATA.md")) missing.push("DATA.md");
    if (!existsSync(join(sd, `${slug}-src`, "PROVENANCE.md"))) missing.push(`${storiesDir}/${slug}-src/PROVENANCE.md`);
  }
  return missing.length
    ? result("S1", false, `missing artefacts: ${missing.join(", ")}`, { missing })
    : result("S1", true, `outline, chart build, ${presentSvgs.length} embedded SVG(s) and prose present`, { svgs: presentSvgs });
}

// S2: prose length, excluding frontmatter, alt text and friction notes.
export function checkWords({ prose, words = DEFAULT_WORDS }) {
  if (!prose) return result("S2", false, "no prose to count");
  const n = countWords(prose.mainText);
  const [min, max] = words;
  const pass = n >= min && n <= max;
  return result("S2", pass, `${n} words (budget ${min}–${max})`, { words: n, min, max });
}

// S3: every data number in the prose is on a chart or on the friction notes' exempt list.
export function checkNumbers({ prose, svgs }) {
  if (!prose) return result("S3", false, "no prose to check");
  const chartTokens = svgs.flatMap(({ text }) => text.flatMap((t) => tokenizeNumbers(t)));
  const exempt = tokenizeNumbers(prose.exemptText).filter((t) => t.kind === "number");
  const numbers = tokenizeNumbers(prose.mainText).filter((t) => t.kind === "number");
  const misses = [];
  for (const p of numbers) {
    if (numberOnChart(p, chartTokens)) continue;
    if (numberOnChart(p, exempt)) continue;
    const at = prose.mainText.slice(Math.max(0, p.index - 40), p.index + p.raw.length + 40).replace(/\s+/g, " ").trim();
    misses.push({ number: p.raw, context: at });
  }
  return misses.length
    ? result("S3", false, `${misses.length} of ${numbers.length} prose number(s) on no chart and not exempt: ${misses.map((m) => m.number).join(", ")}`, { misses, checked: numbers.length, exempt: exempt.map((t) => t.raw) })
    : result("S3", true, `all ${numbers.length} prose number(s) appear on a chart or the exempt list`, { checked: numbers.length, exempt: exempt.map((t) => t.raw) });
}

function svgHashes(dir) {
  const out = {};
  for (const p of walk(dir).filter((f) => f.endsWith(".svg"))) out[p] = sha256(readFileSync(join(dir, p)));
  return out;
}

function diffHashes(a, b) {
  const changed = [];
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[k] !== b[k]) changed.push(k);
  return changed.sort();
}

function runBuild(script, cwd) {
  const res = spawnSync(process.execPath, ["--import", pathToFileURL(OFFLINE_PRELOAD).href, script], {
    cwd,
    encoding: "utf8",
    timeout: BUILD_TIMEOUT_MS,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, TZ: "UTC", LANG: "C", NO_PROXY: "*" },
  });
  return { ok: res.status === 0, status: res.status, stderr: (res.stderr || String(res.error || "")).slice(-2000) };
}

// S4: the chart build, run twice offline, reproduces the committed SVGs byte for byte.
export function checkReproducible({ workspace, storiesDir, slug }) {
  const sd = join(workspace, storiesDir);
  const script = `${slug}-make-charts.mjs`;
  if (!existsSync(join(sd, script))) return result("S4", false, `no chart build ${storiesDir}/${script} to run`);
  const committed = svgHashes(sd);
  const first = runBuild(script, sd);
  if (!first.ok) return result("S4", false, `chart build failed offline (exit ${first.status})`, { stderr: first.stderr });
  const h1 = svgHashes(sd);
  const second = runBuild(script, sd);
  if (!second.ok) return result("S4", false, `second chart build failed offline (exit ${second.status})`, { stderr: second.stderr });
  const h2 = svgHashes(sd);
  const unstable = diffHashes(h1, h2);
  const drift = diffHashes(committed, h1);
  if (unstable.length) return result("S4", false, `two builds differ: ${unstable.join(", ")}`, { unstable, drift });
  if (drift.length) return result("S4", false, `rebuild differs from the committed SVGs: ${drift.join(", ")}`, { unstable, drift });
  return result("S4", true, `two offline builds reproduce ${Object.keys(h1).length} SVG(s) byte for byte`, { svgs: Object.keys(h1) });
}

// S5: every input is exactly as at its pinned commit (no edits, additions or deletions).
export function checkInputs({ workspace, inputs, root }) {
  if (!inputs.length) return result("S5", true, "no inputs to compare");
  const changes = [];
  for (const { path, commit } of inputs) {
    const baseline = {};
    for (const line of git(root, ["ls-tree", "-r", commit, "--", path]).split("\n")) {
      const m = line.match(/^\d+ blob ([0-9a-f]+)\t(.+)$/);
      if (m) baseline[m[2]] = m[1];
    }
    const now = {};
    for (const rel of walk(join(workspace, path))) {
      const p = `${path}/${rel}`;
      now[p] = gitBlobHash(readFileSync(join(workspace, p)));
    }
    for (const k of new Set([...Object.keys(baseline), ...Object.keys(now)])) {
      if (!(k in now)) changes.push({ path: k, change: "deleted" });
      else if (!(k in baseline)) changes.push({ path: k, change: "added" });
      else if (baseline[k] !== now[k]) changes.push({ path: k, change: "modified" });
    }
  }
  return changes.length
    ? result("S5", false, `${changes.length} input file(s) changed: ${changes.map((c) => `${c.path} (${c.change})`).join(", ")}`, { changes })
    : result("S5", true, `${inputs.length} input(s) identical to their pinned commits`);
}

function dateAfter(d, asOf) {
  const [y, m, day] = asOf.split("-").map(Number);
  if (d.y === null || d.y === undefined) return false;
  if (d.y !== y) return d.y > y;
  if (!d.m) return false;
  if (d.m !== m) return d.m > m;
  if (!d.d) return false;
  return d.d > day;
}

// S6: no date later than the case's as_of in the prose or the outline (links excluded).
export function checkAsOf({ workspace, storiesDir, slug, asOf }) {
  if (!asOf) return result("S6", true, "not applicable: the case has no as_of");
  const late = [];
  for (const f of [`${slug}.md`, `${slug}-outline.md`]) {
    const p = join(workspace, storiesDir, f);
    if (!existsSync(p)) continue;
    const text = visibleText(readFileSync(p, "utf8"));
    for (const t of tokenizeNumbers(text)) {
      const d = t.kind === "date" ? t.date : t.kind === "year" ? { y: t.mantissa, m: null, d: null } : null;
      if (d && dateAfter(d, asOf)) late.push({ file: `${storiesDir}/${f}`, date: t.raw });
    }
  }
  return late.length
    ? result("S6", false, `${late.length} date(s) after as_of ${asOf}: ${late.map((l) => l.date).join(", ")}`, { late })
    : result("S6", true, `no date after as_of ${asOf}`);
}

// Broken values in an SVG's markup. Attribute values (transforms, path data, coordinates, styles)
// must hold no NaN, Infinity or `undefined`, and no JavaScript function source: Observable Plot
// writes a function's source text into the SVG when one is passed for a constant-only option
// (dx, textAnchor, fontWeight). Visible <text> must not read NaN or undefined. The WWII run's
// legend sat at translate(NaN,-22) (datapressr-hcn.25).
const BAD_ATTR = [
  { what: "NaN", re: /\bNaN\b/ },
  { what: "Infinity", re: /\bInfinity\b/ },
  { what: "undefined", re: /\bundefined\b/ },
  { what: "function source", re: /=>|\bfunction\b\s*[\w$]*\s*\(/ },
];
const BAD_TEXT = BAD_ATTR.filter((b) => b.what === "NaN" || b.what === "undefined");

export function svgProblems(svg) {
  const problems = [];
  for (const tag of svg.matchAll(/<([A-Za-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
    for (const a of tag[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      const value = decodeEntities(a[2] ?? a[3]);
      for (const { what, re } of BAD_ATTR) if (re.test(value)) problems.push({ what, element: tag[1], attribute: a[1], value: value.slice(0, 120) });
    }
  }
  for (const t of svgTexts(svg)) for (const { what, re } of BAD_TEXT) if (re.test(t)) problems.push({ what, element: "text", attribute: null, value: t.slice(0, 120) });
  return problems;
}

// S7: every SVG the prose embeds is free of NaN, Infinity, undefined and leaked function source.
export function checkSvgSanity({ storiesAbs, images }) {
  const svgs = images.filter((p) => p.endsWith(".svg") && !/^[a-z]+:/i.test(p) && existsSync(join(storiesAbs, p)));
  const bad = [];
  for (const p of svgs) for (const prob of svgProblems(readFileSync(join(storiesAbs, p), "utf8"))) bad.push({ svg: p, ...prob });
  if (!bad.length) return result("S7", true, `${svgs.length} embedded SVG(s) free of NaN, Infinity, undefined and function source`, { svgs });
  const summary = [...new Set(bad.map((b) => `${b.svg}: ${b.what}${b.attribute ? ` in ${b.element}@${b.attribute}` : " in text"}`))];
  return result("S7", false, `${bad.length} broken value(s) in embedded SVGs: ${summary.slice(0, 5).join("; ")}${summary.length > 5 ? "; ..." : ""}`, { problems: bad.slice(0, 50), count: bad.length });
}

// Run all seven checks on a workspace. Options:
//   workspace   absolute path laid out like the writer's repo
//   storiesDir  where the story lives (default site/stories)
//   slug        story slug (detected from the prose file when omitted)
//   inputs      [{ path, commit }] compared against `root`'s git objects (S5)
//   root        git repository holding the input commits
//   asOf, dataMode, words ([min, max])
//   build       false skips S4 (for unit tests that need no chart toolchain)
export function checkStory({ workspace, storiesDir = "site/stories", slug, inputs = [], root, asOf, dataMode = "fixed", words = DEFAULT_WORDS, build = true }) {
  const sd = join(workspace, storiesDir);
  slug = slug ?? detectSlug(sd);
  if (!slug) return CHECK_IDS.map((id) => result(id, false, `no story found in ${storiesDir}`));
  const prosePath = join(sd, `${slug}.md`);
  const prose = existsSync(prosePath) ? parseProse(readFileSync(prosePath, "utf8")) : null;
  const svgs = (prose?.images ?? [])
    .filter((p) => p.endsWith(".svg") && existsSync(join(sd, p)))
    .map((p) => ({ path: p, text: svgTexts(readFileSync(join(sd, p), "utf8")) }));
  const results = [
    checkArtefacts({ workspace, storiesDir, slug, dataMode }),
    checkWords({ prose, words }),
    checkNumbers({ prose, svgs }),
    build ? checkReproducible({ workspace, storiesDir, slug }) : result("S4", true, "skipped (build: false)", null, "warn"),
    checkInputs({ workspace, inputs, root }),
    checkAsOf({ workspace, storiesDir, slug, asOf }),
    checkSvgSanity({ storiesAbs: sd, images: prose?.images ?? [] }),
  ];
  return results;
}

// --- Workspaces ---------------------------------------------------------------

// Link the chart toolchain (site/stories/node_modules) from `root` into a workspace, read-only use.
export function linkNodeModules(root, workspace, storiesDir = "site/stories") {
  const src = join(root, storiesDir, "node_modules");
  const dest = join(workspace, storiesDir, "node_modules");
  if (existsSync(src) && !existsSync(dest)) {
    mkdirSync(dirname(dest), { recursive: true });
    symlinkSync(src, dest, "dir");
  }
}

// Extract `path` at `commit` from `root` into `dest` with git archive.
export function archiveInto(root, commit, path, dest) {
  mkdirSync(dest, { recursive: true });
  const tar = spawnSync("git", ["archive", "--format=tar", commit, "--", path], { cwd: root, maxBuffer: 1 << 30 });
  if (tar.status !== 0) throw new Error(`git archive ${commit} ${path} failed: ${tar.stderr}`);
  const x = spawnSync("tar", ["-x", "-C", dest], { input: tar.stdout, maxBuffer: 1 << 30 });
  if (x.status !== 0) throw new Error(`tar -x failed: ${x.stderr}`);
}

// Rebuild a run's workspace in a temp dir: inputs at their pinned commits, then the run's
// artefacts on top (a changed input shows up because the artefact overwrites the baseline).
// `deleted` lists workspace paths the writer removed (when the collector records them), so a
// deleted input file is missing here too and S5 reports it.
export function materializeRunWorkspace({ root, runDir, inputs, deleted = [] }) {
  const ws = mkdtempSync(join(tmpdir(), "evals-check-"));
  for (const { path, commit } of inputs) archiveInto(root, commit, path, ws);
  for (const p of deleted) if (!p.split("/").includes("..")) rmSync(join(ws, p), { force: true });
  const art = join(runDir, "artefacts");
  if (existsSync(art)) cpSync(art, ws, { recursive: true });
  linkNodeModules(root, ws);
  return ws;
}

export function removeWorkspace(ws) {
  if (ws && ws.startsWith(tmpdir()) && statSync(ws).isDirectory()) rmSync(ws, { recursive: true, force: true });
}
