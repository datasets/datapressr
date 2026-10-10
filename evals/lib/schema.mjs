// Plain validators for the harness's JSON files and ledger rows (design section 3).
// Each validator returns { ok, errors } and never throws; callers decide whether to fail.
// No dependencies: the shapes are small enough that hand-written checks stay readable.

export const LEDGER_SCHEMA = 1;

// Story question types, plus "wrangling" for structure cases (datapressr-8no.2).
export const CASE_TYPES = ["explanatory", "historical", "current-state", "markets", "periodic", "wrangling"];
export const DATA_MODES = ["fixed", "open"];
export const VENDORS = ["claude", "codex", "fake"];
export const RUN_FLAGS = ["leaked", "over_budget", "failed", "dirty_skill", "fallback_critic", "no_skill"];
export const LEDGER_KINDS = ["canary", "run", "check", "score", "pair", "owner", "reveal"];
export const SCORE_DIMENSIONS = ["argument", "depth", "charts", "honesty", "reader_questions", "prose"];
export const OPEN_MODE_DIMENSIONS = ["data_choice"];

const SHA256 = /^[0-9a-f]{64}$/;
const GIT_OBJECT = /^[0-9a-f]{40}$/;
const COMMIT_REF = /^[0-9a-f]{7,40}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

// A tiny collector: each check pushes a message when it fails.
function checker() {
  const errors = [];
  const at = (path, msg) => errors.push(`${path}: ${msg}`);
  const c = {
    errors,
    at,
    isObject(v, path) {
      if (v === null || typeof v !== "object" || Array.isArray(v)) {
        at(path, "must be an object");
        return false;
      }
      return true;
    },
    string(v, path, { pattern, optional = false, nullable = false, nonEmpty = true } = {}) {
      if (v === undefined && optional) return true;
      if (v === null && nullable) return true;
      if (typeof v !== "string" || (nonEmpty && v.trim() === "")) {
        at(path, `must be a ${nonEmpty ? "non-empty " : ""}string`);
        return false;
      }
      if (pattern && !pattern.test(v)) {
        at(path, `"${v}" does not match ${pattern}`);
        return false;
      }
      return true;
    },
    oneOf(v, values, path, { optional = false, nullable = false } = {}) {
      if (v === undefined && optional) return true;
      if (v === null && nullable) return true;
      if (!values.includes(v)) {
        at(path, `must be one of ${values.join(", ")} (got ${JSON.stringify(v)})`);
        return false;
      }
      return true;
    },
    number(v, path, { min, max, integer = false, optional = false, nullable = false } = {}) {
      if (v === undefined && optional) return true;
      if (v === null && nullable) return true;
      if (typeof v !== "number" || !Number.isFinite(v) || (integer && !Number.isInteger(v))) {
        at(path, `must be ${integer ? "an integer" : "a number"}`);
        return false;
      }
      if (min !== undefined && v < min) return at(path, `must be >= ${min} (got ${v})`), false;
      if (max !== undefined && v > max) return at(path, `must be <= ${max} (got ${v})`), false;
      return true;
    },
    bool(v, path, { optional = false } = {}) {
      if (v === undefined && optional) return true;
      if (typeof v !== "boolean") return at(path, "must be a boolean"), false;
      return true;
    },
    array(v, path, { optional = false, minItems = 0, maxItems } = {}) {
      if (v === undefined && optional) return false;
      if (!Array.isArray(v)) return at(path, "must be an array"), false;
      if (v.length < minItems) return at(path, `must have at least ${minItems} item(s)`), false;
      if (maxItems !== undefined && v.length > maxItems) return at(path, `must have at most ${maxItems} item(s)`), false;
      return true;
    },
    relPath(v, path) {
      if (!c.string(v, path)) return false;
      if (v.startsWith("/") || v.split("/").includes("..")) return at(path, `must be a relative path inside the tree (got "${v}")`), false;
      return true;
    },
    result() {
      return { ok: errors.length === 0, errors };
    },
  };
  return c;
}

