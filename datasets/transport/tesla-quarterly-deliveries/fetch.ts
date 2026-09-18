// Tesla quarterly vehicle production and deliveries — snapshot the SEC EDGAR source into archive/.
//
// Source:  SEC EDGAR, Tesla, Inc. (CIK 0001318605). The quarterly "Production, Deliveries
//          & Deployments" press release is filed as Exhibit 99.1 to a Form 8-K reporting
//          under Item 2.02 (Results of Operations and Financial Condition), a few days
//          after each quarter ends.
//            submissions index: https://data.sec.gov/submissions/CIK0001318605.json
//            filing directory:  https://www.sec.gov/Archives/edgar/data/1318605/<accession>/index.json
// License: no redistribution licence is granted for the filings themselves, and none was
//          found. What this dataset publishes is the extracted numeric facts, which US
//          copyright does not cover; the press-release prose is Tesla's and is not
//          republished. See README.md — archive/ holds the retrieved documents as
//          evidence for the build.
//
// Access:  SEC requires a declared User-Agent identifying the requester, and asks for
//          no more than 10 requests/second. This script REFUSES TO FETCH without one
//          (with a snapshot already in archive/ it reuses it and never asks):
//
//            SEC_USER_AGENT="datapressr hello@datahub.io" node fetch.ts
//
//          Tesla's own investor-relations site and the Business Wire copies return 403
//          to plain HTTP clients; EDGAR is the primary source that does not.
//
// Run:  node fetch.ts            reuse existing snapshot if archive/manifest.json exists
//       node fetch.ts --refresh  re-download (overwrites the files it fetches; it does
//                                not delete stale ones, so remove archive/ for a clean pull)
//
// Only networked script; build.ts reads archive/ only. Every response is saved
// byte-for-byte and recorded in archive/manifest.json with URL, retrieval time,
// bytes and SHA-256.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");
const EXHIBITS = join(ARCHIVE, "exhibits");
const MANIFEST = join(ARCHIVE, "manifest.json");

const CIK = "0001318605";
const CIK_SHORT = "1318605";
const SUBMISSIONS = [
  `https://data.sec.gov/submissions/CIK${CIK}.json`,
  `https://data.sec.gov/submissions/CIK${CIK}-submissions-001.json`,
];

const TIMEOUT_MS = 30_000;
const MAX_TRIES = 3;
// SEC asks for <= 10 requests/second. 250 ms between requests, issued sequentially,
// keeps us at most 4/s even if every response were instant.
const PACE_MS = 250;

// A quarterly production-and-deliveries 8-K is filed in the first days of the month
// after a quarter ends. Widened to day <= 10 so a late filing is still caught; the
// window is deliberately generous and build.ts decides what is actually a P&D release.
const PD_MONTHS = new Set([1, 4, 7, 10]);
const PD_MAX_DAY = 10;

interface Filing {
  accession: string;
  filing_date: string;
  report_date: string;
  items: string;
  primary_document: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function userAgent(): string {
  const ua = process.env.SEC_USER_AGENT;
  if (!ua || !ua.trim()) {
    throw new Error(
      "SEC_USER_AGENT is not set. The SEC requires requests to declare who is making them.\n" +
        '  Run: SEC_USER_AGENT="<project> <contact-email>" node fetch.ts\n' +
        "  See https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data",
    );
  }
  if (!ua.includes("@")) {
    throw new Error(`SEC_USER_AGENT must contain a contact email address; got ${JSON.stringify(ua)}`);
  }
  return ua.trim();
}

async function get(url: string, ua: string): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": ua, "Accept-Encoding": "gzip, deflate" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      // EDGAR answers a throttled or malformed request with an HTML error page and a
      // non-200 status; it does not hide errors behind a 200, but check the body too.
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) throw new Error("empty response body");
      return buf;
    } catch (err) {
      if (attempt >= MAX_TRIES) throw new Error(`${url}: ${(err as Error).message} after ${attempt} tries`);
      await sleep(1000 * 2 ** attempt);
    }
  }
}

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/** Flatten EDGAR's column-oriented filings object into rows. */
function toRows(cols: Record<string, string[]>): Filing[] {
  const n = cols.form.length;
  const out: Filing[] = [];
  for (let i = 0; i < n; i++) {
    if (cols.form[i] !== "8-K") continue;
    out.push({
      accession: cols.accessionNumber[i],
      filing_date: cols.filingDate[i],
      report_date: cols.reportDate[i],
      items: cols.items[i] ?? "",
      primary_document: cols.primaryDocument[i],
    });
  }
  return out;
}

/**
 * Filenames of the EX-99 exhibits a filing declares, read from EDGAR's filing index page.
 *
 * Exhibit filename conventions drift with whichever agent filed it — `d106308dex991.htm`,
 * `tsla-ex991_6.htm`, `tsla-ex99_1.htm` and `exhibit99111111.htm` all appear in this one
 * series — so guessing from the directory listing silently misses filings (it dropped the
 * eight most recent quarters on the first run). The index page's Type column declares the
 * document type outright. `<accession>-index-headers.html` carries the same information in
 * SGML, but is not served for pre-2015 filings even though the directory listing shows it.
 */
