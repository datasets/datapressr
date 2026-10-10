// Generates evals/REPORT.md from the ledger (design section 6, datapressr-hcn.9).
//
// renderReport(rows, ctx) is a pure function of the ledger rows plus a small context gathered
// from git and the installed CLIs (reportContext); there is no generation timestamp, so
// regenerating with nothing new is byte-identical. Sections, in order:
//   flags (hard regressions from deterministic checks only; soft flags on pairwise losses; leaked
//   runs; missing canaries), per skill change, per case, noise, harness quality.
// Statistics policy (review issue 2): pairwise win/tie/loss counts with n; absolute scores as
// ranges with n; a difference is a change only when ranges do not overlap; n=1 is an anecdote;
// no standard deviations or p-values.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as claude from "./adapters/claude.mjs";
import { readLedger } from "./ledger.mjs";
import { OPEN_MODE_DIMENSIONS, SCORE_DIMENSIONS } from "./schema.mjs";

const DIMS = [...SCORE_DIMENSIONS, ...OPEN_MODE_DIMENSIONS];
const AGREEMENT_BAR = "at least 4 of 5";

const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const short = (sha) => (sha ? sha.slice(0, 7) : "");
const code = (s) => `\`${s}\``;
const money = (v) => (v === null || v === undefined ? "" : v.toFixed(2));
const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
const day = (at) => at.slice(0, 16).replace("T", " ");
const quote = (text) => text.replace(/\r\n/g, "\n").replace(/\n+$/, "").split("\n").map((l) => (l === "" ? ">" : `> ${l}`));
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// The skill a run exercised. Rows before datapressr-hcn.9 lack skill_name; the domain names it.
const skillOf = (run) => run.skill_name ?? run.domain;
const modelOf = (run) => run.writer.model_actual ?? run.writer.model;

// Last row per key, in ledger (append) order: re-checks and re-scores append, the latest wins.
function latestBy(rows, key) {
  const m = new Map();
  for (const r of rows) m.set(key(r), r);
  return m;
}

