import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { discoverArtifacts, selectArtifact } from '../src/artifacts.ts';

async function fixture(t:any) {
  const root = await mkdtemp(join(tmpdir(),'datapressr-artifacts-'));
  t.after(() => rm(root,{recursive:true,force:true}));
  async function put(path:string, text='x') {await mkdir(join(root,path,'..'),{recursive:true}); await writeFile(join(root,path),text);}
  return {root,put};
}
test('groups resources and README; keeps loose stories and duplicate basenames distinct', async t => {
  const {root,put} = await fixture(t);
  await put('a/datapackage.json', JSON.stringify({title:'Dataset A',resources:[{path:'data/x.csv',title:'Values'},{path:'missing.csv'},{path:'https://example.com/remote.csv'}]}));
  await put('a/README.md'); await put('a/data/x.csv'); await put('b/README.md'); await put('site/stories/story.md');
  const result = await discoverArtifacts(root);
  assert.equal(result.artifacts.length,4);
  assert.equal(result.artifacts.find(a => a.path === 'a/data/x.csv')?.datasetPath,'a');
  assert.equal(result.artifacts.find(a => a.path === 'a/README.md')?.datasetPath,'a');
  assert.equal(result.artifacts.find(a => a.path === 'site/stories/story.md')?.datasetPath,undefined);
  assert.equal(result.datasets[0].title,'Dataset A');
  assert.ok(result.warnings.some(w => w.includes('missing.csv')));
  assert.equal(result.incomplete,false);
});
test('malformed metadata never hides a valid file; ignored directories and symlinks are skipped',async t => {
  const {root,put} = await fixture(t);
  await put('bad/datapackage.json','{'); await put('bad/data.csv'); await put('README.md');
  for (const dir of ['.git','.hidden','node_modules','archive','dist','build','.cache']) await put(`${dir}/ignore.md`);
  await symlink('/etc',join(root,'outside'));
  const result = await discoverArtifacts(root);
  assert.deepEqual(result.artifacts.map(a=>a.path).sort(),['README.md','bad/data.csv']);
  assert.ok(result.warnings.some(w=>w.includes('bad/datapackage.json')));
});
test('bounded scan explicitly reports incomplete results',async t=>{
  const {root,put} = await fixture(t);for(let i=0;i<12;i++) await put(`${i}.md`);
  const result = await discoverArtifacts(root,5);assert.equal(result.scanned,5);assert.equal(result.incomplete,true);assert.equal(result.artifacts.length,5);
});
test('direct selection accepts supported relative paths outside discovery and rejects invalid paths',()=>{
  assert.deepEqual(selectArtifact('archive/a.csv'),{path:'archive/a.csv',kind:'csv',label:'archive/a.csv'});
  for(const path of ['/etc/passwd','../a.csv','a/../../b.csv','%2e%2e/a.csv','https://a/x.csv','a.pdf','', 'a\\b.csv']) assert.throws(()=>selectArtifact(path));
});
test('actual DataPressr README, resource and Keeling story are discoverable',async()=>{
  const result = await discoverArtifacts(resolve('..'));
  for(const path of ['datasets/climate-and-environment/co2-ppm/README.md','site/stories/keeling-curve.md']) assert.ok(result.artifacts.some(a=>a.path===path),path);
  assert.ok(result.artifacts.some(a=>a.datasetPath==='datasets/climate-and-environment/co2-ppm' && a.kind==='csv'));
});
