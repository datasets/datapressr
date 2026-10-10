// Fake writer: copies a canned artefact directory into the run's artefacts folder. Zero cost,
// no agent call; it exists so the runner, ledger and report can be exercised by npm test.

import { cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const vendor = "fake";

export function cannedDir(domain) {
  return join(here, "fake-artefacts", domain);
}

// destDir mirrors the writer's workspace: files land at their workspace-relative paths.
export async function write({ domain, destDir }) {
  const src = cannedDir(domain);
  if (!existsSync(src)) throw new Error(`fake writer has no canned artefacts for domain "${domain}" (${src})`);
  const started = Date.now();
  cpSync(src, destDir, { recursive: true });
  return {
    model: "fake",
    model_actual: "fake",
    cli_version: "fake",
    duration_ms: Date.now() - started,
    turns: 0,
    cost_usd: 0,
    cost_basis: null,
    usage: null,
    transcript_sha256: null,
    workspace_sha256: null,
    network: false,
    canary_run_id: null,
    leaks: [],
    flags: [],
  };
}

// Fake critic: deterministic, valid answers with no agent call, for npm test and plumbing runs.
// `kind` is questions | absolute | pairwise; `meta` carries what a real critic would read from
// the prompt (the reader questions, chart files, prose lengths). In pairwise mode it prefers the
// longer prose, so a pair judged in both orders agrees unless the two are the same length.
export async function critic({ kind, meta = {} }) {
  const base = { ok: true, error: null, model_actual: "fake", cost_usd: 0, turns: 0, usage: null, cli_version: "fake" };
  if (kind === "questions") {
    return { ...base, output: { questions: ["What is the main claim?", "How big is it, compared with what?", "What changed, and when?", "What is the main cause, and how do we know?", "What would make it better or worse?"] } };
  }
  const questions = meta.questions ?? [];
  if (kind === "absolute") {
    const dims = ["argument", "depth", "charts", "honesty", "reader_questions", "prose", ...(meta.dataMode === "open" ? ["data_choice"] : [])];
    return {
      ...base,
      output: {
        // With set-aside on (rubric story/v2, fixed mode) the last question is set aside.
        reader_questions: questions.map((q, i) => {
          if (i > 0 && i === questions.length - 1 && meta.answers?.includes("set-aside")) return { q, answered: "set-aside", where: "" };
          return { q, answered: i === 0 ? "yes" : "partly", where: i === 0 ? "opening paragraph" : "body" };
        }),
        missed_findings: ["Fake critic: no real reading was done."],
        charts: (meta.charts ?? []).map((file) => ({
          file,
          ...(meta.chartReading ? { glance: "a fake glance", glance_matches_prose: true, encodings: "fake encodings", encodings_clear: true } : {}),
          shows: "a fake description",
          form_fits: true,
          fix: "",
        })),
        top_change: "Fake critic: no change proposed.",
        publishable: "with-edits",
        lessons: [{ rule: "When the critic is fake, do not read anything into its scores.", evidence: "This critique came from the fake critic." }],
        scores: Object.fromEntries(dims.map((d) => [d, { score: 1, why: "fake critic" }])),
      },
    };
  }
  if (kind === "pairwise") {
    const { 1: one = 0, 2: two = 0 } = meta.lengths ?? {};
    const preferred = one === two ? "tie" : one > two ? "1" : "2";
    return {
      ...base,
      output: {
        reader_questions: questions.map((q) => ({ q, story_1: "partly", story_2: "partly" })),
        why: "Fake critic: prefers the longer prose.",
        preferred,
        margin: preferred === "tie" ? null : "slight",
      },
    };
  }
  return { ...base, ok: false, error: `fake critic: unknown kind ${kind}`, output: null };
}
