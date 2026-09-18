// Population growth (annual %) — snapshot the World Bank Indicators API into archive/.
//
// Source:    World Bank, World Development Indicators (WDI), indicator SP.POP.GROW
//            API v2, no key: https://api.worldbank.org/v2/country/all/indicator/SP.POP.GROW?format=json&per_page=1000&page=N
//            plus country metadata (to tell countries from regional aggregates):
//            https://api.worldbank.org/v2/country?format=json&per_page=1000
//            plus indicator metadata (definition, upstream sources):
//            https://api.worldbank.org/v2/indicator/SP.POP.GROW?format=json
// License:   CC BY 4.0 (WDI, World Bank Data Catalog dataset 0037712).
//
// Run:  node fetch.ts            reuse existing snapshot if archive/manifest.json exists
//       node fetch.ts --refresh  re-download everything (overwrites archive/)
//
// This is the only script that touches the network. build.ts reads archive/ only.
// Every response body is saved byte-for-byte (no re-serialisation) and recorded in
// archive/manifest.json with its URL, retrieval time, byte size and SHA-256.
//
// Pagination: the API returns [meta, rows] where meta = {page, pages, per_page, total,
// lastupdated}. We page until page == pages, then assert (a) every page reports the same
// pages/total/lastupdated — i.e. the snapshot didn't change mid-download — and (b) the
// row count summed across pages equals total. Any mismatch throws and nothing is
// written to the manifest.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHIVE = join(HERE, "archive");
const MANIFEST = join(ARCHIVE, "manifest.json");
const API = "https://api.worldbank.org/v2";
const INDICATOR = "SP.POP.GROW";
const PER_PAGE = 1000;
const TIMEOUT_MS = 30_000;
const MAX_TRIES = 3;
const PAUSE_MS = 500; // pace requests; the API is public and unauthenticated

type Entry = { name: string; url: string; path: string; retrieved_at: string; bytes: number; sha256: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt >= MAX_TRIES) throw new Error(`${url}: ${(err as Error).message} after ${attempt} tries`);
      await sleep(PAUSE_MS * 2 ** attempt);
    }
  }
}

async function save(name: string, url: string, rel: string): Promise<{ entry: Entry; body: unknown }> {
  const buf = await get(url);
  const body = JSON.parse(buf.toString("utf8"));
  // The API reports errors as HTTP 200 with a [{message: [...]}] body.
  if (Array.isArray(body) && body.length === 1 && body[0]?.message) {
    throw new Error(`${url}: API error ${JSON.stringify(body[0].message)}`);
  }
  const path = join(ARCHIVE, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buf);
  const entry = {
    name,
    url,
    path: `archive/${rel}`,
    retrieved_at: new Date().toISOString(),
    bytes: buf.length,
    sha256: createHash("sha256").update(buf).digest("hex"),
  };
  await sleep(PAUSE_MS);
  return { entry, body };
}

type Meta = { page: number | string; pages: number | string; total: number | string; lastupdated?: string };

async function main(): Promise<void> {
  const refresh = process.argv.includes("--refresh");
  if (existsSync(MANIFEST) && !refresh) {
    console.log("archive/manifest.json exists — reusing snapshot (pass --refresh to re-download)");
    return;
  }
  const entries: Entry[] = [];

  // 1. Indicator observations, paginated.
  let pages = 1;
  let first: Meta | undefined;
  let rows = 0;
  for (let page = 1; page <= pages; page++) {
    const url = `${API}/country/all/indicator/${INDICATOR}?format=json&per_page=${PER_PAGE}&page=${page}`;
    const { entry, body } = await save(`observations-page-${page}`, url, `observations/page-${String(page).padStart(3, "0")}.json`);
    const [meta, data] = body as [Meta, unknown[] | null];
    if (!first) {
      first = meta;
      pages = Number(meta.pages);
    } else if (Number(meta.pages) !== Number(first.pages) || Number(meta.total) !== Number(first.total) || meta.lastupdated !== first.lastupdated) {
      throw new Error(`snapshot changed mid-download at page ${page}: ${JSON.stringify(meta)} vs ${JSON.stringify(first)}`);
    }
    if (Number(meta.page) !== page) throw new Error(`asked for page ${page}, got ${meta.page}`);
    rows += data?.length ?? 0;
    entries.push(entry);
  }
  if (rows !== Number(first!.total)) throw new Error(`pagination incomplete: ${rows} rows across ${pages} pages, API total ${first!.total}`);
  console.log(`observations: ${pages} pages, ${rows} rows = total ${first!.total}, lastupdated ${first!.lastupdated}`);

  // 2. Country metadata (one page at per_page=1000; asserted).
  {
    const url = `${API}/country?format=json&per_page=${PER_PAGE}`;
    const { entry, body } = await save("countries", url, "countries.json");
    const [meta, data] = body as [Meta, unknown[]];
    if (Number(meta.pages) !== 1 || data.length !== Number(meta.total)) throw new Error(`countries not in one page: ${JSON.stringify(meta)}`);
    console.log(`countries: ${data.length}`);
    entries.push(entry);
  }

  // 3. Indicator metadata.
  {
    const url = `${API}/indicator/${INDICATOR}?format=json`;
    const { entry } = await save("indicator", url, "indicator.json");
    entries.push(entry);
  }

  writeFileSync(
    MANIFEST,
    JSON.stringify({ indicator: INDICATOR, api: API, lastupdated: first!.lastupdated, total: Number(first!.total), pages, files: entries }, null, 2) + "\n",
  );
  console.log(`wrote archive/manifest.json (${entries.length} files)`);
}

await main();