// --- 3.1 Case ---------------------------------------------------------------

// opts.isAncestor(commit) -> boolean: when given, every input commit must be an ancestor of main.
// The loader always passes it (lib/versions.mjs isAncestorOfMain); pure shape checks can omit it.
export function validateCase(kase, opts = {}) {
  const c = checker();
  if (!c.isObject(kase, "case")) return c.result();
  c.string(kase.id, "id", { pattern: SLUG });
  c.string(kase.domain, "domain", { pattern: SLUG });
  c.string(kase.title, "title");
  c.string(kase.question, "question");
  c.oneOf(kase.type, CASE_TYPES, "type");
  c.oneOf(kase.data_mode, DATA_MODES, "data_mode");
  c.string(kase.as_of, "as_of", { pattern: ISO_DATE, optional: true });

  if (c.array(kase.inputs, "inputs")) {
    if (kase.data_mode === "fixed" && kase.inputs.length === 0) c.at("inputs", "a fixed-mode case needs at least one input");
    kase.inputs.forEach((input, i) => {
      const p = `inputs[${i}]`;
      if (!c.isObject(input, p)) return;
      c.relPath(input.path, `${p}.path`);
      if (c.string(input.commit, `${p}.commit`, { pattern: COMMIT_REF }) && typeof opts.isAncestor === "function") {
        if (!opts.isAncestor(input.commit)) c.at(`${p}.commit`, `${input.commit} is not an ancestor of main (pin a commit that is on main)`);
      }
    });
  }

  if (c.array(kase.skills, "skills", { minItems: 1 })) {
    kase.skills.forEach((s, i) => c.string(s, `skills[${i}]`, { pattern: SLUG }));
  }

  if (c.array(kase.references, "references")) {
    kase.references.forEach((r, i) => {
      const p = `references[${i}]`;
      if (!c.isObject(r, p)) return;
      c.string(r.title, `${p}.title`);
      c.string(r.url, `${p}.url`);
      c.string(r.archive_url, `${p}.archive_url`, { optional: true, nullable: true });
      c.bool(r.answers_same_question, `${p}.answers_same_question`);
      if (c.array(r.key_findings, `${p}.key_findings`)) r.key_findings.forEach((f, j) => c.string(f, `${p}.key_findings[${j}]`));
    });
  }

  if (c.array(kase.owner_feedback, "owner_feedback")) {
    kase.owner_feedback.forEach((f, i) => {
      if (c.relPath(f, `owner_feedback[${i}]`) && !f.startsWith("docs/reviews/")) c.at(`owner_feedback[${i}]`, "must be a path in docs/reviews/");
    });
  }

  if (c.isObject(kase.budget, "budget")) {
    c.number(kase.budget.max_usd, "budget.max_usd", { min: 0 });
    c.number(kase.budget.max_turns, "budget.max_turns", { min: 1, integer: true });
    // A word budget is a story constraint; other domains (structure) may omit it.
    const w = kase.budget.words;
    if ((kase.domain === "story" || w !== undefined) && c.array(w, "budget.words", { minItems: 2, maxItems: 2 })) {
      if (c.number(w[0], "budget.words[0]", { min: 1, integer: true }) && c.number(w[1], "budget.words[1]", { min: 1, integer: true }) && w[0] >= w[1]) {
        c.at("budget.words", "minimum must be below maximum");
      }
    }
  }

  if (kase.forbidden_domains !== undefined && c.array(kase.forbidden_domains, "forbidden_domains")) {
    kase.forbidden_domains.forEach((d, i) => c.string(d, `forbidden_domains[${i}]`));
  }
  return c.result();
}

// --- 3.2 Run ----------------------------------------------------------------

