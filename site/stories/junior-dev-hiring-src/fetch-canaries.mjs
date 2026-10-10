// Snapshot the Stanford Digital Economy Lab's "Canaries" software-developer employment index by
// age (ADP payroll data; Brynjolfsson, Chandar and Chen), from the public download on its AI
// Economic Indicators dashboard (https://digitaleconomy.stanford.edu/project/indicators/canaries-dashboard/).
//   node fetch-canaries.mjs
// Extracts one member of the ZIP unchanged: the monthly index (November 2022 = 100; definitions are
// in the ZIP's data dictionary, summarised in PROVENANCE.md). The ZIP's URL and SHA-256 go into canaries-manifest.json. Plain Node: the ZIP is
// read with zlib (stored or deflated members only).

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const URL_ZIP = "https://storage.googleapis.com/aviary-del-public/release_memos/latest/downloads/canaries_software_developers_results.zip";
const WANT = ["canaries_software_developers.csv"];

const res = await fetch(URL_ZIP, { signal: AbortSignal.timeout(60000) });
if (!res.ok) throw new Error(`${res.status} ${URL_ZIP}`);
const zip = Buffer.from(await res.arrayBuffer());

// Walk the central directory (end-of-central-directory record is in the last 64 KB).
const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
if (eocd < 0) throw new Error("not a zip");
let p = zip.readUInt32LE(eocd + 16);
const entries = zip.readUInt16LE(eocd + 10);
const files = [];
for (let i = 0; i < entries; i++) {
  if (zip.readUInt32LE(p) !== 0x02014b50) throw new Error("bad central directory");
  const method = zip.readUInt16LE(p + 10);
  const csize = zip.readUInt32LE(p + 20);
  const nlen = zip.readUInt16LE(p + 28);
  const xlen = zip.readUInt16LE(p + 30);
  const clen = zip.readUInt16LE(p + 32);
  const local = zip.readUInt32LE(p + 42);
  const name = zip.toString("utf8", p + 46, p + 46 + nlen);
  p += 46 + nlen + xlen + clen;
  if (!WANT.includes(name)) continue;
  const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
  const data = zip.subarray(start, start + csize);
  const out = method === 0 ? data : method === 8 ? inflateRawSync(data) : null;
  if (!out) throw new Error(`unsupported compression in ${name}`);
  writeFileSync(new URL(name, import.meta.url), out);
  files.push({ file: name, bytes: out.length, sha256: createHash("sha256").update(out).digest("hex") });
  console.log(name, out.length);
}
if (files.length !== WANT.length) throw new Error("missing members");
writeFileSync(
  new URL("canaries-manifest.json", import.meta.url),
  JSON.stringify({ retrieved: new Date().toISOString().slice(0, 10), url: URL_ZIP, zip_bytes: zip.length, zip_sha256: createHash("sha256").update(zip).digest("hex"), files }, null, 2) + "\n",
);
