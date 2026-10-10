// Deterministic structure checks (docs/plans/2026-09-25-research/quality.md section 2.4): does a
// wrangled dataset meet the structure skill's own contract, and does it hold the right values?
// Thirteen checks, each returning { id, pass, severity, message, evidence }:
//   D1 artefacts exist          D2 offline build succeeds      D3 deterministic rebuild
//   D4 validator clean          D5 contract fields             D6 house CSV format
//   D7 row count                D8 hand-read anchors           D9 sentinels handled
//   D10 semantic golden diff    D11 provenance header          D12 ISO dates
//   D13 raw inputs untouched
// Nothing requires the agent's column names to match the reference: rows are located by date,
// columns by value (D10) or, for the anchors, by a name pattern for the role with value as the
// fallback, so judgement calls (naming, day of month, dropping decimal_date) are recorded, not
// failed. The case's `golden` block (case.json) carries the expectations; the anchors in it
// were typed in by hand from the raw file, so at least one check is anchored outside the
// pipeline. Plain Node, no dependencies.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { OFFLINE_PRELOAD } from "./story.mjs";

export const CHECK_IDS = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13"];
const BUILD_TIMEOUT_MS = 120_000;

const result = (id, pass, message, evidence = null, severity = "fail") => ({ id, pass, severity, message, evidence });
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const gitBlobHash = (buf) => createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");

function git(root, args, encoding = "utf8") {
  const res = spawnSync("git", args, { cwd: root, encoding, maxBuffer: 1 << 30 });
  if (res.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${res.stderr}`);
  return res.stdout;
}

// --- CSV --------------------------------------------------------------------------

// RFC 4180 parser: quoted fields, doubled quotes, CRLF or LF. Returns { header, rows }.
export function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const records = [];
  let field = "";
  let record = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') (field += '"'), i++;
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") record.push(field), (field = "");
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || record.length) record.push(field), records.push(record);
  const [header = [], ...rows] = records.filter((r) => !(r.length === 1 && r[0] === ""));
  return { header, rows };
}

const MONTH_RE = /^(\d{4})-(\d{2})/;
const ISO_DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Normalise a cell for value comparison: missing (empty or a NOAA sentinel, which is D9's
// business) -> "", a date-like value -> its YYYY-MM (the day of month is a judgement call,
// D12), a number -> its canonical Number form, anything else verbatim.
export function normalise(cell, sentinels = []) {
  const v = cell.trim();
  if (v === "" || sentinels.some((s) => Number(s) === Number(v) && v !== "")) return "";
  const m = v.match(MONTH_RE);
  if (m) return `${m[1]}-${m[2]}`;
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : v;
}

const multisetKey = (values) => [...values].sort().join("\u0001");

// --- Locating rows and columns -------------------------------------------------------

// The date column: the first column whose every non-empty value starts YYYY-MM.
export function dateColumn({ header, rows }) {
  for (let c = 0; c < header.length; c++) {
    const vals = rows.map((r) => r[c] ?? "").filter((v) => v !== "");
    if (vals.length && vals.every((v) => MONTH_RE.test(v))) return c;
  }
  return -1;
}

// Row index by month "YYYY-MM": through the date column, else a year column plus a month column.
export function rowLocator(table) {
  const dc = dateColumn(table);
  const map = new Map();
  if (dc >= 0) {
    table.rows.forEach((r, i) => {
      const m = (r[dc] ?? "").match(MONTH_RE);
      if (m && !map.has(`${m[1]}-${m[2]}`)) map.set(`${m[1]}-${m[2]}`, i);
    });
    return { how: `date column ${table.header[dc]}`, map, dateCol: dc };
  }
  const yc = table.header.findIndex((h) => /^year$/i.test(h));
  const mc = table.header.findIndex((h) => /^month$/i.test(h));
  if (yc >= 0 && mc >= 0) {
    table.rows.forEach((r, i) => {
      const key = `${r[yc]}-${String(Number(r[mc])).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, i);
    });
    return { how: `year ${table.header[yc]} + month ${table.header[mc]}`, map, dateCol: -1 };
  }
  return { how: "none", map, dateCol: -1 };
}

