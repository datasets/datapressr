import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

test('rejects corrupted source category labels even when the archive manifest is refreshed', () => {
  const source = fileURLToPath(new URL('.', import.meta.url));
  const scratch = mkdtempSync(join(tmpdir(), 'france-label-'));
  try {
    cpSync(source, scratch, { recursive: true, filter: p => !p.includes('node_modules') });
    symlinkSync(join(source, 'node_modules'), join(scratch, 'node_modules'), 'dir');
    const path = join(scratch, 'archive/functions.json');
    const j = JSON.parse(readFileSync(path));
    j.dimension.cofog99.category.label.GF02 = 'Defence}}';
    writeFileSync(path, JSON.stringify(j));
    const manifestPath = join(scratch, 'archive/manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath));
    const entry = manifest.files.find(f => f.file === 'functions.json');
    const bytes = readFileSync(path);
    entry.bytes = bytes.length;
    entry.sha256 = createHash('sha256').update(bytes).digest('hex');
    writeFileSync(manifestPath, JSON.stringify(manifest));
    const result = spawnSync(process.execPath, ['build.ts'], { cwd: scratch, encoding: 'utf8' });
    assert.notEqual(result.status, 0, 'A changed category label must require review');
    assert.match(result.stderr, /Source category labels changed/);
  } finally { rmSync(scratch, { recursive: true, force: true }); }
});
