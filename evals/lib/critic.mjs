// The critic (design section 5.2, review issues 2-4; datapressr-hcn.5): prompt assembly, the
// absolute and order-swapped pairwise modes, JSON validation with one retry, and Markdown
// rendering. Subcommands:
//
//   score <run_id|--all> [--rubric story/v1] [--critic auto|claude|codex|fake] [--critic-model <id>] [--calibrate]
//   pair <run_id> <run_id> [--rubric story/v1] [--critic auto|claude|codex|fake] [--critic-model <id>] [--calibrate]
//
// Every critique takes two calls per mode. First the critic writes the commissioning reader's
// questions from the case question alone, before it sees any story (review issue 4); then it
// reads the story (or both stories) and judges, with those questions fixed in the prompt.
//
// What the critic sees: the rubric's sections for the step, the case question, type, data mode
// and as_of, the case's references, the story's outline (absolute mode only), its prose with the
// friction notes and frontmatter (except the title) removed, each embedded SVG as its source
// (long path data elided) plus the text labels drawn on it, and DATA.md in open mode. Owner
// feedback only with --calibrate. Never: the skill, other runs, earlier critiques, LESSONS.md,
// and never run ids, skill or harness trees, skill refs or run dates (redacted wherever they
// appear in the material).

import { randomInt } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import * as claude from "./adapters/claude.mjs";
import * as codex from "./adapters/codex.mjs";
import * as fake from "./adapters/fake.mjs";
import { familyOf, pickCritic } from "./adapters/index.mjs";
import { detectSlug, parseProse, splitFriction, splitFrontmatter, svgTexts } from "./checkers/story.mjs";
import { findRunDir, findRunDirs } from "./checkers/run-checks.mjs";
import { appendRow } from "./ledger.mjs";
import { assertValid, OPEN_MODE_DIMENSIONS, SCORE_DIMENSIONS, validateCase, validateCritiqueAbsolute, validateCritiquePairwise } from "./schema.mjs";
import { sha256 } from "./versions.mjs";

export const CRITIC_ADAPTERS = { claude, codex, fake };
const ANSWERS = ["yes", "partly", "no"];
const QUESTIONS_MIN = 5;
const QUESTIONS_MAX = 8;
const STORIES_DIR = "site/stories";

// --- Rubric -----------------------------------------------------------------------

