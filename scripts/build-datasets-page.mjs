#!/usr/bin/env node
// Generate site/datasets.md from every datasets/**/datapackage.json.
//
//   node scripts/build-datasets-page.mjs           # rewrite site/datasets.md
//   node scripts/build-datasets-page.mjs --check   # exit 1 if it is stale
//
// Zero dependencies. Everything between the HAND_START and HAND_END markers in
// the existing page is kept verbatim, so hand-written notes survive a rebuild.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_URL = "https://github.com/datasets/datapressr";
const DATAHUB_URL = "https://datahub.io";
const PUBLICATION = "datapressr";

export const HAND_START = "<!-- hand-written:start (kept by scripts/build-datasets-page.mjs) -->";
export const HAND_END = "<!-- hand-written:end -->";

const STAGES = ["capture", "stub", "archived", "structured", "enriched", "monitored"];
const SKIP_DIRS = new Set(["node_modules", "archive", "data", ".git"]);

// Datasets published to the DataHub `datapressr` publication. Nothing in a
// datapackage.json records a publish, so this is the one hand-kept list:
// add a name here after `dh publish` succeeds.
export const PUBLISHED = new Set(["oil-prices", "co2-ppm", "france-public-finances", "airports", "population-growth", "tesla-quarterly-deliveries", "us-natural-hazard-statistics"]);

// Datasets wrangled with DataPressr that live in their own repos.
export const EXTERNAL = [
  {
    name: "project-drawdown",
    title: "Project Drawdown — Table of Solutions (2020)",
    summary: "82 ranked climate solutions with their total CO₂-equivalent reduction (gigatons, cumulative 2020–2050) under two scenarios, plus solution-to-sector links.",
    status: "structured",
    licences: [{ name: "PDDL-1.0", path: "https://opendatacommons.org/licenses/pddl/" }],
    source: { title: "Project Drawdown, 2020 review (via a community mirror)", path: "https://drawdown.org/" },
    repo: "https://github.com/datasets/project-drawdown",
  },
];

// First sentence of a description: stop at ". " + capital, but not after an
// initial or dotted abbreviation ("C. David", "U.S. Energy").
export function firstSentence(text) {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  const re = /\.\s+(?=[A-Z])/g;
  let m;
  while ((m = re.exec(s))) {
    const word = s.slice(0, m.index).split(" ").pop();
    if (word.length >= 2 && !word.includes(".")) return s.slice(0, m.index + 1);
  }
  return s;
}

