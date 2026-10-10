// The critic with fake and scripted adapters: no agent calls. Proves what reaches the prompt
// (never the skill, other files in the run, run ids, trees or run dates), that malformed answers
// are retried once and then recorded as critic_failed, that rendering is deterministic, and the
// order-swap logic of pairwise judgements.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as fake from "./adapters/fake.mjs";
import {
  absoluteSchema,
  allRunDirs,
  buildAbsolute,
  buildPairwise,
  dataInventory,
  latestRubricId,
  loadRubric,
  pairResult,
  findRunDir,
  pairRuns,
  parseCsv,
  parseRubric,
  readerProse,
  redactor,
  renderCritique,
  renderPairCritique,
  resolveCritic,
  scoreRun,
  svgForCritic,
} from "./critic.mjs";
import { makeRepo } from "./fixture-repo.mjs";
import { readLedger } from "./ledger.mjs";
import { readMappingFile, recordPair } from "./owner.mjs";
import { SCORE_DIMENSIONS, validateLedgerRow } from "./schema.mjs";

const evalsSrc = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(evalsSrc, "..");
const config = JSON.parse(readFileSync(join(evalsSrc, "config.json"), "utf8"));
const TREE_OLD = "1abcdef".padEnd(40, "1");
const TREE_NEW = "2bcdef0".padEnd(40, "2");
const REF = "3cdef01".padEnd(40, "3");
const HARNESS = "4def012".padEnd(40, "4");
const SKILL_MARKER = "SKILL-TEXT-MUST-NOT-REACH-THE-CRITIC";
const LESSONS_MARKER = "LESSONS-MUST-NOT-REACH-THE-CRITIC";
const PRIOR_MARKER = "PRIOR-CRITIQUE-MUST-NOT-REACH-THE-CRITIC";
const FEEDBACK_MARKER = "OWNER-FEEDBACK-ONLY-WITH-CALIBRATE";
const CASE = {
  id: "t01-demo",
  domain: "story",
  title: "Demo",
  question: "Why did the value double?",
  type: "explanatory",
  data_mode: "fixed",
  inputs: [{ path: "datasets/demo", commit: "abcdef0" }],
  skills: ["story"],
  references: [{ title: "A reference piece", url: "https://example.org/ref", answers_same_question: true, key_findings: ["The value doubled because of X."] }],
  owner_feedback: ["docs/reviews/demo-feedback.md"],
  budget: { max_usd: 20, max_turns: 100, words: [300, 700] },
};

const SVG = (label) => `<svg xmlns="http://www.w3.org/2000/svg"><path d="${"M0,0L1,1".repeat(40)}" stroke="#4269d0"/><text x="1">${label}</text><text><tspan>10</tspan><tspan>in 2000</tspan></text></svg>\n`;

function story(slug, extra = "") {
  return `---\ntitle: "The value doubled"\ndate: 2026-10-10\n---\n\n# The value doubled\n\nThe value rose from 10 in 2000 to 20 in 2020.${extra}\n\n![The value doubled](${slug}-trend.svg)\n\n## Friction notes\n\nFollowed the story skill step 4; ${SKILL_MARKER} quoted here.\n`;
}

function writeRun(evalsDir, runId, { tree = TREE_OLD, extra = "", vendor = "fake", model = "fake", slug = "demo-story" } = {}) {
  const dir = join(evalsDir, "runs", "story", CASE.id, runId);
  const sd = join(dir, "artefacts", "site", "stories");
  mkdirSync(sd, { recursive: true });
  writeFileSync(join(sd, `${slug}.md`), story(slug, `${extra} (built from skill tree ${tree.slice(0, 7)}, run ${runId})`));
  writeFileSync(join(sd, `${slug}-outline.md`), `# Outline\n\nArgument: the value doubled.\n`);
  writeFileSync(join(sd, `${slug}-trend.svg`), SVG(`Doubled, ${runId}`));
  writeFileSync(join(sd, `${slug}-make-charts.mjs`), "// chart build\n");
  // Things a writer might leave in its workspace, and files the harness keeps next to a run:
  // none of them may reach the critic.
  mkdirSync(join(dir, "artefacts", "skills", "story"), { recursive: true });
  writeFileSync(join(dir, "artefacts", "skills", "story", "SKILL.md"), `# Story skill\n\n${SKILL_MARKER}\n`);
  writeFileSync(join(dir, "artefacts", "LESSONS.md"), `${LESSONS_MARKER}\n`);
  writeFileSync(join(dir, "critique-v0-1.md"), `${PRIOR_MARKER}\n`);
  const run = { run_id: runId, case_id: CASE.id, domain: "story", skill: { name: "story", ref: REF, tree, dirty: false }, harness: { tree: HARNESS, dirty: false }, writer: { vendor, model, model_actual: model }, started_at: "2026-10-10T09:00:00Z" };
  writeFileSync(join(dir, "run.json"), `${JSON.stringify(run, null, 2)}\n`);
  return dir;
}