// Name patterns per reference role, tried in this order; a column taken by an earlier role is
// not offered to a later one. A role binds by name only when exactly one column matches.
const ROLE_PATTERNS = [
  ["decimal_date", /decimal|frac/i],
  ["co2_ppm_deseasonalized", /deseason|season(al(ly)?)?_?adj|trend/i],
  ["uncertainty", /unc/i],
  ["std_dev", /std|stdev|sdev|sigma|(^|_)sd(_|$)|dev(iation)?/i],
  ["num_days", /day/i],
  ["co2_ppm", /co2|average|avg|mean|ppm|value/i],
];

// D10's mapping: golden column -> agent column with the identical normalised value multiset.
export function valueMapping(golden, agent, sentinels) {
  const keys = agent.header.map((_, c) => multisetKey(agent.rows.map((r) => normalise(r[c] ?? "", sentinels))));
  const used = new Set();
  const map = {};
  golden.header.forEach((name, g) => {
    const key = multisetKey(golden.rows.map((r) => normalise(r[g] ?? "", sentinels)));
    const c = keys.findIndex((k, i) => k === key && !used.has(i));
    if (c >= 0) {
      used.add(c);
      map[name] = c;
    }
  });
  return map;
}

export function bindRoles(agent, byValue, { dateCol = -1 } = {}) {
  const taken = new Set(dateCol >= 0 ? [dateCol] : []);
  const roles = {};
  for (const [role, re] of ROLE_PATTERNS) {
    const hits = agent.header.map((h, c) => (re.test(h) && !taken.has(c) ? c : -1)).filter((c) => c >= 0);
    if (hits.length === 1) {
      roles[role] = { col: hits[0], how: "name" };
      taken.add(hits[0]);
    } else if (byValue[role] !== undefined && !taken.has(byValue[role])) {
      roles[role] = { col: byValue[role], how: "value" };
      taken.add(byValue[role]);
    }
  }
  return roles;
}

// --- Workspace helpers ------------------------------------------------------------------

function listCsvs(dataDir) {
  return existsSync(dataDir) ? readdirSync(dataDir).filter((n) => n.endsWith(".csv")).sort() : [];
}

function hashCsvs(dataDir) {
  return Object.fromEntries(listCsvs(dataDir).map((n) => [n, sha256(readFileSync(join(dataDir, n)))]));
}

function diffHashes(a, b) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => a[k] !== b[k]).sort();
}

function runBuild(cwd) {
  const res = spawnSync(process.execPath, ["--import", pathToFileURL(OFFLINE_PRELOAD).href, "build.ts"], {
    cwd,
    encoding: "utf8",
    timeout: BUILD_TIMEOUT_MS,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, TZ: "UTC", LANG: "C", NO_PROXY: "*" },
  });
  return { ok: res.status === 0, status: res.status, stderr: (res.stderr || String(res.error || "")).slice(-2000) };
}

// The resource CSV the row-level checks look at: the one whose date column reaches the first
// anchor month, else the one with the most rows.
function pickTarget(dataDir, firstMonth) {
  const tables = listCsvs(dataDir).map((name) => ({ name, text: readFileSync(join(dataDir, name), "utf8") }));
  if (!tables.length) return null;
  for (const t of tables) t.table = parseCsv(t.text);
  const hit = tables.find((t) => rowLocator(t.table).map.has(firstMonth));
  return hit ?? tables.sort((a, b) => b.table.rows.length - a.table.rows.length)[0];
}

// --- The checks -----------------------------------------------------------------------

// D1: build.ts, datapackage.json, at least one data/*.csv and a non-empty DECISIONS.md.
export function checkArtefacts({ dir, committedCsvs, workspace }) {
  const missing = [];
  for (const f of ["build.ts", "datapackage.json"]) if (!existsSync(join(dir, f))) missing.push(f);
  if (!committedCsvs.length) missing.push("data/*.csv");
  const decisions = [join(dir, "DECISIONS.md"), join(workspace, "DECISIONS.md")].find((p) => existsSync(p));
  if (!decisions || readFileSync(decisions, "utf8").trim() === "") missing.push("DECISIONS.md (non-empty)");
  const items = decisions ? (readFileSync(decisions, "utf8").match(/^\s*(?:[-*+]|\d+[.)])\s+/gm) ?? []).length : 0;
  return missing.length
    ? result("D1", false, `missing: ${missing.join(", ")}`, { missing })
    : result("D1", true, `build.ts, datapackage.json, ${committedCsvs.length} CSV(s) and DECISIONS.md (${items} list item(s)) present`, { csvs: committedCsvs, decisions_items: items });
}

