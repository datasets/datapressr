import {readFileSync, readdirSync, mkdtempSync, rmSync} from 'node:fs';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const here=dirname(fileURLToPath(import.meta.url)), root=resolve(here,'..');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const manifest=JSON.parse(readFileSync(join(root,'manifest.json')));
for(const f of manifest.files) assert.equal(hash(join(root,f.path)),f.sha256,`Frozen file changed: ${f.path}`);
const lock=JSON.parse(readFileSync(join(here,'dependencies.lock.json')));
assert.equal(process.version,lock.runtime.node);
for(const f of lock.files) assert.equal(hash(resolve(f.path)),f.sha256,`Dependency changed: ${f.path}`);
const temp=mkdtempSync(join(here,'.offline-rebuild-'));
try {
 execFileSync(process.execPath,[join(root,'inputs/build.mjs'),temp],{stdio:'pipe'});
 assert.equal(hash(join(temp,'components.csv')),hash(join(root,'inputs/data/components.csv')));
 assert.equal(hash(join(temp,'components.svg')),hash(join(root,'inputs/components.svg')));
 const result=JSON.parse(execFileSync('python3',[join(here,'check.py')],{encoding:'utf8'}));assert.equal(result.status,'PASS');
 execFileSync(process.execPath,[join(here,'render.mjs'),join(temp,'rendered')],{stdio:'pipe'});
 const png=readFileSync(join(temp,'rendered/chart-1.png'));assert.equal(png.readUInt32BE(16),1800);assert.equal(png.readUInt32BE(20),1000);
 assert.equal(hash(join(temp,'rendered/chart-1.png')),hash(join(here,'rendered/chart-1.png')),'Raster bytes differ; inspect environment/render rather than silently accepting');
 console.log(JSON.stringify({case_id:'FC-C17',status:'PASS',manifest_files:manifest.files.length,raw_to_csv_to_svg:'byte-identical',separate_arithmetic:'PASS',png:'byte-identical; 1800x1000',writer_calls:0}));
} finally {rmSync(temp,{recursive:true,force:true});}
