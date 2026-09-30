import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { renderDocument } from '../src/documents.ts';

test('rebuilding a chart changes a story revision without changing Markdown',async()=>{
  const root=await mkdtemp(join(tmpdir(),'datapressr-chart-'));
  try{
    await cp(new URL('./fixtures/chart/',import.meta.url),root,{recursive:true});
    const workspace={threadId:'test',environmentId:'test',hostId:'test',rootPath:root};
    const markdown=await readFile(join(root,'story.md'));
    execFileSync(process.execPath,[join(root,'build.mjs')]);
    const before=await renderDocument(workspace,'story.md');
    await writeFile(join(root,'input.json'),JSON.stringify({label:'After rebuild',value:80,color:'#2563eb'}));
    execFileSync(process.execPath,[join(root,'build.mjs')]);
    const after=await renderDocument(workspace,'story.md');
    assert.notEqual(before.revision,after.revision);assert.notEqual(before.html,after.html);
    assert.deepEqual(markdown,await readFile(join(root,'story.md')));
    assert.match(await readFile(join(root,'chart.svg'),'utf8'),/After rebuild/);
  }finally{await rm(root,{recursive:true,force:true});}
});
