// Context sources, separate from the validated Eurostat/INSEE dataset snapshots.
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const sources=[
 {file:'cofog-old-age.html',url:'https://unstats.un.org/unsd/classifications/Econ/Structure/Detail/en/4/10_2_0',title:'UN COFOG 10.2.0 definition',licence:'UN website terms; no specific open licence identified for this page'},
 {file:'drees-social-protection-2024.pdf',url:'https://www.drees.solidarites-sante.gouv.fr/sites/default/files/2026-03/La%20protection%20sociale%20en%20France%20et%20en%20Europe%20en%202024.pdf',title:'DREES, La protection sociale en France et en Europe en 2024, edition 2025, March 2026 file',licence:'Official French public statistical publication; specific document licence not identified'},
 {file:'retiree-population.html',url:'https://evaluation.securite-sociale.fr/home/retraite/1-7-1-effectifs-de-retraites-de-.html',title:'Social Security evaluation: pension recipient numbers',licence:'Official French public statistical publication; specific document licence not identified'},
];
const rows=[];
for(const s of sources){
 const res=await fetch(s.url,{signal:AbortSignal.timeout(45000)});if(!res.ok)throw Error(res.status+' '+s.file);
 const data=Buffer.from(await res.arrayBuffer());if(data.length>20000000)throw Error('Source too large for expected snapshot');
 await writeFile(new URL(s.file,import.meta.url),data);rows.push({...s,retrieved_at:new Date().toISOString(),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});console.log(s.file,data.length);
}
await writeFile(new URL('manifest.json',import.meta.url),JSON.stringify({sources:rows},null,2)+'\n');
