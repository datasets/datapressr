// Vendor choice for the critic (design section 4.4). The critic comes from the other vendor
// (config.json `critic_preference`: Codex for a Claude writer and vice versa) when that vendor
// is available: its binary is present, its auth works and a canary passed for its current CLI
// version and recipe. Otherwise it falls back to the writer's vendor with a different model
// family (`critic_fallback`, e.g. Opus writer -> Sonnet critic) and says why. The critic is never
// the writer's model.

import { execFileSync } from "node:child_process";
import { requireCanary } from "../canary.mjs";
import { readLedger } from "../ledger.mjs";
import * as claude from "./claude.mjs";
import * as codex from "./codex.mjs";

export const VENDOR_ADAPTERS = { claude, codex };

function claudeAuth({ bin = "claude" } = {}) {
  try {
    const text = execFileSync(bin, ["auth", "status"], { encoding: "utf8", env: claude.childEnv(), stdio: ["ignore", "pipe", "pipe"] });
    const status = JSON.parse(text);
    return status.loggedIn ? { ok: true, reason: status.authMethod ?? "logged in" } : { ok: false, reason: "claude auth status: not logged in" };
  } catch (e) {
    return { ok: false, reason: `claude auth status failed: ${String(e.stderr || e.message).trim().slice(0, 200)}` };
  }
}

// The real probes; tests replace them. Each takes the vendor adapter.
export const defaultProbes = {
  cliVersion: (adapter) => adapter.cliVersion(),
  auth: (adapter) => (adapter.vendor === "codex" ? codex.authOk() : claudeAuth()),
  canary: (adapter, cliVersion, ledgerRows) => requireCanary(ledgerRows, { vendor: adapter.vendor, cli_version: cliVersion, recipe_sha256: adapter.recipeHash("fixed"), mode: "fixed" }),
};

// available(vendor) -> { ok, reason, cli_version, canary_run_id }, cached per checker (one
// checker per harness invocation). Stops at the first failing step: binary, auth, canary.
export function availabilityChecker({ ledgerFile, ledgerRows, probes = defaultProbes, adapters = VENDOR_ADAPTERS } = {}) {
  const cache = new Map();
  const rows = () => (ledgerRows ??= ledgerFile ? readLedger(ledgerFile) : []);
  return function available(vendor) {
    if (cache.has(vendor)) return cache.get(vendor);
    const adapter = adapters[vendor];
    let res;
    if (!adapter) res = { ok: false, reason: `unknown vendor ${vendor}`, cli_version: null, canary_run_id: null };
    else {
      let version = null;
      try {
        version = probes.cliVersion(adapter);
      } catch (e) {
        res = { ok: false, reason: `${vendor} binary missing or not runnable: ${String(e.message).split("\n")[0]}`, cli_version: null, canary_run_id: null };
      }
      if (!res) {
        const auth = probes.auth(adapter);
        if (!auth.ok) res = { ok: false, reason: `${vendor} auth failing: ${auth.reason}`, cli_version: version, canary_run_id: null };
      }
      if (!res) {
        try {
          const row = probes.canary(adapter, version, rows());
          res = { ok: true, reason: null, cli_version: version, canary_run_id: row.run_id };
        } catch (e) {
          res = { ok: false, reason: `${vendor} canary not passed: ${e.message}`, cli_version: version, canary_run_id: null };
        }
      }
    }
    cache.set(vendor, res);
    return res;
  };
}

// The family of a model id, from config.families (exact id) or a "-<family>-" segment.
export function familyOf(model, config) {
  for (const [fam, id] of Object.entries(config.families ?? {})) if (id === model) return fam;
  for (const fam of Object.keys(config.families ?? {})) if (new RegExp(`(^|-)${fam}(-|$)`).test(model)) return fam;
  return null;
}

// writer: a vendor name (its config writer model is assumed) or { vendor, model }.
// Returns { vendor, model, fallback, fallback_reason }.
export function pickCritic(writer, { config, available }) {
  const w = typeof writer === "string" ? { vendor: writer, model: config.models[writer]?.writer } : writer;
  if (!w?.vendor || !w.model) throw new Error(`pickCritic needs a writer vendor and model, got ${JSON.stringify(writer)}`);
  const preferred = config.critic_preference?.[w.vendor];
  if (preferred && preferred !== w.vendor) {
    const a = available(preferred);
    if (a.ok) {
      const model = config.models[preferred].critic;
      if (model !== w.model) return { vendor: preferred, model, fallback: false, fallback_reason: null };
    }
    const reason = a.ok ? `${preferred} critic model equals the writer's` : a.reason;
    return fallbackCritic(w, config, reason);
  }
  return fallbackCritic(w, config, preferred ? `critic preference for ${w.vendor} is ${w.vendor}` : `no critic preference for ${w.vendor}`);
}

function fallbackCritic(w, config, reason) {
  const fam = familyOf(w.model, config);
  const fbFam = fam ? config.critic_fallback?.[fam] : null;
  const model = fbFam ? config.families[fbFam] : null;
  if (!model) throw new Error(`no critic available for writer ${w.vendor}/${w.model}: ${reason}; and config.json has no critic_fallback for its family (${fam ?? "unknown"})`);
  if (model === w.model) throw new Error(`critic fallback for ${w.model} is the writer's own model; fix critic_fallback in config.json`);
  return { vendor: w.vendor, model, fallback: true, fallback_reason: reason };
}
