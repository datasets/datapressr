// Airports with country, region and runway summary — snapshot OurAirports into archive/.
//
// Source:  OurAirports open data, https://ourairports.com/data/
//          CSVs mirrored at https://davidmegginson.github.io/ourairports-data/<table>.csv
//          (the download links on ourairports.com/data point here). Data dictionary:
//          https://ourairports.com/help/data-dictionary.html
// License: "All data is released to the Public Domain" (ourairports.com/data).
//
// Run:  node fetch.ts            reuse existing snapshot if archive/manifest.json exists
//       node fetch.ts --refresh  re-download (overwrites archive/)
//
// Only networked script; build.ts reads archive/ only. Files are saved byte-for-byte
// and recorded in archive/manifest.json with URL, Last-Modified, retrieval time,
// bytes and SHA-256.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");
const MANIFEST = join(ARCHIVE, "manifest.json");
const BASE = "https://davidmegginson.github.io/ourairports-data";
const TABLES = ["airports", "countries", "regions", "runways"];
const TIMEOUT_MS = 60_000;
const MAX_TRIES = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string): Promise<{ buf: Buffer; lastModified: string | null }> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { buf: Buffer.from(await res.arrayBuffer()), lastModified: res.headers.get("last-modified") };
    } catch (err) {
      if (attempt >= MAX_TRIES) throw new Error(`${url}: ${(err as Error).message} after ${attempt} tries`);
      await sleep(1000 * 2 ** attempt);
    }
  }
}

async function main(): Promise<void> {
  if (existsSync(MANIFEST) && !process.argv.includes("--refresh")) {
    console.log("archive/manifest.json exists — reusing snapshot (pass --refresh to re-download)");
    return;
  }
  mkdirSync(ARCHIVE, { recursive: true });
  const files = [];
  for (const t of TABLES) {
    const url = `${BASE}/${t}.csv`;
    const { buf, lastModified } = await get(url);
    writeFileSync(join(ARCHIVE, `${t}.csv`), buf);
    files.push({ name: t, url, path: `archive/${t}.csv`, last_modified: lastModified, retrieved_at: new Date().toISOString(), bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") });
    console.log(`${t}.csv: ${buf.length} bytes`);
    await sleep(500);
  }
  writeFileSync(MANIFEST, JSON.stringify({ source: "https://ourairports.com/data/", files }, null, 2) + "\n");
  console.log(`wrote archive/manifest.json (${files.length} files)`);
}

await main();
