import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readArtifact } from './reader.ts';

test('previews quoted CSV and reflects a subsequent file change', async () => {
  const root = await mkdtemp(join(tmpdir(), 'bb-preview-'));
  try {
    await writeFile(join(root, 'table.csv'), 'country,value\n"France, mainland",2\n');
    const first = await readArtifact(root, 'data');
    assert.deepEqual(first.rows, [['France, mainland', '2']]);
    await writeFile(join(root, 'table.csv'), 'country,value\nFrance,7\n');
    const second = await readArtifact(root, 'data');
    assert.equal(second.rows[0][1], '7');
    assert.notEqual(first.revision, second.revision);
  } finally { await rm(root, { recursive: true }); }
});

test('reads documentation and HTML; rejects oversized and unsupported inputs', async () => {
  const root = await mkdtemp(join(tmpdir(), 'bb-preview-'));
  try {
    await writeFile(join(root, 'README.md'), '# Dataset\n');
    await writeFile(join(root, 'story.html'), '<h1>Story</h1>');
    assert.equal((await readArtifact(root, 'readme')).content, '# Dataset\n');
    assert.equal((await readArtifact(root, 'story')).content, '<h1>Story</h1>');
    await assert.rejects(() => readArtifact(root, '../secret' as any), /Unsupported/);
    await writeFile(join(root, 'README.md'), 'x'.repeat(262145));
    await assert.rejects(() => readArtifact(root, 'readme'), /256 KiB/);
  } finally { await rm(root, { recursive: true }); }
});
