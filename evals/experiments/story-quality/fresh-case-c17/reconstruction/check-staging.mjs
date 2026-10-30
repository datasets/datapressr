// Lower-level staging smoke check only; no writer/model process is invoked.
import {readFileSync,existsSync,rmSync,readdirSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {stageWorkspace,writerPrompt} from '../../../../lib/stage.mjs';
import {validateCase} from '../../../../lib/schema.mjs';
import {loadCase} from '../../../../lib/runner.mjs';
import {isAncestorOfMain} from '../../../../lib/versions.mjs';
const root=process.cwd(), rel='evals/experiments/story-quality/fresh-case-c17';
const kase=JSON.parse(readFileSync('evals/cases/story/fc-c17/case.json'));
const shape=validateCase(kase);assert.equal(shape.ok,true,JSON.stringify(shape));
const main=execFileSync('git',['rev-parse','main'],{encoding:'utf8'}).trim();
const ancestor=isAncestorOfMain(root,kase.inputs[0].commit);
let loader;try{loadCase(root,join(root,'evals'),'story/fc-c17');loader={status:'PASS'}}catch(e){loader={status:'BLOCKED',reason:e.message}}
assert.equal(loader.status==='PASS',ancestor);
const prompt=writerPrompt(readFileSync('evals/cases/story/fc-c17/prompt.md','utf8'),kase);
// Main contains established installed guidance, not the isolated R3 candidate.
const staged=stageWorkspace({root,kase,prompt,skillRef:main});
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
let checked=0;
try {
 const manifest=JSON.parse(readFileSync(join(rel,'manifest.json')));
 const allowed=manifest.files.filter(f=>f.path.startsWith('inputs/'));
 for(const f of allowed){assert.equal(hash(join(staged.dir,rel,f.path)),f.sha256);checked++;}
 const custody=join(staged.dir,rel);
 assert.deepEqual(readdirSync(custody),['inputs']);
 assert.equal(existsSync(join(staged.dir,'evals/cases')),false);
 execFileSync(process.execPath,[join(custody,'inputs/build.mjs')],{cwd:staged.dir});
 assert.equal(hash(join(custody,'inputs/data/components.csv')),hash(join(rel,'inputs/data/components.csv')));
 assert.equal(hash(join(custody,'inputs/components.svg')),hash(join(rel,'inputs/components.svg')));
 console.log(JSON.stringify({case_id:'FC-C17',source_commit:kase.inputs[0].commit,main_commit:main,main_ancestor:ancestor,shape_validation:'PASS',production_loader:loader,lower_level_staging:'PASS',permitted_input_files:checked,custody_exclusions:'PASS',staged_raw_reconstruction:'byte-identical',staged_skill_ref:main,writer_calls:0,limitation:'Lower-level stageWorkspace smoke test does not bypass or satisfy production loadCase ancestry gate; no execution authorized'},null,2));
} finally {rmSync(staged.dir,{recursive:true,force:true});}