// The repository's validator (scripts/validate-datapackage.mjs at `root`, not the workspace
// copy the writer could have edited), run in a child process so this module has no static
// dependency outside evals/.
export function runValidator(root, dir) {
  const url = pathToFileURL(join(root, "scripts", "validate-datapackage.mjs")).href;
  const code = `import { validateDatapackage } from ${JSON.stringify(url)}; process.stdout.write(JSON.stringify(validateDatapackage(process.argv[1])));`;
  const res = spawnSync(process.execPath, ["--input-type=module", "-e", code, dir], { encoding: "utf8" });
  if (res.status !== 0) throw new Error(`validator failed to run: ${res.stderr}`);
  return JSON.parse(res.stdout);
}

// D4: the validator reports no errors and no warnings.
export function checkValidator(root, dir) {
  if (!existsSync(join(dir, "datapackage.json"))) return result("D4", false, "no datapackage.json to validate");
  const { errors, warnings, notes } = runValidator(root, dir);
  const pass = errors.length === 0 && warnings.length === 0;
  return result("D4", pass, pass ? `validator clean (${notes.length} note(s))` : `validator: ${errors.length} error(s), ${warnings.length} warning(s): ${[...errors, ...warnings].join("; ")}`, { errors, warnings, notes });
}

const SPDX_SHAPED = /^[A-Za-z0-9][A-Za-z0-9.+-]*$/;

// D5: status structured, an SPDX-shaped licence, a source on the expected domain, and every
// resource typed with a primaryKey.
export function checkContract(dir, sourceDomain) {
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(dir, "datapackage.json"), "utf8"));
  } catch (e) {
    return result("D5", false, `datapackage.json unreadable: ${e.message}`);
  }
  const problems = [];
  if (pkg.status !== "structured") problems.push(`status is ${JSON.stringify(pkg.status)}, not "structured"`);
  if (!Array.isArray(pkg.licenses) || !pkg.licenses.length) problems.push("no licenses");
  else if (!pkg.licenses.some((l) => typeof l?.name === "string" && SPDX_SHAPED.test(l.name))) problems.push("no licence with an SPDX-shaped name");
  if (!Array.isArray(pkg.sources) || !pkg.sources.some((s) => typeof s?.path === "string" && s.path.includes(sourceDomain))) problems.push(`no sources[].path on ${sourceDomain}`);
  const resources = Array.isArray(pkg.resources) ? pkg.resources : [];
  if (!resources.length) problems.push("no resources");
  for (const r of resources) {
    const fields = r?.schema?.fields;
    if (!Array.isArray(fields) || !fields.length) problems.push(`${r?.name ?? r?.path}: no schema.fields`);
    else if (fields.some((f) => !f?.type)) problems.push(`${r?.name ?? r?.path}: untyped field(s)`);
    const pk = r?.schema?.primaryKey;
    if (!(typeof pk === "string" ? pk : Array.isArray(pk) && pk.length)) problems.push(`${r?.name ?? r?.path}: no primaryKey`);
  }
  return problems.length ? result("D5", false, problems.join("; "), { problems }) : result("D5", true, `structured, licence ${pkg.licenses.map((l) => l.name).join(", ")}, source on ${sourceDomain}, ${resources.length} typed resource(s) with primaryKey`);
}

const SNAKE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

// D6: snake_case headers, LF line endings, a trailing newline, no BOM, no dialect block.
export function checkHouseFormat(dir, dataDir) {
  const problems = [];
  for (const name of listCsvs(dataDir)) {
    const buf = readFileSync(join(dataDir, name));
    const text = buf.toString("utf8");
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) problems.push(`${name}: BOM`);
    if (text.includes("\r")) problems.push(`${name}: CR line endings`);
    if (!text.endsWith("\n")) problems.push(`${name}: no trailing newline`);
    const bad = parseCsv(text).header.filter((h) => !SNAKE.test(h));
    if (bad.length) problems.push(`${name}: non-snake_case header(s) ${bad.join(", ")}`);
  }
  try {
    const pkg = JSON.parse(readFileSync(join(dir, "datapackage.json"), "utf8"));
    if (pkg.dialect || (pkg.resources ?? []).some((r) => r?.dialect)) problems.push("datapackage.json has a dialect block");
  } catch {}
  return problems.length ? result("D6", false, problems.join("; "), { problems }) : result("D6", true, "snake_case headers, LF, trailing newline, no dialect");
}

