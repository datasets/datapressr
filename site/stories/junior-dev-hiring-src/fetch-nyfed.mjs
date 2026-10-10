// Snapshot two CSVs behind the Federal Reserve Bank of New York's "The Labor Market for Recent
// College Graduates" (https://nyfed.org/collegelabor), plus its chart metadata (release date,
// definitions). Used under the New York Fed's Terms of Use (copy and distribute with attribution).
//   node fetch-nyfed.mjs
// Files are saved unchanged; their URLs and SHA-256 hashes go into nyfed-manifest.json.

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";

const BASE = "https://www.newyorkfed.org/medialibrary/research/interactives/data/college-labor-market";
const FILES = ["college-labor-outcomes-by-major-data.csv", "college-labor-unemployment-data.csv", "college-labor-chart-meta.json"];
const manifest = [];
for (const f of FILES) {
  const url = `${BASE}/${f}`;
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (datapressr story build)" }, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(new URL(`nyfed-${f}`, import.meta.url), buf);
  manifest.push({ file: `nyfed-${f}`, url, bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") });
  console.log(f, buf.length);
}
writeFileSync(new URL("nyfed-manifest.json", import.meta.url), JSON.stringify({ retrieved: new Date().toISOString().slice(0, 10), files: manifest }, null, 2) + "\n");
