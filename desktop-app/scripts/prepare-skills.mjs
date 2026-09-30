import { readdir, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const skillNames=['archive','capture','enrich','init','push','story','structure','validate'];
async function files(root, prefix='') {
  const found=new Map();
  for(const entry of (await readdir(join(root,prefix),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
    const path=join(prefix,entry.name);
    if(entry.isDirectory()) for(const [key,value] of await files(root,path)) found.set(key,value);
    else if(entry.isFile()) found.set(path,await readFile(join(root,path)));
    else throw new Error(`Unsupported skill entry: ${path}`);
  }
  return found;
}
export async function syncSkills(source,target,check=false,names=skillNames) {
  const expected=new Map();
  for(const name of names) for(const [path,bytes] of await files(join(source,name))) expected.set(join(name,path),bytes);
  if(check) {
    let actual;try{actual=await files(target);}catch{throw new Error('Skill bundle is out of sync: run npm run skills:sync.');}
    if(actual.size!==expected.size || [...expected].some(([path,bytes])=>!actual.get(path)?.equals(bytes))) throw new Error('Skill bundle is out of sync: run npm run skills:sync.');
  } else {
    await rm(target,{recursive:true,force:true});
    for(const [path,bytes] of expected) {await mkdir(dirname(join(target,path)),{recursive:true});await writeFile(join(target,path),bytes);}
  }
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  await syncSkills(resolve(root,'../skills'),join(root,'generated-skills'),process.argv.includes('--check'));
  console.log(process.argv.includes('--check')?'Canonical skill bundle matches.':'Bundled eight canonical skills and all reference files.');
}
