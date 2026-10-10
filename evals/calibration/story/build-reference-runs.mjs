// Assemble the run-0 directories for the reference cases q03 and q04 (datapressr-hcn.16): each
// published story as a historical run, and each case's reference as a "reference" run whose prose
// is a plain-text rendering of the key findings recorded in case.json (link plus our own notes;
// the reference's text and charts are not copied). Re-runnable; writes only under this folder.
//
//   node evals/calibration/story/build-reference-runs.mjs
//
// q03-wti-negative: site/stories/oil-prices* as published on main (prose 20c6d1e, outline
// 6d44924, make-charts 90ea475, SVGs 8318e88); the story's data is oil-prices at 5d0799a, the
// case's input pin. q04-co2-rising: site/stories/keeling-* (prose 90ea475, outline c4c2a65, SVGs
// c7ecdda) and make-charts.mjs (90ea475, the pre-slug name); its data is co2-ppm at d478eed.

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { caseHash, harnessVersion, sha256, skillVersion, treeHash } from "../../lib/versions.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: here, encoding: "utf8" }).trim();
const evalsDir = join(root, "evals");
const git = (args) => execFileSync("git", args, { cwd: root, maxBuffer: 64 * 1024 * 1024 });
const S = "site/stories";

const RUNS = [
  {
    case_id: "q03-wti-negative",
    run_id: "20260918-0000-q03-wti-negative-historical-published-0",
    label: "Published story #3, WTI Went Negative. Brent Didn't.",
    started_at: "2026-09-18T00:00:00.000Z",
    skill_ref: "20c6d1e",
    files: [
      [`${S}/oil-prices.md`, "20c6d1e"],
      [`${S}/oil-prices-outline.md`, "6d44924"],
      [`${S}/oil-prices-make-charts.mjs`, "90ea475"],
      [`${S}/oil-prices-brent-wti.svg`, "8318e88"],
      [`${S}/oil-prices-daily-weekly.svg`, "8318e88"],
    ],
  },
  {
    case_id: "q03-wti-negative",
    run_id: "20200427-0000-q03-wti-negative-reference-eia-0",
    label: "Reference: EIA Today in Energy, 27 April 2020 (key findings as recorded in case.json)",
    started_at: "2020-04-27T00:00:00.000Z",
    reference: { index: 0, slug: "eia-wti-negative" },
  },
  {
    case_id: "q04-co2-rising",
    run_id: "20260830-0000-q04-co2-rising-historical-published-0",
    label: "Published story #1, The Keeling Curve",
    started_at: "2026-08-30T00:00:00.000Z",
    skill_ref: "90ea475",
    files: [
      [`${S}/keeling-curve.md`, "90ea475"],
      [`${S}/keeling-curve-outline.md`, "c4c2a65"],
      [`${S}/make-charts.mjs`, "90ea475"],
      [`${S}/keeling-annual.svg`, "c7ecdda"],
      [`${S}/keeling-seasonal.svg`, "c7ecdda"],
    ],
  },
  {
    case_id: "q04-co2-rising",
    run_id: "20250521-0000-q04-co2-rising-reference-climategov-0",
    label: "Reference: NOAA Climate.gov, Climate change: atmospheric carbon dioxide, 21 May 2025 (key findings as recorded in case.json)",
    started_at: "2025-05-21T00:00:00.000Z",
    reference: { index: 0, slug: "climategov-co2" },
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

// The reference as the critic sees it: title, then the key findings as a list. No charts.
function referenceProse(ref) {
  return [`---`, `title: ${JSON.stringify(ref.title)}`, `---`, ``, `Key findings of a published reference piece, as recorded by us. The original's prose and charts are not reproduced. Source: ${ref.url}`, ``, ...ref.key_findings.map((f) => `- ${f}`), ``].join("\n");
}

const harness = harnessVersion(root);

for (const r of RUNS) {
  const caseDir = join(evalsDir, "cases", "story", r.case_id);
  const kase = JSON.parse(readFileSync(join(caseDir, "case.json"), "utf8"));
  const hash = caseHash(caseDir, kase.inputs.map((i) => ({ ...i, tree: treeHash(root, i.commit, i.path) })));
  const dir = join(here, r.case_id, r.run_id);
  const art = join(dir, "artefacts");
  rmSync(art, { recursive: true, force: true });
  let sources;
  if (r.files) {
    sources = {};
    for (const [path, commit] of r.files) {
      const dest = join(art, path);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, git(["show", `${commit}:${path}`]));
      sources[path] = commit;
    }
  } else {
    const ref = kase.references[r.reference.index];
    const dest = join(art, S, `${r.reference.slug}.md`);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, referenceProse(ref));
    sources = { reference: ref.url, archive_url: ref.archive_url, rendered_from: `evals/cases/story/${r.case_id}/case.json references[${r.reference.index}].key_findings` };
  }
  // The reference runs have no skill; they record the skill at HEAD only because run.json needs one.
  const skill = skillVersion(root, "story", r.skill_ref ?? "HEAD");
  const artefacts = walk(art).map((p) => {
    const bytes = readFileSync(join(art, p));
    return { path: p, sha256: sha256(bytes), bytes: bytes.length };
  });
  const run = {
    run_id: r.run_id,
    case_id: kase.id,
    domain: kase.domain,
    case_hash: hash,
    calibration: { label: r.label, sources },
    skill: { ...skill, dirty: false },
    harness: { tree: harness.tree, dirty: harness.dirty, recipe_sha256: null },
    writer: r.files
      ? { vendor: "historical", model: "historical", model_actual: null, cli_version: null, prompt_sha256: sha256("") }
      : { vendor: "reference", model: "key-findings", model_actual: null, cli_version: null, prompt_sha256: sha256("") },
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
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "run.json"), `${JSON.stringify(run, null, 2)}\n`);
  console.log(`${r.run_id}: ${artefacts.length} artefacts`);
}
