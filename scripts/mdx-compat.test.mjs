// DataHub compiles every .md page as MDX (remark-gfm, remark-math with $$
// only); one stray `<` or `{` replaces the whole page with "Error parsing
// MDX" (datapressr-fyy). Every story page and every dataset README must
// compile under that pipeline before it is published.
// Needs `npm ci` in site/stories (the MDX compiler is a devDependency there).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const stories = join(root, 'site/stories');
assert.ok(existsSync(join(stories, 'node_modules/@mdx-js/mdx')), 'MDX compiler missing: run `npm ci` in site/stories');
const { mdxError, checkFiles } = await import('../site/stories/mdx-check.mjs');

const datasetReadmes = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  if (!d.isDirectory() || ['node_modules', 'archive', 'data'].includes(d.name)) return [];
  const sub = join(dir, d.name);
  return [...(existsSync(join(sub, 'README.md')) ? [join(sub, 'README.md')] : []), ...datasetReadmes(sub)];
});

test('every site/stories/*.md and datasets/**/README.md compiles as DataHub MDX', async () => {
  const files = [...readdirSync(stories).filter((f) => f.endsWith('.md')).map((f) => join(stories, f)), ...datasetReadmes(join(root, 'datasets'))];
  assert.ok(files.length > 10, `expected story and README files, found ${files.length}`);
  const failures = (await checkFiles(files)).map((f) => f.replace(root, ''));
  assert.deepEqual(failures, [], `fix these before publishing to DataHub:\n${failures.join('\n')}`);
});

test('an angle-bracket autolink fails with its line number', async () => {
  const err = await mdxError('---\ntitle: x\n---\n\n# Title\n\nSee <https://x> for more.\n');
  assert.ok(err, 'an <https://...> autolink must fail to compile');
  assert.equal(err.line, 7);
});

test('single dollars are text, not math, as on DataHub', async () => {
  assert.equal(await mdxError('WTI was -$36.98 and Brent $19.33 a barrel.\n'), null);
});
