import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncSkills } from '../scripts/prepare-skills.mjs';

test('skill bundle copies complete canonical trees and detects edits, missing and extra files',async()=>{
  const root=await mkdtemp(join(tmpdir(),'datapressr-skills-'));
  try {
    const source=join(root,'source'),target=join(root,'bundle');
    await mkdir(join(source,'validate','references'),{recursive:true});
    await writeFile(join(source,'validate','SKILL.md'),'canonical instructions');
    await writeFile(join(source,'validate','references','guide.md'),'canonical reference');
    await syncSkills(source,target,false,['validate']);
    assert.equal(await readFile(join(target,'validate','references','guide.md'),'utf8'),'canonical reference');
    await syncSkills(source,target,true,['validate']);
    await writeFile(join(target,'validate','SKILL.md'),'drift');
    await assert.rejects(syncSkills(source,target,true,['validate']),/out of sync/);
    await syncSkills(source,target,false,['validate']);
    await writeFile(join(target,'extra.md'),'extra');
    await assert.rejects(syncSkills(source,target,true,['validate']),/out of sync/);
    await syncSkills(source,target,false,['validate']);
    await rm(join(target,'validate','references','guide.md'));
    await assert.rejects(syncSkills(source,target,true,['validate']),/out of sync/);
  } finally {await rm(root,{recursive:true,force:true});}
});
