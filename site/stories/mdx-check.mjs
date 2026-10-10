// Compile Markdown the way DataHub renders it: as MDX, with remark-gfm and
// remark-math ($$ only). DataHub replaces the whole page body with "Error
// parsing MDX" when this fails (datapressr-fyy), so stories and dataset
// READMEs are checked before publishing.
//   node site/stories/mdx-check.mjs <file.md>...   (exits 1 on any failure)
// Lives here so the MDX devDependencies resolve from site/stories/node_modules.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// DataHub strips YAML frontmatter before compiling. Blank it out line for
// line so error positions still point at the right line of the file.
export const blankFrontmatter = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/, (m) => m.replace(/[^\n]/g, ''));

// Returns null if the text compiles, otherwise { line, column, message }.
export async function mdxError(text) {
  try {
    await compile(blankFrontmatter(text), { format: 'mdx', remarkPlugins: [remarkGfm, [remarkMath, { singleDollarTextMath: false }]] });
    return null;
  } catch (e) {
    const start = e.place?.start ?? e.place ?? {};
    return { line: start.line ?? e.line ?? 0, column: start.column ?? e.column ?? 0, message: e.reason ?? e.message };
  }
}

// Checks files; returns a list of "path:line:column: message" strings.
export async function checkFiles(paths) {
  const failures = [];
  for (const path of paths) {
    const err = await mdxError(readFileSync(path, 'utf8'));
    if (err) failures.push(`${path}:${err.line}:${err.column}: ${err.message}`);
  }
  return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = await checkFiles(process.argv.slice(2));
  for (const f of failures) console.error(f);
  process.exit(failures.length ? 1 : 0);
}