function findPackages(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) findPackages(join(dir, entry.name), out);
    } else if (entry.name === "datapackage.json") {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function readStories(root) {
  const dir = join(root, "site", "stories");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md" && !f.endsWith("-outline.md"))
    .sort()
    .map((f) => {
      const text = readFileSync(join(dir, f), "utf8");
      const title = /^title:\s*(.+)$/m.exec(text)?.[1].trim().replace(/^"(.*)"$/, "$1") ?? f;
      return { file: f, title, text };
    })
    .filter((s) => !/^publish:\s*false\s*$/m.test(s.text.split(/^---$/m)[1] ?? "")); // drafts are not on the live site
}

export function collect(root) {
  const stories = readStories(root);
  const local = findPackages(join(root, "datasets")).map((file) => {
    const dir = dirname(file);
    const rel = relative(root, dir).split(sep).join("/");
    const pkg = JSON.parse(readFileSync(file, "utf8"));
    const mentions = new RegExp(`${rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[/)\\s"']|$)`);
    return {
      name: pkg.name,
      title: pkg.title ?? pkg.name,
      summary: firstSentence(pkg.description),
      status: pkg.status ?? "unknown",
      licences: (pkg.licenses ?? []).map((l) => ({ name: l.name ?? l.title, path: l.path })),
      source: pkg.sources?.[0] ? { title: pkg.sources[0].title, path: pkg.sources[0].path } : null,
      moreSources: Math.max(0, (pkg.sources?.length ?? 0) - 1),
      folder: `${REPO_URL}/tree/main/${rel}`,
      readme: existsSync(join(dir, "README.md")) ? `${REPO_URL}/blob/main/${rel}/README.md` : null,
      stories: stories.filter((s) => mentions.test(s.text)).map((s) => ({ title: s.title, path: `stories/${s.file}` })),
      datahub: PUBLISHED.has(pkg.name) ? `${DATAHUB_URL}/${PUBLICATION}/${pkg.name}` : null,
    };
  });
  const external = EXTERNAL.map((d) => ({ ...d, moreSources: 0, folder: null, readme: `${d.repo}/blob/main/README.md`, stories: [], datahub: PUBLISHED.has(d.name) ? `${DATAHUB_URL}/${PUBLICATION}/${d.name}` : null }));
  const rank = (s) => STAGES.indexOf(s);
  return [...local, ...external].sort((a, b) => rank(b.status) - rank(a.status) || a.title.localeCompare(b.title));
}

const link = (text, url) => (url ? `[${text}](${url})` : text);

function card(d) {
  const facts = [`**Status:** ${d.status}${d.repo ? " · own repo" : ""}`];
  if (d.licences.length) facts.push(`**Licence:** ${d.licences.map((l) => link(l.name, l.path)).join(" + ")}`);
  if (d.source) facts.push(`**Source:** ${link(d.source.title, d.source.path)}${d.moreSources ? ` (+${d.moreSources} more)` : ""}`);
  const links = [];
  if (d.datahub) links.push(link("DataHub", d.datahub));
  if (d.repo) links.push(link("repo", d.repo));
  if (d.folder) links.push(link("folder", d.folder));
  if (d.readme) links.push(link("README", d.readme));
  for (const s of d.stories) links.push(`story: ${link(s.title, s.path)}`);
  return [`## ${d.title}`, "", d.summary, "", facts.join(" · "), "", links.join(" · "), ""].join("\n");
}

export function handSection(existing) {
  const start = existing?.indexOf(HAND_START) ?? -1;
  const end = existing?.indexOf(HAND_END) ?? -1;
  if (start === -1 || end === -1 || end < start) return `${HAND_START}\n${HAND_END}`;
  return existing.slice(start, end + HAND_END.length);
}

export function render(datasets, existing) {
  const counts = STAGES.map((s) => [s, datasets.filter((d) => d.status === s).length]).filter(([, n]) => n);
  return [
    "---",
    "title: Datasets",
    "description: Datasets produced with the DataPressr skills, with lifecycle status and links.",
    "---",
    "",
    "# Datasets",
    "",
    `<!-- Generated by scripts/build-datasets-page.mjs from each datasets/**/datapackage.json. Edit those, then run \`npm run build:datasets-page\`; only the hand-written section at the end is kept as edited. -->`,
    "",
    `${datasets.length} datasets produced with the DataPressr skills: ${counts.map(([s, n]) => `${n} ${s}`).join(", ")}. Status follows the lifecycle \`${STAGES.join(" → ")}\`. A DataHub link means the dataset is published at datahub.io; the rest are in this repo or their own.`,
    "",
    ...datasets.map(card),
    handSection(existing),
    "",
  ].join("\n");
}

export function build(root, { check = false } = {}) {
  const target = join(root, "site", "datasets.md");
  const existing = existsSync(target) ? readFileSync(target, "utf8") : "";
  const next = render(collect(root), existing);
  const stale = next !== existing;
  if (stale && !check) writeFileSync(target, next);
  return { stale, next };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const check = process.argv.includes("--check");
  const { stale } = build(root, { check });
  if (check && stale) {
    console.error("site/datasets.md is stale: run `npm run build:datasets-page`.");
    process.exit(1);
  }
  console.log(check ? "site/datasets.md is up to date." : stale ? "Wrote site/datasets.md." : "site/datasets.md already up to date.");
}
