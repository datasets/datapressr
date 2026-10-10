// Assemble the critic-calibration runs for q01 (datapressr-hcn.8): the two historical France
// drafts as run-0 directories, extracted from their commits on main, plus run.json for the
// hand-written negative control. Re-runnable; writes only under this folder.
//
//   node evals/calibration/story/build-runs.mjs
//
// Draft 1: outline a153036, charts and make-charts 844796a, prose cbddc11 (review issue 5 pins).
// Draft 2: every site/stories/france-public-finances* file at cb2080d (the draft the owner's
// round-2 remarks were made on). Weak: a dataset tour with chart soup, written for this bead;
// its artefacts are committed directly and its SVGs come from its own make-charts script.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { caseHash, harnessVersion, sha256, skillVersion, treeHash } from "../../lib/versions.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: here, encoding: "utf8" }).trim();
const evalsDir = join(root, "evals");
const caseDir = join(evalsDir, "cases", "story", "q01-french-debt");
const kase = JSON.parse(readFileSync(join(caseDir, "case.json"), "utf8"));
const git = (args) => execFileSync("git", args, { cwd: root, maxBuffer: 64 * 1024 * 1024 });
const STORIES = "site/stories";
const SLUG = "france-public-finances";

const RUNS = [
  {
    run_id: "20261008-0000-q01-french-debt-historical-draft1-0",
    label: "France first draft (owner round 1)",
    started_at: "2026-10-08T00:00:00.000Z",
    skill_ref: "cbddc11",
    files: [
      [`${STORIES}/${SLUG}-outline.md`, "a153036"],
      [`${STORIES}/${SLUG}-make-charts.mjs`, "844796a"],
      [`${STORIES}/${SLUG}-gap.svg`, "844796a"],
      [`${STORIES}/${SLUG}-spending.svg`, "844796a"],
      [`${STORIES}/${SLUG}-deficits.svg`, "844796a"],
      [`${STORIES}/${SLUG}-debt.svg`, "844796a"],
      [`${STORIES}/${SLUG}-data.mjs`, "844796a"],
      [`${STORIES}/${SLUG}.md`, "cbddc11"],
    ],
  },
  {
    run_id: "20261008-0001-q01-french-debt-historical-draft2-0",
    label: "France second draft (owner round 2, held out)",
    started_at: "2026-10-08T00:01:00.000Z",
    skill_ref: "cb2080d",
    files: git(["ls-tree", "--name-only", "cb2080d", `${STORIES}/`]).toString().split("\n").filter((p) => p.startsWith(`${STORIES}/${SLUG}`)).map((p) => [p, "cb2080d"]),
  },
  {
    run_id: "20261010-0000-q01-french-debt-historical-weak-0",
    label: "Negative control: dataset tour, no argument, chart soup",
    started_at: "2026-10-10T00:00:00.000Z",
    skill_ref: "HEAD",
    files: null,
  },
];

function walk(dir, base = dir) {
  const out = [];
  for (const n of readdirSync(dir).sort()) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...walk(p, base));
    else out.push(relative(base, p).split(sep).join("/"));
  }
  return out;
}

const inputTrees = kase.inputs.map((i) => ({ ...i, tree: treeHash(root, i.commit, i.path) }));
const hash = caseHash(caseDir, inputTrees);
const harness = harnessVersion(root);

for (const r of RUNS) {
  const dir = join(here, "q01-french-debt", r.run_id);
  const art = join(dir, "artefacts");
  const sources = {};
  if (r.files) {
    for (const [path, commit] of r.files) {
      const dest = join(art, path);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, git(["show", `${commit}:${path}`]));
      sources[path] = commit;
    }
  } else if (!existsSync(art)) throw new Error(`${r.run_id}: hand-written artefacts missing`);
  const skill = skillVersion(root, "story", r.skill_ref);
  const artefacts = walk(art).map((p) => {
    const bytes = readFileSync(join(art, p));
    return { path: p, sha256: sha256(bytes), bytes: bytes.length };
  });
  const run = {
    run_id: r.run_id,
    case_id: kase.id,
    domain: kase.domain,
    case_hash: hash,
    calibration: { label: r.label, sources: r.files ? sources : "hand-written for datapressr-hcn.8" },
    skill: { ...skill, dirty: false },
    harness: { tree: harness.tree, dirty: harness.dirty, recipe_sha256: null },
    writer: { vendor: "historical", model: r.files ? "historical" : "hand-written", model_actual: null, cli_version: null, prompt_sha256: sha256("") },
    isolation: { canary_run_id: null, network: false, leaks: [] },
    started_at: r.started_at,
    duration_ms: 0,
    turns: null,
    cost_usd: null,
    cost_basis: null,
    usage: null,
    artefacts,
    transcript_sha256: null,
    workspace_sha256: null,
    flags: [],
  };
  writeFileSync(join(dir, "run.json"), `${JSON.stringify(run, null, 2)}\n`);
  console.log(`${r.run_id}: ${artefacts.length} artefacts`);
}
