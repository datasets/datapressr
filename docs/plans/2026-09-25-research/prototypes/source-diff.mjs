// Scratch prototype: diff two archive manifests. Exit 0 unchanged, 1 changed, 2 error.
import { readFileSync } from "node:fs";
export function entries(manifest) {
  if (!Array.isArray(manifest?.files)) throw new Error("manifest has no files[] array");
  const out = new Map();
  for (const f of manifest.files) {
    const key = f.source_id ?? f.name ?? f.path ?? f.url;
    if (!key) throw new Error(`entry with no source_id/name/path/url: ${JSON.stringify(f)}`);
    if (out.has(key)) throw new Error(`duplicate key ${key}`);
    out.set(key, { url: f.url, path: f.path ?? null, sha256: f.sha256 ?? null, bytes: f.bytes ?? null, status: f.http_status ?? (f.sha256 ? 200 : null) });
  }
  return out;
}
export function diffManifests(a, b) {
  const A = entries(a), B = entries(b);
  const r = { added: [], removed: [], changed: [], unchanged: 0 };
  for (const [k, v] of B) {
    const o = A.get(k);
    if (!o) r.added.push({ key: k, ...v });
    else if (o.sha256 !== v.sha256 || o.status !== v.status) r.changed.push({ key: k, url: v.url, old: o, new: v, bytes_delta: (v.bytes ?? 0) - (o.bytes ?? 0) });
    else r.unchanged++;
  }
  for (const [k, v] of A) if (!B.has(k)) r.removed.push({ key: k, ...v });
  return r;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const [a, b] = process.argv.slice(2).map((p) => JSON.parse(readFileSync(p, "utf8")));
    const r = diffManifests(a, b);
    console.log(JSON.stringify({ added: r.added.length, removed: r.removed.length, changed: r.changed.map((c) => `${c.key} (${c.bytes_delta >= 0 ? "+" : ""}${c.bytes_delta} bytes)`), unchanged: r.unchanged }));
    process.exit(r.added.length + r.removed.length + r.changed.length ? 1 : 0);
  } catch (e) { console.error(e.message); process.exit(2); }
}