// The rubric's `## ` sections (everything before the first is for people, never sent), and its
// `### <type>` subsections of "Type rules".
export function parseRubric(text, id) {
  const sections = new Map();
  let name = null;
  let buf = [];
  const flush = () => name !== null && sections.set(name, buf.join("\n").trim());
  for (const line of text.split("\n")) {
    const h = line.match(/^## (.+?)\s*$/);
    if (h) {
      flush();
      name = h[1];
      buf = [];
    } else if (name !== null) buf.push(line);
  }
  flush();
  const typeRules = new Map();
  if (sections.has("Type rules")) {
    let t = null;
    let tb = [];
    const tflush = () => t !== null && typeRules.set(t, tb.join("\n").trim());
    for (const line of sections.get("Type rules").split("\n")) {
      const h = line.match(/^### (.+?)\s*$/);
      if (h) {
        tflush();
        t = h[1];
        tb = [];
      } else if (t !== null) tb.push(line);
    }
    tflush();
  }
  for (const s of ["Role", "Reader questions", "Absolute critique", "Checklist anchors", "Type rules", "Pairwise judgement"]) {
    if (!sections.get(s)) throw new Error(`rubric ${id} has no "## ${s}" section`);
  }
  if (!typeRules.get("All types")) throw new Error(`rubric ${id} has no "### All types" under Type rules`);
  return { id, sha256: sha256(text), sections, typeRules };
}

export function rubricPath(evalsDir, id) {
  const [domain, version, ...rest] = String(id).split("/");
  if (!domain || !/^v\d+$/.test(version ?? "") || rest.length) throw new Error(`rubric must be <domain>/v<N>, got "${id}"`);
  return join(evalsDir, "rubrics", domain, `${version}.md`);
}

export function loadRubric(evalsDir, id) {
  const file = rubricPath(evalsDir, id);
  if (!existsSync(file)) throw new Error(`no rubric at ${relative(evalsDir, file)}`);
  return parseRubric(readFileSync(file, "utf8"), id);
}

// The highest vN.md in rubrics/<domain>/.
export function latestRubricId(evalsDir, domain) {
  const dir = join(evalsDir, "rubrics", domain);
  const versions = existsSync(dir) ? readdirSync(dir).map((n) => n.match(/^v(\d+)\.md$/)).filter(Boolean).map((m) => Number(m[1])) : [];
  if (!versions.length) throw new Error(`no rubric for domain "${domain}" in evals/rubrics/${domain}/`);
  return `${domain}/v${Math.max(...versions)}`;
}

function typeRulesText(rubric, type) {
  const parts = [`### All types\n\n${rubric.typeRules.get("All types")}`];
  if (rubric.typeRules.get(type)) parts.push(`### ${type}\n\n${rubric.typeRules.get(type)}`);
  return parts.join("\n\n");
}

// --- Material -----------------------------------------------------------------------

// Replace every version identifier of the runs (run id, skill/harness tree and ref, and their
// 7-character prefixes) with [redacted].
export function redactor(runs) {
  const ids = new Set();
  for (const run of runs) {
    ids.add(run.run_id);
    for (const h of [run.skill?.tree, run.skill?.ref, run.harness?.tree]) {
      if (typeof h === "string" && h) {
        ids.add(h);
        ids.add(h.slice(0, 7));
      }
    }
  }
  const list = [...ids].filter((s) => s && s.length >= 7).sort((a, b) => b.length - a.length);
  return (text) => {
    let out = String(text);
    for (const id of list) out = out.split(id).join("[redacted]");
    return out;
  };
}

// Prose as the reader sees it: the title from the frontmatter (everything else in it, such as a
// date, dropped) and the body without the friction-notes section.
export function readerProse(md) {
  const { frontmatter, body } = splitFrontmatter(md);
  const t = frontmatter.match(/^title:\s*(.*?)\s*$/m);
  const title = t ? t[1].replace(/^(["'])(.*)\1$/, "$2") : null;
  const { main } = splitFriction(body);
  return { title, prose: main.replace(/\n{3,}/g, "\n\n").trim() };
}

// SVG source for the critic: long path data (d, points) elided; colours, markers, classes and
// text stay.
export function svgForCritic(svg) {
  return String(svg).replace(/\s(d|points)="([^"]{120,})"/g, (_, a, v) => ` ${a}="[${v.length} chars of path data elided]"`);
}

function walkFiles(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...walkFiles(p, base));
    else if (name.isFile()) out.push(relative(base, p).split(sep).join("/"));
  }
  return out;
}

// What the critic may see of one run's story: { slug, title, prose, outline, charts[], dataMd }.
// Every text is passed through `redact`. Only the named files are read; nothing else in the run
// directory (run.json, checks, critiques, transcripts, a stray copy of the skill) is touched.
export function storyMaterial(runDir, { dataMode = "fixed", redact = (s) => s } = {}) {
  const art = join(runDir, "artefacts");
  const storiesAbs = join(art, STORIES_DIR);
  const slug = detectSlug(storiesAbs);
  if (!slug || !existsSync(join(storiesAbs, `${slug}.md`))) throw new Error(`no story prose in ${relative(dirname(dirname(runDir)), art)}/${STORIES_DIR}`);
  const md = readFileSync(join(storiesAbs, `${slug}.md`), "utf8");
  const { title, prose } = readerProse(md);
  const outlineFile = join(storiesAbs, `${slug}-outline.md`);
  const images = [...new Set(parseProse(md).images.filter((p) => p.endsWith(".svg") && !/^[a-z]+:/i.test(p)))];
  const charts = images.map((file) => {
    const abs = join(storiesAbs, file);
    if (!existsSync(abs) || relative(storiesAbs, abs).startsWith("..")) return { file, missing: true, labels: [], source: null, raw: null };
    const raw = readFileSync(abs, "utf8");
    return { file, missing: false, labels: svgTexts(raw).map(redact), source: redact(svgForCritic(raw)), raw: redact(raw) };
  });
  let dataMd = null;
  if (dataMode === "open") {
    const f = walkFiles(art).find((p) => p.split("/").pop() === "DATA.md");
    if (f) dataMd = redact(readFileSync(join(art, f), "utf8"));
  }
  return {
    slug,
    title: title === null ? null : redact(title),
    prose: redact(prose),
    outline: existsSync(outlineFile) ? redact(readFileSync(outlineFile, "utf8")) : null,
    charts,
    dataMd,
  };
}

const fileBlock = (label, text) => `<<<BEGIN ${label}>>>\n${String(text).trimEnd()}\n<<<END ${label}>>>`;

function commissionBlock(kase) {
  const lines = [`Question: ${kase.question}`, `Story type: ${kase.type}`];
  lines.push(kase.data_mode === "open" ? "Data: the writer chose and gathered its own data (open mode)." : "Data: the writer was given the data (fixed mode).");
  if (kase.as_of) lines.push(`Data as of: ${kase.as_of} (nothing later is known to the story).`);
  if (kase.budget?.words) lines.push(`Length asked for: ${kase.budget.words[0]}-${kase.budget.words[1]} words of prose.`);
  return `## The commission\n\n${lines.join("\n")}`;
}

function referencesBlock(kase) {
  if (!kase.references?.length) return null;
  const items = kase.references.map((r) => {
    const head = `- ${r.title} (${r.url})${r.answers_same_question ? ", answers the same question" : ""}`;
    return [head, ...(r.key_findings ?? []).map((f) => `  - ${f}`)].join("\n");
  });
  return `## Reference pieces on the same subject\n\nPublished work you may compare against (key findings as recorded):\n\n${items.join("\n")}`;
}

function feedbackBlock(feedback) {
  if (!feedback?.length) return null;
  return `## Calibration: the commissioning reader's own earlier remarks\n\n${feedback.map((f) => fileBlock(`REMARKS ${f.path}`, f.text)).join("\n\n")}`;
}

const questionList = (qs) => qs.map((q, i) => `${i + 1}. ${q}`).join("\n");

function storyBlock(label, m, { outline }) {
  const parts = [];
  if (outline && m.outline) parts.push(fileBlock(`${label} OUTLINE`, m.outline));
  parts.push(fileBlock(`${label} PROSE`, `${m.title ? `Title: ${m.title}\n\n` : ""}${m.prose}`));
  for (const c of m.charts) {
    if (c.missing) {
      parts.push(`Chart ${c.file}: embedded by the prose but missing.`);
      continue;
    }
    parts.push(`Chart ${c.file}\nText labels drawn on it, in order: ${c.labels.length ? c.labels.map((l) => JSON.stringify(l)).join(", ") : "(none)"}\n${fileBlock(`${label} SVG ${c.file}`, c.source)}`);
  }
  if (m.dataMd) parts.push(fileBlock(`${label} DATA.md`, m.dataMd));
  return parts.join("\n\n");
}

const join2 = (parts) => `${parts.filter(Boolean).join("\n\n")}\n`;

export function questionsPrompt({ rubric, kase }) {
  return join2([
    rubric.sections.get("Role"),
    `## Your task\n\n${rubric.sections.get("Reader questions")}`,
    commissionBlock(kase),
    `Answer with JSON only: {"questions": [...]} with ${QUESTIONS_MIN} to ${QUESTIONS_MAX} questions.`,
  ]);
}

export function absolutePrompt({ rubric, kase, questions, material, feedback }) {
  const dims = kase.data_mode === "open" ? [...SCORE_DIMENSIONS, ...OPEN_MODE_DIMENSIONS] : SCORE_DIMENSIONS;
  return join2([
    rubric.sections.get("Role"),
    `## Your task\n\n${rubric.sections.get("Absolute critique")}`,
    `## Checklist anchors\n\n${rubric.sections.get("Checklist anchors")}`,
    `## Type rules\n\n${typeRulesText(rubric, kase.type)}`,
    commissionBlock(kase),
    `## Your reader questions (written before you read the story)\n\n${questionList(questions)}`,
    referencesBlock(kase),
    feedbackBlock(feedback),
    `## The story\n\n${storyBlock("STORY", material, { outline: true })}`,
    `Answer with JSON only, fields in this order: reader_questions (all ${questions.length}, in order), missed_findings, charts (one per embedded chart, in order), top_change, publishable, lessons (at most 5), scores (${dims.join(", ")}).`,
  ]);
}

export function pairwisePrompt({ rubric, kase, questions, first, second, feedback }) {
  return join2([
    rubric.sections.get("Role"),
    `## Your task\n\n${rubric.sections.get("Pairwise judgement")}`,
    `## Type rules\n\n${typeRulesText(rubric, kase.type)}`,
    commissionBlock(kase),
    `## Your reader questions (written before you read either story)\n\n${questionList(questions)}`,
    referencesBlock(kase),
    feedbackBlock(feedback),
    `## Story 1\n\n${storyBlock("STORY 1", first, { outline: false })}`,
    `## Story 2\n\n${storyBlock("STORY 2", second, { outline: false })}`,
    `Answer with JSON only, fields in this order: reader_questions (all ${questions.length}, in order), why, preferred, margin.`,
  ]);
}

// --- Output schemas (strict: every property required, no extra properties) ------------

const obj = (properties) => ({ type: "object", additionalProperties: false, required: Object.keys(properties), properties });
const str = { type: "string" };
const answer = { type: "string", enum: ANSWERS };

export function questionsSchema() {
  return obj({ questions: { type: "array", items: str } });
}

export function absoluteSchema(dataMode = "fixed") {
  const dims = dataMode === "open" ? [...SCORE_DIMENSIONS, ...OPEN_MODE_DIMENSIONS] : SCORE_DIMENSIONS;
  return obj({
    reader_questions: { type: "array", items: obj({ q: str, answered: answer, where: str }) },
    missed_findings: { type: "array", items: str },
    charts: { type: "array", items: obj({ file: str, shows: str, form_fits: { type: "boolean" }, fix: str }) },
    top_change: str,
    publishable: { type: "string", enum: ["yes", "with-edits", "no"] },
    lessons: { type: "array", items: obj({ rule: str, evidence: str }) },
    scores: obj(Object.fromEntries(dims.map((d) => [d, obj({ score: { type: "integer", enum: [0, 1, 2] }, why: str })]))),
  });
}

export function pairwiseSchema() {
  return obj({
    reader_questions: { type: "array", items: obj({ q: str, story_1: answer, story_2: answer }) },
    why: str,
    preferred: { type: "string", enum: ["1", "2", "tie"] },
    margin: { type: ["string", "null"], enum: ["clear", "slight", null] },
  });
}

// --- Validation -------------------------------------------------------------------------

export function validateQuestions(out) {
  const errors = [];
  const qs = out?.questions;
  if (!Array.isArray(qs)) errors.push("questions: must be an array");
  else {
    if (qs.length < QUESTIONS_MIN || qs.length > QUESTIONS_MAX) errors.push(`questions: want ${QUESTIONS_MIN}-${QUESTIONS_MAX}, got ${qs.length}`);
    qs.forEach((q, i) => (typeof q !== "string" || !q.trim()) && errors.push(`questions[${i}]: must be a non-empty string`));
  }
  return { ok: errors.length === 0, errors };
}

// The critic's answer must mark every question, in order; the question text is then restored to
// the original wording (a model may re-punctuate when it copies).
function checkQuestionsAnswered(list, questions, errors) {
  if (!Array.isArray(list)) return;
  if (list.length !== questions.length) errors.push(`reader_questions: want ${questions.length} (one per question, in order), got ${list.length}`);
}

// Build the stored absolute critique from the critic's output; returns { ok, errors, critique }.
export function buildAbsolute(output, { rubric, critic, questions, dataMode, calibrate = false }) {
  if (output === null || typeof output !== "object" || Array.isArray(output)) return { ok: false, errors: ["output: must be an object"], critique: null };
  const critique = {
    rubric,
    mode: "absolute",
    critic,
    calibrate,
    reader_questions: output.reader_questions,
    missed_findings: output.missed_findings,
    charts: output.charts,
    top_change: output.top_change,
    publishable: output.publishable,
    lessons: output.lessons,
    scores: output.scores,
  };
  const v = validateCritiqueAbsolute(critique, { data_mode: dataMode });
  const errors = [...v.errors];
  checkQuestionsAnswered(output.reader_questions, questions, errors);
  if (errors.length) return { ok: false, errors, critique: null };
  critique.reader_questions = output.reader_questions.map((r, i) => ({ q: questions[i], answered: r.answered, where: r.answered === "no" ? "" : r.where ?? "" }));
  if (dataMode !== "open") for (const d of OPEN_MODE_DIMENSIONS) delete critique.scores[d];
  return { ok: true, errors: [], critique };
}

// One pairwise judgement. The critic sees the stories by position, "Story 1" and "Story 2", and
// answers in those terms; the stored critique uses the pair's labels (order "AB": pair A was
// Story 1; "BA": pair B was Story 1), keeps the critic's own text verbatim, and records in
// `shown` which pair label each position held, so "Story 1" in `why` can be read.
export function buildPairwise(output, { rubric, critic, questions, order, calibrate = false }) {
  if (output === null || typeof output !== "object" || Array.isArray(output)) return { ok: false, errors: ["output: must be an object"], critique: null };
  const shown = order === "AB" ? { 1: "A", 2: "B" } : { 1: "B", 2: "A" };
  const errors = [];
  if (!["1", "2", "tie"].includes(output.preferred)) errors.push(`preferred: must be 1, 2 or tie (got ${JSON.stringify(output.preferred)})`);
  const preferred = output.preferred === "tie" ? "tie" : shown[output.preferred];
  const rq = Array.isArray(output.reader_questions)
    ? output.reader_questions.map((r) => (r && typeof r === "object" ? { q: r.q, [shown[1]]: r.story_1, [shown[2]]: r.story_2 } : r))
    : output.reader_questions;
  const critique = {
    rubric,
    mode: "pairwise",
    critic,
    calibrate,
    order,
    shown: { story_1: shown[1], story_2: shown[2] },
    preferred,
    margin: preferred === "tie" ? null : output.margin,
    why: output.why,
    reader_questions: Array.isArray(rq) ? rq.map((r) => (r && typeof r === "object" ? { q: r.q, A: r.A, B: r.B } : r)) : rq,
  };
  if (!errors.length) errors.push(...validateCritiquePairwise(critique).errors);
  if (output.preferred !== "tie" && !["clear", "slight"].includes(output.margin)) errors.push("margin: must be clear or slight when a story is preferred");
  checkQuestionsAnswered(output.reader_questions, questions, errors);
  if (errors.length) return { ok: false, errors, critique: null };
  critique.reader_questions = critique.reader_questions.map((r, i) => ({ ...r, q: questions[i] }));
  return { ok: true, errors: [], critique };
}

// The pair's result: a win only when both orders prefer the same run; otherwise a tie (null).
export function pairResult(judgements) {
  const [a, b] = judgements.map((j) => j.preferred_run_id ?? null);
  return { winner_run_id: a !== null && a === b ? a : null, split: a !== b };
}

// --- Calling the critic -----------------------------------------------------------------

function addUsage(acc, u) {
  if (!u || typeof u !== "object") return acc;
  const out = { ...(acc ?? {}) };
  for (const [k, v] of Object.entries(u)) if (typeof v === "number") out[k] = (out[k] ?? 0) + v;
  return out;
}

// A cost tally across calls: cost_usd stays null when any call reported none (Codex: tokens only).
export function tally() {
  const t = { calls: 0, cost_usd: 0, cost_known: true, usage: null, model_actual: null, cli_version: null };
  return {
    add(res) {
      t.calls++;
      if (typeof res?.cost_usd === "number") t.cost_usd += res.cost_usd;
      else t.cost_known = false;
      t.usage = addUsage(t.usage, res?.usage);
      t.model_actual = res?.model_actual ?? t.model_actual;
      t.cli_version = res?.cli_version ?? t.cli_version;
    },
    get: () => ({ calls: t.calls, cost_usd: t.cost_known ? Math.round(t.cost_usd * 1e6) / 1e6 : null, usage: t.usage, model_actual: t.model_actual, cli_version: t.cli_version }),
  };
}

// Call the critic; validate; on a failed call or an invalid answer, retry once. Returns
// { ok, value, errors } where value is what `build(output)` produced.
export async function callWithRetry({ adapter, args, build, costs, attempts = 2 }) {
  const errors = [];
  for (let i = 0; i < attempts; i++) {
    let res;
    try {
      res = await adapter.critic(args);
    } catch (e) {
      errors.push(`attempt ${i + 1}: ${e.message}`);
      continue;
    }
    costs.add(res);
    if (!res.ok) {
      errors.push(`attempt ${i + 1}: critic call failed: ${res.error}`);
      continue;
    }
    const b = build(res.output);
    if (b.ok) return { ok: true, value: b.value, errors };
    errors.push(`attempt ${i + 1}: invalid answer: ${b.errors.slice(0, 8).join("; ")}`);
  }
  return { ok: false, value: null, errors };
}

// --- Critic choice -------------------------------------------------------------------------

function sameVendorModel(writer, config) {
  const fam = familyOf(writer.model, config);
  const fb = fam ? config.critic_fallback?.[fam] : null;
  return fb ? config.families[fb] : null;
}

// spec: auto | claude | codex | fake. writers: [{ vendor, model }] of the run(s) being judged.
// model overrides the chosen model (e.g. a cheap model for a smoke test); it is recorded.
export function resolveCritic({ spec = "auto", model, writers, config, available }) {
  if (spec === "fake") return { vendor: "fake", model: "fake", fallback: false, fallback_reason: null };
  let pick;
  if (spec === "auto") {
    const bad = writers.find((w) => !config.models[w.vendor]);
    if (bad) throw new Error(`--critic auto needs a real writer (claude or codex); this run's writer is ${bad.vendor}. Use --critic fake, claude or codex.`);
    pick = pickCritic({ vendor: writers[0].vendor, model: writers[0].model }, { config, available });
  } else if (spec === "claude" || spec === "codex") {
    const a = available(spec);
    if (!a.ok) throw new Error(`--critic ${spec}: ${a.reason}`);
    const same = writers.find((w) => w.vendor === spec);
    if (same) {
      const m = sameVendorModel(same, config);
      if (!m) throw new Error(`--critic ${spec}: the writer is ${spec} and config.json has no critic_fallback for ${same.model}`);
      pick = { vendor: spec, model: m, fallback: true, fallback_reason: `--critic ${spec} requested for a ${spec} writer` };
    } else pick = { vendor: spec, model: config.models[spec].critic, fallback: false, fallback_reason: null };
  } else throw new Error(`--critic must be auto, claude, codex or fake (got ${JSON.stringify(spec)})`);
  if (model) pick = { ...pick, model };
  for (const w of writers) if (w.model === pick.model) throw new Error(`the critic model ${pick.model} is a writer's own model; choose another`);
  return pick;
}

// --- Rendering -------------------------------------------------------------------------------

const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
const yesNo = (b) => (b ? "yes" : "no");

function criticLine(c) {
  return `${c.vendor} ${c.model}${c.model_actual && c.model_actual !== c.model ? ` (${c.model_actual})` : ""}${c.fallback ? `, fallback: ${c.fallback_reason}` : ""}`;
}

// critique.md for an absolute critique: findings first, the checklist last. Deterministic: the
// same critique renders to the same bytes (no timestamps).
export function renderCritique(cq, { runId } = {}) {
  const out = [`# Critique${runId ? ` of ${runId}` : ""}`, "", `Rubric ${cq.rubric}; critic ${criticLine(cq.critic)}${cq.calibrate ? "; calibration (owner feedback in the prompt)" : ""}.`, ""];
  out.push("## Reader questions", "", "Written from the question alone, before the critic read the story.", "", "| # | Question | Answered | Where |", "|---|---|---|---|");
  cq.reader_questions.forEach((r, i) => out.push(`| ${i + 1} | ${cell(r.q)} | ${r.answered} | ${cell(r.where)} |`));
  out.push("", "## Strongest findings missed", "");
  if (cq.missed_findings.length) for (const f of cq.missed_findings) out.push(`- ${f}`);
  else out.push("None named.");
  out.push("", "## Charts", "");
  if (!cq.charts.length) out.push("No charts.", "");
  for (const ch of cq.charts) {
    out.push(`### ${ch.file}`, "", `- Shows: ${ch.shows}`, `- Form fits the point: ${yesNo(ch.form_fits)}`, `- Fix: ${ch.fix ? ch.fix : "none"}`, "");
  }
  out.push("## The one change that matters most", "", cq.top_change, "", "## Would the commissioning reader publish it?", "", cq.publishable, "", "## Lessons", "");
  if (cq.lessons.length) cq.lessons.forEach((l, i) => out.push(`${i + 1}. ${l.rule} Evidence: ${l.evidence}`));
  else out.push("None.");
  out.push("", "## Checklist (0-2)", "", "| Dimension | Score | Why |", "|---|---|---|");
  for (const d of [...SCORE_DIMENSIONS, ...OPEN_MODE_DIMENSIONS]) if (cq.scores[d]) out.push(`| ${d} | ${cq.scores[d].score} | ${cell(cq.scores[d].why)} |`);
  return `${out.join("\n")}\n`;
}

// critique.md for a pair: both judgements, in the pair's labels.
export function renderPairCritique(pairId, judgements) {
  const out = [`# Pairwise critique of ${pairId}`, ""];
  const prefs = judgements.map((j) => j.preferred);
  const result = prefs[0] !== "tie" && prefs[0] === prefs[1] ? `${prefs[0]} in both orders` : "tie (the orders do not agree, or both are ties)";
  out.push(`Rubric ${judgements[0].rubric}; critic ${criticLine(judgements[0].critic)}${judgements[0].calibrate ? "; calibration" : ""}. Result: ${result}.`, "");
  for (const j of judgements) {
    out.push(`## Order ${j.order} (Story 1 = ${j.shown.story_1}, Story 2 = ${j.shown.story_2})`, "", `Preferred: ${j.preferred}${j.margin ? ` (${j.margin})` : ""}`, "", j.why, "", "| # | Question | A | B |", "|---|---|---|---|");
    j.reader_questions.forEach((r, i) => out.push(`| ${i + 1} | ${cell(r.q)} | ${r.A} | ${r.B} |`));
    out.push("");
  }
  return `${out.join("\n").trimEnd()}\n`;
}

// --- Commands -------------------------------------------------------------------------------

function readCase(evalsDir, domain, caseId) {
  const file = join(evalsDir, "cases", domain, caseId, "case.json");
  if (!existsSync(file)) throw new Error(`no case ${domain}/${caseId}`);
  const kase = JSON.parse(readFileSync(file, "utf8"));
  assertValid(validateCase(kase), `case ${domain}/${caseId}`);
  return kase;
}

function readOwnerFeedback(root, kase) {
  return kase.owner_feedback.map((p) => {
    const abs = join(root, p);
    if (!existsSync(abs)) throw new Error(`--calibrate: owner feedback ${p} not found`);
    return { path: p, text: readFileSync(abs, "utf8") };
  });
}

const readRun = (runDir) => JSON.parse(readFileSync(join(runDir, "run.json"), "utf8"));
const pad = (n) => String(n).padStart(2, "0");
const stamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;

function criticArgs({ critic, config, root, kind, prompt, jsonSchema, meta }) {
  return {
    kind,
    prompt,
    jsonSchema,
    meta,
    model: critic.model,
    root,
    timeoutMs: config.timeouts_ms?.critic,
    maxBudgetUsd: config.critic_caps?.max_usd_per_call,
  };
}

async function askQuestions({ rubric, kase, critic, adapter, config, root, costs }) {
  const prompt = questionsPrompt({ rubric, kase });
  const res = await callWithRetry({
    adapter,
    costs,
    args: criticArgs({ critic, config, root, kind: "questions", prompt, jsonSchema: questionsSchema(), meta: {} }),
    build: (o) => {
      const v = validateQuestions(o);
      return v.ok ? { ok: true, value: o.questions.map((q) => q.trim()) } : v;
    },
  });
  return { ...res, prompt };
}

const withCost = (critic, costs) => ({ ...critic, model_actual: costs.get().model_actual });

// Absolute critique of one run: critique-<version>-<n>.json and .md in the run directory and a
// `score` ledger row (status critic_failed, with the errors, when two attempts fail).
export async function scoreRun({ root, evalsDir, runDir, rubricId, critic, calibrate = false, config, adapters = CRITIC_ADAPTERS, now = () => new Date(), log = () => {} }) {
  const run = readRun(runDir);
  const kase = readCase(evalsDir, run.domain, run.case_id);
  const rubric = loadRubric(evalsDir, rubricId ?? latestRubricId(evalsDir, run.domain));
  const adapter = adapters[critic.vendor];
  if (!adapter?.critic) throw new Error(`no critic adapter for ${critic.vendor}`);
  const redact = redactor([run]);
  const material = storyMaterial(runDir, { dataMode: kase.data_mode, redact });
  const feedback = calibrate ? readOwnerFeedback(root, kase) : null;
  const costs = tally();
  const base = { kind: "score", run_id: run.run_id, rubric: rubric.id, rubric_sha256: rubric.sha256, ...(calibrate ? { calibrate: true } : {}) };

  log(`scoring ${run.run_id} with ${critic.vendor} ${critic.model} (rubric ${rubric.id})`);
  const q = await askQuestions({ rubric, kase, critic, adapter, config, root, costs });
  let result = q.ok ? null : { ok: false, errors: q.errors.map((e) => `questions: ${e}`) };
  let prompt = null;
  if (q.ok) {
    prompt = absolutePrompt({ rubric, kase, questions: q.value, material, feedback });
    const meta = { questions: q.value, charts: material.charts.map((c) => c.file), dataMode: kase.data_mode };
    result = await callWithRetry({
      adapter,
      costs,
      args: criticArgs({ critic, config, root, kind: "absolute", prompt, jsonSchema: absoluteSchema(kase.data_mode), meta }),
      build: (o) => {
        const b = buildAbsolute(o, { rubric: rubric.id, critic: withCost(critic, costs), questions: q.value, dataMode: kase.data_mode, calibrate });
        return b.ok ? { ok: true, value: b.critique } : b;
      },
    });
  }
  const c = costs.get();
  const criticRec = { ...critic, model_actual: c.model_actual };
  const at = now().toISOString();
  if (!result.ok) {
    const row = appendRow(join(evalsDir, "ledger.jsonl"), { ...base, at, critic: criticRec, status: "critic_failed", errors: result.errors, cost_usd: c.cost_usd, usage: c.usage, calls: c.calls });
    log(`critic_failed for ${run.run_id}: ${result.errors.join(" | ")}`);
    return { ok: false, row, errors: result.errors, costs: c };
  }
  const version = rubric.id.split("/")[1];
  let n = 1;
  while (existsSync(join(runDir, `critique-${version}-${n}.json`))) n++;
  const name = `critique-${version}-${n}`;
  const critique = { ...result.value, critic: criticRec, rubric_sha256: rubric.sha256, prompt_sha256: sha256(prompt), cost: { cost_usd: c.cost_usd, usage: c.usage, calls: c.calls } };
  writeFileSync(join(runDir, `${name}.json`), `${JSON.stringify(critique, null, 2)}\n`);
  writeFileSync(join(runDir, `${name}.md`), renderCritique(critique, { runId: run.run_id }));
  const row = appendRow(join(evalsDir, "ledger.jsonl"), {
    ...base,
    at,
    critic: criticRec,
    status: "ok",
    publishable: critique.publishable,
    scores: Object.fromEntries(Object.entries(critique.scores).map(([d, s]) => [d, s.score])),
    file: relative(evalsDir, join(runDir, `${name}.json`)).split(sep).join("/"),
    cost_usd: c.cost_usd,
    usage: c.usage,
    calls: c.calls,
  });
  return { ok: true, row, critique, file: join(runDir, `${name}.json`), costs: c };
}

// A blind copy of a story for the owner: the reader prose (title-only frontmatter, no friction
// notes, identifiers redacted) and the SVGs it embeds, nothing else.
function writeBlindCopy(dir, m) {
  mkdirSync(dir, { recursive: true });
  const fm = m.title ? `---\ntitle: ${JSON.stringify(m.title)}\n---\n\n` : "";
  writeFileSync(join(dir, `${m.slug}.md`), `${fm}${m.prose}\n`);
  for (const c of m.charts) {
    if (c.missing) continue;
    const dest = join(dir, c.file);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, c.raw);
  }
}

// Blind order-swapped pairwise critique of two runs of the same case. Writes
// evals/pairs/<pair_id>/A and B (prose and charts only), mapping.json (gitignored), the two
// judgements and critique.md, and appends a `pair` row. `random()` returns 0 or 1 (1 swaps which
// run is A); injectable for tests.
export async function pairRuns({ root, evalsDir, runDirs, rubricId, critic, calibrate = false, config, adapters = CRITIC_ADAPTERS, now = () => new Date(), random = () => randomInt(2), log = () => {} }) {
  if (runDirs.length !== 2) throw new Error("pair needs exactly two runs");
  const runs = runDirs.map(readRun);
  if (runs[0].run_id === runs[1].run_id) throw new Error("pair needs two different runs");
  if (runs[0].case_id !== runs[1].case_id || runs[0].domain !== runs[1].domain) throw new Error(`pair needs two runs of the same case (got ${runs[0].domain}/${runs[0].case_id} and ${runs[1].domain}/${runs[1].case_id})`);
  const kase = readCase(evalsDir, runs[0].domain, runs[0].case_id);
  const rubric = loadRubric(evalsDir, rubricId ?? latestRubricId(evalsDir, runs[0].domain));
  const adapter = adapters[critic.vendor];
  if (!adapter?.critic) throw new Error(`no critic adapter for ${critic.vendor}`);
  const redact = redactor(runs);
  const materials = runDirs.map((d) => storyMaterial(d, { dataMode: kase.data_mode, redact }));
  const feedback = calibrate ? readOwnerFeedback(root, kase) : null;

  const swap = random() === 1;
  const mapping = { A: runs[swap ? 1 : 0].run_id, B: runs[swap ? 0 : 1].run_id };
  const byLabel = { A: materials[swap ? 1 : 0], B: materials[swap ? 0 : 1] };

  const started = now();
  const pairsRoot = join(evalsDir, "pairs");
  let n = 1;
  const base = `${stamp(started)}-${kase.id}-pair`;
  while (existsSync(join(pairsRoot, `${base}-${n}`))) n++;
  const pairId = `${base}-${n}`;
  const pairDir = join(pairsRoot, pairId);
  writeBlindCopy(join(pairDir, "A"), byLabel.A);
  writeBlindCopy(join(pairDir, "B"), byLabel.B);
  writeFileSync(join(pairDir, "mapping.json"), `${JSON.stringify({ pair_id: pairId, ...mapping }, null, 2)}\n`);
  log(`pair ${pairId}: judging with ${critic.vendor} ${critic.model} (rubric ${rubric.id})`);

  const costs = tally();
  try {
    const q = await askQuestions({ rubric, kase, critic, adapter, config, root, costs });
    if (!q.ok) throw new Error(`critic_failed writing reader questions: ${q.errors.join(" | ")}`);
    const judgements = [];
    for (const order of ["AB", "BA"]) {
      const [first, second] = order === "AB" ? [byLabel.A, byLabel.B] : [byLabel.B, byLabel.A];
      const prompt = pairwisePrompt({ rubric, kase, questions: q.value, first, second, feedback });
      const len = (m) => m.prose.length;
      const meta = { questions: q.value, lengths: { 1: len(first), 2: len(second) } };
      const res = await callWithRetry({
        adapter,
        costs,
        args: criticArgs({ critic, config, root, kind: "pairwise", prompt, jsonSchema: pairwiseSchema(), meta }),
        build: (o) => {
          const b = buildPairwise(o, { rubric: rubric.id, critic: withCost(critic, costs), questions: q.value, order, calibrate });
          return b.ok ? { ok: true, value: { ...b.critique, prompt_sha256: sha256(prompt) } } : b;
        },
      });
      if (!res.ok) throw new Error(`critic_failed on order ${order}: ${res.errors.join(" | ")}`);
      judgements.push(res.value);
    }
    const c = costs.get();
    const criticRec = { ...critic, model_actual: c.model_actual };
    for (const j of judgements) {
      j.critic = criticRec;
      j.rubric_sha256 = rubric.sha256;
      writeFileSync(join(pairDir, `critique-${j.order}.json`), `${JSON.stringify(j, null, 2)}\n`);
    }
    writeFileSync(join(pairDir, "critique.md"), renderPairCritique(pairId, judgements));
    const resolved = judgements.map((j) => ({ order: j.order, preferred_run_id: j.preferred === "tie" ? null : mapping[j.preferred], margin: j.margin }));
    const { winner_run_id } = pairResult(resolved);
    const row = appendRow(join(evalsDir, "ledger.jsonl"), {
      kind: "pair",
      at: started.toISOString(),
      pair_id: pairId,
      case_id: kase.id,
      run_ids: runs.map((r) => r.run_id),
      rubric: rubric.id,
      rubric_sha256: rubric.sha256,
      critic: criticRec,
      ...(calibrate ? { calibrate: true } : {}),
      judgements: resolved,
      winner_run_id,
      path: relative(evalsDir, pairDir).split(sep).join("/"),
      cost_usd: c.cost_usd,
      usage: c.usage,
      calls: c.calls,
    });
    return { pairId, pairDir, row, judgements, costs: c };
  } catch (e) {
    rmSync(pairDir, { recursive: true, force: true });
    e.costs = costs.get();
    throw e;
  }
}

// The writers of runs, for critic choice.
export function writersOf(runDirs) {
  return runDirs.map((d) => {
    const w = readRun(d).writer;
    return { vendor: w.vendor, model: w.model };
  });
}

export function allRunDirs(evalsDir) {
  return findRunDirs(evalsDir);
}

export { findRunDir };
