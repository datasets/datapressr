import { LIMITS } from './limits.ts';
import { selectArtifact } from './artifact-selection.ts';
export { selectArtifact } from './artifact-selection.ts';
import { opendir, readFile, stat } from 'node:fs/promises';
import { join, posix } from 'node:path';
import type { ArtifactRef } from './types.ts';
export type Catalog = {artifacts:ArtifactRef[]; datasets:{path:string;title:string}[]; warnings:string[]; scanned:number; incomplete:boolean};
const ignored = new Set(['node_modules','archive','dist','build','coverage','target','__pycache__']);
export async function discoverArtifacts(root:string, budget:number=LIMITS.catalogEntries):Promise<Catalog> {
  const result:Catalog = {artifacts:[],datasets:[],warnings:[],scanned:0,incomplete:false};
  const metadata:string[] = [];
  const directories = [''];
  while (directories.length && !result.incomplete) {
    const directory = directories.shift()!;
    try {
      for await (const entry of await opendir(join(root,directory))) {
        if (result.scanned >= budget) {result.incomplete=true; break;}
        result.scanned++;
        const path = posix.join(directory,entry.name);
        if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
        if (entry.isDirectory()) {if (!ignored.has(entry.name)) directories.push(path); continue;}
        if (!entry.isFile()) continue;
        if (entry.name === 'datapackage.json') metadata.push(path);
        try {result.artifacts.push(selectArtifact(path));} catch { /* Other file types are not previewable. */ }
      }
    } catch {result.warnings.push(`Cannot scan ${directory || '.'}.`);}
  }
  const artifacts = new Map(result.artifacts.map(a=>[a.path,a]));
  for (const path of metadata) {
    try {
      if ((await stat(join(root,path))).size > LIMITS.metadataBytes) throw new Error('Large metadata');
      const pkg = JSON.parse(await readFile(join(root,path),'utf8'));
      if (!pkg || typeof pkg !== 'object' || Array.isArray(pkg)) throw new Error('Invalid metadata');
      const directory = posix.dirname(path);
      result.datasets.push({path:directory,title:typeof pkg.title === 'string' ? pkg.title : directory});
      const readme = artifacts.get(posix.join(directory,'README.md')); if (readme) readme.datasetPath=directory;
      for (const resource of Array.isArray(pkg.resources) ? pkg.resources : []) {
        if (typeof resource?.path !== 'string' || /^https?:\/\//i.test(resource.path)) continue;
        let ref:ArtifactRef;
        try {ref = selectArtifact(posix.join(directory,resource.path));} catch {continue;}
        const artifact = artifacts.get(ref.path);
        if (artifact) {artifact.datasetPath=directory;if (typeof resource.title === 'string') artifact.label=resource.title;}
        else result.warnings.push(`${path}: resource not discovered: ${resource.path}`);
      }
    } catch {result.warnings.push(`Cannot read metadata: ${path}. Loose files remain available.`);}
  }
  result.artifacts.sort((a,b)=>a.path.localeCompare(b.path,'en'));
  result.datasets.sort((a,b)=>a.path.localeCompare(b.path,'en'));
  return result;
}