// D9: no sentinel left in any cell, and the per-column empty counts match as a multiset.
export function checkSentinels(target, golden) {
  const { header, rows } = target.table;
  const sentinelNums = golden.sentinels.map(Number);
  const left = [];
  const empties = header.map(() => 0);
  rows.forEach((r) =>
    header.forEach((h, c) => {
      const v = (r[c] ?? "").trim();
      if (v === "") empties[c]++;
      else if (sentinelNums.includes(Number(v))) left.push(h);
    }),
  );
  const counts = empties.filter((n) => n > 0).sort((a, b) => a - b);
  const want = [...golden.empty_counts].sort((a, b) => a - b);
  const perColumn = Object.fromEntries(header.map((h, c) => [h, empties[c]]));
  const problems = [];
  if (left.length) {
    const by = {};
    for (const h of left) by[h] = (by[h] ?? 0) + 1;
    problems.push(`sentinel values left: ${Object.entries(by).map(([h, n]) => `${h} ${n}`).join(", ")}`);
  }
  if (counts.join(",") !== want.join(",")) problems.push(`empty-cell counts per column [${counts.join(", ")}], expected [${want.join(", ")}]`);
  return problems.length ? result("D9", false, problems.join("; "), { empties: perColumn }) : result("D9", true, `no sentinels left; empty counts [${counts.join(", ")}] as expected`, { empties: perColumn });
}

// D8: the hand-read anchors, each on the row for its month, in the column bound to its role.
export function checkAnchors(target, golden, byValue) {
  const loc = rowLocator(target.table);
  const roles = bindRoles(target.table, byValue, { dateCol: loc.dateCol });
  const misses = [];
  let checked = 0;
  for (const a of golden.anchors) {
    const i = loc.map.get(a.month);
    if (i === undefined) {
      misses.push(`${a.month}: no row`);
      continue;
    }
    for (const [role, want] of Object.entries(a.values)) {
      if (!roles[role]) {
        if (golden.optional_columns?.includes(role)) continue;
        misses.push(`${a.month} ${role}: no column for this role`);
        continue;
      }
      checked++;
      const cell = (target.table.rows[i][roles[role].col] ?? "").trim();
      if (cell === "" || Math.abs(Number(cell) - want) > 1e-9) misses.push(`${a.month} ${role}: ${target.table.header[roles[role].col]} = ${JSON.stringify(cell)}, raw file has ${want}`);
    }
  }
  const bound = Object.fromEntries(Object.entries(roles).map(([r, b]) => [r, `${target.table.header[b.col]} (by ${b.how})`]));
  return misses.length
    ? result("D8", false, `${misses.length} anchor(s) wrong: ${misses.join("; ")}`, { misses, rows_by: loc.how, roles: bound })
    : result("D8", true, `${checked} hand-read anchor value(s) on ${golden.anchors.length} rows match`, { rows_by: loc.how, roles: bound });
}

// D10: every reference column has an agent column with the same value multiset (names ignored).
export function checkGoldenDiff(target, reference, golden) {
  const map = valueMapping(reference, target.table, golden.sentinels);
  const missing = reference.header.filter((h) => map[h] === undefined);
  const allowed = missing.filter((h) => golden.optional_columns?.includes(h));
  const failing = missing.filter((h) => !allowed.includes(h));
  const k = reference.header.length - missing.length;
  const matched = Object.fromEntries(Object.entries(map).map(([g, c]) => [g, target.table.header[c]]));
  const note = allowed.length ? ` (${allowed.join(", ")} not present: a judgement call, allowed)` : "";
  return failing.length
    ? result("D10", false, `${k}/${reference.header.length} reference columns matched; no agent column holds the values of ${failing.join(", ")}${note}`, { matched, unmatched: failing, allowed_missing: allowed })
    : result("D10", true, `${k}/${reference.header.length} reference columns matched by value${note}`, { matched, allowed_missing: allowed });
}

