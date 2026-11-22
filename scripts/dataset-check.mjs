#!/usr/bin/env node
/**
 * dataset-check: the Commons dataset standard as code (docs/dataset-standard.md).
 *
 *   node scripts/dataset-check.mjs <dir> --new [--prepublish] [--live] [--json]
 *   node scripts/dataset-check.mjs <dir> [--live]            stock level, one dataset
 *   node scripts/dataset-check.mjs --org datasets --out dir  stock level, every repo
 *
 * Two levels. `--new` is the gate for datasets we add: every rule is an error.
 * The default (stock) level is the nightly watch over the existing Commons:
 * only what breaks a reader is an error, the rest of the standard is a warning.
 * Builds on validate-datapackage.mjs (rule 1) and adds the Commons rules.
 * Dependency-free apart from `git` (and a GITHUB_TOKEN for --org, optional).
 */
import { existsSync, readFileSync, readdirSync, statSync, mkdtempSync, rmSync, mkdirSync, writeFileSync, realpathSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { validateDatapackage, readmeMdxError } from "./validate-datapackage.mjs";

export const OPEN_LICENSES = new Set([
  "CC0-1.0", "PDDL-1.0", "CC-BY-4.0", "CC-BY-3.0", "ODC-BY-1.0", "ODbL-1.0",
  "CC-BY-SA-4.0", "OGL-UK-3.0", "US-PD", "other-pd",
]);
// Lenient matching for the stock, whose licences predate the allowlist spelling.
const LICENSE_ALIASES = {
  "cc0": "CC0-1.0", "cc0-1.0": "CC0-1.0", "pddl": "PDDL-1.0", "pddl-1.0": "PDDL-1.0", "odc-pddl": "PDDL-1.0",
  "odc-pddl-1.0": "PDDL-1.0", "cc-by": "CC-BY-4.0", "cc-by-4.0": "CC-BY-4.0", "cc-by-3.0": "CC-BY-3.0",
  "odc-by": "ODC-BY-1.0", "odc-by-1.0": "ODC-BY-1.0", "odbl": "ODbL-1.0", "odbl-1.0": "ODbL-1.0",
  "odc-odbl": "ODbL-1.0", "odc-odbl-1.0": "ODbL-1.0", "cc-by-sa-4.0": "CC-BY-SA-4.0",
  "ogl-uk-3.0": "OGL-UK-3.0", "us-pd": "US-PD", "other-pd": "other-pd", "public domain": "other-pd",
};
export const CADENCE_DAYS = { daily: 1, weekly: 7, monthly: 31, quarterly: 92, annual: 366 };
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const GIT_SYNC_JUNK = ["archive", "scripts", "AGENTS.md", "node_modules", "package.json", "package-lock.json"];
const CORE_URL = "https://datahub.io/core";
const UA = { "user-agent": "datasets-commons-dataset-check" };

export function normaliseLicense(l) {
  const raw = String(l?.name ?? l?.id ?? l?.type ?? "").trim();
  if (OPEN_LICENSES.has(raw)) return raw;
  return LICENSE_ALIASES[raw.toLowerCase()] ?? null;
}

/** Rough cadence of a GitHub Actions cron line: daily / weekly / monthly / quarterly. */
export function cronCadence(cron) {
  const f = cron.trim().split(/\s+/);
  if (f.length < 5) return null;
  const [, , dom, month, dow] = f;
  if (month !== "*") return month.includes(",") || month.includes("/") ? "quarterly" : "annual";
  if (dom !== "*") return "monthly";
  if (dow !== "*" && !dow.includes(",") && !dow.includes("-")) return "weekly";
  return "daily";
}

/** Scheduled workflows in a dataset: [{file, cadence}]. */
export function scheduledWorkflows(dir) {
  const wfDir = join(dir, ".github", "workflows");
  if (!existsSync(wfDir)) return [];
  const out = [];
  for (const f of readdirSync(wfDir)) {
    if (!/\.ya?ml$/.test(f)) continue;
    const text = readFileSync(join(wfDir, f), "utf8");
    const m = text.match(/^\s*schedule:\s*\n\s*-\s*cron:\s*['"]?([^'"\n]+)['"]?/m);
    if (m) out.push({ file: `.github/workflows/${f}`, cadence: cronCadence(m[1]) });
  }
  return out;
}

/** Files under dir (relative paths), skipping .git and node_modules. */
function walk(dir, rel = "") {
  const out = [];
  for (const e of readdirSync(join(dir, rel), { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const p = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(dir, p));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/**
 * Check one dataset directory. Pure apart from reading files; network and git
 * facts come in through `facts` so tests can pin them.
 * @param {string} dir
 * @param {{level?: "new"|"stock", repoName?: string, facts?: {lastDataCommit?: string|null, now?: Date, lastRun?: {conclusion: string, at: string}|null}}} opts
 * @returns {{errors: string[], warnings: string[], notes: string[], upkeep: string}}
 */
export function checkDataset(dir, { level = "stock", repoName, facts = {} } = {}) {
  const isNew = level === "new";
  const errors = [], warnings = [], notes = [];
  const rule = (isError, msg) => (isError ? errors : warnings).push(msg);
  const name = repoName ?? basename(resolve(dir));

  // Rule 1: the validator. At stock level, value-level findings (CSV cells not
  // matching a legacy schema) are warnings; metadata and README errors stay errors.
  const meta = validateDatapackage(dir, { data: false });
  errors.push(...meta.errors);
  for (const w of meta.warnings.filter((w) => !/licenses|sources|schema|primaryKey|no `type`|same name as the package/.test(w))) {
    // Legacy Commons packages predate the DataPressr lifecycle `status`.
    if (!isNew && /`status`/.test(w)) notes.push(w);
    else warnings.push(w);
  }
  notes.push(...meta.notes);
  if (meta.errors.some((e) => e.startsWith("datapackage.json"))) {
    return { errors, warnings, notes, upkeep: "unknown" };
  }
  const full = validateDatapackage(dir, { data: true });
  const valueErrors = full.errors.filter((e) => !meta.errors.includes(e));
  const valueWarnings = full.warnings.filter((w) => !meta.warnings.includes(w));
  if (isNew) errors.push(...valueErrors);
  else if (valueErrors.length) warnings.push(`${valueErrors.length} data value(s) don't match the schema; first: ${valueErrors[0]}`);
  warnings.push(...valueWarnings);

  const pkg = JSON.parse(readFileSync(join(dir, "datapackage.json"), "utf8"));
  const resources = Array.isArray(pkg.resources) ? pkg.resources : [];

  // Rule 2: name matches the repo; title and description.
  if (pkg.name && pkg.name !== name) rule(isNew, `\`name\` "${pkg.name}" differs from the repo name "${name}"`);
  for (const f of ["title", "description"]) if (!pkg[f]) rule(isNew, `\`${f}\` is missing`);

  // Rule 3: open licence.
  const licenses = Array.isArray(pkg.licenses) ? pkg.licenses : [];
  if (licenses.length === 0) rule(isNew, "no `licenses`: an open licence is required (standard rule 3)");
  else if (!licenses.some((l) => (isNew ? OPEN_LICENSES.has(l.name) : normaliseLicense(l)))) {
    rule(isNew, `licence ${licenses.map((l) => JSON.stringify(l.name ?? l.id ?? l.type)).join(", ")} is not on the open allowlist (${[...OPEN_LICENSES].join(", ")}); an unclear licence goes to a human`);
  }

  // Rule 4: clear primary source.
  const sources = Array.isArray(pkg.sources) ? pkg.sources : [];
  if (!sources.some((s) => /^https?:\/\//.test(s?.path ?? ""))) rule(isNew, "no `sources` entry with an http(s) `path`: a clear primary source is required (standard rule 4)");

  // Rule 5: typed schemas and keys (the validator's own warnings, promoted for new).
  for (const w of meta.warnings.filter((w) => /schema|primaryKey|no `type`/.test(w))) rule(isNew, w);

  // Rules 6 and 7: upkeep declared, living stays fresh.
  const upkeep = pkg.upkeep;
  const scheduled = scheduledWorkflows(dir);
  let mode = upkeep?.mode;
  let cadence = upkeep?.refresh;
  if (!upkeep) {
    rule(isNew, "no `upkeep`: declare `{\"mode\": \"frozen\", \"snapshot\": \"YYYY-MM-DD\"}` or `{\"mode\": \"living\", \"refresh\": \"<cadence>\", \"workflow\": \"<file>\"}` (standard rule 6)");
    if (scheduled.length) { mode = "living (inferred)"; cadence = scheduled[0].cadence; }
    else mode = "frozen (inferred)";
  } else if (upkeep.mode === "frozen") {
    if (!isDate(upkeep.snapshot)) rule(isNew, "`upkeep.snapshot` must be the snapshot date (YYYY-MM-DD) for a frozen dataset");
  } else if (upkeep.mode === "living") {
    if (!CADENCE_DAYS[upkeep.refresh]) rule(isNew, `\`upkeep.refresh\` must be one of ${Object.keys(CADENCE_DAYS).join(", ")}`);
    if (!upkeep.workflow || !existsSync(join(dir, upkeep.workflow))) rule(isNew, `\`upkeep.workflow\` "${upkeep.workflow ?? ""}" does not exist: a living dataset needs its refresh job`);
    else if (!scheduled.some((s) => s.file === upkeep.workflow)) rule(isNew, `\`upkeep.workflow\` ${upkeep.workflow} has no \`schedule:\` cron`);
    if (pkg.status !== "monitored") rule(isNew, "a living dataset sets `status: \"monitored\"`");
  } else {
    rule(isNew, `\`upkeep.mode\` "${upkeep.mode}" must be "frozen" or "living"`);
  }
  if (String(mode).startsWith("living") && CADENCE_DAYS[cadence] && facts.lastDataCommit === undefined && facts.remote) {
    warnings.push("freshness not checked: could not read the commit history of data/ (check incomplete)");
  }
  if (String(mode).startsWith("living") && CADENCE_DAYS[cadence] && facts.lastDataCommit !== undefined) {
    const declared = mode === "living";
    if (facts.lastDataCommit === null) rule(declared, "living dataset: no commit touching data/ found");
    else {
      const ageDays = ((facts.now ?? new Date()) - new Date(facts.lastDataCommit)) / 864e5;
      const limit = 2 * CADENCE_DAYS[cadence];
      if (ageDays > limit) rule(declared, `stale: ${mode} dataset refreshed ${cadence}, but data/ last changed ${Math.floor(ageDays)} days ago (${facts.lastDataCommit.slice(0, 10)}); limit ${limit} days`);
    }
  }
  if (facts.lastRun && facts.lastRun.conclusion && !["success", "skipped", "neutral"].includes(facts.lastRun.conclusion)) {
    errors.push(`refresh job failing: last scheduled run ${facts.lastRun.conclusion} on ${String(facts.lastRun.at).slice(0, 10)}`);
  }

  // Rules 8 and 9: README shape.
  const readmePath = join(dir, "README.md");
  if (!existsSync(readmePath)) errors.push("no root README.md: the DataHub page is a 404 without it");
  else {
    const readme = readFileSync(readmePath, "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
    const body = readme.replace(/```[\s\S]*?```/g, "");
    if (/^# /m.test(body)) rule(isNew, "README.md has an H1: DataHub already shows the title, so start with text or `##`");
    if (!/^##\s+What stands out\b/im.test(body)) rule(isNew, "README.md has no `## What stands out` section (one striking fact, with its number)");
    if (!/^##\s+Source and licen[cs]e\b/im.test(body)) rule(isNew, "README.md has no `## Source and licence` section");
    if (isNew && !/frozen snapshot|updated\s+(daily|weekly|monthly|quarterly|annually|every)/i.test(body)) {
      errors.push("README.md doesn't say how the data is kept: \"frozen snapshot\" or \"updated <cadence>\" (standard rule 9)");
    }
  }

  // Rule 10: git sync ships only the dataset.
  if (isNew) {
    const junk = GIT_SYNC_JUNK.filter((p) => existsSync(join(dir, p)));
    for (const f of readdirSync(dir)) if (/^build\.(ts|js|mjs|py)$/.test(f)) junk.push(f);
    if (junk.length) {
      let excluded = [];
      try { excluded = JSON.parse(readFileSync(join(dir, "config.json"), "utf8")).contentExclude ?? []; } catch {}
      const missing = junk.filter((p) => !excluded.some((e) => e.replace(/^\/|\/$/g, "") === p));
      if (missing.length) errors.push(`config.json \`contentExclude\` must list ${missing.join(", ")} (DataHub's git sync ignores .datahubignore)`);
    }
  }

  // Rule 11: sizes, package-named resource, views.
  for (const f of walk(dir)) {
    if (statSync(join(dir, f)).size > MAX_FILE_BYTES) rule(isNew, `${f} is over 50 MB`);
  }
  for (const w of meta.warnings.filter((w) => /same name as the package/.test(w))) rule(isNew, w);
  const resourceNames = new Set(resources.map((r) => r.name));
  for (const [i, v] of (Array.isArray(pkg.views) ? pkg.views : []).entries()) {
    for (const rn of [].concat(v.resources ?? v.resourceName ?? [])) {
      if (typeof rn === "string" && !resourceNames.has(rn)) rule(isNew, `view ${v.name ?? i} names resource "${rn}", which doesn't exist (DataHub shows "Resource not found for view")`);
    }
  }

  // Rule 12: check-on-push workflow.
  if (isNew) {
    const wf = join(dir, ".github", "workflows", "dataset-check.yml");
    const text = existsSync(wf) ? readFileSync(wf, "utf8") : "";
    if (!text) errors.push("no .github/workflows/dataset-check.yml: new datasets run this checker on every push (standard rule 12)");
    else if (!/^\s*push\s*:/m.test(text) || !/dataset-check\.mjs/.test(text)) errors.push(".github/workflows/dataset-check.yml must run dataset-check.mjs on `push` (standard rule 12)");
  }

  return { errors, warnings, notes, upkeep: cadence ? `${mode}, ${cadence}` : String(mode) };
}

/** Rules 13 and 14: what datahub.io/core/<name> shows. */
export async function checkCorePage(name, { expect = "live" } = {}) {
  let res;
  try { res = await fetch(`${CORE_URL}/${name}`, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(60000) }); }
  catch (e) { return [`could not reach ${CORE_URL}/${name}: ${e.message}`]; }
  if (expect === "free") {
    return res.status === 404 ? [] : [`${CORE_URL}/${name} already exists (HTTP ${res.status}): pick another name; linking would overwrite it`];
  }
  if (res.status !== 200) return [`${CORE_URL}/${name} returns HTTP ${res.status}`];
  const html = await res.text();
  const out = [];
  if (/Error parsing MDX/i.test(html)) out.push(`${CORE_URL}/${name} shows "Error parsing MDX"`);
  if (/Resource not found for view/i.test(html)) out.push(`${CORE_URL}/${name} shows "Resource not found for view"`);
  return out;
}

// --- GitHub facts for the stock run -------------------------------------------

async function gh(path) {
  const headers = { ...UA, accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  for (let attempt = 1; ; attempt++) {
    let res;
    try { res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(30000) }); }
    catch (e) { if (attempt < 3) { await sleep(2000 * attempt); continue; } throw e; }
    if (res.ok) return res.json();
    // Rate limited: wait for the reset (capped), then retry.
    if ((res.status === 403 || res.status === 429) && attempt < 3) {
      const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000 - Date.now();
      await sleep(Math.min(Math.max(reset, 5000), 300000));
      continue;
    }
    if (res.status >= 500 && attempt < 3) { await sleep(2000 * attempt); continue; }
    throw new Error(`GitHub ${path}: HTTP ${res.status}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function listOrgRepos(org) {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await gh(`/orgs/${org}/repos?type=public&per_page=100&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos.filter((r) => !r.archived && !r.fork);
}

async function lastDataCommit(org, repo) {
  const commits = await gh(`/repos/${org}/${repo}/commits?path=data&per_page=1`);
  return commits[0]?.commit?.committer?.date ?? null;
}

async function lastScheduledRun(org, repo, workflowFile) {
  const runs = await gh(`/repos/${org}/${repo}/actions/workflows/${basename(workflowFile)}/runs?event=schedule&status=completed&per_page=1`);
  const r = runs.workflow_runs?.[0];
  return r ? { conclusion: r.conclusion, at: r.created_at } : null;
}

/** Stock run over every public repo in an org that has a datapackage.json. */
export async function checkOrg(org, { skip = new Set(), limit = Infinity, log = () => {}, checkpoint = () => {} } = {}) {
  const repos = (await listOrgRepos(org)).filter((r) => !skip.has(r.name)).slice(0, limit);
  const results = [];
  const work = mkdtempSync(join(tmpdir(), "dataset-check-"));
  try {
    for (const repo of repos) {
      const dir = join(work, repo.name);
      const row = { name: repo.name, url: `https://github.com/${org}/${repo.name}`, page: `${CORE_URL}/${repo.name}` };
      try {
        // Files over 50 MB are reported, not downloaded: clone without blobs that
        // big or a checkout, then check out everything else (a plain checkout
        // would fetch the filtered blobs back).
        const git = (args, timeout = 120000) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout, env: { ...process.env, GIT_LFS_SKIP_SMUDGE: "1" } });
        git(["clone", "--quiet", "--depth", "1", "--no-checkout", "--filter=blob:limit=50m", `https://github.com/${org}/${repo.name}.git`, dir]);
        const big = git(["-C", dir, "ls-tree", "-r", "-l", "HEAD"]).split("\n")
          .map((l) => l.match(/^\S+ blob \S+\s+(\d+)\t(.+)$/)).filter((m) => m && Number(m[1]) > 50 * 1024 * 1024).map((m) => m[2]);
        if (big.length) {
          git(["-C", dir, "sparse-checkout", "set", "--no-cone", "/*", ...big.map((f) => `!/${f}`)]);
          row.bigFiles = big;
        }
        git(["-C", dir, "checkout", "--quiet"]);
        // DataHub reads datapackage.yml too; convert it in the throwaway clone.
        const yml = ["datapackage.yml", "datapackage.yaml"].find((f) => existsSync(join(dir, f)));
        if (!existsSync(join(dir, "datapackage.json")) && yml) {
          try {
            execFileSync("python3", ["-c", "import json,sys,yaml; json.dump(yaml.safe_load(open(sys.argv[1])), open(sys.argv[2], 'w'), default=str)", join(dir, yml), join(dir, "datapackage.json")], { stdio: "ignore" });
          } catch {}
        }
        if (!existsSync(join(dir, "datapackage.json"))) {
          results.push({ ...row, status: "skip", errors: [], warnings: ["no datapackage.json (catalog, tooling or not a dataset yet)"], notes: [], upkeep: "-" });
          continue;
        }
        const pkg = JSON.parse(readFileSync(join(dir, "datapackage.json"), "utf8"));
        const facts = { remote: true, lastDataCommit: await lastDataCommit(org, repo.name).catch(() => undefined) };
        const wf = pkg.upkeep?.workflow ?? scheduledWorkflows(dir)[0]?.file;
        let runUnknown = false;
        if (wf) facts.lastRun = await lastScheduledRun(org, repo.name, wf).catch(() => { runUnknown = true; return null; });
        const r = checkDataset(dir, { level: "stock", repoName: repo.name, facts });
        // Big files skipped above look "missing" to the validator; say what happened instead.
        for (const f of row.bigFiles ?? []) {
          r.errors = r.errors.filter((e) => !e.includes(`"${f}" does not exist`));
          r.warnings.push(`${f} is over 50 MB (not downloaded; values not checked)`);
        }
        if (runUnknown) r.warnings.push(`refresh job not checked: could not read the runs of ${wf} (check incomplete)`);
        r.errors.push(...(await checkCorePage(repo.name)));
        results.push({ ...row, status: r.errors.length ? "fail" : r.warnings.length ? "warn" : "pass", ...r });
      } catch (e) {
        results.push({ ...row, status: "fail", errors: [`check crashed: ${e.message}`], warnings: [], notes: [], upkeep: "unknown" });
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
      log(`${results.at(-1).status.padEnd(4)} ${repo.name}`);
      checkpoint(results);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  return results;
}

export function formatStockReport(results, { date = new Date().toISOString().slice(0, 10), partial = false } = {}) {
  const count = (s) => results.filter((r) => r.status === s).length;
  const lines = [
    `# Commons dataset check, ${date}`,
    "",
    `Standard: https://github.com/datasets/datapressr/blob/main/docs/dataset-standard.md (stock level).`,
    "",
    ...(partial ? ["**Partial: the run stopped before every repo was checked.**", ""] : []),
    `${results.length} repos: ${count("fail")} fail, ${count("warn")} warn, ${count("pass")} pass, ${count("skip")} skipped (no datapackage.json).`,
    "",
    "| Dataset | Status | Upkeep | Errors | First finding |",
    "|---|---|---|---|---|",
  ];
  const order = { fail: 0, warn: 1, pass: 2, skip: 3 };
  for (const r of [...results].sort((a, b) => order[a.status] - order[b.status] || a.name.localeCompare(b.name))) {
    const first = (r.errors[0] ?? r.warnings[0] ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 160);
    lines.push(`| [${r.name}](${r.url}) | ${r.status} | ${r.upkeep} | ${r.errors.length} | ${first} |`);
  }
  return lines.join("\n") + "\n";
}

function formatOne(dir, level, r) {
  const lines = [`dataset-check (${level}): ${dir}`];
  if (r.errors.length === 0) lines.push("✓ no errors");
  for (const e of r.errors) lines.push(`✗ ${e}`);
  for (const w of r.warnings) lines.push(`⚠ ${w}`);
  for (const n of r.notes) lines.push(`· note: ${n}`);
  lines.push("", `${r.errors.length} error(s), ${r.warnings.length} warning(s); upkeep: ${r.upkeep}`);
  return lines.join("\n");
}

const isEntryPoint = (() => {
  try { return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; }
})();
if (isEntryPoint) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  const json = args.includes("--json");
  if (args.includes("--org")) {
    const org = opt("--org");
    const out = opt("--out");
    const limit = opt("--limit") ? Number(opt("--limit")) : Infinity;
    const skip = new Set((opt("--skip") ?? "").split(",").filter(Boolean));
    const save = (results, partial) => {
      if (!out) return;
      mkdirSync(out, { recursive: true });
      writeFileSync(join(out, "report.md"), formatStockReport(results, { partial }));
      writeFileSync(join(out, "report.json"), JSON.stringify(results, null, 2) + "\n");
    };
    // Checkpoint after every repo, so a run cut short still leaves a report.
    const results = await checkOrg(org, { skip, limit, log: (l) => console.error(l), checkpoint: (r) => save(r, true) });
    save(results, false);
    const report = formatStockReport(results);
    console.log(json ? JSON.stringify(results, null, 2) : report);
    process.exit(results.some((r) => r.status === "fail") ? 1 : 0);
  }
  const optionValues = new Set([opt("--name")]);
  const dir = args.find((a) => !a.startsWith("--") && !optionValues.has(a)) || ".";
  const level = args.includes("--new") ? "new" : "stock";
  const repoName = opt("--name") ?? basename(resolve(dir));
  let lastDataCommit;
  try {
    lastDataCommit = execFileSync("git", ["-C", dir, "log", "-1", "--format=%cI", "--", "data"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
  } catch {}
  const r = checkDataset(dir, { level, repoName, facts: { lastDataCommit } });
  if (!r.errors.some((e) => e.startsWith("README.md:"))) {
    const mdx = await readmeMdxError(dir);
    if (mdx) r.errors.push(mdx);
  }
  if (args.includes("--prepublish")) r.errors.push(...(await checkCorePage(repoName, { expect: "free" })));
  if (args.includes("--live")) r.errors.push(...(await checkCorePage(repoName)));
  console.log(json ? JSON.stringify(r, null, 2) : formatOne(dir, level, r));
  process.exit(r.errors.length ? 1 : 0);
}