function groupBy(rows, key) {
  const m = new Map();
  for (const r of rows) {
    const k = key(r);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return m;
}

// The pair's result from its two judgements: a win only when both orders name the same run.
function pairResult(pair) {
  const [a, b] = pair.judgements.map((j) => j.preferred_run_id ?? null);
  if (a !== null && a === b) return { winner: a, split: false };
  return { winner: null, split: a !== b };
}

// Build the indexes every section needs.
function analyse(rows, ctx) {
  const runs = rows.filter((r) => r.kind === "run");
  const runById = new Map(runs.map((r) => [r.run_id, r]));
  const checkByRun = latestBy(rows.filter((r) => r.kind === "check"), (r) => r.run_id);
  const scores = rows.filter((r) => r.kind === "score");
  const pairRows = rows.filter((r) => r.kind === "pair");
  const pairs = [...latestBy(pairRows, (r) => `${r.pair_id}\u0000${r.rubric}`).values()];
  const owners = rows.filter((r) => r.kind === "owner");
  const reveals = latestBy(rows.filter((r) => r.kind === "reveal"), (r) => r.pair_id);

  // Skill trees per skill, oldest first: by position in the skill's git history when the tree is
  // a committed one, else (an uncommitted tree) after all of those, by its first run.
  const history = ctx.skills ?? {};
  const histIndex = (skill, tree) => (history[skill] ?? []).findIndex((c) => c.tree === tree);
  const firstAt = new Map();
  for (const r of runs) {
    const k = `${skillOf(r)}\u0000${r.skill_tree}`;
    if (!firstAt.has(k) || r.at < firstAt.get(k)) firstAt.set(k, r.at);
  }
  const rankKey = (skill, tree) => {
    const i = histIndex(skill, tree);
    return i >= 0 ? [0, String(i).padStart(8, "0")] : [1, firstAt.get(`${skill}\u0000${tree}`) ?? ""];
  };
  const treesBySkill = new Map();
  for (const [skill, list] of groupBy(runs, skillOf)) {
    const trees = [...new Set(list.map((r) => r.skill_tree))];
    trees.sort((x, y) => {
      const [a, b] = [rankKey(skill, x), rankKey(skill, y)];
      return cmp(a[0], b[0]) || cmp(a[1], b[1]) || cmp(x, y);
    });
    treesBySkill.set(skill, trees);
  }
  const treeRank = (skill, tree) => (treesBySkill.get(skill) ?? []).indexOf(tree);

  // Each pair oriented as new vs old when its runs are on different trees of the same skill.
  const oriented = pairs.map((p) => {
    const [r1, r2] = p.run_ids.map((id) => runById.get(id));
    const res = pairResult(p);
    const o = { pair: p, ...res, newRun: null, oldRun: null, outcome: null };
    if (r1 && r2 && skillOf(r1) === skillOf(r2) && r1.skill_tree !== r2.skill_tree) {
      const newer = treeRank(skillOf(r1), r1.skill_tree) > treeRank(skillOf(r2), r2.skill_tree);
      o.newRun = newer ? r1 : r2;
      o.oldRun = newer ? r2 : r1;
      o.outcome = res.winner === null ? "tie" : res.winner === o.newRun.run_id ? "win" : "loss";
    }
    return o;
  });

  // Owner pair preferences resolved through the reveal row (null until revealed).
  const ownerPairs = owners.filter((o) => o.pair_id).map((o) => {
    const rv = reveals.get(o.pair_id);
    return { owner: o, reveal: rv ?? null, preferredRun: rv ? rv.preferred_run_id : undefined };
  });

  return { runs, runById, checkByRun, scores, pairs: oriented, owners, ownerPairs, treesBySkill, treeRank, history, histIndex };
}

const treeLabel = (tree) => code(short(tree));

function checksCell(check) {
  if (!check) return "not run";
  if (check.failed.length === 0) return `pass (${check.passed})`;
  return `fail ${check.failed.join(", ")} (${check.passed} pass)`;
}

// --- Flags --------------------------------------------------------------------------------------

function hardRegressions(a) {
  const out = [];
  for (const [caseKey, list] of [...groupBy(a.runs, (r) => `${r.domain}/${r.case_id}\u0000${skillOf(r)}`)].sort(([x], [y]) => cmp(x, y))) {
    const [label, skill] = caseKey.split("\u0000");
    // A run cut short by the writer's usage limit (datapressr-9lc) fails checks for no reason of the skill's.
    const checked = list.filter((r) => a.checkByRun.has(r.run_id) && !r.flags.includes("usage_limit"));
    const trees = [...new Set(checked.map((r) => r.skill_tree))].sort((x, y) => a.treeRank(skill, x) - a.treeRank(skill, y));
    for (let i = 1; i < trees.length; i++) {
      const prev = checked.filter((r) => r.skill_tree === trees[i - 1]);
      const next = checked.filter((r) => r.skill_tree === trees[i]);
      const failedPrev = new Set(prev.flatMap((r) => a.checkByRun.get(r.run_id).failed));
      const ids = [...new Set(next.flatMap((r) => a.checkByRun.get(r.run_id).failed))].filter((id) => !failedPrev.has(id)).sort();
      for (const id of ids) {
        const failing = next.filter((r) => a.checkByRun.get(r.run_id).failed.includes(id));
        out.push(`**Hard regression** on ${label}: check ${id} passed on every run of tree ${treeLabel(trees[i - 1])} (n=${prev.length}) and fails on ${failing.length} of ${next.length} run${next.length === 1 ? "" : "s"} of tree ${treeLabel(trees[i])} (${failing.map((r) => r.run_id).join(", ")}).`);
      }
    }
  }
  return out;
}

function canaryStatus(rows, ctx) {
  const canaries = rows.filter((r) => r.kind === "canary");
  return (ctx.canary ?? []).map((key) => {
    if (!key.cli_version) return { ...key, state: "not-installed", row: null };
    const matching = canaries.filter((r) => r.vendor === key.vendor && r.cli_version === key.cli_version && r.mode === key.mode && !r.weakened && (!key.recipe_sha256 || r.recipe_sha256 === key.recipe_sha256));
    const row = matching[matching.length - 1] ?? null;
    return { ...key, state: !row ? "missing" : row.pass ? "pass" : "fail", row };
  });
}

function flagsSection(rows, a, ctx) {
  const flags = [...hardRegressions(a)];
  for (const o of a.pairs.filter((p) => p.outcome === "loss")) {
    flags.push(`Soft flag on ${o.oldRun.domain}/${o.pair.case_id}: in pair ${o.pair.pair_id} (rubric ${o.pair.rubric}) the older tree ${treeLabel(o.oldRun.skill_tree)} beat the newer ${treeLabel(o.newRun.skill_tree)} in both orders; needs a look.`);
  }
  for (const r of a.runs.filter((x) => x.flags.includes("leaked")).sort((x, y) => cmp(x.run_id, y.run_id))) {
    flags.push(`Leaked run ${r.run_id} (${r.domain}/${r.case_id}): the transcript touched paths outside the workspace; see its run.json before using it.`);
  }
  for (const s of canaryStatus(rows, ctx)) {
    const key = `${s.vendor} ${s.cli_version}, ${s.mode} mode${s.recipe_sha256 ? `, recipe ${s.recipe_sha256.slice(0, 12)}` : ""}`;
    if (s.state === "missing") flags.push(`Missing canary for the installed CLI (${key}); run \`node evals/run.mjs canary --writer ${s.vendor} --mode ${s.mode}\` before any paid run.`);
    if (s.state === "fail") flags.push(`The latest canary for the installed CLI (${key}) failed (${s.row.run_id}); isolation is not proven.`);
  }
  const out = ["## Flags", ""];
  if (flags.length === 0) out.push("None.");
  else for (const f of flags) out.push(`- ${f}`);
  out.push("");
  return out;
}

// --- Per skill change ---------------------------------------------------------------------------

function wtl(list) {
  const n = (k) => list.filter((o) => o.outcome === k).length;
  return `${plural(n("win"), "win")}, ${plural(n("tie"), "tie")}, ${plural(n("loss"), "loss", "losses")} (n=${plural(list.length, "pair")})`;
}

function ownerVerdict(op, o) {
  if (!op.reveal) return "recorded; mapping not yet revealed";
  if (op.preferredRun === null) return "neither";
  if (o?.newRun && op.preferredRun === o.newRun.run_id) return "new";
  if (o?.oldRun && op.preferredRun === o.oldRun.run_id) return "old";
  return `run ${op.preferredRun}`;
}

function skillSection(a, ctx) {
  const out = ["## Per skill change", ""];
  if (a.treesBySkill.size === 0) return [...out, "No runs recorded yet.", ""];
  for (const skill of [...a.treesBySkill.keys()].sort()) {
    const trees = a.treesBySkill.get(skill);
    const hist = a.history[skill] ?? [];
    const commitOf = (tree) => hist.find((c) => c.tree === tree) ?? null;
    out.push(`### ${skill}`, "");
    for (let i = trees.length - 1; i >= 0; i--) {
      const tree = trees[i];
      const c = commitOf(tree);
      const runs = a.runs.filter((r) => skillOf(r) === skill && r.skill_tree === tree);
      const cases = [...groupBy(runs, (r) => `${r.domain}/${r.case_id}`)].sort(([x], [y]) => cmp(x, y)).map(([k, l]) => `${k} (${plural(l.length, "run")})`);
      out.push(`#### Tree ${treeLabel(tree)}${c ? `, commit ${code(short(c.commit))} ${cell(c.subject)}` : ", not a committed tree"}${i === 0 ? " (earliest tree with runs)" : ""}`, "");
      out.push(`Cases run: ${cases.join(", ")}.`, "");
      if (i > 0) {
        const prev = trees[i - 1];
        const pc = commitOf(prev);
        if (pc && c) {
          const range = hist.slice(a.histIndex(skill, prev) + 1, a.histIndex(skill, tree) + 1);
          const link = ctx.repoUrl ? ` ([compare](${ctx.repoUrl}/compare/${short(pc.commit)}...${short(c.commit)}))` : "";
          out.push(`What changed since ${treeLabel(prev)}: \`git log --oneline ${short(pc.commit)}..${short(c.commit)} -- skills/${skill}\`${link}`, "");
          for (const rc of range.slice().reverse()) out.push(`- ${code(short(rc.commit))} ${cell(rc.subject)}`);
          if (range.length) out.push("");
        } else {
          out.push(`What changed since ${treeLabel(prev)}: not resolvable from git history (an uncommitted tree).`, "");
        }
      }
      // Pairwise: this tree as the newer side, grouped by the older tree and rubric.
      const asNew = a.pairs.filter((o) => o.newRun && skillOf(o.newRun) === skill && o.newRun.skill_tree === tree);
      if (i > 0 && !asNew.some((o) => o.oldRun.skill_tree === trees[i - 1])) out.push(`Pairwise vs ${treeLabel(trees[i - 1])}: no comparison on record.`, "");
      for (const [k, list] of [...groupBy(asNew, (o) => `${String(a.treeRank(skill, o.oldRun.skill_tree)).padStart(6, "0")}\u0000${o.oldRun.skill_tree}\u0000${o.pair.rubric}`)].sort(([x], [y]) => cmp(y, x))) {
        const [, old, rubric] = k.split("\u0000");
        out.push(`Pairwise vs ${treeLabel(old)} (rubric ${rubric}): ${wtl(list)}.`, "");
        for (const o of list.sort((x, y) => cmp(x.pair.pair_id, y.pair.pair_id))) {
          out.push(`- ${o.pair.pair_id} on ${o.pair.case_id}: ${o.outcome}${o.split ? " (orders split)" : ""}`);
        }
        out.push("");
      }
      const ownerHere = a.ownerPairs.filter((op) => asNew.some((o) => o.pair.pair_id === op.owner.pair_id));
      const seen = new Set();
      const lines = [];
      for (const op of ownerHere.sort((x, y) => cmp(x.owner.pair_id, y.owner.pair_id))) {
        if (seen.has(op.owner.pair_id)) continue;
        seen.add(op.owner.pair_id);
        lines.push(`- ${op.owner.pair_id}: owner preferred ${ownerVerdict(op, asNew.find((o) => o.pair.pair_id === op.owner.pair_id))}`);
      }
      if (lines.length) out.push("Owner preferences:", "", ...lines, "");
    }
    // The guard that edits get tested: commits after the earliest tree with runs that no
    // pairwise comparison covers (a pair old -> new covers every commit in its range).
    const baseIdx = Math.min(...trees.map((t) => a.histIndex(skill, t)).filter((i) => i >= 0));
    if (Number.isFinite(baseIdx)) {
      const covered = (idx) => a.pairs.some((o) => o.newRun && skillOf(o.newRun) === skill && a.histIndex(skill, o.oldRun.skill_tree) < idx && idx <= a.histIndex(skill, o.newRun.skill_tree) && a.histIndex(skill, o.oldRun.skill_tree) >= 0);
      const untested = hist.slice(baseIdx + 1).map((c, j) => ({ c, idx: baseIdx + 1 + j })).filter(({ idx }) => !covered(idx));
      out.push(`#### Skill commits with no pairwise comparison on record`, "");
      if (untested.length === 0) out.push("None.");
      else for (const { c } of untested.reverse()) out.push(`- ${code(short(c.commit))} ${cell(c.subject)}`);
      out.push("");
    }
  }
  return out;
}

// --- Per case -----------------------------------------------------------------------------------

const newestFirst = (x, y) => cmp(y.at, x.at) || cmp(y.run_id, x.run_id);

function scoreCells(row, dims) {
  if (row.status !== "ok") return dims.map(() => "");
  return dims.map((d) => (row.scores?.[d] ?? ""));
}

function criticCell(c) {
  return `${c.vendor} ${c.model_actual ?? c.model}${c.fallback ? " (fallback)" : ""}`;
}

function caseSection(a) {
  const out = ["## Per case", ""];
  if (a.runs.length === 0) return [...out, "No runs recorded yet.", ""];
  const byCase = groupBy(a.runs, (r) => `${r.domain}/${r.case_id}`);
  for (const key of [...byCase.keys()].sort()) {
    const list = byCase.get(key).slice().sort(newestFirst);
    const caseId = list[0].case_id;
    const trees = new Set(list.map((r) => r.skill_tree));
    out.push(`### ${key}`, "", `${plural(list.length, "run")} over ${plural(trees.size, "skill tree")}.${list.length === 1 ? " A single run is an anecdote." : ""}`, "");
    for (const [model, mruns] of [...groupBy(list, modelOf)].sort(([x], [y]) => cmp(x, y))) {
      out.push(`#### Writer ${cell(model)}`, "");
      // Publishable and the checklist live in the per-rubric tables below, never in one column.
      out.push("| Date | Run | Skill tree | Writer | Checks | Cost USD | Turns | Flags |");
      out.push("|---|---|---|---|---|---|---|---|");
      for (const r of mruns) {
        out.push(`| ${day(r.at)} | [${cell(r.run_id)}](${cell(r.path)}/run.json) | ${treeLabel(r.skill_tree)} | ${cell(r.writer.vendor)} | ${cell(checksCell(a.checkByRun.get(r.run_id)))} | ${money(r.cost_usd)} | ${cell(r.turns)} | ${cell(r.flags.join(", "))} |`);
      }
      out.push("");
      // Absolute scores: one table per rubric version, never mixed; the latest score per run.
      const ids = new Set(mruns.map((r) => r.run_id));
      const scoreRows = a.scores.filter((s) => ids.has(s.run_id));
      for (const [rubric, srows] of [...groupBy(scoreRows, (s) => s.rubric)].sort(([x], [y]) => cmp(x, y))) {
        const latest = [...latestBy(srows, (s) => s.run_id).values()];
        const dims = DIMS.filter((d) => latest.some((s) => s.scores && d in s.scores));
        out.push(`Absolute scores, rubric ${rubric} (diagnostic; 0-2):`, "");
        out.push(`| Run | Skill tree | Critic | ${dims.join(" | ")} | Publishable |`);
        out.push(`|---|---|---|${dims.map(() => "---|").join("")}---|`);
        for (const s of latest.sort((x, y) => newestFirst(a.runById.get(x.run_id), a.runById.get(y.run_id)))) {
          out.push(`| ${cell(s.run_id)} | ${treeLabel(a.runById.get(s.run_id).skill_tree)} | ${cell(criticCell(s.critic))} | ${scoreCells(s, dims).join(" | ")} | ${s.status === "ok" ? s.publishable : "critic failed"} |`);
        }
        out.push("");
      }
    }
    const casePairs = a.pairs.filter((o) => o.pair.case_id === caseId && o.pair.run_ids.every((id) => a.runById.get(id)?.domain === list[0].domain));
    if (casePairs.length) {
      out.push("Pairwise (blind, judged in both orders; a win only when both orders agree):", "");
      out.push("| Pair | Rubric | Critic | New | Old | AB | BA | Result | Owner |");
      out.push("|---|---|---|---|---|---|---|---|---|");
      for (const o of casePairs.sort((x, y) => cmp(x.pair.pair_id, y.pair.pair_id) || cmp(x.pair.rubric, y.pair.rubric))) {
        const [r1, r2] = o.pair.run_ids;
        const newId = o.newRun?.run_id ?? r1;
        const oldId = o.oldRun?.run_id ?? r2;
        const side = (id) => (id === null ? "tie" : id === newId ? (o.newRun ? "new" : "first") : id === oldId ? (o.oldRun ? "old" : "second") : id);
        const j = Object.fromEntries(o.pair.judgements.map((x) => [x.order, side(x.preferred_run_id ?? null)]));
        const result = o.outcome ? (o.outcome === "tie" ? `tie${o.split ? " (orders split)" : ""}` : `${o.outcome} for new`) : o.winner ? `${side(o.winner)} wins (same tree)` : `tie${o.split ? " (orders split)" : ""} (same tree)`;
        const op = a.ownerPairs.find((x) => x.owner.pair_id === o.pair.pair_id);
        out.push(`| ${cell(o.pair.pair_id)} | ${cell(o.pair.rubric)} | ${cell(criticCell(o.pair.critic))} | ${cell(newId)} | ${cell(oldId)} | ${j.AB ?? ""} | ${j.BA ?? ""} | ${result} | ${op ? cell(ownerVerdict(op, o)) : ""} |`);
      }
      out.push("");
    }
    const owners = a.owners.filter((o) => o.case_id === caseId).sort((x, y) => cmp(x.at, y.at));
    const rounds = owners.filter((o) => typeof o.rounds_to_publishable === "number");
    if (rounds.length) out.push(`Rounds to publishable (owner): ${rounds[rounds.length - 1].rounds_to_publishable} (recorded ${rounds[rounds.length - 1].at.slice(0, 10)}).`, "");
    const remarks = owners.filter((o) => o.remarks);
    if (remarks.length) {
      out.push("Owner remarks (verbatim):", "");
      for (const o of remarks) {
        const what = o.pair_id ? `pair ${o.pair_id}, preferred ${o.preferred}` : o.run_id ? `run ${o.run_id}` : "rounds";
        out.push(`${o.at.slice(0, 10)}, ${what}:`, "", ...quote(o.remarks), "");
      }
    }
  }
  return out;
}

// --- Noise --------------------------------------------------------------------------------------

const range = (vals) => (vals.length === 0 ? null : [Math.min(...vals), Math.max(...vals)]);
const fmtRange = (r) => (r === null ? "" : r[0] === r[1] ? `${r[0]}` : `${r[0]}-${r[1]}`);

// The comparison policy in one place: a change only when the ranges do not overlap, and never
// on a single run.
export function compareRanges(newVals, oldVals) {
  if (newVals.length === 0 || oldVals.length === 0) return "no data";
  if (newVals.length < 2 || oldVals.length < 2) return "anecdote (n=1)";
  const [n, o] = [range(newVals), range(oldVals)];
  if (n[0] > o[1]) return "higher";
  if (n[1] < o[0]) return "lower";
  return "no detectable change";
}

// The writer prompt a run was given, as a pooling key for the noise table (datapressr-hcn.24):
// the run row's writer.prompt_sha256 (rows since hcn.24), else the hash read from its run.json
// (ctx.prompts, gathered by reportContext), else the harness tree, which holds the stager that
// builds the prompt, so an unknown prompt never pools with a different harness.
export function promptKey(run, prompts = {}) {
  const sha = run.writer?.prompt_sha256 ?? prompts[run.run_id] ?? null;
  return sha ? { key: `prompt:${sha}`, label: `prompt ${code(short(sha))}` } : { key: `harness:${run.harness_tree}`, label: `harness tree ${code(short(run.harness_tree))} (prompt unknown)` };
}

function noiseSection(a, ctx = {}) {
  const out = ["## Noise", "", "Absolute scores per skill tree as min-max ranges with n (the latest score per run), one table per case, writer model, rubric and writer prompt: runs given different prompts (a harness change to the blind-run notes, or the no-skill arm) are never pooled. A difference is called a change only when the ranges do not overlap; otherwise \"no detectable change\". A single run is an anecdote. No standard deviations or p-values at these sample sizes.", ""];
  const okScores = a.scores.filter((s) => s.status === "ok" && a.runById.has(s.run_id));
  if (okScores.length === 0) return [...out, "No absolute scores recorded yet.", ""];
  const latest = [...latestBy(okScores, (s) => `${s.run_id}\u0000${s.rubric}`).values()];
  const groups = groupBy(latest, (s) => {
    const r = a.runById.get(s.run_id);
    const p = promptKey(r, ctx.prompts);
    return `${r.domain}/${r.case_id}\u0000${modelOf(r)}\u0000${s.rubric}\u0000${skillOf(r)}\u0000${p.key}\u0000${p.label}`;
  });
  for (const key of [...groups.keys()].sort()) {
    const [caseKey, model, rubric, skill, , promptLabel] = key.split("\u0000");
    const rows = groups.get(key);
    const dims = DIMS.filter((d) => rows.some((s) => d in (s.scores ?? {})));
    const byTree = groupBy(rows, (s) => a.runById.get(s.run_id).skill_tree);
    const trees = [...byTree.keys()].sort((x, y) => a.treeRank(skill, y) - a.treeRank(skill, x));
    const vals = (tree, d) => byTree.get(tree).map((s) => s.scores?.[d]).filter((v) => typeof v === "number");
    out.push(`### ${caseKey}, writer ${model}, rubric ${rubric}, ${promptLabel}`, "");
    out.push(`| Skill tree | n | ${dims.join(" | ")} |`, `|---|---|${dims.map(() => "---|").join("")}`);
    for (const t of trees) out.push(`| ${treeLabel(t)} | ${byTree.get(t).length}${byTree.get(t).length === 1 ? " (anecdote)" : ""} | ${dims.map((d) => fmtRange(range(vals(t, d)))).join(" | ")} |`);
    out.push("");
    if (trees.length > 1) {
      out.push(`| Comparison | ${dims.join(" | ")} |`, `|---|${dims.map(() => "---|").join("")}`);
      for (let i = 0; i < trees.length - 1; i++) {
        const [n, o] = [trees[i], trees[i + 1]];
        out.push(`| ${treeLabel(n)} vs ${treeLabel(o)} | ${dims.map((d) => compareRanges(vals(n, d), vals(o, d))).join(" | ")} |`);
      }
      out.push("");
    }
  }
  // Critic-only spread: the same run scored more than once under the same rubric.
  const rescored = [...groupBy(okScores, (s) => `${s.run_id}\u0000${s.rubric}`)].filter(([, l]) => l.length > 1).sort(([x], [y]) => cmp(x, y));
  out.push("### Critic-only spread (one run re-scored)", "");
  if (rescored.length === 0) out.push("No run has been re-scored yet.", "");
  else {
    const dims = DIMS.filter((d) => rescored.some(([, l]) => l.some((s) => d in (s.scores ?? {}))));
    out.push(`| Run | Rubric | n | ${dims.join(" | ")} |`, `|---|---|---|${dims.map(() => "---|").join("")}`);
    for (const [k, l] of rescored) {
      const [runId, rubric] = k.split("\u0000");
      out.push(`| ${cell(runId)} | ${cell(rubric)} | ${l.length} | ${dims.map((d) => fmtRange(range(l.map((s) => s.scores?.[d]).filter((v) => typeof v === "number")))).join(" | ")} |`);
    }
    out.push("");
  }
  return out;
}

// --- Harness quality ----------------------------------------------------------------------------

// Judge-owner agreement on one pair: the owner's preferred run (null for "neither") against the
// critic's pair result (null for a tie). Agreement when they name the same run, or both neither/tie.
export function agreement(ownerPreferredRunId, criticWinnerRunId) {
  return (ownerPreferredRunId ?? null) === (criticWinnerRunId ?? null);
}

function harnessSection(rows, a, ctx) {
  const out = ["## Harness quality", ""];
  // Agreement per rubric version.
  out.push("### Judge-owner agreement on pairs", "");
  const revealed = a.ownerPairs.filter((op) => op.reveal);
  const perRubric = groupBy(a.pairs.filter((o) => revealed.some((op) => op.owner.pair_id === o.pair.pair_id)), (o) => o.pair.rubric);
  if (perRubric.size === 0) out.push(`No owner-judged pairs yet. The critic's pairwise verdict stands alone for small edits only once it matches the owner in ${AGREEMENT_BAR} pairs.`, "");
  for (const rubric of [...perRubric.keys()].sort()) {
    const list = perRubric.get(rubric).sort((x, y) => cmp(x.pair.pair_id, y.pair.pair_id));
    const results = list.map((o) => {
      const op = revealed.find((x) => x.owner.pair_id === o.pair.pair_id);
      return { o, op, agree: agreement(op.preferredRun, o.winner) };
    });
    const k = results.filter((r) => r.agree).length;
    out.push(`Rubric ${rubric}: critic agrees with the owner on ${k} of ${plural(results.length, "pair")} (bar for the critic to stand alone: ${AGREEMENT_BAR}).`, "");
    out.push("| Pair | Case | Owner | Critic | Agree |", "|---|---|---|---|---|");
    const side = (o, id) => (id === null ? "neither/tie" : o.newRun ? (id === o.newRun.run_id ? "new" : "old") : id);
    for (const { o, op, agree } of results) out.push(`| ${cell(o.pair.pair_id)} | ${cell(o.pair.case_id)} | ${side(o, op.preferredRun)} | ${side(o, o.winner)}${o.split ? " (orders split)" : ""} | ${agree ? "yes" : "no"} |`);
    out.push("");
  }
  const pending = a.ownerPairs.filter((op) => !op.reveal);
  if (pending.length) out.push(`Owner rows awaiting reveal: ${pending.map((op) => op.owner.pair_id).sort().join(", ")} (run \`node evals/run.mjs owner <pair_id> --reveal\`).`, "");

  // Owner checklist scores against the critic's, where both exist.
  const ownerScored = [];
  for (const o of a.owners.filter((x) => x.scores && Object.keys(x.scores).length)) {
    if (o.run_id) ownerScored.push({ run_id: o.run_id, scores: o.scores });
    else if (o.pair_id) {
      const rv = rows.filter((r) => r.kind === "reveal" && r.pair_id === o.pair_id).pop();
      if (!rv) continue;
      for (const label of ["A", "B"]) {
        const s = Object.fromEntries(Object.entries(o.scores).filter(([k]) => k.startsWith(`${label}.`)).map(([k, v]) => [k.slice(2), v]));
        if (Object.keys(s).length) ownerScored.push({ run_id: rv.mapping[label], scores: s });
      }
    }
  }
  if (ownerScored.length) {
    out.push("### Owner vs critic checklist scores", "");
    const byRubric = new Map();
    for (const os of ownerScored) {
      const critic = [...latestBy(a.scores.filter((s) => s.run_id === os.run_id && s.status === "ok"), (s) => s.rubric).values()];
      for (const cs of critic) {
        const dims = Object.keys(os.scores).filter((d) => typeof cs.scores?.[d] === "number");
        const acc = byRubric.get(cs.rubric) ?? { same: 0, n: 0, runs: new Set() };
        for (const d of dims) {
          acc.n++;
          if (cs.scores[d] === os.scores[d]) acc.same++;
        }
        acc.runs.add(os.run_id);
        byRubric.set(cs.rubric, acc);
      }
    }
    if (byRubric.size === 0) out.push("Owner scores recorded, but no critic scores on the same runs yet.", "");
    for (const rubric of [...byRubric.keys()].sort()) {
      const acc = byRubric.get(rubric);
      out.push(`- Rubric ${rubric}: ${acc.same} of ${acc.n} dimension scores equal across ${plural(acc.runs.size, "run")}.`);
    }
    out.push("");
  }

  out.push("### Calibration", "");
  if (!ctx.calibration?.length) out.push("No calibration hit rates recorded yet (datapressr-hcn.8 writes them to `evals/calibration/<domain>/*.json`).", "");
  else {
    out.push("| Rubric | Set | Hits |", "|---|---|---|");
    for (const c of ctx.calibration.slice().sort((x, y) => cmp(x.rubric, y.rubric) || cmp(x.label, y.label))) out.push(`| ${cell(c.rubric)} | ${cell(c.label)} | ${c.hits} of ${c.total} |`);
    out.push("");
  }

  out.push("### Critic and isolation", "");
  const critiques = rows.filter((r) => r.kind === "score" || r.kind === "pair");
  const fallback = critiques.filter((r) => r.critic?.fallback).length;
  const scoreRows = rows.filter((r) => r.kind === "score");
  const failed = scoreRows.filter((r) => r.status === "critic_failed").length;
  const leaked = a.runs.filter((r) => r.flags.includes("leaked")).length;
  out.push(`- Critic fallback: ${fallback} of ${plural(critiques.length, "critique")} (absolute and pairwise) used the fallback critic.`);
  out.push(`- Critic validation failures: ${failed} of ${plural(scoreRows.length, "absolute critique")} recorded as critic_failed.`);
  out.push(`- Leaks caught: ${leaked} of ${plural(a.runs.length, "run")} flagged leaked.`);
  out.push("");

  out.push("Canary status (latest per vendor, CLI version and mode; weakened canaries are negative controls and must fail):", "");
  const canaries = rows.filter((r) => r.kind === "canary");
  const latestCanary = [...latestBy(canaries, (r) => `${r.vendor}\u0000${r.cli_version}\u0000${r.mode}\u0000${r.weakened ? 1 : 0}`).values()];
  const installed = canaryStatus(rows, ctx);
  if (latestCanary.length === 0 && installed.length === 0) out.push("No canaries recorded yet.", "");
  else {
    out.push("| Vendor | CLI | Mode | Kind | Latest | Result |", "|---|---|---|---|---|---|");
    for (const r of latestCanary.sort((x, y) => cmp(x.vendor, y.vendor) || cmp(x.cli_version, y.cli_version) || cmp(x.mode, y.mode) || cmp(Boolean(x.weakened), Boolean(y.weakened)))) {
      out.push(`| ${cell(r.vendor)} | ${cell(r.cli_version)} | ${cell(r.mode)} | ${r.weakened ? "weakened" : "recipe"} | ${cell(r.run_id)} | ${r.pass ? "PASS" : r.weakened ? "FAIL (expected)" : "FAIL"} |`);
    }
    out.push("");
    for (const s of installed) {
      const state = { "not-installed": "not installed here", missing: "no canary on record", pass: "canary passed", fail: "latest canary failed" }[s.state];
      out.push(`- Installed ${s.vendor} CLI: ${s.cli_version ?? "none"} (${s.mode} mode): ${state}.`);
    }
    if (installed.length) out.push("");
  }
  return out;
}

export function renderReport(rows, ctx = {}) {
  const a = analyse(rows, ctx);
  const out = [
    "# Eval report",
    "",
    "Generated from `evals/ledger.jsonl` by `node evals/run.mjs report` (or `npm run eval:report`); do not edit by hand. Three layers, never averaged: deterministic checks (the only automatic regressions), the critic's blind order-swapped pairwise verdicts with its 0-2 checklist as a diagnostic, and the owner's blind preferences and verbatim remarks.",
    "",
    ...flagsSection(rows, a, ctx),
    ...skillSection(a, ctx),
    ...caseSection(a),
    ...noiseSection(a, ctx),
    ...harnessSection(rows, a, ctx),
  ];
  while (out[out.length - 1] === "") out.pop();
  return `${out.join("\n")}\n`;
}

// --- Context from git and the installed CLIs -----------------------------------------------------

function gitOut(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

// Commits touching skills/<name>, oldest first, each with the skill's tree at that commit.
export function skillHistory(root, name) {
  let log;
  try {
    log = gitOut(root, ["log", "--reverse", "--format=%H%x09%s", "HEAD", "--", `skills/${name}`]);
  } catch {
    return [];
  }
  const out = [];
  for (const line of log.split("\n").filter(Boolean)) {
    const [commit, ...subject] = line.split("\t");
    let tree;
    try {
      tree = gitOut(root, ["rev-parse", "--verify", "--quiet", `${commit}:skills/${name}`]);
    } catch {
      continue; // the skill was deleted at this commit
    }
    out.push({ commit, tree, subject: subject.join("\t") });
  }
  return out;
}

function githubUrl(root) {
  try {
    const url = gitOut(root, ["remote", "get-url", "origin"]);
    const m = url.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
    return m ? `https://github.com/${m[1]}` : null;
  } catch {
    return null;
  }
}

function readCalibration(evalsDir) {
  const dir = join(evalsDir, "calibration");
  if (!existsSync(dir)) return [];
  const out = [];
  for (const domain of readdirSync(dir).sort()) {
    const sub = join(dir, domain);
    let files;
    try {
      files = readdirSync(sub).filter((f) => f.endsWith(".json")).sort();
    } catch {
      continue;
    }
    for (const f of files) {
      const data = JSON.parse(readFileSync(join(sub, f), "utf8"));
      for (const c of Array.isArray(data) ? data : [data]) {
        if (typeof c?.hits === "number" && typeof c?.total === "number") out.push({ rubric: c.rubric ?? domain, label: c.label ?? f, hits: c.hits, total: c.total });
      }
    }
  }
  return out;
}

// Vendors whose writer runs behind a canary. The Codex adapter (datapressr-hcn.4) can join this
// list with the same cliVersion/recipeHash exports.
const CANARY_ADAPTERS = [claude];

// Writer prompt hashes from run.json for run rows that predate writer.prompt_sha256 in the ledger.
export function readPrompts(evalsDir, rows) {
  const prompts = {};
  for (const r of rows.filter((x) => x.kind === "run" && !x.writer?.prompt_sha256 && x.path)) {
    try {
      const sha = JSON.parse(readFileSync(join(evalsDir, r.path, "run.json"), "utf8")).writer?.prompt_sha256;
      if (sha) prompts[r.run_id] = sha;
    } catch {
      // no run.json (or unreadable): the report falls back to the harness tree
    }
  }
  return prompts;
}

export function reportContext(root, evalsDir, rows, { adapters = CANARY_ADAPTERS } = {}) {
  const skills = {};
  for (const name of new Set(rows.filter((r) => r.kind === "run").map(skillOf))) skills[name] = skillHistory(root, name);
  const canary = [];
  for (const ad of adapters) {
    let version = null;
    try {
      version = ad.cliVersion();
    } catch {
      version = null;
    }
    const modes = new Set(["fixed", ...rows.filter((r) => r.kind === "canary" && r.vendor === ad.vendor).map((r) => r.mode)]);
    for (const mode of [...modes].sort()) {
      let recipe = null;
      try {
        recipe = ad.recipeHash(mode);
      } catch {
        recipe = null;
      }
      canary.push({ vendor: ad.vendor, cli_version: version, recipe_sha256: recipe, mode });
    }
  }
  return { skills, canary, calibration: readCalibration(evalsDir), repoUrl: githubUrl(root), prompts: readPrompts(evalsDir, rows) };
}

export function writeReport(ledgerFile, reportFile, ctx) {
  const rows = readLedger(ledgerFile);
  const evalsDir = dirname(ledgerFile);
  let context = ctx;
  if (!context) {
    let root = null;
    try {
      root = gitOut(evalsDir, ["rev-parse", "--show-toplevel"]);
    } catch {
      root = null;
    }
    context = root ? reportContext(root, evalsDir, rows) : {};
  }
  const md = renderReport(rows, context);
  writeFileSync(reportFile, md);
  return md;
}
