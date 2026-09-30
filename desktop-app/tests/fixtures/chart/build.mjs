import { readFile, writeFile } from 'node:fs/promises';
const input=JSON.parse(await readFile(new URL('./input.json',import.meta.url),'utf8'));
const escape=value=>String(value).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const width=Math.min(100,Math.max(0,Number(input.value)))*4;
await writeFile(new URL('./chart.svg',import.meta.url),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 180"><rect width="480" height="180" fill="white"/><text x="20" y="35" font-size="22">${escape(input.label)}</text><rect x="20" y="60" width="${width}" height="65" fill="${escape(input.color)}"/><text x="20" y="155" font-size="18">${escape(input.value)} / 100</text></svg>\n`);