export function validateRun(run) {
  const c = checker();
  if (!c.isObject(run, "run")) return c.result();
  c.string(run.run_id, "run_id", { pattern: /^\d{8}-\d{4}-[a-z0-9-]+-\d+$/ });
  c.string(run.case_id, "case_id", { pattern: SLUG });
  c.string(run.domain, "domain", { pattern: SLUG });
  c.string(run.case_hash, "case_hash", { pattern: SHA256 });

  if (c.isObject(run.skill, "skill")) {
    c.string(run.skill.name, "skill.name", { pattern: SLUG });
    c.string(run.skill.ref, "skill.ref", { pattern: GIT_OBJECT });
    c.string(run.skill.tree, "skill.tree", { pattern: GIT_OBJECT });
    c.bool(run.skill.dirty, "skill.dirty");
  }
  if (c.isObject(run.harness, "harness")) {
    c.string(run.harness.tree, "harness.tree", { pattern: GIT_OBJECT });
    c.bool(run.harness.dirty, "harness.dirty");
    c.string(run.harness.recipe_sha256, "harness.recipe_sha256", { pattern: SHA256, nullable: true });
  }
  if (c.isObject(run.writer, "writer")) {
    c.oneOf(run.writer.vendor, VENDORS, "writer.vendor");
    c.string(run.writer.model, "writer.model");
    c.string(run.writer.model_actual, "writer.model_actual", { nullable: true });
    c.string(run.writer.cli_version, "writer.cli_version", { nullable: true });
    c.string(run.writer.prompt_sha256, "writer.prompt_sha256", { pattern: SHA256 });
  }
  if (c.isObject(run.isolation, "isolation")) {
    c.string(run.isolation.canary_run_id, "isolation.canary_run_id", { nullable: true });
    c.bool(run.isolation.network, "isolation.network");
    c.array(run.isolation.leaks, "isolation.leaks");
  }
  c.string(run.started_at, "started_at", { pattern: ISO_DATETIME });
  c.number(run.duration_ms, "duration_ms", { min: 0 });
  c.number(run.turns, "turns", { min: 0, integer: true, nullable: true });
  c.number(run.cost_usd, "cost_usd", { min: 0, nullable: true });
  c.oneOf(run.cost_basis, ["list"], "cost_basis", { nullable: true });
  if (run.usage !== null) c.isObject(run.usage, "usage");

  if (c.array(run.artefacts, "artefacts")) {
    run.artefacts.forEach((a, i) => {
      const p = `artefacts[${i}]`;
      if (!c.isObject(a, p)) return;
      c.relPath(a.path, `${p}.path`);
      c.string(a.sha256, `${p}.sha256`, { pattern: SHA256 });
      c.number(a.bytes, `${p}.bytes`, { min: 0, integer: true });
    });
  }
  c.string(run.transcript_sha256, "transcript_sha256", { pattern: SHA256, nullable: true });
  c.string(run.workspace_sha256, "workspace_sha256", { pattern: SHA256, nullable: true });
  if (c.array(run.flags, "flags")) run.flags.forEach((f, i) => c.oneOf(f, RUN_FLAGS, `flags[${i}]`));
  return c.result();
}

// --- 3.3 Checks -------------------------------------------------------------

export function validateChecks(checks) {
  const c = checker();
  if (!c.isObject(checks, "checks")) return c.result();
  c.string(checks.checker, "checker", { pattern: SLUG });
  if (c.array(checks.results, "results")) {
    checks.results.forEach((r, i) => {
      const p = `results[${i}]`;
      if (!c.isObject(r, p)) return;
      c.string(r.id, `${p}.id`);
      c.bool(r.pass, `${p}.pass`);
      c.oneOf(r.severity, ["fail", "warn"], `${p}.severity`);
      c.string(r.message, `${p}.message`, { nonEmpty: false });
    });
  }
  return c.result();
}

// --- 3.4 Critique -----------------------------------------------------------

// "set-aside": fixed mode, rubric story/v2 on: the question needs evidence outside the given data.
const READER_ANSWERS = ["yes", "partly", "no", "set-aside"];

