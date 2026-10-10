// Critic vendor choice with injected availability probes: no binaries, auth or agent calls.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { availabilityChecker, familyOf, pickCritic } from "./index.mjs";

const config = JSON.parse(readFileSync(join(fileURLToPath(new URL("../..", import.meta.url)), "config.json"), "utf8"));
const SHA = "a".repeat(64);

// Probes for a world where each vendor's binary, auth and canary can be switched off.
function world({ codex = "ok", claude = "ok" } = {}) {
  const state = { codex, claude };
  const calls = [];
  const probes = {
    cliVersion: (adapter) => {
      calls.push(`version:${adapter.vendor}`);
      if (state[adapter.vendor] === "missing") throw new Error(`spawn ${adapter.vendor} ENOENT`);
      return "1.0.0";
    },
    auth: (adapter) => (state[adapter.vendor] === "auth" ? { ok: false, reason: "Not logged in" } : { ok: true, reason: "ok" }),
    canary: (adapter, version, rows) => {
      if (state[adapter.vendor] === "canary") throw new Error(`no canary on record for ${adapter.vendor} ${version}`);
      return { run_id: `c-${adapter.vendor}`, rows };
    },
  };
  return { probes, calls, available: availabilityChecker({ ledgerRows: [], probes }) };
}

test("a Claude writer gets a Codex critic when Codex is available", () => {
  const w = world();
  assert.deepEqual(pickCritic("claude", { config, available: w.available }), { vendor: "codex", model: config.models.codex.critic, fallback: false, fallback_reason: null });
  assert.deepEqual(w.available("codex"), { ok: true, reason: null, cli_version: "1.0.0", canary_run_id: "c-codex" });
});

for (const [state, pattern] of [
  ["missing", /codex binary missing or not runnable: spawn codex ENOENT/],
  ["auth", /codex auth failing: Not logged in/],
  ["canary", /codex canary not passed: no canary on record/],
]) {
  test(`Codex ${state}: a Claude Opus writer falls back to a Sonnet-family Claude critic with the reason`, () => {
    const w = world({ codex: state });
    const pick = pickCritic({ vendor: "claude", model: "claude-opus-5-5" }, { config, available: w.available });
    assert.equal(pick.vendor, "claude");
    assert.equal(pick.model, config.families.sonnet);
    assert.equal(pick.fallback, true);
    assert.match(pick.fallback_reason, pattern);
    assert.notEqual(pick.model, "claude-opus-5-5");
  });
}

test("a Codex writer gets a Claude critic, or a different Codex family when Claude is unavailable", () => {
  assert.deepEqual(pickCritic("codex", { config, available: world().available }), { vendor: "claude", model: config.models.claude.critic, fallback: false, fallback_reason: null });
  const pick = pickCritic("codex", { config, available: world({ claude: "auth" }).available });
  assert.equal(pick.vendor, "codex");
  assert.equal(pick.fallback, true);
  assert.notEqual(pick.model, config.models.codex.writer);
  assert.equal(pick.model, config.families[config.critic_fallback[familyOf(config.models.codex.writer, config)]]);
});

test("the critic is never the writer's model", () => {
  const same = { ...config, models: { ...config.models, codex: { ...config.models.codex, critic: "claude-opus-5-5" } } };
  const pick = pickCritic({ vendor: "claude", model: "claude-opus-5-5" }, { config: same, available: world().available });
  assert.equal(pick.fallback, true, "a preferred critic with the writer's model is not used");
  assert.notEqual(pick.model, "claude-opus-5-5");
  const loop = { ...config, critic_fallback: { opus: "opus" } };
  assert.throws(() => pickCritic({ vendor: "claude", model: "claude-opus-5-5" }, { config: loop, available: world({ codex: "missing" }).available }), /writer's own model/);
  const none = { ...config, critic_fallback: {} };
  assert.throws(() => pickCritic({ vendor: "claude", model: "claude-opus-5-5" }, { config: none, available: world({ codex: "missing" }).available }), /no critic available.*codex binary missing/);
});

test("availability is cached per checker and stops at the first failing step", () => {
  const w = world({ codex: "missing" });
  w.available("codex");
  w.available("codex");
  assert.deepEqual(w.calls, ["version:codex"], "probed once");
  assert.equal(w.available("nope").ok, false);
});

test("familyOf reads config.families, by id or by name segment", () => {
  assert.equal(familyOf("claude-opus-5-5", config), "opus");
  assert.equal(familyOf("claude-sonnet-9", config), "sonnet");
  assert.equal(familyOf("gpt-6-astra", config), "astra");
  assert.equal(familyOf("mystery", config), null);
});

test("the default canary probe uses the ledger gate for this CLI version and the fixed recipe", async () => {
  const { defaultProbes } = await import("./index.mjs");
  const codex = await import("./codex.mjs");
  const row = { schema: 1, kind: "canary", at: "2026-10-10T00:00:00Z", run_id: "c9", vendor: "codex", cli_version: "0.161.0", recipe_sha256: codex.recipeHash("fixed"), mode: "fixed", pass: true };
  assert.equal(defaultProbes.canary(codex, "0.161.0", [row]).run_id, "c9");
  assert.throws(() => defaultProbes.canary(codex, "0.162.0", [row]), /no canary on record/);
  assert.throws(() => defaultProbes.canary(codex, "0.161.0", [{ ...row, recipe_sha256: SHA }]), /no canary on record/);
});