function exhibitFilenames(indexHtml: string): string[] {
  const out: string[] = [];
  for (const row of indexHtml.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
    const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(),
    );
    if (cells.length < 4) continue;
    const [, , document, type] = cells;
    if (!/^EX-99/i.test(type)) continue;
    // Newer rows append a viewer marker: "tsla-20260702.htm iXBRL".
    const name = document.split(/\s+/)[0];
    if (name) out.push(name);
  }
  return [...new Set(out)].sort();
}

function isProductionAndDeliveries(f: Filing): boolean {
  if (!f.items.split(",").includes("2.02")) return false;
  const [, m, d] = f.filing_date.split("-").map(Number);
  return PD_MONTHS.has(m) && d <= PD_MAX_DAY;
}

async function main(): Promise<void> {
  if (existsSync(MANIFEST) && !process.argv.includes("--refresh")) {
    console.log("archive/manifest.json exists — reusing snapshot (pass --refresh to re-download)");
    return;
  }
  const ua = userAgent();
  mkdirSync(EXHIBITS, { recursive: true });

  // 1. Submissions index (two files: recent, and the pre-2018 overflow).
  const files: Record<string, unknown>[] = [];
  const filings: Filing[] = [];
  for (const url of SUBMISSIONS) {
    const buf = await get(url, ua);
    const name = url.split("/").pop()!;
    writeFileSync(join(ARCHIVE, name), buf);
    files.push({
      source_id: `submissions:${name}`,
      url,
      path: `archive/${name}`,
      retrieved_at: new Date().toISOString(),
      bytes: buf.length,
      sha256: sha256(buf),
    });
    const json = JSON.parse(buf.toString("utf8"));
    const cols = json.filings?.recent ?? json;
    if (!cols.form) throw new Error(`${url}: no 'form' column — EDGAR response shape changed`);
    filings.push(...toRows(cols));
    console.log(`${name}: ${buf.length} bytes`);
    await sleep(PACE_MS);
  }

  const candidates = filings.filter(isProductionAndDeliveries);
  candidates.sort((a, b) => a.filing_date.localeCompare(b.filing_date) || a.accession.localeCompare(b.accession));
  if (candidates.length === 0) throw new Error("no candidate 8-K filings found — the selection rule is broken");
  console.log(`${filings.length} 8-K filings, ${candidates.length} in the production-and-deliveries window`);

  // 2. For each candidate, read its filing index and pull every EX-99 exhibit.
  for (const f of candidates) {
    const bare = f.accession.replace(/-/g, "");
    const dirUrl = `https://www.sec.gov/Archives/edgar/data/${CIK_SHORT}/${bare}/${f.accession}-index.html`;
    const dirBuf = await get(dirUrl, ua);
    writeFileSync(join(ARCHIVE, "exhibits", `${f.accession}-index.html`), dirBuf);
    files.push({
      source_id: `index:${f.accession}`,
      url: dirUrl,
      path: `archive/exhibits/${f.accession}-index.html`,
      retrieved_at: new Date().toISOString(),
      bytes: dirBuf.length,
      sha256: sha256(dirBuf),
      filing_date: f.filing_date,
      report_date: f.report_date,
      items: f.items,
    });
    await sleep(PACE_MS);

    const exhibits = exhibitFilenames(dirBuf.toString("utf8"));
    if (exhibits.length === 0) {
      console.log(`  ${f.filing_date} ${f.accession}: no EX-99 exhibit declared — recorded, not fetched`);
      continue;
    }
    for (const name of exhibits) {
      const url = `https://www.sec.gov/Archives/edgar/data/${CIK_SHORT}/${bare}/${name}`;
      const buf = await get(url, ua);
      const local = `${f.accession}-${name}`;
      writeFileSync(join(ARCHIVE, "exhibits", local), buf);
      files.push({
        source_id: `exhibit:${f.accession}:${name}`,
        url,
        path: `archive/exhibits/${local}`,
        retrieved_at: new Date().toISOString(),
        bytes: buf.length,
        sha256: sha256(buf),
        accession: f.accession,
        filing_date: f.filing_date,
        report_date: f.report_date,
        items: f.items,
      });
      console.log(`  ${f.filing_date} ${f.accession} ${name}: ${buf.length} bytes`);
      await sleep(PACE_MS);
    }
  }

  writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        source: "SEC EDGAR — Tesla, Inc. (CIK 0001318605) Form 8-K, Item 2.02, Exhibit 99.1",
        selection: `form 8-K, items include 2.02, filed in month ${[...PD_MONTHS].join("/")} on day <= ${PD_MAX_DAY}`,
        user_agent: userAgent(),
        candidate_filings: candidates.length,
        files,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`wrote archive/manifest.json (${files.length} files)`);
}

await main();
