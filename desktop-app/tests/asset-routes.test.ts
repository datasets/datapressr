import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveAssetPath, readAsset } from '../src/asset-routes.ts';
test('resolves document-relative assets including legal parent and encoded unicode',()=>{
  assert.equal(resolveAssetPath('stories/doc.md','../charts/a.svg'),'charts/a.svg');
  assert.equal(resolveAssetPath('stories/doc.md','caf%C3%A9%20%22a%22.png'),'stories/café "a".png');
  for(const ref of ['/etc/a.svg','../../a.svg','%2e%2e/a.svg','https://example.com/a.svg','//example.com/a.svg','data:image/svg+xml,x','%252e%252e/a.svg']) assert.throws(()=>resolveAssetPath('stories/doc.md',ref));
});
test('assets are confined to their resolved workspace and supplied as data URLs',async t=>{
  const root=await mkdtemp(join(tmpdir(),'datapressr-assets-'));t.after(()=>rm(root,{recursive:true,force:true}));
  for(const id of ['one','two']) {await mkdir(join(root,id));await writeFile(join(root,id,'chart.svg'),`<svg>${id}</svg>`);await writeFile(join(root,id,'style.css'),'body{color:red}');}
  const base={threadId:'thread',environmentId:'env',hostId:'host'};
  const a=await readAsset({...base,rootPath:join(root,'one')},'doc.md','chart.svg');const b=await readAsset({...base,rootPath:join(root,'two')},'doc.md','chart.svg');
  assert.notEqual(a.dataUrl,b.dataUrl);assert.match(a.dataUrl,/^data:image\/svg\+xml;base64,/);
  assert.match((await readAsset({...base,rootPath:join(root,'one')},'doc.html','style.css')).dataUrl,/^data:text\/css;base64,/);
});
