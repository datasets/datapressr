// Rebuild cps-software-by-age.csv from the US Current Population Survey (CPS)
// basic monthly public-use microdata, January 2020 to the latest month.
//   node fetch-cps.mjs [YYYY-MM]   (downloads ~80 files of ~10 MB each, ~1 GB in total)
//   CPS_CACHE=/some/dir node fetch-cps.mjs   keeps the raw files there and reuses them on re-runs
// The Census server sometimes answers a burst of requests with a small HTML "Request Rejected"
// page and status 200; anything that is not gzip is retried after a pause.
//
// For every person record whose primary-job occupation (PTIO1OCD; PEIO1OCD in 2020) is one of
// the three software occupations in the 2018 Census occupation codes, it adds the composited
// final weight (PWCMPWGT, 4 implied decimals) to a cell: month x occupation x age band x labour
// force status. Employed = PEMLR 1-2; unemployed = PEMLR 3-4 (occupation of last job). The raw
// files are streamed and discarded; their SHA-256 hashes go into cps-manifest.json.
//
// Field positions (1-based, inclusive) are the same in every 2020-2026 record layout:
//   HRMONTH 16-17, HRYEAR4 18-21, PRTAGE 122-123, PEMLR 180-181, PWCMPWGT 846-855,
//   occupation code 860-863.
// Plain Node: fetch, zlib, crypto, fs. No dependencies.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { gunzipSync } from "node:zlib";

const BASE = "https://www2.census.gov/programs-surveys/cps/datasets";
const MON = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const OCC = { "1010": "computer_programmers", "1021": "software_developers", "1022": "software_qa_testers" };
const BANDS = [[16, 21], [22, 25], [26, 29], [30, 34], [35, 44], [45, 54], [55, 99]];
const band = (age) => {
  const b = BANDS.find(([lo, hi]) => age >= lo && age <= hi);
  return b ? (b[1] === 99 ? `${b[0]}+` : `${b[0]}-${b[1]}`) : null;
};
const LAST = process.argv[2] ?? "2026-09"; // latest month to request
const field = (line, from, to) => line.slice(from - 1, to);
const CACHE = process.env.CPS_CACHE;
if (CACHE) mkdirSync(CACHE, { recursive: true });

// Fetch one raw file (from the cache if present). `ok` checks the bytes are the real file: the
// Census server sometimes answers with a small HTML "Request Rejected" page and status 200.
// Returns null on 404 (no file for that month) and undefined when every attempt was rejected.
async function download(url, name, ok, attempts) {
  const cached = CACHE && join(CACHE, name);
  if (cached && existsSync(cached)) return readFileSync(cached);
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const res = await fetch(url, { headers: { "user-agent": "datapressr-story-build" }, signal: AbortSignal.timeout(300000) });
    if (res.status === 404) return null;
    const buf = res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    if (buf && ok(buf)) {
      if (cached) writeFileSync(cached, buf);
      return buf;
    }
    console.log(`${name}: rejected (status ${res.status}), attempt ${attempt}`);
    if (attempt < attempts) await sleep(20000 * attempt);
  }
  return undefined;
}

const isGzip = (b) => b[0] === 0x1f && b[1] === 0x8b;
const isCsv = (b) => /^hrhhid/i.test(b.subarray(0, 10).toString("latin1"));

// Person records as { y, m, age, pemlr, occ, weight } from the fixed-width file...
function* fromDat(text) {
  for (const line of text.split("\n")) {
    if (line.length < 863) continue;
    yield { y: +field(line, 18, 21), m: +field(line, 16, 17), age: +field(line, 122, 123), pemlr: +field(line, 180, 181), occ: field(line, 860, 863), weight: field(line, 846, 855) };
  }
}
// ...or from the CSV version of the same file (same values, named columns; weights also carry 4
// implied decimals). Used only when the fixed-width file is refused (October 2021).
function* fromCsv(text) {
  const lines = text.split(/\r?\n/);
  const head = lines[0].split(",").map((h) => h.toUpperCase());
  const ix = (n) => {
    const i = head.indexOf(n);
    if (i < 0) throw new Error(`CSV has no ${n}`);
    return i;
  };
  const [iy, im, ia, ip, io, iw] = ["HRYEAR4", "HRMONTH", "PRTAGE", "PEMLR", "PTIO1OCD", "PWCMPWGT"].map(ix);
  for (const l of lines.slice(1)) {
    if (!l) continue;
    const r = l.split(",");
    yield { y: +r[iy], m: +r[im], age: +r[ia], pemlr: +r[ip], occ: r[io].padStart(4, "0"), weight: r[iw] };
  }
}

const cells = new Map();
const manifest = [];
const [ly, lm] = LAST.split("-").map(Number);
for (let y = 2020; y <= ly; y++) {
  for (let m = 1; m <= 12; m++) {
    if (y === ly && m > lm) break;
    const month = `${y}-${String(m).padStart(2, "0")}`;
    const stem = `${MON[m - 1]}${String(y).slice(2)}pub`;
    let url = `${BASE}/${y}/basic/${stem}.dat.gz`;
    let raw = await download(url, `${stem}.dat.gz`, isGzip, 3);
    let people;
    if (raw) people = fromDat(gunzipSync(raw).toString("latin1"));
    else {
      url = `${BASE}/${y}/basic/${stem}.csv`;
      raw = await download(url, `${stem}.csv`, isCsv, 3);
      if (raw === undefined) throw new Error(`refused: ${url}`);
      if (raw) people = fromCsv(raw.toString("latin1"));
    }
    if (!raw) {
      // October 2025 was not collected (federal government shutdown); Census published no file.
      manifest.push({ month, url, status: "no file" });
      console.log(stem, "no file");
      continue;
    }
    let records = 0;
    let kept = 0;
    for (const p of people) {
      records++;
      const occ = OCC[p.occ];
      if (!occ) continue;
      const status = p.pemlr === 1 || p.pemlr === 2 ? "employed" : p.pemlr === 3 || p.pemlr === 4 ? "unemployed" : null;
      if (!status) continue;
      const b = band(p.age);
      if (!b) continue;
      if (p.y !== y || p.m !== m) throw new Error(`${stem}: record dated ${p.y}-${p.m}`);
      const w = Number(p.weight) / 10000;
      if (!Number.isFinite(w) || w < 0) throw new Error(`${stem}: bad weight ${p.weight}`);
      const key = [`${month}-01`, occ, b, status].join(",");
      const c = cells.get(key) ?? { records: 0, weight: 0 };
      c.records++;
      c.weight += w;
      cells.set(key, c);
      kept++;
    }
    manifest.push({ month, url, bytes: raw.length, sha256: createHash("sha256").update(raw).digest("hex"), person_records: records, software_records: kept });
    console.log(stem, records, kept);
  }
}

const rows = [...cells.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const out = ["month,occupation,age_band,status,records,persons"];
for (const [k, c] of rows) out.push(`${k},${c.records},${Math.round(c.weight)}`);
writeFileSync(new URL("cps-software-by-age.csv", import.meta.url), out.join("\n") + "\n");
writeFileSync(new URL("cps-manifest.json", import.meta.url), JSON.stringify({ retrieved: new Date().toISOString().slice(0, 10), files: manifest }, null, 2) + "\n");
console.log(`wrote ${rows.length} cells`);
