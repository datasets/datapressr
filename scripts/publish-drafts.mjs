#!/usr/bin/env node
// Publish draft stories to the annotatable review site (Flowershow, `fl --annotations`)
// and record each one in publications.csv.
// Usage: node scripts/publish-drafts.mjs <slug> [<slug>...]
// Read reviewers' notes back with: fl annotations pull --name datapressr-drafts
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SITE = 'datapressr-drafts';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storiesDir = path.join(root, 'site/stories');
const stage = path.join(root, '.runtime/drafts-site'); // gitignored; keeps fl's site marker between sessions
const registry = path.join(root, 'publications.csv');

const slugs = process.argv.slice(2);
if (!slugs.length) { console.error('usage: publish-drafts.mjs <slug> [<slug>...]'); process.exit(1); }

fs.mkdirSync(path.join(stage, 'stories'), { recursive: true });
const siteConfig = JSON.parse(fs.readFileSync(path.join(root, 'site/config.json'), 'utf8'));
fs.writeFileSync(path.join(stage, 'config.json'), JSON.stringify({
  ...siteConfig, siteName: 'DataPressr drafts', annotations: true,
  nav: { ...siteConfig.nav, title: 'DataPressr drafts', links: [] },
}, null, 2) + '\n');

const titles = {};
for (const slug of slugs) {
  const md = path.join(storiesDir, `${slug}.md`);
  if (!fs.existsSync(md)) { console.error(`no such story: ${md}`); process.exit(1); }
  const files = new Set([`${slug}.md`]);
  if (fs.existsSync(path.join(storiesDir, `${slug}-outline.md`))) files.add(`${slug}-outline.md`);
  for (const f of [...files]) {
    const text = fs.readFileSync(path.join(storiesDir, f), 'utf8');
    for (const [, ref] of text.matchAll(/\]\(([\w.-]+\.(?:svg|png|jpg|md))\)/g)) {
      if (fs.existsSync(path.join(storiesDir, ref))) files.add(ref);
    }
  }
  for (const f of files) fs.copyFileSync(path.join(storiesDir, f), path.join(stage, 'stories', f));
  const text = fs.readFileSync(md, 'utf8');
  titles[slug] = (text.match(/^title:\s*["']?(.+?)["']?\s*$/m) || text.match(/^#\s+(.+)$/m) || [, slug])[1];
}

// Index page: every draft currently staged.
const staged = fs.readdirSync(path.join(stage, 'stories')).filter((f) => f.endsWith('.md') && !f.endsWith('-outline.md'));
const lines = staged.map((f) => {
  const t = fs.readFileSync(path.join(stage, 'stories', f), 'utf8');
  const title = (t.match(/^title:\s*["']?(.+?)["']?\s*$/m) || t.match(/^#\s+(.+)$/m) || [, f])[1];
  return `- [${title}](stories/${f})`;
});
fs.writeFileSync(path.join(stage, 'README.md'), `---\ntitle: DataPressr drafts\n---\n\nDraft data stories for review. Select any text to leave a note.\n\n${lines.join('\n')}\n`);

const outText = execFileSync('fl', ['--annotations', '--name', SITE, '--yes', stage], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
process.stdout.write(outText);
const base = (outText.match(/https:\/\/[\w.-]+\.flowershow\.me/) || [`https://${SITE}-rufuspollock.flowershow.me`])[0];

// Upsert one row per slug for the drafts venue.
const today = new Date().toISOString().slice(0, 10);
const csvField = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
let rows = fs.readFileSync(registry, 'utf8').trimEnd().split('\n');
for (const slug of slugs) {
  const key = `story,${slug},`;
  rows = rows.filter((r) => !(r.startsWith(key) && r.includes(',flowershow-drafts,')));
  rows.push(['story', slug, titles[slug], `site/stories/${slug}.md`, 'flowershow-drafts', `${base}/stories/${slug}`, 'review', today].map(csvField).join(','));
}
fs.writeFileSync(registry, rows.join('\n') + '\n');
for (const slug of slugs) console.log(`${base}/stories/${slug}`);
