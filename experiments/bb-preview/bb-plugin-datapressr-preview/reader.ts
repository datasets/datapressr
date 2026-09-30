import { open } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'csv-parse/sync';

export type ArtifactKind = 'data' | 'readme' | 'story';
export type Artifact = { name: string; content: string; columns: string[]; rows: string[][]; revision: string };
const names = { data: 'table.csv', readme: 'README.md', story: 'story.html' };
const limit = 256 * 1024;

export async function readArtifact(root: string, kind: string): Promise<Artifact> {
  if (!Object.hasOwn(names, kind)) throw new Error('Unsupported artifact');
  const name = names[kind as ArtifactKind];
  const file = await open(join(root, name), 'r');
  let content: string;
  try {
    const buffer = Buffer.alloc(limit + 1);
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0);
    if (bytesRead > limit) throw new Error('Preview exceeds 256 KiB fixture limit');
    content = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, bytesRead));
  } finally { await file.close(); }
  const records: string[][] = kind === 'data' ? parse(content, { skip_empty_lines: true }) : [];
  return { name, content, columns: records[0] ?? [], rows: records.slice(1), revision: createHash('sha256').update(content).digest('hex').slice(0, 12) };
}
