// The committed cases: valid against this repository (input commits on main) and prompts that
// never carry owner feedback, which is for the critic in calibration only.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCase } from "./lib/schema.mjs";
import { git, isAncestorOfMain, repoRoot } from "./lib/versions.mjs";

const evalsDir = dirname(fileURLToPath(import.meta.url));
const root = repoRoot(evalsDir);
const config = JSON.parse(readFileSync(join(evalsDir, "config.json"), "utf8"));

const cases = [];
for (const domain of readdirSync(join(evalsDir, "cases"))) {
  for (const id of readdirSync(join(evalsDir, "cases", domain))) cases.push({ domain, id, dir: join(evalsDir, "cases", domain, id) });
}

const hasMain = (() => {
  try {
    git(root, ["rev-parse", "--verify", "main"]);
    return true;
  } catch {
    return false;
  }
})();

test("q01-french-debt is present with the pinned inputs and budget", () => {
  const kase = JSON.parse(readFileSync(join(evalsDir, "cases/story/q01-french-debt/case.json"), "utf8"));
  assert.equal(kase.type, "explanatory");
  assert.equal(kase.data_mode, "fixed");
  assert.deepEqual(kase.inputs, [{ path: "datasets/france-public-finances", commit: "f0082af" }]);
  assert.deepEqual(kase.references, []);
  assert.deepEqual(kase.budget, { max_usd: 20, max_turns: 100, words: [300, 700] });
});

for (const { domain, id, dir } of cases) {
  test(`${domain}/${id}: case.json validates, inputs on main, feedback files exist`, { skip: !hasMain && "no main branch in this clone" }, () => {
    const kase = JSON.parse(readFileSync(join(dir, "case.json"), "utf8"));
    const res = validateCase(kase, { isAncestor: (c) => isAncestorOfMain(root, c) });
    assert.deepEqual(res.errors, []);
    assert.equal(kase.id, id);
    assert.equal(kase.domain, domain);
    for (const f of kase.owner_feedback) assert.ok(existsSync(join(root, f)), `missing ${f}`);
    assert.equal(kase.budget.max_usd <= config.caps[kase.data_mode].max_usd, true, "budget within the per-run cap");
  });

  test(`${domain}/${id}: prompt.md contains no owner feedback`, () => {
    const kase = JSON.parse(readFileSync(join(dir, "case.json"), "utf8"));
    const prompt = readFileSync(join(dir, "prompt.md"), "utf8");
    assert.ok(!/docs\/reviews|feedback|critique|owner/i.test(prompt), "prompt mentions feedback or reviews");
    // No run of six consecutive words from any feedback file may appear in the prompt.
    const words = (s) => s.toLowerCase().match(/[\p{L}\p{N}€]+/gu) ?? [];
    const N = 6;
    const pw = words(prompt);
    const promptShingles = new Set(pw.map((_, i) => pw.slice(i, i + N).join(" ")).filter((s) => s.split(" ").length === N));
    for (const f of kase.owner_feedback) {
      const fw = words(readFileSync(join(root, f), "utf8"));
      for (let i = 0; i + N <= fw.length; i++) {
        const shingle = fw.slice(i, i + N).join(" ");
        assert.ok(!promptShingles.has(shingle), `prompt contains feedback text from ${f}: "${shingle}"`);
      }
    }
    assert.ok(prompt.includes(kase.question), "prompt states the question verbatim");
    assert.ok(prompt.includes("site/stories/"), "prompt says where files go");
  });
}

test("config pins full model IDs (no aliases) and the per-run caps", () => {
  const ids = [...Object.values(config.models).flatMap((m) => Object.values(m)), ...Object.values(config.families)];
  for (const id of ids) assert.match(id, /^[a-z]+(?:-[a-z0-9]+)*-\d[a-z0-9.-]*$/, `${id} looks like an alias`);
  assert.deepEqual(config.caps, { fixed: { max_usd: 20, max_turns: 100 }, open: { max_usd: 30, max_turns: 150 } });
  assert.deepEqual(config.critic_preference, { claude: "codex", codex: "claude" });
  // Each fallback family differs from the writer's, so the critic is never the writer's model.
  assert.equal(config.critic_fallback.opus, "sonnet");
  for (const [from, to] of Object.entries(config.critic_fallback)) {
    assert.notEqual(from, to);
    assert.ok(config.families[from] && config.families[to], `${from} -> ${to} are both in families`);
  }
});