function checkCritic(c, critic, path) {
  if (!c.isObject(critic, path)) return;
  c.oneOf(critic.vendor, VENDORS, `${path}.vendor`);
  c.string(critic.model, `${path}.model`);
  c.string(critic.model_actual, `${path}.model_actual`, { nullable: true });
  c.bool(critic.fallback, `${path}.fallback`);
  c.string(critic.fallback_reason, `${path}.fallback_reason`, { nullable: true, optional: true });
}

function checkScore(c, s, path) {
  if (!c.isObject(s, path)) return;
  c.number(s.score, `${path}.score`, { min: 0, max: 2, integer: true });
  c.string(s.why, `${path}.why`);
}

// opts.data_mode === "open" additionally requires the data_choice score.
export function validateCritiqueAbsolute(cq, opts = {}) {
  const c = checker();
  if (!c.isObject(cq, "critique")) return c.result();
  c.string(cq.rubric, "rubric");
  checkCritic(c, cq.critic, "critic");
  if (c.array(cq.reader_questions, "reader_questions")) {
    cq.reader_questions.forEach((q, i) => {
      const p = `reader_questions[${i}]`;
      if (!c.isObject(q, p)) return;
      c.string(q.q, `${p}.q`);
      c.oneOf(q.answered, READER_ANSWERS, `${p}.answered`);
      c.string(q.where, `${p}.where`, { nonEmpty: false, nullable: true });
    });
  }
  if (c.array(cq.missed_findings, "missed_findings")) cq.missed_findings.forEach((f, i) => c.string(f, `missed_findings[${i}]`));
  if (c.array(cq.charts, "charts")) {
    cq.charts.forEach((ch, i) => {
      const p = `charts[${i}]`;
      if (!c.isObject(ch, p)) return;
      c.string(ch.file, `${p}.file`);
      c.string(ch.shows, `${p}.shows`);
      c.bool(ch.form_fits, `${p}.form_fits`);
      c.string(ch.fix, `${p}.fix`, { nonEmpty: false, nullable: true });
      // Chart reading (rubric story/v2 on): optional, all four or none.
      if ("glance" in ch || "encodings" in ch) {
        c.string(ch.glance, `${p}.glance`);
        c.bool(ch.glance_matches_prose, `${p}.glance_matches_prose`);
        c.string(ch.encodings, `${p}.encodings`);
        c.bool(ch.encodings_clear, `${p}.encodings_clear`);
      }
    });
  }
  c.string(cq.top_change, "top_change");
  c.oneOf(cq.publishable, ["yes", "with-edits", "no"], "publishable");
  if (c.array(cq.lessons, "lessons", { maxItems: 5 })) {
    cq.lessons.forEach((l, i) => {
      if (!c.isObject(l, `lessons[${i}]`)) return;
      c.string(l.rule, `lessons[${i}].rule`);
      c.string(l.evidence, `lessons[${i}].evidence`);
    });
  }
  if (c.isObject(cq.scores, "scores")) {
    const required = opts.data_mode === "open" ? [...SCORE_DIMENSIONS, ...OPEN_MODE_DIMENSIONS] : SCORE_DIMENSIONS;
    for (const dim of required) checkScore(c, cq.scores[dim], `scores.${dim}`);
    for (const dim of Object.keys(cq.scores)) {
      if (![...SCORE_DIMENSIONS, ...OPEN_MODE_DIMENSIONS].includes(dim)) c.at(`scores.${dim}`, "unknown score dimension");
      else if (!required.includes(dim)) checkScore(c, cq.scores[dim], `scores.${dim}`);
    }
  }
  return c.result();
}

export function validateCritiquePairwise(cq) {
  const c = checker();
  if (!c.isObject(cq, "critique")) return c.result();
  c.string(cq.rubric, "rubric");
  checkCritic(c, cq.critic, "critic");
  c.oneOf(cq.order, ["AB", "BA"], "order");
  c.oneOf(cq.preferred, ["A", "B", "tie"], "preferred");
  c.oneOf(cq.margin, ["clear", "slight"], "margin", { nullable: cq.preferred === "tie" });
  c.string(cq.why, "why");
  if (c.array(cq.reader_questions, "reader_questions")) {
    cq.reader_questions.forEach((q, i) => {
      const p = `reader_questions[${i}]`;
      if (!c.isObject(q, p)) return;
      c.string(q.q, `${p}.q`);
      c.oneOf(q.A, READER_ANSWERS, `${p}.A`);
      c.oneOf(q.B, READER_ANSWERS, `${p}.B`);
    });
  }
  return c.result();
}

