#!/usr/bin/env node
// Build a DataHub-ready bundle for one story in site/stories/.
//
//   node scripts/bundle-story.mjs <story> [--slug <datahub-slug>] [--out <dir>]
//
// <story> is the site file stem (oil-prices, keeling-curve, ...). Writes
// <out>/<datahub-slug>/ (default out: .runtime/publish) containing README.md
// and exactly the SVGs it references, nothing else. Prints the bundle path,
// title and description as JSON. Publishes nothing.
//
// README.md is the story with only these changes, so DataHub renders it
// correctly (docs/plans/2026-10-10-stories-on-datahub.md, sections 1-3):
// - frontmatter cut down to title, description and date;
// - the first h1 removed (DataHub prints the title in its header);
// - the internal "Friction notes" section removed;
// - links to other site pages (outlines, ../datasets.md) made absolute
//   datapressr.datahub.io URLs, and links to other repo files GitHub URLs;
// - GitHub links to a dataset folder or README rewritten to its DataHub page
//   when the dataset is published (PUBLISHED in build-datasets-page.mjs).
// It exits non-zero, naming the link, if a relative link points at nothing,
// if a relative link is left that does not resolve inside the bundle, or if
// the result does not compile as DataHub MDX.
//
// The DataHub slug comes from --slug, else frontmatter `slug`, else the
// kebab-cased title. It must not equal a dataset name: stories and datasets
// share one namespace per publication.
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collect } from './build-datasets-page.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://datapressr.datahub.io';
const REPO_URL = 'https://github.com/datasets/datapressr';
const KEEP_FRONTMATTER = ['title', 'description', 'date'];

export class BundleError extends Error {}

const unquote = (v) => v.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');

export function splitFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  return m ? { front: m[1], body: text.slice(m[0].length) } : { front: '', body: text };
}

// Keep only the top-level keys DataHub uses (plus their indented continuation lines).
export function keepFrontmatter(front, keys = KEEP_FRONTMATTER) {
  const out = [];
  let keep = false;
  for (const line of front.split('\n')) {
    const key = /^([A-Za-z_][\w-]*):/.exec(line)?.[1];
    if (key) keep = keys.includes(key);
    if (keep) out.push(line);
  }
  return out.join('\n');
}

export const frontValue = (front, key) => {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(front);
  return m ? unquote(m[1]) : undefined;
};

export const kebab = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function removeFirstH1(body) {
  return body.replace(/^# .*\n(\s*\n)*/m, '');
}

export function removeSection(body, heading) {
  const re = new RegExp(`^## ${heading}\\s*\\n[\\s\\S]*?(?=^## |(?![\\s\\S]))`, 'm');
  return body.replace(re, '');
}

const LINK = /(!?)\[((?:[^\[\]]|\[[^\]]*\])*)\]\(([^)\s]+)\)/g;
const isExternal = (url) => /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//');

// Absolute URL for a repo path that a story links to relatively.
function absoluteUrl(root, target, hash, isDir) {
  const rel = relative(root, target).split(sep).join('/');
  if (rel.startsWith('site/') && rel.endsWith('.md')) {
    const page = rel.slice('site/'.length, -'.md'.length).replace(/(^|\/)README$/, '');
    return `${SITE_URL}/${page}${hash}`;
  }
  return `${REPO_URL}/${isDir ? 'tree' : 'blob'}/main/${rel.replace(/\/$/, '')}${hash}`;
}

export function datasetLinks(root = ROOT) {
  const map = new Map();
  for (const d of collect(root)) {
    if (!d.datahub) continue;
    if (d.folder) map.set(d.folder, d.datahub);
    if (d.readme) map.set(d.readme, d.datahub);
  }
  return map;
}

export function bundleStory(story, { slug, out = join(ROOT, '.runtime/publish'), root = ROOT } = {}) {
  const storiesDir = join(root, 'site/stories');
  const source = join(storiesDir, `${story}.md`);
  if (!existsSync(source)) throw new BundleError(`No story at ${relative(root, source)}`);
  const { front, body } = splitFrontmatter(readFileSync(source, 'utf8'));
  const title = frontValue(front, 'title');
  const description = frontValue(front, 'description');
  if (!title) throw new BundleError(`${story}.md has no frontmatter title`);
  slug ??= frontValue(front, 'slug') ?? kebab(title);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new BundleError(`DataHub slug "${slug}" must be lowercase letters, digits and hyphens`);
  const datasets = collect(root);
  if (datasets.some((d) => d.name === slug)) throw new BundleError(`DataHub slug "${slug}" is already a dataset name; pass --slug`);

  const published = datasetLinks(root);
  const assets = new Set();
  const errors = [];
  let text = removeSection(removeFirstH1(body), 'Friction notes');
  text = text.replace(LINK, (whole, bang, label, url) => {
    if (isExternal(url)) {
      const [base, hash = ''] = url.split('#');
      const to = published.get(base.replace(/\/$/, ''));
      return to ? `${bang}[${label}](${to}${hash ? '#' + hash : ''})` : whole;
    }
    if (url.startsWith('#')) return whole;
    const [path, hash = ''] = url.split('#');
    const target = resolve(storiesDir, decodeURIComponent(path));
    if (!existsSync(target)) { errors.push(`${story}.md: link target does not exist: ${url}`); return whole; }
    const isDir = statSync(target).isDirectory();
    if (bang) {
      if (isDir || dirname(target) !== storiesDir) { errors.push(`${story}.md: image must be a file in site/stories: ${url}`); return whole; }
      assets.add(relative(storiesDir, target));
      return whole;
    }
    return `[${label}](${absoluteUrl(root, target, hash ? '#' + hash : '', isDir)})`;
  });
  if (errors.length) throw new BundleError(errors.join('\n'));

  const kept = keepFrontmatter(front);
  const readme = `---\n${kept}\n---\n\n${text.trim()}\n`;

  // Every relative link left must resolve to a file in the bundle.
  for (const [, , , url] of readme.matchAll(LINK)) {
    if (isExternal(url) || url.startsWith('#')) continue;
    if (!assets.has(url.split('#')[0])) errors.push(`${story}.md: relative link does not resolve inside the bundle: ${url}`);
  }
  if (errors.length) throw new BundleError(errors.join('\n'));

  const dir = join(out, slug);
  if (resolve(dir) === resolve(root) || resolve(root).startsWith(resolve(dir) + sep)) throw new BundleError('Output must not contain the repository');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'README.md'), readme);
  const files = ['README.md'];
  for (const f of [...assets].sort()) { copyFileSync(join(storiesDir, f), join(dir, f)); files.push(f); }
  return { dir, slug, title, description, files, readme };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const opt = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
  const slug = opt('--slug');
  const outArg = opt('--out');
  const [story] = args;
  if (!story) { console.error('usage: node scripts/bundle-story.mjs <story> [--slug <datahub-slug>] [--out <dir>]'); process.exit(2); }
  try {
    const result = bundleStory(story, { slug, ...(outArg ? { out: resolve(outArg) } : {}) });
    const { mdxError } = await import('../site/stories/mdx-check.mjs');
    const err = await mdxError(result.readme);
    if (err) throw new BundleError(`${relative(process.cwd(), join(result.dir, 'README.md'))}:${err.line}:${err.column}: does not compile as DataHub MDX: ${err.message}`);
    const { readme, ...summary } = result;
    console.log(JSON.stringify(summary, null, 2));
  } catch (e) {
    if (!(e instanceof BundleError)) throw e;
    console.error(e.message);
    process.exit(1);
  }
}
