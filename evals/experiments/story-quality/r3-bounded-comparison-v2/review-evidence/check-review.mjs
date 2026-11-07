// Reviewer-only offline evidence. No network/model invocation and no frozen-input edits.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,chmodSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {critic,parseEvents,writerArgs,criticArgs} from '../../../../lib/adapters/codex.mjs';
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const dir='evals/experiments/story-quality/r3-bounded-comparison-v2';
const base='bd561130735a8637f2fc0b2b5f5eac3b41e4bf6c';
const staged='bbe94efb15c9841937d9d52423783f6f5fe79041';
assert.equal(git('rev-parse',staged+':skills/story'),'abe2cd0707647eac6972b6f1bba28d49bf94c6be');
assert.equal(git('rev-parse',staged+'^'),base);
assert.equal(git('diff','--name-only',base,staged),'skills/story/references/voice-guide.md');
const caseDir='evals/experiments/story-quality/fresh-case-c17';
const manifest=JSON.parse(readFileSync(caseDir+'/manifest.json'));
for(const f of manifest.files)assert.equal(sha(caseDir+'/'+f.path),f.sha256);
const cand='evals/development/r3-scope-v2';
const cm=JSON.parse(readFileSync(cand+'/manifest.json'));
for(const [p,h] of Object.entries(cm.files))assert.equal(sha(cand+'/story/'+p),h);
for(const ref of ['dd580cf2760b24ab4558b11a7092849bda3345ac','46a14a5f25cee203844a38d5fcc284293ee2301b'])git('merge-base','--is-ancestor',ref,'main');
const prior=JSON.parse(readFileSync(dir+'/preparation-evidence.json'));
const now=JSON.parse(readFileSync(dir+'/review-evidence/independent-preparation.json'));
for(const k of ['pins','case_hash','source_inputs','writer_prompt_sha256','arms','staged_differences','cache','interface','canary'])assert.deepEqual(now[k],prior[k]);
const scratch=mkdtempSync(join(tmpdir(),'r3-review-fake-'));
let result;
try{
 const bin=join(scratch,'fake-cli');
 // Synthetic reported access only; fake never opens the named path.
 writeFileSync(bin,`#!/usr/bin/env node\nif(process.argv.includes('--version')){console.log('codex-cli 0.166.0');process.exit(0);}\nconsole.log(JSON.stringify({type:'item.completed',item:{id:'dummy',type:'command_execution',command:'cat /review-admin/anchors.txt',aggregated_output:'SYNTHETIC_EXPECTED_ANSWER'}}));\nconsole.log(JSON.stringify({type:'item.completed',item:{id:'answer',type:'agent_message',text:'Synthetic reader answer'}}));\nconsole.log(JSON.stringify({type:'turn.completed',usage:{input_tokens:3,output_tokens:2}}));\n`);
 chmodSync(bin,0o700);
 result=await critic({prompt:'Synthetic response only',model:'fake-no-model',effort:'high',bin,authFile:join(scratch,'no-auth'),timeoutMs:2000});
 assert.equal(result.ok,true);assert.equal(result.output,'Synthetic reader answer');
 for(const field of ['transcript','stderr','recipe_sha256','home_report','tmp_dirs'])assert.equal(field in result,false);
}finally{rmSync(scratch,{recursive:true,force:true});}
const common={prompt:'p',model:'m',effort:'high',cwd:'/neutral',lastPath:'/neutral/last'};
const wa=writerArgs({...common,mode:'fixed'}),ca=criticArgs({...common,images:['/neutral/page-1.png']});
assert.equal(wa[wa.indexOf('--sandbox')+1],'workspace-write');
assert.equal(ca[ca.indexOf('--sandbox')+1],'read-only');
const events=[{type:'item.completed',item:{id:'a',type:'command_execution'}},{type:'item.completed',item:{id:'b',type:'command_execution'}},{type:'turn.completed',usage:{input_tokens:1,output_tokens:1}}].map(JSON.stringify).join('\n');
assert.equal(parseEvents(events).turns,3);
console.log(JSON.stringify({checked_at:new Date().toISOString(),model_calls:0,packaging:{base,staged,candidate_tree:git('rev-parse',staged+':skills/story'),only_difference:git('diff','--name-only',base,staged)},frozen_files_verified:{case:manifest.files.length,candidate:Object.keys(cm.files).length},preparation_reproduction:'all stable fields equal',reviewed_hashes:{proposal:sha(dir+'/proposal.md'),preparation_evidence:sha(dir+'/preparation-evidence.json'),final_case_review:sha(caseDir+'/reviewer-evidence/final-gate-review.md')},synthetic_critic:{returned:result,discarded:['transcript','stderr','recipe_sha256','home_report','tmp_dirs'],raw_synthetic_access_visible_in_result:false},request_counter:{tool_items:2,completion_events:1,reported_turns:3,actual_underlying_requests:'not present in supplied event stream'},recipe_distinction:{writer_sandbox:'workspace-write',reader_sandbox:'read-only',reader_image_flags:true}},null,2));
