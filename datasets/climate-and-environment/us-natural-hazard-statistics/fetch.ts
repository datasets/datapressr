// U.S. natural hazard statistics — snapshot the NWS source into archive/.
//
// Source:  National Weather Service, "Weather Related Fatality and Injury Statistics"
//          https://www.weather.gov/hazstat/
//          Each year's national summary is a separate PDF at
//          https://www.weather.gov/media/hazstat/sum<yy>.pdf
//
// License: "The information on National Weather Service (NWS) Web pages are in the public
//          domain, unless specifically noted otherwise, and may be used without charge for
//          any lawful purpose" — https://www.weather.gov/disclaimer, archived here as
//          archive/disclaimer.html. The conditions attached (do not claim it as your own,
//          do not imply NWS endorsement, do not modify it and present it as official
//          government material) are met by attributing the source and publishing the
//          extraction as a derived compilation. See README.md.
//
// There is NO machine-readable index for this source. weather.gov serves no robots.txt and
// no sitemap.xml (both 404), there is no API, no feed and no bulk download. The only listing
// of the annual summaries anywhere is the <select> menu on the hub page, which is hand-
// maintained HTML — and it is wrong: it offers 1995, which 404s. So this script archives the
// hub page, reads the menu as the *candidate* list, and records the HTTP outcome of every
// candidate, including the ones that do not exist. The candidate list and the retrieved set
// are deliberately kept apart; build.ts publishes both.
//
// Access:  no stated rate limit and no robots.txt, so this script uses a conservative
//          1.5s pause between sequential requests — well under 1 request/second — and
//          declares an honest User-Agent naming the project and a contact address:
//
//            NWS_USER_AGENT="datapressr hello@datahub.io" node fetch.ts
//
// Run:  node fetch.ts            reuse existing snapshot if archive/manifest.json exists
//       node fetch.ts --refresh  re-download (overwrites what it fetches; it does not
//                                delete stale files, so remove archive/ for a clean pull)
//
// Only networked script; build.ts reads archive/ only. Every response is saved byte-for-byte
// and recorded in archive/manifest.json with URL, retrieval time, bytes and SHA-256.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");
const SUMMARIES = join(ARCHIVE, "summaries");
const MANIFEST = join(ARCHIVE, "manifest.json");

const ORIGIN = "https://www.weather.gov";
const HUB_URL = `${ORIGIN}/hazstat/`;
const DISCLAIMER_URL = `${ORIGIN}/disclaimer`;
// Probed and recorded because "this source has no machine-readable index" is a claim the
// dataset makes in its README, and a claim with no evidence in archive/ is the one thing
// nobody can check. Both are expected to 404; whatever they answer is written to the manifest.
const INDEX_PROBES = [`${ORIGIN}/robots.txt`, `${ORIGIN}/sitemap.xml`];

const TIMEOUT_MS = 30_000;
const MAX_TRIES = 3;
// No documented ceiling and no robots.txt, so pick a pace that cannot be a burden:
// 1.5s between sequential requests is under 0.7 requests/second.
const PACE_MS = 1_500;

export interface Candidate {
  /** Four-digit year the summary reports on. */
  year: number;
  /** Two-digit suffix as the source's own filename spells it. */
  yy: string;
  url: string;
}

interface ManifestFile {
  source_id: string;
  url: string;
  path: string | null;
  retrieved_at: string;
  http_status: number;
  bytes: number | null;
  sha256: string | null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function userAgent(): string {
  const ua = process.env.NWS_USER_AGENT;
  if (!ua || !ua.trim()) {
    throw new Error(
      "NWS_USER_AGENT is not set. Identify yourself honestly when fetching someone else's site.\n" +
        '  Run: NWS_USER_AGENT="<project> <contact-email>" node fetch.ts',
    );
  }
  if (!ua.includes("@")) {
    throw new Error(`NWS_USER_AGENT must contain a contact email address; got ${JSON.stringify(ua)}`);
  }
  return ua.trim();
}

/** A fetch that reports the status rather than throwing on it — a 404 is a finding here. */
async function get(url: string, ua: string): Promise<{ status: number; body: Buffer }> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": ua, "Accept-Encoding": "gzip, deflate" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const body = Buffer.from(await res.arrayBuffer());
      // Only transport-level trouble is worth retrying; an HTTP status is an answer.
      return { status: res.status, body };
    } catch (err) {
      if (attempt >= MAX_TRIES) throw new Error(`${url}: ${(err as Error).message} after ${attempt} tries`);
      await sleep(1000 * 2 ** attempt);
    }
  }
}

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/**
 * The candidate years, read from the hub page's "U.S. Summaries" <select>.
 *
 * This is the only listing of these documents that exists. It is a Dreamweaver-era
 * MM_jumpMenu whose <option> values are relative paths like "/media/hazstat/sum25.pdf".
 * Taking the year from the option's *label* and the path from its *value* means a
 * mismatch between the two is visible rather than assumed, and the two-digit filename
 * suffix is never reconstructed by arithmetic on the label.
 */
