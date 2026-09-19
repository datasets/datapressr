import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { readFile } from "node:fs/promises";
for (const f of ["sum97.pdf","sum06.pdf"]) {
  const doc=await getDocument({data:new Uint8Array(await readFile(`archive/summaries/${f}`)),useSystemFonts:false,verbosity:0}).promise;
  const c=await (await doc.getPage(1)).getTextContent();
  const m=new Map();
  for(const it of c.items){ if(!it.str.trim())continue; const y=Math.round(it.transform[5]);
    const k=[...m.keys()].find(v=>Math.abs(v-y)<=2)??y; if(!m.has(k))m.set(k,[]); m.get(k).push([it.transform[4],it.str]); }
  const ys=[...m.keys()].sort((a,b)=>b-a);
  const hi=ys.findIndex(y=>m.get(y).some(x=>/Weather Event/.test(x[1])));
  console.log(f+":");
  for(const y of ys.slice(hi-2,hi+1)) console.log("   ", m.get(y).sort((a,b)=>a[0]-b[0]).map(x=>x[1]).join(" | "));
}