function setup() {
  const root = mkdtempSync(join(tmpdir(), "critic-test-"));
  const evalsDir = join(root, "evals");
  mkdirSync(join(evalsDir, "cases", "story", CASE.id), { recursive: true });
  writeFileSync(join(evalsDir, "cases", "story", CASE.id, "case.json"), JSON.stringify(CASE));
  mkdirSync(join(evalsDir, "rubrics", "story"), { recursive: true });
  writeFileSync(join(evalsDir, "rubrics", "story", "v1.md"), readFileSync(join(evalsSrc, "rubrics", "story", "v1.md")));
  mkdirSync(join(root, "docs", "reviews"), { recursive: true });
  writeFileSync(join(root, "docs", "reviews", "demo-feedback.md"), `${FEEDBACK_MARKER}\n`);
  writeFileSync(join(evalsDir, "LESSONS.md"), `${LESSONS_MARKER}\n`);
  return { root, evalsDir, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

// Wraps an adapter and records every call.
function capture(adapter = fake) {
  const calls = [];
  return { calls, adapters: { fake: { critic: async (args) => (calls.push(args), adapter.critic(args)) } } };
}

const FAKE = { vendor: "fake", model: "fake", fallback: false, fallback_reason: null };
const clock = () => {
  let t = Date.parse("2026-10-10T14:00:00Z");
  return () => new Date((t += 60_000));
};

function assertBlind(prompt, runIds) {
  assert.ok(!prompt.includes(SKILL_MARKER), "skill text reached the critic");
  assert.ok(!prompt.includes(LESSONS_MARKER), "LESSONS.md reached the critic");
  assert.ok(!prompt.includes(PRIOR_MARKER), "a prior critique reached the critic");
  for (const id of [...runIds, TREE_OLD, TREE_NEW, REF, HARNESS, TREE_OLD.slice(0, 7), TREE_NEW.slice(0, 7), REF.slice(0, 7), HARNESS.slice(0, 7)]) {
    assert.ok(!prompt.includes(id), `version identifier ${id} reached the critic`);
  }
}

// --- Rubric ---------------------------------------------------------------------------

test("rubric v1: reader questions first, anchors for every dimension, a pairwise section", () => {
  const text = readFileSync(join(evalsSrc, "rubrics", "story", "v1.md"), "utf8");
  const r = parseRubric(text, "story/v1");
  assert.equal(r.features.fixedData, false, "v1 has no fixed-data scope");
  assert.equal(r.features.chartReading, false);
  const abs = r.sections.get("Absolute critique");
  const order = ["Reader questions.", "Missed findings.", "Charts.", "The one change.", "Would you publish it?", "Lessons.", "Checklist."].map((s) => abs.indexOf(`**${s}**`));
  assert.ok(order.every((i) => i >= 0), `every step present: ${order}`);
  assert.deepEqual([...order].sort((a, b) => a - b), order, "steps in order: reader questions first, checklist last");
  assert.match(r.sections.get("Reader questions"), /from the question alone/);
  const anchors = r.sections.get("Checklist anchors");
  for (const d of [...SCORE_DIMENSIONS, "data_choice"]) {
    const block = anchors.split(`- **${d}**`)[1];
    assert.ok(block, `anchor for ${d}`);
    for (const s of ["0:", "1:", "2:"]) assert.ok(block.split("- **")[0].includes(s), `${d} has a ${s} anchor`);
  }
  for (const t of ["All types", "explanatory", "historical", "current-state", "markets", "periodic"]) assert.ok(r.typeRules.get(t), `type rules for ${t}`);
  assert.match(r.sections.get("Pairwise judgement"), /fewer edits/);
  assert.match(r.sections.get("Pairwise judgement"), /`clear`.*`slight`/s);
  // The header (change log) is never a section, so it is never sent.
  assert.ok(![...r.sections.values()].some((s) => s.includes("Change log")));
  assert.throws(() => parseRubric("## Role\n\nx\n", "x/v1"), /no "## Reader questions" section/);
});

// --- Prompt assembly ---------------------------------------------------------------------

test("score: the skill, other run files, LESSONS.md and version identifiers never reach the critic", async () => {
  const { root, evalsDir, cleanup } = setup();
  try {
    const runId = "20261010-0900-t01-demo-fake-fake-1abcdef-1";
    const runDir = writeRun(evalsDir, runId);
    const { calls, adapters } = capture();
    const res = await scoreRun({ root, evalsDir, runDir, critic: FAKE, config, adapters, now: clock() });
    assert.ok(res.ok, JSON.stringify(res.errors));
    assert.deepEqual(calls.map((c) => c.kind), ["questions", "absolute"]);
    // Questions are written from the commission alone: no story material in that prompt.
    const [qp, ap] = calls.map((c) => c.prompt);
    assert.match(qp, /Why did the value double\?/);
    assert.ok(!qp.includes("rose from 10"), "the questions prompt must not contain the story");
    assert.ok(!qp.includes("Checklist anchors"));
    // The critique prompt has the material and the questions, and nothing it must not have.
    assert.match(ap, /rose from 10 in 2000/);
    assert.match(ap, /# Outline/);
    assert.match(ap, /Text labels drawn on it, in order: "Doubled, \[redacted\]", "10 in 2000"/);
    assert.match(ap, /path data elided/);
    assert.match(ap, /stroke="#4269d0"/);
    assert.match(ap, /The value doubled because of X\./, "references reach the critic");
    assert.match(ap, /1\. What is the main claim\?/);
    assert.match(ap, /### explanatory/);
    assert.ok(!ap.includes("### historical"), "only the case's type rules");
    assert.ok(!ap.includes("Friction notes"), "friction notes are the writer's, not the reader's");
    assert.ok(!ap.includes("2026-10-10"), "no run date (frontmatter date dropped)");
    assert.ok(!ap.includes(FEEDBACK_MARKER), "owner feedback only with --calibrate");
    assert.ok(!qp.includes("## Fixed data") && !ap.includes("## Fixed data"), "v1 prompts carry no data inventory");
    assert.ok(!ap.includes("set-aside"));
    assertBlind(qp, [runId]);
    assertBlind(ap, [runId]);
    // And the real story skill's text is nowhere in it.
    const skill = readFileSync(join(repoRoot, "skills", "story", "SKILL.md"), "utf8");
    for (const line of skill.split("\n").filter((l) => l.length > 60)) assert.ok(!ap.includes(line), `skill line reached the critic: ${line.slice(0, 60)}`);

    const cq = JSON.parse(readFileSync(res.file, "utf8"));
    assert.equal(cq.rubric, "story/v1");
    assert.equal(cq.reader_questions.length, 5);
    assert.ok(existsSync(res.file.replace(/\.json$/, ".md")));
    const row = readLedger(join(evalsDir, "ledger.jsonl")).pop();
    assert.deepEqual(validateLedgerRow(row).errors, []);
    assert.equal(row.kind, "score");
    assert.equal(row.status, "ok");
    assert.equal(row.file, `runs/story/t01-demo/${runId}/critique-v1-1.json`);
    assert.deepEqual(row.scores, { argument: 1, depth: 1, charts: 1, honesty: 1, reader_questions: 1, prose: 1 });

    // Re-scoring appends: a second file and a second row.
    const again = await scoreRun({ root, evalsDir, runDir, critic: FAKE, config, adapters: capture().adapters, now: clock() });
    assert.match(again.file, /critique-v1-2\.json$/);
    assert.equal(readLedger(join(evalsDir, "ledger.jsonl")).filter((r) => r.kind === "score").length, 2);

    // --calibrate adds the owner's feedback, still nothing else.
    const cal = capture();
    await scoreRun({ root, evalsDir, runDir, critic: FAKE, config, adapters: cal.adapters, calibrate: true, now: clock() });
    assert.match(cal.calls[1].prompt, new RegExp(FEEDBACK_MARKER));
    assert.ok(!cal.calls[0].prompt.includes(FEEDBACK_MARKER), "not in the questions step");
    assertBlind(cal.calls[1].prompt, [runId]);
    assert.equal(readLedger(join(evalsDir, "ledger.jsonl")).pop().calibrate, true);
  } finally {
    cleanup();
  }
});

test("redaction and reader prose helpers", () => {
  const r = redactor([{ run_id: "20261010-0900-x-1", skill: { tree: TREE_OLD, ref: REF }, harness: { tree: HARNESS } }]);
  assert.equal(r(`a ${TREE_OLD} b ${TREE_OLD.slice(0, 7)} c 20261010-0900-x-1`), "a [redacted] b [redacted] c [redacted]");
  const p = readerProse(`---\ntitle: 'T'\ndate: 2026-01-01\n---\n\nBody.\n\n## Friction notes\n\nx\n\n## After\n\ny\n`);
  assert.deepEqual(p, { title: "T", prose: "Body.\n\n## After\n\ny" });
  assert.equal(svgForCritic(`<path d="${"1".repeat(130)}"/><path d="M0,0"/>`), `<path d="[130 chars of path data elided]"/><path d="M0,0"/>`);
});

// --- Validation and retry ----------------------------------------------------------------

function scripted(answers) {
  // answers: { questions: [...outputs], absolute: [...], pairwise: [...] }, consumed in order.
  const queues = Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, [...v]]));
  const calls = [];
  return {
    calls,
    adapters: {
      fake: {
        critic: async (args) => {
          calls.push(args);
          const next = queues[args.kind]?.shift();
          if (next === undefined) return fake.critic(args);
          if (next instanceof Error) throw next;
          if (next === "call-failed") return { ok: false, error: "exit 1", output: null, cost_usd: 0.01, usage: null, model_actual: "m" };
          return { ok: true, error: null, output: typeof next === "function" ? next(args) : next, cost_usd: 0.01, usage: { input_tokens: 10 }, model_actual: "m" };
        },
      },
    },
  };
}

test("a malformed critique is retried once, then recorded as critic_failed", async () => {
  const { root, evalsDir, cleanup } = setup();
  try {
    const runDir = writeRun(evalsDir, "20261010-0900-t01-demo-fake-fake-1abcdef-1");
    const bad = { reader_questions: [], scores: { argument: { score: 3, why: "" } } };
    const s = scripted({ absolute: [bad, "call-failed"] });
    const res = await scoreRun({ root, evalsDir, runDir, critic: FAKE, config, adapters: s.adapters, now: clock() });
    assert.equal(res.ok, false);
    assert.deepEqual(s.calls.map((c) => c.kind), ["questions", "absolute", "absolute"], "one retry, no more");
    assert.match(res.errors[0], /attempt 1: invalid answer: .*publishable: must be one of/);
    assert.match(res.errors[1], /attempt 2: critic call failed: exit 1/);
    const row = readLedger(join(evalsDir, "ledger.jsonl")).pop();
    assert.equal(row.status, "critic_failed");
    assert.equal(row.calls, 3);
    assert.equal(row.cost_usd, 0.02, "the fake questions call costs 0; the two scripted calls 0.01 each");
    assert.ok(!readdirSync(runDir).some((n) => n.startsWith("critique-v1")), "no critique file for a failed critique");

    // Invalid once, then valid: accepted on the retry.
    const s2 = scripted({ questions: [{ questions: ["only one"] }] });
    const ok = await scoreRun({ root, evalsDir, runDir, critic: FAKE, config, adapters: s2.adapters, now: clock() });
    assert.ok(ok.ok);
    assert.deepEqual(s2.calls.map((c) => c.kind), ["questions", "questions", "absolute"]);
  } finally {
    cleanup();
  }
});

test("buildAbsolute rejects malformed answers and restores the question wording", () => {
  const questions = ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"];
  const good = {
    reader_questions: questions.map((q) => ({ q: q.toLowerCase(), answered: "no", where: "somewhere" })),
    missed_findings: [],
    charts: [{ file: "a.svg", shows: "x", form_fits: false, fix: "y" }],
    top_change: "t",
    publishable: "no",
    lessons: [],
    scores: Object.fromEntries(SCORE_DIMENSIONS.map((d) => [d, { score: 0, why: "w" }])),
  };
  const opts = { rubric: "story/v1", critic: { ...FAKE, model_actual: null }, questions, dataMode: "fixed" };
  const b = buildAbsolute(good, opts);
  assert.ok(b.ok, b.errors.join("; "));
  assert.deepEqual(b.critique.reader_questions[0], { q: "Q1?", answered: "no", where: "" });
  for (const [mutate, pattern] of [
    [(o) => (o.publishable = "maybe"), /publishable/],
    [(o) => delete o.scores.prose, /scores\.prose/],
    [(o) => (o.scores.argument.score = 3), /scores\.argument\.score/],
    [(o) => (o.lessons = Array(6).fill({ rule: "r", evidence: "e" })), /lessons: must have at most 5/],
    [(o) => o.reader_questions.pop(), /reader_questions: want 5/],
    [(o) => (o.reader_questions[0].answered = "maybe"), /answered/],
  ]) {
    const o = structuredClone(good);
    mutate(o);
    const r = buildAbsolute(o, opts);
    assert.equal(r.ok, false);
    assert.match(r.errors.join("; "), pattern);
  }
  assert.equal(buildAbsolute("not json", opts).ok, false);
  // Open mode requires data_choice and the schema asks for it.
  assert.match(buildAbsolute(good, { ...opts, dataMode: "open" }).errors.join(";"), /scores\.data_choice/);
  assert.ok("data_choice" in absoluteSchema("open").properties.scores.properties);
  assert.ok(!("data_choice" in absoluteSchema("fixed").properties.scores.properties));
});

test("rubric v2: fixed-data scope, chart reading, and the round-1 depth and precision anchors", () => {
  const r = loadRubric(evalsSrc, "story/v2");
  assert.equal(latestRubricId(evalsSrc, "story"), "story/v2");
  assert.deepEqual(r.features, { fixedData: true, chartReading: true });
  assert.match(r.sections.get("Fixed data"), /set aside/i);
  assert.match(r.sections.get("Absolute critique"), /`set-aside`/);
  for (const f of ["glance", "glance_matches_prose", "encodings", "encodings_clear"]) assert.match(r.sections.get("Chart reading"), new RegExp(`\`${f}\``));
  const anchors = r.sections.get("Checklist anchors");
  assert.match(anchors.split("- **depth**")[1].split("- **charts**")[0], /what it contains/);
  assert.match(anchors.split("- **prose**")[1].split("- **data_choice**")[0], /more digits than a reader can hold/);
  assert.match(anchors.split("- **charts**")[1].split("- **honesty**")[0], /five-second/);
  assert.match(r.sections.get("Pairwise judgement"), /`set-aside`/);
  // v1 stays byte-identical to its frozen hash.
  assert.equal(loadRubric(evalsSrc, "story/v1").sha256.slice(0, 8), "86d8957b");
});

test("parseCsv and dataInventory: what the fixed-mode writer was given, from the pinned commit", () => {
  assert.deepEqual(parseCsv('a,b\n"x, y","say ""hi"""\r\n1,\n'), [["a", "b"], ["x, y", 'say "hi"'], ["1", ""]]);
  const files = {
    "abcdef0:datasets/demo/datapackage.json": JSON.stringify({
      title: "Demo values",
      description: "A demo series.",
      sources: [{ title: "Demo office" }],
      resources: [{ name: "v", title: "Values", path: "data/v.csv", schema: { fields: [{ name: "year", type: "year" }, { name: "kind", type: "string", description: "Kind of value." }, { name: "value", type: "number" }] } }],
    }),
    "abcdef0:datasets/demo/data/v.csv": "year,kind,value\n2001,b,2\n2000,a,1\n2020,a,\n",
  };
  const read = (c, p) => files[`${c}:${p}`] ?? null;
  read.list = () => [{ path: "datapackage.json", size: 10 }, { path: "data/v.csv", size: 40 }, { path: "archive/source.html", size: 4096 }];
  const inv = dataInventory(CASE, read);
  assert.match(inv, /writer could also read[^\n]*\n- `archive\/source\.html` \(4 KB\)$/);
  assert.match(inv, /^## The data the writer was given/);
  assert.match(inv, /### Demo values\n\nA demo series\./);
  assert.match(inv, /Sources: Demo office\./);
  assert.match(inv, /- \*\*Values\*\* \(`data\/v\.csv`, 3 rows, 2 with an observation\)/);
  assert.match(inv, /`year` \(year\) Range: 2000 to 2001\./, "ranges cover rows with an observation");
  assert.match(inv, /`kind` \(string\): Kind of value\. Values: a, b\./);
  assert.match(dataInventory({ ...CASE, inputs: [{ path: "datasets/none", commit: "abcdef0" }] }, () => null), /no datapackage\.json/);
});

test("score under v2: inventory in every fixed-mode prompt, set-aside answers and chart reading recorded", async () => {
  const { root, evalsDir, cleanup } = setup();
  try {
    writeFileSync(join(evalsDir, "rubrics", "story", "v2.md"), readFileSync(join(evalsSrc, "rubrics", "story", "v2.md")));
    const runId = "20261010-0900-t01-demo-fake-fake-1abcdef-1";
    const runDir = writeRun(evalsDir, runId);
    const { calls, adapters } = capture();
    const readInput = (c, p) => (p.endsWith("datapackage.json") ? JSON.stringify({ title: "INVENTORY-TITLE", resources: [] }) : null);
    const res = await scoreRun({ root, evalsDir, runDir, rubricId: "story/v2", critic: FAKE, config, adapters, readInput, now: clock() });
    assert.ok(res.ok, JSON.stringify(res.errors));
    const [qc, ac] = calls;
    for (const pr of [qc.prompt, ac.prompt]) {
      assert.match(pr, /## Fixed data/);
      assert.match(pr, /### INVENTORY-TITLE/);
      assertBlind(pr, [runId]);
    }
    assert.ok(!qc.prompt.includes("rose from 10"), "still no story in the questions prompt");
    assert.match(ac.prompt, /## Chart reading/);
    assert.match(ac.prompt, /each with file, glance, glance_matches_prose, encodings, encodings_clear/);
    assert.deepEqual(ac.jsonSchema.properties.reader_questions.items.properties.answered.enum, ["yes", "partly", "no", "set-aside"]);
    assert.ok("encodings_clear" in ac.jsonSchema.properties.charts.items.properties);
    const cq = JSON.parse(readFileSync(res.file, "utf8"));
    assert.equal(cq.rubric, "story/v2");
    assert.deepEqual(cq.reader_questions.at(-1), { q: "What would make it better or worse?", answered: "set-aside", where: "" });
    assert.equal(cq.charts[0].glance, "a fake glance");
    assert.match(readFileSync(res.file.replace(/\.json$/, ".md"), "utf8"), /\| 5 \| What would make it better or worse\? \| set-aside \|/);

    // Open mode: no inventory, no set-aside; chart reading still applies.
    writeFileSync(join(evalsDir, "cases", "story", CASE.id, "case.json"), JSON.stringify({ ...CASE, data_mode: "open" }));
    const open = capture();
    const r2 = await scoreRun({ root, evalsDir, runDir, rubricId: "story/v2", critic: FAKE, config, adapters: open.adapters, readInput, now: clock() });
    assert.ok(r2.ok, JSON.stringify(r2.errors));
    assert.ok(!open.calls[1].prompt.includes("## Fixed data"));
    assert.deepEqual(open.calls[1].jsonSchema.properties.reader_questions.items.properties.answered.enum, ["yes", "partly", "no"]);
    assert.match(open.calls[1].prompt, /## Chart reading/);
  } finally {
    cleanup();
  }
});

test("buildAbsolute: set-aside only when offered, chart-reading fields required when on", () => {
  const questions = ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"];
  const out = {
    reader_questions: questions.map((q) => ({ q, answered: "set-aside", where: "x" })),
    missed_findings: [],
    charts: [{ file: "a.svg", shows: "x", form_fits: true, fix: "" }],
    top_change: "t",
    publishable: "no",
    lessons: [],
    scores: Object.fromEntries(SCORE_DIMENSIONS.map((d) => [d, { score: 0, why: "w" }])),
  };
  const opts = { rubric: "story/v2", critic: { ...FAKE, model_actual: null }, questions, dataMode: "fixed" };
  assert.match(buildAbsolute(out, opts).errors.join(";"), /answered: must be one of yes, partly, no$/m);
  const ok = buildAbsolute(out, { ...opts, answers: ["yes", "partly", "no", "set-aside"] });
  assert.ok(ok.ok, ok.errors.join(";"));
  assert.equal(ok.critique.reader_questions[0].where, "", "no where for a set-aside question");
  const cr = { ...opts, answers: ["yes", "partly", "no", "set-aside"], chartReading: true };
  assert.match(buildAbsolute(out, cr).errors.join(";"), /charts\[0\]\.glance: must be a non-empty string/);
  const full = structuredClone(out);
  Object.assign(full.charts[0], { glance: "g", glance_matches_prose: false, encodings: "blue = revenue", encodings_clear: false });
  assert.ok(buildAbsolute(full, cr).ok);
  const pw = { reader_questions: questions.map((q) => ({ q, story_1: "set-aside", story_2: "set-aside" })), why: "w", preferred: "tie", margin: null };
  assert.equal(buildPairwise(pw, { rubric: "story/v2", critic: { ...FAKE, model_actual: null }, questions, order: "AB" }).ok, false);
  assert.ok(buildPairwise(pw, { rubric: "story/v2", critic: { ...FAKE, model_actual: null }, questions, order: "AB", answers: ["yes", "partly", "no", "set-aside"] }).ok);
});

// --- Rendering -------------------------------------------------------------------------------

test("critique.md is deterministic, findings first and checklist last", async () => {
  const questions = ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"];
  const { output } = await fake.critic({ kind: "absolute", meta: { questions, charts: ["a.svg"] } });
  const { critique } = buildAbsolute(output, { rubric: "story/v1", critic: { ...FAKE, model_actual: "fake" }, questions, dataMode: "fixed" });
  const a = renderCritique(critique, { runId: "r1" });
  assert.equal(a, renderCritique(structuredClone(critique), { runId: "r1" }));
  const at = (s) => a.indexOf(s);
  assert.ok(at("## Reader questions") < at("## Strongest findings missed"));
  assert.ok(at("## Strongest findings missed") < at("## Charts"));
  assert.ok(at("## Charts") < at("## The one change"));
  assert.ok(at("## Would the commissioning reader publish it?") < at("## Lessons"));
  assert.ok(at("## Lessons") < at("## Checklist (0-2)"));
  assert.ok(a.trimEnd().endsWith("| prose | 1 | fake critic |"), "the checklist is the last thing");
  assert.ok(!/\d{4}-\d{2}-\d{2}T/.test(a), "no timestamps");
});

// --- Order swap ---------------------------------------------------------------------------------

test("pairResult: a win only when both orders name the same run", () => {
  assert.deepEqual(pairResult([{ preferred_run_id: "r1" }, { preferred_run_id: "r1" }]), { winner_run_id: "r1", split: false });
  assert.deepEqual(pairResult([{ preferred_run_id: "r1" }, { preferred_run_id: "r2" }]), { winner_run_id: null, split: true });
  assert.deepEqual(pairResult([{ preferred_run_id: "r1" }, { preferred_run_id: null }]), { winner_run_id: null, split: true });
  assert.deepEqual(pairResult([{ preferred_run_id: null }, { preferred_run_id: null }]), { winner_run_id: null, split: false });
});

test("buildPairwise maps presentation labels back to the pair's labels", () => {
  const questions = ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"];
  const out = { reader_questions: questions.map((q) => ({ q, story_1: "yes", story_2: "no" })), why: "w", preferred: "1", margin: "clear" };
  const opts = { rubric: "story/v1", critic: { ...FAKE, model_actual: null }, questions };
  const ab = buildPairwise(out, { ...opts, order: "AB" }).critique;
  assert.equal(ab.preferred, "A");
  assert.deepEqual(ab.reader_questions[0], { q: "Q1?", A: "yes", B: "no" });
  const ba = buildPairwise(out, { ...opts, order: "BA" }).critique;
  assert.equal(ba.preferred, "B", "in order BA Story 1 is the pair's B");
  assert.deepEqual(ba.shown, { story_1: "B", story_2: "A" });
  assert.deepEqual(ba.reader_questions[0], { q: "Q1?", A: "no", B: "yes" });
  assert.equal(buildPairwise({ ...out, preferred: "tie", margin: "clear" }, { ...opts, order: "BA" }).critique.margin, null);
  assert.match(buildPairwise({ ...out, margin: null }, { ...opts, order: "AB" }).errors.join(";"), /margin/);
  assert.match(buildPairwise({ ...out, preferred: "A" }, { ...opts, order: "AB" }).errors.join(";"), /preferred: must be 1, 2 or tie/);
});

async function pairWith(evalsDir, root, s, random = () => 0) {
  const r1 = writeRun(evalsDir, "20261010-0900-t01-demo-fake-fake-1abcdef-1", { tree: TREE_OLD });
  const r2 = writeRun(evalsDir, "20261010-1000-t01-demo-fake-fake-2bcdef0-1", { tree: TREE_NEW, extra: " A longer second story." });
  return pairRuns({ root, evalsDir, runDirs: [r1, r2], critic: FAKE, config, adapters: s.adapters, now: clock(), random });
}

const verdict = (preferred) => (args) => ({ reader_questions: args.meta.questions.map((q) => ({ q, story_1: "yes", story_2: "partly" })), why: "because", preferred, margin: preferred === "tie" ? null : "clear" });

test("pair: orders that agree make a win; position bias (both say 'first') makes a tie", async () => {
  const { root, evalsDir, cleanup } = setup();
  try {
    // random 0: run 1 is A. AB shows A as Story 1; BA shows B as Story 1. "1" then "2" both mean pair-A.
    const agree = await pairWith(evalsDir, root, scripted({ pairwise: [verdict("1"), verdict("2")] }));
    assert.deepEqual(agree.row.judgements.map((j) => j.preferred_run_id), [agree.row.run_ids[0], agree.row.run_ids[0]]);
    assert.equal(agree.row.winner_run_id, agree.row.run_ids[0]);
    // Both orders prefer whatever is shown first: a split, so a tie.
    const bias = await pairWith(evalsDir, root, scripted({ pairwise: [verdict("1"), verdict("1")] }));
    assert.equal(bias.row.winner_run_id, null);
    assert.notEqual(bias.row.judgements[0].preferred_run_id, bias.row.judgements[1].preferred_run_id);
    // With run 2 as A (random 1), the same answers name the other run.
    const swapped = await pairWith(evalsDir, root, scripted({ pairwise: [verdict("1"), verdict("2")] }), () => 1);
    assert.equal(swapped.row.winner_run_id, swapped.row.run_ids[1]);
    assert.deepEqual(readMappingFile(evalsDir, swapped.pairId), { pair_id: swapped.pairId, A: swapped.row.run_ids[1], B: swapped.row.run_ids[0] });
    for (const r of readLedger(join(evalsDir, "ledger.jsonl"))) assert.deepEqual(validateLedgerRow(r).errors, []);
  } finally {
    cleanup();
  }
});

test("pair: blind A/B folders, nothing identifying in the prompts, and the owner flow reads the mapping", async () => {
  const { root, evalsDir, cleanup } = setup();
  try {
    const s = capture();
    const res = await pairWith(evalsDir, root, s);
    assert.deepEqual(s.calls.map((c) => c.kind), ["questions", "pairwise", "pairwise"]);
    for (const c of s.calls) {
      assertBlind(c.prompt, res.row.run_ids);
      assert.ok(!c.prompt.includes("2026-10-10"), "no run dates");
      assert.ok(!c.prompt.includes("# Outline"), "pairwise compares the stories, not the outlines");
    }
    // AB shows the pair's A first, BA shows B first.
    const [, ab, ba] = s.calls.map((c) => c.prompt);
    const pos1 = (p) => p.indexOf("## Story 1");
    assert.ok(ab.slice(pos1(ab)).indexOf("A longer second story") > ab.slice(pos1(ab)).indexOf("## Story 2"), "AB: run 1 (A) is Story 1");
    assert.ok(ba.slice(pos1(ba)).indexOf("A longer second story") < ba.slice(pos1(ba)).indexOf("## Story 2"), "BA: run 2 (B) is Story 1");
    // The fake prefers the longer prose in both orders: a win for run 2.
    assert.equal(res.row.winner_run_id, res.row.run_ids[1]);

    const dir = join(evalsDir, "pairs", res.pairId);
    assert.deepEqual(readdirSync(dir).sort(), ["A", "B", "critique-AB.json", "critique-BA.json", "critique.md", "mapping.json"]);
    for (const label of ["A", "B"]) {
      assert.deepEqual(readdirSync(join(dir, label)).sort(), ["demo-story-trend.svg", "demo-story.md"], "prose and charts only");
      const prose = readFileSync(join(dir, label, "demo-story.md"), "utf8");
      assert.ok(!prose.includes("Friction notes") && !prose.includes("date:"));
      assertBlind(prose + readFileSync(join(dir, label, "demo-story-trend.svg"), "utf8"), res.row.run_ids);
    }
    assert.equal(renderPairCritique(res.pairId, res.judgements), readFileSync(join(dir, "critique.md"), "utf8"));

    // hcn.9's owner flow: blind judgement, then the reveal reads mapping.json written by pair.
    const owner = recordPair({ evalsDir, pairId: res.pairId, preferred: "B", remarks: "B reads better.\n", now: clock() });
    assert.equal(owner.reveal.preferred_run_id, res.row.run_ids[1]);
    assert.deepEqual(owner.agreements, [{ rubric: "story/v1", critic_winner_run_id: res.row.run_ids[1], agrees: true }]);
  } finally {
    cleanup();
  }
});

test("pair: refuses runs of different cases or the same run, and cleans up after a critic failure", async () => {
  const { root, evalsDir, cleanup } = setup();
  try {
    const r1 = writeRun(evalsDir, "20261010-0900-t01-demo-fake-fake-1abcdef-1");
    await assert.rejects(pairRuns({ root, evalsDir, runDirs: [r1, r1], critic: FAKE, config, adapters: capture().adapters }), /two different runs/);
    const s = scripted({ pairwise: ["call-failed", "call-failed"] });
    await assert.rejects(pairWith(evalsDir, root, s), /critic_failed on order AB/);
    assert.ok(!existsSync(join(evalsDir, "pairs")) || readdirSync(join(evalsDir, "pairs")).length === 0, "no half-written pair left behind");
    assert.ok(!readLedger(join(evalsDir, "ledger.jsonl")).some((r) => r.kind === "pair"));
  } finally {
    cleanup();
  }
});

// --- Critic choice ---------------------------------------------------------------------------

test("resolveCritic: fake, auto, explicit vendor and a model override", () => {
  const available = () => ({ ok: true, reason: null });
  const claudeWriter = [{ vendor: "claude", model: config.models.claude.writer }];
  assert.deepEqual(resolveCritic({ spec: "fake", writers: claudeWriter, config, available }), FAKE);
  assert.equal(resolveCritic({ spec: "auto", writers: claudeWriter, config, available }).vendor, "codex");
  assert.equal(resolveCritic({ spec: "auto", writers: claudeWriter, config, available, model: "gpt-6-luna" }).model, "gpt-6-luna");
  const same = resolveCritic({ spec: "claude", writers: claudeWriter, config, available });
  assert.deepEqual(same, { vendor: "claude", model: config.families.sonnet, fallback: true, fallback_reason: "--critic claude requested for a claude writer" });
  assert.throws(() => resolveCritic({ spec: "auto", writers: [{ vendor: "fake", model: "fake" }], config, available }), /needs a real writer/);
  assert.throws(() => resolveCritic({ spec: "claude", writers: claudeWriter, config, available, model: config.models.claude.writer }), /writer's own model/);
  assert.throws(() => resolveCritic({ spec: "codex", writers: claudeWriter, config, available: () => ({ ok: false, reason: "no auth" }) }), /--critic codex: no auth/);
});

// --- CLI ------------------------------------------------------------------------------------------

test("score and pair with --critic fake through the CLI, on fake-writer runs", () => {
  const { root } = makeRepo();
  const cli = (args) => spawnSync(process.execPath, [join(root, "evals/run.mjs"), ...args], { cwd: root, encoding: "utf8" });
  try {
    for (let i = 0; i < 2; i++) assert.equal(cli(["run", "story/t01-demo", "--writer", "fake", "--no-critic"]).status, 0);
    const caseRuns = join(root, "evals/runs/story/t01-demo");
    const ids = readdirSync(caseRuns).sort();
    assert.equal(ids.length, 2);
    const s = cli(["score", ids[0], "--critic", "fake"]);
    assert.equal(s.status, 0, s.stderr);
    assert.match(s.stdout, /publishable with-edits/);
    assert.ok(existsSync(join(caseRuns, ids[0], "critique-v2-1.md")), "the latest rubric (v2) by default");
    assert.match(readFileSync(join(caseRuns, ids[0], "critique-v2-1.md"), "utf8"), /At a glance: a fake glance/);
    assert.notEqual(cli(["score", ids[0]]).status, 0, "auto refuses a fake writer");
    const p = cli(["pair", ids[0], ids[1], "--critic", "fake"]);
    assert.equal(p.status, 0, p.stderr);
    assert.match(p.stdout, /a tie/, "two identical fake stories tie");
    const rows = readLedger(join(root, "evals/ledger.jsonl"));
    assert.deepEqual(rows.map((r) => r.kind), ["run", "check", "run", "check", "score", "pair"]);
    assert.match(readFileSync(join(root, "evals/REPORT.md"), "utf8"), /Absolute scores, rubric story\/v2/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("calibration runs resolve by id but stay out of --all", () => {
  const evalsDir = mkdtempSync(join(tmpdir(), "evals-calib-"));
  try {
    const live = join(evalsDir, "runs", "story", "q01", "20261010-0000-q01-fake-fake-abc1234-1");
    const calib = join(evalsDir, "calibration", "story", "q01", "20261008-0000-q01-french-debt-historical-draft1-0");
    for (const d of [live, calib]) {
      mkdirSync(d, { recursive: true });
      writeFileSync(join(d, "run.json"), "{}\n");
    }
    writeFileSync(join(evalsDir, "calibration", "story", "round-2.json"), "{}\n");
    assert.equal(findRunDir(evalsDir, "20261008-0000-q01-french-debt-historical-draft1-0"), calib);
    assert.equal(findRunDir(evalsDir, "20261010-0000-q01-fake-fake-abc1234-1"), live);
    assert.deepEqual(allRunDirs(evalsDir), [live]);
    assert.throws(() => findRunDir(evalsDir, "nope"), /no run nope/);
  } finally {
    rmSync(evalsDir, { recursive: true, force: true });
  }
});

test("score --png: renders charts, attaches them to the critique call only, refuses Claude and a missing rasteriser", async () => {
  const { root, evalsDir, cleanup } = setup();
  try {
    const runId = "20261010-0900-t01-demo-fake-fake-1abcdef-1";
    const runDir = writeRun(evalsDir, runId);
    const rendered = [];
    const renderer = {
      available: () => ({ ok: true }),
      renderCharts: (charts, dir) => charts.map((c, i) => (rendered.push(c.raw), join(dir, `chart-${i + 1}.png`))),
    };
    const { calls, adapters } = capture();
    const res = await scoreRun({ root, evalsDir, runDir, critic: FAKE, config, adapters, png: true, renderer, now: clock() });
    assert.ok(res.ok, JSON.stringify(res.errors));
    assert.equal(calls[0].images, undefined, "no images in the questions step");
    assert.equal(calls[1].images.length, 1);
    assert.match(calls[1].prompt, /PNG renders of the embedded charts are attached/);
    assert.ok(!rendered[0].includes(runId), "the rendered SVG is the redacted one");
    assert.equal(readLedger(join(evalsDir, "ledger.jsonl")).pop().png, true);
    assert.equal(JSON.parse(readFileSync(res.file, "utf8")).png_images, 1);
    // Without --png the prompt says nothing about images.
    const plain = capture();
    await scoreRun({ root, evalsDir, runDir, critic: FAKE, config, adapters: plain.adapters, now: clock() });
    assert.ok(!plain.calls[1].prompt.includes("PNG renders"));
    await assert.rejects(scoreRun({ root, evalsDir, runDir, critic: { ...FAKE, vendor: "claude" }, config, adapters: { claude: { critic: async () => ({}) } }, png: true, renderer, now: clock() }), /takes no images/);
    await assert.rejects(scoreRun({ root, evalsDir, runDir, critic: FAKE, config, adapters, png: true, renderer: { available: () => ({ ok: false, reason: "no qlmanage" }) }, now: clock() }), /no qlmanage/);
  } finally {
    cleanup();
  }
});