// D11: build.ts opens with a comment naming the source URL, the retrieval date and the licence.
export function checkProvenance(dir) {
  const p = join(dir, "build.ts");
  if (!existsSync(p)) return result("D11", false, "no build.ts");
  const lines = readFileSync(p, "utf8").split("\n");
  const head = [];
  let inBlock = false;
  for (const line of lines) {
    const t = line.trim();
    if (inBlock) {
      head.push(t);
      if (t.includes("*/")) inBlock = false;
    } else if (t === "" || t.startsWith("#!") || t.startsWith("//")) head.push(t);
    else if (t.startsWith("/*")) {
      head.push(t);
      inBlock = !t.includes("*/");
    } else break;
  }
  const text = head.join("\n");
  const missing = [];
  if (!/https?:\/\/\S*gml\.noaa\.gov/i.test(text)) missing.push("source URL");
  if (!/retriev|download|fetched|accessed|snapshot/i.test(text) || !/\b\d{4}-\d{2}-\d{2}\b/.test(text)) missing.push("retrieval date");
  if (!/licen[cs]e|public domain|PDDL|CC0|CC-BY|terms of use/i.test(text)) missing.push("licence");
  return missing.length ? result("D11", false, `build.ts header comment lacks: ${missing.join(", ")}`, { missing }) : result("D11", true, "build.ts header has source URL, retrieval date and licence");
}

// D12: the date column holds valid YYYY-MM-DD dates; the day of month chosen is recorded.
export function checkIsoDates(target) {
  if (!target) return result("D12", false, "no data to check");
  const { header, rows } = target.table;
  const dc = dateColumn(target.table);
  if (dc < 0) return result("D12", false, "no date column (no column whose values start YYYY-MM)");
  const bad = [];
  const days = new Set();
  for (const r of rows) {
    const v = r[dc] ?? "";
    const m = v.match(ISO_DAY_RE);
    const d = m && new Date(`${v}T00:00:00Z`);
    if (!m || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) bad.push(v);
    else days.add(m[3]);
  }
  const evidence = { column: header[dc], days_of_month: [...days].sort() };
  return bad.length
    ? result("D12", false, `${bad.length} value(s) in ${header[dc]} are not YYYY-MM-DD, e.g. ${JSON.stringify(bad[0])}`, evidence)
    : result("D12", true, `${header[dc]} is YYYY-MM-DD throughout (day of month: ${evidence.days_of_month.join(", ")}; a judgement call)`, evidence);
}

// D13: every input file is byte-identical to its pinned commit (none modified or deleted). Files
// added next to an input (archive/PROVENANCE.md, say) are listed but do not fail.
export function checkInputs({ workspace, inputs, root }) {
  const changes = [];
  const added = [];
  for (const { path, commit } of inputs) {
    const baseline = {};
    for (const line of git(root, ["ls-tree", "-r", commit, "--", path]).split("\n")) {
      const m = line.match(/^\d+ blob ([0-9a-f]+)\t(.+)$/);
      if (m) baseline[m[2]] = m[1];
    }
    for (const [p, blob] of Object.entries(baseline)) {
      const abs = join(workspace, p);
      if (!existsSync(abs)) changes.push(`${p} (deleted)`);
      else if (gitBlobHash(readFileSync(abs)) !== blob) changes.push(`${p} (modified)`);
    }
    const parent = dirname(join(workspace, path));
    if (existsSync(parent) && statSync(parent).isDirectory()) {
      for (const n of readdirSync(parent)) {
        const rel = `${dirname(path)}/${n}`;
        if (!(rel in baseline) && !inputs.some((i) => i.path === rel) && statSync(join(parent, n)).isFile()) added.push(rel);
      }
    }
  }
  const uniqAdded = [...new Set(added)].sort();
  return changes.length
    ? result("D13", false, `${changes.length} input file(s) changed: ${changes.join(", ")}`, { changes, added: uniqAdded })
    : result("D13", true, `${inputs.length} input(s) identical to their pinned commits${uniqAdded.length ? `; added beside them: ${uniqAdded.join(", ")}` : ""}`, { added: uniqAdded });
}