export function parseCandidates(hubHtml: string): Candidate[] {
  // Isolate the U.S. Summaries menu: the page carries one <select> per hazard, all with
  // the same option shape, and the national totals are only in the first.
  const menus = hubHtml.match(/<select[\s\S]*?<\/select>/gi) ?? [];
  const menu = menus.find((m) => /U\.S\.\s*Summaries/i.test(m));
  if (!menu) throw new Error("no 'U.S. Summaries' <select> on the hub page — the page layout changed");

  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (const m of menu.matchAll(/<option[^>]*value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/gi)) {
    const value = m[1].trim();
    const label = m[2].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!/^\d{4}$/.test(label)) continue; // "U.S. Summaries" and the "____" separator
    const path = value.match(/\/media\/hazstat\/sum(\d{2})\.pdf$/i);
    if (!path) throw new Error(`option ${JSON.stringify(label)} has an unexpected target ${JSON.stringify(value)}`);
    const year = Number(label);
    const yy = path[1];
    // The menu's own two spellings of the year must agree, or the mapping is a guess.
    const fromSuffix = Number(yy) >= 90 ? 1900 + Number(yy) : 2000 + Number(yy);
    if (fromSuffix !== year) {
      throw new Error(`option label ${year} does not match its file sum${yy}.pdf`);
    }
    if (seen.has(yy)) continue;
    seen.add(yy);
    out.push({ year, yy, url: `${ORIGIN}${value}` });
  }
  if (out.length === 0) throw new Error("the U.S. Summaries menu listed no years");
  out.sort((a, b) => a.year - b.year);
  return out;
}

async function main(): Promise<void> {
  if (existsSync(MANIFEST) && !process.argv.includes("--refresh")) {
    console.log("archive/manifest.json exists — reusing snapshot (pass --refresh to re-download)");
    return;
  }
  const ua = userAgent();
  mkdirSync(SUMMARIES, { recursive: true });

  const files: ManifestFile[] = [];
  const record = (source_id: string, url: string, path: string | null, status: number, body: Buffer | null) => {
    files.push({
      source_id,
      url,
      path,
      retrieved_at: new Date().toISOString(),
      http_status: status,
      bytes: body ? body.length : null,
      sha256: body ? sha256(body) : null,
    });
  };

  // 1. The hub page — the only listing of the documents, and part of the evidence.
  const hub = await get(HUB_URL, ua);
  if (hub.status !== 200) throw new Error(`hub page ${HUB_URL}: HTTP ${hub.status}`);
  writeFileSync(join(ARCHIVE, "hazstat.html"), hub.body);
  record("hub", HUB_URL, "archive/hazstat.html", hub.status, hub.body);
  await sleep(PACE_MS);

  // 2. The access terms, quoted in README.md — archived so the licence claim has evidence.
  const terms = await get(DISCLAIMER_URL, ua);
  if (terms.status !== 200) throw new Error(`disclaimer ${DISCLAIMER_URL}: HTTP ${terms.status}`);
  writeFileSync(join(ARCHIVE, "disclaimer.html"), terms.body);
  record("terms", DISCLAIMER_URL, "archive/disclaimer.html", terms.status, terms.body);
  await sleep(PACE_MS);

  // 3. The absence of an index, recorded rather than asserted. A 200 here would mean the
  // source grew one and the README's central claim needs revisiting, so it is not an error
  // either way — it is a fact about the snapshot.
  for (const url of INDEX_PROBES) {
    const name = url.split("/").pop()!;
    const { status, body } = await get(url, ua);
    if (status === 200) {
      writeFileSync(join(ARCHIVE, name), body);
      record(`index-probe:${name}`, url, `archive/${name}`, status, body);
      console.log(`  ${name}: HTTP 200 — this source now has an index; see README.md`);
    } else {
      record(`index-probe:${name}`, url, null, status, null);
      console.log(`  ${name}: HTTP ${status} — no index served`);
    }
    await sleep(PACE_MS);
  }

  // 4. Every candidate the menu names, whether or not it turns out to exist.
  const candidates = parseCandidates(hub.body.toString("utf8"));
  console.log(`hub menu lists ${candidates.length} annual summaries (${candidates[0].year}–${candidates.at(-1)!.year})`);
  let ok = 0;
  for (const c of candidates) {
    const { status, body } = await get(c.url, ua);
    if (status === 200) {
      // A PDF that is not a PDF is a redirect to an error page dressed as success.
      if (!body.subarray(0, 5).toString("latin1").startsWith("%PDF-")) {
        throw new Error(`${c.url}: HTTP 200 but the body is not a PDF`);
      }
      const name = `sum${c.yy}.pdf`;
      writeFileSync(join(SUMMARIES, name), body);
      record(String(c.year), c.url, `archive/summaries/${name}`, status, body);
      ok++;
    } else {
      record(String(c.year), c.url, null, status, null);
      console.log(`  ${c.year}: HTTP ${status} — listed by the menu, not served`);
    }
    await sleep(PACE_MS);
  }
  if (ok === 0) throw new Error("no annual summary was retrieved — the selection rule is broken");

  writeFileSync(
    MANIFEST,
    `${JSON.stringify(
      {
        source: 'National Weather Service, "Weather Related Fatality and Injury Statistics" (hazstat)',
        hub: HUB_URL,
        selection:
          'every year offered by the "U.S. Summaries" <select> on the hub page; there is no ' +
          "machine-readable index (no API, feed, sitemap or bulk download) for this source",
        user_agent: ua,
        candidate_years: candidates.length,
        retrieved_years: ok,
        files,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`archive/: ${ok} of ${candidates.length} candidates retrieved`);
}

// Only fetch when run directly; build.test.mjs imports parseCandidates above.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
