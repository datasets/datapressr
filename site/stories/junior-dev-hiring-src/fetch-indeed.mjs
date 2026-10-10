// Snapshot the Indeed Hiring Lab job postings index (CC BY 4.0) for the junior-dev-hiring story:
// "Software Development" and all postings, total postings, seasonally adjusted, for six countries.
//   node fetch-indeed.mjs
// Writes indeed-software-vs-all.csv (one row per country x series x week: every seventh day from the
// 1 February 2020 baseline, a Saturday, plus each series' latest day) and indeed-manifest.json
// (source URLs and SHA-256 of each file as downloaded). Plain Node, no dependencies.

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";

const REPO = "https://raw.githubusercontent.com/hiring-lab/job_postings_tracker/master";
const COUNTRIES = ["US", "GB", "CA", "DE", "FR", "AU"];
const manifest = [];
const out = ["date,country,series,index_feb2020_100"];
const BASE_MS = Date.UTC(2020, 1, 1);
const weekly = (d) => Math.round((Date.parse(`${d}T00:00:00Z`) - BASE_MS) / 86400000) % 7 === 0;
// Keep the weekly readings and the latest one; the source is a 7-day trailing average, so a
// weekly sample loses no week.
function thin(rows) {
  const last = rows.at(-1);
  return rows.filter((r) => weekly(r[0]) || r === last);
}

async function get(path) {
  const url = `${REPO}/${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  manifest.push({ url, bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") });
  return buf.toString("utf8").trim().split("\n").map((l) => l.split(","));
}

for (const cc of COUNTRIES) {
  // aggregate: date,jobcountry,indeed_job_postings_index_SA,indeed_job_postings_index_NSA,variable
  const [ah, ...agg] = await get(`${cc}/aggregate_job_postings_${cc}.csv`);
  if (ah.join(",") !== "date,jobcountry,indeed_job_postings_index_SA,indeed_job_postings_index_NSA,variable") throw new Error(`header ${cc}`);
  for (const r of thin(agg.filter((r) => r[4] === "total postings" && r[2] !== ""))) out.push(`${r[0]},${cc},all_postings,${r[2]}`);
  // sector: date,jobcountry,indeed_job_postings_index,variable,display_name (already SA)
  const [sh, ...sec] = await get(`${cc}/job_postings_by_sector_${cc}.csv`);
  if (sh.join(",") !== "date,jobcountry,indeed_job_postings_index,variable,display_name") throw new Error(`header ${cc} sector`);
  for (const r of thin(sec.filter((r) => r[3] === "total postings" && r[4] === "Software Development" && r[2] !== ""))) out.push(`${r[0]},${cc},software_development,${r[2]}`);
}

writeFileSync(new URL("indeed-software-vs-all.csv", import.meta.url), out.join("\n") + "\n");
writeFileSync(new URL("indeed-manifest.json", import.meta.url), JSON.stringify({ retrieved: new Date().toISOString().slice(0, 10), files: manifest }, null, 2) + "\n");
console.log(`wrote ${out.length - 1} rows`);
