// scripts/bundle-story.mjs: each story becomes a DataHub-ready directory with
// README.md plus only the SVGs it references, no h1, no "Friction notes",
// no relative link escaping the bundle, valid DataHub MDX, byte-reproducible.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { bundleStory, BundleError } from './bundle-story.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCRIPT = fileURLToPath(new URL('bundle-story.mjs', import.meta.url));
const { mdxError } = await import('../site/stories/mdx-check.mjs');
const STORIES = ['oil-prices', 'keeling-curve', 'planetary-boundaries', 'france-public-finances'];

const scratch = () => mkdtempSync(join(tmpdir(), 'bundle-story-'));
const snapshot = (dir) => Object.fromEntries(readdirSync(dir).sort().map((f) => [f, readFileSync(join(dir, f), 'utf8')]));

for (const story of STORIES) {
  test(`${story}: bundle is README.md plus its referenced SVGs, DataHub-clean and reproducible`, async () => {
    const a = scratch(), b = scratch();
    try {
      const one = bundleStory(story, { out: a });
      const two = bundleStory(story, { out: b });
      const readme = readFileSync(join(one.dir, 'README.md'), 'utf8');
      const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]);
      assert.ok(images.length > 0, 'story should reference at least one chart');
      assert.deepEqual(readdirSync(one.dir).sort(), ['README.md', ...new Set(images)].sort());
      assert.ok(images.every((f) => f.endsWith('.svg')), 'only SVG assets');
      assert.doesNotMatch(readme, /^# /m, 'first h1 removed');
      assert.doesNotMatch(readme, /Friction notes/, 'internal section removed');
      assert.match(readme, /^---\ntitle: .+\ndescription: .+\n(date: .+\n)?---\n\n\S/, 'frontmatter kept to title/description/date');
      for (const [, url] of readme.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (!/^(https?:|mailto:|#)/.test(url)) assert.ok(images.includes(url), `relative link escapes bundle: ${url}`);
      }
      assert.equal(await mdxError(readme), null, 'compiles as DataHub MDX');
      assert.deepEqual(snapshot(two.dir), snapshot(one.dir), 'two runs are byte-identical');
    } finally { rmSync(a, { recursive: true, force: true }); rmSync(b, { recursive: true, force: true }); }
  });
}

test('oil story: dataset link goes to DataHub, outline to the site', () => {
  const out = scratch();
  try {
    const { readme, slug } = bundleStory('oil-prices', { out });
    assert.equal(slug, 'wti-went-negative-brent-didnt');
    assert.match(readme, /\[oil-prices\]\(https:\/\/datahub\.io\/datapressr\/oil-prices\)/);
    assert.match(readme, /\(https:\/\/datapressr\.datahub\.io\/stories\/oil-prices-outline\)/);
    assert.doesNotMatch(readme, /tree\/main\/datasets\/energy-and-commodities\/oil-prices\)/);
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test('a slug equal to a dataset name is refused', () => {
  assert.throws(() => bundleStory('oil-prices', { slug: 'oil-prices', out: join(tmpdir(), 'bundle-story-unused') }), BundleError);
});

// A throwaway repo root with one story, to exercise broken links.
function fakeRoot(body) {
  const root = scratch();
  mkdirSync(join(root, 'site/stories'), { recursive: true });
  mkdirSync(join(root, 'datasets'));
  writeFileSync(join(root, 'site/stories/chart.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>\n');
  writeFileSync(join(root, 'site/stories/s.md'), `---\ntitle: S\ndescription: d\n---\n\n# S\n\n![c](chart.svg)\n\n${body}\n`);
  return root;
}

test('a relative link to nothing fails, naming the link', () => {
  const root = fakeRoot('See [gone](missing-page.md).');
  try {
    assert.throws(() => bundleStory('s', { root, out: join(root, 'out') }), /missing-page\.md/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('an image outside site/stories fails, naming it', () => {
  const root = fakeRoot('![x](../elsewhere.svg)');
  writeFileSync(join(root, 'site/elsewhere.svg'), '<svg/>');
  try {
    assert.throws(() => bundleStory('s', { root, out: join(root, 'out') }), /\.\.\/elsewhere\.svg/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('CLI exits non-zero with a message for an unknown story', () => {
  const out = scratch();
  try {
    const r = spawnSync(process.execPath, [SCRIPT, 'no-such-story', '--out', out], { encoding: 'utf8', cwd: ROOT });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /no-such-story/);
  } finally { rmSync(out, { recursive: true, force: true }); }
});