// --- 3.5 Ledger rows (including owner rows) ---------------------------------

function checkBase(c, row, kind) {
  if (row.schema !== LEDGER_SCHEMA) c.at("schema", `must be ${LEDGER_SCHEMA} (got ${JSON.stringify(row.schema)})`);
  if (kind) c.oneOf(row.kind, [kind], "kind");
  else c.oneOf(row.kind, LEDGER_KINDS, "kind");
  c.string(row.at, "at", { pattern: ISO_DATETIME });
}

const ROW_CHECKS = {
  canary(c, r) {
    c.string(r.run_id, "run_id");
    c.oneOf(r.vendor, VENDORS, "vendor");
    c.string(r.cli_version, "cli_version");
    c.string(r.recipe_sha256, "recipe_sha256", { pattern: SHA256 });
    c.oneOf(r.mode, DATA_MODES, "mode");
    c.bool(r.pass, "pass");
  },
  run(c, r) {
    c.string(r.run_id, "run_id");
    c.string(r.case_id, "case_id", { pattern: SLUG });
    c.string(r.domain, "domain", { pattern: SLUG });
    c.relPath(r.path, "path");
    c.string(r.case_hash, "case_hash", { pattern: SHA256 });
    c.string(r.skill_tree, "skill_tree", { pattern: GIT_OBJECT });
    c.string(r.harness_tree, "harness_tree", { pattern: GIT_OBJECT });
    // skill_name and skill_ref arrived with datapressr-hcn.9; older rows lack them (the report
    // falls back to the domain as the skill name).
    c.string(r.skill_name, "skill_name", { pattern: SLUG, optional: true });
    c.string(r.skill_ref, "skill_ref", { pattern: GIT_OBJECT, optional: true });
    if (c.isObject(r.writer, "writer")) {
      c.oneOf(r.writer.vendor, VENDORS, "writer.vendor");
      c.string(r.writer.model, "writer.model");
      c.string(r.writer.model_actual, "writer.model_actual", { nullable: true });
      c.string(r.writer.cli_version, "writer.cli_version", { nullable: true, optional: true });
    }
    c.number(r.turns, "turns", { min: 0, integer: true, nullable: true });
    c.number(r.cost_usd, "cost_usd", { min: 0, nullable: true });
    if (c.array(r.flags, "flags")) r.flags.forEach((f, i) => c.oneOf(f, RUN_FLAGS, `flags[${i}]`));
  },
  check(c, r) {
    c.string(r.run_id, "run_id");
    c.string(r.checker, "checker", { pattern: SLUG });
    c.string(r.harness_tree, "harness_tree", { pattern: GIT_OBJECT });
    if (c.array(r.failed, "failed")) r.failed.forEach((id, i) => c.string(id, `failed[${i}]`));
    if (c.array(r.warned, "warned")) r.warned.forEach((id, i) => c.string(id, `warned[${i}]`));
    c.number(r.passed, "passed", { min: 0, integer: true });
  },
  score(c, r) {
    c.string(r.run_id, "run_id");
    c.string(r.rubric, "rubric");
    checkCritic(c, r.critic, "critic");
    c.oneOf(r.status, ["ok", "critic_failed"], "status");
    if (r.status === "ok") {
      c.oneOf(r.publishable, ["yes", "with-edits", "no"], "publishable");
      if (c.isObject(r.scores, "scores")) {
        for (const [dim, v] of Object.entries(r.scores)) {
          if (![...SCORE_DIMENSIONS, ...OPEN_MODE_DIMENSIONS].includes(dim)) c.at(`scores.${dim}`, "unknown score dimension");
          c.number(v, `scores.${dim}`, { min: 0, max: 2, integer: true });
        }
      }
    }
  },
  pair(c, r) {
    c.string(r.pair_id, "pair_id");
    c.string(r.case_id, "case_id", { pattern: SLUG });
    if (c.array(r.run_ids, "run_ids", { minItems: 2, maxItems: 2 })) r.run_ids.forEach((id, i) => c.string(id, `run_ids[${i}]`));
    c.string(r.rubric, "rubric");
    checkCritic(c, r.critic, "critic");
    if (c.array(r.judgements, "judgements", { minItems: 2, maxItems: 2 })) {
      r.judgements.forEach((j, i) => {
        if (!c.isObject(j, `judgements[${i}]`)) return;
        c.oneOf(j.order, ["AB", "BA"], `judgements[${i}].order`);
        // Resolved to the run that was preferred (or null for a tie) once the mapping is applied.
        c.string(j.preferred_run_id, `judgements[${i}].preferred_run_id`, { nullable: true });
      });
    }
    // A win only when both orders agree; otherwise a tie (null).
    c.string(r.winner_run_id, "winner_run_id", { nullable: true });
  },
  // A pair row (blind preference), a single-run row (remarks on one story), or a rounds-only row
  // (owner --rounds <case> <n>: how many review rounds a story took to reach the site).
  owner(c, r) {
    c.string(r.case_id, "case_id", { pattern: SLUG });
    const hasPair = typeof r.pair_id === "string" && r.pair_id !== "";
    const hasRun = typeof r.run_id === "string" && r.run_id !== "";
    const roundsOnly = !hasPair && !hasRun && typeof r.rounds_to_publishable === "number";
    if (hasPair && hasRun) c.at("pair_id|run_id", "exactly one of pair_id or run_id is required");
    else if (!hasPair && !hasRun && !roundsOnly) c.at("pair_id|run_id", "exactly one of pair_id or run_id is required (or rounds_to_publishable alone)");
    if (hasPair) c.oneOf(r.preferred, ["A", "B", "neither"], "preferred");
    else c.oneOf(r.preferred, ["A", "B", "neither"], "preferred", { optional: true, nullable: true });
    c.string(r.remarks, "remarks", { optional: roundsOnly });
    if (r.scores !== undefined && r.scores !== null && c.isObject(r.scores, "scores")) {
      for (const [dim, v] of Object.entries(r.scores)) c.number(v, `scores.${dim}`, { min: 0, max: 2, integer: true });
    }
    c.number(r.rounds_to_publishable, "rounds_to_publishable", { min: 0, integer: true, optional: true, nullable: true });
  },
  // Written by `owner` only after the owner row: which run the owner saw as A and B, and the run
  // the owner preferred (null for "neither"). mapping.json stays gitignored; this row is the record.
  reveal(c, r) {
    c.string(r.pair_id, "pair_id");
    c.string(r.case_id, "case_id", { pattern: SLUG });
    c.string(r.owner_at, "owner_at", { pattern: ISO_DATETIME });
    if (c.isObject(r.mapping, "mapping")) {
      c.string(r.mapping.A, "mapping.A");
      c.string(r.mapping.B, "mapping.B");
    }
    c.string(r.preferred_run_id, "preferred_run_id", { nullable: true });
  },
};

export function validateLedgerRow(row) {
  const c = checker();
  if (!c.isObject(row, "row")) return c.result();
  checkBase(c, row);
  const check = ROW_CHECKS[row.kind];
  if (check) check(c, row);
  return c.result();
}

export function validateOwner(row) {
  const c = checker();
  if (!c.isObject(row, "row")) return c.result();
  checkBase(c, row, "owner");
  ROW_CHECKS.owner(c, row);
  return c.result();
}

// Throw with every error listed; for write paths where a malformed file must fail loudly.
export function assertValid(result, what) {
  if (!result.ok) throw new Error(`invalid ${what}:\n  ${result.errors.join("\n  ")}`);
}
