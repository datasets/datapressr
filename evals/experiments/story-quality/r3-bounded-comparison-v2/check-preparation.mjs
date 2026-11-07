// Offline preparation evidence only. No writer, critic, canary, or model call.
// Creates deterministic unreferenced Git commit objects for existing staging;
// never updates an installed file, branch, index, candidate, or case.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync,statSync,rmSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {loadCase} from '../../../lib/runner.mjs';
import {stageWorkspace,ensureModulesCache} from '../../../lib/stage.mjs';
import {sha256,treeHash,caseHash,harnessVersion} from '../../../lib/versions.mjs';
import {cliVersion,recipeHash,execute,parseEvents,authOk} from '../../../lib/adapters/codex.mjs';
import {gateFromLedger} from '../../../lib/canary.mjs';
const root=process.cwd();
const git=(args,input)=>execFileSync('git',args,{cwd:root,input,encoding:'utf8',env:{...process.env,GIT_AUTHOR_NAME:'Comparison staging',GIT_AUTHOR_EMAIL:'evals@example.invalid',GIT_COMMITTER_NAME:'Comparison staging',GIT_COMMITTER_EMAIL:'evals@example.invalid',GIT_AUTHOR_DATE:'2026-10-30T00:00:00Z',GIT_COMMITTER_DATE:'2026-10-30T00:00:00Z'}}).trim();
const base='bd561130735a8637f2fc0b2b5f5eac3b41e4bf6c', candidate='abe2cd0707647eac6972b6f1bba28d49bf94c6be';
function replaceTree(ref,name,tree){
 const entries=git(['ls-tree',ref]).split('\n').map(l=>l.endsWith('\t'+name)?`040000 tree ${tree}\t${name}`:l);
 return git(['mktree'],entries.join('\n')+'\n');
}
const skills=replaceTree(base+':skills','story',candidate);
const rootTree=replaceTree(base+'^{tree}','skills',skills);
const candidateRef=git(['commit-tree',rootTree,'-p',base], 'Frozen R3 payload mounted for comparison staging only\n');
assert.equal(git(['diff','--name-only',base,candidateRef]),'skills/story/references/voice-guide.md');
const {kase,prompt,dir}=loadCase(root,join(root,'evals'),'story/fc-c17');
const sourceManifest=JSON.parse(readFileSync('evals/experiments/story-quality/fresh-case-c17/manifest.json'));
const pins={};
for(const p of ['evals/config.json','evals/cases/story/fc-c17/case.json','evals/cases/story/fc-c17/prompt.md','evals/experiments/story-quality/fresh-case-c17/manifest.json','evals/calibration/story/diagnostic-v2/README.md','evals/lib/reader-packet.mjs','evals/development/r3-scope-v2/review.md']) pins[p]=sha256(readFileSync(p));
const cache=ensureModulesCache({root,ref:base,install(){throw new Error('Missing offline cache; installation forbidden in this preparation check');}});
function walk(dir,prefix=''){return readdirSync(dir).sort().flatMap(n=>{if(n==='.git'||n==='node_modules')return [];const p=join(prefix,n);return statSync(join(dir,n)).isDirectory()?walk(join(dir,n),p):[p];});}
const arms=[];
for(const [arm,ref] of [['baseline',base],['candidate',candidateRef]]){
 const ws=stageWorkspace({root,kase,prompt,skillRef:ref,modules:cache.modules});
 try{
  for(const f of sourceManifest.files.filter(f=>f.path.startsWith('inputs/')))assert.equal(sha256(readFileSync(join(ws.dir,'evals/experiments/story-quality/fresh-case-c17',f.path))),f.sha256);
  assert.deepEqual(readdirSync(join(ws.dir,'evals/experiments/story-quality/fresh-case-c17')),['inputs']);
  assert.equal(existsSync(join(ws.dir,'evals/cases')),false);
  arms.push({arm,ref,skill_tree:treeHash(root,ref,'skills/story'),files:Object.fromEntries(walk(ws.dir).map(p=>[p,sha256(readFileSync(join(ws.dir,p)))]))});
 }finally{rmSync(ws.dir,{recursive:true,force:true});}
}
assert.deepEqual(Object.keys(arms[0].files),Object.keys(arms[1].files));
const differences=Object.keys(arms[0].files).filter(p=>arms[0].files[p]!==arms[1].files[p]);
assert.deepEqual(differences,['skills/story/references/voice-guide.md']);
const key={vendor:'codex',cli_version:cliVersion(),recipe_sha256:recipeHash('fixed',{effort:'high'}),mode:'fixed'};
let canary;try{canary={status:'PASS',run_id:gateFromLedger('evals/ledger.jsonl',key).run_id};}catch(e){canary={status:'BLOCKED',reason:e.message};}
// Existing execute primitive: local Node children only, never the Codex executable.
const timeout=await execute({bin:process.execPath,args:['-e','setInterval(()=>{},1000)'],cwd:root,env:process.env,timeoutMs:100});
assert.equal(timeout.timedOut,true);assert.equal(timeout.signal,'SIGTERM');
const valid=await execute({bin:process.execPath,args:['-e','console.log(JSON.stringify({type:"turn.completed",usage:{input_tokens:3,output_tokens:2}}))'],cwd:root,env:process.env,timeoutMs:1000});
assert.equal(valid.code,0);assert.equal(parseEvents(valid.stdout).completed,true);assert.equal(parseEvents(valid.stdout).model_actual,null);
const failed=await execute({bin:process.execPath,args:['-e','process.exit(75)'],cwd:root,env:process.env,timeoutMs:1000});
assert.equal(failed.code,75);assert.equal(parseEvents(failed.stdout).completed,false);
console.log(JSON.stringify({checked_at:new Date().toISOString(),writer_calls:0,model_calls:0,main:git(['rev-parse','main']),harness:harnessVersion(root),pins,case_hash:caseHash(dir,kase.inputs.map(i=>({...i,tree:treeHash(root,i.commit,i.path)}))),source_inputs:kase.inputs.map(i=>({...i,tree:treeHash(root,i.commit,i.path)})),writer_prompt_sha256:sha256(prompt),arms,staged_differences:differences,cache:{key:cache.key,modules:cache.modules},interface:key,auth:authOk(),canary,synthetic:{timeout:{timed_out:timeout.timedOut,signal:timeout.signal,wall_ms:timeout.wall_ms},valid:{exit_code:valid.code,parsed:parseEvents(valid.stdout)},transient_failure:{exit_code:failed.code,retries_authorized:0,outcome:'exhausted; remaining launches prohibited'},missing_prerequisite:{hard_token_and_cost_enforcement:false,outcome:'BLOCKED before any model launch'}}},null,2));
