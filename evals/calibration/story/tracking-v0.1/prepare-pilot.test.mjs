import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateManifest, readJournal } from '../../../lib/story-quality-tracker.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const BASE = 'evals/calibration/story/tracking-v0.1';
const SOURCE = 'evals/experiments/story-quality/reference-led-v1';
const instrument = JSON.parse(readFileSync(join(ROOT, BASE, 'instrument.json')));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const { preparePilot } = await import('./prepare-pilot.mjs');
const temporary = fn => {
  const out = mkdtempSync(join(ROOT, '.pilot-test-'));
  try { return fn(out); } finally { rmSync(out, { recursive: true, force: true }); }
};
const snapshot = dir => Object.fromEntries(readdirSync(dir, { recursive: true, withFileTypes: true }).filter(e => e.isFile()).map(e => {
  const path = join(e.parentPath, e.name);
  return [path.slice(dir.length), readFileSync(path).toString('base64')];
}));

// Catches slot drift, unindexed bytes, altered prose/charts and broken reading links.
test('prepares the four first-replicate artifacts from indexed source bytes', () => temporary(out => {
  const manifest = preparePilot({ root: ROOT, out });
  assert.deepEqual(manifest.artifacts.map(a => a.source_code), ['M30755c', 'Mb8941a', 'Mbe53b2', 'M9b1fee']);
  assert.deepEqual(manifest.artifacts.map(a => a.artifact_id), ['A', 'B', 'C', 'D'].map(id => `tracking-pilot-20261021-${id}`));
  assert.equal(new Set(manifest.artifacts.map(a => a.topic)).size, 2);
  assert.equal(new Set(manifest.artifacts.map(a => a.arm)).size, 2);
  assert.equal(manifest.selection.eligible.length, 8);
  assert.equal(manifest.selection.eligible.filter(a => !a.selected).length, 4);
  assert.ok(manifest.selection.eligible.filter(a => !a.selected).every(a => a.exclusion_reason === 'second replicate outside four-artifact pilot'));
  const index = JSON.parse(readFileSync(join(ROOT, SOURCE, 'review-materials-index.json')));
  for (const a of manifest.artifacts) {
    assert.equal(a.replicate, 1);
    const source = readFileSync(join(ROOT, a.source_story.path), 'utf8');
    const viewed = readFileSync(join(ROOT, a.viewed_story.path), 'utf8');
    const title = source.split('\n')[0];
    assert.equal(viewed.split('\n')[0], title);
    assert.equal(viewed.split('\n').filter(line => line.startsWith('# ')).length, 1);
    let restored = viewed;
    for (const rewrite of a.transformation.link_rewrites) restored = restored.replace(`](${rewrite.to})`, `](${rewrite.from})`);
    assert.equal(restored, source.slice(title.length + 2));
    assert.equal(hash(Buffer.from(viewed)), a.viewed_story.sha256);
    for (const asset of [a.source_story, a.source_commission, ...a.renders]) {
      assert.equal(hash(readFileSync(join(ROOT, asset.path))), asset.sha256);
      assert.equal(index.files.find(f => `${SOURCE}/review-materials/${f.archived_relative_path}` === asset.path)?.sha256, asset.sha256);
    }
    assert.deepEqual(readFileSync(join(ROOT, a.commission.path)), readFileSync(join(ROOT, a.source_commission.path)));
    const destinations = [...viewed.matchAll(/!\[[^\]]*\]\(([^)]+\.png)\)/g)].map(m => m[1]);
    assert.equal(destinations.length, a.renders.length);
    for (const [i, destination] of destinations.entries()) {
      const png = readFileSync(resolve(dirname(join(ROOT, a.viewed_story.path)), destination));
      assert.equal(hash(png), a.renders[i].sha256);
      assert.ok(png.readUInt32BE(16) > 0 && png.readUInt32BE(20) > 0);
      assert.equal(a.renders[i].intended_display_width_px, 720);
    }
  }
  validateManifest(manifest, { root: ROOT, instrument });
  assert.deepEqual(readJournal(join(out, 'judgments.jsonl')), []);
  assert.equal(readFileSync(join(out, 'judgments.jsonl')).length, 0);
  const report = readFileSync(join(out, 'report.md'), 'utf8');
  assert.match(report, /Owner observations: 0; AI observations: 0/);
  assert.equal((report.match(/### tracking-pilot-20261021-/g) ?? []).length, 4);
  assert.equal((report.match(/Checked scopes: none/g) ?? []).length, 4);
}));

test('identical preparation is byte stable and owner form is score-free', () => temporary(out => {
  preparePilot({ root: ROOT, out });
  const before = snapshot(out);
  preparePilot({ root: ROOT, out });
  assert.deepEqual(snapshot(out), before);
  const form = readFileSync(join(out, 'owner/form.md'), 'utf8');
  for (const id of ['A', 'B', 'C', 'D']) {
    assert.match(form, new RegExp(`\\[Story ${id}\\]\\(${id}\\.md\\)`));
    assert.match(form, new RegExp(`\\[Commission ${id}\\]\\(${id}-commission\\.md\\)`));
  }
  assert.equal((form.match(/Was this worth reading\?/g) ?? []).length, 4);
  assert.equal((form.match(/Did I understand the answer/g) ?? []).length, 4);
  assert.equal((form.match(/How easy and enjoyable/g) ?? []).length, 4);
  assert.equal((form.match(/Optional independent overall/g) ?? []).length, 4);
  assert.doesNotMatch(form, /M30755c|Mb8941a|Mbe53b2|M9b1fee|baseline|candidate|Claude|OpenAI|expected finding|AI score|historical score|\b[0-9]+ \/10/);
  const readme = readFileSync(join(out, 'owner/README.md'), 'utf8');
  for (const dimension of instrument.human_dimensions) for (const anchor of Object.values(dimension.anchors)) assert.ok(readme.includes(anchor));
  assert.match(readme, /1 and odd numbers are allowed/);
}));

// Catches destructive regeneration after collecting responses or changing a frozen packet.
for (const [file, bytes] of [['judgments.jsonl', '{"real":"response"}\n'], ['owner/A.md', 'changed story\n'], ['manifest.json', '{}\n'], ['owner/README.md', 'changed anchors\n']]) {
  test(`refuses to overwrite frozen ${file}`, () => temporary(out => {
    preparePilot({ root: ROOT, out });
    writeFileSync(join(out, file), bytes);
    const before = snapshot(out);
    assert.throws(() => preparePilot({ root: ROOT, out }), /frozen|nonempty|new output directory/i);
    assert.deepEqual(snapshot(out), before);
  }));
}

// Copies isolate corruption checks from the immutable historical archive.
for (const [name, path] of [
  ['instrument bytes', `${BASE}/instrument.json`],
  ['indexed story bytes', `${SOURCE}/review-materials/M30755c/stage2/story.md`],
  ['indexed PNG bytes', `${SOURCE}/review-materials/M30755c/stage2/chart-1.png`],
]) {
  test(`rejects changed ${name} before creating a packet`, () => temporary(root => {
    mkdirSync(join(root, BASE), { recursive: true });
    cpSync(join(ROOT, BASE, 'instrument.json'), join(root, BASE, 'instrument.json'));
    mkdirSync(join(root, SOURCE), { recursive: true });
    cpSync(join(ROOT, SOURCE, 'review-materials-index.json'), join(root, SOURCE, 'review-materials-index.json'));
    for (const code of ['M30755c', 'Mb8941a', 'Mbe53b2', 'M9b1fee']) cpSync(join(ROOT, SOURCE, 'review-materials', code, 'stage2'), join(root, SOURCE, 'review-materials', code, 'stage2'), { recursive: true });
    writeFileSync(join(root, path), Buffer.concat([readFileSync(join(root, path)), Buffer.from(' ')]));
    assert.throws(() => preparePilot({ root, out: join(root, 'packet') }), /hash|index|instrument/i);
    assert.equal(existsSync(join(root, 'packet')), false);
  }));
}
