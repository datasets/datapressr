// Offline build, Node built-ins only. Raw bytes are frozen by ../manifest.json.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, dirname, join} from 'node:path';
import assert from 'node:assert/strict';
const here=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.argv[2] ?? join(here,'data')); mkdirSync(out,{recursive:true});
const raw=readFileSync(join(here,'raw/population.csv'),'utf8').replace(/^\uFEFF/,'').trimEnd();
// This frozen source has no quoted fields; reject a changed format, never split quoted CSV silently.
assert(!raw.includes('"'),'Quoted CSV needs a parser before updating this build');
const [header,...lines]=raw.split(/\r?\n/).map(x=>x.split(','));
const rows=lines.map(cells=>{assert.equal(cells.length,header.length);return Object.fromEntries(header.map((h,i)=>[h,cells[i]]));});
const matches=rows.filter(r=>r.SUMLEV==='010' && r.STATE==='00' && r.NAME==='United States');assert.equal(matches.length,1);
const r=matches[0]; const result=[];
for(let y=2021;y<=2024;y++) {
 const num=k=>{const s=r[k];assert.match(s,/^-?\d+$/);return Number(s)};
 const start=num('POPESTIMATE'+(y-1)), end=num('POPESTIMATE'+y), births=num('BIRTHS'+y), deaths=num('DEATHS'+y), natural=num('NATURALCHG'+y), migration=num('INTERNATIONALMIG'+y), domestic=num('DOMESTICMIG'+y), residual=num('RESIDUAL'+y), change=num('NPOPCHG_'+y);
 assert.equal(end-start,change);assert.equal(births-deaths,natural);assert.equal(domestic,0);assert.equal(change,natural+migration+domestic+residual);
 result.push([y,start,end,births,deaths,natural,migration,domestic,residual,change,100*migration/change,100*change/start]);
}
const names=['year_ending_july_1','population_start_people','population_end_people','births_people','deaths_people','natural_change_people','net_international_migration_people','net_domestic_migration_people','residual_people','population_change_people','migration_share_of_change_percent','population_growth_percent'];
writeFileSync(join(out,'components.csv'),[names.join(','),...result.map(r=>r.join(','))].join('\n')+'\n');
const width=900,height=500,left=140,top=95,barMax=3.5e6,scale=640/barMax;
const pieces=[`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="900" height="500" fill="white"/><g font-family="Arial,sans-serif" fill="#192b3b"><text x="30" y="35" font-size="23">Components of U.S. population growth</text><text x="30" y="66" font-size="17">Years ending July 1; millions of people • Census Vintage 2024</text>`];
for(let i=0;i<result.length;i++){const row=result[i],y=top+i*78;pieces.push(`<text x="65" y="${y+28}" font-size="19">${row[0]}</text><rect x="${left}" y="${y}" width="${row[5]*scale}" height="40" fill="#d19a37"/><rect x="${left+row[5]*scale}" y="${y}" width="${row[6]*scale}" height="40" fill="#287d95"/><text x="${left+row[9]*scale+8}" y="${y+27}" font-size="18">${(row[9]/1e6).toFixed(2)}</text>`);}
for(let n=0;n<=3;n++)pieces.push(`<text x="${left+n*1e6*scale}" y="421" text-anchor="middle" font-size="16">${n}</text>`);
pieces.push('<rect x="140" y="446" width="16" height="16" fill="#d19a37"/><text x="164" y="460" font-size="16">Births minus deaths</text><rect x="360" y="446" width="16" height="16" fill="#287d95"/><text x="384" y="460" font-size="16">Net international migration</text><text x="30" y="487" font-size="13">Source: U.S. Census Bureau, NST-EST2024-ALLDATA. National domestic migration and residual are zero.</text></g></svg>\n');
writeFileSync(process.argv[2] ? join(out,'components.svg') : join(here,'components.svg'),pieces.join('\n'));
console.log(JSON.stringify({rows:result.length,identity_checks:'passed',outputs:['components.csv','components.svg']}));
