// Builds a throwaway git repo with a copy of the harness, a stub skill, a tiny dataset and a
// test case, so the runner can be exercised end to end without touching this repository.
// (Named so `node --test` does not pick it up as a test file.)

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const evalsDir = join(dirname(fileURLToPath(import.meta.url)), "..");

export function sh(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

export function write(root, path, text) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
}

export function commitAll(root, message) {
  sh(root, ["add", "--all"]);
  sh(root, ["commit", "-q", "-m", message]);
  return sh(root, ["rev-parse", "HEAD"]);
}

export function makeRepo({ withHarness = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "evals-repo-"));
  sh(root, ["init", "-q", "-b", "main"]);
  sh(root, ["config", "user.email", "evals@example.invalid"]);
  sh(root, ["config", "user.name", "Evals Test"]);
  sh(root, ["config", "commit.gpgsign", "false"]);
  write(root, "skills/story/SKILL.md", "# Story skill (stub)\n");
  write(root, "datasets/demo/data.csv", "year,value\n2000,10\n2020,20\n");
  const dataCommit = commitAll(root, "data");
  if (withHarness) {
    cpSync(join(evalsDir, "lib"), join(root, "evals/lib"), { recursive: true });
    cpSync(join(evalsDir, "run.mjs"), join(root, "evals/run.mjs"));
    cpSync(join(evalsDir, "config.json"), join(root, "evals/config.json"));
    write(root, "evals/cases/story/t01-demo/case.json", JSON.stringify(demoCase(dataCommit), null, 2));
    write(root, "evals/cases/story/t01-demo/prompt.md", "# Task\n\nWhy did the value double?\n");
    commitAll(root, "harness");
  }
  return { root, dataCommit };
}

export function demoCase(commit) {
  return {
    id: "t01-demo",
    domain: "story",
    title: "Demo",
    question: "Why did the value double?",
    type: "explanatory",
    data_mode: "fixed",
    inputs: [{ path: "datasets/demo", commit }],
    skills: ["story"],
    references: [],
    owner_feedback: [],
    budget: { max_usd: 20, max_turns: 100, words: [300, 700] },
  };
}
