import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,writeFile,rm } from 'node:fs/promises';
import { join,resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { renderDocument } from '../src/documents.ts';
async function fixture(t:any) {
  const rootPath=await mkdtemp(join(tmpdir(),'datapressr-docs-'));t.after(()=>rm(rootPath,{recursive:true,force:true}));
  const workspace={rootPath,threadId:'thread',environmentId:'env',hostId:'local'};
  async function put(path:string,content:string) {await mkdir(join(rootPath,path,'..'),{recursive:true});await writeFile(join(rootPath,path),content);}
  return {workspace,put};
}
test('Markdown frontmatter, tables, local/parent images and navigation',async t=>{
  const {workspace,put}=await fixture(t);
  await put('docs/a.md','---\ntitle: Hidden\n---\n# Visible\n\n| A | B |\n|---|---|\n|1|2|\n\n![One](one.svg)\n![Two](../charts/two.svg)\n[Next](nested/b.md) [External](https://example.com/)');
  await put('docs/one.svg','<svg xmlns="http://www.w3.org/2000/svg"/>');await put('charts/two.svg','<svg xmlns="http://www.w3.org/2000/svg"/>');
  const result=await renderDocument(workspace,'docs/a.md');assert.ok(!result.html.includes('Hidden'));assert.match(result.html,/<table>/);assert.equal((result.html.match(/data:image\/svg\+xml;base64/g)||[]).length,2);assert.match(result.html,/data-preview-path="docs\/nested\/b.md"/);assert.match(result.html,/href="https:\/\/example.com\/"/);assert.equal(result.warnings.length,0);
});
test('missing/remote assets report warnings; scripts, handlers, forms, embeds and base removed',async t=>{
  const {workspace,put}=await fixture(t);await put('a.html','<base href="https://example.com"><script>window.BAD=true</script><img src="missing.png" onerror="alert(1)"><img src="https://example.com/a.png"><iframe src="https://example.com"></iframe><form action="https://example.com"><input></form><a href="javascript:alert(1)">bad</a>');
  const result=await renderDocument(workspace,'a.html');assert.doesNotMatch(result.html,/<script|onerror|<iframe|<form|<base|javascript:/);assert.equal(result.warnings.length,2);assert.match(result.html,/default-src 'none'/);
});
test('HTML local CSS and image dependencies are included and child-only changes revise document',async t=>{
  const {workspace,put}=await fixture(t);await put('a.html','<link rel="stylesheet" href="styles/main.css"><h1>Static</h1><img src="chart.svg">');
  await put('styles/main.css','@import "extra.css"; h1{color:rgb(12,34,56);background-image:url(../chart.svg)}');await put('styles/extra.css','h1{font-size:30px}');await put('chart.svg','<svg xmlns="http://www.w3.org/2000/svg"><text>one</text></svg>');
  const first=await renderDocument(workspace,'a.html');assert.match(first.html,/rgb\(12,34,56\)/);assert.match(first.html,/font-size:30px/);assert.match(first.html,/data:image\/svg\+xml;base64/);
  await put('chart.svg','<svg xmlns="http://www.w3.org/2000/svg"><text>two</text></svg>');const second=await renderDocument(workspace,'a.html');assert.notEqual(first.revision,second.revision);
});
test('real Keeling story includes two actual local charts',async()=>{
  const result=await renderDocument({rootPath:resolve('..'),threadId:'t',environmentId:'e',hostId:'h'},'site/stories/keeling-curve.md');assert.equal((result.html.match(/data:image\/svg\+xml;base64/g)||[]).length,2);assert.equal(result.warnings.length,0);assert.match(result.html,/The Keeling Curve/);
});
test('repeated embedding cannot expand beyond the rendered bundle budget',async t=>{
  const {workspace,put}=await fixture(t);await put('a.svg','<svg>'+ ' '.repeat(1024*1024)+'</svg>');await put('a.md',Array(30).fill('![Chart](a.svg)').join('\n'));
  await assert.rejects(renderDocument(workspace,'a.md'),{code:'asset_limit'});
});
test('inline styles retain declarations and embed local assets',async t=>{
  const {workspace,put}=await fixture(t);await put('a.svg','<svg/>');await put('a.html','<h1 style="color:red;background-image:url(a.svg)">Red</h1>');
  const result=await renderDocument(workspace,'a.html');assert.match(result.html,/style="color:red;background-image:url\(/);assert.match(result.html,/data:image\/svg\+xml;base64/);
});
test('partial frontmatter is visibly unavailable then recovers',async t=>{
  const {workspace,put}=await fixture(t);await put('a.md','---\ntitle: incomplete');await assert.rejects(renderDocument(workspace,'a.md'),{code:'document_updating'});await put('a.md','---\ntitle: ready\n---\n# Ready');assert.match((await renderDocument(workspace,'a.md')).html,/<h1>Ready<\/h1>/);
});
