// Build a portable story + data bundle and a static hosted preview.
// node site/stories/france-public-finances-package.mjs [output-directory]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, cpSync, rmSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';
const root = fileURLToPath(new URL('../../', import.meta.url));
const slug = 'france-public-finances';
const dataset = join(root, 'datasets', slug);
const stories = join(root, 'site/stories');
const output = resolve(process.argv[2] || join(root, '.runtime/france-public-finances-package'));
if (output === root || root.startsWith(output + '/')) throw new Error('Output must not be an ancestor of the repository');
const bundle = join(output, 'bundle'), dist = join(output, 'dist');
mkdirSync(bundle, { recursive: true }); mkdirSync(dist, { recursive: true });
const write = (path, text) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); };
const copy = (from, to) => { mkdirSync(dirname(to), { recursive: true }); copyFileSync(from, to); };
const files = readdirSync(join(dataset, 'data')).filter(f => f.endsWith('.csv'));
const repo = 'https://github.com/datasets/datapressr/';
const strip = s => s.replace(/^---\n[\s\S]*?\n---\n/, '');
const story = strip(readFileSync(join(stories, slug+'.md'), 'utf8'));
const portable = story.replaceAll(repo+'tree/main/datasets/'+slug, 'DATA.md').replaceAll(repo+'blob/main/datasets/'+slug+'/build.ts', 'sources/datasets/'+slug+'/build.ts').replaceAll(repo+'blob/main/site/stories/'+slug+'-make-charts.mjs', 'sources/site/stories/'+slug+'-make-charts.mjs').replaceAll('france-public-finances.zip','../france-public-finances.zip');
write(join(bundle,'README.md'), portable+'\n## Files in this bundle\n\n'+files.map(f=>'- [data/'+f+'](data/'+f+')').join('\n')+'\n\n[DATA.md](DATA.md) documents coverage and definitions; [datapackage.json](datapackage.json) describes each column. [REPRODUCE.md](REPRODUCE.md) explains the archived sources and build.\n');
write(join(bundle,'DATA.md'),readFileSync(join(dataset,'README.md'),'utf8'));
copy(join(dataset,'datapackage.json'),join(bundle,'datapackage.json'));
for(const f of files) { copy(join(dataset,'data',f),join(bundle,'data',f)); copy(join(dataset,'data',f),join(dist,'data',f)); }
for(const f of readdirSync(stories).filter(f=>f.startsWith(slug)&&f.endsWith('.svg'))) { copy(join(stories,f),join(bundle,f)); copy(join(stories,f),join(dist,f)); }
cpSync(dataset,join(bundle,'sources/datasets',slug),{recursive:true,filter:src=>!src.split('/').includes('node_modules')});
for(const f of readdirSync(stories).filter(f=>f.startsWith(slug)||['package.json','package-lock.json'].includes(f))) {
  const target=join(bundle,'sources/site/stories',f);mkdirSync(dirname(target),{recursive:true});
  cpSync(join(stories,f),target,{recursive:true});
}
for(const f of readdirSync(join(root,'docs/reviews')).filter(f=>f.startsWith(slug)))copy(join(root,'docs/reviews',f),join(bundle,'sources/docs/reviews',f));
copy(join(root,'docs',slug+'-investigation.md'),join(bundle,'sources/docs',slug+'-investigation.md'));
write(join(bundle,'REPRODUCE.md'),'# Reproduce\n\nThe source tree preserves repository-relative paths. Requires Node with native TypeScript support (tested with Node 26) and npm. The dataset build runs offline after installing dependencies.\n\n```sh\ncd sources/datasets/france-public-finances\nnpm ci\nnode build.ts\nnode scripts/validate-datapackage.mjs .\ncd ../../site/stories\nnpm ci\nnode france-public-finances-make-charts.mjs\n```\n\nThe regenerated CSVs are in sources/datasets/france-public-finances/data. Chart SVGs are in sources/site/stories. Raw snapshots, timestamps, hashes and source licences are under the dataset archive directory. DATA.md explains units, missing observations, classifications and revision dates. The article is a reviewed working draft; the author voice pass remains outstanding.\n');
const css = `body{margin:0;background:#faf9f6;color:#18212b;font:18px/1.65 system-ui,sans-serif}main{max-width:860px;margin:36px auto;padding:0 24px 64px}header{font:13px system-ui;color:#66717d;letter-spacing:.06em;border-bottom:1px solid #ddd;padding-bottom:14px}h1{font:700 42px/1.15 Georgia,serif;margin:32px 0}h2{font:700 27px/1.3 Georgia,serif;margin:38px 0 12px}a{color:#175d9c}img{display:block;width:100%;height:auto;background:white}p{margin:20px 0}table{border-collapse:collapse;font-size:15px}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}pre,.table-wrap{overflow:auto}.chart{overflow-x:auto;margin:24px 0}.chart:has(img[src*="snapshot"]){max-width:600px}nav{font-size:14px;margin-top:12px}footer{font-size:14px;color:#54606a;margin-top:40px}ul{padding-left:22px}@media(max-width:600px){body{font-size:16px}main{padding:0 14px}h1{font-size:32px}h2{font-size:24px}.chart img{min-width:720px}.chart:has(img[src*="snapshot"]) img{min-width:0}}`;
const page = (body,title='Where France’s public money goes') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — DataPressr</title><link rel="icon" href="/favicon.svg"><style>${css}</style></head><body><main><header>DATAPRESSR · WORKING DRAFT · 8 OCTOBER 2026</header><nav><a href="/">Story</a> · <a href="/data.html">Data & sources</a> · <a href="/france-public-finances.zip" download>Download story + data</a></nav>${body}<footer>Figures from archived official sources; see <a href="/data.html">data and methods</a>. <a href="/editorial.html">Editorial record</a>.</footer></main></body></html>\n`;
const rewrite = s => s.replaceAll(repo+'tree/main/datasets/'+slug,'data.html').replaceAll(repo+'blob/main/datasets/'+slug+'/build.ts','build.ts').replaceAll(repo+'blob/main/site/stories/'+slug+'-make-charts.mjs',slug+'-make-charts.mjs').replaceAll(repo+'blob/main/docs/'+slug+'-investigation.md','research.html').replaceAll(slug+'-outline.md','outline.html');
write(join(dist,'index.html'),page(rewrite(marked.parse(story)).replace(/<p>(<img[^>]+>)<\/p>/g,'<div class="chart">$1</div>')));
const descriptions = {'fiscal-accounts.csv':'Annual revenue, expenditure, balance and economic categories; France, Germany, Italy, Spain and EU27. French main totals 1995–2025.','spending-functions.csv':'Spending by purpose, with all nine social-protection groups. France, 1995–2024.','quarterly-debt.csv':'Gross and net debt, and gross debt/GDP. France, 2000-Q1–2026-Q2.'};
write(join(dist,'data.html'),page('<h1>Data behind the story</h1><p>Three CSVs, with source precision preserved. Missing observations are empty cells.</p><ul>'+files.map(f=>`<li><a href="data/${f}" download>${f}</a> — ${descriptions[f]}</li>`).join('')+'</ul><p><a href="france-public-finances.zip" download>Download the portable bundle</a>: README story, data/, charts, metadata, raw snapshots and build scripts.</p>'+marked.parse(readFileSync(join(dataset,'README.md'),'utf8')).replaceAll(repo+'blob/main/docs/reviews/','reviews/')));
copy(join(dataset,'build.ts'),join(dist,'build.ts'));copy(join(dataset,'datapackage.json'),join(dist,'datapackage.json'));
copy(join(stories,slug+'-make-charts.mjs'),join(dist,slug+'-make-charts.mjs'));
for(const [name,src] of [['research',join(root,'docs',slug+'-investigation.md')],['outline',join(stories,slug+'-outline.md')]])write(join(dist,name+'.html'),page(rewrite(marked.parse(strip(readFileSync(src,'utf8'))))));
for(const f of readdirSync(join(root,'docs/reviews')).filter(f=>f.startsWith(slug)&&f.endsWith('.png')))copy(join(root,'docs/reviews',f),join(dist,'reviews',f));
let links='';
for(const f of readdirSync(join(root,'docs/reviews')).filter(f=>f.startsWith(slug)&&f.endsWith('.md'))) { const md=readFileSync(join(root,'docs/reviews',f),'utf8');write(join(dist,'reviews',f),md);write(join(dist,'reviews',f.replace(/\.md$/,'.html')),page(marked.parse(md)));links+=`<li><a href="reviews/${f.replace(/\.md$/,'.html')}">${md.split('\n')[0].replace(/^# /,'')}</a></li>`; }
write(join(dist,'editorial.html'),page('<h1>Editorial record</h1><p>Working draft. The author’s voice pass remains outstanding. Reader feedback is retained verbatim to inform future story-skill improvements.</p><p><a href="outline.html">Reviewed outline</a> · <a href="research.html">Research note</a></p><ul>'+links+'</ul>'));
// Old hosted download links continue to resolve.
write(join(dist,'dataset/index.html'),page('<h1>Dataset downloads</h1><p><a href="../data.html">Data, definitions and source notes</a></p>'));
for(const f of files)copy(join(dataset,'data',f),join(dist,'dataset/data',f));
copy(join(dataset,'build.ts'),join(dist,'dataset/build.ts')); copy(join(dataset,'datapackage.json'),join(dist,'dataset/datapackage.json'));
write(join(dist,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#faf9f6"/><path d="M6 24V15h5v9zm8 0V7h5v17zm8 0V11h5v13z" fill="#2563eb"/></svg>\n');
const zip=join(dist,slug+'.zip');rmSync(zip,{force:true});execFileSync('zip',['-q','-r',zip,'.'],{cwd:bundle});copy(zip,join(dist,'source.zip'));
console.log(JSON.stringify({bundle,dist,zip}));
