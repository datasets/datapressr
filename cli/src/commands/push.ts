import { readFile, stat } from "node:fs/promises";
import { join, relative, resolve, basename } from "node:path";
import { ApiClient, ApiError } from "../lib/api.js";
import { walkDir, mimeType } from "../lib/files.js";
import type { Config } from "../config.js";

export interface PushOptions {
  name?: string;
  title?: string;
  description?: string;
}

export async function pushCommand(dir: string, opts: PushOptions, config: Config) {
  const absDir = resolve(dir);

  // Read datapackage.json for metadata if present
  let dpContent: string | undefined;
  let dp: { name?: string; title?: string; description?: string } = {};
  try {
    dpContent = await readFile(join(absDir, "datapackage.json"), "utf-8");
    dp = JSON.parse(dpContent);
  } catch {
    // no datapackage.json — that's fine
  }

  const name = opts.name ?? dp.name ?? basename(absDir);
  const title = opts.title ?? dp.title;
  const description = opts.description ?? dp.description;

  const api = new ApiClient(config);

  console.log(`Pushing '${name}' → ${config.publication}`);

  // Create dataset (skip if already exists)
  try {
    await api.createDataset(name, { title, description });
    console.log(`  Created dataset '${name}'`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 400 && err.message.includes("already exists")) {
      console.log(`  Dataset '${name}' already exists, continuing...`);
    } else {
      throw err;
    }
  }

  // Walk and upload files
  const files = await walkDir(absDir);
  console.log(`  Uploading ${files.length} file(s)...\n`);

  let uploaded = 0;
  for (const absPath of files) {
    const relPath = relative(absDir, absPath);
    const info = await stat(absPath);
    const ct = mimeType(relPath);
    const isDatapackage = /datapackage\.(json|ya?ml)$/.test(relPath);
    const content = isDatapackage ? await readFile(absPath, "utf-8") : undefined;

    process.stdout.write(`  ${relPath} (${formatBytes(info.size)})...`);

    const uploadUrl = await api.registerFile(name, relPath, info.size, ct, content);

    const bytes = await readFile(absPath);
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": ct },
      body: bytes,
    });
    if (!res.ok) throw new Error(`Upload failed for ${relPath}: ${res.status} ${res.statusText}`);

    console.log(" ✓");
    uploaded++;
  }

  console.log(`\n${uploaded} file(s) pushed successfully.`);
  console.log(`View at: ${config.apiUrl}/${config.publication}/${name}`);
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / 1024 ** 2).toFixed(1)}MB`;
}