// Read the reference CSV (golden.reference { path, commit }) from `root`'s git objects.
export function readReference(root, golden) {
  return parseCsv(git(root, ["show", `${golden.reference.commit}:${golden.reference.path}`]));
}

// Run all thirteen checks on a workspace laid out like the writer's repo. The build runs in
// place (data/ is rebuilt), so pass a scratch copy. Options:
//   workspace  absolute path      root  git repo holding the input and reference commits
//   inputs     [{ path, commit }] golden  the case's golden block
//   reference  parsed reference CSV (defaults to readReference(root, golden))
//   build      false skips D2/D3 and checks the committed data (unit tests only)
export function checkStructure({ workspace, root, inputs = [], golden, reference, build = true }) {
  const dir = join(workspace, golden.dataset_dir);
  const dataDir = join(dir, "data");
  const committedCsvs = listCsvs(dataDir);
  const committed = hashCsvs(dataDir);
  const results = [checkArtefacts({ dir, committedCsvs, workspace })];

  // D2 and D3: delete the committed data/*.csv (the directory stays, as in a checkout), rebuild
  // offline, twice. The row-level checks then read the rebuilt data, or the committed data when
  // the build fails (so a D2 failure does not cascade into D6-D12).
  if (!build) {
    results.push(result("D2", true, "skipped (build: false)", null, "warn"), result("D3", true, "skipped (build: false)", null, "warn"));
  } else if (!existsSync(join(dir, "build.ts"))) {
    results.push(result("D2", false, "no build.ts to run"), result("D3", false, "not run: no build.ts"));
  } else {
    const saved = Object.fromEntries(committedCsvs.map((n) => [n, readFileSync(join(dataDir, n))]));
    const clearCsvs = () => listCsvs(dataDir).forEach((n) => rmSync(join(dataDir, n)));
    clearCsvs();
    const first = runBuild(dir);
    const h1 = hashCsvs(dataDir);
    if (!first.ok || !Object.keys(h1).length) {
      results.push(result("D2", false, first.ok ? "offline build wrote no data/*.csv" : `offline build failed (exit ${first.status})`, { stderr: first.stderr }));
      results.push(result("D3", false, "not run: the offline build failed"));
      clearCsvs();
      for (const [n, buf] of Object.entries(saved)) writeFileSync(join(dataDir, n), buf);
    } else {
      results.push(result("D2", true, `offline build from a data/ with no CSVs wrote ${Object.keys(h1).length} CSV(s)`, { csvs: Object.keys(h1) }));
      const second = runBuild(dir);
      const h2 = hashCsvs(dataDir);
      const unstable = diffHashes(h1, h2);
      const drift = diffHashes(committed, h1);
      if (!second.ok) results.push(result("D3", false, `second offline build failed (exit ${second.status})`, { stderr: second.stderr }));
      else if (unstable.length) results.push(result("D3", false, `two builds differ: ${unstable.join(", ")}`, { unstable, drift }));
      else if (drift.length) results.push(result("D3", false, `rebuild differs from the committed data: ${drift.join(", ")}`, { unstable, drift }));
      else results.push(result("D3", true, `two offline builds reproduce the committed ${Object.keys(h1).length} CSV(s) byte for byte`, { sha256: h1 }));
    }
  }

  results.push(checkValidator(root, dir), checkContract(dir, golden.source_domain), checkHouseFormat(dir, dataDir));

  const target = pickTarget(dataDir, golden.anchors[0].month);
  if (!target) {
    for (const id of ["D7", "D8", "D9", "D10"]) results.push(result(id, false, "no data/*.csv to check"));
  } else {
    reference = reference ?? readReference(root, golden);
    const n = target.table.rows.length;
    results.push(result("D7", n === golden.rows, `${target.name}: ${n} observation rows (expected ${golden.rows})`, { csv: target.name, rows: n }));
    const byValue = valueMapping(reference, target.table, golden.sentinels);
    results.push(checkAnchors(target, golden, byValue), checkSentinels(target, golden), checkGoldenDiff(target, reference, golden));
  }
  results.push(checkProvenance(dir), checkIsoDates(target), checkInputs({ workspace, inputs, root }));
  const order = new Map(CHECK_IDS.map((id, i) => [id, i]));
  return results.sort((a, b) => order.get(a.id) - order.get(b.id));
}
